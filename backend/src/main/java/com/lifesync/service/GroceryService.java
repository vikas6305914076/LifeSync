package com.lifesync.service;

import com.lifesync.dto.grocery.GroceryRequest;
import com.lifesync.dto.grocery.GroceryResponse;
import com.lifesync.exception.ResourceNotFoundException;
import com.lifesync.model.GroceryItem;
import com.lifesync.model.User;
import com.lifesync.repository.GroceryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GroceryService {

    private final GroceryRepository groceryRepository;

    public GroceryService(GroceryRepository groceryRepository) {
        this.groceryRepository = groceryRepository;
    }

    public GroceryResponse addItem(User user, GroceryRequest request) {
        GroceryItem item = new GroceryItem();
        item.setName(request.getName());
        item.setPurchased(false);
        item.setUser(user);
        return toResponse(groceryRepository.save(item));
    }

    public List<GroceryResponse> getItems(User user) {
        return groceryRepository.findAllByUserOrderByIdDesc(user).stream().map(this::toResponse).toList();
    }

    public GroceryResponse markPurchased(User user, Long id) {
        GroceryItem item = groceryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Grocery item not found"));
        item.setPurchased(true);
        return toResponse(groceryRepository.save(item));
    }

    public void deleteItem(User user, Long id) {
        GroceryItem item = groceryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Grocery item not found"));
        groceryRepository.delete(item);
    }

    private GroceryResponse toResponse(GroceryItem item) {
        return new GroceryResponse(item.getId(), item.getName(), item.isPurchased());
    }
}
