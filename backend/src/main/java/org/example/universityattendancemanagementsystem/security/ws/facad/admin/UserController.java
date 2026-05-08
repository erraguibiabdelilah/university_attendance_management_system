package org.example.universityattendancemanagementsystem.security.ws.facad.admin;

import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.security.services.facad.UserService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/api_backend/protected")
public class UserController {
    private UserService userService;

    @GetMapping("/username/{username}")
    public UserDetails loadUserByUsername(@PathVariable String username) throws UsernameNotFoundException {
        return userService.loadUserByUsername(username);
    }
    @PostMapping("/")
    public User save(@RequestBody  User user) {
        return userService.save(user);
    }

    @GetMapping("/")
    public List<User> findAll() {
        return userService.findAll();
    }

    @GetMapping("/students/{filiere}/{promo}")
    public List<User> findStudentsByFiliereAndPromo(@PathVariable String filiere,
                                                    @PathVariable String promo) {
        return userService.findStudentsByFiliereAndPromo(filiere, promo);
    }

    public UserController(UserService userService){
        this.userService=userService;
    }
}
