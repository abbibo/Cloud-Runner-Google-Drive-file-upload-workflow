# ☁️ Cloud Runner - Google Drive File Upload Workflow

A modern, production-ready React/Next.js application that provides a robust and seamless drag-and-drop image upload workflow integrated natively with the Google Drive API. 

This project aims to provide a reliable, modular, and beautiful UI component for processing files and instantly securely uploading them to a specified Google Drive folder, bypassing the need for temporary backend storage.

## ✨ Features

- **Drag & Drop Interface:** Intuitive, beautifully designed dropzone using `react-dropzone`.
- **Google Drive Integration:** Securely uploads files to a targeted Google Drive folder using `googleapis` and OAuth 2.0.
- **Real-time Feedback:** Toast notifications and loading states keeping users informed at every step (`react-hot-toast`).
- **Premium UI & Animations:** Smooth transitions and micro-interactions powered by `framer-motion` and Tailwind CSS.
- **Client-Side Validation:** Prevents invalid file types and sizes from being uploaded.
- **Modular Architecture:** Clean separation of concerns between UI components, server-side API routes, and Google Drive service logic.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Directory)
- **Library:** [React](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Upload Utility:** [React Dropzone](https://react-dropzone.js.org/)
- **Notifications:** [React Hot Toast](https://react-hot-toast.com/) 
- **Google Drive API:** `googleapis` & `axios`

## 🚀 Getting Started

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/cloud-runner-upload.git
cd cloud-runner-upload
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Environment Variables
Create a `.env.local` file in the root of the project and provide your Google Cloud Console credentials:

\`\`\`env
# Google Drive API Credentials
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REFRESH_TOKEN=your_refresh_token_here

# Target Google Drive Folder ID
GOOGLE_DRIVE_FOLDER_ID=your_target_folder_id_here
\`\`\`

### 4. Run the Development Server
\`\`\`bash
npm run dev
\`\`\`
Navigate to [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## 📂 Project Structure
- `/src/components/ImageUpload`: Contains the core drag-and-drop and UI components.
- `/src/app/api/upload`: Next.js server route handling the secure file stream to Google servers.
- `/src/services`: Reusable Google Drive authentication and API services.
- `/src/config`: Environment variable validations and configurations.

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
