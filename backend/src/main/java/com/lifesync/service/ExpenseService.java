package com.lifesync.service;

import com.lifesync.dto.expense.ExpenseRequest;
import com.lifesync.dto.expense.ExpenseResponse;
import com.lifesync.exception.ResourceNotFoundException;
import com.lifesync.model.Expense;
import com.lifesync.model.User;
import com.lifesync.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public ExpenseResponse addExpense(User user, ExpenseRequest request) {
        Expense expense = new Expense();
        expense.setTitle(request.getTitle());
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setUser(user);
        return toResponse(expenseRepository.save(expense));
    }

    public List<ExpenseResponse> getExpenses(User user) {
        return expenseRepository.findAllByUserOrderByExpenseDateDesc(user).stream().map(this::toResponse).toList();
    }

    public void deleteExpense(User user, Long id) {
        Expense expense = expenseRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        expenseRepository.delete(expense);
    }

    private ExpenseResponse toResponse(Expense e) {
        return new ExpenseResponse(e.getId(), e.getTitle(), e.getAmount(), e.getExpenseDate());
    }
}
