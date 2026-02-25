package com.lifesync.service;

import com.lifesync.exception.BadRequestException;
import com.lifesync.model.User;
import com.lifesync.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Authenticated user not found"));
    }
}
