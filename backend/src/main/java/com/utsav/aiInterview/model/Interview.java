package com.utsav.aiInterview.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

/**
 * Interview document stored in MongoDB.
 * Structure only — no business logic.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "interviews")
public class Interview {

    @Id
    private String id;

    @Indexed
    private String userEmail;

    private String role;

    private Difficulty difficulty;

    private InterviewStatus status;

    private List<Question> questions;

    private Instant createdAt;

    private Instant startedAt;

    private Instant completedAt;
}
