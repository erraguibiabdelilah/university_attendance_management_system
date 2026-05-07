package org.example.universityattendancemanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AbsenceDto {
    private Long id;
    private Long teacherId;
    private String teacherFullName;
    private String nomModule;
    private String filiere;
    private String promo;
    private String typeSeance;
    private LocalDateTime date;
    private LocalDateTime createdAt;
    private List<AbsenceDetailDto> absenceDetails;
}
