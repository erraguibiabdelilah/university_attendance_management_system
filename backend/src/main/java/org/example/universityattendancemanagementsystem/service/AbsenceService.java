package org.example.universityattendancemanagementsystem.service;

import org.example.universityattendancemanagementsystem.dto.AbsenceDetailDto;
import org.example.universityattendancemanagementsystem.dto.AbsenceDto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface AbsenceService {
    AbsenceDto createAbsence(Long teacherId, String nomModule, String filiere, String promo, String typeSeance, LocalDate date, List<Long> studentIds);

    AbsenceDto markAbsences(Long absenceId, List<Long> absentStudentIds);

    List<AbsenceDto> getAbsencesByTeacher(Long teacherId);

    List<AbsenceDto> getAbsencesByFiliereAndPromo(String filiere, String promo);

    List<AbsenceDetailDto> getAbsenceDetails(Long absenceId);

    Map<String, Long> countAbsencesByStudent(Long studentId);
}
