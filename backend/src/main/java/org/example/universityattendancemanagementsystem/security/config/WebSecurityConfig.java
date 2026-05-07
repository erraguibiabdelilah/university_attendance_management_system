package org.example.universityattendancemanagementsystem.security.config;

import jakarta.servlet.http.HttpServletResponse;
import org.example.universityattendancemanagementsystem.security.filter.JwtAuthorisationFilter;
import org.example.universityattendancemanagementsystem.security.services.facad.UserService;
import org.example.universityattendancemanagementsystem.security.services.utils.JwtUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true, jsr250Enabled = true)
public class WebSecurityConfig {

    /**
     * Filtre JWT pour la validation des tokens
     */
    @Bean
    public JwtAuthorisationFilter jwtAuthorisationFilter(UserService userService,
                                                         JwtUtils jwtUtils) {
        return new JwtAuthorisationFilter(userService, jwtUtils);
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtAuthorisationFilter jwtAuthorisationFilter) throws Exception {


        http

                // Désactivation de CSRF (API REST stateless)
                .csrf(csrf -> csrf.disable())
                .cors(cros->{})

                // Configuration de la gestion de session (stateless)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Configuration des autorisations HTTP
                .authorizeHttpRequests(auth -> auth
                        // Endpoints publics - PAS besoin de token
                        .requestMatchers(
                                // Authentification
                                "/api/uca/auth/**",
                                "/api/uca/auth/login/",
                                "/api/uca/auth/sign-in/",
                                "/api/uca/auth/username/**",
                                // Documentation
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/webjars/**",

                                // Health check
                                "/actuator/health",
                                "/actuator/info"
                        ).permitAll()

                        // Endpoints admin - besoin du rôle ADMIN
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Tous les autres endpoints nécessitent une authentification
                        .anyRequest().authenticated()
                )

                // Ajout du filtre JWT pour valider les tokens
                .addFilterBefore(jwtAuthorisationFilter, UsernamePasswordAuthenticationFilter.class)

                // Gestion des erreurs
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Accès non autorisé");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Accès refusé");
                        })
                );

        return http.build();
    }
}