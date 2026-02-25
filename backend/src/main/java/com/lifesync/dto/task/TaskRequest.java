package com.lifesync.dto.task;

import jakarta.validation.constraints.NotBlank;

public class TaskRequest {

    @NotBlank(message = "Task title is required")
    private String title;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
