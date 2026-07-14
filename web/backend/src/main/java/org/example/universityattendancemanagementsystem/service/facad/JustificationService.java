package org.example.universityattendancemanagementsystem.service.facad;

import org.example.universityattendancemanagementsystem.bean.JustificationStatut;
import org.example.universityattendancemanagementsystem.ws.dto.JustificationDto;

import java.util.List;
import java.util.Optional;

public interface JustificationService {
    List<JustificationDto> findAll();
    Optional<JustificationDto> findById(Long id);
    List<JustificationDto> findByStudentId(Long studentId);
    List<JustificationDto> findByAbsenceDetailId(Long absenceDetailId);
    List<JustificationDto> findByStatut(JustificationStatut statut);
    JustificationDto save(JustificationDto dto);
    JustificationDto updateStatut(Long id, JustificationStatut statut, String motifRefus);
    void deleteById(Long id);
}
