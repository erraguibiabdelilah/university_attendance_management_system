package org.example.universityattendancemanagementsystem.ws.facad;

import org.example.universityattendancemanagementsystem.service.facad.StatisticsService;
import org.example.universityattendancemanagementsystem.ws.dto.StatisticsDto;
import org.example.universityattendancemanagementsystem.ws.dto.StudentStatsDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/uca/statistics/")
public class StatisticsWs {

    private final StatisticsService statisticsService;

    public StatisticsWs(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    // GET /api/uca/statistics/students
    @GetMapping("students")
    public ResponseEntity<Long> countStudents() {
        return ResponseEntity.ok(statisticsService.countStudents());
    }

    // GET /api/uca/statistics/teachers
    @GetMapping("teachers")
    public ResponseEntity<Long> countTeachers() {
        return ResponseEntity.ok(statisticsService.countTeachers());
    }

    // GET /api/uca/statistics  — retourne tout en un seul appel
    @GetMapping
    public ResponseEntity<StatisticsDto> getStatistics() {
        return ResponseEntity.ok(statisticsService.getStatistics());
    }

    // GET /api/uca/statistics/student/stats — stats de l'étudiant connecté
    @GetMapping("student/stats")
    public ResponseEntity<StudentStatsDto> getStudentStats(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(statisticsService.getStudentStats(userDetails.getUsername()));
    }
}
