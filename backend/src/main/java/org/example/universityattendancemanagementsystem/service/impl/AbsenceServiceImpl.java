package org.example.universityattendancemanagementsystem.service.impl;

import org.example.universityattendancemanagementsystem.bean.Absence;
import org.example.universityattendancemanagementsystem.dao.AbsenceDao;
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

    public AbsenceServiceImpl(AbsenceDao absenceDao,
                              AbsenceConvertir absenceConvertir) {
        this.absenceDao = absenceDao;
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
    public void deleteById(Long id) {
        absenceDao.deleteById(id);
    }
}