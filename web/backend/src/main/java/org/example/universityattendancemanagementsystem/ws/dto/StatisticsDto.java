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
public class StatisticsDto {
    private long totalStudents;
    private long totalTeachers;
    private double tauxAbsence; // pourcentage global d'absence

    // absences par mois par filière : { "GINF": [0,5,3,...12 mois], "GSTR": [...] }
    private Map<String, List<Long>> absencesParMoisParFiliere;

    // absences total par filière pour le graphique barres : { "GINF": 45, "GSTR": 30 }
    private Map<String, Long> absencesTotalParFiliere;
}
