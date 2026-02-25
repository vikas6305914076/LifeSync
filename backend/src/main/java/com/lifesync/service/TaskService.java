package com.lifesync.service;

import com.lifesync.dto.task.TaskRequest;
import com.lifesync.dto.task.TaskResponse;
import com.lifesync.exception.ResourceNotFoundException;
import com.lifesync.model.TaskItem;
import com.lifesync.model.User;
import com.lifesync.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public TaskResponse addTask(User user, TaskRequest request) {
        TaskItem task = new TaskItem();
        task.setTitle(request.getTitle());
        task.setCompleted(false);
        task.setUser(user);
        return toResponse(taskRepository.save(task));
    }

    public List<TaskResponse> getTasks(User user) {
        return taskRepository.findAllByUserOrderByIdDesc(user).stream().map(this::toResponse).toList();
    }

    public TaskResponse markComplete(User user, Long id) {
        TaskItem task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        task.setCompleted(true);
        return toResponse(taskRepository.save(task));
    }

    public void deleteTask(User user, Long id) {
        TaskItem task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        taskRepository.delete(task);
    }

    private TaskResponse toResponse(TaskItem t) {
        return new TaskResponse(t.getId(), t.getTitle(), t.isCompleted());
    }
}
