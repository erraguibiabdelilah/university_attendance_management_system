package org.example.universityattendancemanagementsystem.security.services.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.http.HttpServletRequest;
import org.example.universityattendancemanagementsystem.security.filter.JwtConstant;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.*;
import java.util.function.Function;
@Component
public class JwtUtils {

    private static final long serialVersionUID = 2342345235223L;

     private static String  originalKey = "mySecretKey&?!?d!&lm.2&0#2&6#?!!?EXTRA_CHARS_TO_MAKE_IT_LONG_ENOUGH_FOR_HS512_SIGNATURE_ALGORITHM!!!";

    private static final String secretKey = Base64.getEncoder().encodeToString(originalKey.getBytes());

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        addRolesClaim(userDetails, claims);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + JwtConstant.JWT_TOKEN_VALIDITY * 1000))
                .signWith(SignatureAlgorithm.HS512, secretKey)
                .compact();
    }


    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }


    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }


    private boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }


    private void addRolesClaim(UserDetails userDetails, Map<String, Object> claims) {

        if (userDetails == null || userDetails.getAuthorities() == null || userDetails.getAuthorities().isEmpty()) {
            return;
        }

        String roles = "";

        Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();

        for (GrantedAuthority granted : authorities) {
            roles += granted.getAuthority() + ",";
        }

        if (!roles.isEmpty()) {
            roles = roles.substring(0, roles.length() - 1);
        }

        claims.put("roles", "[" + roles + "]");
    }

    public void registerAuthenticationTokenInContext(UserDetails userDetails,
                                                     HttpServletRequest httpServletRequest) {

        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

        authenticationToken.setDetails(
                new WebAuthenticationDetailsSource().buildDetails(httpServletRequest)
        );

        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
    }


    // Récupérer n’importe quel claim depuis un token
    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }


    // Récupérer la date d’expiration
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    // Méthode interne pour extraire tous les claims
    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody();
    }

}
