package org.example.universityattendancemanagementsystem.dao;

import org.example.universityattendancemanagementsystem.bean.AbsenceDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AbsenceDetailRepository extends JpaRepository<AbsenceDetail, Long> {
    List<AbsenceDetail> findByAbsenceId(Long absenceId);

    List<AbsenceDetail> findByStudentId(Long studentId);
}
