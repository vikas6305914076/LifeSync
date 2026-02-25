package com.lifesync.service;

import com.lifesync.dto.expense.ExpenseRequest;
import com.lifesync.dto.expense.ExpenseResponse;
import com.lifesync.exception.ResourceNotFoundException;
import com.lifesync.model.Expense;
import com.lifesync.model.Family;
import com.lifesync.model.User;
import com.lifesync.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserService userService;

    public ExpenseService(ExpenseRepository expenseRepository, UserService userService) {
        this.expenseRepository = expenseRepository;
        this.userService = userService;
    }

    public ExpenseResponse addExpense(User user, Long familyId, ExpenseRequest request) {
        Family family = userService.getAccessibleFamily(user, familyId);

        Expense expense = new Expense();
        expense.setTitle(request.getTitle());
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setUser(user);
        expense.setFamily(family);
        return toResponse(expenseRepository.save(expense));
    }

    public List<ExpenseResponse> getExpenses(User user, Long familyId) {
        Family family = userService.getAccessibleFamily(user, familyId);
        return expenseRepository.findAllByFamilyOrderByExpenseDateDesc(family).stream().map(this::toResponse).toList();
    }

    public void deleteExpense(User user, Long familyId, Long id) {
        Family family = userService.getAccessibleFamily(user, familyId);
        Expense expense = expenseRepository.findByIdAndFamily(id, family)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        expenseRepository.delete(expense);
    }

    private ExpenseResponse toResponse(Expense e) {
        return new ExpenseResponse(e.getId(), e.getTitle(), e.getAmount(), e.getExpenseDate());
    }
}
