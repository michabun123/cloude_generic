package com.interview.prep.service;

import com.interview.prep.domain.mongo.SmallTestDocument;
import com.interview.prep.dto.SmallTestRequest;
import com.interview.prep.dto.SmallTestResponse;
import com.interview.prep.exception.DuplicateResourceException;
import com.interview.prep.exception.ResourceNotFoundException;
import com.interview.prep.repository.mongo.SmallTestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.List;

/**
 * Business logic for the flexible-schema Mongo document.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SmallTestService {

    private static final String RESOURCE = "SmallTest";

    private final SmallTestRepository repository;

    public List<SmallTestResponse> findAll() {
        return repository.findAll().stream().map(SmallTestResponse::from).toList();
    }

    public SmallTestResponse findById(String id) {
        return repository.findById(id)
                .map(SmallTestResponse::from)
                .orElseThrow(() -> ResourceNotFoundException.of(RESOURCE, id));
    }

    public SmallTestResponse create(SmallTestRequest request) {
        if (StringUtils.hasText(request.email()) && repository.existsByEmail(request.email())) {
            throw DuplicateResourceException.of(RESOURCE, "email", request.email());
        }
        SmallTestDocument doc = SmallTestDocument.builder()
                .name(request.name())
                .familyName(request.familyName())
                .email(request.email())
                .phone(request.phone())
                .attributes(request.attributes() == null ? new HashMap<>() : new HashMap<>(request.attributes()))
                .build();
        SmallTestDocument saved = repository.save(doc);
        log.info("Created SmallTest id={} name={}", saved.getSmallTestId(), saved.getName());
        return SmallTestResponse.from(saved);
    }

    public SmallTestResponse update(String id, SmallTestRequest request) {
        SmallTestDocument doc = repository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of(RESOURCE, id));
        if (StringUtils.hasText(request.email())
                && !request.email().equals(doc.getEmail())
                && repository.existsByEmail(request.email())) {
            throw DuplicateResourceException.of(RESOURCE, "email", request.email());
        }
        doc.setName(request.name());
        doc.setFamilyName(request.familyName());
        doc.setEmail(request.email());
        doc.setPhone(request.phone());
        doc.setAttributes(request.attributes() == null ? new HashMap<>() : new HashMap<>(request.attributes()));
        SmallTestDocument saved = repository.save(doc);
        log.info("Updated SmallTest id={}", saved.getSmallTestId());
        return SmallTestResponse.from(saved);
    }

    public SmallTestResponse delete(String id) {
        SmallTestDocument doc = repository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of(RESOURCE, id));
        repository.delete(doc);
        log.info("Deleted SmallTest id={}", id);
        return SmallTestResponse.from(doc);
    }
}
