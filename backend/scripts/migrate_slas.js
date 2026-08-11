const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Report = require('../src/models/Report');
const SlaEngineService = require('../src/services/slaEngineService');

async function migrateSlas() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const reports = await Report.find({});
    console.log(`Found ${reports.length} reports to evaluate.`);

    let updatedCount = 0;

    for (const report of reports) {
      // Always recalculate based on createdAt for older reports
      const slaResult = SlaEngineService.calculateSla(report, null);
      
      const now = new Date();
      const isBreached = now > slaResult.expectedResolutionDate && !['Resolved', 'Closed', 'Rejected'].includes(report.status);

      report.sla = {
        forecastedHours: slaResult.forecastedHours,
        expectedResolutionDate: slaResult.expectedResolutionDate,
        isBreached: isBreached,
        breachedAt: isBreached ? (report.sla?.breachedAt || now) : null,
        escalationLevel: report.sla?.escalationLevel || (isBreached ? 1 : 0)
      };

      if (isBreached && report.priority !== 'Critical') {
        report.priority = 'Critical';
      }

      await report.save();
      updatedCount++;
    }

    console.log(`🎉 Successfully updated SLAs for ${updatedCount} reports!`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

migrateSlas();
