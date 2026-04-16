package com.omake.expensetracker.repository;

import com.omake.expensetracker.model.Transaction;
import com.omake.expensetracker.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository for {@link Transaction} persistence operations.
 *
 * <p>All query methods are scoped by {@link User} to enforce data isolation
 * at the persistence layer — no user can access another user's transactions.
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * Returns all transactions for a given user ordered by date descending.
     *
     * @param user the owning user
     * @return transactions sorted most-recent-first
     */
    List<Transaction> findByUserOrderByTransactionDateDesc(User user);

    /**
     * Paginated query for a user's transactions.
     *
     * @param user     the owning user
     * @param pageable pagination and sorting parameters
     * @return a page of transactions
     */
    Page<Transaction> findByUser(User user, Pageable pageable);

    /**
     * Paginated query filtered by a date range (inclusive) for month-based filtering.
     *
     * @param user      the owning user
     * @param startDate start of the date range (inclusive)
     * @param endDate   end of the date range (inclusive)
     * @param pageable  pagination and sorting parameters
     * @return a page of matching transactions
     */
    Page<Transaction> findByUserAndTransactionDateBetween(
        User user, LocalDate startDate, LocalDate endDate, Pageable pageable);

    /**
     * Finds all transactions for a user within a date range — used by the summary endpoint.
     *
     * @param user      the owning user
     * @param startDate start of the date range (inclusive)
     * @param endDate   end of the date range (inclusive)
     * @return matching transactions (no pagination)
     */
    List<Transaction> findByUserAndTransactionDateBetween(
        User user, LocalDate startDate, LocalDate endDate);
}
