const API_URL = 'http://127.0.0.1:5000/api';

async function runSimulation() {
  try {
    console.log('--- Starting Complaint Simulation ---');
    
    // Register 3 users
    const users = [];
    for(let i=1; i<=3; i++) {
      const email = `testuser${i}_${Date.now()}@example.com`;
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Test User ${i}`,
          email,
          password: 'password123',
          role: 'citizen'
        })
      });
      const data = await res.json();
      if (!data.success) {
        console.error(`Register failed for user ${i}:`, data);
        return;
      }
      users.push({ token: data.token, email });
      console.log(`Registered user ${i}: ${email}`);
    }

    // Prepare multipart/form-data manually or just use standard FormData from Node 22
    const createFormData = (title, description, lat, lng, addr) => {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      fd.append('category', 'Service Delivery Deficiencies');
      fd.append('longitude', lng);
      fd.append('latitude', lat);
      fd.append('address', addr);
      return fd;
    };

    console.log('\n--- Submitting First Complaint (Master Ticket) ---');
    const fd1 = createFormData(
      'Massive open pothole causing accidents',
      'There is a huge pothole on Main St that has already caused three accidents today. This is very dangerous and needs immediate attention.',
      '12.9716', '77.5946', 'Main St, Bangalore'
    );
    
    const res1 = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${users[0].token}`
      },
      body: fd1
    });
    const data1 = await res1.json();
    
    if(!data1.success) {
      console.error('Failed to create master report:', data1);
      return;
    }
    
    const masterTicketId = data1.report._id;
    console.log(`Master Ticket ID: ${masterTicketId}`);
    console.log(`Initial Priority Score: ${data1.report.priorityScore}`);
    console.log(`Initial Upvotes: ${data1.report.upvotes || 0}`);

    console.log('\n--- Submitting Duplicate Complaints ---');
    for(let i=1; i<3; i++) {
      const fdDup = createFormData(
        'Huge pothole on Main St is dangerous',
        'There is a huge pothole on Main St that has already caused three accidents today. Please fix this.',
        '12.9717', '77.5947', 'Main St, Bangalore' // slightly different coords
      );
      const resDup = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${users[i].token}`
        },
        body: fdDup
      });
      const dataDup = await resDup.json();
      if (!dataDup.success) {
        console.error(`Failed duplicate ${i}:`, dataDup);
      } else {
        console.log(`Duplicate ${i} submitted by user ${i+1}. Is Duplicate: ${dataDup.report.isDuplicate}. Master Ticket matched: ${dataDup.report.masterTicketId}`);
      }
    }

    console.log('\n--- Fetching Master Ticket to see updated values ---');
    const resMaster = await fetch(`${API_URL}/reports/${masterTicketId}`, {
      headers: { 'Authorization': `Bearer ${users[0].token}` }
    });
    const dataMaster = await resMaster.json();

    console.log(`Master Ticket Upvotes: ${dataMaster.report.upvotes}`);
    console.log(`Master Ticket Priority Score: ${dataMaster.report.priorityScore}`);
    
    if (dataMaster.report.priorityScore === data1.report.priorityScore) {
      console.log('\nWARNING: Priority Score did not change! We might need to update the backend logic to recalculate priority when upvotes increase.');
    } else {
      console.log('\nSUCCESS: Priority Score increased!');
    }

  } catch (error) {
    console.error('Simulation error:', error);
  }
}

runSimulation();
