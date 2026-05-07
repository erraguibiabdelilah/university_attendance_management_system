package org.example.universityattendancemanagementsystem.security.dao;

import org.example.universityattendancemanagementsystem.bean.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleDao extends JpaRepository<Role,Long> {
    public Role findRoleByAuthority(String authority);
    int deleteByAuthority(String authority);
}
