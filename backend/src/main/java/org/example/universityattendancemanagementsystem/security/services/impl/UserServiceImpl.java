package org.example.universityattendancemanagementsystem.security.services.impl;

import org.example.universityattendancemanagementsystem.security.bean.User;
import org.example.universityattendancemanagementsystem.security.dao.UserDao;
import org.example.universityattendancemanagementsystem.security.services.facad.RoleService;
import org.example.universityattendancemanagementsystem.security.services.facad.UserService;
import org.example.universityattendancemanagementsystem.security.services.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Lazy;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserDao dao;
     private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final RoleService roleService;
    private final JwtUtils jwtUtils;

    /**
     * Injection par constructeur
     */
    public UserServiceImpl(UserDao userDao,
                           @Lazy AuthenticationManager authenticationManager,
                           PasswordEncoder passwordEncoder,
                           RoleService roleService,
                           JwtUtils jwtUtils) {
        this.dao = userDao;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.roleService = roleService;
        this.jwtUtils = jwtUtils;
    }

    /**
     * Méthode de UserDetailsService
     * IMPORTANT: Le type de retour doit être UserDetails, pas User
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = dao.findUserByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("Utilisateur non trouvé: " + username);
        }
        return user;
    }

    /**
     * Authentification et génération du token JWT
     */
    @Override
    public String signIn(User user) {
        try {
            // Authentification de l'utilisateur
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            user.getUsername(),
                            user.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException(
                    "Identifiants incorrects pour l'utilisateur: " + user.getUsername()
            );
        }

        // Chargement de l'utilisateur authentifié
        User loadedUser = (User) loadUserByUsername(user.getUsername());

        // Génération du token JWT
        String token = jwtUtils.generateToken(loadedUser);

        return token;
    }

    /**
     * Enregistrement d'un nouvel utilisateur
     */
    @Override
    public User save(User user) {
        // Vérifier si l'utilisateur existe déjà
        User existingUser = dao.findUserByUsername(user.getUsername());

        if (existingUser != null) {
            throw new IllegalArgumentException(
                    "Un utilisateur avec ce username existe déjà: " + user.getUsername()
            );
        }

        // Encoder le mot de passe
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Sauvegarder les rôles
        if (user.getAuthorities() != null && !user.getAuthorities().isEmpty()) {
            roleService.save(user.getAuthorities());
        }

        // Sauvegarder l'utilisateur
        dao.save(user);

        return user;
    }

    /**
     * Récupérer tous les utilisateurs
     */
    @Override
    public List<User> findAll() {
        return dao.findAll();
    }
}