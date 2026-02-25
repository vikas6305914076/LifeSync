package com.lifesync.dto.grocery;

import jakarta.validation.constraints.NotBlank;

public class GroceryRequest {

    @NotBlank(message = "Item name is required")
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
