package com.lifesync.controller;

import com.lifesync.dto.task.TaskRequest;
import com.lifesync.dto.task.TaskResponse;
import com.lifesync.model.User;
import com.lifesync.service.TaskService;
import com.lifesync.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;

    public TaskController(TaskService taskService, UserService userService) {
        this.taskService = taskService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> addTask(@Valid @RequestBody TaskRequest request,
                                                Authentication auth,
                                                @RequestParam(name = "family_id", required = false) Long familyId) {
        User user = userService.getCurrentUser(auth.getName());
        return ResponseEntity.ok(taskService.addTask(user, familyId, request));
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getTasks(Authentication auth,
                                                       @RequestParam(name = "family_id", required = false) Long familyId) {
        User user = userService.getCurrentUser(auth.getName());
        return ResponseEntity.ok(taskService.getTasks(user, familyId));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<TaskResponse> markComplete(@PathVariable Long id,
                                                     Authentication auth,
                                                     @RequestParam(name = "family_id", required = false) Long familyId) {
        User user = userService.getCurrentUser(auth.getName());
        return ResponseEntity.ok(taskService.markComplete(user, familyId, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id,
                                           Authentication auth,
                                           @RequestParam(name = "family_id", required = false) Long familyId) {
        User user = userService.getCurrentUser(auth.getName());
        taskService.deleteTask(user, familyId, id);
        return ResponseEntity.noContent().build();
    }
}
