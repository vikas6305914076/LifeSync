package com.lifesync.controller;

import com.lifesync.dto.grocery.GroceryRequest;
import com.lifesync.dto.grocery.GroceryResponse;
import com.lifesync.model.User;
import com.lifesync.service.GroceryService;
import com.lifesync.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groceries")
public class GroceryController {

    private final GroceryService groceryService;
    private final UserService userService;

    public GroceryController(GroceryService groceryService, UserService userService) {
        this.groceryService = groceryService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<GroceryResponse> addItem(@Valid @RequestBody GroceryRequest request, Authentication auth) {
        User user = userService.getCurrentUser(auth.getName());
        return ResponseEntity.ok(groceryService.addItem(user, request));
    }

    @GetMapping
    public ResponseEntity<List<GroceryResponse>> getItems(Authentication auth) {
        User user = userService.getCurrentUser(auth.getName());
        return ResponseEntity.ok(groceryService.getItems(user));
    }

    @PatchMapping("/{id}/purchase")
    public ResponseEntity<GroceryResponse> markPurchased(@PathVariable Long id, Authentication auth) {
        User user = userService.getCurrentUser(auth.getName());
        return ResponseEntity.ok(groceryService.markPurchased(user, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id, Authentication auth) {
        User user = userService.getCurrentUser(auth.getName());
        groceryService.deleteItem(user, id);
        return ResponseEntity.noContent().build();
    }
}
