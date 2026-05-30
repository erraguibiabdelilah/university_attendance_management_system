package org.example.universityattendancemanagementsystem.dao;

import org.example.universityattendancemanagementsystem.bean.Role;
import org.example.universityattendancemanagementsystem.bean.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StatisticsDao extends JpaRepository<User, Long> {

    // Nombre d'utilisateurs par rôle
    long countByRole(Role role);

    // Liste des filières distinctes des étudiants
    @Query("SELECT DISTINCT u.filier FROM User u WHERE u.role = 'STUDENT' AND u.filier IS NOT NULL")
    List<String> findDistinctFilieres();
}
