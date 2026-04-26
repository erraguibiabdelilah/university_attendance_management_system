package org.example.universityattendancemanagementsystem.security.ws.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.universityattendancemanagementsystem.security.bean.Role;

import java.util.Collection;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class UserDto {
    private Long id ;
    private String firstName;
    private String LastName;
    private String promo;
    private String username;
    private String photo;
    private Collection<Role> authorities;
}
