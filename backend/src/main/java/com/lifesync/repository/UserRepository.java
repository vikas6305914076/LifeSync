package com.lifesync.repository;

import com.lifesync.model.Family;
import com.lifesync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findAllByFamilyOrderByNameAsc(Family family);
}
