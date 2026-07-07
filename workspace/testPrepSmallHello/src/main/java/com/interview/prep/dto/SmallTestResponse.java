package com.interview.prep.dto;

import com.interview.prep.domain.mongo.SmallTestDocument;

import java.util.Map;

/**
 * Outbound representation of the flexible-schema Mongo document.
 */
public record SmallTestResponse(
        String smallTestId,
        String name,
        String familyName,
        String email,
        String phone,
        Map<String, Object> attributes
) {
    public static SmallTestResponse from(SmallTestDocument d) {
        return new SmallTestResponse(
                d.getSmallTestId(), d.getName(), d.getFamilyName(),
                d.getEmail(), d.getPhone(), d.getAttributes());
    }
}
