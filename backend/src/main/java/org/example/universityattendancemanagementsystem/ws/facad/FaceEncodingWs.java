package org.example.universityattendancemanagementsystem.ws.facad;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.universityattendancemanagementsystem.bean.FaceEncoding;
import org.example.universityattendancemanagementsystem.service.facad.FaceEncodingService;
import org.example.universityattendancemanagementsystem.ws.dto.RecognitionRequest;
import org.example.universityattendancemanagementsystem.ws.dto.SaveEncodingRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/face")
@RequiredArgsConstructor
@CrossOrigin("*")
public class FaceEncodingWs {

    private final FaceEncodingService service;

    @PostMapping("/save-encoding")
    public ResponseEntity<?> saveEncoding(@RequestBody SaveEncodingRequest req) {
        try {
            FaceEncoding saved = service.saveEncoding(
                    req.getUserId(),
                    req.getEncoding(),
                    req.getPhotoIndex()
            );

            return ResponseEntity.ok(Map.of(
                    "id", saved.getId(),
                    "userId", req.getUserId(),
                    "photoIndex", saved.getPhotoIndex(),
                    "message", "Encoding sauvegardé"
            ));
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
        }
    }

    @PostMapping("/recognize")
    public ResponseEntity<?> recognize(@RequestBody RecognitionRequest req) {
        try {
            Long userId = service.recognizeFace(req.getEncoding());

            if (userId == null) {

                return ResponseEntity.status(404)
                        .body(Map.of("message", "Visage inconnu"));
            }

            return ResponseEntity.ok(Map.of(
                    "userId", userId,
                    "message", "Visage reconnu"
            ));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<?> getStatus(@PathVariable Long userId) {

        return ResponseEntity.ok(
                Map.of("complete",
                        service.isRegistrationComplete(userId))
        );
    }

    @DeleteMapping("/reset/{userId}")
    public ResponseEntity<?> reset(@PathVariable Long userId) {

        service.resetEncodings(userId);

        return ResponseEntity.ok(
                Map.of("message", "Reset effectué")
        );
    }
}
