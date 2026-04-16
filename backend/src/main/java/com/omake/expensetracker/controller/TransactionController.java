package com.omake.expensetracker.controller;

import com.omake.expensetracker.dto.SummaryResponse;
import com.omake.expensetracker.dto.TransactionRequest;
import com.omake.expensetracker.dto.TransactionResponse;
import com.omake.expensetracker.model.User;
import com.omake.expensetracker.repository.UserRepository;
import com.omake.expensetracker.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * REST controller for transaction CRUD and spending summaries.
 * Mapping: {@code /api/transactions}
 *
 * <p>Every endpoint extracts the authenticated user from the
 * {@link SecurityContextHolder} and delegates to {@link TransactionService},
 * ensuring strict per-user data isolation.
 *
 * <p>This controller follows the api-spec contract defined in {@code /docs/api-spec.md}.
 */
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;

    public TransactionController(TransactionService transactionService,
                                 UserRepository userRepository) {
        this.transactionService = transactionService;
        this.userRepository = userRepository;
    }

    // -------------------------------------------------------
    // POST /api/transactions
    // -------------------------------------------------------

    /**
     * Creates a new transaction for the authenticated user.
     *
     * @param request the validated transaction payload
     * @return the created transaction — HTTP 201 Created
     */
    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
        @Valid @RequestBody TransactionRequest request
    ) {
        User user = getAuthenticatedUser();
        TransactionResponse response = transactionService.createTransaction(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // -------------------------------------------------------
    // PUT /api/transactions/{id}
    // -------------------------------------------------------

    /**
     * Updates an existing transaction for the authenticated user.
     *
     * @param id      the transaction ID to update
     * @param request the validated transaction payload
     * @return the updated transaction — HTTP 200 OK
     */
    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
        @PathVariable Long id,
        @Valid @RequestBody TransactionRequest request
    ) {
        User user = getAuthenticatedUser();
        TransactionResponse response = transactionService.updateTransaction(id, request, user);
        return ResponseEntity.ok(response);
    }

    // -------------------------------------------------------
    // DELETE /api/transactions/{id}
    // -------------------------------------------------------

    /**
     * Deletes an existing transaction for the authenticated user.
     *
     * @param id the transaction ID to delete
     * @return HTTP 204 No Content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        transactionService.deleteTransaction(id, user);
        return ResponseEntity.noContent().build();
    }

    // -------------------------------------------------------
    // GET /api/transactions
    // -------------------------------------------------------

    /**
     * Returns a paginated list of the authenticated user's transactions.
     *
     * <p>Supports optional month filtering via the {@code month} query parameter
     * (format: {@code YYYY-MM}).
     *
     * @param page  zero-based page index (default 0)
     * @param size  page size (default 20, max 100)
     * @param month optional month filter
     * @param sort  sort field and direction (default {@code date,desc})
     * @return paginated transaction list — HTTP 200 OK
     */
    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> getTransactions(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String month,
        @RequestParam(defaultValue = "transactionDate,desc") String sort
    ) {
        // Cap page size at 100 per api-spec
        size = Math.min(size, 100);

        // Parse sort parameter — format: "field,direction"
        Pageable pageable = buildPageable(page, size, sort);

        User user = getAuthenticatedUser();
        Page<TransactionResponse> result = transactionService.getTransactions(user, month, pageable);
        return ResponseEntity.ok(result);
    }

    // -------------------------------------------------------
    // GET /api/transactions/summary
    // -------------------------------------------------------

    /**
     * Returns a spending summary for the authenticated user,
     * optimized for chart rendering (Recharts on the frontend).
     *
     * @param month  target month in {@code YYYY-MM} format (defaults to current)
     * @param period {@code "weekly"} or {@code "monthly"} (defaults to monthly)
     * @return the summary response — HTTP 200 OK
     */
    @GetMapping("/summary")
    public ResponseEntity<SummaryResponse> getSummary(
        @RequestParam(required = false) String month,
        @RequestParam(defaultValue = "monthly") String period
    ) {
        User user = getAuthenticatedUser();
        SummaryResponse summary = transactionService.getSummary(user, month, period);
        return ResponseEntity.ok(summary);
    }

    // -------------------------------------------------------
    // Security Context Helper
    // -------------------------------------------------------

    /**
     * Extracts the authenticated user's email from the {@link SecurityContextHolder}
     * and resolves the full {@link User} entity from the database.
     *
     * @return the authenticated user entity
     * @throws ResponseStatusException 401 if the user cannot be resolved
     */
    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "User not found for authenticated email"));
    }

    /**
     * Parses the sort query parameter into a Spring {@link Pageable}.
     * Expects format: {@code field,direction} (e.g. {@code date,desc}).
     */
    private Pageable buildPageable(int page, int size, String sort) {
        String[] parts = sort.split(",");
        String sortField = parts[0].trim();
        Sort.Direction direction = (parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim()))
            ? Sort.Direction.ASC
            : Sort.Direction.DESC;

        // Map the api-spec "date" field name to the JPA entity field
        if ("date".equals(sortField)) {
            sortField = "transactionDate";
        }

        return PageRequest.of(page, size, Sort.by(direction, sortField));
    }
}
