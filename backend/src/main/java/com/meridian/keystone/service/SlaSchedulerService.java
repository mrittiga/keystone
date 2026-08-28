package com.meridian.keystone.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SlaSchedulerService {

    private final WorkOrderService workOrderService;

    @Scheduled(fixedRate = 300_000)
    public void runSlaCheck() {
        log.info("Running scheduled SLA breach check...");
        workOrderService.checkAndUpdateSlaBreaches();
    }
}
