package com.interview.prep.repository;

import com.interview.prep.domain.mongo.SmallTestDocument;
import com.interview.prep.repository.mongo.SmallTestRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Mongo slice test against the local MongoDB server (isolated test database) — verifies the
 * flexible attributes catch-all round-trips through persistence.
 */
@DataMongoTest
@ActiveProfiles("test")
class SmallTestRepositoryDataMongoTest {

    @Autowired
    private SmallTestRepository repository;

    @AfterEach
    void cleanup() {
        repository.deleteAll();
    }

    @Test
    void saveAndReadFlexibleAttributes() {
        SmallTestDocument d = SmallTestDocument.builder()
                .name("Zoe")
                .familyName("Zimmer")
                .email("zoe@example.com")
                .phone("999")
                .attributes(new java.util.HashMap<>(Map.of("nickname", "Z", "score", 42)))
                .build();
        SmallTestDocument saved = repository.save(d);

        assertThat(saved.getSmallTestId()).isNotBlank();
        assertThat(repository.existsByEmail("zoe@example.com")).isTrue();

        SmallTestDocument found = repository.findById(saved.getSmallTestId()).orElseThrow();
        assertThat(found.getAttributes()).containsEntry("nickname", "Z").containsEntry("score", 42);
    }
}
