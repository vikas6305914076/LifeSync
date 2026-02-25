package com.lifesync.repository;

import com.lifesync.model.Expense;
import com.lifesync.model.Family;
import com.lifesync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findAllByFamilyOrderByExpenseDateDesc(Family family);
    Optional<Expense> findByIdAndFamily(Long id, Family family);

    @Modifying
    @Query("update Expense e set e.family = :family where e.user = :user and e.family is null")
    int assignFamilyForUser(@Param("user") User user, @Param("family") Family family);
}
