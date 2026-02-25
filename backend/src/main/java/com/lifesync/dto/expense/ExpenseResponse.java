package com.lifesync.dto.expense;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseResponse {

    private Long id;
    private String title;
    private BigDecimal amount;
    private LocalDate expenseDate;

    public ExpenseResponse(Long id, String title, BigDecimal amount, LocalDate expenseDate) {
        this.id = id;
        this.title = title;
        this.amount = amount;
        this.expenseDate = expenseDate;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }
}
