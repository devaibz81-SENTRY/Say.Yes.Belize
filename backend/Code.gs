/**
 * Google Apps Script — Lead Capture Web App
 * Deploy as Web App → "Anyone" access
 * 
 * SETUP:
 * 1. Create a Google Sheet, copy the ID from the URL
 * 2. Paste sheet ID in CONFIG below
 * 3. Extensions > Apps Script → paste this file
 * 4. Deploy > New Deployment > Web App > Execute as "Me", Access "Anyone"
 * 5. Copy the web app URL → paste into intake.html CONFIG
 */

const CONFIG = {
  SHEET_ID: 'YOUR_GOOGLE_SHEET_ID_HERE',  // ← Replace with your sheet ID
  SHEET_NAME: 'Leads',
  HEADERS: [
    'Timestamp', 'Lead ID', 'Template', 'Email', 'Phone',
    'Guest Count', 'Couple Names', 'Wedding Date', 'Venue',
    'Message', 'Status'
  ]
};

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  
  try {
    const sheet = getOrCreateSheet();
    
    if (e.parameter && e.parameter.action === 'get') {
      // GET: fetch lead by ID
      const leadId = e.parameter.id;
      if (!leadId) throw new Error('Missing lead ID');
      return respond(200, { success: true, data: getLeadById(sheet, leadId) }, headers);
    }
    
    // POST: create or update lead
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    } else {
      throw new Error('No data received');
    }
    
    const timestamp = new Date().toISOString();
    const existingId = data._leadId || '';
    
    if (existingId) {
      // Update existing lead row
      const rowIndex = findRowByLeadId(sheet, existingId);
      if (rowIndex > 0) {
        const row = [
          timestamp,
          existingId,
          data.templateId || '',
          data.email || '',
          data.phone || '',
          data.guests || '',
          data.names || '',
          data.date || '',
          data.location || '',
          data.message || '',
          'updated'
        ];
        sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
        return respond(200, { success: true, leadId: existingId, timestamp, updated: true }, headers);
      }
    }
    
    // Create new lead
    const leadId = generateId();
    const row = [
      timestamp,
      leadId,
      data.templateId || '',
      data.email || '',
      data.phone || '',
      data.guests || '',
      data.names || '',
      data.date || '',
      data.location || '',
      data.message || '',
      'new'
    ];
    
    sheet.appendRow(row);
    
    return respond(200, { success: true, leadId, timestamp }, headers);
    
  } catch (err) {
    return respond(400, { success: false, error: err.message }, headers);
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    sheet.getRange(1, 1, 1, CONFIG.HEADERS.length)
      .setValues([CONFIG.HEADERS])
      .setFontWeight('bold');
  }
  
  return sheet;
}

function getLeadById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = data.length - 1; i > 0; i--) {
    if (data[i][1] === id) {  // Column B = Lead ID
      const lead = {};
      headers.forEach((h, idx) => lead[h] = data[i][idx]);
      return lead;
    }
  }
  return null;
}

function findRowByLeadId(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i > 0; i--) {
    if (data[i][1] === id) return i + 1; // 1-indexed for Sheets API
  }
  return -1;
}

function generateId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function respond(code, payload, headers) {
  const output = ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
  
  // CORS headers are set via the response
  return output;
}
