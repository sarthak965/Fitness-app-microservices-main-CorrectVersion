package com.fitness.aiservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

@Service
@Slf4j
public class GeminiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public GeminiService(WebClient externalWebClient) {
        this.webClient = externalWebClient;
    }

    public String getAnswer(String question) {
        return extractText(fetchRawResponse(question));
    }

    public String getRawResponse(String question) {
        return fetchRawResponse(question);
    }

    private String fetchRawResponse(String question) {
        Map<String, Object> requestBody = Map.of(
                "contents", new Object[] {
                        Map.of("parts", new Object[]{
                                Map.of("text", question)
                        })
                }
        );

        try {
            return webClient.post()
                    .uri(geminiApiUrl + geminiApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (WebClientResponseException ex) {
            log.error("Gemini API request failed with status {} and body: {}", ex.getStatusCode(), ex.getResponseBodyAsString(), ex);
            throw ex;
        } catch (Exception ex) {
            log.error("Gemini API request failed", ex);
            throw ex;
        }
    }

    private String extractText(String rawResponse) {
        try {
            JsonNode rootNode = objectMapper.readTree(rawResponse);
            JsonNode textNode = rootNode.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

            if (textNode.isMissingNode() || textNode.asText().isBlank()) {
                throw new IllegalStateException("Gemini response did not contain generated text");
            }

            return textNode.asText().trim();
        } catch (Exception ex) {
            log.error("Failed to extract text from Gemini response", ex);
            throw new RuntimeException("Failed to parse Gemini response", ex);
        }
    }
}
