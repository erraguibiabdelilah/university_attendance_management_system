package org.example.universityattendancemanagementsystem.ws.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AbsenceDetailDto {
    private Long id;
    private Long absenceId;
    private Long studentId;
    private String studentFirstName;
    private String studentLastName;
    private String studentCne;
    private boolean estAbsent;
}