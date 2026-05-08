package org.example.universityattendancemanagementsystem.ws.convertir;


import org.example.universityattendancemanagementsystem.bean.Absence;
import org.example.universityattendancemanagementsystem.bean.User;

import org.example.universityattendancemanagementsystem.ws.dto.AbsenceDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class AbsenceConvertir {

    @Autowired
    private AbsenceDetailConvertir absenceDetailConvertir;

    // Entité → DTO
    public AbsenceDto toDto(Absence absence) {
        if (absence == null) return null;

        return AbsenceDto.builder()
                .id(absence.getId())
                .teacherId(absence.getTeacher().getId())
                .teacherFirstName(absence.getTeacher().getFirstName())
                .teacherLastName(absence.getTeacher().getLastName())
                .nomModule(absence.getNomModule())
                .filiere(absence.getFilier())
                .promo(absence.getPromo())
                .typeSeance(absence.getTypeSeance())
                .date(absence.getDate())
                .createdAt(absence.getCreatedAt())
                .absenceDetails(
                        absence.getAbsenceDetails() != null
                                ? absence.getAbsenceDetails().stream()
                                  .map(absenceDetailConvertir::toDto)
                                  .toList()
                                : new ArrayList<>()
                )
                .build();
    }

    // DTO → Entité
    public Absence toBean(AbsenceDto dto) {
        if (dto == null) return null;

        User teacher = new User();
        teacher.setId(dto.getTeacherId());
        teacher.setFirstName(dto.getTeacherFirstName());
        teacher.setLastName(dto.getTeacherLastName());


        return Absence.builder()
                .id(dto.getId())
                .teacher(teacher)
                .nomModule(dto.getNomModule())
                .filier(dto.getFiliere())
                .promo(dto.getPromo())
                .typeSeance(dto.getTypeSeance())
                .date(dto.getDate())
                .build();
    }

    // Liste Entités → Liste DTOs
    public List<AbsenceDto> toDtoList(List<Absence> absences) {
        if (absences == null) return new ArrayList<>();
        return absences.stream().map(this::toDto).toList();
    }
}