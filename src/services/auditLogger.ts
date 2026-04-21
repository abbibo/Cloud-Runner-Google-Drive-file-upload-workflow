// ============================================================
// Audit Logger — Writes structured upload audit entries to
// GitHub monthly log files and to the server console.
// ============================================================

import { appendAuditLog } from './githubService';

export interface AuditEntry {
  auditId: string;
  timestamp: string;
  uploadedBy: string;
  fieldName: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  storageLocation: 'google_drive' | 'github' | 'failed';
  driveFileId?: string;
  driveLink?: string;
  githubMetadataPath?: string;
  githubCommitSha?: string;
  validationStatus: 'passed' | 'failed';
  validationErrors?: string[];
  errorMessage?: string;
}

function generateAuditId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Creates and persists a structured audit log entry.
 * Logs to console immediately; commits to GitHub asynchronously.
 */
export async function logUploadAudit(
  partial: Omit<AuditEntry, 'auditId' | 'timestamp'>
): Promise<AuditEntry> {
  const entry: AuditEntry = {
    ...partial,
    auditId: generateAuditId(),
    timestamp: new Date().toISOString(),
  };

  // Always log to console
  console.log(`[AUDIT] ${entry.auditId}`, JSON.stringify(entry, null, 2));

  // Commit to GitHub (non-blocking — don't await, failures are logged)
  appendAuditLog(entry as unknown as Record<string, unknown>).then((result) => {
    if (!result.success) {
      console.warn(`[AUDIT] Failed to persist audit log to GitHub: ${result.error}`);
    } else {
      console.log(`[AUDIT] Log persisted to GitHub. Commit: ${result.commitSha}`);
    }
  });

  return entry;
}
