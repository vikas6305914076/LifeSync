package com.lifesync.service;

import com.lifesync.dto.auth.AuthResponse;
import com.lifesync.dto.auth.LoginRequest;
import com.lifesync.dto.auth.RegisterRequest;
import com.lifesync.dto.auth.VerifyOtpRequest;
import com.lifesync.exception.BadRequestException;
import com.lifesync.model.*;
import com.lifesync.repository.FamilyInviteRepository;
import com.lifesync.repository.FamilyRepository;
import com.lifesync.repository.UserRepository;
import com.lifesync.security.JwtService;
import jakarta.transaction.Transactional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;
    private final FamilyInviteRepository familyInviteRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       FamilyRepository familyRepository,
                       FamilyInviteRepository familyInviteRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.familyRepository = familyRepository;
        this.familyInviteRepository = familyInviteRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    @Transactional
    public Map<String, String> register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase();
        User existing = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (existing != null) {
            if (existing.isEmailVerified()) {
                throw new BadRequestException("Email is already registered");
            }

            String otp = generateOtp();
            existing.setEmailOtp(otp);
            existing.setEmailOtpExpiresAt(LocalDateTime.now().plusMinutes(10));
            boolean resent = emailService.sendOtpEmail(existing.getEmail(), otp);
            if (!resent) {
                existing.setEmailVerified(true);
                existing.setEmailOtp(null);
                existing.setEmailOtpExpiresAt(null);
            }
            userRepository.save(existing);
            return Map.of("message", resent
                    ? "Account exists but not verified. OTP resent to your email."
                    : "Account activated because mail is unavailable. You can login now.");
        }

        Family family;
        FamilyRole familyRole;

        if (request.getInviteToken() != null && !request.getInviteToken().isBlank()) {
            FamilyInvite invite = familyInviteRepository.findByInviteToken(request.getInviteToken())
                    .orElseThrow(() -> new BadRequestException("Invalid invite token"));

            if (invite.getStatus() != InviteStatus.PENDING) {
                throw new BadRequestException("Invite is not active");
            }
            if (invite.getExpiresAt().isBefore(LocalDateTime.now())) {
                invite.setStatus(InviteStatus.EXPIRED);
                familyInviteRepository.save(invite);
                throw new BadRequestException("Invite has expired");
            }
            if (!invite.getInvitedEmail().equalsIgnoreCase(request.getEmail())) {
                throw new BadRequestException("Invite email does not match registration email");
            }

            family = invite.getFamily();
            familyRole = FamilyRole.MEMBER;
            invite.setStatus(InviteStatus.ACCEPTED);
            familyInviteRepository.save(invite);
        } else {
            Family newFamily = new Family();
            String familyName = (request.getFamilyName() == null || request.getFamilyName().isBlank())
                    ? request.getName() + " Family"
                    : request.getFamilyName();
            newFamily.setName(familyName);
            family = familyRepository.save(newFamily);
            familyRole = FamilyRole.ADMIN;
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFamily(family);
        user.setFamilyRole(familyRole);
        user.setEmailVerified(false);
        String otp = generateOtp();
        user.setEmailOtp(otp);
        user.setEmailOtpExpiresAt(LocalDateTime.now().plusMinutes(10));

        User saved = userRepository.save(user);
        boolean otpSent = emailService.sendOtpEmail(saved.getEmail(), otp);
        if (!otpSent) {
            saved.setEmailVerified(true);
            saved.setEmailOtp(null);
            saved.setEmailOtpExpiresAt(null);
            userRepository.save(saved);
            return Map.of("message", "Registration successful. Mail is unavailable, account auto-verified.");
        }
        return Map.of("message", "Registration successful. Please verify OTP sent to your email.");
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        if (!user.isEmailVerified()) {
            throw new BadRequestException("Email not verified. Please verify OTP before login.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            throw new BadRequestException("Invalid credentials");
        }

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.isEmailVerified()) {
            return buildAuthResponse(user);
        }

        if (user.getEmailOtp() == null || user.getEmailOtpExpiresAt() == null) {
            throw new BadRequestException("OTP not generated. Please register again.");
        }

        if (user.getEmailOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired");
        }

        if (!user.getEmailOtp().equals(request.getOtp())) {
            throw new BadRequestException("Invalid OTP");
        }

        user.setEmailVerified(true);
        user.setEmailOtp(null);
        user.setEmailOtpExpiresAt(null);
        User saved = userRepository.save(user);
        return buildAuthResponse(saved);
    }

    private String generateOtp() {
        int otp = 100000 + new Random().nextInt(900000);
        return String.valueOf(otp);
    }

    private AuthResponse buildAuthResponse(User user) {
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles("USER")
                .build();

        Long familyId = user.getFamily() != null ? user.getFamily().getId() : null;
        String familyName = user.getFamily() != null ? user.getFamily().getName() : null;

        String familyRole = user.getFamilyRole() != null ? user.getFamilyRole().name() : FamilyRole.MEMBER.name();

        return new AuthResponse(
                jwtService.generateToken(userDetails),
                user.getName(),
                user.getEmail(),
                familyId,
                familyName,
                familyRole
        );
    }
}
