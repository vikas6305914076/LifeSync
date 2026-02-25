package com.lifesync.service;

import com.lifesync.exception.BadRequestException;
import com.lifesync.model.Family;
import com.lifesync.model.FamilyRole;
import com.lifesync.model.User;
import com.lifesync.repository.ExpenseRepository;
import com.lifesync.repository.FamilyRepository;
import com.lifesync.repository.GroceryRepository;
import com.lifesync.repository.TaskRepository;
import com.lifesync.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;
    private final ExpenseRepository expenseRepository;
    private final TaskRepository taskRepository;
    private final GroceryRepository groceryRepository;

    public UserService(UserRepository userRepository,
                       FamilyRepository familyRepository,
                       ExpenseRepository expenseRepository,
                       TaskRepository taskRepository,
                       GroceryRepository groceryRepository) {
        this.userRepository = userRepository;
        this.familyRepository = familyRepository;
        this.expenseRepository = expenseRepository;
        this.taskRepository = taskRepository;
        this.groceryRepository = groceryRepository;
    }

    @Transactional
    public User getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Authenticated user not found"));
        ensureFamilyAssigned(user);
        return user;
    }

    @Transactional
    public Family getAccessibleFamily(User user, Long familyId) {
        ensureFamilyAssigned(user);
        Family userFamily = user.getFamily();
        if (userFamily == null) {
            throw new BadRequestException("User is not linked to a family workspace");
        }
        if (familyId != null && !familyId.equals(userFamily.getId())) {
            throw new BadRequestException("Access denied for requested family");
        }
        return userFamily;
    }

    @Transactional
    public void requireFamilyAdmin(User user, Long familyId) {
        Family family = getAccessibleFamily(user, familyId);
        if (user.getFamilyRole() != FamilyRole.ADMIN || !family.getId().equals(user.getFamily().getId())) {
            throw new BadRequestException("Only family admin can perform this action");
        }
    }

    @Transactional
    public List<User> getFamilyMembers(User user, Long familyId) {
        Family family = getAccessibleFamily(user, familyId);
        return userRepository.findAllByFamilyOrderByNameAsc(family);
    }

    @Transactional
    public void ensureFamilyAssigned(User user) {
        if (user.getFamily() != null) {
            if (user.getFamilyRole() == null) {
                user.setFamilyRole(FamilyRole.MEMBER);
                userRepository.save(user);
            }
            return;
        }
        Family family = new Family();
        family.setName(user.getName() + " Family");
        family = familyRepository.save(family);

        user.setFamily(family);
        user.setFamilyRole(FamilyRole.ADMIN);
        userRepository.save(user);

        expenseRepository.assignFamilyForUser(user, family);
        taskRepository.assignFamilyForUser(user, family);
        groceryRepository.assignFamilyForUser(user, family);
    }
}
