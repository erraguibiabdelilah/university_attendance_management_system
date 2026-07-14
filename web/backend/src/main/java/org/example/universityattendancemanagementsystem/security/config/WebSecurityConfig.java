
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

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(
        securedEnabled = true,
        jsr250Enabled = true
)
public class WebSecurityConfig {

    // ─────────────────────────────────────────────
    // JWT FILTER
    // ─────────────────────────────────────────────
    @Bean
    public JwtAuthorisationFilter jwtAuthorisationFilter(
            UserService userService,
            JwtUtils jwtUtils
    ) {

        return new JwtAuthorisationFilter(
                userService,
                jwtUtils
        );
    }

    // ─────────────────────────────────────────────
    // SECURITY
    // ─────────────────────────────────────────────
    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtAuthorisationFilter jwtAuthorisationFilter
    ) throws Exception {

        http

                // CSRF
                .csrf(csrf -> csrf.disable())

                // CORS
                .cors(cors -> {})

                // SESSION
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // AUTH
                .authorizeHttpRequests(auth -> auth

                        // PUBLIC
                        .requestMatchers(
                                "/api/face//save/encoding",
                                "/api/uca/auth/sign-in/",
                                "/api/uca/auth/username/**",
                                "/uploads/**",
                                "/api/uca/justification/fichier/**",
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/webjars/**"
                        ).permitAll()

                        // ADMIN only: create, update, delete users
                        .requestMatchers(
                                org.springframework.http.HttpMethod.POST, "/api/uca/auth/login/"
                        ).hasAuthority("ADMIN")
                        .requestMatchers(
                                org.springframework.http.HttpMethod.PUT, "/api/uca/auth/login/"
                        ).hasAuthority("ADMIN")
                        .requestMatchers(
                                org.springframework.http.HttpMethod.DELETE, "/api/uca/auth/id/**"
                        ).hasAuthority("ADMIN")

                        // ADMIN
                        .requestMatchers("/api/admin/**")
                        .hasAuthority("ADMIN")

                        // OTHERS
                        .anyRequest()
                        .authenticated()
                )

                // JWT
                .addFilterBefore(
                        jwtAuthorisationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                // ERRORS
                .exceptionHandling(exception -> exception

                        .authenticationEntryPoint(
                                (request, response, authException) -> {

                                    response.sendError(
                                            HttpServletResponse.SC_UNAUTHORIZED,
                                            "Accès non autorisé"
                                    );
                                }
                        )

                        .accessDeniedHandler(
                                (request, response, accessDeniedException) -> {

                                    response.sendError(
                                            HttpServletResponse.SC_FORBIDDEN,
                                            "Accès refusé"
                                    );
                                }
                        )
                );

        return http.build();
    }

    // ─────────────────────────────────────────────
    // CORS CONFIG
    // ─────────────────────────────────────────────
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}


