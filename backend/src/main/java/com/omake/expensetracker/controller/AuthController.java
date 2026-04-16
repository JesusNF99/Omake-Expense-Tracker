package com.omake.expensetracker.controller;

import com.omake.expensetracker.dto.LoginRequest;
import com.omake.expensetracker.dto.LoginResponse;
import com.omake.expensetracker.dto.RegisterRequest;
import com.omake.expensetracker.dto.RegisterResponse;
import com.omake.expensetracker.model.User;
import com.omake.expensetracker.repository.UserRepository;
import com.omake.expensetracker.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Handles authentication-related endpoints: registration and login.
 * Mapping: {@code /api/auth}
 *
 * <p>This controller follows the api-spec contract defined in {@code /docs/api-spec.md}.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthController(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        AuthenticationManager authenticationManager,
        JwtUtil jwtUtil
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    // -------------------------------------------------------
    // POST /api/auth/register
    // -------------------------------------------------------

    /**
     * Registers a new user account.
     *
     * <p>Validates input, checks email uniqueness, hashes the password with BCrypt,
     * persists the user, and returns a {@code 201 Created} response.
     *
     * @param request the registration payload (email + password)
     * @return the public user details (id, email, role, createdAt)
     */
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        // Guard against duplicate emails — returns 409 Conflict per api-spec
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        User user = new User(
            request.email(),
            passwordEncoder.encode(request.password())
        );

        User saved = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(RegisterResponse.from(saved));
    }

    // -------------------------------------------------------
    // POST /api/auth/login
    // -------------------------------------------------------

    /**
     * Authenticates a user and issues a JWT bearer token.
     *
     * <p>Delegates credential verification to Spring Security's
     * {@link AuthenticationManager}. On failure, a 401 is returned automatically.
     *
     * @param request the login payload (email + password)
     * @return a JWT token with its type and expiration
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        // AuthenticationManager throws BadCredentialsException on failure,
        // which the GlobalExceptionHandler maps to HTTP 401.
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails.getUsername());

        return ResponseEntity.ok(LoginResponse.of(token, jwtUtil.getExpirationMs()));
    }
}
