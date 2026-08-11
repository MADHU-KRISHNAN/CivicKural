package com.civickural.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class AiCategorizationService {

    public static class CategorizationResult {
        private String predictedCategory;
        private double confidenceScore;
        private String priority;
        private double priorityScore;
        private String tier1;
        private String tier2;
        private String tier3;
        private boolean intentGuardrailTriggered;
        private String primaryIntent;
        private List<String> secondaryDescriptors;

        public CategorizationResult(String predictedCategory, double confidenceScore, String priority,
                                double priorityScore, String tier1, String tier2, String tier3,
                                boolean intentGuardrailTriggered, String primaryIntent, List<String> secondaryDescriptors) {
            this.predictedCategory = predictedCategory;
            this.confidenceScore = confidenceScore;
            this.priority = priority;
            this.priorityScore = priorityScore;
            this.tier1 = tier1;
            this.tier2 = tier2;
            this.tier3 = tier3;
            this.intentGuardrailTriggered = intentGuardrailTriggered;
            this.primaryIntent = primaryIntent;
            this.secondaryDescriptors = secondaryDescriptors != null ? secondaryDescriptors : new ArrayList<>();
        }

        public String getPredictedCategory() { return predictedCategory; }
        public double getConfidenceScore() { return confidenceScore; }
        public String getPriority() { return priority; }
        public double getPriorityScore() { return priorityScore; }
        public String getTier1() { return tier1; }
        public String getTier2() { return tier2; }
        public String getTier3() { return tier3; }
        public boolean isIntentGuardrailTriggered() { return intentGuardrailTriggered; }
        public String getPrimaryIntent() { return primaryIntent; }
        public List<String> getSecondaryDescriptors() { return secondaryDescriptors; }
    }

    public static class TrustScoreResult {
        private double trustScore;
        private double trustScoreDecimal;
        private String trustTier;
        private Map<String, Integer> breakdown;

        public TrustScoreResult(double trustScore, double trustScoreDecimal, String trustTier, Map<String, Integer> breakdown) {
            this.trustScore = trustScore;
            this.trustScoreDecimal = trustScoreDecimal;
            this.trustTier = trustTier;
            this.breakdown = breakdown;
        }

        public double getTrustScore() { return trustScore; }
        public double getTrustScoreDecimal() { return trustScoreDecimal; }
        public String getTrustTier() { return trustTier; }
        public Map<String, Integer> getBreakdown() { return breakdown; }
    }

    public static double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371e3;
        double rad = Math.PI / 180;
        double dLat = (lat2 - lat1) * rad;
        double dLon = (lon2 - lon1) * rad;
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public TrustScoreResult calculateTrustScore(
            boolean hasExifData,
            Date exifTimestamp,
            Date submissionTimestamp,
            double deviceLat,
            double deviceLng,
            Double exifLat,
            Double exifLng,
            boolean isAuthenticated,
            int userSubmissionCount,
            double userResolutionRatio,
            boolean hasVoiceNote,
            String title,
            String description) {

        int exifScore = 0;
        int geoScore = 0;
        int reputationScore = 0;
        int consistencyScore = 0;

        if (hasExifData) exifScore += 15;
        if (exifTimestamp != null && submissionTimestamp != null) {
            long diffMs = Math.abs(submissionTimestamp.getTime() - exifTimestamp.getTime());
            long diffMinutes = diffMs / (1000 * 60);
            if (diffMinutes <= 15) exifScore += 15;
            else if (diffMinutes <= 120) exifScore += 10;
        } else if (hasExifData) {
            exifScore += 10;
        }

        if (exifLat != null && exifLng != null && deviceLat != 0 && deviceLng != 0) {
            double dist = calculateHaversineDistance(deviceLat, deviceLng, exifLat, exifLng);
            if (dist <= 50) geoScore += 15;
            else if (dist <= 500) geoScore += 8;
        } else if (deviceLat != 0 && deviceLng != 0) {
            geoScore += 10;
        }

        if (deviceLat >= 8.0 && deviceLat <= 37.0 && deviceLng >= 68.0 && deviceLng <= 97.0) {
            geoScore += 10;
        }

        if (isAuthenticated) reputationScore += 10;
        if (userSubmissionCount == 0) reputationScore += 10;
        else if (userResolutionRatio >= 0.8) reputationScore += 15;
        else if (userResolutionRatio >= 0.5) reputationScore += 10;

        if (hasVoiceNote) consistencyScore += 10;
        int len = (title != null ? title.trim().length() : 0) + (description != null ? description.trim().length() : 0);
        if (len > 50) consistencyScore += 10;
        else if (len >= 15) consistencyScore += 5;

        double total = Math.min(100.0, Math.max(0.0, exifScore + geoScore + reputationScore + consistencyScore));
        double decimal = Math.round((total / 100.0) * 100.0) / 100.0;
        String tier = total >= 80.0 ? "HIGH_INTEGRITY" : (total < 50.0 ? "LOW_TRUST_SPAM" : "STANDARD");

        Map<String, Integer> breakdown = new HashMap<>();
        breakdown.put("exifScore", exifScore);
        breakdown.put("geoScore", geoScore);
        breakdown.put("reputationScore", reputationScore);
        breakdown.put("consistencyScore", consistencyScore);

        return new TrustScoreResult(total, decimal, tier, breakdown);
    }

    public CategorizationResult classifyIssue(String title, String description, String audioTranscript) {
        String combined = (title + " " + description + " " + (audioTranscript != null ? audioTranscript : "")).toLowerCase();

        Map<String, List<String>> keywords = new HashMap<>();
        keywords.put("Sanitary & Public Hygiene", Arrays.asList("garbage", "sewage", "trash", "dump", "waste", "drainage", "odor", "smell", "public toilet", "filth", "litter", "drain", "overflow", "sanitation", "cleanliness", "debris", "gutters", "stagnant", "mosquito", "hygiene", "dumpster", "pest"));
        keywords.put("Service Delivery Deficiencies", Arrays.asList("water cut", "water supply", "street light", "streetlight", "lamp", "power outage", "electricity", "low pressure", "bus delay", "transit", "transformer", "pipeline", "blackout", "current", "voltage", "utility", "tap water", "broken light", "dark street"));
        keywords.put("Administrative Delays and Maladministration", Arrays.asList("pending application", "certificate delay", "office negligence", "file stuck", "zonal office", "noc", "clearance", "delay", "queue", "red tape", "birth certificate", "death certificate", "license delay", "bureaucracy", "unprocessed", "document", "no response"));
        keywords.put("Abuse of Power or Corruption", Arrays.asList("bribe", "extortion", "misconduct", "official abuse", "fraud", "favoritism", "illegal demand", "kickback", "cash payment", "under the table", "unauthorized fee", "harassment", "corruption", "threat", "officer demanding"));
        keywords.put("Systemic and Policy Issues", Arrays.asList("bad road design", "dangerous intersection", "policy flaw", "city planning", "accessibility", "pothole", "ramp", "wheelchair", "traffic light", "urban design", "footpath", "sidewalk", "pedestrian", "road construction", "hazard", "safety flaw"));

        Map<String, Integer> categoryScores = new HashMap<>();
        for (String cat : keywords.keySet()) {
            categoryScores.put(cat, 0);
        }

        for (Map.Entry<String, List<String>> entry : keywords.entrySet()) {
            for (String kw : entry.getValue()) {
                if (combined.contains(kw)) {
                    int points = kw.contains(" ") ? 3 : 1;
                    categoryScores.put(entry.getKey(), categoryScores.get(entry.getKey()) + points);
                }
            }
        }

        // Stage 1: Multi-Label Softmax Probability Scoring
        Map<String, Double> probabilities = new HashMap<>();
        double maxExp = 0;
        for (Map.Entry<String, Integer> entry : categoryScores.entrySet()) {
            double expScore = Math.exp(entry.getValue());
            probabilities.put(entry.getKey(), expScore);
            maxExp += expScore;
        }

        String bestCategory = "Sanitary & Public Hygiene";
        double maxProb = -1;

        for (Map.Entry<String, Double> entry : probabilities.entrySet()) {
            double prob = maxExp > 0 ? entry.getValue() / maxExp : 0;
            probabilities.put(entry.getKey(), prob);
            if (prob > maxProb) {
                maxProb = prob;
                bestCategory = entry.getKey();
            }
        }

        // Stage 2: Intent Guardrail Override Layer
        boolean intentGuardrailTriggered = false;
        String primaryIntent = null;
        List<String> secondaryDescriptors = new ArrayList<>();

        if (combined.contains("garbage burning") || combined.contains("burning garbage")) {
            bestCategory = "Sanitary & Public Hygiene";
            intentGuardrailTriggered = true;
            primaryIntent = "Garbage & Waste Burn";
            if (combined.contains("road") || combined.contains("smoke")) {
                secondaryDescriptors.add("road obstruction");
                secondaryDescriptors.add("heavy smoke");
            }
        } else if (combined.contains("sewage spill") || combined.contains("sewage leak")) {
            bestCategory = "Sanitary & Public Hygiene";
            intentGuardrailTriggered = true;
            primaryIntent = "Sewage Leak";
            if (combined.contains("street") || combined.contains("traffic")) {
                secondaryDescriptors.add("street flooded");
                secondaryDescriptors.add("traffic obstructed");
            }
        } else if (categoryScores.get("Sanitary & Public Hygiene") > 0 && categoryScores.get("Systemic and Policy Issues") > 0) {
            if (categoryScores.get("Sanitary & Public Hygiene") >= categoryScores.get("Systemic and Policy Issues")) {
                bestCategory = "Sanitary & Public Hygiene";
                intentGuardrailTriggered = true;
                primaryIntent = "Sanitation & Hygiene Root Cause";
                secondaryDescriptors.add("Systemic/Policy Side Effect");
            }
        }

        double confidenceScore = maxProb > 0.2 ? Math.min(0.98, 0.70 + maxProb * 0.28) : 0.72;
        if (intentGuardrailTriggered) {
            confidenceScore = 0.95;
        }
        
        confidenceScore = Math.round(confidenceScore * 100.0) / 100.0;

        String tier1 = "";
        String tier2 = "";
        String tier3 = "";
        String priority = "";
        double priorityScore = 0;

        switch (bestCategory) {
            case "Sanitary & Public Hygiene":
                tier1 = "Public Health & Sanitation"; tier2 = "Sanitation Board"; tier3 = "Garbage & Solid Waste Management"; priority = "High"; priorityScore = 78.5; break;
            case "Service Delivery Deficiencies":
                tier1 = "Infrastructure & Utilities"; tier2 = "Jal Board & Utility Services"; tier3 = "Water & Power Supply Disruptions"; priority = "High"; priorityScore = 82.0; break;
            case "Administrative Delays and Maladministration":
                tier1 = "Governance & Administration"; tier2 = "Public Relations & Grievance Cell"; tier3 = "Certificate & Approval Clearances"; priority = "Medium"; priorityScore = 55.0; break;
            case "Abuse of Power or Corruption":
                tier1 = "Governance & Transparency"; tier2 = "Vigilance & Anti-Corruption Bureau"; tier3 = "Bribery & Official Misconduct"; priority = "Critical"; priorityScore = 94.0; break;
            case "Systemic and Policy Issues":
                tier1 = "Urban Infrastructure & Policy"; tier2 = "Public Works Department (PWD)"; tier3 = "Accessibility & Planning Hazards"; priority = "Medium"; priorityScore = 62.0; break;
        }

        return new CategorizationResult(
            bestCategory, confidenceScore, priority, priorityScore,
            tier1, tier2, tier3, intentGuardrailTriggered, primaryIntent, secondaryDescriptors
        );
}
