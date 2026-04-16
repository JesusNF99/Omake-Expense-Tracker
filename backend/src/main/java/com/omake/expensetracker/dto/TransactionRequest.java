package com.omake.expensetracker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request body for POST /api/transactions.
 *
 * <p>Maps exactly to the flat JSON structure of the MVP.
 */
public record TransactionRequest(

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    BigDecimal amount,

    @NotNull(message = "Type is required")
    String type,

    @NotNull(message = "Category is required")
    String category,

    @Size(max = 255, message = "Description must be at most 255 characters")
    String description,

    @NotNull(message = "Transaction date is required")
    @JsonProperty("transaction_date")
    LocalDate transactionDate
) {}
