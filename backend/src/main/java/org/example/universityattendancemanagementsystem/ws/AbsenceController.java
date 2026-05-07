package org.example.universityattendancemanagementsystem.ws;

import lombok.Data;
import org.example.universityattendancemanagementsystem.dto.AbsenceDetailDto;
import org.example.universityattendancemanagementsystem.dto.AbsenceDto;
import org.example.universityattendancemanagementsystem.service.AbsenceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/absences")
public class AbsenceController {

    private final AbsenceService absenceService;

    public AbsenceController(AbsenceService absenceService) {
        this.absenceService = absenceService;
    }

    @PostMapping
    public ResponseEntity<AbsenceDto> createAbsence(@RequestBody CreateAbsenceRequest request) {
        AbsenceDto created = absenceService.createAbsence(
                request.getTeacherId(),
                request.getNomModule(),
                request.getFiliere(),
                request.getPromo(),
                request.getTypeSeance(),
                request.getDate(),
                request.getStudentIds()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}/mark")
    public ResponseEntity<AbsenceDto> markAbsences(@PathVariable Long id, @RequestBody MarkAbsenceRequest request) {
        return ResponseEntity.ok(absenceService.markAbsences(id, request.getAbsentStudentIds()));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<AbsenceDto>> getByTeacher(@PathVariable Long teacherId) {
        return ResponseEntity.ok(absenceService.getAbsencesByTeacher(teacherId));
    }

    @GetMapping("/filiere/{filiere}/promo/{promo}")
    public ResponseEntity<List<AbsenceDto>> getByFiliereAndPromo(@PathVariable String filiere, @PathVariable String promo) {
        return ResponseEntity.ok(absenceService.getAbsencesByFiliereAndPromo(filiere, promo));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<List<AbsenceDetailDto>> getDetails(@PathVariable Long id) {
        return ResponseEntity.ok(absenceService.getAbsenceDetails(id));
    }

    @GetMapping("/student/{studentId}/stats")
    public ResponseEntity<Map<String, Long>> getStudentStats(@PathVariable Long studentId) {
        return ResponseEntity.ok(absenceService.countAbsencesByStudent(studentId));
    }

    @Data
    public static class CreateAbsenceRequest {
        private Long teacherId;
        private String nomModule;
        private String filiere;
        private String promo;
        private String typeSeance;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        private LocalDate date;
        private List<Long> studentIds;
    }

    @Data
    public static class MarkAbsenceRequest {
        private List<Long> absentStudentIds;
    }
}
