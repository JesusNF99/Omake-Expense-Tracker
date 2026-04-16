package com.omake.expensetracker.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Utility service for JWT generation, validation, and claim extraction.
 *
 * <p>The signing secret is read exclusively from the {@code JWT_SECRET} environment variable
 * via the {@code app.jwt.secret} property. It must be at least 32 characters (256-bit) for
 * HS256 to be secure.
 *
 * <p><strong>Security note:</strong> This class never logs token values or the raw secret.
 */
@Component
public class JwtUtil {

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtUtil(
        @Value("${app.jwt.secret}") String secret,
        @Value("${app.jwt.expiration-ms:86400000}") long expirationMs
    ) {
        // Derive a HMAC-SHA-256 key from the configured secret string.
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    // -------------------------------------------------------
    // Token generation
    // -------------------------------------------------------

    /**
     * Generates a signed JWT with the user's email as the subject.
     *
     * @param email the authenticated user's email
     * @return a compact, URL-safe JWT string
     */
    public String generateToken(String email) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
            .subject(email)
            .issuedAt(new Date(now))
            .expiration(new Date(now + expirationMs))
            .signWith(signingKey)
            .compact();
    }

    // -------------------------------------------------------
    // Token validation
    // -------------------------------------------------------

    /**
     * Returns {@code true} if the token is structurally valid, correctly signed,
     * and not yet expired.
     *
     * @param token the JWT string to validate
     * @return true if valid, false otherwise
     */
    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Intentionally not logging the token value
            return false;
        }
    }

    // -------------------------------------------------------
    // Claim extraction
    // -------------------------------------------------------

    /**
     * Extracts the subject (email) from a validated JWT.
     *
     * @param token the JWT string
     * @return the email encoded as the subject claim
     * @throws JwtException if the token is invalid or tampered
     */
    public String extractSubject(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Returns the configured token expiration in milliseconds.
     * Used by the Auth controller to populate the {@code expiresIn} response field.
     */
    public long getExpirationMs() {
        return expirationMs;
    }

    // -------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------

    private Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
