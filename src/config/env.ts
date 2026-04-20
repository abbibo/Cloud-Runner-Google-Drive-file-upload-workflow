export const env = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
    driveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || '',
  },
};
