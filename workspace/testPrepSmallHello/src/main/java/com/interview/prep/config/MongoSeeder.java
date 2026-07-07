package com.interview.prep.config;

import com.interview.prep.domain.mongo.SmallTestDocument;
import com.interview.prep.repository.mongo.SmallTestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Seeds the {@code smallTest} collection with 6 sample documents on startup
 * when it is empty. Disabled under the {@code test} profile.
 */
@Slf4j
@Component
@Profile("!test")
@RequiredArgsConstructor
public class MongoSeeder implements CommandLineRunner {

    private final SmallTestRepository repository;

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            log.info("smallTest collection already populated ({} docs) — skipping seed", repository.count());
            return;
        }
        List<SmallTestDocument> seed = List.of(
                doc("Alice", "Anderson", "alice.anderson@example.com", "+1-555-0101",
                        Map.of("department", "engineering", "level", 3)),
                doc("Bob", "Brown", "bob.brown@example.com", "+1-555-0102",
                        Map.of("department", "sales", "region", "EMEA")),
                doc("Carol", "Clark", "carol.clark@example.com", "+1-555-0103",
                        Map.of("newsletter", true)),
                doc("David", "Davis", "david.davis@example.com", "+1-555-0104",
                        Map.of("tags", List.of("vip", "beta"))),
                doc("Eve", "Evans", "eve.evans@example.com", "+1-555-0105",
                        Map.of("locale", "en_GB", "verified", false)),
                doc("Frank", "Foster", "frank.foster@example.com", "+1-555-0106",
                        Map.of("notes", "prefers email contact"))
        );
        repository.saveAll(seed);
        log.info("Seeded {} smallTest documents", seed.size());
    }

    private SmallTestDocument doc(String name, String family, String email, String phone,
                                  Map<String, Object> attributes) {
        return SmallTestDocument.builder()
                .name(name)
                .familyName(family)
                .email(email)
                .phone(phone)
                .attributes(new java.util.HashMap<>(attributes))
                .build();
    }
}
