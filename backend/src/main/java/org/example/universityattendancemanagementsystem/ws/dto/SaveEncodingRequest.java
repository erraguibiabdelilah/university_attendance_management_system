package org.example.universityattendancemanagementsystem.ws.dto;

import lombok.Data;


public class SaveEncodingRequest {
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