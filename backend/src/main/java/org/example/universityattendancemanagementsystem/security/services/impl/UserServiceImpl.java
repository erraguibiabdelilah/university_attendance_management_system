package org.example.universityattendancemanagementsystem.security.services.impl;

import org.example.universityattendancemanagementsystem.bean.Role;
import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.security.dao.UserDao;
import org.example.universityattendancemanagementsystem.security.services.facad.UserService;
import org.example.universityattendancemanagementsystem.security.services.utils.JwtUtils;
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
    private final JwtUtils jwtUtils;

    /**
     * Injection par constructeur
     */
    public UserServiceImpl(UserDao userDao,
                           @Lazy AuthenticationManager authenticationManager,
                           PasswordEncoder passwordEncoder,
                           JwtUtils jwtUtils) {
        this.dao = userDao;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
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

        // Sauvegarder l'utilisateur et récupérer l'entité avec l'id généré
        return dao.save(user);
    }


    @Override
    public User update(User user) {

        // Vérifier si l'utilisateur existe
        User existingUser = dao.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Utilisateur introuvable avec l'id : " + user.getId()
                ));

        // Vérifier si le username existe déjà pour un autre utilisateur
        User userWithSameUsername = dao.findUserByUsername(user.getUsername());

        if (userWithSameUsername != null &&
                !userWithSameUsername.getId().equals(user.getId())) {

            throw new IllegalArgumentException(
                    "Un utilisateur avec ce username existe déjà : " + user.getUsername()
            );
        }

        // Mise à jour des champs
        existingUser.setFirstName(user.getFirstName());
        existingUser.setLastName(user.getLastName());
        existingUser.setPromo(user.getPromo());
        existingUser.setUsername(user.getUsername());
        existingUser.setFilier(user.getFilier());
        existingUser.setCni(user.getCni());
        existingUser.setCne(user.getCne());
        existingUser.setImatricule(user.getImatricule());
        existingUser.setDepartemnt(user.getDepartemnt());

        existingUser.setRole(user.getRole());

        existingUser.setEnabled(user.isEnabled());
        existingUser.setCredentialsNonExpired(user.isCredentialsNonExpired());
        existingUser.setAccountNonLocked(user.isAccountNonLocked());
        existingUser.setAccountNonExpired(user.isAccountNonExpired());

        // Mise à jour du mot de passe seulement s'il est renseigné
        if (user.getPassword() != null && !user.getPassword().trim().isEmpty()) {
            existingUser.setPassword(
                    passwordEncoder.encode(user.getPassword())
            );
        }

        // Sauvegarde
        return dao.save(existingUser);
    }

    @Override
    public void deleteById(Long id) {

        // Vérifier si l'utilisateur existe
        User existingUser = dao.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Utilisateur introuvable avec l'id : " + id

                ));

        dao.delete(existingUser);

    }

    /**
     * Récupérer tous les utilisateurs
     */
    @Override
    public List<User> findAll() {
        return dao.findAll();
    }

    @Override
    public List<User> findUserByFilierAndPromo(String filier, String promo) {
        return dao.findUserByFilierAndPromoAndRole(filier, promo, Role.STUDENT);
    }
}