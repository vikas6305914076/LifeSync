package com.lifesync.service;

import com.lifesync.dto.grocery.GroceryRequest;
import com.lifesync.dto.grocery.GroceryResponse;
import com.lifesync.exception.ResourceNotFoundException;
import com.lifesync.model.Family;
import com.lifesync.model.GroceryItem;
import com.lifesync.model.User;
import com.lifesync.repository.GroceryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GroceryService {

    private final GroceryRepository groceryRepository;
    private final UserService userService;

    public GroceryService(GroceryRepository groceryRepository, UserService userService) {
        this.groceryRepository = groceryRepository;
        this.userService = userService;
    }

    public GroceryResponse addItem(User user, Long familyId, GroceryRequest request) {
        Family family = userService.getAccessibleFamily(user, familyId);

        GroceryItem item = new GroceryItem();
        item.setName(request.getName());
        item.setPurchased(false);
        item.setUser(user);
        item.setFamily(family);
        return toResponse(groceryRepository.save(item));
    }

    public List<GroceryResponse> getItems(User user, Long familyId) {
        Family family = userService.getAccessibleFamily(user, familyId);
        return groceryRepository.findAllByFamilyOrderByIdDesc(family).stream().map(this::toResponse).toList();
    }

    public GroceryResponse markPurchased(User user, Long familyId, Long id) {
        Family family = userService.getAccessibleFamily(user, familyId);
        GroceryItem item = groceryRepository.findByIdAndFamily(id, family)
                .orElseThrow(() -> new ResourceNotFoundException("Grocery item not found"));
        item.setPurchased(true);
        return toResponse(groceryRepository.save(item));
    }

    public void deleteItem(User user, Long familyId, Long id) {
        Family family = userService.getAccessibleFamily(user, familyId);
        GroceryItem item = groceryRepository.findByIdAndFamily(id, family)
                .orElseThrow(() -> new ResourceNotFoundException("Grocery item not found"));
        groceryRepository.delete(item);
    }

    private GroceryResponse toResponse(GroceryItem item) {
        return new GroceryResponse(item.getId(), item.getName(), item.isPurchased());
    }
}
