package com.lifesync.repository;

import com.lifesync.model.GroceryItem;
import com.lifesync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroceryRepository extends JpaRepository<GroceryItem, Long> {
    List<GroceryItem> findAllByUserOrderByIdDesc(User user);
    Optional<GroceryItem> findByIdAndUser(Long id, User user);
}
