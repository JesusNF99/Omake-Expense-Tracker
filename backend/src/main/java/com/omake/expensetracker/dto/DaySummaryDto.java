package com.omake.expensetracker.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Projection DTO for daily spending breakdown used in the monthly summary response.
 *
 * <p>Shape: {@code { date, total }}
 */
public record DaySummaryDto(
    LocalDate date,
    BigDecimal total
) {}
