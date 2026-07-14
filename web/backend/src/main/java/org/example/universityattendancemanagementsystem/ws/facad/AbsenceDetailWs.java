package org.example.universityattendancemanagementsystem.ws.facad;

import org.example.universityattendancemanagementsystem.ws.dto.AbsenceDetailDto;
import org.example.universityattendancemanagementsystem.service.facad.AbsenceDetailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/uca/absenceDetail/")
public class AbsenceDetailWs {

    private final AbsenceDetailService absenceDetailService;

    public AbsenceDetailWs(AbsenceDetailService absenceDetailService) {
        this.absenceDetailService = absenceDetailService;
    }

    @GetMapping
    public ResponseEntity<List<AbsenceDetailDto>> findAll() {
        return ResponseEntity.ok(absenceDetailService.findAll());
    }

    @GetMapping("absence/{absenceId}")
    public ResponseEntity<List<AbsenceDetailDto>> findByAbsenceId(@PathVariable Long absenceId) {
        return ResponseEntity.ok(absenceDetailService.findByAbsenceId(absenceId));
    }

    @GetMapping("student/{studentId}")
    public ResponseEntity<List<AbsenceDetailDto>> findByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(absenceDetailService.findByStudentId(studentId));
    }

    @GetMapping("cne/{cne}")
    public ResponseEntity<List<AbsenceDetailDto>> findByStudentCne(@PathVariable String cne) {
        return ResponseEntity.ok(absenceDetailService.findByStudentCne(cne));
    }

    @PostMapping
    public ResponseEntity<AbsenceDetailDto> save(@RequestBody AbsenceDetailDto dto) {
        return ResponseEntity.ok(absenceDetailService.save(dto));
    }

    // Enregistrer le push token de l'étudiant
    @PutMapping("push-token/{studentId}")
    public ResponseEntity<Void> savePushToken(@PathVariable Long studentId, @RequestBody java.util.Map<String, String> body) {
        absenceDetailService.savePushToken(studentId, body.get("token"));
        return ResponseEntity.ok().build();
    }

    @PutMapping("{id}")
    public ResponseEntity<AbsenceDetailDto> update(@PathVariable Long id, @RequestBody AbsenceDetailDto dto) {
        return ResponseEntity.ok(absenceDetailService.update(id, dto));
    }

    @DeleteMapping("{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        absenceDetailService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        absenceDetailService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
