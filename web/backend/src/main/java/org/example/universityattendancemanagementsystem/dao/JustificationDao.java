package org.example.universityattendancemanagementsystem.dao;

import org.example.universityattendancemanagementsystem.bean.Justification;
import org.example.universityattendancemanagementsystem.bean.JustificationStatut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JustificationDao extends JpaRepository<Justification, Long> {
    List<Justification> findByStudentId(Long studentId);
    List<Justification> findByAbsenceDetailId(Long absenceDetailId);
    List<Justification> findByStatut(JustificationStatut statut);
}
