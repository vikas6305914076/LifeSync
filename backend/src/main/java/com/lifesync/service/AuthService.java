package com.lifesync.service;

import com.lifesync.dto.auth.AuthResponse;
import com.lifesync.dto.auth.LoginRequest;
import com.lifesync.dto.auth.RegisterRequest;
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

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;
    private final FamilyInviteRepository familyInviteRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       FamilyRepository familyRepository,
                       FamilyInviteRepository familyInviteRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.familyRepository = familyRepository;
        this.familyInviteRepository = familyInviteRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
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
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFamily(family);
        user.setFamilyRole(familyRole);

        User saved = userRepository.save(user);
        return buildAuthResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            throw new BadRequestException("Invalid credentials");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));
        return buildAuthResponse(user);
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
