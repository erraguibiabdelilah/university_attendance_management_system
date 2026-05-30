package org.example.universityattendancemanagementsystem.ws.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentStatsDto {
    private long totalAbsences;
    private long totalPresent;
    private double attendanceRate;
    private Map<String, Long> absencesByModule;
    private String firstName;
    private String filier;
    private String promo;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentAbsence {
        private String module;
        private String date;
        private boolean absent;
    }

    private List<RecentAbsence> recentAbsences;
}
