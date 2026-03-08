package com.lifesync.repository;

import com.lifesync.model.Medicine;
import com.lifesync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    List<Medicine> findAllByUserOrderByIdDesc(User user);
    Optional<Medicine> findByIdAndUser(Long id, User user);
}
