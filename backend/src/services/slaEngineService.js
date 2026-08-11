const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

/**
 * SLA Engine Service
 * 
 * Reads sla_model_weights.json and computes expected resolution time
 * for new reports with dynamic modifiers based on Trust Score and community upvotes.
 */

// Load model weights on startup
let modelWeights = null;
try {
  const weightsPath = path.join(__dirname, '../../../sla_model_weights.json');
  const raw = fs.readFileSync(weightsPath, 'utf8');
  modelWeights = JSON.parse(raw);
  logger.info('SLA Model Weights loaded successfully');
} catch (err) {
  logger.warn(`Could not load SLA model weights: ${err.message}. Using defaults.`);
  modelWeights = {
    overall_median_hours: 20.2,
    category_base_sla_hours: {}
  };
}

/**
 * Map CivicKural's 5 categories to approximate SLA base hours
 * derived from the trained BMC model weights.
 * 
 * Mapping rationale (from sla_model_weights.json category_base_sla_hours):
 *   - Sanitary & Public Hygiene → ~11h (fast-tracked sanitation complaints)
 *   - Service Delivery Deficiencies → ~16h (moderate service issues)
 *   - Administrative Delays → ~24h (bureaucratic processing)
 *   - Abuse of Power or Corruption → ~30h (investigation required)
 *   - Systemic and Policy Issues → ~20h (median fallback)
 */
const CATEGORY_SLA_MAP = {
  'Sanitary & Public Hygiene': 11.3,
  'Service Delivery Deficiencies': 16.0,
  'Administrative Delays and Maladministration': 23.8,
  'Abuse of Power or Corruption': 30.4,
  'Systemic and Policy Issues': modelWeights?.overall_median_hours || 20.2
};

class SlaEngineService {
  /**
   * Calculate SLA forecast for a report.
   * 
   * @param {Object} report - The report document (must have category, createdAt, trustScore, upvotes)
   * @param {Object} user - The citizen user who submitted the report
   * @returns {{ forecastedHours: number, expectedResolutionDate: Date }}
   */
  static calculateSla(report, user) {
    // 1. Get base SLA hours from category mapping or fallback to overall median
    let baseHours = CATEGORY_SLA_MAP[report.category];
    if (!baseHours) {
      baseHours = modelWeights?.overall_median_hours || 20.2;
    }

    let adjustedHours = baseHours;

    // 2. Dynamic Modifier: Trust Score ≥ 80% → reduce by 15%
    const trustScore = report.trustScore || 0;
    // trustScore is stored as decimal (0-1) in the DB
    const trustPercent = trustScore <= 1 ? trustScore * 100 : trustScore;
    if (trustPercent >= 80) {
      adjustedHours *= 0.85;
      logger.info(`SLA: Trust Score ${trustPercent.toFixed(0)}% ≥ 80% → 15% reduction applied`);
    }

    // 3. Dynamic Modifier: Upvotes > 5 → reduce by additional 10%
    const upvotes = report.upvotes || 0;
    if (upvotes > 5) {
      adjustedHours *= 0.90;
      logger.info(`SLA: ${upvotes} upvotes > 5 → additional 10% reduction applied`);
    }

    // Round to 1 decimal place
    const forecastedHours = Math.round(adjustedHours * 10) / 10;

    // 4. Compute expected resolution date
    const createdAt = report.createdAt ? new Date(report.createdAt) : new Date();
    const expectedResolutionDate = new Date(
      createdAt.getTime() + (forecastedHours * 3600 * 1000)
    );

    logger.info(
      `SLA Forecast: Category="${report.category}", Base=${baseHours}h, Adjusted=${forecastedHours}h, ` +
      `Expected by ${expectedResolutionDate.toISOString()}`
    );

    return {
      forecastedHours,
      expectedResolutionDate
    };
  }

  /**
   * Get the base SLA hours for a category (useful for display)
   */
  static getBaseSlaHours(category) {
    return CATEGORY_SLA_MAP[category] || modelWeights?.overall_median_hours || 20.2;
  }

  /**
   * Get model metadata
   */
  static getModelInfo() {
    return {
      modelType: modelWeights?.model_type || 'Unknown',
      optimizedMaeHours: modelWeights?.optimized_mae_hours || null,
      overallMedianHours: modelWeights?.overall_median_hours || 20.2,
      categoryMapping: CATEGORY_SLA_MAP
    };
  }
}

module.exports = SlaEngineService;
