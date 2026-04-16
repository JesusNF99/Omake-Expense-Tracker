package com.omake.expensetracker.dto;

import java.math.BigDecimal;

/**
 * Projection DTO for weekly spending breakdown used in the summary endpoint.
 *
 * <p>Shape: {@code { week, label, total }}
 */
public record WeekSummaryDto(
    int week,
    String label,
    BigDecimal total
) {}
