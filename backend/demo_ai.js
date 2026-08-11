const aiPipeline = require('./src/services/aiPipeline');

console.log('================================================');
console.log('🏛️  CIVICKURAL AI PIPELINE SIMULATION  🏛️');
console.log('================================================\n');

// Mock database to hold our reports
const reportsDB = [];

// Helper function to simulate saving to DB and handling upvotes
function submitComplaint(user, title, description, lat, lng) {
  console.log(`\nCitizen [${user}] is submitting a new complaint...`);
  console.log(`Title: "${title}"`);
  
  const incomingReport = {
    title,
    description,
    category: 'Infrastructure & Utilities',
    location: { type: 'Point', coordinates: [lng, lat] },
    upvotes: 0
  };

  // 1. Run through AI Pipeline
  const aiResult = aiPipeline.processReport(incomingReport, reportsDB);

  // 2. Check if it's a duplicate
  if (aiResult.isDuplicate && aiResult.masterTicketId) {
    console.log(`⚠️  AI DETECTED DUPLICATE: Matching vector embeddings (Cosine > 0.85)`);
    console.log(`🔗  Linking to Master Ticket ID: ${aiResult.masterTicketId}`);
    
    // Find master ticket
    const masterTicket = reportsDB.find(r => r.id === aiResult.masterTicketId);
    if (masterTicket) {
      // 3. Increment upvotes on Master Ticket
      masterTicket.upvotes += 1;
      
      // 4. Recalculate Priority Score
      const updatedScores = aiPipeline.calculatePriorityScore({
        title: masterTicket.title,
        description: masterTicket.description,
        category: masterTicket.category,
        upvotes: masterTicket.upvotes,
        latitude: masterTicket.location.coordinates[1],
        longitude: masterTicket.location.coordinates[0],
      });
      
      masterTicket.priorityScore = updatedScores.priorityScore;
      masterTicket.priority = updatedScores.suggestedPriority;

      console.log(`📈  Master Ticket Upvoted! Total upvotes: ${masterTicket.upvotes}`);
      console.log(`🔥  Master Ticket Priority Score Increased to: ${masterTicket.priorityScore} (${masterTicket.priority})`);
    }

    // Save the new duplicate report as a distinct record but linked to master
    incomingReport.id = `RPT-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    incomingReport.isDuplicate = true;
    incomingReport.masterTicketId = aiResult.masterTicketId;
    incomingReport.priorityScore = aiResult.priorityScore;
    reportsDB.push(incomingReport);
    console.log(`✅  Duplicate complaint saved successfully as distinctly different ID: ${incomingReport.id}`);

  } else {
    // Save as a brand new Master Ticket
    incomingReport.id = `MASTER-${Date.now()}`;
    incomingReport.vectorEmbedding = aiResult.vectorEmbedding;
    incomingReport.priorityScore = aiResult.priorityScore;
    incomingReport.priority = aiResult.aiSuggestions.suggestedPriority;
    incomingReport.isDuplicate = false;
    reportsDB.push(incomingReport);

    console.log(`✅  NEW MASTER TICKET CREATED: ID ${incomingReport.id}`);
    console.log(`🔥  Initial Priority Score: ${incomingReport.priorityScore} (${incomingReport.priority})`);
  }
}

// --- RUN SIMULATION ---

// To trigger the mock vector similarity, the text must be identical
const exactTitle = 'Massive open pothole causing accidents';
const exactDesc = 'There is a huge pothole on Main St that has already caused three accidents today. This is very dangerous and needs immediate attention.';

// 1. First user submits the pothole complaint
submitComplaint('User 1', exactTitle, exactDesc, 12.9716, 77.5946);

// 2. Second user submits EXACT same issue
submitComplaint('User 2', exactTitle, exactDesc, 12.9716, 77.5946);

// 3. Third user submits EXACT same issue
submitComplaint('User 3', exactTitle, exactDesc, 12.9716, 77.5946);

console.log('\n================================================');
console.log('📊 FINAL DATABASE STATE (All Complaints Stored)');
console.log('================================================');
reportsDB.forEach(r => {
  console.log(`- ID: ${r.id} | Duplicate? ${r.isDuplicate ? 'YES' : 'NO'} | Linked to: ${r.masterTicketId || 'N/A'}`);
});
