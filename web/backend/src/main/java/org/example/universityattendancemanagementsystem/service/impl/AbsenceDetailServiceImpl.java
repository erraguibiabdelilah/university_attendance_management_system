package org.example.universityattendancemanagementsystem.service.impl;

import org.example.universityattendancemanagementsystem.bean.Absence;
import org.example.universityattendancemanagementsystem.bean.AbsenceDetail;
import org.example.universityattendancemanagementsystem.bean.User;
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
    private final ExpoPushService expoPushService;

    public AbsenceDetailServiceImpl(AbsenceDetailDao absenceDetailDao,
                                    AbsenceDao absenceDao,
                                    UserDao userDao,
                                    AbsenceDetailConvertir absenceDetailConvertir,
                                    ExpoPushService expoPushService) {
        this.absenceDetailDao = absenceDetailDao;
        this.absenceDao = absenceDao;
        this.userDao = userDao;
        this.absenceDetailConvertir = absenceDetailConvertir;
        this.expoPushService = expoPushService;
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
        Absence absence = absenceDao.findById(dto.getAbsenceId())
                .orElseThrow(() -> new RuntimeException("Absence non trouvée avec l'id: " + dto.getAbsenceId()));

        User student = userDao.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé avec l'id: " + dto.getStudentId()));

        AbsenceDetail detail = absenceDetailConvertir.toBean(dto, absence, student);
        AbsenceDetail saved = absenceDetailDao.save(detail);

        // Vérifier si l'étudiant a ≥ 2 absences dans ce module
        if (saved.isEstAbsent()) {
            String nomModule = absence.getNomModule();
            long count = absenceDetailDao.findByStudentId(student.getId())
                    .stream()
                    .filter(d -> d.isEstAbsent() && d.getAbsence().getNomModule().equals(nomModule))
                    .count();

            if (count >= 2 && student.getExpoPushToken() != null) {
                expoPushService.sendNotification(
                    student.getExpoPushToken(),
                    "⚠️ Alerte Absences",
                    "Vous avez " + count + " absence(s) en " + nomModule + ". Pensez à justifier !"
                );
            }
        }

        return absenceDetailConvertir.toDto(saved);
    }

    @Override
    public void savePushToken(Long studentId, String token) {
        User student = userDao.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé: " + studentId));
        student.setExpoPushToken(token);
        userDao.save(student);
    }

    @Override
    public AbsenceDetailDto update(Long id, AbsenceDetailDto dto) {
        AbsenceDetail detail = absenceDetailDao.findById(id)
                .orElseThrow(() -> new RuntimeException("Détail d'absence non trouvé avec l'id: " + id));

        if (dto.getAbsenceId() != null) {
            Absence absence = absenceDao.findById(dto.getAbsenceId())
                    .orElseThrow(() -> new RuntimeException("Absence non trouvée avec l'id: " + dto.getAbsenceId()));
            detail.setAbsence(absence);
        }
        if (dto.getStudentId() != null) {
            User student = userDao.findById(dto.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Étudiant non trouvé avec l'id: " + dto.getStudentId()));
            detail.setStudent(student);
        }
        detail.setEstAbsent(dto.isEstAbsent());

        return absenceDetailConvertir.toDto(absenceDetailDao.save(detail));
    }

    @Override
    public void deleteById(Long id) {
        if (!absenceDetailDao.existsById(id)) {
            throw new RuntimeException("Détail d'absence non trouvé avec l'id: " + id);
        }
        absenceDetailDao.deleteById(id);
    }
}
