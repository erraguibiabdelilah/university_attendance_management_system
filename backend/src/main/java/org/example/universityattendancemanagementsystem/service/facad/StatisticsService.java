package org.example.universityattendancemanagementsystem.service.facad;

import org.example.universityattendancemanagementsystem.ws.dto.StatisticsDto;
import org.example.universityattendancemanagementsystem.ws.dto.StudentStatsDto;

public interface StatisticsService {

    long countStudents();

    long countTeachers();

    StatisticsDto getStatistics();

    StudentStatsDto getStudentStats(String username);
}
