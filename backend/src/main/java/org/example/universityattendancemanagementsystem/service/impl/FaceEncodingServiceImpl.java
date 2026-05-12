package org.example.universityattendancemanagementsystem.service.impl;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.universityattendancemanagementsystem.bean.FaceEncoding;
import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.dao.FaceEncodingDao;
import org.example.universityattendancemanagementsystem.security.dao.UserDao;
import org.example.universityattendancemanagementsystem.service.facad.FaceEncodingService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
@Service
@RequiredArgsConstructor
public class FaceEncodingServiceImpl implements FaceEncodingService {

    private final FaceEncodingDao repository;
    private final UserDao userRepository;

    private static final int MAX_PHOTOS = 3;

    @Override
    public FaceEncoding saveEncoding(Long userId, String encodingJson, Integer photoIndex) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable"));

        if (repository.countByUser(user) >= MAX_PHOTOS) {
            throw new IllegalStateException("Maximum atteint.");
        }

        FaceEncoding fe = new FaceEncoding();

        fe.setUser(user);
        fe.setEncoding(encodingJson);
        fe.setPhotoIndex(photoIndex);

        return repository.save(fe);
    }

    @Override
    public boolean isRegistrationComplete(Long userId) {

        User user = userRepository.findById(userId).orElseThrow();

        return repository.countByUser(user) == MAX_PHOTOS;
    }

    @Override
    public List<FaceEncoding> getUserEncodings(Long userId) {
        return repository.findByUserId(userId);
    }

    @Override
    @Transactional
    public void resetEncodings(Long userId) {

        User user = userRepository.findById(userId).orElseThrow();

        repository.deleteByUser(user);
    }

    // ===============================
    // RECONNAISSANCE FACIALE
    // ===============================

    @Override
    public Long recognizeFace(String encodingJson) {

        double[] target = parseEncoding(encodingJson);

        List<FaceEncoding> all = repository.findAll();

        double minDistance = Double.MAX_VALUE;

        Long matchedUserId = null;

        for (FaceEncoding fe : all) {

            double[] dbEncoding = parseEncoding(fe.getEncoding());

            double distance = calculateDistance(target, dbEncoding);

            if (distance < 0.6 && distance < minDistance) {

                minDistance = distance;

                matchedUserId = fe.getUser().getId();
            }
        }

        return matchedUserId;
    }

    // ===============================
    // UTILITIES
    // ===============================

    private double[] parseEncoding(String json) {

        json = json.replace("[", "").replace("]", "");

        return Arrays.stream(json.split(","))
                .mapToDouble(Double::parseDouble)
                .toArray();
    }

    private double calculateDistance(double[] a, double[] b) {

        double sum = 0;

        for (int i = 0; i < a.length; i++) {

            sum += Math.pow(a[i] - b[i], 2);
        }

        return Math.sqrt(sum);
    }
}