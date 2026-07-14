package org.example.universityattendancemanagementsystem.service.impl;

import org.example.universityattendancemanagementsystem.bean.Justification;
import org.example.universityattendancemanagementsystem.bean.JustificationStatut;
import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.dao.AbsenceDetailDao;
import org.example.universityattendancemanagementsystem.dao.JustificationDao;
import org.example.universityattendancemanagementsystem.security.dao.UserDao;
import org.example.universityattendancemanagementsystem.service.facad.JustificationService;
import org.example.universityattendancemanagementsystem.ws.convertir.JustificationConvertir;
import org.example.universityattendancemanagementsystem.ws.dto.JustificationDto;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JustificationServiceImpl implements JustificationService {

    private final JustificationDao justificationDao;
    private final JustificationConvertir justificationConvertir;
    private final UserDao userDao;
    private final AbsenceDetailDao absenceDetailDao;

    public JustificationServiceImpl(JustificationDao justificationDao,
                                    JustificationConvertir justificationConvertir,
                                    UserDao userDao,
                                    AbsenceDetailDao absenceDetailDao) {
        this.justificationDao = justificationDao;
        this.justificationConvertir = justificationConvertir;
        this.userDao = userDao;
        this.absenceDetailDao = absenceDetailDao;
    }

    @Override
    public List<JustificationDto> findAll() {
        return justificationConvertir.toDtoList(justificationDao.findAll());
    }

    @Override
    public Optional<JustificationDto> findById(Long id) {
        return justificationDao.findById(id).map(justificationConvertir::toDto);
    }

    @Override
    public List<JustificationDto> findByStudentId(Long studentId) {
        return justificationConvertir.toDtoList(justificationDao.findByStudentId(studentId));
    }

    @Override
    public List<JustificationDto> findByAbsenceDetailId(Long absenceDetailId) {
        return justificationConvertir.toDtoList(justificationDao.findByAbsenceDetailId(absenceDetailId));
    }

    @Override
    public List<JustificationDto> findByStatut(JustificationStatut statut) {
        return justificationConvertir.toDtoList(justificationDao.findByStatut(statut));
    }

    @Override
    public JustificationDto save(JustificationDto dto) {
        // Vérifier si une justification existe déjà pour cette absence
        List<Justification> existing = justificationDao.findByAbsenceDetailId(dto.getAbsenceDetailId());
        if (!existing.isEmpty()) {
            throw new IllegalArgumentException("Une justification existe déjà pour cette absence.");
        }

        Justification justification = justificationConvertir.toBean(dto);

        User student = userDao.findById(dto.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Étudiant introuvable : " + dto.getStudentId()));
        justification.setStudent(student);

        justification.setAbsenceDetail(
                absenceDetailDao.findById(dto.getAbsenceDetailId())
                        .orElseThrow(() -> new IllegalArgumentException("AbsenceDetail introuvable : " + dto.getAbsenceDetailId()))
        );

        return justificationConvertir.toDto(justificationDao.save(justification));
    }

    @Override
    public JustificationDto updateStatut(Long id, JustificationStatut statut, String motifRefus) {
        Justification justification = justificationDao.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Justification introuvable : " + id));
        justification.setStatut(statut);
        if (statut == JustificationStatut.REFUSE) {
            justification.setMotifRefus(motifRefus);
        }
        return justificationConvertir.toDto(justificationDao.save(justification));
    }

    @Override
    public void deleteById(Long id) {
        justificationDao.deleteById(id);
    }
}
