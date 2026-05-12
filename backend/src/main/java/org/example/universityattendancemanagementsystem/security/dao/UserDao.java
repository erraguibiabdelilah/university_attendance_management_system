package org.example.universityattendancemanagementsystem.security.dao;


import org.example.universityattendancemanagementsystem.bean.Role;
import org.example.universityattendancemanagementsystem.bean.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserDao extends JpaRepository<User, Long> {
    User findUserByUsername(String username);

    List<User> findUserByFilierAndPromoAndRole(String filier , String promo , Role role);

}
