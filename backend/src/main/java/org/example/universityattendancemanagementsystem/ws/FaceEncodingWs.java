package org.example.universityattendancemanagementsystem.ws;

import org.example.universityattendancemanagementsystem.bean.FaceEncoding;
import org.example.universityattendancemanagementsystem.service.facad.FaceEncodingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/encodings")
public class FaceEncodingWs {

    @Autowired
    private FaceEncodingService service;

    // Ajouter encoding
    @PostMapping("/add")
    public ResponseEntity<?> addEncoding(@RequestParam Long userId,
                                         @RequestParam String encoding,
                                         @RequestParam(required = false) String imagePath) {

        return ResponseEntity.ok(
                service.saveEncoding(userId, encoding, imagePath)
        );
    }

    // Récupérer encodings d’un user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FaceEncoding>> getUserEncodings(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getEncodingsByUser(userId));
    }

    // Supprimer encoding
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.deleteEncoding(id);
        return ResponseEntity.ok("Deleted");
    }

    // tous les encodings
    @GetMapping("/")
    public ResponseEntity<List<FaceEncoding>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }
}