package com.interview.prep.service;

import com.interview.prep.domain.mongo.SmallTestDocument;
import com.interview.prep.dto.SmallTestRequest;
import com.interview.prep.dto.SmallTestResponse;
import com.interview.prep.exception.DuplicateResourceException;
import com.interview.prep.exception.ResourceNotFoundException;
import com.interview.prep.repository.mongo.SmallTestRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link SmallTestService}, focusing on the flexible-schema attributes path.
 */
@ExtendWith(MockitoExtension.class)
class SmallTestServiceTest {

    @Mock
    private SmallTestRepository repository;

    @InjectMocks
    private SmallTestService service;

    @Test
    void create_preservesAttributes() {
        SmallTestRequest req = new SmallTestRequest("Ann", "Lee", "ann@x.com", "123",
                Map.of("department", "eng", "level", 2));
        when(repository.existsByEmail("ann@x.com")).thenReturn(false);
        when(repository.save(any(SmallTestDocument.class))).thenAnswer(inv -> {
            SmallTestDocument d = inv.getArgument(0);
            d.setSmallTestId("abc123");
            return d;
        });
        SmallTestResponse res = service.create(req);
        assertThat(res.smallTestId()).isEqualTo("abc123");
        assertThat(res.attributes()).containsEntry("department", "eng").containsEntry("level", 2);
    }

    @Test
    void create_nullAttributes_defaultsToEmptyMap() {
        SmallTestRequest req = new SmallTestRequest("Ann", null, null, null, null);
        when(repository.save(any(SmallTestDocument.class))).thenAnswer(inv -> inv.getArgument(0));
        SmallTestResponse res = service.create(req);
        assertThat(res.attributes()).isNotNull().isEmpty();
    }

    @Test
    void create_duplicateEmail_throwsConflict() {
        when(repository.existsByEmail("dup@x.com")).thenReturn(true);
        assertThatThrownBy(() -> service.create(
                new SmallTestRequest("A", null, "dup@x.com", null, null)))
                .isInstanceOf(DuplicateResourceException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void findById_unknown_throwsNotFound() {
        when(repository.findById("nope")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.findById("nope"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void delete_returnsDeleted() {
        SmallTestDocument d = SmallTestDocument.builder().smallTestId("id1").name("Bob").build();
        when(repository.findById("id1")).thenReturn(Optional.of(d));
        SmallTestResponse res = service.delete("id1");
        assertThat(res.name()).isEqualTo("Bob");
        verify(repository).delete(d);
    }
}
