package com.utsav.aiInterview.config;

import com.utsav.aiInterview.model.JobRole;
import com.utsav.aiInterview.repository.JobRoleRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Instant;
import java.util.List;

/**
 * Seeds baseline reference data on startup.
 */
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    /** Default interview roles, inserted only when the catalog is empty. */
    private static final List<String> DEFAULT_ROLES = List.of(
            "Backend Engineer",
            "Frontend Engineer",
            "Full Stack Engineer",
            "DevOps Engineer",
            "AI Engineer");

    /**
     * Seeds {@link JobRole}s only when the collection is empty, so removing roles
     * in the database sticks (they are not re-created) while adding new ones there
     * is picked up automatically.
     */
    @Bean
    CommandLineRunner seedJobRoles(JobRoleRepository jobRoleRepository) {
        return args -> {
            if (jobRoleRepository.count() > 0) {
                return;
            }
            Instant now = Instant.now();
            List<JobRole> defaults = java.util.stream.IntStream.range(0, DEFAULT_ROLES.size())
                    .mapToObj(i -> JobRole.builder()
                            .name(DEFAULT_ROLES.get(i))
                            .active(true)
                            .displayOrder(i)
                            .createdAt(now)
                            .build())
                    .toList();
            jobRoleRepository.saveAll(defaults);
            log.info("Seeded {} default interview roles", defaults.size());
        };
    }
}
