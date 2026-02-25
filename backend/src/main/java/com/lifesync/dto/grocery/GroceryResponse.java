package com.lifesync.dto.grocery;

public class GroceryResponse {

    private Long id;
    private String name;
    private boolean purchased;

    public GroceryResponse(Long id, String name, boolean purchased) {
        this.id = id;
        this.name = name;
        this.purchased = purchased;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public boolean isPurchased() {
        return purchased;
    }
}
