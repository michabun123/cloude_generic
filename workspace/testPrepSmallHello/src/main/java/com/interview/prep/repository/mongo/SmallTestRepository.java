package com.interview.prep.repository.mongo;

import com.interview.prep.domain.mongo.SmallTestDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data MongoDB repository for the flexible-schema document.
 */
@Repository
public interface SmallTestRepository extends MongoRepository<SmallTestDocument, String> {

    boolean existsByEmail(String email);

    Optional<SmallTestDocument> findByEmail(String email);
}
