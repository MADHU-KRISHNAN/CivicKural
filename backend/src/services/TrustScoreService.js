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
      isAuthenticated: Boolean(reqUser),
      userSubmissionCount: reqUser?.submissionCount || 0,
      userResolutionRatio: reqUser?.resolutionRatio || 0.8,
      hasVoiceNote: newReport.hasVoice,
      title: newReport.title || '',
      description: newReport.description || ''
    });

    let baseScore = trustResult.trustScore; // Out of 100
    
    let reputationWeight = 0;
    let aiVisionScore = 0;
    let penalties = 0;
    let isSuspiciousImage = false;

    // A. Past Report History (Reputation Factor)
    if (reqUser && (reqUser.id || reqUser._id)) {
      const citizenId = reqUser.id || reqUser._id;
      const resolvedReportsCount = await Report.countDocuments({ citizenId: citizenId, status: 'Resolved' });
      // Fake reports are mapped to 'Rejected' status in our schema
      const fakeReportCount = await Report.countDocuments({ citizenId: citizenId, status: 'Rejected' });

      if (resolvedReportsCount > 3 && fakeReportCount === 0) {
        reputationWeight = 10;
      } else if (fakeReportCount > 0) {
        penalties = 25; // Deduct -25%
      }
    }

    // B. AI Visual Authenticity & Relevancy Check (Simulated via mock flags for testing)
    if (newReport.mockAiGenerated || newReport.mockStockPhoto) {
      isSuspiciousImage = true;
    }

    if (newReport.mockImageToTextMatch) {
      aiVisionScore += 15;
    }

    // Calculate Final Initial Trust Score
    let finalTrustScore = baseScore + reputationWeight + aiVisionScore - penalties;
    
    // Apply Suspicious Image Penalty Cap
    if (isSuspiciousImage) {
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

    return {
      trustScore: finalTrustScore,
      trustScoreDecimal: parseFloat((finalTrustScore / 100.0).toFixed(2)),
      trustTier,
      isSuspiciousImage
    };
  }
}

module.exports = TrustScoreService;
