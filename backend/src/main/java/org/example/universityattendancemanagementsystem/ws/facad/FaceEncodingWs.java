package org.example.universityattendancemanagementsystem.ws.facad;

import lombok.RequiredArgsConstructor;
import org.example.universityattendancemanagementsystem.bean.FaceEncoding;
import org.example.universityattendancemanagementsystem.service.facad.FaceEncodingService;
import org.example.universityattendancemanagementsystem.ws.dto.RecognitionRequest;
import org.example.universityattendancemanagementsystem.ws.dto.SaveEncodingRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/face")
@RequiredArgsConstructor
public class FaceEncodingWs {

    private final FaceEncodingService service;

    @PostMapping("/save/encoding")
    public ResponseEntity<?> saveEncoding(@RequestBody SaveEncodingRequest req) {
        FaceEncoding saved = service.saveEncoding(req.getUserId(), req.getEncoding());
        return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "userId", req.getUserId(),
                "createdAt", saved.getCreatedAt()
        ));
    }

    @PostMapping("/recognize")
    public ResponseEntity<?> recognize(@RequestBody RecognitionRequest req) {
        Long userId = service.recognizeFace(req.getEncoding());
        if (userId == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Visage inconnu"));
        }
        return ResponseEntity.ok(Map.of("userId", userId, "message", "Visage reconnu"));
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<?> getStatus(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("hasEncoding", service.hasEncoding(userId)));
    }

    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<?> delete(@PathVariable Long userId) {
        service.deleteEncoding(userId);
        return ResponseEntity.ok(Map.of("message", "Encoding supprimé"));
    }
}