package org.example.universityattendancemanagementsystem.converter;

import org.example.universityattendancemanagementsystem.bean.Absence;
import org.example.universityattendancemanagementsystem.dto.AbsenceDetailDto;
import org.example.universityattendancemanagementsystem.dto.AbsenceDto;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AbsenceConverter {

    private final AbsenceDetailConverter absenceDetailConverter;

    public AbsenceConverter(AbsenceDetailConverter absenceDetailConverter) {
        this.absenceDetailConverter = absenceDetailConverter;
    }

    public AbsenceDto toDto(Absence entity) {
        if (entity == null) {
            return null;
        }
        List<AbsenceDetailDto> details = entity.getAbsenceDetails() == null
                ? List.of()
                : entity.getAbsenceDetails().stream().map(absenceDetailConverter::toDto).toList();

        return AbsenceDto.builder()
                .id(entity.getId())
                .teacherId(entity.getTeacher() != null ? entity.getTeacher().getId() : null)
                .teacherFullName(entity.getTeacher() != null ? entity.getTeacher().getPrenom() + " " + entity.getTeacher().getNom() : null)
                .nomModule(entity.getNomModule())
                .filiere(entity.getFiliere())
                .promo(entity.getPromo())
                .typeSeance(entity.getTypeSeance())
                .date(entity.getDate())
                .createdAt(entity.getCreatedAt())
                .absenceDetails(details)
                .build();
    }
}
