package com.lifesync.repository;

import com.lifesync.model.Family;
import com.lifesync.model.GroceryItem;
import com.lifesync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GroceryRepository extends JpaRepository<GroceryItem, Long> {
    List<GroceryItem> findAllByFamilyOrderByIdDesc(Family family);
    Optional<GroceryItem> findByIdAndFamily(Long id, Family family);

    @Modifying
    @Query("update GroceryItem g set g.family = :family where g.user = :user and g.family is null")
    int assignFamilyForUser(@Param("user") User user, @Param("family") Family family);
}
