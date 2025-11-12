package com.premierleague.analytics.controller;

import com.premierleague.analytics.entity.Prediction;
import com.premierleague.analytics.service.PredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/predictions")
public class PredictionController {

    @Autowired
    private PredictionService predictionService;

    @GetMapping
    public ResponseEntity<List<Prediction>> getAllPredictions() {
        return ResponseEntity.ok(predictionService.getAllPredictions());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Prediction>> getUpcomingPredictions() {
        return ResponseEntity.ok(predictionService.getUpcomingPredictions());
    }

    @GetMapping("/week/{matchWeek}")
    public ResponseEntity<List<Prediction>> getPredictionsForWeek(@PathVariable Integer matchWeek) {
        return ResponseEntity.ok(predictionService.getPredictionsForCurrentWeek(matchWeek));
    }

    @PostMapping("/generate")
    public ResponseEntity<Map<String, String>> generatePredictions() {
        try {
            predictionService.regeneratePredictions(); // Clear old and generate new
            Map<String, String> response = new HashMap<>();
            response.put("message", "Predictions regenerated successfully for next 10 matches");
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error generating predictions: " + e.getMessage());
            response.put("status", "error");
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, String>> clearPredictions() {
        try {
            predictionService.clearAllPredictions();
            Map<String, String> response = new HashMap<>();
            response.put("message", "All predictions cleared successfully");
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error clearing predictions: " + e.getMessage());
            response.put("status", "error");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
