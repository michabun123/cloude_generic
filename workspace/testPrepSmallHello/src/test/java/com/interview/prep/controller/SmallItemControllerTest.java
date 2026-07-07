package com.interview.prep.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interview.prep.dto.SmallItemRequest;
import com.interview.prep.dto.SmallItemResponse;
import com.interview.prep.exception.DuplicateResourceException;
import com.interview.prep.exception.GlobalExceptionHandler;
import com.interview.prep.exception.ResourceNotFoundException;
import com.interview.prep.service.SmallItemService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer / component tests for {@link SmallItemController} + {@link GlobalExceptionHandler}.
 */
@WebMvcTest(SmallItemController.class)
@Import(GlobalExceptionHandler.class)
class SmallItemControllerTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    @MockBean
    private SmallItemService service;

    private SmallItemResponse sample() {
        return new SmallItemResponse(1L, "widget", "d", 5, 0L, Instant.now(), Instant.now());
    }

    @Test
    void getById_found_returns200() throws Exception {
        when(service.findById(1L)).thenReturn(sample());
        mvc.perform(get("/api/v1/small-items/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("widget"));
    }

    @Test
    void getById_unknown_returns404() throws Exception {
        when(service.findById(99L)).thenThrow(ResourceNotFoundException.of("SmallItem", 99L));
        mvc.perform(get("/api/v1/small-items/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void create_valid_returns201Envelope() throws Exception {
        when(service.create(any())).thenReturn(sample());
        SmallItemRequest req = new SmallItemRequest("widget", "d", 5);
        mvc.perform(post("/api/v1/small-items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("SmallItem created"))
                .andExpect(jsonPath("$.data.name").value("widget"));
    }

    @Test
    void create_invalidBody_returns400() throws Exception {
        SmallItemRequest bad = new SmallItemRequest("", null, -1);
        mvc.perform(post("/api/v1/small-items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(bad)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").exists())
                .andExpect(jsonPath("$.fieldErrors.quantity").exists());
    }

    @Test
    void create_duplicate_returns409() throws Exception {
        when(service.create(any())).thenThrow(DuplicateResourceException.of("SmallItem", "name", "widget"));
        SmallItemRequest req = new SmallItemRequest("widget", "d", 5);
        mvc.perform(post("/api/v1/small-items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void delete_returns200Envelope() throws Exception {
        when(service.delete(eq(1L))).thenReturn(sample());
        mvc.perform(delete("/api/v1/small-items/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("SmallItem deleted"))
                .andExpect(jsonPath("$.data.id").value(1));
    }
}
