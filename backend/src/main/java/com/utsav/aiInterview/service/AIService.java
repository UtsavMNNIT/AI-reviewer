package com.utsav.aiInterview.service;

import com.utsav.aiInterview.dto.AnswerEvaluation;
import com.utsav.aiInterview.dto.GeneratedQuestion;
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

    /**
     * Generates a single interview question tailored to the resume, role and difficulty,
     * avoiding any of the already-asked questions. Used to build the interview one
     * question at a time so the candidate isn't kept waiting for a full batch.
     */
    public GeneratedQuestion generateNextQuestion(String resumeText, String role,
                                                  Difficulty difficulty, List<String> alreadyAsked) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new BadRequestException("Gemini API key is not configured");
        }

        String url = baseUrl + "/models/" + model + ":generateContent";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(API_KEY_HEADER, apiKey);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(buildNextQuestionRequest(resumeText, role, difficulty, alreadyAsked), headers);

        String response;
        try {
            response = restTemplate.postForObject(url, entity, String.class);
        } catch (RestClientException ex) {
            throw new AIServiceException("Failed to call Gemini API", ex);
        }

        return parseResponse(response, GeneratedQuestion.class);
    }

    /**
     * Evaluates a candidate's answer to an interview question via Gemini, returning
     * a score with strengths, weaknesses and suggestions.
     */
    public AnswerEvaluation evaluateAnswer(String role, Difficulty difficulty,
                                           String question, String topic, String answer) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new BadRequestException("Gemini API key is not configured");
        }

        String url = baseUrl + "/models/" + model + ":generateContent";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(API_KEY_HEADER, apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(
                buildEvaluationRequest(role, difficulty, question, topic, answer), headers);

        String response;
        try {
            response = restTemplate.postForObject(url, entity, String.class);
        } catch (RestClientException ex) {
            throw new AIServiceException("Failed to call Gemini API", ex);
        }

        return parseResponse(response, AnswerEvaluation.class);
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

    private Map<String, Object> buildNextQuestionRequest(String resumeText, String role,
                                                         Difficulty difficulty, List<String> alreadyAsked) {
        Map<String, Object> textPart = Map.of("text",
                buildNextQuestionPrompt(resumeText, role, difficulty, alreadyAsked));
        Map<String, Object> content = Map.of("parts", List.of(textPart));

        Map<String, Object> schema = Map.of(
                "type", "OBJECT",
                "properties", Map.of(
                        "question", Map.of("type", "STRING"),
                        "topic", Map.of("type", "STRING")));

        Map<String, Object> generationConfig = Map.of(
                "responseMimeType", "application/json",
                "responseSchema", schema);

        return Map.of(
                "contents", List.of(content),
                "generationConfig", generationConfig);
    }

    private String buildNextQuestionPrompt(String resumeText, String role,
                                           Difficulty difficulty, List<String> alreadyAsked) {
        String asked = (alreadyAsked == null || alreadyAsked.isEmpty())
                ? "(none yet — this is the first question)"
                : alreadyAsked.stream().map(q -> "- " + q).collect(java.util.stream.Collectors.joining("\n"));
        return """
                You are an expert technical interviewer conducting a live interview.
                Generate exactly ONE interview question for a candidate applying for the role below,
                calibrated to the given difficulty level and grounded in the candidate's resume.
                Reference the candidate's actual skills, projects and experience where relevant.
                Do NOT repeat or closely overlap any of the already-asked questions listed below;
                cover a different topic or skill area than those already asked.
                Respond ONLY with JSON that matches the requested schema.

                - question: a clear, standalone interview question
                - topic: the topic or skill area the question assesses

                Role: %s
                Difficulty: %s

                Already-asked questions:
                %s

                Resume:
                %s
                """.formatted(role, difficulty.name(), asked, resumeText);
    }

    private Map<String, Object> buildEvaluationRequest(String role, Difficulty difficulty,
                                                       String question, String topic, String answer) {
        Map<String, Object> textPart = Map.of("text",
                buildEvaluationPrompt(role, difficulty, question, topic, answer));
        Map<String, Object> content = Map.of("parts", List.of(textPart));

        Map<String, Object> stringArray = Map.of("type", "ARRAY", "items", Map.of("type", "STRING"));
        Map<String, Object> schema = Map.of(
                "type", "OBJECT",
                "properties", Map.of(
                        "score", Map.of("type", "INTEGER"),
                        "summary", Map.of("type", "STRING"),
                        "strengths", stringArray,
                        "weaknesses", stringArray,
                        "suggestions", stringArray));

        Map<String, Object> generationConfig = Map.of(
                "responseMimeType", "application/json",
                "responseSchema", schema);

        return Map.of(
                "contents", List.of(content),
                "generationConfig", generationConfig);
    }

    private String buildEvaluationPrompt(String role, Difficulty difficulty,
                                         String question, String topic, String answer) {
        return """
                You are an expert technical interviewer evaluating a candidate's answer.
                Assess the answer for correctness, depth, relevance, and clarity,
                calibrated to the role and difficulty below.
                Respond ONLY with JSON that matches the requested schema.

                - score: an integer from 0 to 100 rating the overall quality of the answer
                - summary: a concise 1-2 sentence overall assessment
                - strengths: specific things the answer did well
                - weaknesses: specific gaps, errors, or missing points
                - suggestions: concrete, actionable ways to improve the answer

                Role: %s
                Difficulty: %s
                Topic: %s
                Question: %s
                Candidate's answer: %s
                """.formatted(role, difficulty.name(), topic, question, answer);
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
