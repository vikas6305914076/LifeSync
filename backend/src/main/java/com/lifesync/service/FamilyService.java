package com.lifesync.service;

import com.lifesync.dto.family.FamilyMemberResponse;
import com.lifesync.dto.family.FamilyResponse;
import com.lifesync.dto.invite.FamilyInviteResponse;
import com.lifesync.dto.invite.InviteValidationResponse;
import com.lifesync.dto.invite.InviteCreateRequest;
import com.lifesync.exception.BadRequestException;
import com.lifesync.model.*;
import com.lifesync.repository.FamilyInviteRepository;
import com.lifesync.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class FamilyService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final FamilyInviteRepository familyInviteRepository;
    private final EmailService emailService;

    public FamilyService(UserService userService,
                         UserRepository userRepository,
                         FamilyInviteRepository familyInviteRepository,
                         EmailService emailService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.familyInviteRepository = familyInviteRepository;
        this.emailService = emailService;
    }

    @Transactional
    public FamilyResponse getMyFamily(User user, Long familyId) {
        Family family = userService.getAccessibleFamily(user, familyId);
        List<FamilyMemberResponse> members = userRepository.findAllByFamilyOrderByNameAsc(family).stream()
                .map(member -> new FamilyMemberResponse(
                        member.getId(),
                        member.getName(),
                        member.getEmail(),
                        member.getFamilyRole().name()))
                .toList();

        return new FamilyResponse(family.getId(), family.getName(), members);
    }

    @Transactional
    public FamilyInviteResponse createInvite(User user, Long familyId, InviteCreateRequest request) {
        userService.requireFamilyAdmin(user, familyId);
        Family family = userService.getAccessibleFamily(user, familyId);

        boolean alreadyMember = userRepository.findAllByFamilyOrderByNameAsc(family).stream()
                .anyMatch(member -> member.getEmail().equalsIgnoreCase(request.getEmail()));
        if (alreadyMember) {
            throw new BadRequestException("User is already a family member");
        }

        FamilyInvite invite = new FamilyInvite();
        invite.setFamily(family);
        invite.setInvitedBy(user);
        invite.setInvitedEmail(request.getEmail().toLowerCase());
        invite.setInviteToken(UUID.randomUUID().toString());
        invite.setStatus(InviteStatus.PENDING);
        invite.setExpiresAt(LocalDateTime.now().plusDays(7));

        FamilyInvite saved = familyInviteRepository.save(invite);
        emailService.sendInvitationEmail(
                saved.getInvitedEmail(),
                saved.getInviteToken(),
                family.getName(),
                user.getName()
        );
        return toInviteResponse(saved);
    }

    @Transactional
    public List<FamilyInviteResponse> getPendingInvites(User user, Long familyId) {
        userService.requireFamilyAdmin(user, familyId);
        Family family = userService.getAccessibleFamily(user, familyId);

        return familyInviteRepository.findAllByFamilyIdAndStatusOrderByCreatedAtDesc(family.getId(), InviteStatus.PENDING)
                .stream()
                .map(this::toInviteResponse)
                .toList();
    }

    @Transactional
    public FamilyResponse acceptInvite(User user, String inviteToken) {
        FamilyInvite invite = familyInviteRepository.findByInviteTokenAndStatus(inviteToken, InviteStatus.PENDING)
                .orElseThrow(() -> new BadRequestException("Invite not found or already used"));

        if (invite.getExpiresAt().isBefore(LocalDateTime.now())) {
            invite.setStatus(InviteStatus.EXPIRED);
            familyInviteRepository.save(invite);
            throw new BadRequestException("Invite has expired");
        }

        if (!invite.getInvitedEmail().equalsIgnoreCase(user.getEmail())) {
            throw new BadRequestException("This invite is not issued for your account");
        }

        if (user.getFamily() != null && !user.getFamily().getId().equals(invite.getFamily().getId())) {
            throw new BadRequestException("You already belong to another family");
        }

        user.setFamily(invite.getFamily());
        user.setFamilyRole(FamilyRole.MEMBER);
        userRepository.save(user);

        invite.setStatus(InviteStatus.ACCEPTED);
        familyInviteRepository.save(invite);

        return getMyFamily(user, invite.getFamily().getId());
    }

    private FamilyInviteResponse toInviteResponse(FamilyInvite invite) {
        return new FamilyInviteResponse(
                invite.getId(),
                invite.getInvitedEmail(),
                invite.getInviteToken(),
                invite.getStatus().name(),
                invite.getExpiresAt()
        );
    }

    @Transactional
    public InviteValidationResponse validateInviteToken(String inviteToken) {
        FamilyInvite invite = familyInviteRepository.findByInviteToken(inviteToken)
                .orElse(null);

        if (invite == null) {
            return new InviteValidationResponse(false, "Invite token is invalid", null, null, null);
        }

        if (invite.getStatus() != InviteStatus.PENDING) {
            return new InviteValidationResponse(false, "Invite is already used or inactive",
                    invite.getInvitedEmail(), invite.getFamily().getName(), invite.getExpiresAt());
        }

        if (invite.getExpiresAt().isBefore(LocalDateTime.now())) {
            invite.setStatus(InviteStatus.EXPIRED);
            familyInviteRepository.save(invite);
            return new InviteValidationResponse(false, "Invite has expired",
                    invite.getInvitedEmail(), invite.getFamily().getName(), invite.getExpiresAt());
        }

        return new InviteValidationResponse(true, "Invite is valid",
                invite.getInvitedEmail(), invite.getFamily().getName(), invite.getExpiresAt());
    }
}
