package org.example.universityattendancemanagementsystem.service.impl;

import org.example.universityattendancemanagementsystem.bean.Absence;
import org.example.universityattendancemanagementsystem.bean.Role;
import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.dao.AbsenceDao;
import org.example.universityattendancemanagementsystem.security.dao.UserDao;
import org.example.universityattendancemanagementsystem.service.facad.AbsenceService;
import org.example.universityattendancemanagementsystem.ws.convertir.AbsenceConvertir;
import org.example.universityattendancemanagementsystem.ws.dto.AbsenceDto;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AbsenceServiceImpl implements AbsenceService {

    private final AbsenceDao absenceDao;
    private final AbsenceConvertir absenceConvertir;
    private final UserDao userDao;

    public AbsenceServiceImpl(AbsenceDao absenceDao,
                              AbsenceConvertir absenceConvertir,
                              UserDao userDao) {
        this.absenceDao = absenceDao;
        this.absenceConvertir = absenceConvertir;
        this.userDao = userDao;
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
        validateAbsence(dto);

        User teacher = userDao.findById(dto.getTeacherId())
                .orElseThrow(() -> new IllegalArgumentException("Enseignant non trouvé avec l'id: " + dto.getTeacherId()));
        if (teacher.getRole() != Role.TEACHER) {
            throw new IllegalArgumentException("L'utilisateur sélectionné doit être un enseignant.");
        }

        Absence absence = absenceConvertir.toBean(dto);
        Absence saved = absenceDao.save(absence);
        return absenceConvertir.toDto(saved);
    }

    private void validateAbsence(AbsenceDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Les informations de l'absence sont obligatoires.");
        }
        if (dto.getTeacherId() == null) {
            throw new IllegalArgumentException("L'enseignant est obligatoire.");
        }
        if (isBlank(dto.getFiliere())) {
            throw new IllegalArgumentException("La filière est obligatoire.");
        }
        if (isBlank(dto.getNomModule())) {
            throw new IllegalArgumentException("Le module est obligatoire.");
        }
        if (isBlank(dto.getPromo())) {
            throw new IllegalArgumentException("La promo est obligatoire.");
        }
        if (dto.getDate() == null) {
            throw new IllegalArgumentException("La date est obligatoire.");
        }
        if (isBlank(dto.getTypeSeance())) {
            dto.setTypeSeance("COURS");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    @Override
    public void deleteById(Long id) {
        absenceDao.deleteById(id);
    }
}