package org.example.universityattendancemanagementsystem.service.impl;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.universityattendancemanagementsystem.bean.FaceEncoding;
import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.dao.FaceEncodingDao;
import org.example.universityattendancemanagementsystem.security.dao.UserDao;
import org.example.universityattendancemanagementsystem.service.facad.FaceEncodingService;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FaceEncodingServiceImpl implements FaceEncodingService {

    private final FaceEncodingDao repository;
    private final UserDao userRepository;

    private static final int MAX_PHOTOS = 3;
    private static final int ENCODING_SIZE = 128;
    private static final double MATCH_THRESHOLD = 0.6;

    @Override
    public FaceEncoding saveEncoding(Long userId, String encodingJson, Integer photoIndex) {
        validateSaveRequest(userId, encodingJson, photoIndex);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable"));

        if (repository.existsByUserAndPhotoIndex(user, photoIndex)) {
            throw new IllegalStateException("Un encoding existe déjà pour cette photo.");
        }

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

            if (distance < MATCH_THRESHOLD && distance < minDistance) {

                minDistance = distance;

                matchedUserId = fe.getUser().getId();
            }
        }

        return matchedUserId;
    }

    // ===============================
    // UTILITIES
    // ===============================

    private void validateSaveRequest(Long userId, String encodingJson, Integer photoIndex) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("userId invalide.");
        }

        if (photoIndex == null || photoIndex < 1 || photoIndex > MAX_PHOTOS) {
            throw new IllegalArgumentException("photoIndex doit être entre 1 et 3.");
        }

        parseEncoding(encodingJson);
    }

    private double[] parseEncoding(String json) {
        if (json == null || json.isBlank()) {
            throw new IllegalArgumentException("Encoding vide.");
        }

        String normalized = json.trim();

        if (!normalized.startsWith("[") || !normalized.endsWith("]")) {
            throw new IllegalArgumentException("Encoding JSON invalide.");
        }

        double[] values = Arrays.stream(normalized.substring(1, normalized.length() - 1).split(","))
                .map(String::trim)
                .mapToDouble(Double::parseDouble)
                .toArray();

        if (values.length != ENCODING_SIZE) {
            throw new IllegalArgumentException("Encoding doit contenir 128 valeurs.");
        }

        return values;
    }

    private double calculateDistance(double[] a, double[] b) {
        if (a.length != b.length) {
            throw new IllegalArgumentException("Les encodings doivent avoir la même dimension.");
        }

        double sum = 0;

        for (int i = 0; i < a.length; i++) {

            sum += Math.pow(a[i] - b[i], 2);
        }

        return Math.sqrt(sum);
    }
}
