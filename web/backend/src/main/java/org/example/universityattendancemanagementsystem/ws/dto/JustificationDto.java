package org.example.universityattendancemanagementsystem.ws.dto;

import lombok.*;
import org.example.universityattendancemanagementsystem.bean.JustificationStatut;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JustificationDto {
    private Long id;
    private Long absenceDetailId;
    private Long studentId;
    private String studentFirstName;
    private String studentLastName;
    private String studentCne;
    private String fichierUrl;
    private String motif;
    private String commentaire;
    private LocalDateTime dateDepot;
    private JustificationStatut statut;
    private String motifRefus;
}
