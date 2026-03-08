package com.lifesync.controller;

import com.lifesync.dto.auth.AuthResponse;
import com.lifesync.dto.auth.LoginRequest;
import com.lifesync.dto.auth.RegisterRequest;
import com.lifesync.dto.auth.VerifyOtpRequest;
import com.lifesync.dto.invite.InviteValidationResponse;
import com.lifesync.service.AuthService;
import com.lifesync.service.FamilyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final FamilyService familyService;

    public AuthController(AuthService authService, FamilyService familyService) {
        this.authService = authService;
        this.familyService = familyService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    @GetMapping("/invites/{token}/validate")
    public ResponseEntity<InviteValidationResponse> validateInvite(@PathVariable String token) {
        return ResponseEntity.ok(familyService.validateInviteToken(token));
    }
}
