package com.utsav.aiInterview.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Interview question embedded within an {@link Interview} document.
 * Structure only — no business logic.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Question {

    private String question;

    private String topic;

    /** The candidate's submitted answer, populated on answer submission. */
    private String answer;

    /** AI evaluation of the submitted answer, populated on answer submission. */
    private Evaluation evaluation;
}
