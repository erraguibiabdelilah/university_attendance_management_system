package org.example.universityattendancemanagementsystem.dao;

import org.example.universityattendancemanagementsystem.bean.AbsenceDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AbsenceDetailDao extends JpaRepository<AbsenceDetail, Long> {
    List<AbsenceDetail> findByAbsenceId(Long absenceId);
    List<AbsenceDetail> findByStudentId(Long studentId);
    List<AbsenceDetail> findByStudentCne(String sne);

    @Query("SELECT d FROM AbsenceDetail d JOIN FETCH d.absence WHERE d.student.id = :studentId")
    List<AbsenceDetail> findByStudentIdWithAbsence(@Param("studentId") Long studentId);
}