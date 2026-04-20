import { google } from 'googleapis';
import { Readable } from 'stream';
import { env } from '../config/env';

export interface DriveUploadResult {
  fileId: string;
  driveLink: string;
  fileName: string;
}

export async function uploadToGoogleDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
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

  const stream = Readable.from(fileBuffer);

  const fileMetadata = {
    name: fileName,
    parents: driveFolderId ? [driveFolderId] : [],
  };

  const media = {
    mimeType: mimeType,
    body: stream,
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, name, webViewLink',
  });

  if (!response.data.id) {
    throw new Error('Failed to upload file to Google Drive');
  }
  
  try {
    // Optionally make the file public to anyone with link so it can be viewed.
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
  } catch (permError) {
    console.warn('Could not set file to public. File might not be viewable by everyone.', permError);
  }

  return {
    fileId: response.data.id as string,
    fileName: response.data.name as string,
    driveLink: response.data.webViewLink as string,
  };
}
