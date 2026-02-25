package com.lifesync.dto.invite;

import java.time.LocalDateTime;

public class FamilyInviteResponse {
    private Long id;
    private String invitedEmail;
    private String inviteToken;
    private String status;
    private LocalDateTime expiresAt;

    public FamilyInviteResponse(Long id, String invitedEmail, String inviteToken, String status, LocalDateTime expiresAt) {
        this.id = id;
        this.invitedEmail = invitedEmail;
        this.inviteToken = inviteToken;
        this.status = status;
        this.expiresAt = expiresAt;
    }

    public Long getId() {
        return id;
    }

    public String getInvitedEmail() {
        return invitedEmail;
    }

    public String getInviteToken() {
        return inviteToken;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
}
