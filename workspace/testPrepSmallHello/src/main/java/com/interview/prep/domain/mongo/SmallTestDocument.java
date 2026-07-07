package com.interview.prep.domain.mongo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.HashMap;
import java.util.Map;

/**
 * Flexible-schema document stored in the {@code smallTest} collection.
 *
 * <p>Typed core fields plus a {@link #attributes} catch-all {@code Map<String,Object>}
 * for arbitrary per-document extras — threaded through the DTO and endpoints.
 */
@Document(collection = "smallTest")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SmallTestDocument {

    @Id
    private String smallTestId;

    private String name;

    @Field("family_name")
    private String familyName;

    @Indexed(unique = true, sparse = true)
    private String email;

    private String phone;

    /** Flexible catch-all for arbitrary optional fields. */
    @Builder.Default
    private Map<String, Object> attributes = new HashMap<>();
}
