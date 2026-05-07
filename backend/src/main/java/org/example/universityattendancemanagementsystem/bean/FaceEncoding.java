package org.example.universityattendancemanagementsystem.bean;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class FaceEncoding {

    @Id
    @GeneratedValue
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String encoding;

    private String imagePath;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}