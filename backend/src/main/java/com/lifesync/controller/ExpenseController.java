package com.lifesync.controller;

import com.lifesync.dto.expense.ExpenseRequest;
import com.lifesync.dto.expense.ExpenseResponse;
import com.lifesync.model.User;
import com.lifesync.service.ExpenseService;
import com.lifesync.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final UserService userService;

    public ExpenseController(ExpenseService expenseService, UserService userService) {
        this.expenseService = expenseService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> addExpense(@Valid @RequestBody ExpenseRequest request,
                                                      Authentication auth,
                                                      @RequestParam(name = "family_id", required = false) Long familyId) {
        User user = userService.getCurrentUser(auth.getName());
        return ResponseEntity.ok(expenseService.addExpense(user, familyId, request));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getExpenses(Authentication auth,
                                                             @RequestParam(name = "family_id", required = false) Long familyId) {
        User user = userService.getCurrentUser(auth.getName());
        return ResponseEntity.ok(expenseService.getExpenses(user, familyId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id,
                                              Authentication auth,
                                              @RequestParam(name = "family_id", required = false) Long familyId) {
        User user = userService.getCurrentUser(auth.getName());
        expenseService.deleteExpense(user, familyId, id);
        return ResponseEntity.noContent().build();
    }
}
