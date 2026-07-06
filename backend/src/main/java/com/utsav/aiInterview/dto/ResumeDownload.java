package com.utsav.aiInterview.dto;

import org.springframework.core.io.Resource;

/**
 * Carrier for streaming a stored resume file back to the client.
 */
public record ResumeDownload(
        Resource resource,
        String filename,
        String contentType
) {
}
