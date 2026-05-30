package org.example.universityattendancemanagementsystem.service.impl;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.universityattendancemanagementsystem.bean.FaceEncoding;
import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.dao.FaceEncodingDao;

import org.example.universityattendancemanagementsystem.security.dao.UserDao;
import org.example.universityattendancemanagementsystem.service.facad.FaceEncodingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FaceEncodingServiceImpl implements FaceEncodingService {

    private static final int EXPECTED_DIMENSIONS = 128;

    private final FaceEncodingDao faceEncodingDao;
    private final UserDao userDao;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private List<Double> parseEncoding(String encodingRaw) {
        if (encodingRaw == null || encodingRaw.trim().isEmpty()) {
            throw new IllegalArgumentException("L'encoding ne peut pas être null ou vide");
        }
        String cleaned = encodingRaw.trim();
        try {
            if (cleaned.startsWith("[")) {
                return objectMapper.readValue(cleaned, new TypeReference<List<Double>>() {});
            } else {
                throw new IllegalArgumentException("Format invalide : doit commencer par '['");
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Impossible de parser l'encoding JSON", e);
        }
    }

    private void validateDimensions(List<Double> encoding) {
        if (encoding.size() != EXPECTED_DIMENSIONS) {
            throw new IllegalArgumentException(
                    "L'encoding doit avoir " + EXPECTED_DIMENSIONS + " dimensions, reçu : " + encoding.size()
            );
        }
    }

    private String serializeEncoding(List<Double> encoding) {
        try {
            return objectMapper.writeValueAsString(encoding);
        } catch (Exception e) {
            throw new IllegalStateException("Erreur sérialisation encoding", e);
        }
    }

    @Override
    @Transactional
    public FaceEncoding saveEncoding(Long userId, String encodingRaw) {
        log.debug("Sauvegarde encoding pour userId={}", userId);

        User user = userDao.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé : " + userId));

        List<Double> encoding = parseEncoding(encodingRaw);
        validateDimensions(encoding);

        // Vérifie si un encoding existe déjà
        FaceEncoding existing = faceEncodingDao.findByUserId(userId);

        if (existing != null) {
            log.info("Mise à jour encoding existant userId={}", userId);
            existing.setEncoding(serializeEncoding(encoding));
            return faceEncodingDao.save(existing);
        }

        FaceEncoding faceEncoding = new FaceEncoding();
        faceEncoding.setUser(user);
        faceEncoding.setEncoding(serializeEncoding(encoding));

        log.info("Nouvel encoding créé userId={}", userId);
        return faceEncodingDao.save(faceEncoding);
    }

    @Override
    @Transactional(readOnly = true)
    public Long recognizeFace(String encodingRaw) {
        List<Double> targetEncoding = parseEncoding(encodingRaw);
        validateDimensions(targetEncoding);

        List<FaceEncoding> allEncodings = faceEncodingDao.findAll();
        Long bestMatchUserId = null;
        double bestDistance = Double.MAX_VALUE;
        final double THRESHOLD = 0.6;

        for (FaceEncoding fe : allEncodings) {
            List<Double> storedEncoding = parseEncoding(fe.getEncoding());
            double distance = calculateEuclideanDistance(targetEncoding, storedEncoding);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestMatchUserId = fe.getUser().getId();
            }
        }

        return bestDistance > THRESHOLD ? null : bestMatchUserId;
    }

    private double calculateEuclideanDistance(List<Double> a, List<Double> b) {
        double sum = 0.0;
        for (int i = 0; i < a.size(); i++) {
            double diff = a.get(i) - b.get(i);
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }

    @Override
    @Transactional
    public void deleteEncoding(Long userId) {
        log.info("Suppression encoding pour userId={}", userId);
        faceEncodingDao.deleteByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasEncoding(Long userId) {
        return faceEncodingDao.existsByUserId(userId);
    }
}