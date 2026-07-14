package org.example.universityattendancemanagementsystem.ws.facad;

import org.example.universityattendancemanagementsystem.bean.JustificationStatut;
import org.example.universityattendancemanagementsystem.service.facad.JustificationService;
import org.example.universityattendancemanagementsystem.service.impl.CloudinaryService;
import org.example.universityattendancemanagementsystem.ws.dto.JustificationDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/uca/justification/")
public class JustificationWs {

    private final JustificationService justificationService;
    private final CloudinaryService cloudinaryService;
    private static final String UPLOAD_DIR = "uploads/justifications/";

    public JustificationWs(JustificationService justificationService, CloudinaryService cloudinaryService) {
        this.justificationService = justificationService;
        this.cloudinaryService = cloudinaryService;
    }

    @GetMapping
    public ResponseEntity<List<JustificationDto>> findAll() {
        return ResponseEntity.ok(justificationService.findAll());
    }

    @GetMapping("{id}")
    public ResponseEntity<JustificationDto> findById(@PathVariable Long id) {
        return justificationService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("student/{studentId}")
    public ResponseEntity<List<JustificationDto>> findByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(justificationService.findByStudentId(studentId));
    }

    @GetMapping("absence-detail/{absenceDetailId}")
    public ResponseEntity<List<JustificationDto>> findByAbsenceDetailId(@PathVariable Long absenceDetailId) {
        return ResponseEntity.ok(justificationService.findByAbsenceDetailId(absenceDetailId));
    }

    @GetMapping("statut/{statut}")
    public ResponseEntity<List<JustificationDto>> findByStatut(@PathVariable JustificationStatut statut) {
        return ResponseEntity.ok(justificationService.findByStatut(statut));
    }

    // POST avec upload de fichier
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<JustificationDto> save(
            @RequestParam("absenceDetailId") Long absenceDetailId,
            @RequestParam("studentId") Long studentId,
            @RequestParam("motif") String motif,
            @RequestParam(value = "commentaire", required = false) String commentaire,
            @RequestParam("file") MultipartFile file) throws IOException {

        // Upload vers Cloudinary
        String fichierUrl = cloudinaryService.upload(file);

        JustificationDto dto = JustificationDto.builder()
                .absenceDetailId(absenceDetailId)
                .studentId(studentId)
                .motif(motif)
                .commentaire(commentaire)
                .fichierUrl(fichierUrl)
                .statut(JustificationStatut.EN_ATTENTE)
                .build();

        return ResponseEntity.ok(justificationService.save(dto));
    }

    // PUT — valider ou refuser
    @PutMapping("{id}/statut")
    public ResponseEntity<JustificationDto> updateStatut(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        JustificationStatut statut = JustificationStatut.valueOf(body.get("statut"));
        String motifRefus = body.get("motifRefus");
        return ResponseEntity.ok(justificationService.updateStatut(id, statut, motifRefus));
    }

    @DeleteMapping("{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        justificationService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
