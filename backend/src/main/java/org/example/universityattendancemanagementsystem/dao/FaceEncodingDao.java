package org.example.universityattendancemanagementsystem.dao;

import org.example.universityattendancemanagementsystem.bean.FaceEncoding;
import org.example.universityattendancemanagementsystem.bean.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FaceEncodingDao  extends JpaRepository<FaceEncoding,Long> {
    List<FaceEncoding> findByUser(User user);

    long countByUser(User user);

    boolean existsByUserAndPhotoIndex(User user, Integer photoIndex);

    @Query("SELECT fe FROM FaceEncoding fe WHERE fe.user.id = :userId ORDER BY fe.photoIndex")
    List<FaceEncoding> findByUserId(@Param("userId") Long userId);

    void deleteByUser(User user);

    List<FaceEncoding> findAll();
}