package com.utsav.aiInterview.dto;

import java.util.List;

/**
 * ATS-style match report of a resume against a target role.
 */
public record AtsReport(
        int score,
        String summary,
        List<String> strengths,
        List<String> improvements
) {
}
