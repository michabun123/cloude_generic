package com.interview.prep.dto;

import com.interview.prep.domain.jpa.SmallItem;

import java.time.Instant;

/**
 * Outbound representation of a {@code SmallItem}.
 */
public record SmallItemResponse(
        Long id,
        String name,
        String description,
        Integer quantity,
        Long version,
        Instant createdAt,
        Instant updatedAt
) {
    public static SmallItemResponse from(SmallItem e) {
        return new SmallItemResponse(
                e.getId(), e.getName(), e.getDescription(), e.getQuantity(),
                e.getVersion(), e.getCreatedAt(), e.getUpdatedAt());
    }
}
