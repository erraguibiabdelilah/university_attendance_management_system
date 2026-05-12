package org.example.universityattendancemanagementsystem.ws.facad;

import org.example.universityattendancemanagementsystem.service.facad.AbsenceDetailService;
import org.example.universityattendancemanagementsystem.ws.dto.AbsenceDetailDto;
import org.example.universityattendancemanagementsystem.ws.dto.AbsenceDto;
import org.example.universityattendancemanagementsystem.service.facad.AbsenceService;
import org.example.universityattendancemanagementsystem.ws.dto.AbsencePyloadDto;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/uca/absence/")
public class AbsenceWs {

    private final AbsenceService absenceService;
    private final AbsenceDetailService absenceDetailService;


    public AbsenceWs(AbsenceService absenceService , AbsenceDetailService absenceDetailService) {
        this.absenceService = absenceService;
        this.absenceDetailService=absenceDetailService;
    }

    @GetMapping
    public ResponseEntity<List<AbsenceDto>> findAll() {
        return ResponseEntity.ok(absenceService.findAll());
    }

    @GetMapping("teacher/{teacherId}")
    public ResponseEntity<List<AbsenceDto>> findByTeacherId(@PathVariable Long teacherId) {
        return ResponseEntity.ok(absenceService.findByTeacherId(teacherId));
    }

    @GetMapping("filiere/promo/{filiere}/{promo}")
    public ResponseEntity<List<AbsenceDto>> findByFiliereAndPromo(
            @PathVariable String filiere,
            @PathVariable String promo) {
        return ResponseEntity.ok(absenceService.findByFiliereAndPromo(filiere, promo));
    }

    @GetMapping("date/{date}")
    public ResponseEntity<List<AbsenceDto>> findByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date) {
        return ResponseEntity.ok(absenceService.findByDate(date));
    }

    @GetMapping("search/{nomModule}/{filiere}/{date}")
    public ResponseEntity<Optional<AbsenceDto>> findByNomModuleAndFiliereAndDate(
            @PathVariable String nomModule,
            @PathVariable String filiere,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(absenceService.findByNomModuleAndFiliereAndDate(nomModule, filiere, date));
    }

    @PostMapping
    public int save(@RequestBody AbsencePyloadDto pyload) {
        AbsenceDto  savedAbsence = absenceService.save(pyload.getAbsence());
        for (AbsenceDetailDto elmt : pyload.getDetails()) {
        elmt.setAbsenceId(savedAbsence.getId());
        absenceDetailService.save(elmt); }
         return 1;
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        absenceService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
