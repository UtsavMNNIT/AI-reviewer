package com.utsav.aiInterview.service;

import com.utsav.aiInterview.dto.GeneratedQuestions;
import com.utsav.aiInterview.dto.ResumeAnalysis;
import com.utsav.aiInterview.exception.AIServiceException;
import com.utsav.aiInterview.exception.BadRequestException;
import com.utsav.aiInterview.model.Difficulty;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

/**
 * AI integration service — analyzes resume text via the Google Gemini API.
 */
@Service
@RequiredArgsConstructor
public class AIService {

    private static final String API_KEY_HEADER = "x-goog-api-key";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model}")
    private String model;

    @Value("${gemini.api.base-url}")
    private String baseUrl;

    /**
     * Sends the resume text to Gemini and returns a structured analysis.
     */
    public ResumeAnalysis analyzeResume(String resumeText) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new BadRequestException("Gemini API key is not configured");
        }

        String url = baseUrl + "/models/" + model + ":generateContent";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(API_KEY_HEADER, apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(buildRequest(resumeText), headers);

        String response;
        try {
            response = restTemplate.postForObject(url, entity, String.class);
        } catch (RestClientException ex) {
            throw new AIServiceException("Failed to call Gemini API", ex);
        }

        return parseResponse(response, ResumeAnalysis.class);
    }

    /**
     * Generates interview questions tailored to the candidate's resume, the target role
     * and the chosen difficulty via Gemini.
     */
    public GeneratedQuestions generateInterviewQuestions(String resumeText, String role, Difficulty difficulty) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new BadRequestException("Gemini API key is not configured");
        }

        String url = baseUrl + "/models/" + model + ":generateContent";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(API_KEY_HEADER, apiKey);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(buildInterviewRequest(resumeText, role, difficulty), headers);

        String response;
        try {
            response = restTemplate.postForObject(url, entity, String.class);
        } catch (RestClientException ex) {
            throw new AIServiceException("Failed to call Gemini API", ex);
        }

        return parseResponse(response, GeneratedQuestions.class);
    }

    private Map<String, Object> buildRequest(String resumeText) {
        Map<String, Object> textPart = Map.of("text", buildPrompt(resumeText));
        Map<String, Object> content = Map.of("parts", List.of(textPart));

        Map<String, Object> stringArray = Map.of("type", "ARRAY", "items", Map.of("type", "STRING"));
        Map<String, Object> schema = Map.of(
                "type", "OBJECT",
                "properties", Map.of(
                        "skills", stringArray,
                        "projects", stringArray,
                        "technologies", stringArray,
                        "experienceSummary", Map.of("type", "STRING"),
                        "strengths", stringArray,
                        "weaknesses", stringArray));

        Map<String, Object> generationConfig = Map.of(
                "responseMimeType", "application/json",
                "responseSchema", schema);

        return Map.of(
                "contents", List.of(content),
                "generationConfig", generationConfig);
    }

    private String buildPrompt(String resumeText) {
        return """
                You are an expert technical recruiter and resume analyst.
                Analyze the following resume text and extract structured information.
                Respond ONLY with JSON that matches the requested schema.

                - skills: key professional and technical skills
                - projects: notable projects mentioned
                - technologies: tools, languages, frameworks, and platforms used
                - experienceSummary: a concise 2-3 sentence summary of the candidate's experience
                - strengths: the candidate's main strengths
                - weaknesses: gaps or areas the candidate could improve

                Resume:
                """ + resumeText;
    }

    private Map<String, Object> buildInterviewRequest(String resumeText, String role, Difficulty difficulty) {
        Map<String, Object> textPart = Map.of("text", buildInterviewPrompt(resumeText, role, difficulty));
        Map<String, Object> content = Map.of("parts", List.of(textPart));

        Map<String, Object> questionItem = Map.of(
                "type", "OBJECT",
                "properties", Map.of(
                        "question", Map.of("type", "STRING"),
                        "topic", Map.of("type", "STRING")));
        Map<String, Object> schema = Map.of(
                "type", "OBJECT",
                "properties", Map.of(
                        "questions", Map.of("type", "ARRAY", "items", questionItem)));

        Map<String, Object> generationConfig = Map.of(
                "responseMimeType", "application/json",
                "responseSchema", schema);

        return Map.of(
                "contents", List.of(content),
                "generationConfig", generationConfig);
    }

    private String buildInterviewPrompt(String resumeText, String role, Difficulty difficulty) {
        return """
                You are an expert technical interviewer.
                Generate exactly 10 interview questions for a candidate applying for the role below,
                calibrated to the given difficulty level and grounded in the candidate's resume.
                Reference the candidate's actual skills, projects and experience where relevant.
                Respond ONLY with JSON that matches the requested schema.

                - question: a clear, standalone interview question
                - topic: the topic or skill area the question assesses

                Role: %s
                Difficulty: %s

                Resume:
                %s
                """.formatted(role, difficulty.name(), resumeText);
    }

    private <T> T parseResponse(String response, Class<T> type) {
        if (response == null || response.isBlank()) {
            throw new AIServiceException("Gemini returned an empty response");
        }
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.isEmpty()) {
                throw new AIServiceException("Gemini returned no candidates");
            }
            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (!parts.isArray() || parts.isEmpty()) {
                throw new AIServiceException("Gemini returned no content");
            }
            String json = parts.get(0).path("text").asString(null);
            if (json == null || json.isBlank()) {
                throw new AIServiceException("Gemini returned an empty analysis");
            }
            return objectMapper.readValue(json, type);
        } catch (JacksonException ex) {
            throw new AIServiceException("Failed to parse Gemini response", ex);
        }
    }
}
