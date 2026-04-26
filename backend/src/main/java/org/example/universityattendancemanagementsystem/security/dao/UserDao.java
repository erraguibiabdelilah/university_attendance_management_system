package org.example.universityattendancemanagementsystem.security.dao;


import org.example.universityattendancemanagementsystem.security.bean.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserDao extends JpaRepository<User, Long> {
    User findUserByUsername(String username);
}
