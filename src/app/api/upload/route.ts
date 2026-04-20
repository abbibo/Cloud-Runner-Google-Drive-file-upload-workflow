import { NextResponse } from 'next/server';
import { uploadToGoogleDrive } from '@/services/googleDriveService';
import { isValidImageFormat, isValidSize, MAX_FILE_SIZE_MB } from '@/utils/validators';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (!isValidImageFormat(file)) {
      return NextResponse.json({ success: false, error: 'Invalid file format' }, { status: 400 });
    }

    if (!isValidSize(file)) {
      return NextResponse.json({ success: false, error: `File exceeds maximum size of ${MAX_FILE_SIZE_MB}MB` }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Call internal service
    const driveResult = await uploadToGoogleDrive(buffer, file.name, file.type);

    const result = {
      success: true,
      fileName: driveResult.fileName,
      fileId: driveResult.fileId,
      driveLink: driveResult.driveLink,
      uploadedAt: new Date().toISOString(),
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Upload Error: ', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
