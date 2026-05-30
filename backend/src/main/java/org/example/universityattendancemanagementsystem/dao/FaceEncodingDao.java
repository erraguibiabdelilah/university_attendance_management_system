package org.example.universityattendancemanagementsystem.dao;

import org.example.universityattendancemanagementsystem.bean.FaceEncoding;
import org.example.universityattendancemanagementsystem.bean.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FaceEncodingDao extends JpaRepository<FaceEncoding, Long> {

    FaceEncoding findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    void deleteByUserId(Long userId);
}