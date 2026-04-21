/**
 * Upload Diagnostic Test Script
 * Tests: TXT, PDF, DOCX, JPG, PNG against /api/upload
 * Usage: node test_upload.mjs <baseUrl>
 *   e.g. node test_upload.mjs http://localhost:3000
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const API_URL  = `${BASE_URL}/api/upload`;

// ── Minimal valid dummy file buffers ─────────────────────────

const DUMMY_FILES = {
  // Valid types (should pass CloudRunner validation)
  'PDF':  { name: 'dummy.pdf',  mime: 'application/pdf', data: Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nxref\n0 1\n0000000000 65535 f\ntrailer\n<< /Size 1 /Root 1 0 R >>\nstartxref\n9\n%%EOF') },
  'JPG':  { name: 'dummy.jpg',  mime: 'image/jpeg',       data: Buffer.from([0xFF,0xD8,0xFF,0xE0,0x00,0x10,0x4A,0x46,0x49,0x46,0x00,0x01,0x01,0x00,0x00,0x01,0x00,0x01,0x00,0x00,0xFF,0xD9]) },
  'PNG':  { name: 'dummy.png',  mime: 'image/png',        data: Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A, ...Array(20).fill(0)]) },
  // Invalid types (should be rejected by validation)
  'TXT':  { name: 'dummy.txt',  mime: 'text/plain',       data: Buffer.from('Hello, this is a test document.') },
  'DOCX': { name: 'dummy.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', data: Buffer.from('PK fake docx content') },
};

const FIELD_NAME = 'AADHAR_CARD_IMAGE';
const USER_NAME  = 'TestUser_Diagnostics';

// ── Helpers ──────────────────────────────────────────────────

function pad(str, len = 8) {
  return String(str).padEnd(len);
}

function sizeLabel(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function testUpload(label, file) {
  const startMs = Date.now();
  const fd = new FormData();
  const blob = new Blob([file.data], { type: file.mime });
  fd.append('file',      blob, file.name);
  fd.append('fieldName', FIELD_NAME);
  fd.append('userName',  USER_NAME);

  let status, body, error;
  try {
    const res = await fetch(API_URL, { method: 'POST', body: fd });
    status = res.status;
    body   = await res.json();
  } catch (err) {
    error = err.message;
    status = 0;
    body   = {};
  }

  const elapsed = Date.now() - startMs;

  return { label, file, status, body, error, elapsed };
}

function classify(result) {
  if (result.error) return { outcome: 'NETWORK_ERROR', layer: 'Network / Server unreachable' };
  if (result.status === 0) return { outcome: 'UNREACHABLE', layer: 'Server not running' };
  if (result.status === 400 && result.body.error?.includes('not allowed'))
    return { outcome: 'REJECTED_FORMAT', layer: 'API validation — MIME type rejected' };
  if (result.status === 400 && result.body.error?.includes('size'))
    return { outcome: 'REJECTED_SIZE', layer: 'API validation — File too large' };
  if (result.status === 400)
    return { outcome: 'REJECTED_OTHER', layer: 'API validation — ' + (result.body.error ?? 'unknown') };
  if (result.status === 500 && result.body.error?.includes('credential'))
    return { outcome: 'AUTH_FAILURE', layer: 'Google Drive OAuth credentials' };
  if (result.status === 500 && result.body.error?.includes('Drive'))
    return { outcome: 'DRIVE_FAILURE', layer: 'Google Drive upload failed' };
  if (result.status === 500)
    return { outcome: 'SERVER_ERROR', layer: 'Backend error — ' + (result.body.error ?? 'unknown') };
  if (result.status === 200 && result.body.success)
    return { outcome: 'SUCCESS', layer: 'Upload complete' };
  return { outcome: 'UNKNOWN', layer: JSON.stringify(result.body) };
}

function rootCause(result, classification) {
  switch (classification.outcome) {
    case 'NETWORK_ERROR':
    case 'UNREACHABLE':
      return 'Cloud Runner server is not running. Start it with: npm run dev (inside Cloud Runner project)';
    case 'REJECTED_FORMAT':
      return `File type "${result.file.mime}" is not in ACCEPTED_DOCUMENT_MIME_TYPES.\n` +
             `  Allowed: image/jpeg, image/jpg, image/png, application/pdf\n` +
             `  This is expected behaviour — TXT and DOCX are intentionally blocked.`;
    case 'REJECTED_SIZE':
      return `File exceeds MAX_FILE_SIZE_MB (${process.env.MAX_FILE_SIZE_MB || 10}MB).`;
    case 'AUTH_FAILURE':
      return 'GOOGLE_REFRESH_TOKEN in .env.local is invalid or expired.\n' +
             '  Fix: Re-generate via https://developers.google.com/oauthplayground\n' +
             '  Scopes: https://www.googleapis.com/auth/drive.file';
    case 'DRIVE_FAILURE':
      return 'OAuth token is valid but Drive API call failed. Check GOOGLE_DRIVE_FOLDER_ID permissions.';
    case 'SUCCESS':
      return 'No issues. File was uploaded, made public, and metadata committed to GitHub.';
    default:
      return result.body.error ?? result.error ?? 'Unknown failure';
  }
}

function fix(classification) {
  switch (classification.outcome) {
    case 'NETWORK_ERROR':
    case 'UNREACHABLE':
      return 'Run `npm run dev` in d:\\Cloud Runner-Google Drive file upload workflow';
    case 'REJECTED_FORMAT':
      return 'EXPECTED — no fix needed. Only JPG/PNG/PDF are supported by design.';
    case 'AUTH_FAILURE':
      return '1. Go to https://developers.google.com/oauthplayground\n' +
             '2. Select Drive API v3 scope → Authorize → Exchange code for tokens\n' +
             '3. Copy the new refresh_token into .env.local → GOOGLE_REFRESH_TOKEN=...';
    case 'DRIVE_FAILURE':
      return 'Ensure GOOGLE_DRIVE_FOLDER_ID exists and the OAuth account has Editor access to it.';
    case 'SUCCESS':
      return 'N/A';
    default:
      return 'Review server logs for stack trace.';
  }
}

// ── Main ──────────────────────────────────────────────────────

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║        Cloud Runner — Upload Diagnostic Test Suite           ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`  API endpoint : ${API_URL}`);
console.log(`  Field        : ${FIELD_NAME}`);
console.log(`  User         : ${USER_NAME}`);
console.log('');

const results = [];
for (const [label, file] of Object.entries(DUMMY_FILES)) {
  process.stdout.write(`  Testing ${pad(label, 6)} (${file.name}) ... `);
  const r = await testUpload(label, file);
  const c = classify(r);
  results.push({ ...r, classification: c });
  console.log(`${c.outcome} [HTTP ${r.status}] (${r.elapsed}ms)`);
}

// ── Full Report ──────────────────────────────────────────────

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  DETAILED FINDINGS');
console.log('═══════════════════════════════════════════════════════════════');

for (const r of results) {
  const c = r.classification;
  console.log('');
  console.log(`┌─ Test Case  : ${r.label} (${r.file.name})`);
  console.log(`│  MIME Type  : ${r.file.mime}`);
  console.log(`│  File Size  : ${sizeLabel(r.file.data.length)}`);
  console.log(`│  HTTP Status: ${r.status}`);
  console.log(`│  Elapsed    : ${r.elapsed}ms`);
  console.log(`│  Result     : ${c.outcome}`);
  console.log(`│  Layer      : ${c.layer}`);

  if (r.body.error || r.error) {
    console.log(`│  Error Msg  : ${r.body.error ?? r.error}`);
  }

  if (c.outcome === 'SUCCESS') {
    console.log(`│  ✅ Drive Link     : ${r.body.driveLink}`);
    console.log(`│  ✅ Web Content    : ${r.body.webContentLink}`);
    console.log(`│  ✅ File ID        : ${r.body.fileId}`);
    console.log(`│  ✅ GitHub Meta    : ${r.body.githubMetadataPath ?? 'N/A'}`);
    console.log(`│  ✅ Commit SHA     : ${r.body.githubCommitSha ?? 'N/A'}`);
    console.log(`│  ✅ Audit ID       : ${r.body.auditId ?? 'N/A'}`);
  }

  console.log(`│  Root Cause : ${rootCause(r, c)}`);
  console.log(`└─ Fix        : ${fix(c)}`);
}

// ── API Payload Sample ───────────────────────────────────────

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  EXPECTED API PAYLOAD (multipart/form-data)');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  POST ' + API_URL);
console.log('  Content-Type: multipart/form-data');
console.log('  Body fields:');
console.log('    file      = <binary>   (blob with correct MIME type)');
console.log('    fieldName = AADHAR_CARD_IMAGE | TENTH_CERTIFICATE_IMAGE');
console.log('    userName  = <student name string>');

// ── Summary Table ────────────────────────────────────────────

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  SUMMARY TABLE');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  Format  HTTP  Outcome              Expected?');
console.log('  ──────  ────  ───────────────────  ─────────');
for (const r of results) {
  const expected =
    ['JPG','PNG','PDF'].includes(r.label)  ? (r.classification.outcome === 'SUCCESS' ? '✅ Yes' : '⚠️  Should succeed')
    : /* TXT / DOCX */                       (r.classification.outcome === 'REJECTED_FORMAT' ? '✅ Yes (blocked by design)' : '⚠️  Should be blocked');
  console.log(`  ${pad(r.label,7)} ${pad(r.status,5)} ${pad(r.classification.outcome,21)} ${expected}`);
}

console.log('');
