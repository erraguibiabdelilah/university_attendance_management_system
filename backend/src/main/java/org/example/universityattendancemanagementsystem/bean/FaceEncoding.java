package org.example.universityattendancemanagementsystem.bean;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.universityattendancemanagementsystem.bean.User;

import java.time.LocalDateTime;
@Entity
@Data
@NoArgsConstructor
public class FaceEncoding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Vecteur JSON 128 dimensions uniquement, pas d'image
    @Column(columnDefinition = "TEXT", nullable = false)
    private String encoding;

    @Column(nullable = false)
    private Integer photoIndex; // 1, 2 ou 3

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}