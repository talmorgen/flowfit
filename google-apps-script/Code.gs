const SPREADSHEET_ID = '1u6ghNHU7x5S3EH6P3KbiT9TKP5wj9yCZbARiozbOU2k';
const SETS_SHEET = 'FlowFit Sets';
const GARMIN_ACTIVITIES_SHEET = 'Garmin Activities';
const GARMIN_HEALTH_SHEET = 'Garmin Health';

function doGet() {
  return json({ ok: true, service: 'FlowFit' });
}

function doPost(event) {
  try {
    const body = JSON.parse(event.postData.contents || '{}');
    const expectedSecret = PropertiesService.getScriptProperties().getProperty('FLOWFIT_SECRET');
    if (!expectedSecret || body.secret !== expectedSecret) return json({ ok: false, error: 'unauthorized' });

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    if (body.action === 'ping') return json({ ok: true, service: 'FlowFit' });
    if (body.action === 'saveSet') return saveSet(spreadsheet, body.set || {});
    if (body.action === 'getRecentSets') return getRecentSets(spreadsheet, Number(body.limit) || 200);
    if (body.action === 'syncGarmin') return syncGarmin(spreadsheet, body.activities || [], body.health || []);
    if (body.action === 'getGarminDashboard') return getGarminDashboard(spreadsheet);
    return json({ ok: false, error: 'unknown_action' });
  } catch (error) {
    return json({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function syncGarmin(spreadsheet, activities, health) {
  const activitySheet = spreadsheet.getSheetByName(GARMIN_ACTIVITIES_SHEET);
  const healthSheet = spreadsheet.getSheetByName(GARMIN_HEALTH_SHEET);
  if (!activitySheet || !healthSheet) return json({ ok: false, error: 'missing_garmin_sheets' });

  const activityRows = activities.map(item => [item.activityId, item.startTime, item.activityType, item.name, item.durationMin, item.distanceKm, item.calories, item.avgHr, item.maxHr, item.aerobicEffect, item.anaerobicEffect, item.trainingLoad, item.sourceDevice, new Date()]);
  const healthRows = health.map(item => [item.date, item.sleepScore, item.sleepHours, item.hrvStatus, item.hrvLastNightMs, item.restingHr, item.bodyBatteryHigh, item.bodyBatteryLow, item.stressAvg, item.steps, item.calories, item.intensityMinutes, item.readinessScore, new Date()]);
  upsertRows(activitySheet, activityRows, 0);
  upsertRows(healthSheet, healthRows, 0);
  SpreadsheetApp.flush();
  return json({ ok: true, activities: activityRows.length, healthDays: healthRows.length });
}

function upsertRows(sheet, rows, keyIndex) {
  if (!rows.length) return;
  const lastRow = sheet.getLastRow();
  const existingKeys = lastRow > 1 ? sheet.getRange(2, keyIndex + 1, lastRow - 1, 1).getDisplayValues().flat() : [];
  const locations = Object.fromEntries(existingKeys.map((key, index) => [String(key), index + 2]));
  rows.forEach(row => {
    const key = String(row[keyIndex]);
    if (!key) return;
    if (locations[key]) sheet.getRange(locations[key], 1, 1, row.length).setValues([row]);
    else { sheet.appendRow(row); locations[key] = sheet.getLastRow(); }
  });
}

function getGarminDashboard(spreadsheet) {
  const activitySheet = spreadsheet.getSheetByName(GARMIN_ACTIVITIES_SHEET);
  const healthSheet = spreadsheet.getSheetByName(GARMIN_HEALTH_SHEET);
  const activities = recentRows(activitySheet, 14, 20);
  const health = recentRows(healthSheet, 14, 14);
  return json({ ok: true, activities, health, latestHealth: health[0] || null });
}

function recentRows(sheet, width, limit) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  const count = Math.min(limit, sheet.getLastRow() - 1);
  return sheet.getRange(sheet.getLastRow() - count + 1, 1, count, width).getDisplayValues().reverse();
}

function saveSet(spreadsheet, set) {
  const sheet = spreadsheet.getSheetByName(SETS_SHEET);
  if (!sheet) return json({ ok: false, error: 'missing_flowfit_sets_sheet' });

  sheet.appendRow([
    set.setId || Utilities.getUuid(),
    set.workoutId || Utilities.getUuid(),
    new Date(),
    set.planName || '',
    set.activityType || 'strength',
    set.exerciseName || '',
    Number(set.setNumber) || 1,
    Number(set.reps) || 0,
    Number(set.weightKg) || 0,
    Number(set.rpe) || 0,
    set.notes || '',
    set.source || 'FlowFit',
  ]);
  SpreadsheetApp.flush();
  return json({ ok: true, saved: true, setId: set.setId });
}

function getRecentSets(spreadsheet, limit) {
  const sheet = spreadsheet.getSheetByName(SETS_SHEET);
  if (!sheet) return json({ ok: false, error: 'missing_flowfit_sets_sheet' });
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return json({ ok: true, sets: [] });

  const count = Math.min(Math.max(1, limit), 500, lastRow - 1);
  const rows = sheet.getRange(lastRow - count + 1, 1, count, 12).getDisplayValues();
  const keys = ['setId', 'workoutId', 'timestamp', 'planName', 'activityType', 'exerciseName', 'setNumber', 'reps', 'weightKg', 'rpe', 'notes', 'source'];
  return json({ ok: true, sets: rows.reverse().map(row => Object.fromEntries(keys.map((key, index) => [key, row[index]]))) });
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
