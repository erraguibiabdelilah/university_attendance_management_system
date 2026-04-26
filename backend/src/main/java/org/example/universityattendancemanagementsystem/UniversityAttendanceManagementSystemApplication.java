package org.example.universityattendancemanagementsystem;

import org.example.universityattendancemanagementsystem.security.bean.Role;
import org.example.universityattendancemanagementsystem.security.bean.User;
import org.example.universityattendancemanagementsystem.security.dao.RoleDao;
import org.example.universityattendancemanagementsystem.security.dao.UserDao;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.List;

@SpringBootApplication
public class UniversityAttendanceManagementSystemApplication implements CommandLineRunner {

    private final RoleDao roleDao;
    private final UserDao userDao;

    public UniversityAttendanceManagementSystemApplication(RoleDao roleDao, UserDao userDao) {
        this.roleDao = roleDao;
        this.userDao = userDao;
    }

    public static void main(String[] args) {
        SpringApplication.run(UniversityAttendanceManagementSystemApplication.class, args);
    }

    @Override
    public void run(String... args) {

        Role admin_role = new Role("ADMIN");
        Role teacher_role = new Role("TEACHER");
        Role student_role = new Role("STUDENT");

        roleDao.save(admin_role);
        roleDao.save(teacher_role);
        roleDao.save(student_role);

        User admin = new User("admin@123", "admin123");
        admin.setAuthorities(List.of(admin_role));

        userDao.save(admin);
    }
}