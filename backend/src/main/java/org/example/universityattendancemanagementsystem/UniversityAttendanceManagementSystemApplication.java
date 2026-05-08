package org.example.universityattendancemanagementsystem;

import org.example.universityattendancemanagementsystem.bean.Role;
import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.security.dao.UserDao;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.List;

@SpringBootApplication
public class UniversityAttendanceManagementSystemApplication implements CommandLineRunner {

    private final UserDao userDao;

    public UniversityAttendanceManagementSystemApplication( UserDao userDao) {

        this.userDao = userDao;
    }

    public static void main(String[] args) {
        SpringApplication.run(UniversityAttendanceManagementSystemApplication.class, args);
    }

    @Override
    public void run(String... args) {

        User admin = new User("admin@123", "admin123", Role.ADMIN);
        User student = new User("abdelilah@abdelilah", "abdelilah@abdelilah",Role.STUDENT);
        userDao.save(admin);
        userDao.save(student);
    }
}