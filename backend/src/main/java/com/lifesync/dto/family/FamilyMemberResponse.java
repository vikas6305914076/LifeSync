package com.lifesync.dto.family;

public class FamilyMemberResponse {
    private Long userId;
    private String name;
    private String email;
    private String familyRole;

    public FamilyMemberResponse(Long userId, String name, String email, String familyRole) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.familyRole = familyRole;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getFamilyRole() {
        return familyRole;
    }
}
