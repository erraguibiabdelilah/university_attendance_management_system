package org.example.universityattendancemanagementsystem.security.services.impl;


import org.example.universityattendancemanagementsystem.bean.Role;
import org.example.universityattendancemanagementsystem.security.dao.RoleDao;
import org.example.universityattendancemanagementsystem.security.services.facad.RoleService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
@Service
public class RoleServcieImpl implements RoleService {

    private final RoleDao dao;

    public RoleServcieImpl(RoleDao dao) {
        this.dao = dao;
    }


    @Override
    public Role findRoleByAuthority(String authority) {
        return dao.findRoleByAuthority(authority);
    }

    @Override
    public int deleteByAuthority(String authority) {
        return dao.deleteByAuthority(authority);
    }

    @Override
    public Role save(Role role) {
        Role lodedRole=dao.findRoleByAuthority(role.getAuthority());
        if (role.getAuthority()==null){
           return dao.save(role);

        }else {
            return lodedRole;
        }

    }

    @Override
    public void save(Collection<Role> roles) {
        for (Role role:roles){
            Role lodedRole=dao.findRoleByAuthority(role.getAuthority());
            if(lodedRole!=null)
                role.setId(lodedRole.getId());
            else
                dao.save(role);

        }
    }

    @Override
    public List<Role> findAll() {
        return dao.findAll();
    }


}
