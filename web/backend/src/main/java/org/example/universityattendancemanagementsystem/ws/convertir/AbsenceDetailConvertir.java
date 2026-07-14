package org.example.universityattendancemanagementsystem.ws.convertir;

import org.example.universityattendancemanagementsystem.bean.Absence;
import org.example.universityattendancemanagementsystem.bean.AbsenceDetail;
import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.dao.AbsenceDao;
import org.example.universityattendancemanagementsystem.security.dao.UserDao;
import org.example.universityattendancemanagementsystem.security.services.facad.UserService;
import org.example.universityattendancemanagementsystem.service.facad.AbsenceService;

import org.example.universityattendancemanagementsystem.ws.dto.AbsenceDetailDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class AbsenceDetailConvertir {


    // Entité → DTO
    public AbsenceDetailDto toDto(AbsenceDetail detail) {
        if (detail == null) return null;

        return AbsenceDetailDto.builder()
                .id(detail.getId())
                .absenceId(detail.getAbsence().getId())
                .studentId(detail.getStudent().getId())
                .studentFirstName(detail.getStudent().getFirstName())
                .studentLastName(detail.getStudent().getLastName())
                .studentCne(detail.getStudent().getCne())
                .estAbsent(detail.isEstAbsent())
                .nomModule(detail.getAbsence().getNomModule())
                .date(detail.getAbsence().getDate() != null ? detail.getAbsence().getDate().toString() : null)
                .build();
    }

    // DTO → Entité
    public AbsenceDetail toBean(AbsenceDetailDto dto, Absence absence, User student) {
        if (dto == null) return null;

        return AbsenceDetail.builder()
                .id(dto.getId())
                .absence(absence)
                .student(student)
                .estAbsent(dto.isEstAbsent())
                .build();
    }

    // Liste Entités → Liste DTOs
    public List<AbsenceDetailDto> toDtoList(List<AbsenceDetail> details) {
        if (details == null) return new ArrayList<>();
        return details.stream().map(this::toDto).toList();
    }
}