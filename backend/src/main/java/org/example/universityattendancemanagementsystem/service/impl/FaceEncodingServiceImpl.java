package org.example.universityattendancemanagementsystem.service.impl;

import org.example.universityattendancemanagementsystem.bean.FaceEncoding;
import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.dao.FaceEncodingDao;
import org.example.universityattendancemanagementsystem.security.dao.UserDao;
import org.example.universityattendancemanagementsystem.service.facad.FaceEncodingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service

public class FaceEncodingServiceImpl implements FaceEncodingService {


    @Autowired
    private FaceEncodingDao repository;

    @Autowired
    private UserDao userRepository;

    // Ajouter un encoding
    @Override
    public FaceEncoding saveEncoding(Long userId, String encoding, String imagePath) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FaceEncoding fe = new FaceEncoding();
        fe.setEncoding(encoding);
        fe.setImagePath(imagePath);
        fe.setUser(user);

        return repository.save(fe);
    }
    @Override
    public List<FaceEncoding> getEncodingsByUser(Long userId) {
        return repository.findByUserId(userId);
    }
    @Override
    public void deleteEncoding(Long id) {
        repository.deleteById(id);
    }
    @Override
    public List<FaceEncoding> getAll() {
        return repository.findAll();
    }
}