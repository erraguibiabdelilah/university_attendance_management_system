package org.example.universityattendancemanagementsystem.service.impl;

import org.example.universityattendancemanagementsystem.bean.Absence;
import org.example.universityattendancemanagementsystem.bean.AbsenceDetail;
import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.bean.Role;
import org.example.universityattendancemanagementsystem.dao.AbsenceDetailDao;
import org.example.universityattendancemanagementsystem.security.dao.UserDao;
import org.example.universityattendancemanagementsystem.dao.AbsenceDao;
import org.example.universityattendancemanagementsystem.service.facad.AbsenceDetailService;
import org.example.universityattendancemanagementsystem.ws.convertir.AbsenceDetailConvertir;
import org.example.universityattendancemanagementsystem.ws.dto.AbsenceDetailDto;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AbsenceDetailServiceImpl implements AbsenceDetailService {

    private final AbsenceDetailDao absenceDetailDao;
    private final AbsenceDao absenceDao;
    private final UserDao userDao;
    private final AbsenceDetailConvertir absenceDetailConvertir;

    public AbsenceDetailServiceImpl(AbsenceDetailDao absenceDetailDao,
                                    AbsenceDao absenceDao,
                                    UserDao userDao,
                                    AbsenceDetailConvertir absenceDetailConvertir) {
        this.absenceDetailDao = absenceDetailDao;
        this.absenceDao = absenceDao;
        this.userDao = userDao;
        this.absenceDetailConvertir = absenceDetailConvertir;
    }

    @Override
    public List<AbsenceDetailDto> findByStudentCne(String cne) {
        return absenceDetailConvertir.toDtoList(absenceDetailDao.findByStudentCne(cne));
    }

    @Override
    public List<AbsenceDetailDto> findByStudentId(Long studentId) {
        return absenceDetailConvertir.toDtoList(absenceDetailDao.findByStudentId(studentId));
    }

    @Override
    public List<AbsenceDetailDto> findByAbsenceId(Long absenceId) {
        return absenceDetailConvertir.toDtoList(absenceDetailDao.findByAbsenceId(absenceId));
    }

    @Override
    public List<AbsenceDetailDto> findAll() {
        return absenceDetailConvertir.toDtoList(absenceDetailDao.findAll());
    }

    @Override
    public AbsenceDetailDto save(AbsenceDetailDto dto) {
        validateAbsenceDetail(dto);

        Absence absence = absenceDao.findById(dto.getAbsenceId())
                .orElseThrow(() -> new IllegalArgumentException("Absence non trouvée avec l'id: " + dto.getAbsenceId()));

        User student = userDao.findById(dto.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Étudiant non trouvé avec l'id: " + dto.getStudentId()));

        validateStudentMatchesAbsence(absence, student);

        AbsenceDetail detail = absenceDetailConvertir.toBean(dto, absence, student);
        AbsenceDetail saved = absenceDetailDao.save(detail);
        return absenceDetailConvertir.toDto(saved);
    }

    private void validateAbsenceDetail(AbsenceDetailDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Le détail d'absence est obligatoire.");
        }
        if (dto.getAbsenceId() == null) {
            throw new IllegalArgumentException("L'absence est obligatoire.");
        }
        if (dto.getStudentId() == null) {
            throw new IllegalArgumentException("L'étudiant est obligatoire.");
        }
    }

    private void validateStudentMatchesAbsence(Absence absence, User student) {
        if (student.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException("Seuls les étudiants peuvent être associés à une absence.");
        }
        if (!absence.getFilier().equals(student.getFilier()) || !absence.getPromo().equals(student.getPromo())) {
            throw new IllegalArgumentException("L'étudiant ne correspond pas à la filière et à la promo de l'absence.");
        }
    }

    @Override
    public void deleteById(Long id) {
        absenceDetailDao.deleteById(id);
    }
}