package org.example.universityattendancemanagementsystem.service.facad;

import org.example.universityattendancemanagementsystem.bean.FaceEncoding;
import org.springframework.transaction.annotation.Transactional;

public interface FaceEncodingService {

    FaceEncoding saveEncoding(Long userId, String encoding);

    Long recognizeFace(String encoding);


    @Transactional
    void deleteEncoding(Long userId);

    @Transactional(readOnly = true)
    boolean hasEncoding(Long userId);
}