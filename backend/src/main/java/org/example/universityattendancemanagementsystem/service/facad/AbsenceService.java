package org.example.universityattendancemanagementsystem.service.facad;

import org.example.universityattendancemanagementsystem.bean.Absence;
import org.example.universityattendancemanagementsystem.ws.dto.AbsenceDto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AbsenceService {

    Optional<AbsenceDto> findByNomModuleAndFiliereAndDate(String nomModule, String filiere, LocalDate date);

    List<AbsenceDto> findByDate(LocalDateTime date);

    List<AbsenceDto> findByFiliereAndPromo(String filiere, String promo);

    List<AbsenceDto> findByTeacherId(Long teacherId);

    List<AbsenceDto> findAll();

    AbsenceDto save(AbsenceDto dto);

    void deleteById(Long id);
}
