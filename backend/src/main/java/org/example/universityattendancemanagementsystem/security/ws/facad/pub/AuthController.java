package org.example.universityattendancemanagementsystem.security.ws.facad.pub;


import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.security.services.facad.UserService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/uca/auth/")
public class AuthController {
    private UserService userService;

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




    public AuthController(UserService userService){
        this.userService=userService;
    }
}
