package org.example.universityattendancemanagementsystem.dao;

import org.example.universityattendancemanagementsystem.bean.FaceEncoding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FaceEncodingDao  extends JpaRepository<FaceEncoding,Long> {

    List<FaceEncoding> findByUserId(Long userId);
}
