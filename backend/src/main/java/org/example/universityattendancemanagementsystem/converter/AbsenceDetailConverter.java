package org.example.universityattendancemanagementsystem.converter;

import org.example.universityattendancemanagementsystem.bean.Absence;
import org.example.universityattendancemanagementsystem.bean.AbsenceDetail;
import org.example.universityattendancemanagementsystem.bean.Student;
import org.example.universityattendancemanagementsystem.dto.AbsenceDetailDto;
import org.springframework.stereotype.Component;

@Component
public class AbsenceDetailConverter {

    public AbsenceDetailDto toDto(AbsenceDetail entity) {
        if (entity == null) {
            return null;
        }
        return AbsenceDetailDto.builder()
                .id(entity.getId())
                .absenceId(entity.getAbsence() != null ? entity.getAbsence().getId() : null)
                .studentId(entity.getStudent() != null ? entity.getStudent().getId() : null)
                .studentFullName(entity.getStudent() != null ? entity.getStudent().getPrenom() + " " + entity.getStudent().getNom() : null)
                .estAbsent(entity.isEstAbsent())
                .build();
    }

    public AbsenceDetail toEntity(AbsenceDetailDto dto, Absence absence, Student student) {
        if (dto == null) {
            return null;
        }
        return AbsenceDetail.builder()
                .id(dto.getId())
                .absence(absence)
                .student(student)
                .estAbsent(dto.isEstAbsent())
                .build();
    }
}
