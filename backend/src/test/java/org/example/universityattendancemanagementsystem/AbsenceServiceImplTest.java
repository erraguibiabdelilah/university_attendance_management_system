package org.example.universityattendancemanagementsystem;

import org.example.universityattendancemanagementsystem.bean.Absence;
import org.example.universityattendancemanagementsystem.bean.Role;
import org.example.universityattendancemanagementsystem.bean.User;
import org.example.universityattendancemanagementsystem.dao.AbsenceDao;
import org.example.universityattendancemanagementsystem.security.dao.UserDao;
import org.example.universityattendancemanagementsystem.service.impl.AbsenceServiceImpl;
import org.example.universityattendancemanagementsystem.ws.convertir.AbsenceConvertir;
import org.example.universityattendancemanagementsystem.ws.dto.AbsenceDto;
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
class AbsenceServiceImplTest {

    @Mock
    private AbsenceDao absenceDao;

    @Mock
    private UserDao userDao;

    private final AbsenceConvertir absenceConvertir = new AbsenceConvertir();

    @Test
    void saveValidAbsenceInsertsRecordWithRequiredWorkflowFields() {
        AbsenceServiceImpl service = new AbsenceServiceImpl(absenceDao, absenceConvertir, userDao);
        AbsenceDto request = AbsenceDto.builder()
                .teacherId(7L)
                .filiere("IRISI")
                .nomModule("Java")
                .promo("2025")
                .typeSeance("COURS")
                .date(LocalDate.of(2026, 5, 8))
                .build();

        when(userDao.findById(7L)).thenReturn(Optional.of(teacher(7L)));
        when(absenceDao.save(any(Absence.class))).thenAnswer(invocation -> {
            Absence saved = invocation.getArgument(0);
            saved.setId(11L);
            User teacher = saved.getTeacher();
            teacher.setFirstName("Ada");
            teacher.setLastName("Lovelace");
            return saved;
        });

        AbsenceDto saved = service.save(request);

        ArgumentCaptor<Absence> absenceCaptor = ArgumentCaptor.forClass(Absence.class);
        verify(absenceDao).save(absenceCaptor.capture());
        Absence inserted = absenceCaptor.getValue();
        assertThat(inserted.getTeacher().getId()).isEqualTo(7L);
        assertThat(inserted.getFilier()).isEqualTo("IRISI");
        assertThat(inserted.getNomModule()).isEqualTo("Java");
        assertThat(inserted.getPromo()).isEqualTo("2025");
        assertThat(inserted.getDate()).isEqualTo(LocalDate.of(2026, 5, 8));
        assertThat(saved.getId()).isEqualTo(11L);
    }

    @Test
    void saveRejectsMissingRequiredFormFieldsBeforeDatabaseInsertion() {
        AbsenceServiceImpl service = new AbsenceServiceImpl(absenceDao, absenceConvertir, userDao);
        AbsenceDto request = AbsenceDto.builder()
                .teacherId(7L)
                .filiere("IRISI")
                .promo("2025")
                .date(LocalDate.of(2026, 5, 8))
                .build();

        assertThatThrownBy(() -> service.save(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("module");

        verify(absenceDao, never()).save(any());
    }

    @Test
    void saveRejectsUnknownTeacherBeforeDatabaseInsertion() {
        AbsenceServiceImpl service = new AbsenceServiceImpl(absenceDao, absenceConvertir, userDao);
        AbsenceDto request = AbsenceDto.builder()
                .teacherId(99L)
                .filiere("IRISI")
                .nomModule("Java")
                .promo("2025")
                .date(LocalDate.of(2026, 5, 8))
                .build();

        when(userDao.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.save(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Enseignant non trouvé");

        verify(absenceDao, never()).save(any());
    }

    private User teacher(Long id) {
        User teacher = new User();
        teacher.setId(id);
        teacher.setFirstName("Ada");
        teacher.setLastName("Lovelace");
        teacher.setRole(Role.TEACHER);
        return teacher;
    }
}

