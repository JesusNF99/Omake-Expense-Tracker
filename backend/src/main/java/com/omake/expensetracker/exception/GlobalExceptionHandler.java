package com.omake.expensetracker.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Centralised exception handler that translates exceptions into the standard
 * error response shape defined in the api-spec:
 *
 * <pre>
 * {
 *   "timestamp": "...",
 *   "status":    400,
 *   "error":     "Bad Request",
 *   "message":   "...",
 *   "path":      "/api/auth/register"
 * }
 * </pre>
 *
 * <p><strong>Security note:</strong> Error messages are deliberately generic —
 * no stack traces, internal system paths, or sensitive data are ever exposed.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // -------------------------------------------------------
    // Bean Validation errors → 400 Bad Request
    // -------------------------------------------------------

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
        MethodArgumentNotValidException ex,
        HttpServletRequest request
    ) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining("; "));

        return buildError(HttpStatus.BAD_REQUEST, message, request.getRequestURI());
    }

    // -------------------------------------------------------
    // Bad credentials → 401 Unauthorized
    // -------------------------------------------------------

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(
        BadCredentialsException ex,
        HttpServletRequest request
    ) {
        // Keep message vague intentionally — do not confirm whether email exists
        return buildError(HttpStatus.UNAUTHORIZED, "Invalid email or password", request.getRequestURI());
    }

    // -------------------------------------------------------
    // ResponseStatusException (e.g. 409 Conflict) → pass-through
    // -------------------------------------------------------

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(
        ResponseStatusException ex,
        HttpServletRequest request
    ) {
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        if (status == null) status = HttpStatus.INTERNAL_SERVER_ERROR;
        return buildError(status, ex.getReason(), request.getRequestURI());
    }

    // -------------------------------------------------------
    // Catch-all → 500 Internal Server Error
    // -------------------------------------------------------

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(
        Exception ex,
        HttpServletRequest request
    ) {
        // Do not expose internal exception details to the client
        return buildError(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "An unexpected error occurred",
            request.getRequestURI()
        );
    }

    // -------------------------------------------------------
    // Helper
    // -------------------------------------------------------

    private ResponseEntity<Map<String, Object>> buildError(
        HttpStatus status,
        String message,
        String path
    ) {
        Map<String, Object> body = Map.of(
            "timestamp", Instant.now().toString(),
            "status",    status.value(),
            "error",     status.getReasonPhrase(),
            "message",   message != null ? message : status.getReasonPhrase(),
            "path",      path
        );
        return ResponseEntity.status(status).body(body);
    }
}
