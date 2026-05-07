package org.example.universityattendancemanagementsystem.dao;

import org.example.universityattendancemanagementsystem.bean.Absence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AbsenceRepository extends JpaRepository<Absence, Long> {
    List<Absence> findByTeacherId(Long teacherId);

    List<Absence> findByFiliereAndPromo(String filiere, String promo);

    List<Absence> findByDate(LocalDateTime date);
}
