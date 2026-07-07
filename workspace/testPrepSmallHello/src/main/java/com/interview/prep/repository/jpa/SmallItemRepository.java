package com.interview.prep.repository.jpa;

import com.interview.prep.domain.jpa.SmallItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for the relational main resource.
 */
@Repository
public interface SmallItemRepository extends JpaRepository<SmallItem, Long> {

    boolean existsByName(String name);

    Optional<SmallItem> findByName(String name);
}
