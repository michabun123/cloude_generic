package com.interview.prep.service;

import com.interview.prep.domain.jpa.SmallItem;
import com.interview.prep.dto.SmallItemRequest;
import com.interview.prep.dto.SmallItemResponse;
import com.interview.prep.exception.DuplicateResourceException;
import com.interview.prep.exception.ResourceNotFoundException;
import com.interview.prep.repository.jpa.SmallItemRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link SmallItemService} (base of the test pyramid, mocked repository).
 */
@ExtendWith(MockitoExtension.class)
class SmallItemServiceTest {

    @Mock
    private SmallItemRepository repository;

    @InjectMocks
    private SmallItemService service;

    private SmallItem entity(Long id, String name) {
        SmallItem e = new SmallItem();
        e.setId(id);
        e.setName(name);
        e.setDescription("desc");
        e.setQuantity(5);
        e.setVersion(0L);
        e.setCreatedAt(Instant.now());
        e.setUpdatedAt(Instant.now());
        return e;
    }

    @Test
    void findById_returnsItem() {
        when(repository.findById(1L)).thenReturn(Optional.of(entity(1L, "widget")));
        SmallItemResponse res = service.findById(1L);
        assertThat(res.name()).isEqualTo("widget");
    }

    @Test
    void findById_unknown_throwsNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_persistsAndReturns() {
        SmallItemRequest req = new SmallItemRequest("gadget", "d", 3);
        when(repository.existsByName("gadget")).thenReturn(false);
        when(repository.save(any(SmallItem.class))).thenAnswer(inv -> {
            SmallItem e = inv.getArgument(0);
            e.setId(10L);
            return e;
        });
        SmallItemResponse res = service.create(req);
        assertThat(res.id()).isEqualTo(10L);
        assertThat(res.name()).isEqualTo("gadget");
    }

    @Test
    void create_duplicateName_throwsConflict() {
        when(repository.existsByName("dup")).thenReturn(true);
        assertThatThrownBy(() -> service.create(new SmallItemRequest("dup", null, 1)))
                .isInstanceOf(DuplicateResourceException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void update_unknown_throwsNotFound() {
        when(repository.findById(7L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.update(7L, new SmallItemRequest("x", null, 1)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void delete_returnsDeletedPayload() {
        when(repository.findById(2L)).thenReturn(Optional.of(entity(2L, "toDelete")));
        SmallItemResponse res = service.delete(2L);
        assertThat(res.name()).isEqualTo("toDelete");
        verify(repository).delete(any(SmallItem.class));
    }

    @Test
    void findAll_returnsList() {
        when(repository.findAll()).thenReturn(List.of(entity(1L, "a"), entity(2L, "b")));
        assertThat(service.findAll()).hasSize(2);
    }
}
