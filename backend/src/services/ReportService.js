const Report = require('../models/Report');
const TrustScoreService = require('./TrustScoreService');
const aiPipeline = require('./aiPipeline');

class ReportService {
  /**
   * Processes a new report submission, applying multi-citizen clustering
   * and updating Trust Scores accordingly.
   */
  static async processReportSubmission(reportData, reqUser) {
    const citizenId = reqUser ? (reqUser.id || reqUser._id) : null;
    
    // 1. Check for nearby identical complaints (within 50 meters, same category, not resolved)
    if (reportData.location && reportData.location.coordinates && reportData.location.coordinates.length === 2 && citizenId) {
      const longitude = reportData.location.coordinates[0];
      const latitude = reportData.location.coordinates[1];
      
      const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
      
      const nearbyCluster = await Report.findOne({
        createdAt: { $gte: seventyTwoHoursAgo },
        location: {
          $near: {
            $geometry: { 
              type: "Point", 
              coordinates: [parseFloat(longitude), parseFloat(latitude)] 
            },
            $maxDistance: 50 // meters
          }
        },
        category: reportData.category,
        status: { $nin: ['Resolved', 'Closed', 'Rejected'] }
      });

      if (nearbyCluster && nearbyCluster.citizenId && nearbyCluster.citizenId.toString() !== citizenId.toString()) {
        // Multi-citizen validation triggered!
        const isSecondSubmission = (nearbyCluster.multiCitizenConfirmations || 0) === 0;
        const boost = isSecondSubmission ? 0.07 : 0.06;
        const updatedTrustScore = Math.min(1.0, nearbyCluster.trustScore + boost);
        
        const updatedReport = await Report.findByIdAndUpdate(nearbyCluster._id, {
          trustScore: updatedTrustScore,
          $inc: { multiCitizenConfirmations: 1, upvotes: 1 },
          $push: { secondaryReporters: citizenId }
        }, { new: true }).populate('citizenId', 'name email');

        return {
          isMerged: true,
          message: "Report merged with existing issue cluster. Trust Score boosted!",
          primaryReportId: nearbyCluster._id,
          newTrustScore: updatedTrustScore,
          report: updatedReport
        };
      }
    }

    // 2. Otherwise, calculate single-reporter base Trust Score
    const trustResult = await TrustScoreService.calculateBaseTrustScore({
      hasPhoto: reportData.photos && reportData.photos.length > 0,
      hasVoice: Boolean(reportData.audioTranscript || (reportData.description && reportData.description.includes('[🎤 Voice Note Attached]'))),
      latitude: reportData.location?.coordinates?.[1],
      longitude: reportData.location?.coordinates?.[0],
      title: reportData.title,
      description: reportData.description,
      // Pass mock flags if present for testing
      mockAiGenerated: reportData.mockAiGenerated,
      mockStockPhoto: reportData.mockStockPhoto,
      mockImageToTextMatch: reportData.mockImageToTextMatch
    }, reqUser);

    reportData.trustScore = trustResult.trustScoreDecimal;
    reportData.trustTier = trustResult.trustTier;
    reportData.isSuspiciousImage = trustResult.isSuspiciousImage;
    reportData.imageAuthenticity = trustResult.imageAuthenticity;
    if (trustResult.trustTier === 'LOW_TRUST_SPAM') {
        reportData.status = 'Rejected';
    } else {
        reportData.status = 'Submitted';
    }
    
    // Add citizen mapping
    reportData.citizenId = citizenId;

    // Process through simulated AI Pipeline (to maintain existing functionality)
    let nearbyReports = [];
    try {
      if (reportData.location && reportData.location.coordinates) {
        nearbyReports = await Report.findNearby(reportData.location.coordinates[0], reportData.location.coordinates[1], 200).select('+vectorEmbedding');
      }
    } catch (e) {
      nearbyReports = await Report.find().limit(20).select('+vectorEmbedding');
    }

    const aiResult = aiPipeline.processReport(
      { 
        title: reportData.title, 
        description: reportData.description, 
        category: reportData.category, 
        photos: reportData.photos || [], 
        location: reportData.location 
      },
      nearbyReports
    );

    reportData.tier1 = aiResult.tier1 || reportData.tier1;
    reportData.tier2 = aiResult.tier2 || reportData.tier2;
    reportData.tier3 = aiResult.tier3 || reportData.tier3;
    reportData.priorityScore = aiResult.priorityScore || reportData.priorityScore;
    reportData.vectorEmbedding = aiResult.vectorEmbedding;
    reportData.isDuplicate = aiResult.isDuplicate;
    reportData.masterTicketId = aiResult.masterTicketId;
    reportData.aiSuggestions = aiResult.aiSuggestions;
    
    if (aiResult.aiSuggestions?.suggestedPriority) {
      reportData.priority = aiResult.aiSuggestions.suggestedPriority;
    }

    const report = await Report.create(reportData);

    // If aiPipeline duplicate detected, increment upvotes on master ticket and recalculate priority score
    if (aiResult.isDuplicate && aiResult.masterTicketId) {
      const masterTicket = await Report.findById(aiResult.masterTicketId);
      if (masterTicket) {
        masterTicket.upvotes = (masterTicket.upvotes || 0) + 1;
        
        // Recalculate the Priority Score with the new upvote count
        const updatedScores = aiPipeline.calculatePriorityScore({
          title: masterTicket.title,
          description: masterTicket.description,
          category: masterTicket.category,
          upvotes: masterTicket.upvotes,
          latitude: masterTicket.location?.coordinates ? masterTicket.location.coordinates[1] : 0,
          longitude: masterTicket.location?.coordinates ? masterTicket.location.coordinates[0] : 0,
        });
        
        masterTicket.priorityScore = updatedScores.priorityScore;
        if (updatedScores.suggestedPriority) {
          masterTicket.priority = updatedScores.suggestedPriority;
        }
        
        await masterTicket.save();
      }
    }

    await report.populate('citizenId', 'name email');
    
    return {
      isMerged: false,
      message: "New report created successfully",
      report
    };
  }
}

module.exports = ReportService;
