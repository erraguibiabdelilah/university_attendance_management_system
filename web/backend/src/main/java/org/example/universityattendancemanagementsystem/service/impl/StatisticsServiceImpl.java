package org.example.universityattendancemanagementsystem.service.impl;

import org.example.universityattendancemanagementsystem.bean.Absence;
import org.example.universityattendancemanagementsystem.bean.AbsenceDetail;
import org.example.universityattendancemanagementsystem.bean.Role;
import org.example.universityattendancemanagementsystem.dao.AbsenceDao;
import org.example.universityattendancemanagementsystem.dao.AbsenceDetailDao;
import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.dao.StatisticsDao;
import org.example.universityattendancemanagementsystem.security.dao.UserDao;
import org.example.universityattendancemanagementsystem.service.facad.StatisticsService;
import org.example.universityattendancemanagementsystem.ws.dto.StatisticsDto;
import org.example.universityattendancemanagementsystem.ws.dto.StudentStatsDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class StatisticsServiceImpl implements StatisticsService {

    private final StatisticsDao statisticsDao;
    private final AbsenceDao absenceDao;
    private final AbsenceDetailDao absenceDetailDao;
    private final UserDao userDao;

    public StatisticsServiceImpl(StatisticsDao statisticsDao,
                                 AbsenceDao absenceDao,
                                 AbsenceDetailDao absenceDetailDao,
                                 UserDao userDao) {
        this.statisticsDao = statisticsDao;
        this.absenceDao = absenceDao;
        this.absenceDetailDao = absenceDetailDao;
        this.userDao = userDao;
    }

    @Override
    public long countStudents() {
        return statisticsDao.countByRole(Role.STUDENT);
    }

    @Override
    public long countTeachers() {
        return statisticsDao.countByRole(Role.TEACHER);
    }

    @Override
    public StatisticsDto getStatistics() {
        long totalStudents = countStudents();
        long totalTeachers = countTeachers();

        // Calcul du taux d'absence global
        List<AbsenceDetail> allDetails = absenceDetailDao.findAll();
        long totalPresences = allDetails.size();
        long totalAbsents = allDetails.stream().filter(AbsenceDetail::isEstAbsent).count();
        double tauxAbsence = totalPresences == 0 ? 0.0
                : Math.round((totalAbsents * 100.0 / totalPresences) * 10.0) / 10.0;

        // Absences par mois par filière
        List<String> filieres = statisticsDao.findDistinctFilieres();
        List<Absence> allAbsences = absenceDao.findAll();

        Map<String, List<Long>> absencesParMoisParFiliere = new LinkedHashMap<>();
        Map<String, Long> absencesTotalParFiliere = new LinkedHashMap<>();

        for (String filiere : filieres) {
            // 12 mois initialisés à 0
            Long[] mois = new Long[12];
            Arrays.fill(mois, 0L);

            long totalFiliere = 0L;

            for (Absence absence : allAbsences) {
                if (!filiere.equals(absence.getFilier())) continue;

                // Compter les absents dans cette séance
                long absentsCount = absence.getAbsenceDetails().stream()
                        .filter(AbsenceDetail::isEstAbsent)
                        .count();

                int monthIndex = absence.getDate().getMonthValue() - 1; // 0-based
                mois[monthIndex] += absentsCount;
                totalFiliere += absentsCount;
            }

            absencesParMoisParFiliere.put(filiere, Arrays.asList(mois));
            absencesTotalParFiliere.put(filiere, totalFiliere);
        }

        return StatisticsDto.builder()
                .totalStudents(totalStudents)
                .totalTeachers(totalTeachers)
                .tauxAbsence(tauxAbsence)
                .absencesParMoisParFiliere(absencesParMoisParFiliere)
                .absencesTotalParFiliere(absencesTotalParFiliere)
                .build();
    }

    @Override
    public StudentStatsDto getStudentStats(String username) {
        User student = userDao.findUserByUsername(username);
        if (student == null) {
            return StudentStatsDto.builder()
                    .totalAbsences(0).totalPresent(0).attendanceRate(0)
                    .absencesByModule(new LinkedHashMap<>())
                    .recentAbsences(new ArrayList<>()).build();
        }

        List<AbsenceDetail> details = absenceDetailDao.findByStudentIdWithAbsence(student.getId());
        long totalAbsences = details.stream().filter(AbsenceDetail::isEstAbsent).count();
        long totalPresent  = details.size() - totalAbsences;
        double attendanceRate = details.isEmpty() ? 100.0
                : Math.round((totalPresent * 100.0 / details.size()) * 10.0) / 10.0;

        Map<String, Long> absencesByModule = details.stream()
                .filter(AbsenceDetail::isEstAbsent)
                .collect(Collectors.groupingBy(
                        d -> d.getAbsence().getNomModule(),
                        Collectors.counting()
                ));

        List<StudentStatsDto.RecentAbsence> recentAbsences = details.stream()
                .sorted((a, b) -> b.getAbsence().getDate().compareTo(a.getAbsence().getDate()))
                .limit(5)
                .map(d -> StudentStatsDto.RecentAbsence.builder()
                        .module(d.getAbsence().getNomModule())
                        .date(d.getAbsence().getDate().toString())
                        .absent(d.isEstAbsent())
                        .build())
                .collect(Collectors.toList());

        return StudentStatsDto.builder()
                .totalAbsences(totalAbsences)
                .totalPresent(totalPresent)
                .attendanceRate(attendanceRate)
                .absencesByModule(absencesByModule)
                .recentAbsences(recentAbsences)
                .firstName(student.getFirstName())
                .filier(student.getFilier())
                .promo(student.getPromo())
                .build();
    }
}
