package com.omake.expensetracker.service;

import com.omake.expensetracker.dto.TransactionRequest;
import com.omake.expensetracker.dto.TransactionResponse;
import com.omake.expensetracker.model.Transaction;
import com.omake.expensetracker.model.User;
import com.omake.expensetracker.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private TransactionService transactionService;

    private User owner;
    private User otherUser;
    private Transaction transaction;

    @BeforeEach
    void setUp() {
        owner = new User("owner@example.com", "hashedPassword");
        ReflectionTestUtils.setField(owner, "id", UUID.randomUUID());

        otherUser = new User("other@example.com", "hashedPassword");
        ReflectionTestUtils.setField(otherUser, "id", UUID.randomUUID());

        transaction = new Transaction(
                new BigDecimal("50.00"),
                "EXPENSE",
                "Food",
                LocalDate.now(),
                "Lunch summary",
                owner
        );
        ReflectionTestUtils.setField(transaction, "id", 1L);
    }

    @Test
    void givenValidTransactionRequest_whenCreateTransaction_thenReturnsSavedTransaction() {
        // given
        TransactionRequest request = new TransactionRequest(
                new BigDecimal("50.00"),
                "EXPENSE",
                "Food",
                "Lunch summary",
                LocalDate.now()
        );

        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 100L);
            return saved;
        });

        // when
        TransactionResponse response = transactionService.createTransaction(request, owner);

        // then
        assertNotNull(response);
        assertEquals(100L, response.id());
        assertEquals(request.amount(), response.amount());
        assertEquals(request.type(), response.type());
        assertEquals(request.category(), response.category());
        assertEquals(request.description(), response.description());
        assertEquals(request.transactionDate(), response.transactionDate());
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void givenMatchingUserId_whenDeleteTransaction_thenSuccessfullyDeleted() {
        // given
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(transaction));

        // when
        transactionService.deleteTransaction(1L, owner);

        // then
        verify(transactionRepository, times(1)).findById(1L);
        verify(transactionRepository, times(1)).delete(transaction);
    }

    @Test
    void givenMismatchedUserId_whenDeleteTransaction_thenThrowsForbiddenException() {
        // given
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(transaction));

        // when & then
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            transactionService.deleteTransaction(1L, otherUser);
        });

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        assertNotNull(exception.getReason());
        assertTrue(exception.getReason().contains("Forbidden"));
        verify(transactionRepository, times(1)).findById(1L);
        verify(transactionRepository, never()).delete(any(Transaction.class));
    }
}
