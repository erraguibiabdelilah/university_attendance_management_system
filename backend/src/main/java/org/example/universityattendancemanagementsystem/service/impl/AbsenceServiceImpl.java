package org.example.universityattendancemanagementsystem.service.impl;

import org.example.universityattendancemanagementsystem.bean.Absence;
import org.example.universityattendancemanagementsystem.bean.AbsenceDetail;
import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.dao.AbsenceDetailDao;
import org.example.universityattendancemanagementsystem.dao.AbsenceDao;
import org.example.universityattendancemanagementsystem.security.dao.UserDao;
import org.example.universityattendancemanagementsystem.service.facad.AbsenceService;
import org.example.universityattendancemanagementsystem.ws.convertir.AbsenceConvertir;
import org.example.universityattendancemanagementsystem.ws.dto.AbsenceDetailDto;
import org.example.universityattendancemanagementsystem.ws.dto.AbsenceDto;
import org.example.universityattendancemanagementsystem.ws.dto.AbsencePyloadDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AbsenceServiceImpl implements AbsenceService {

    private final AbsenceDao absenceDao;
    private final AbsenceDetailDao absenceDetailDao;
    private final UserDao userDao;
    private final AbsenceConvertir absenceConvertir;

    public AbsenceServiceImpl(AbsenceDao absenceDao,
                              AbsenceDetailDao absenceDetailDao,
                              UserDao userDao,
                              AbsenceConvertir absenceConvertir) {
        this.absenceDao = absenceDao;
        this.absenceDetailDao = absenceDetailDao;
        this.userDao = userDao;
        this.absenceConvertir = absenceConvertir;
    }

    @Override
    public Optional<AbsenceDto> findByNomModuleAndFiliereAndDate(String nomModule, String filiere, LocalDate date) {
        return absenceDao.findByNomModuleAndFilierAndDate(nomModule, filiere, date)
                .map(absenceConvertir::toDto);
    }

    @Override
    public List<AbsenceDto> findByDate(LocalDateTime date) {
        return absenceConvertir.toDtoList(absenceDao.findByDate(date));
    }

    @Override
    public List<AbsenceDto> findByFiliereAndPromo(String filiere, String promo) {
        return absenceConvertir.toDtoList(absenceDao.findByFilierAndPromo(filiere, promo));
    }

    @Override
    public List<AbsenceDto> findByTeacherId(Long teacherId) {
        return absenceConvertir.toDtoList(absenceDao.findByTeacherId(teacherId));
    }

    @Override
    public List<AbsenceDto> findAll() {
        return absenceConvertir.toDtoList(absenceDao.findAll());
    }

    @Override
    public AbsenceDto save(AbsenceDto dto) {
        Absence absence = absenceConvertir.toBean(dto);
        Absence saved = absenceDao.save(absence);
        return absenceConvertir.toDto(saved);
    }

    @Override
    @Transactional
    public AbsenceDto update(Long id, AbsenceDto dto) {
        Absence absence = absenceDao.findById(id)
                .orElseThrow(() -> new RuntimeException("Absence non trouvée avec l'id: " + id));

        updateAbsenceFields(absence, dto);

        return absenceConvertir.toDto(absenceDao.save(absence));
    }

    @Override
    @Transactional
    public AbsenceDto updateWithDetails(Long id, AbsencePyloadDto payload) {
        if (payload == null || payload.getAbsence() == null) {
            throw new RuntimeException("Payload absence invalide");
        }

        Absence absence = absenceDao.findById(id)
                .orElseThrow(() -> new RuntimeException("Absence non trouvée avec l'id: " + id));

        updateAbsenceFields(absence, payload.getAbsence());
        Absence savedAbsence = absenceDao.save(absence);

        if (payload.getDetails() != null) {
            syncAbsenceDetails(savedAbsence, payload.getDetails());
        }

        return absenceConvertir.toDto(savedAbsence);
    }

    private void updateAbsenceFields(Absence absence, AbsenceDto dto) {
        if (dto.getTeacherId() != null) {
            User teacher = userDao.findById(dto.getTeacherId())
                    .orElseThrow(() -> new RuntimeException("Enseignant non trouvé avec l'id: " + dto.getTeacherId()));
            absence.setTeacher(teacher);
        }
        absence.setNomModule(dto.getNomModule());
        absence.setFilier(dto.getFiliere());
        absence.setPromo(dto.getPromo());
        absence.setTypeSeance(dto.getTypeSeance());
        absence.setDate(dto.getDate());
    }

    private void syncAbsenceDetails(Absence absence, List<AbsenceDetailDto> details) {
        List<AbsenceDetail> currentDetails = absenceDetailDao.findByAbsenceId(absence.getId());
        Set<Long> payloadIds = details.stream()
                .map(AbsenceDetailDto::getId)
                .filter(detailId -> detailId != null)
                .collect(Collectors.toSet());

        List<Long> idsToDelete = currentDetails.stream()
                .map(AbsenceDetail::getId)
                .filter(detailId -> !payloadIds.contains(detailId))
                .toList();
        absenceDetailDao.deleteAllById(idsToDelete);

        for (AbsenceDetailDto detailDto : details) {
            AbsenceDetail detail = resolveAbsenceDetail(absence, detailDto);
            detail.setAbsence(absence);
            detail.setStudent(resolveStudent(detailDto.getStudentId()));
            detail.setEstAbsent(detailDto.isEstAbsent());
            absenceDetailDao.save(detail);
        }
    }

    private AbsenceDetail resolveAbsenceDetail(Absence absence, AbsenceDetailDto detailDto) {
        if (detailDto.getId() == null) {
            return new AbsenceDetail();
        }

        AbsenceDetail detail = absenceDetailDao.findById(detailDto.getId())
                .orElseThrow(() -> new RuntimeException("Détail d'absence non trouvé avec l'id: " + detailDto.getId()));
        if (!detail.getAbsence().getId().equals(absence.getId())) {
            throw new RuntimeException("Le détail d'absence " + detailDto.getId() + " n'appartient pas à l'absence " + absence.getId());
        }
        return detail;
    }

    private User resolveStudent(Long studentId) {
        if (studentId == null) {
            throw new RuntimeException("Étudiant obligatoire pour le détail d'absence");
        }
        return userDao.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé avec l'id: " + studentId));
    }

    @Override
    public void deleteById(Long id) {
        if (!absenceDao.existsById(id)) {
            throw new RuntimeException("Absence non trouvée avec l'id: " + id);
        }
        absenceDao.deleteById(id);
    }
}
