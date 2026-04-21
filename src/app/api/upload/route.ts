import { NextResponse } from 'next/server';
import { uploadToGoogleDrive } from '@/services/googleDriveService';
import { commitMetadata, commitDocumentReference } from '@/services/githubService';
import { logUploadAudit } from '@/services/auditLogger';
import {
  FIELD_VALIDATION_RULES,
  FIELD_STORAGE_MAPPING,
  ACCEPTED_DOCUMENT_MIME_TYPES,
} from '@/config/fieldRegistry';
import { env } from '@/config/env';

// ── Helpers ───────────────────────────────────────────────────

function sanitize(str: string): string {
  return str.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 60);
}

function buildStructuredFileName(fieldName: string, userName: string, ext: string): string {
  const timestamp = Date.now();
  return `${sanitize(fieldName)}_${sanitize(userName)}_${timestamp}${ext}`;
}

function getFileExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'application/pdf': '.pdf',
    'image/webp': '.webp',
  };
  return map[mimeType] ?? '.bin';
}

function validateField(
  fieldName: string,
  file: File
): { valid: boolean; errors: string[] } {
  const rule = FIELD_VALIDATION_RULES[fieldName];
  const errors: string[] = [];

  if (!rule) return { valid: true, errors: [] };

  // MIME type check
  const allowedTypes = rule.allowedMimeTypes ?? ACCEPTED_DOCUMENT_MIME_TYPES;
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type "${file.type}" is not allowed. Accepted: ${allowedTypes.join(', ')}`);
  }

  // Size check
  const maxBytes = (rule.maxFileSizeMB ?? env.upload.maxFileSizeMB) * 1024 * 1024;
  if (file.size > maxBytes) {
    errors.push(
      `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds limit of ${
        rule.maxFileSizeMB ?? env.upload.maxFileSizeMB
      }MB`
    );
  }

  return { valid: errors.length === 0, errors };
}

// ── POST /api/upload ──────────────────────────────────────────

export async function POST(request: Request) {
  const uploadedAt = new Date().toISOString();

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const fieldName = (formData.get('fieldName') as string | null)?.toUpperCase() ?? 'GENERIC_UPLOAD';
    const userName = (formData.get('userName') as string | null) ?? 'unknown_user';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate based on field rules
    const { valid, errors } = validateField(fieldName, file);
    if (!valid) {
      await logUploadAudit({
        uploadedBy: userName,
        fieldName,
        fileName: file.name,
        fileType: file.type,
        fileSizeBytes: file.size,
        storageLocation: 'failed',
        validationStatus: 'failed',
        validationErrors: errors,
      });
      return NextResponse.json(
        { success: false, error: errors.join('; ') },
        { status: 400 }
      );
    }

    const ext = getFileExtension(file.type);
    const structuredFileName = buildStructuredFileName(fieldName, userName, ext);
    const storagePath = FIELD_STORAGE_MAPPING[fieldName] ?? 'documents/general';

    // Upload to Google Drive
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let driveResult: Awaited<ReturnType<typeof uploadToGoogleDrive>> | null = null;
    let driveError: string | undefined;

    try {
      driveResult = await uploadToGoogleDrive(buffer, structuredFileName, file.type, storagePath);
    } catch (err: any) {
      driveError = err.message;
      console.error('[Upload] Google Drive upload failed:', err.message);
    }

    if (!driveResult) {
      await logUploadAudit({
        uploadedBy: userName,
        fieldName,
        fileName: structuredFileName,
        fileType: file.type,
        fileSizeBytes: file.size,
        storageLocation: 'failed',
        validationStatus: 'passed',
        errorMessage: driveError,
      });
      return NextResponse.json(
        { success: false, error: driveError ?? 'Google Drive upload failed' },
        { status: 500 }
      );
    }

    // Commit metadata JSON to GitHub
    const metadataPayload = {
      fieldName,
      label: fieldName.replace(/_/g, ' '),
      uploadedBy: userName,
      uploadedAt,
      fileName: structuredFileName,
      originalFileName: file.name,
      mimeType: file.type,
      fileSizeBytes: file.size,
      storagePath,
      driveFileId: driveResult.fileId,
      driveLink: driveResult.driveLink,
      webContentLink: driveResult.webContentLink,
    };

    const metadataPath = `metadata/${structuredFileName.replace(ext, '')}.json`;
    const [metaResult, docRefResult] = await Promise.all([
      commitMetadata(metadataPath, metadataPayload),
      commitDocumentReference(storagePath, structuredFileName, metadataPayload),
    ]);

    // Audit log
    const auditEntry = await logUploadAudit({
      uploadedBy: userName,
      fieldName,
      fileName: structuredFileName,
      fileType: file.type,
      fileSizeBytes: file.size,
      storageLocation: 'google_drive',
      driveFileId: driveResult.fileId,
      driveLink: driveResult.driveLink,
      githubMetadataPath: metaResult.success ? metadataPath : undefined,
      githubCommitSha: metaResult.success ? metaResult.commitSha : undefined,
      validationStatus: 'passed',
      ...(!metaResult.success && { errorMessage: `GitHub metadata commit failed: ${metaResult.error}` }),
    });

    return NextResponse.json(
      {
        success: true,
        fieldName,
        fileName: structuredFileName,
        fileId: driveResult.fileId,
        driveLink: driveResult.driveLink,
        webContentLink: driveResult.webContentLink,
        storagePath,
        uploadedAt,
        githubMetadataPath: metaResult.success ? metadataPath : null,
        githubCommitSha: metaResult.success ? metaResult.commitSha : null,
        githubDocRefPath: docRefResult.success
          ? `${storagePath}/${structuredFileName.replace(ext, '')}.json`
          : null,
        auditId: auditEntry.auditId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Upload] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
