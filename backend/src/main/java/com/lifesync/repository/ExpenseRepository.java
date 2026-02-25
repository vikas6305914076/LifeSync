package com.lifesync.repository;

import com.lifesync.model.Expense;
import com.lifesync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findAllByUserOrderByExpenseDateDesc(User user);
    Optional<Expense> findByIdAndUser(Long id, User user);
}
