package com.lifesync.dto.invite;

import java.time.LocalDateTime;

public class InviteValidationResponse {
    private boolean valid;
    private String message;
    private String invitedEmail;
    private String familyName;
    private LocalDateTime expiresAt;

    public InviteValidationResponse(boolean valid, String message, String invitedEmail, String familyName, LocalDateTime expiresAt) {
        this.valid = valid;
        this.message = message;
        this.invitedEmail = invitedEmail;
        this.familyName = familyName;
        this.expiresAt = expiresAt;
    }

    public boolean isValid() {
        return valid;
    }

    public String getMessage() {
        return message;
    }

    public String getInvitedEmail() {
        return invitedEmail;
    }

    public String getFamilyName() {
        return familyName;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
}
