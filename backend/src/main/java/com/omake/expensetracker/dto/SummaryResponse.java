package com.omake.expensetracker.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Top-level response for GET /api/transactions/summary.
 *
 * <p>Supports two period modes as defined in the api-spec:
 * <ul>
 *   <li><b>weekly</b>: includes {@code byCategory} + {@code byWeek}</li>
 *   <li><b>monthly</b>: includes {@code byCategory} + {@code byDay}</li>
 * </ul>
 *
 * <p>Null fields are omitted from JSON serialization via Jackson defaults
 * (configure {@code spring.jackson.default-property-inclusion=non_null} if needed).
 */
public record SummaryResponse(
    String period,
    String month,
    BigDecimal totalSpent,
    List<CategorySummaryDto> byCategory,
    List<WeekSummaryDto> byWeek,
    List<DaySummaryDto> byDay
) {

    /**
     * Factory for a weekly summary response.
     */
    public static SummaryResponse weekly(String month, BigDecimal totalSpent,
                                         List<CategorySummaryDto> byCategory,
                                         List<WeekSummaryDto> byWeek) {
        return new SummaryResponse("weekly", month, totalSpent, byCategory, byWeek, null);
    }

    /**
     * Factory for a monthly summary response.
     */
    public static SummaryResponse monthly(String month, BigDecimal totalSpent,
                                          List<CategorySummaryDto> byCategory,
                                          List<DaySummaryDto> byDay) {
        return new SummaryResponse("monthly", month, totalSpent, byCategory, null, byDay);
    }
}
