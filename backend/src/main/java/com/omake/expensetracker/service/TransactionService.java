package com.omake.expensetracker.service;

import com.omake.expensetracker.dto.*;
import com.omake.expensetracker.model.Transaction;
import com.omake.expensetracker.model.User;
import com.omake.expensetracker.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Core business logic for transaction CRUD and spending summaries.
 *
 * <p>Every method is strictly scoped to the supplied {@link User} —
 * callers (controllers) are responsible for resolving the authenticated user
 * from the {@code SecurityContextHolder}.
 */
@Service
@Transactional(readOnly = true)
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    // -------------------------------------------------------
    // Create
    // -------------------------------------------------------

    /**
     * Creates a new transaction for the given user.
     *
     * @param request the validated request payload
     * @param user    the authenticated user
     * @return the persisted transaction as a response DTO
     */
    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request, User user) {
        Transaction transaction = new Transaction(
            request.amount(),
            request.type(),
            request.category(),
            request.transactionDate(),
            request.description(),
            user
        );

        Transaction saved = transactionRepository.save(transaction);
        return TransactionResponse.from(saved);
    }

    // -------------------------------------------------------
    // Update and Delete
    // -------------------------------------------------------

    /**
     * Updates an existing transaction.
     *
     * @param id          the transaction ID
     * @param updatedData the updated transaction payload
     * @param user        the authenticated user
     * @return the updated transaction response DTO
     */
    @Transactional
    public TransactionResponse updateTransaction(Long id, TransactionRequest updatedData, User user) {
        Transaction transaction = transactionRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden: You do not own this transaction");
        }

        transaction.setAmount(updatedData.amount());
        transaction.setType(updatedData.type());
        transaction.setCategory(updatedData.category());
        transaction.setTransactionDate(updatedData.transactionDate());
        transaction.setDescription(updatedData.description());

        Transaction saved = transactionRepository.save(transaction);
        return TransactionResponse.from(saved);
    }

    /**
     * Deletes a transaction.
     *
     * @param id   the transaction ID
     * @param user the authenticated user
     */
    @Transactional
    public void deleteTransaction(Long id, User user) {
        Transaction transaction = transactionRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden: You do not own this transaction");
        }

        transactionRepository.delete(transaction);
    }

    // -------------------------------------------------------
    // Read — paginated list with optional month filter
    // -------------------------------------------------------

    /**
     * Returns a paginated list of transactions for the given user,
     * optionally filtered to a specific month.
     *
     * @param user     the authenticated user
     * @param month    optional month filter in {@code YYYY-MM} format
     * @param pageable pagination and sort parameters
     * @return a page of transaction response DTOs
     */
    public Page<TransactionResponse> getTransactions(User user, String month, Pageable pageable) {
        Page<Transaction> page;

        if (month != null && !month.isBlank()) {
            YearMonth yearMonth = parseMonth(month);
            LocalDate startDate = yearMonth.atDay(1);
            LocalDate endDate = yearMonth.atEndOfMonth();
            page = transactionRepository.findByUserAndTransactionDateBetween(
                user, startDate, endDate, pageable);
        } else {
            page = transactionRepository.findByUser(user, pageable);
        }

        return page.map(TransactionResponse::from);
    }

    // -------------------------------------------------------
    // Summary — category breakdown + time breakdown
    // -------------------------------------------------------

    /**
     * Builds a spending summary for the given user and month.
     *
     * <p>Supports two period modes as documented in the api-spec:
     * <ul>
     *   <li><b>weekly</b> — aggregated by week-of-month</li>
     *   <li><b>monthly</b> — aggregated by day</li>
     * </ul>
     *
     * @param user   the authenticated user
     * @param month  target month in {@code YYYY-MM} format (defaults to current month)
     * @param period {@code "weekly"} or {@code "monthly"} (defaults to monthly)
     * @return the complete summary response
     */
    public SummaryResponse getSummary(User user, String month, String period) {
        // Default to current month if not provided
        YearMonth yearMonth = (month != null && !month.isBlank())
            ? parseMonth(month)
            : YearMonth.now();

        String monthLabel = yearMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Transaction> transactions = transactionRepository
            .findByUserAndTransactionDateBetween(user, startDate, endDate);

        // Total spent
        BigDecimal totalSpent = transactions.stream()
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Category breakdown
        List<CategorySummaryDto> byCategory = buildCategoryBreakdown(transactions);

        // Period-specific breakdown
        boolean isWeekly = "weekly".equalsIgnoreCase(period);

        if (isWeekly) {
            List<WeekSummaryDto> byWeek = buildWeeklyBreakdown(transactions, yearMonth);
            return SummaryResponse.weekly(monthLabel, totalSpent, byCategory, byWeek);
        } else {
            List<DaySummaryDto> byDay = buildDailyBreakdown(transactions, yearMonth);
            return SummaryResponse.monthly(monthLabel, totalSpent, byCategory, byDay);
        }
    }

    // -------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------

    /**
     * Groups transactions by category and sums amounts.
     */
    private List<CategorySummaryDto> buildCategoryBreakdown(List<Transaction> transactions) {
        Map<String, CategorySummaryDto> map = new LinkedHashMap<>();

        for (Transaction tx : transactions) {
            String cat = tx.getCategory();
            map.merge(
                cat,
                new CategorySummaryDto(cat, tx.getAmount()),
                (existing, incoming) -> new CategorySummaryDto(
                    existing.category(), existing.total().add(incoming.total()))
            );
        }

        return new ArrayList<>(map.values());
    }

    /**
     * Aggregates transactions into 4-or-5 week buckets within the month.
     */
    private List<WeekSummaryDto> buildWeeklyBreakdown(List<Transaction> transactions,
                                                      YearMonth yearMonth) {
        // Calculate week boundaries (7-day buckets from day 1)
        LocalDate monthStart = yearMonth.atDay(1);

        // Build week boundaries
        List<LocalDate[]> weekBounds = new ArrayList<>();
        LocalDate weekStart = monthStart;

        while (!weekStart.isAfter(yearMonth.atEndOfMonth())) {
            LocalDate weekEnd = weekStart.plusDays(6);
            if (weekEnd.isAfter(yearMonth.atEndOfMonth())) {
                weekEnd = yearMonth.atEndOfMonth();
            }
            weekBounds.add(new LocalDate[]{weekStart, weekEnd});
            weekStart = weekEnd.plusDays(1);
        }

        // Aggregate per week
        List<WeekSummaryDto> result = new ArrayList<>();
        for (int i = 0; i < weekBounds.size(); i++) {
            LocalDate wStart = weekBounds.get(i)[0];
            LocalDate wEnd = weekBounds.get(i)[1];

            String monthName = yearMonth.getMonth().name().charAt(0)
                + yearMonth.getMonth().name().substring(1, 3).toLowerCase();

            String label = monthName + " " + wStart.getDayOfMonth() + "–" + wEnd.getDayOfMonth();

            BigDecimal weekTotal = transactions.stream()
                .filter(tx -> !tx.getTransactionDate().isBefore(wStart)
                    && !tx.getTransactionDate().isAfter(wEnd))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            result.add(new WeekSummaryDto(i + 1, label, weekTotal));
        }

        return result;
    }

    /**
     * Builds a day-by-day spending list for every day in the month.
     * Days without transactions show a total of 0.00.
     */
    private List<DaySummaryDto> buildDailyBreakdown(List<Transaction> transactions,
                                                    YearMonth yearMonth) {
        // Pre-aggregate transaction amounts by date
        Map<LocalDate, BigDecimal> dayTotals = new LinkedHashMap<>();
        for (Transaction tx : transactions) {
            dayTotals.merge(tx.getTransactionDate(), tx.getAmount(), BigDecimal::add);
        }

        // Build entries for every day in the month
        List<DaySummaryDto> result = new ArrayList<>();
        LocalDate current = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        while (!current.isAfter(end)) {
            BigDecimal total = dayTotals.getOrDefault(current, BigDecimal.ZERO);
            result.add(new DaySummaryDto(current, total));
            current = current.plusDays(1);
        }

        return result;
    }

    /**
     * Parses a {@code YYYY-MM} string into a {@link YearMonth},
     * throwing a 400 Bad Request on invalid format.
     */
    private YearMonth parseMonth(String month) {
        try {
            return YearMonth.parse(month, DateTimeFormatter.ofPattern("yyyy-MM"));
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Invalid month format. Expected YYYY-MM, got: " + month);
        }
    }
}
