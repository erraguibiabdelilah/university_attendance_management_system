package org.example.universityattendancemanagementsystem.ws.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@NoArgsConstructor
@AllArgsConstructor
public class FaceEncodingResponse {
        private Long userId;
        private String encoding;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEncoding() {
        return encoding;
    }

    public void setEncoding(String encoding) {
        this.encoding = encoding;
    }
}