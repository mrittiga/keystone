package com.meridian.keystone.service;

import com.meridian.keystone.domain.Part;
import com.meridian.keystone.dto.CreatePartRequest;
import com.meridian.keystone.dto.PartDTO;
import com.meridian.keystone.dto.PageResponse;
import com.meridian.keystone.repository.PartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PartService {

    private final PartRepository partRepository;

    public PageResponse<PartDTO> getAllParts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<PartDTO> result = partRepository.findAll(pageable).map(PartDTO::from);
        return PageResponse.from(result);
    }

    public PartDTO getPartById(Long id) {
        Part part = partRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Part not found with id: " + id));
        return PartDTO.from(part);
    }

    public List<PartDTO> getLowStockParts() {
        return partRepository.findLowStockParts()
                .stream()
                .map(PartDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public PartDTO createPart(CreatePartRequest request) {
        if (partRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("SKU already exists: " + request.getSku());
        }

        Part part = Part.builder()
                .sku(request.getSku().toUpperCase())
                .name(request.getName())
                .description(request.getDescription())
                .unitCost(request.getUnitCost())
                .stockQuantity(request.getStockQuantity())
                .minStockLevel(request.getMinStockLevel())
                .build();

        Part saved = partRepository.save(part);
        log.info("Part created: {}", saved.getSku());
        return PartDTO.from(saved);
    }

    @Transactional
    public PartDTO updatePart(Long id, CreatePartRequest request) {
        Part part = partRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Part not found with id: " + id));

        if (request.getName() != null) part.setName(request.getName());
        if (request.getDescription() != null) part.setDescription(request.getDescription());
        if (request.getUnitCost() != null) part.setUnitCost(request.getUnitCost());
        if (request.getStockQuantity() != null) part.setStockQuantity(request.getStockQuantity());
        if (request.getMinStockLevel() != null) part.setMinStockLevel(request.getMinStockLevel());

        Part saved = partRepository.save(part);
        log.info("Part updated: {}", saved.getSku());
        return PartDTO.from(saved);
    }
}
