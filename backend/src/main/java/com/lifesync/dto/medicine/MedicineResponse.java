package com.lifesync.dto.medicine;

public class MedicineResponse {

    private Long id;
    private String name;
    private String dosage;
    private String reminderTime;

    public MedicineResponse(Long id, String name, String dosage, String reminderTime) {
        this.id = id;
        this.name = name;
        this.dosage = dosage;
        this.reminderTime = reminderTime;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDosage() {
        return dosage;
    }

    public String getReminderTime() {
        return reminderTime;
    }
}
