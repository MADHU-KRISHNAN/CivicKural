/**
 * Simulated AI Pipeline Service for CivicKural Platform
 * Performs:
 * 1. 3-Tier Hierarchical Categorization & 768-Dim Vector Embedding Generation
 * 2. Cosine Distance Duplicate Detection
 * 3. EXIF Forensic Trust Scoring
 * 4. Dynamic Mathematical Priority Scoring
 */

// Simple deterministic hash for 768-dim mock vector embedding generation
function stringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generate a deterministic 768-dim vector embedding representing text content (DistilBERT simulation)
function generateVectorEmbedding(text) {
  const seed = stringHash(text || 'civic');
  const vector = [];
  for (let i = 0; i < 768; i++) {
    const val = Math.sin(seed + i * 0.1);
    vector.push(parseFloat(val.toFixed(6)));
  }
  return vector;
}

// Calculate Cosine Similarity between two 768-dim vectors
function calculateCosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Map 5 civic categories into 3-tier hierarchical taxonomy
function determine3TierCategory(category, title = '', description = '') {
  const combined = `${category} ${title} ${description}`.toLowerCase();

  if (category === 'Sanitary & Public Hygiene' || combined.includes('garbage') || combined.includes('sewage') || combined.includes('waste')) {
    return {
      tier1: 'Public Health & Sanitation',
      tier2: 'Sanitation Board',
      tier3: combined.includes('sewage') ? 'Sewage & Drainage Overflow' : 'Garbage & Solid Waste Dump',
    };
  }

  if (category === 'Service Delivery Deficiencies' || combined.includes('water') || combined.includes('light') || combined.includes('power')) {
    return {
      tier1: 'Infrastructure & Utilities',
      tier2: combined.includes('water') ? 'Jal Board & Utility Services' : 'Electrical & Lighting Cell',
      tier3: combined.includes('water') ? 'Water Supply Outage' : 'Streetlight Outage',
    };
  }

  if (category === 'Administrative Delays and Maladministration' || combined.includes('certificate') || combined.includes('delay')) {
    return {
      tier1: 'Governance & Administration',
      tier2: 'Public Relations & Grievance Cell',
      tier3: 'Certificate & Clearance Stalls',
    };
  }

  if (category === 'Abuse of Power or Corruption' || combined.includes('bribe') || combined.includes('extortion')) {
    return {
      tier1: 'Governance & Transparency',
      tier2: 'Vigilance & Anti-Corruption Bureau',
      tier3: 'Bribery & Abuse of Authority',
    };
  }

  return {
    tier1: 'Infrastructure & Civic Policy',
    tier2: 'Public Works Dept (PWD)',
    tier3: 'Accessibility & Structural Deficiencies',
  };
}

// Calculate EXIF Forensic Trust Score (0.0 - 1.0)
function calculateTrustScore(photos = [], location = {}) {
  if (!photos || photos.length === 0) {
    return 0.50; // No photo attached
  }

  const firstPhoto = photos[0];
  // If photo has filename/mimetype indicating live camera capture
  if (firstPhoto.originalName || firstPhoto.filename) {
    return 0.95; // Verified camera capture
  }

  return 0.75; // Standard upload
}

// Calculate Dynamic Priority Score using mathematical formula:
// Priority Score = 0.5 * NLP_Severity + 0.3 * Upvote_Factor + 0.2 * Area_Risk
function calculatePriorityScore({ title = '', description = '', category = '', upvotes = 0, latitude = 0, longitude = 0 }) {
  const combinedText = `${title} ${description}`.toLowerCase();

  // 1. NLP Severity (0 - 100)
  let nlpSeverity = 35;
  const criticalKeywords = ['emergency', 'collapse', 'danger', 'wire', 'fire', 'flood', 'hazard', 'outrage', 'bribe', 'sewage', 'burst'];
  const highKeywords = ['overflow', 'cut', 'blocked', 'leak', 'accident', 'unauthorized', 'urgent'];

  let matchedCritical = criticalKeywords.filter((k) => combinedText.includes(k)).length;
  let matchedHigh = highKeywords.filter((k) => combinedText.includes(k)).length;

  if (matchedCritical > 0) {
    nlpSeverity = Math.min(100, 75 + matchedCritical * 10);
  } else if (matchedHigh > 0) {
    nlpSeverity = Math.min(80, 50 + matchedHigh * 10);
  }

  if (category === 'Abuse of Power or Corruption') {
    nlpSeverity = Math.max(nlpSeverity, 85);
  }

  // 2. Upvote Factor (0 - 100)
  const upvoteFactor = Math.min(upvotes * 10, 100);

  // 3. Historical Area Risk Factor (0 - 100)
  const locSeed = Math.abs(Math.round((latitude + longitude) * 100));
  const areaRisk = 30 + (locSeed % 50);

  // Weighted Priority Score formula: 0.5 * w1 + 0.3 * w2 + 0.2 * w3
  const rawScore = 0.5 * nlpSeverity + 0.3 * upvoteFactor + 0.2 * areaRisk;
  const priorityScore = parseFloat(Math.min(100, Math.max(0, rawScore)).toFixed(2));

  let suggestedPriority = 'Medium';
  if (priorityScore > 75) suggestedPriority = 'Critical';
  else if (priorityScore > 55) suggestedPriority = 'High';
  else if (priorityScore <= 35) suggestedPriority = 'Low';

  return {
    priorityScore,
    nlpSeverity,
    areaRisk,
    suggestedPriority,
  };
}

/**
 * Main AI Pipeline processing entry point
 */
function processReport({ title, description, category, photos, location, upvotes = 0 }, existingReports = []) {
  const textContent = `${title} ${description}`;
  const vectorEmbedding = generateVectorEmbedding(textContent);
  const { tier1, tier2, tier3 } = determine3TierCategory(category, title, description);
  const trustScore = calculateTrustScore(photos, location);
  const { priorityScore, nlpSeverity, areaRisk, suggestedPriority } = calculatePriorityScore({
    title,
    description,
    category,
    upvotes,
    latitude: location?.coordinates ? location.coordinates[1] : 0,
    longitude: location?.coordinates ? location.coordinates[0] : 0,
  });

  // Check Cosine Similarity against existing nearby reports
  let isDuplicate = false;
  let masterTicketId = null;
  let highestSimilarity = 0;

  for (const report of existingReports) {
    if (report.vectorEmbedding && report.vectorEmbedding.length > 0) {
      const similarity = calculateCosineSimilarity(vectorEmbedding, report.vectorEmbedding);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
      }
      if (similarity >= 0.85) {
        isDuplicate = true;
        masterTicketId = report._id || report.id;
        break;
      }
    }
  }

  return {
    tier1,
    tier2,
    tier3,
    vectorEmbedding,
    trustScore,
    priorityScore,
    isDuplicate,
    masterTicketId,
    aiSuggestions: {
      suggestedCategory: category,
      suggestedPriority,
      confidence: parseFloat((0.85 + (stringHash(textContent) % 15) / 100).toFixed(2)),
      urgencyScore: nlpSeverity,
      sentimentScore: isDuplicate ? -0.2 : -0.5,
      summary: `AI Classified into ${tier1} -> ${tier2}. NLP Severity: ${nlpSeverity}/100. Priority Score: ${priorityScore}`,
      processedAt: new Date(),
    },
  };
}

module.exports = {
  generateVectorEmbedding,
  calculateCosineSimilarity,
  determine3TierCategory,
  calculateTrustScore,
  calculatePriorityScore,
  processReport,
};
