package com.premierleague.analytics.controller;

import com.premierleague.analytics.service.FootballDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/data")
public class DataController {

    @Autowired
    private FootballDataService footballDataService;

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshData() {
        try {
            footballDataService.refreshAllData();
            Map<String, String> response = new HashMap<>();
            response.put("message", "Data refresh completed successfully");
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Data refresh failed: " + e.getMessage());
            response.put("status", "error");
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getDataStatus() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "API integration active");
        response.put("api", "Football-Data.org");
        response.put("schedule", "Hourly (every hour)");
        return ResponseEntity.ok(response);
    }
}
