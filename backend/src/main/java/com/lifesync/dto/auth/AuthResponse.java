package com.lifesync.dto.auth;

public class AuthResponse {

    private String token;
    private String name;
    private String email;
    private Long familyId;
    private String familyName;
    private String familyRole;

    public AuthResponse(String token, String name, String email, Long familyId, String familyName, String familyRole) {
        this.token = token;
        this.name = name;
        this.email = email;
        this.familyId = familyId;
        this.familyName = familyName;
        this.familyRole = familyRole;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getFamilyId() {
        return familyId;
    }

    public void setFamilyId(Long familyId) {
        this.familyId = familyId;
    }

    public String getFamilyName() {
        return familyName;
    }

    public void setFamilyName(String familyName) {
        this.familyName = familyName;
    }

    public String getFamilyRole() {
        return familyRole;
    }

    public void setFamilyRole(String familyRole) {
        this.familyRole = familyRole;
    }
}
