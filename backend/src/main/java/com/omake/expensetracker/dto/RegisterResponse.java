package com.omake.expensetracker.dto;

import com.omake.expensetracker.model.User;

import java.time.Instant;
import java.util.UUID;

/**
 * Response body for POST /api/auth/register (HTTP 201).
 * Omits the password hash entirely — only safe, public fields are exposed.
 */
public record RegisterResponse(
    UUID id,
    String email,
    String role,
    Instant createdAt
) {
    /** Maps a persisted {@link User} entity to this response record. */
    public static RegisterResponse from(User user) {
        return new RegisterResponse(
            user.getId(),
            user.getEmail(),
            user.getRole().name(),
            user.getCreatedAt()
        );
    }
}
