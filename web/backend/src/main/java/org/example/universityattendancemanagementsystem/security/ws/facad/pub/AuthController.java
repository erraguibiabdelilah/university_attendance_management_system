package org.example.universityattendancemanagementsystem.security.ws.facad.pub;


import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.dao.AbsenceDao;
import org.example.universityattendancemanagementsystem.security.dao.UserDao;
import org.example.universityattendancemanagementsystem.security.services.facad.UserService;
import org.example.universityattendancemanagementsystem.service.impl.CloudinaryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/uca/auth/")
public class AuthController {
    private UserService userService;
    private AbsenceDao absenceDao;
    private UserDao userDao;
    private CloudinaryService cloudinaryService;

    @PostMapping("sign-in/")
    public String signIn(@RequestBody User user) {
        return userService.signIn(user);
    }

    @GetMapping("username/{username}")
    public UserDetails loadUserByUsername(@PathVariable String username) throws UsernameNotFoundException {
        return userService.loadUserByUsername(username);
    }

    @PostMapping("login/")
    public User save(@RequestBody  User user) {
        return userService.save(user);
    }

    @PutMapping("login/")
    public User update(@RequestBody  User user) {
        return userService.update(user);
    }
    @DeleteMapping("id/{id}")
    public void deleteById(@PathVariable Long id) {
        userService.deleteById(id);
    }
    @GetMapping
    public List<User> findAll() {
        return userService.findAll();
    }

    @GetMapping("filier/{filier}/promo/{promo}")
    public List<User> findUserByFilierAndPromo(@PathVariable String filier,@PathVariable String promo) {
        return userService.findUserByFilierAndPromo(filier, promo);
    }

    @GetMapping("filieres")
    public List<String> getDistinctFilieres() {
        return userService.findAll().stream()
                .map(User::getFilier)
                .filter(f -> f != null && !f.isBlank())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    @GetMapping("modules")
    public List<String> getDistinctModules() {
        return absenceDao.findAll().stream()
                .map(a -> a.getNomModule())
                .filter(m -> m != null && !m.isBlank())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    // ── Photo endpoints ──────────────────────────────────────────────────────

    @PostMapping("{id}/photo")
    public ResponseEntity<?> uploadPhoto(@PathVariable Long id,
                                         @RequestParam("file") MultipartFile file) {
        User user = userDao.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable: " + id));
        try {
            String url = cloudinaryService.uploadImage(file, "student_photos");
            user.setPhotoUrl(url);
            userDao.save(user);
            return ResponseEntity.ok(Map.of("photoUrl", url));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("{id}/photo-url")
    public ResponseEntity<?> savePhotoUrl(@PathVariable Long id,
                                          @RequestBody Map<String, String> body) {
        User user = userDao.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable: " + id));
        user.setPhotoUrl(body.get("photoUrl"));
        userDao.save(user);
        return ResponseEntity.ok(Map.of("photoUrl", user.getPhotoUrl()));
    }

    @GetMapping("{id}/photo")
    public ResponseEntity<?> getPhoto(@PathVariable Long id) {
        User user = userDao.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable: " + id));
        if (user.getPhotoUrl() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Pas de photo pour cet utilisateur"));
        }
        return ResponseEntity.ok(Map.of("photoUrl", user.getPhotoUrl()));
    }

    public AuthController(UserService userService, AbsenceDao absenceDao,
                          UserDao userDao, CloudinaryService cloudinaryService) {
        this.userService = userService;
        this.absenceDao = absenceDao;
        this.userDao = userDao;
        this.cloudinaryService = cloudinaryService;
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<String> handleUsernameNotFound(UsernameNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<String> handleBadCredentials(BadCredentialsException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException e) {
        HttpStatus status = e.getMessage() != null && e.getMessage().contains("existe déjà")
                ? HttpStatus.CONFLICT
                : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(e.getMessage());
    }

}
