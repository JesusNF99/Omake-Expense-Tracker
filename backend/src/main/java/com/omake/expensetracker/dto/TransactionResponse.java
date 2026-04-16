package com.omake.expensetracker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.omake.expensetracker.model.Transaction;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Response body for individual transaction objects.
 */
public record TransactionResponse(
    Long id,
    BigDecimal amount,
    String type,
    String category,
    String description,
    
    @JsonProperty("transaction_date")
    LocalDate transactionDate
) {

    /**
     * Factory method to build a response from a JPA {@link Transaction} entity.
     *
     * @param entity the persisted transaction
     * @return a clean API response record
     */
    public static TransactionResponse from(Transaction entity) {
        return new TransactionResponse(
            entity.getId(),
            entity.getAmount(),
            entity.getType(),
            entity.getCategory(),
            entity.getDescription(),
            entity.getTransactionDate()
        );
    }
}
