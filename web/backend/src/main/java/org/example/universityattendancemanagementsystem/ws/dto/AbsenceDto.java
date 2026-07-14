package org.example.universityattendancemanagementsystem.ws.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AbsenceDto {
    private Long id;
    private Long teacherId;
    private String teacherFirstName;
    private String teacherLastName;
    private String nomModule;
    private String filiere;
    private String promo;
    private String typeSeance;
    private LocalDate date;
    private LocalDateTime createdAt;
    private List<AbsenceDetailDto> absenceDetails;
}