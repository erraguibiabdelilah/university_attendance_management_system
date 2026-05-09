package org.example.universityattendancemanagementsystem;

import org.example.universityattendancemanagementsystem.bean.Role;
import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.security.dao.UserDao;
import org.example.universityattendancemanagementsystem.security.services.impl.UserServiceImpl;
import org.example.universityattendancemanagementsystem.security.services.utils.JwtUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserDao userDao;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Test
    void findStudentsByFiliereAndPromoRetrievesOnlyStudentRole() {
        UserServiceImpl service = new UserServiceImpl(userDao, authenticationManager, passwordEncoder, jwtUtils);
        User student = new User();
        student.setId(35L);
        student.setFilier("IRISI");
        student.setPromo("2025");
        student.setRole(Role.STUDENT);

        when(userDao.findByFilierAndPromoAndRole("IRISI", "2025", Role.STUDENT)).thenReturn(List.of(student));

        List<User> students = service.findStudentsByFiliereAndPromo("IRISI", "2025");

        assertThat(students).containsExactly(student);
        verify(userDao).findByFilierAndPromoAndRole("IRISI", "2025", Role.STUDENT);
    }
}
