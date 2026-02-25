package com.lifesync.repository;

import com.lifesync.model.Family;
import com.lifesync.model.TaskItem;
import com.lifesync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<TaskItem, Long> {
    List<TaskItem> findAllByFamilyOrderByIdDesc(Family family);
    Optional<TaskItem> findByIdAndFamily(Long id, Family family);

    @Modifying
    @Query("update TaskItem t set t.family = :family where t.user = :user and t.family is null")
    int assignFamilyForUser(@Param("user") User user, @Param("family") Family family);
}
