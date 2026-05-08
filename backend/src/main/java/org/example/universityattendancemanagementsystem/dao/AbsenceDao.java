package org.example.universityattendancemanagementsystem.dao;

import org.example.universityattendancemanagementsystem.bean.Absence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AbsenceDao extends JpaRepository<Absence, Long> {

    List<Absence> findByTeacherId(Long teacherId);

    List<Absence> findByFilierAndPromo(String filier, String promo);

    List<Absence> findByDate(LocalDateTime date);

    Optional<Absence> findByNomModuleAndFilierAndDate(
            String nomModule,
            String filier,
            LocalDate date
    );
}
