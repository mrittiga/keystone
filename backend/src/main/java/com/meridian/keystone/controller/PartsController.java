package com.meridian.keystone.controller;

import com.meridian.keystone.dto.*;
import com.meridian.keystone.service.PartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parts")
@RequiredArgsConstructor
@Tag(name = "Parts", description = "Parts inventory management")
@SecurityRequirement(name = "bearerAuth")
public class PartsController {

    private final PartService partService;

    @GetMapping
    @PreAuthorize("authenticated")
    @Operation(summary = "List all parts")
    public ResponseEntity<PageResponse<PartDTO>> getAllParts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(partService.getAllParts(page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("authenticated")
    @Operation(summary = "Get part by ID")
    public ResponseEntity<PartDTO> getPart(@PathVariable Long id) {
        return ResponseEntity.ok(partService.getPartById(id));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('MANAGER') or hasRole('DISPATCHER')")
    @Operation(summary = "Get parts below minimum stock level")
    public ResponseEntity<List<PartDTO>> getLowStock() {
        return ResponseEntity.ok(partService.getLowStockParts());
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Create a new part — Manager only")
    public ResponseEntity<PartDTO> createPart(
            @Valid @RequestBody CreatePartRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(partService.createPart(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Update a part — Manager only")
    public ResponseEntity<PartDTO> updatePart(
            @PathVariable Long id,
            @RequestBody CreatePartRequest request) {
        return ResponseEntity.ok(partService.updatePart(id, request));
    }
}
