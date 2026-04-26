package org.example.universityattendancemanagementsystem.security.config;

import org.example.universityattendancemanagementsystem.security.services.facad.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configuration séparée pour l'authentification
 * Cela évite les dépendances circulaires avec WebSecurityConfig
 */
@Configuration
public class AuthenticationConfig {

    /**
     * Encodeur de mot de passe BCrypt
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Provider d'authentification DAO
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider(UserService userService,
                                                            PasswordEncoder passwordEncoder) {

        DaoAuthenticationProvider authProvider =
                new DaoAuthenticationProvider(userService);

        authProvider.setPasswordEncoder(passwordEncoder);

        return authProvider;
    }

    /**
     * Gestionnaire d'authentification
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}