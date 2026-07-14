package org.example.universityattendancemanagementsystem.service.facad;

import org.example.universityattendancemanagementsystem.ws.dto.AbsenceDetailDto;

import java.util.List;

public interface AbsenceDetailService {

    List<AbsenceDetailDto> findByStudentCne(String cne);

    List<AbsenceDetailDto> findByStudentId(Long studentId);

    List<AbsenceDetailDto> findByAbsenceId(Long absenceId);

    List<AbsenceDetailDto> findAll();

    AbsenceDetailDto save(AbsenceDetailDto dto);

    AbsenceDetailDto update(Long id, AbsenceDetailDto dto);

    void deleteById(Long id);

    void savePushToken(Long studentId, String token);
}
