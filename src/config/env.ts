export const env = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
    driveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || '',
  },
  github: {
    repo: process.env.GITHUB_REPO || '',
    branch: process.env.GITHUB_BRANCH || 'main',
    token: process.env.GITHUB_TOKEN || '',
  },
  upload: {
    maxFileSizeMB: Number(process.env.MAX_FILE_SIZE_MB) || 10,
  },
};
