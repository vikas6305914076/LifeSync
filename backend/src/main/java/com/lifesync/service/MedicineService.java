package com.lifesync.service;

import com.lifesync.dto.medicine.MedicineRequest;
import com.lifesync.dto.medicine.MedicineResponse;
import com.lifesync.model.Medicine;
import com.lifesync.model.User;
import com.lifesync.repository.MedicineRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;

    public MedicineService(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    public MedicineResponse addMedicine(User user, MedicineRequest request) {
        Medicine medicine = new Medicine();
        medicine.setName(request.getName());
        medicine.setDosage(request.getDosage());
        medicine.setReminderTime(request.getReminderTime());
        medicine.setUser(user);
        return toResponse(medicineRepository.save(medicine));
    }

    public List<MedicineResponse> getMedicines(User user) {
        return medicineRepository.findAllByUserOrderByIdDesc(user).stream().map(this::toResponse).toList();
    }

    private MedicineResponse toResponse(Medicine m) {
        return new MedicineResponse(m.getId(), m.getName(), m.getDosage(), m.getReminderTime());
    }
}
