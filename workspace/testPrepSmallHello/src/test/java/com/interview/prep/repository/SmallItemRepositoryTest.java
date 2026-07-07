package com.interview.prep.repository;

import com.interview.prep.domain.jpa.SmallItem;
import com.interview.prep.repository.jpa.SmallItemRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * JPA slice test against in-memory H2 (integration layer of the pyramid).
 */
@DataJpaTest
@ActiveProfiles("test")
class SmallItemRepositoryTest {

    @Autowired
    private SmallItemRepository repository;

    @Test
    void saveAndFindByName() {
        SmallItem e = new SmallItem();
        e.setName("persisted");
        e.setDescription("d");
        e.setQuantity(4);
        e.setCreatedAt(Instant.now());
        e.setUpdatedAt(Instant.now());
        repository.save(e);

        assertThat(repository.existsByName("persisted")).isTrue();
        assertThat(repository.findByName("persisted")).isPresent();
        assertThat(repository.existsByName("missing")).isFalse();
    }
}
