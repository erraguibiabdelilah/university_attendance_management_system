package org.example.universityattendancemanagementsystem.security.services.facad;


import org.example.universityattendancemanagementsystem.security.bean.Role;

import java.util.Collection;
import java.util.List;

public interface RoleService {
    public Role findRoleByAuthority(String authority);
    int deleteByAuthority(String authority);

    Role save(Role role);
    void save(Collection<Role>  role);

    List<Role> findAll();
}
