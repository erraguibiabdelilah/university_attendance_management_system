package org.example.universityattendancemanagementsystem.security.services.impl;

import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.security.dao.UserDao;
import org.example.universityattendancemanagementsystem.security.services.facad.UserService;
import org.example.universityattendancemanagementsystem.security.services.utils.JwtUtils;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserDao dao;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public UserServiceImpl(UserDao userDao,
                           @Lazy AuthenticationManager authenticationManager,
                           PasswordEncoder passwordEncoder,
                           JwtUtils jwtUtils) {
        this.dao = userDao;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = dao.findUserByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("Utilisateur non trouvé: " + username);
        }
        return user;
    }

    @Override
    public String signIn(User user) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Identifiants incorrects pour l'utilisateur: " + user.getUsername());
        }

        User loadedUser = (User) loadUserByUsername(user.getUsername());
        return jwtUtils.generateToken(loadedUser);
    }

    @Override
    public User save(User user) {
        User existingUser = dao.findUserByUsername(user.getUsername());

        if (existingUser != null) {
            throw new IllegalArgumentException("Un utilisateur avec ce username existe déjà: " + user.getUsername());
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("ROLE_USER");
        }

        return dao.save(user);
    }

    @Override
    public List<User> findAll() {
        return dao.findAll();
    }

    @Override
    public void deleteById(Long id) {
        dao.deleteById(id);
    }
}
