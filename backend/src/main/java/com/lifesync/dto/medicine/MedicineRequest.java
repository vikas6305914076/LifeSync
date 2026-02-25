package com.lifesync.dto.medicine;

import jakarta.validation.constraints.NotBlank;

public class MedicineRequest {

    @NotBlank(message = "Medicine name is required")
    private String name;

    @NotBlank(message = "Dosage is required")
    private String dosage;

    @NotBlank(message = "Reminder time is required")
    private String reminderTime;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public String getReminderTime() {
        return reminderTime;
    }

    public void setReminderTime(String reminderTime) {
        this.reminderTime = reminderTime;
    }
}
