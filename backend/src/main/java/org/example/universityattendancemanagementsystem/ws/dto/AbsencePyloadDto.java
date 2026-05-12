package org.example.universityattendancemanagementsystem.ws.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
@Getter
@Setter
@Data
public class AbsencePyloadDto {

    private AbsenceDto absence;
    private List<AbsenceDetailDto> details;

}
