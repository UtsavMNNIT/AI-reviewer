package com.utsav.aiInterview.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * AI evaluation of a candidate's answer, embedded within a {@link Question}.
 * Structure only — no business logic.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Evaluation {

    private int score;

    private String summary;

    private List<String> strengths;

    private List<String> weaknesses;

    private List<String> suggestions;
}
