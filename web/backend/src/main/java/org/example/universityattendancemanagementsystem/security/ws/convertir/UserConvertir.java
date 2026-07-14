package org.example.universityattendancemanagementsystem.security.ws.convertir;

import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.security.ws.dto.UserDto;
import org.springframework.stereotype.Component;

@Component
public class UserConvertir {

    public User toBean(UserDto dto){
        User bean =new User();
        bean.setId(dto.getId());
        bean.setFirstName(dto.getFirstName());
        bean.setLastName(dto.getLastName());
        bean.setPromo(dto.getPromo());
        bean.setUsername(dto.getUsername());
        bean.setRole(dto.getRole());
        bean.setFilier(dto.getFilier());
        bean.setCne(dto.getCne());
        bean.setCni(dto.getCni());
        bean.setImatricule(dto.getImatricule());
        bean.setDepartemnt(dto.getDepartemnt());
        bean.setEncodings(dto.getEncodings());
        return bean;
    }

    public UserDto toDto(User bean){
        UserDto dto=new UserDto();
        dto.setId(bean.getId());
        dto.setFirstName(bean.getFirstName());
        dto.setLastName(bean.getLastName());
        dto.setPromo(bean.getPromo());
        dto.setUsername(bean.getUsername());
        dto.setRole(bean.getRole());
        dto.setFilier(bean.getFilier());
        dto.setCni(bean.getCni());
        dto.setCne(bean.getCne());
        dto.setDepartemnt(bean.getDepartemnt());
        dto.setImatricule(bean.getImatricule());
        dto.setEncodings(bean.getEncodings());
        return dto;
    }


}
