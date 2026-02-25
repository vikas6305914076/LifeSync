package com.lifesync.dto.invite;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class InviteCreateRequest {
    @NotBlank(message = "Invite email is required")
    @Email(message = "Invite email must be valid")
    private String email;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
