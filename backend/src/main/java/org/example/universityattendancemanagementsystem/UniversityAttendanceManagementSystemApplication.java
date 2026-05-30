package org.example.universityattendancemanagementsystem;

import org.example.universityattendancemanagementsystem.bean.Role;
import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.security.dao.UserDao;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class UniversityAttendanceManagementSystemApplication implements CommandLineRunner {

    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder;

    public UniversityAttendanceManagementSystemApplication(
            UserDao userDao,
            PasswordEncoder passwordEncoder
    ) {
        this.userDao = userDao;
        this.passwordEncoder = passwordEncoder;
    }

    public static void main(String[] args) {
        SpringApplication.run(UniversityAttendanceManagementSystemApplication.class, args);
    }
@Override
public void run(String... args) {

    if (!userDao.existsByUsername("admin@123")) {
        User admin = new User("admin@123", "admin123", Role.ADMIN);
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        userDao.save(admin);
    }

    if (!userDao.existsByUsername("abdelilah@abdelilah")) {
        User student = new User("abdelilah@abdelilah", "abdelilah@abdelilah", Role.STUDENT);
        student.setPassword(passwordEncoder.encode(student.getPassword()));
        userDao.save(student);
    }

    System.out.println("USERS INITIALIZED SUCCESSFULLY ✔");
}}