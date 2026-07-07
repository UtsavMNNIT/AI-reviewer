package com.utsav.aiInterview.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * A selectable interview role (e.g. "Backend Engineer"), managed in MongoDB.
 * Add or remove documents in the {@code job_roles} collection to change the
 * roles offered to candidates — the change is reflected in the app immediately.
 * Structure only — no business logic.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "job_roles")
public class JobRole {

    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

    /** Only active roles are offered to candidates; set false to hide without deleting. */
    private boolean active;

    /** Controls ordering in the picker (lower first). */
    private int displayOrder;

    private Instant createdAt;
}
