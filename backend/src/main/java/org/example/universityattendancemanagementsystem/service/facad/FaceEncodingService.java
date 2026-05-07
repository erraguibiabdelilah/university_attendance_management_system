package org.example.universityattendancemanagementsystem.service.facad;

import org.example.universityattendancemanagementsystem.bean.FaceEncoding;

import java.util.List;

public interface FaceEncodingService {

    // Ajouter un encoding
    FaceEncoding saveEncoding(Long userId, String encoding, String imagePath);

    // Récupérer encodings d’un user
    List<FaceEncoding> getEncodingsByUser(Long userId);

    // Supprimer encoding
    void deleteEncoding(Long id);

    // Tous les encodings
    List<FaceEncoding> getAll();
}
