package org.example.universityattendancemanagementsystem.ws.convertir;

import org.example.universityattendancemanagementsystem.bean.AbsenceDetail;
import org.example.universityattendancemanagementsystem.bean.Justification;
import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.ws.dto.JustificationDto;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class JustificationConvertir {

    public JustificationDto toDto(Justification j) {
        if (j == null) return null;
        return JustificationDto.builder()
                .id(j.getId())
                .absenceDetailId(j.getAbsenceDetail().getId())
                .studentId(j.getStudent().getId())
                .studentFirstName(j.getStudent().getFirstName())
                .studentLastName(j.getStudent().getLastName())
                .studentCne(j.getStudent().getCne())
                .fichierUrl(j.getFichierUrl())
                .motif(j.getMotif())
                .commentaire(j.getCommentaire())
                .dateDepot(j.getDateDepot())
                .statut(j.getStatut())
                .motifRefus(j.getMotifRefus())
                .build();
    }

    public Justification toBean(JustificationDto dto) {
        if (dto == null) return null;

        AbsenceDetail absenceDetail = new AbsenceDetail();
        absenceDetail.setId(dto.getAbsenceDetailId());

        User student = new User();
        student.setId(dto.getStudentId());

        return Justification.builder()
                .id(dto.getId())
                .absenceDetail(absenceDetail)
                .student(student)
                .fichierUrl(dto.getFichierUrl())
                .motif(dto.getMotif())
                .commentaire(dto.getCommentaire())
                .statut(dto.getStatut())
                .motifRefus(dto.getMotifRefus())
                .build();
    }

    public List<JustificationDto> toDtoList(List<Justification> list) {
        if (list == null) return new ArrayList<>();
        return list.stream().map(this::toDto).toList();
    }
}
