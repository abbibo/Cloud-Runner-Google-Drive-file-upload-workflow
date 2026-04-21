import { google } from 'googleapis';
import { Readable } from 'stream';
import { env } from '../config/env';

export interface DriveUploadResult {
  fileId: string;
  driveLink: string;
  webContentLink: string;
  fileName: string;
}

/**
 * Uploads a file buffer to Google Drive.
 * Optionally places it inside a sub-folder (created on the fly if needed).
 *
 * @param fileBuffer - Raw file bytes
 * @param fileName   - Structured file name: {FIELD}_{USER}_{TIMESTAMP}.ext
 * @param mimeType   - MIME type of the file
 * @param subFolderName - Optional sub-folder path like "documents/aadhar"
 */
export async function uploadToGoogleDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  subFolderName?: string
): Promise<DriveUploadResult> {
  const { clientId, clientSecret, refreshToken, driveFolderId } = env.google;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Google Drive credentials are not fully configured.');
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  // Resolve the target parent folder
  let parentFolderId = driveFolderId || undefined;

  if (subFolderName && driveFolderId) {
    parentFolderId = await getOrCreateSubFolder(drive, driveFolderId, subFolderName);
  }

  const stream = Readable.from(fileBuffer);

  const fileMetadata: Record<string, unknown> = {
    name: fileName,
    ...(parentFolderId ? { parents: [parentFolderId] } : {}),
  };

  const media = { mimeType, body: stream };

  const response = await drive.files.create({
    requestBody: fileMetadata as any,
    media,
    fields: 'id, name, webViewLink, webContentLink',
  });

  if (!response.data.id) {
    throw new Error('Failed to upload file to Google Drive');
  }

  // Make the file publicly readable
  try {
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });
  } catch (permError) {
    console.warn('Could not set file to public. File might not be viewable by everyone.', permError);
  }

  return {
    fileId: response.data.id as string,
    fileName: response.data.name as string,
    driveLink: response.data.webViewLink as string,
    webContentLink: (response.data.webContentLink as string) ?? '',
  };
}

/**
 * Returns the ID of a sub-folder inside a parent folder,
 * creating it if it doesn't already exist.
 */
async function getOrCreateSubFolder(
  drive: ReturnType<typeof google.drive>,
  parentId: string,
  folderName: string
): Promise<string> {
  // Support nested paths like "documents/aadhar"
  const parts = folderName.split('/').filter(Boolean);
  let currentParentId = parentId;

  for (const part of parts) {
    // Search for existing folder
    const searchRes = await drive.files.list({
      q: `'${currentParentId}' in parents and name='${part}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id)',
      spaces: 'drive',
    });

    if (searchRes.data.files && searchRes.data.files.length > 0) {
      currentParentId = searchRes.data.files[0].id as string;
    } else {
      // Create the folder
      const createRes = await drive.files.create({
        requestBody: {
          name: part,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [currentParentId],
        },
        fields: 'id',
      });
      currentParentId = createRes.data.id as string;
    }
  }

  return currentParentId;
}
