package com.omake.expensetracker.dto;

import java.math.BigDecimal;

/**
 * Projection DTO for the category spending breakdown in the summary endpoint.
 */
public record CategorySummaryDto(
    String category,
    BigDecimal total
) {}
