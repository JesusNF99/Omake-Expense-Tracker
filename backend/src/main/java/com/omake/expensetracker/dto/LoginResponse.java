package com.omake.expensetracker.dto;

/**
 * Response body for POST /api/auth/login.
 * Contains the JWT bearer token and metadata. Per the api-spec, expiresIn is in seconds.
 */
public record LoginResponse(
    String token,
    String tokenType,
    long expiresIn
) {
    /** Convenience factory using the standard "Bearer" token type. */
    public static LoginResponse of(String token, long expirationMs) {
        return new LoginResponse(token, "Bearer", expirationMs / 1000);
    }
}
