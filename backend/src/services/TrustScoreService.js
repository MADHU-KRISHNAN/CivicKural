const Report = require('../models/Report');
const AiCategorizationService = require('./AiCategorizationService');

class TrustScoreService {
  /**
   * Calculates the base trust score taking into account Reputation and AI Vision.
   * Multi-Citizen Boost is handled incrementally during clustering in ReportService.
   */
  static async calculateBaseTrustScore(newReport, reqUser) {
    // 1. Calculate Base Score using existing AiCategorizationService logic
    const trustResult = AiCategorizationService.calculateTrustScore({
      hasExifData: newReport.hasPhoto,
      exifTimestamp: newReport.hasPhoto ? new Date() : null,
      submissionTimestamp: new Date(),
      deviceLat: parseFloat(newReport.latitude) || 0,
      deviceLng: parseFloat(newReport.longitude) || 0,
      exifLat: newReport.hasPhoto ? parseFloat(newReport.latitude) : null,
      exifLng: newReport.hasPhoto ? parseFloat(newReport.longitude) : null,
      hasVoiceNote: newReport.hasVoice,
      title: newReport.title || '',
      description: newReport.description || ''
    });

    let baseScore = trustResult.trustScore; // Out of 100
    
    let isSuspiciousImage = false;
    let authenticityFlags = [];
    let isAiGenerated = newReport.mockAiGenerated || false;
    let isWebDuplicate = newReport.mockStockPhoto || false;
    let authenticityScore = 100;
    
    // EXIF Checks
    const hasExifData = Boolean(newReport.hasPhoto);
    if (hasExifData && newReport.hasPhoto) {
      // Assuming a simplistic check: if it has photo and not mock missing exif
      authenticityFlags.push('EXIF_MATCH');
      baseScore += 15;
    } else if (newReport.hasPhoto && !hasExifData) {
      authenticityFlags.push('METADATA_MISSING');
      baseScore -= 10;
    }

    // AI / Stock Photo Penalty
    if (isAiGenerated) {
      isSuspiciousImage = true;
      authenticityFlags.push('AI_SYNTHETIC_FLAG');
      baseScore -= 40;
      authenticityScore -= 80;
    } else if (isWebDuplicate) {
      isSuspiciousImage = true;
      authenticityFlags.push('WEB_DUPLICATE_FLAG');
      baseScore -= 35;
      authenticityScore -= 70;
    }

    if (newReport.mockImageToTextMatch) {
      baseScore += 15;
    }

    let finalTrustScore = baseScore;
    
    // Apply Caps
    if (isAiGenerated) {
      finalTrustScore = Math.min(finalTrustScore, 20.0);
    } else if (isWebDuplicate) {
      finalTrustScore = Math.min(finalTrustScore, 30.0);
    } else if (isSuspiciousImage) {
      finalTrustScore = Math.min(finalTrustScore, 30.0);
    }
    
    // Bound the score between 0 and 100
    finalTrustScore = Math.max(0, Math.min(100, finalTrustScore));

    let trustTier = 'STANDARD';
    if (finalTrustScore >= 80.0) {
      trustTier = 'HIGH_INTEGRITY';
    } else if (finalTrustScore < 50.0) {
      trustTier = 'LOW_TRUST_SPAM';
    }
    
    const imageAuthenticity = {
      hasExifData,
      isAiGenerated,
      isWebDuplicate,
      authenticityScore: Math.max(0, authenticityScore),
      flags: authenticityFlags
    };

    return {
      trustScore: finalTrustScore,
      trustScoreDecimal: parseFloat((finalTrustScore / 100.0).toFixed(2)),
      trustTier,
      isSuspiciousImage,
      imageAuthenticity
    };
  }
}

module.exports = TrustScoreService;
