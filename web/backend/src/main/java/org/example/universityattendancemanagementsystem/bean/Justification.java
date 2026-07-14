package org.example.universityattendancemanagementsystem.bean;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Justification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "absence_detail_id", nullable = false)
    private AbsenceDetail absenceDetail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(nullable = false)
    private String fichierUrl;

    private String motif;

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateDepot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private JustificationStatut statut = JustificationStatut.EN_ATTENTE;

    @Column(columnDefinition = "TEXT")
    private String motifRefus;
}
