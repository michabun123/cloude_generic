package com.interview.prep;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Full application-context smoke test (top of the pyramid).
 * Uses H2 for JPA and the local MongoDB server (isolated test database).
 */
@SpringBootTest
@ActiveProfiles("test")
class TestPrepSmallHelloApplicationTests {

    @Test
    void contextLoads() {
        // Verifies the whole Spring context (both data modules) wires up.
    }
}
