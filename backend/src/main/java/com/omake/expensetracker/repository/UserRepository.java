package com.omake.expensetracker.repository;

import com.omake.expensetracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for {@link User} persistence operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Finds a user by their unique email address.
     *
     * @param email the email to look up
     * @return an Optional containing the user if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Returns {@code true} if a user with the given email already exists.
     *
     * @param email the email to check
     * @return true if the email is already registered
     */
    boolean existsByEmail(String email);
}
