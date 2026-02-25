package com.lifesync.controller;

import com.lifesync.dto.medicine.MedicineRequest;
import com.lifesync.dto.medicine.MedicineResponse;
import com.lifesync.model.User;
import com.lifesync.service.MedicineService;
import com.lifesync.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    private final MedicineService medicineService;
    private final UserService userService;

    public MedicineController(MedicineService medicineService, UserService userService) {
        this.medicineService = medicineService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<MedicineResponse> addMedicine(@Valid @RequestBody MedicineRequest request, Authentication auth) {
        User user = userService.getCurrentUser(auth.getName());
        return ResponseEntity.ok(medicineService.addMedicine(user, request));
    }

    @GetMapping
    public ResponseEntity<List<MedicineResponse>> getMedicines(Authentication auth) {
        User user = userService.getCurrentUser(auth.getName());
        return ResponseEntity.ok(medicineService.getMedicines(user));
    }
}
