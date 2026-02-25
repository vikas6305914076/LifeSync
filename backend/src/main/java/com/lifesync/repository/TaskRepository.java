package com.lifesync.repository;

import com.lifesync.model.TaskItem;
import com.lifesync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<TaskItem, Long> {
    List<TaskItem> findAllByUserOrderByIdDesc(User user);
    Optional<TaskItem> findByIdAndUser(Long id, User user);
}
