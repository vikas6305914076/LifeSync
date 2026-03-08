package com.lifesync.repository;

import com.lifesync.model.FamilyInvite;
import com.lifesync.model.InviteStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FamilyInviteRepository extends JpaRepository<FamilyInvite, Long> {
    Optional<FamilyInvite> findByInviteToken(String inviteToken);
    Optional<FamilyInvite> findByInviteTokenAndStatus(String inviteToken, InviteStatus status);
    Optional<FamilyInvite> findByFamilyIdAndInvitedEmailAndStatus(Long familyId, String invitedEmail, InviteStatus status);
    List<FamilyInvite> findAllByFamilyIdAndStatusOrderByCreatedAtDesc(Long familyId, InviteStatus status);
}
