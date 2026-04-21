// ============================================================
// GitHub Service — Commits metadata and audit logs to the
// configured GitHub repository using the Contents API.
// Includes retry logic and fallback signalling.
// ============================================================

import { env } from '../config/env';

const BASE_URL = 'https://api.github.com';

interface GitHubFilePayload {
  message: string;
  content: string; // base64-encoded
  branch: string;
  sha?: string; // required when updating an existing file
}

interface CommitResult {
  success: boolean;
  commitSha?: string;
  htmlUrl?: string;
  error?: string;
}

// ── Helpers ───────────────────────────────────────────────────

function toBase64(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64');
}

async function getExistingFileSha(path: string): Promise<string | null> {
  const { repo, branch, token } = env.github;
  const url = `${BASE_URL}/repos/${repo}/contents/${path}?ref=${branch}`;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const data = await res.json();
    return data.sha ?? null;
  } catch {
    return null;
  }
}

async function putFile(
  path: string,
  payload: GitHubFilePayload,
  attempt = 1
): Promise<CommitResult> {
  const { repo, token } = env.github;
  const url = `${BASE_URL}/repos/${repo}/contents/${path}`;

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        commitSha: data.commit?.sha,
        htmlUrl: data.content?.html_url,
      };
    }

    const errBody = await res.text();
    throw new Error(`GitHub API ${res.status}: ${errBody}`);
  } catch (err: any) {
    if (attempt < 3) {
      // Exponential backoff: 500ms, 1000ms
      await new Promise((r) => setTimeout(r, attempt * 500));
      return putFile(path, payload, attempt + 1);
    }
    return { success: false, error: err.message };
  }
}

// ── Public API ────────────────────────────────────────────────

/**
 * Commits a JSON metadata file to GitHub.
 * Path example: `metadata/AADHAR_CARD_IMAGE_rahul_1713456789.json`
 */
export async function commitMetadata(
  filePath: string,
  data: Record<string, unknown>
): Promise<CommitResult> {
  if (!env.github.token || !env.github.repo) {
    return { success: false, error: 'GitHub credentials not configured' };
  }

  const content = toBase64(JSON.stringify(data, null, 2));
  const sha = await getExistingFileSha(filePath);

  return putFile(filePath, {
    message: `chore: add metadata for ${filePath.split('/').pop()}`,
    content,
    branch: env.github.branch,
    ...(sha ? { sha } : {}),
  });
}

/**
 * Appends a log entry to a monthly log file in /logs/.
 * File name: `logs/uploads_YYYY-MM.json`
 */
export async function appendAuditLog(entry: Record<string, unknown>): Promise<CommitResult> {
  if (!env.github.token || !env.github.repo) {
    return { success: false, error: 'GitHub credentials not configured' };
  }

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const logPath = `logs/uploads_${month}.json`;

  // Read existing log array (if any)
  const { repo, branch, token } = env.github;
  let existingEntries: unknown[] = [];
  let existingSha: string | undefined;

  try {
    const res = await fetch(`${BASE_URL}/repos/${repo}/contents/${logPath}?ref=${branch}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (res.ok) {
      const data = await res.json();
      existingSha = data.sha;
      const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
      existingEntries = JSON.parse(decoded);
    }
  } catch {
    // No existing log — start fresh
  }

  existingEntries.push(entry);
  const content = toBase64(JSON.stringify(existingEntries, null, 2));

  return putFile(logPath, {
    message: `audit: log upload entry ${(entry as any).fileName ?? 'unknown'}`,
    content,
    branch,
    ...(existingSha ? { sha: existingSha } : {}),
  });
}

/**
 * Commits a placeholder reference file for an uploaded document.
 * The actual binary is stored in Google Drive; only the link is saved here.
 * Path example: `documents/aadhar/AADHAR_CARD_IMAGE_rahul_1713456789.json`
 */
export async function commitDocumentReference(
  folderPath: string,
  fileName: string,
  referenceData: Record<string, unknown>
): Promise<CommitResult> {
  const refPath = `${folderPath}/${fileName.replace(/\.[^.]+$/, '')}.json`;
  return commitMetadata(refPath, referenceData);
}
