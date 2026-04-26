package org.example.universityattendancemanagementsystem.security.filter;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.universityattendancemanagementsystem.security.services.facad.UserService;
import org.example.universityattendancemanagementsystem.security.services.utils.JwtUtils;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.SignatureException;

public class JwtAuthorisationFilter extends OncePerRequestFilter {

    private UserService userService;
    private JwtUtils jwtUtil;

    public JwtAuthorisationFilter(UserService userService, JwtUtils jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Récupérer le header Authorization
        String authorizationHeader = request.getHeader("Authorization");

        // 2. Vérifier si le header contient un token Bearer
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            // Pas de token → laisser passer (les endpoints publics seront gérés par Spring Security)
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extraire le token (enlever "Bearer ")
        String token = authorizationHeader.substring(7);

        try {
            // 4. Extraire le username depuis le token
            String username = jwtUtil.getUsernameFromToken(token);
            logger.debug("Username extrait du token: " + username);

            // 5. Vérifier si on a déjà un utilisateur authentifié dans le contexte
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // 6. Charger les détails de l'utilisateur depuis la base de données
                UserDetails userDetails = userService.loadUserByUsername(username);

                if (userDetails == null) {
                    logger.error("Utilisateur non trouvé: " + username);
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Utilisateur non trouvé");
                    return;
                }

                // 7. VALIDER LE TOKEN avec ta méthode validateToken()
                if (jwtUtil.validateToken(token, userDetails)) {
                    // 8. Créer l'objet Authentication avec les autorités
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    // 9. Injecter l'authentification dans le contexte de sécurité
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    logger.info("Utilisateur authentifié avec succès: " + username );
                    logger.debug("Authorités: " + userDetails.getAuthorities());


                } else {
                    logger.warn("Token JWT invalide pour l'utilisateur: " + username);
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token invalide");
                    return;
                }
            }

        } catch (ExpiredJwtException e) {
            logger.error("Token expiré: " + e.getMessage());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token expiré");
            return;

        } catch (MalformedJwtException e) {
            logger.error("Token malformé: " + e.getMessage());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token malformé");
            return;

        } catch (UsernameNotFoundException e) {
            logger.error("Utilisateur non trouvé: " + e.getMessage());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Utilisateur non trouvé");
            return;

        } catch (Exception e) {
            logger.error("Erreur lors de l'authentification JWT: " + e.getMessage(), e);
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Erreur d'authentification");
            return;
        }

        // 10. Continuer la chaîne de filtres
        filterChain.doFilter(request, response);
    }
}