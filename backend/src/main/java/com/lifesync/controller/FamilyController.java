package com.lifesync.controller;

import com.lifesync.dto.family.FamilyResponse;
import com.lifesync.dto.invite.FamilyInviteResponse;
import com.lifesync.dto.invite.InviteCreateRequest;
import com.lifesync.model.User;
import com.lifesync.service.FamilyService;
import com.lifesync.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/family")
public class FamilyController {

    private final FamilyService familyService;
    private final UserService userService;

    public FamilyController(FamilyService familyService, UserService userService) {
        this.familyService = familyService;
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<FamilyResponse> getMyFamily(Authentication auth,
                                                      @RequestParam(name = "family_id", required = false) Long familyId) {
        User user = userService.getCurrentUser(auth.getName());
        return ResponseEntity.ok(familyService.getMyFamily(user, familyId));
    }

    @PostMapping("/invites")
    public ResponseEntity<FamilyInviteResponse> createInvite(Authentication auth,
                                                             @RequestParam(name = "family_id", required = false) Long familyId,
                                                             @Valid @RequestBody InviteCreateRequest request) {
        User user = userService.getCurrentUser(auth.getName());
        return ResponseEntity.ok(familyService.createInvite(user, familyId, request));
    }

    @GetMapping("/invites")
    public ResponseEntity<List<FamilyInviteResponse>> getPendingInvites(Authentication auth,
                                                                        @RequestParam(name = "family_id", required = false) Long familyId) {
        User user = userService.getCurrentUser(auth.getName());
        return ResponseEntity.ok(familyService.getPendingInvites(user, familyId));
    }

    @PostMapping("/invites/{token}/accept")
    public ResponseEntity<FamilyResponse> acceptInvite(Authentication auth, @PathVariable String token) {
        User user = userService.getCurrentUser(auth.getName());
        return ResponseEntity.ok(familyService.acceptInvite(user, token));
    }
}
