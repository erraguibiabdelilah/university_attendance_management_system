package org.example.universityattendancemanagementsystem;

import org.example.universityattendancemanagementsystem.bean.Absence;
import org.example.universityattendancemanagementsystem.bean.AbsenceDetail;
import org.example.universityattendancemanagementsystem.bean.Role;
import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.dao.AbsenceDao;
import org.example.universityattendancemanagementsystem.dao.AbsenceDetailDao;
import org.example.universityattendancemanagementsystem.security.dao.UserDao;
import org.example.universityattendancemanagementsystem.service.impl.AbsenceDetailServiceImpl;
import org.example.universityattendancemanagementsystem.ws.convertir.AbsenceDetailConvertir;
import org.example.universityattendancemanagementsystem.ws.dto.AbsenceDetailDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AbsenceDetailServiceImplTest {

    @Mock
    private AbsenceDetailDao absenceDetailDao;

    @Mock
    private AbsenceDao absenceDao;

    @Mock
    private UserDao userDao;

    private final AbsenceDetailConvertir absenceDetailConvertir = new AbsenceDetailConvertir();

    @Test
    void saveStoresAttendanceStatusLinkedToExistingAbsenceAndStudent() {
        AbsenceDetailServiceImpl service = new AbsenceDetailServiceImpl(absenceDetailDao, absenceDao, userDao, absenceDetailConvertir);
        Absence absence = absence(12L, "IRISI", "2025");
        User student = student(35L, "IRISI", "2025");
        AbsenceDetailDto request = AbsenceDetailDto.builder()
                .absenceId(12L)
                .studentId(35L)
                .estAbsent(true)
                .build();

        when(absenceDao.findById(12L)).thenReturn(Optional.of(absence));
        when(userDao.findById(35L)).thenReturn(Optional.of(student));
        when(absenceDetailDao.save(any(AbsenceDetail.class))).thenAnswer(invocation -> {
            AbsenceDetail saved = invocation.getArgument(0);
            saved.setId(44L);
            return saved;
        });

        AbsenceDetailDto saved = service.save(request);

        ArgumentCaptor<AbsenceDetail> detailCaptor = ArgumentCaptor.forClass(AbsenceDetail.class);
        verify(absenceDetailDao).save(detailCaptor.capture());
        AbsenceDetail inserted = detailCaptor.getValue();
        assertThat(inserted.getAbsence().getId()).isEqualTo(12L);
        assertThat(inserted.getStudent().getId()).isEqualTo(35L);
        assertThat(inserted.isEstAbsent()).isTrue();
        assertThat(saved.getId()).isEqualTo(44L);
        assertThat(saved.getAbsenceId()).isEqualTo(12L);
        assertThat(saved.getStudentId()).isEqualTo(35L);
        assertThat(saved.isEstAbsent()).isTrue();
    }

    @Test
    void saveRejectsDetailWhenStudentDoesNotMatchAbsenceFiliereAndPromo() {
        AbsenceDetailServiceImpl service = new AbsenceDetailServiceImpl(absenceDetailDao, absenceDao, userDao, absenceDetailConvertir);
        Absence absence = absence(12L, "IRISI", "2025");
        User student = student(35L, "SIT", "2025");
        AbsenceDetailDto request = AbsenceDetailDto.builder()
                .absenceId(12L)
                .studentId(35L)
                .estAbsent(false)
                .build();

        when(absenceDao.findById(12L)).thenReturn(Optional.of(absence));
        when(userDao.findById(35L)).thenReturn(Optional.of(student));

        assertThatThrownBy(() -> service.save(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("filière");

        verify(absenceDetailDao, never()).save(any());
    }

    @Test
    void saveRejectsMissingAbsenceIdBeforeDatabaseInsertion() {
        AbsenceDetailServiceImpl service = new AbsenceDetailServiceImpl(absenceDetailDao, absenceDao, userDao, absenceDetailConvertir);
        AbsenceDetailDto request = AbsenceDetailDto.builder()
                .studentId(35L)
                .estAbsent(false)
                .build();

        assertThatThrownBy(() -> service.save(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("absence");

        verify(absenceDetailDao, never()).save(any());
    }

    private Absence absence(Long id, String filiere, String promo) {
        User teacher = new User();
        teacher.setId(7L);
        teacher.setFirstName("Ada");
        teacher.setLastName("Lovelace");

        return Absence.builder()
                .id(id)
                .teacher(teacher)
                .filier(filiere)
                .promo(promo)
                .nomModule("Java")
                .typeSeance("COURS")
                .date(LocalDate.of(2026, 5, 8))
                .build();
    }

    private User student(Long id, String filiere, String promo) {
        User student = new User();
        student.setId(id);
        student.setFirstName("Grace");
        student.setLastName("Hopper");
        student.setCne("CNE-1");
        student.setRole(Role.STUDENT);
        student.setFilier(filiere);
        student.setPromo(promo);
        return student;
    }
}
