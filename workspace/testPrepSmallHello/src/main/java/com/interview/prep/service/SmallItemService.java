package com.interview.prep.service;

import com.interview.prep.domain.jpa.SmallItem;
import com.interview.prep.dto.SmallItemRequest;
import com.interview.prep.dto.SmallItemResponse;
import com.interview.prep.exception.DuplicateResourceException;
import com.interview.prep.exception.ResourceNotFoundException;
import com.interview.prep.repository.jpa.SmallItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Business logic for the relational main resource (JPA / PostgreSQL / H2).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SmallItemService {

    private static final String RESOURCE = "SmallItem";

    private final SmallItemRepository repository;

    @Transactional(readOnly = true)
    public List<SmallItemResponse> findAll() {
        return repository.findAll().stream().map(SmallItemResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public SmallItemResponse findById(Long id) {
        return repository.findById(id)
                .map(SmallItemResponse::from)
                .orElseThrow(() -> ResourceNotFoundException.of(RESOURCE, id));
    }

    @Transactional(rollbackFor = Exception.class)
    public SmallItemResponse create(SmallItemRequest request) {
        if (repository.existsByName(request.name())) {
            throw DuplicateResourceException.of(RESOURCE, "name", request.name());
        }
        Instant now = Instant.now();
        SmallItem entity = new SmallItem();
        entity.setName(request.name());
        entity.setDescription(request.description());
        entity.setQuantity(request.quantity());
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        SmallItem saved = repository.save(entity);
        log.info("Created SmallItem id={} name={}", saved.getId(), saved.getName());
        return SmallItemResponse.from(saved);
    }

    @Transactional(rollbackFor = Exception.class)
    public SmallItemResponse update(Long id, SmallItemRequest request) {
        SmallItem entity = repository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of(RESOURCE, id));
        if (!entity.getName().equals(request.name()) && repository.existsByName(request.name())) {
            throw DuplicateResourceException.of(RESOURCE, "name", request.name());
        }
        entity.setName(request.name());
        entity.setDescription(request.description());
        entity.setQuantity(request.quantity());
        entity.setUpdatedAt(Instant.now());
        SmallItem saved = repository.save(entity);
        log.info("Updated SmallItem id={}", saved.getId());
        return SmallItemResponse.from(saved);
    }

    @Transactional(rollbackFor = Exception.class)
    public SmallItemResponse delete(Long id) {
        SmallItem entity = repository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of(RESOURCE, id));
        repository.delete(entity);
        log.info("Deleted SmallItem id={}", id);
        return SmallItemResponse.from(entity);
    }
}
