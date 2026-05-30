package org.example.universityattendancemanagementsystem.service.impl;

import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class ExpoPushService {

    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    public void sendNotification(String expoPushToken, String title, String body) {
        if (expoPushToken == null || expoPushToken.isBlank()) return;

        String json = String.format(
            "{\"to\":\"%s\",\"title\":\"%s\",\"body\":\"%s\",\"sound\":\"default\"}",
            expoPushToken, title, body
        );

        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(EXPO_PUSH_URL))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();
            client.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (Exception e) {
            System.err.println("Erreur envoi notification Expo: " + e.getMessage());
        }
    }
}
