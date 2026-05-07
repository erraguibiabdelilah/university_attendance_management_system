package org.example.universityattendancemanagementsystem.dto;

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
    private String studentFullName;
    private boolean estAbsent;
}
