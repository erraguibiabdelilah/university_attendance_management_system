package org.example.universityattendancemanagementsystem.security.services.facad;

import org.example.universityattendancemanagementsystem.bean.User;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

public interface UserService extends UserDetailsService {

    public String signIn(User user);
    public User save(User user );


    List<User> findAll();
}
