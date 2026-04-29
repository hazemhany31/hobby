/**
 * HobbyGo - Google Apps Script Backend
 * =====================================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets → Extensions → Apps Script
 * 2. Paste this entire script
 * 3. Click Deploy → New deployment → Web app
 * 4. Set "Execute as" = Me, "Who has access" = Anyone
 * 5. Click Deploy and copy the URL
 * 6. Replace YOUR_DEPLOYMENT_ID in script.js and admin.html
 * 
 * SHEET STRUCTURE:
 * Your Google Sheet should have these column headers in Row 1:
 * bookingId | hobby | kit | duration | price | delivery | insurance | 
 * discount | total | days | name | phone | address | national_id | 
 * id_front | id_back | paymentMethod | paymentScreenshot | timestamp | status | lastUpdated
 */

const SHEET_NAME = 'Bookings'; // Name of your sheet tab

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getBookings') {
    return getBookings();
  }
  
  if (action === 'getStatus') {
    const bookingId = e.parameter.bookingId;
    return getBookingStatus(bookingId);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: 'Unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // If it has a status field and no other booking details, it's a status update
    if (data.bookingId && data.status && !data.name) {
      return updateBookingStatus(data.bookingId, data.status);
    }
    
    // Otherwise it's a new booking
    return addBooking(data);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── GET ALL BOOKINGS ──────────────────────────────────────────────────
function getBookings() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const headers = data[0];
  const bookings = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((header, j) => {
      row[header] = data[i][j];
    });
    if (row.bookingId) {
      bookings.push(row);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(bookings))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── GET SINGLE BOOKING STATUS ─────────────────────────────────────────
function getBookingStatus(bookingId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet || !bookingId) {
    return ContentService.createTextOutput(JSON.stringify(null))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const bookingIdCol = headers.indexOf('bookingId');
  
  if (bookingIdCol === -1) {
    return ContentService.createTextOutput(JSON.stringify(null))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][bookingIdCol] === bookingId) {
      const row = {};
      headers.forEach((header, j) => {
        row[header] = data[i][j];
      });
      return ContentService.createTextOutput(JSON.stringify(row))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(null))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── UPDATE BOOKING STATUS ─────────────────────────────────────────────
function updateBookingStatus(bookingId, newStatus) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Sheet not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const bookingIdCol = headers.indexOf('bookingId');
  const statusCol = headers.indexOf('status');
  const lastUpdatedCol = headers.indexOf('lastUpdated');
  
  if (bookingIdCol === -1 || statusCol === -1) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Missing columns' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][bookingIdCol] === bookingId) {
      sheet.getRange(i + 1, statusCol + 1).setValue(newStatus);
      if (lastUpdatedCol !== -1) {
        sheet.getRange(i + 1, lastUpdatedCol + 1).setValue(new Date().toISOString());
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, bookingId, status: newStatus }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Booking not found' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── ADD NEW BOOKING ───────────────────────────────────────────────────
function addBooking(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Sheet not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(header => data[header] || '');
  
  // Set default status if not provided
  const statusIdx = headers.indexOf('status');
  if (statusIdx !== -1 && !row[statusIdx]) {
    row[statusIdx] = 'pending';
  }
  
  sheet.appendRow(row);
  
  return ContentService.createTextOutput(JSON.stringify({ success: true, bookingId: data.bookingId }))
    .setMimeType(ContentService.MimeType.JSON);
}
