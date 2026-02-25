package com.lifesync.service;

import com.lifesync.dto.task.TaskRequest;
import com.lifesync.dto.task.TaskResponse;
import com.lifesync.exception.ResourceNotFoundException;
import com.lifesync.model.Family;
import com.lifesync.model.TaskItem;
import com.lifesync.model.User;
import com.lifesync.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserService userService;

    public TaskService(TaskRepository taskRepository, UserService userService) {
        this.taskRepository = taskRepository;
        this.userService = userService;
    }

    public TaskResponse addTask(User user, Long familyId, TaskRequest request) {
        Family family = userService.getAccessibleFamily(user, familyId);

        TaskItem task = new TaskItem();
        task.setTitle(request.getTitle());
        task.setCompleted(false);
        task.setUser(user);
        task.setFamily(family);
        return toResponse(taskRepository.save(task));
    }

    public List<TaskResponse> getTasks(User user, Long familyId) {
        Family family = userService.getAccessibleFamily(user, familyId);
        return taskRepository.findAllByFamilyOrderByIdDesc(family).stream().map(this::toResponse).toList();
    }

    public TaskResponse markComplete(User user, Long familyId, Long id) {
        Family family = userService.getAccessibleFamily(user, familyId);
        TaskItem task = taskRepository.findByIdAndFamily(id, family)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        task.setCompleted(true);
        return toResponse(taskRepository.save(task));
    }

    public void deleteTask(User user, Long familyId, Long id) {
        Family family = userService.getAccessibleFamily(user, familyId);
        TaskItem task = taskRepository.findByIdAndFamily(id, family)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        taskRepository.delete(task);
    }

    private TaskResponse toResponse(TaskItem t) {
        return new TaskResponse(t.getId(), t.getTitle(), t.isCompleted());
    }
}
