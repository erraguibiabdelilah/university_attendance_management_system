package org.example.universityattendancemanagementsystem.ws.dto;
import lombok.Data;

@Data
public class SaveEncodingRequest {

    private Long userId;

    private String encoding;

    private Integer photoIndex;
}
