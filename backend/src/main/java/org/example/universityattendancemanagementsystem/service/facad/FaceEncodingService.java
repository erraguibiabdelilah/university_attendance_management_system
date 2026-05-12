package org.example.universityattendancemanagementsystem.service.facad;

import org.example.universityattendancemanagementsystem.bean.FaceEncoding;

import java.util.List;

public interface FaceEncodingService {

    // Ajouter un encoding
    FaceEncoding saveEncoding(Long userId, String encoding, Integer photoIndex);

    boolean isRegistrationComplete(Long userId);

    List<FaceEncoding> getUserEncodings(Long userId);

    void resetEncodings(Long userId);

    Long recognizeFace(String encoding);

}
