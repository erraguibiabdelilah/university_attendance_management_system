package org.example.universityattendancemanagementsystem.service.impl;

import org.example.universityattendancemanagementsystem.bean.Absence;
import org.example.universityattendancemanagementsystem.bean.AbsenceDetail;
import org.example.universityattendancemanagementsystem.bean.Student;
import org.example.universityattendancemanagementsystem.bean.Teacher;
import org.example.universityattendancemanagementsystem.converter.AbsenceConverter;
import org.example.universityattendancemanagementsystem.converter.AbsenceDetailConverter;
import org.example.universityattendancemanagementsystem.dao.AbsenceDetailRepository;
import org.example.universityattendancemanagementsystem.dao.AbsenceRepository;
import org.example.universityattendancemanagementsystem.dto.AbsenceDetailDto;
import org.example.universityattendancemanagementsystem.dto.AbsenceDto;
import org.example.universityattendancemanagementsystem.exception.BadRequestException;
import org.example.universityattendancemanagementsystem.exception.ResourceNotFoundException;
import org.example.universityattendancemanagementsystem.security.dao.StudentRepository;
import org.example.universityattendancemanagementsystem.security.dao.TeacherRepository;
import org.example.universityattendancemanagementsystem.service.AbsenceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class AbsenceServiceImpl implements AbsenceService {

    private final AbsenceRepository absenceRepository;
    private final AbsenceDetailRepository absenceDetailRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final AbsenceConverter absenceConverter;
    private final AbsenceDetailConverter absenceDetailConverter;

    public AbsenceServiceImpl(AbsenceRepository absenceRepository, AbsenceDetailRepository absenceDetailRepository, TeacherRepository teacherRepository, StudentRepository studentRepository, AbsenceConverter absenceConverter, AbsenceDetailConverter absenceDetailConverter) {
        this.absenceRepository = absenceRepository;
        this.absenceDetailRepository = absenceDetailRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.absenceConverter = absenceConverter;
        this.absenceDetailConverter = absenceDetailConverter;
    }

    @Override
    @Transactional
    public AbsenceDto createAbsence(Long teacherId, String nomModule, String filiere, String promo, String typeSeance, LocalDate date, List<Long> studentIds) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + teacherId));
        List<Student> students = studentRepository.findAllById(studentIds);
        if (students.size() != studentIds.size()) {
            throw new BadRequestException("One or more students not found");
        }

        Absence absence = Absence.builder()
                .teacher(teacher)
                .nomModule(nomModule)
                .filiere(filiere)
                .promo(promo)
                .typeSeance(typeSeance)
                .date(date.atStartOfDay())
                .build();

        students.forEach(student -> absence.getAbsenceDetails().add(
                AbsenceDetail.builder().absence(absence).student(student).estAbsent(false).build()
        ));

        Absence saved = absenceRepository.save(absence);
        return absenceConverter.toDto(saved);
    }

    @Override
    @Transactional
    public AbsenceDto markAbsences(Long absenceId, List<Long> absentStudentIds) {
        Absence absence = absenceRepository.findById(absenceId)
                .orElseThrow(() -> new ResourceNotFoundException("Absence not found: " + absenceId));
        Set<Long> absentSet = new HashSet<>(absentStudentIds);
        absence.getAbsenceDetails().forEach(detail -> detail.setEstAbsent(absentSet.contains(detail.getStudent().getId())));
        return absenceConverter.toDto(absenceRepository.save(absence));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AbsenceDto> getAbsencesByTeacher(Long teacherId) {
        return absenceRepository.findByTeacherId(teacherId).stream().map(absenceConverter::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AbsenceDto> getAbsencesByFiliereAndPromo(String filiere, String promo) {
        return absenceRepository.findByFiliereAndPromo(filiere, promo).stream().map(absenceConverter::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AbsenceDetailDto> getAbsenceDetails(Long absenceId) {
        return absenceDetailRepository.findByAbsenceId(absenceId).stream().map(absenceDetailConverter::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> countAbsencesByStudent(Long studentId) {
        List<AbsenceDetail> details = absenceDetailRepository.findByStudentId(studentId);
        long totalSeances = details.size();
        long totalAbsences = details.stream().filter(AbsenceDetail::isEstAbsent).count();
        return Map.of("totalSeances", totalSeances, "totalAbsences", totalAbsences);
    }
}
