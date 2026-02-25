package com.lifesync.dto.family;

import java.util.List;

public class FamilyResponse {
    private Long familyId;
    private String familyName;
    private List<FamilyMemberResponse> members;

    public FamilyResponse(Long familyId, String familyName, List<FamilyMemberResponse> members) {
        this.familyId = familyId;
        this.familyName = familyName;
        this.members = members;
    }

    public Long getFamilyId() {
        return familyId;
    }

    public String getFamilyName() {
        return familyName;
    }

    public List<FamilyMemberResponse> getMembers() {
        return members;
    }
}
