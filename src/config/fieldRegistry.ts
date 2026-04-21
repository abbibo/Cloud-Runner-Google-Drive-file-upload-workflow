// ============================================================
// FIELD REGISTRY — Single Source of Truth
// Auto-generates documentation, validation, and storage config
// for all form fields used in the Student Documentation system.
// ============================================================

export type FieldCategory = 'text' | 'number' | 'letter' | 'image';
export type InputType =
  | 'text'
  | 'number'
  | 'email'
  | 'tel'
  | 'date'
  | 'url'
  | 'textarea'
  | 'image'
  | 'file';

export interface FieldValidation {
  pattern?: RegExp;
  patternMessage?: string;
  minLength?: number;
  maxLength?: number;
  exactLength?: number;
  required: boolean;
  allowedMimeTypes?: string[];
  maxFileSizeMB?: number;
}

export interface FieldDoc {
  fieldName: string;
  label: string;
  inputType: InputType;
  category: FieldCategory;
  required: boolean;
  isTextFocused: boolean;
  isNumberFocused: boolean;
  isLetterFocused: boolean;
  isImageUpload: boolean;
  validation: FieldValidation;
  storageDestination: string;
  storagePath?: string;
  exampleValue: string;
  description: string;
}

// ── Category Sets ─────────────────────────────────────────────

/** Fields where the primary input is free-form text (names, addresses, etc.) */
export const TEXT_FIELDS: readonly string[] = [
  'STUDENT_NAME',
  'STUDENT_EMAIL',
  'FATHER_NAME',
  'FATHER_OCCUPATION',
  'MOTHER_NAME',
  'COLLEGE_NAME',
  'COURSE_APPLIED',
  'CAST_NAME',
  'NATIONALITY',
  'RELIGION',
  'COMMUNITY',
  'BLOOD_GROUP',
  'RESIDENTIAL_ADDRESS',
  'SCHOOL_NAME_12TH',
  'BOARD_12TH',
  'DRIVE_LINK',
];

/** Fields whose primary purpose is numeric entry */
export const NUMBER_FOCUSED_FIELDS: readonly string[] = [
  'AADHAR_NUMBER',
  'CONTACT_NO',
  'WHATS_APP_NO',
  'PARENTS_NUMBER',
  'FATHER_PHONE',
  'MOTHER_PHONE',
  'PIN_CODE',
  'PASS_OUT_YEAR',
  'YEAR_OF_PASSING_12TH',
  'STUDENT_NUMBER',
  'PERCENTAGE_12TH',
];

/** Fields that accept only letters (no digits), e.g. names, places */
export const LETTER_FOCUSED_FIELDS: readonly string[] = [
  'STUDENT_NAME',
  'FATHER_NAME',
  'MOTHER_NAME',
  'CAST_NAME',
  'NATIONALITY',
  'RELIGION',
  'COMMUNITY',
  'BLOOD_GROUP',
  'FATHER_OCCUPATION',
];

/** Fields that accept binary image / document uploads */
export const IMAGE_UPLOAD_FIELDS: readonly string[] = [
  'AADHAR_CARD_IMAGE',
  'TENTH_CERTIFICATE_IMAGE',
];

// ── Input Type Map ────────────────────────────────────────────

export const FIELD_INPUT_TYPES: Record<string, InputType> = {
  STUDENT_NAME: 'text',
  STUDENT_NUMBER: 'tel',
  STUDENT_EMAIL: 'email',
  DOB: 'date',
  NATIONALITY: 'text',
  RELIGION: 'text',
  COMMUNITY: 'text',
  CAST_NAME: 'text',
  BLOOD_GROUP: 'text',
  AADHAR_NUMBER: 'text',
  CONTACT_NO: 'tel',
  WHATS_APP_NO: 'tel',
  PARENTS_NUMBER: 'tel',
  FATHER_PHONE: 'tel',
  MOTHER_PHONE: 'tel',
  FATHER_NAME: 'text',
  FATHER_OCCUPATION: 'text',
  MOTHER_NAME: 'text',
  COURSE_APPLIED: 'text',
  COLLEGE_NAME: 'text',
  RESIDENTIAL_ADDRESS: 'textarea',
  SCHOOL_NAME_12TH: 'text',
  BOARD_12TH: 'text',
  PERCENTAGE_12TH: 'number',
  YEAR_OF_PASSING_12TH: 'number',
  PASS_OUT_YEAR: 'number',
  PIN_CODE: 'text',
  DRIVE_LINK: 'url',
  AADHAR_CARD_IMAGE: 'image',
  TENTH_CERTIFICATE_IMAGE: 'image',
};

// ── Storage Path Map ──────────────────────────────────────────

export const FIELD_STORAGE_MAPPING: Record<string, string> = {
  AADHAR_CARD_IMAGE: 'documents/aadhar',
  TENTH_CERTIFICATE_IMAGE: 'documents/10th_certificate',
};

// ── Accepted MIME Types for Uploads ──────────────────────────

export const ACCEPTED_DOCUMENT_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
];

export const ACCEPTED_DOCUMENT_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

// ── Validation Rules ──────────────────────────────────────────

export const FIELD_VALIDATION_RULES: Record<string, FieldValidation> = {
  STUDENT_NAME: {
    required: true,
    pattern: /^[A-Za-z\s.'-]{2,100}$/,
    patternMessage: 'Name must contain only letters, spaces, or hyphens (2–100 chars)',
  },
  STUDENT_NUMBER: {
    required: true,
    pattern: /^\d{10}$/,
    patternMessage: 'Student number must be exactly 10 digits',
    exactLength: 10,
  },
  STUDENT_EMAIL: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: 'Must be a valid email address (e.g. name@domain.com)',
  },
  DOB: { required: true },
  AADHAR_NUMBER: {
    required: true,
    pattern: /^\d{12}$/,
    patternMessage: 'Aadhaar number must be exactly 12 digits',
    exactLength: 12,
  },
  CONTACT_NO: {
    required: true,
    pattern: /^\d{10}$/,
    patternMessage: 'Contact number must be exactly 10 digits',
    exactLength: 10,
  },
  WHATS_APP_NO: {
    required: false,
    pattern: /^\d{10}$/,
    patternMessage: 'WhatsApp number must be exactly 10 digits',
    exactLength: 10,
  },
  PARENTS_NUMBER: {
    required: false,
    pattern: /^\d{10}$/,
    patternMessage: 'Parents number must be exactly 10 digits',
    exactLength: 10,
  },
  FATHER_PHONE: {
    required: true,
    pattern: /^\d{10}$/,
    patternMessage: 'Father phone must be exactly 10 digits',
    exactLength: 10,
  },
  MOTHER_PHONE: {
    required: true,
    pattern: /^\d{10}$/,
    patternMessage: 'Mother phone must be exactly 10 digits',
    exactLength: 10,
  },
  PIN_CODE: {
    required: false,
    pattern: /^\d{6}$/,
    patternMessage: 'PIN code must be exactly 6 digits',
    exactLength: 6,
  },
  PASS_OUT_YEAR: {
    required: false,
    pattern: /^\d{4}$/,
    patternMessage: 'Pass-out year must be a 4-digit year (e.g. 2024)',
    exactLength: 4,
  },
  YEAR_OF_PASSING_12TH: {
    required: true,
    pattern: /^\d{4}$/,
    patternMessage: '12th passing year must be a 4-digit year (e.g. 2023)',
    exactLength: 4,
  },
  MAIL_ID: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: 'Must be a valid email address',
  },
  NATIONALITY: { required: true, pattern: /^[A-Za-z\s]{2,50}$/, patternMessage: 'Letters only, 2–50 chars' },
  RELIGION: { required: true, pattern: /^[A-Za-z\s]{2,50}$/, patternMessage: 'Letters only, 2–50 chars' },
  COMMUNITY: { required: true, pattern: /^[A-Za-z\s]{2,50}$/, patternMessage: 'Letters only, 2–50 chars' },
  CAST_NAME: { required: true, pattern: /^[A-Za-z\s]{2,50}$/, patternMessage: 'Letters only, 2–50 chars' },
  BLOOD_GROUP: { required: true, pattern: /^(A|B|AB|O)[+-]$/, patternMessage: 'Must be a valid blood group (e.g. A+, O-)' },
  PERCENTAGE_12TH: { required: true, minLength: 1, maxLength: 6 },
  SCHOOL_NAME_12TH: { required: true },
  BOARD_12TH: { required: true },
  FATHER_NAME: { required: true, pattern: /^[A-Za-z\s.'-]{2,100}$/, patternMessage: 'Letters only' },
  FATHER_OCCUPATION: { required: true },
  MOTHER_NAME: { required: true, pattern: /^[A-Za-z\s.'-]{2,100}$/, patternMessage: 'Letters only' },
  COURSE_APPLIED: { required: true },
  COLLEGE_NAME: { required: true },
  RESIDENTIAL_ADDRESS: { required: true, minLength: 10, maxLength: 500 },
  DRIVE_LINK: { required: true, pattern: /^https:\/\/drive\.google\.com\/.*$/, patternMessage: 'Must be a valid Google Drive link' },
  AADHAR_CARD_IMAGE: {
    required: true,
    allowedMimeTypes: ACCEPTED_DOCUMENT_MIME_TYPES,
    maxFileSizeMB: Number(process.env.MAX_FILE_SIZE_MB) || 10,
  },
  TENTH_CERTIFICATE_IMAGE: {
    required: true,
    allowedMimeTypes: ACCEPTED_DOCUMENT_MIME_TYPES,
    maxFileSizeMB: Number(process.env.MAX_FILE_SIZE_MB) || 10,
  },
};

// ── Human-Readable Labels ─────────────────────────────────────

export const FIELD_LABELS: Record<string, string> = {
  STUDENT_NAME: 'Student Name',
  STUDENT_NUMBER: 'Student Number',
  STUDENT_EMAIL: 'Student Email ID',
  DOB: 'Date of Birth',
  NATIONALITY: 'Nationality',
  RELIGION: 'Religion',
  COMMUNITY: 'Community',
  CAST_NAME: 'Caste Name',
  BLOOD_GROUP: 'Blood Group',
  AADHAR_NUMBER: 'Aadhaar Number',
  CONTACT_NO: 'Contact Number',
  WHATS_APP_NO: 'WhatsApp Number',
  PARENTS_NUMBER: "Parent's Number",
  FATHER_PHONE: "Father's Mobile Number",
  MOTHER_PHONE: "Mother's Mobile Number",
  FATHER_NAME: "Father's Name",
  FATHER_OCCUPATION: "Father's Occupation",
  MOTHER_NAME: "Mother's Name",
  COURSE_APPLIED: 'Course Applied For',
  COLLEGE_NAME: 'College Name',
  RESIDENTIAL_ADDRESS: 'Residential Address',
  SCHOOL_NAME_12TH: '12th School Name',
  BOARD_12TH: '12th Board',
  PERCENTAGE_12TH: '12th Percentage (%)',
  YEAR_OF_PASSING_12TH: '12th Year of Passing',
  PASS_OUT_YEAR: 'Pass-Out Year',
  PIN_CODE: 'PIN Code',
  DRIVE_LINK: 'Google Drive Folder Link (Documents)',
  AADHAR_CARD_IMAGE: 'Aadhaar Card Image',
  TENTH_CERTIFICATE_IMAGE: '10th Certificate Image',
};

export const FIELD_EXAMPLES: Record<string, string> = {
  STUDENT_NAME: 'Rahul Sharma',
  STUDENT_NUMBER: '9876543210',
  STUDENT_EMAIL: 'rahul.sharma@gmail.com',
  DOB: '2003-08-15',
  NATIONALITY: 'Indian',
  RELIGION: 'Hindu',
  COMMUNITY: 'OBC',
  CAST_NAME: 'Nadar',
  BLOOD_GROUP: 'B+',
  AADHAR_NUMBER: '123456789012',
  CONTACT_NO: '9876543210',
  WHATS_APP_NO: '9876543210',
  PARENTS_NUMBER: '9123456780',
  FATHER_PHONE: '9123456780',
  MOTHER_PHONE: '9234567890',
  FATHER_NAME: 'Rajesh Sharma',
  FATHER_OCCUPATION: 'Engineer',
  MOTHER_NAME: 'Priya Sharma',
  COURSE_APPLIED: 'B.Tech Computer Science',
  COLLEGE_NAME: 'PSG College of Technology',
  RESIDENTIAL_ADDRESS: '12, Gandhi Street, Coimbatore - 641001',
  SCHOOL_NAME_12TH: 'Sri Vidya Mandir HSS',
  BOARD_12TH: 'CBSE',
  PERCENTAGE_12TH: '86.4',
  YEAR_OF_PASSING_12TH: '2023',
  PASS_OUT_YEAR: '2027',
  PIN_CODE: '641001',
  DRIVE_LINK: 'https://drive.google.com/drive/folders/xxx',
  AADHAR_CARD_IMAGE: 'aadhar_rahul_COMPRESSED.jpg (max 10MB)',
  TENTH_CERTIFICATE_IMAGE: '10th_cert_rahul.pdf (max 10MB)',
};

// ── Auto-Generated Documentation Schema ──────────────────────

function buildFieldDoc(fieldName: string): FieldDoc {
  const inputType = FIELD_INPUT_TYPES[fieldName] ?? 'text';
  const validation = FIELD_VALIDATION_RULES[fieldName] ?? { required: false };
  const storagePath = FIELD_STORAGE_MAPPING[fieldName];

  const isImageUpload = IMAGE_UPLOAD_FIELDS.includes(fieldName);
  const isNumberFocused = NUMBER_FOCUSED_FIELDS.includes(fieldName);
  const isLetterFocused = LETTER_FOCUSED_FIELDS.includes(fieldName);
  const isTextFocused = TEXT_FIELDS.includes(fieldName);

  let category: FieldCategory = 'text';
  if (isImageUpload) category = 'image';
  else if (isNumberFocused) category = 'number';
  else if (isLetterFocused) category = 'letter';

  let storageDestination = 'Firestore — documentation collection';
  if (isImageUpload) storageDestination = 'Google Drive → GitHub metadata reference';

  // Build description
  let description = validation.patternMessage ?? `${FIELD_LABELS[fieldName] ?? fieldName} field`;
  if (validation.allowedMimeTypes) {
    description += `. Accepted: ${ACCEPTED_DOCUMENT_EXTENSIONS.join(', ')}. Max ${validation.maxFileSizeMB}MB`;
  }

  return {
    fieldName,
    label: FIELD_LABELS[fieldName] ?? fieldName,
    inputType,
    category,
    required: validation.required,
    isTextFocused,
    isNumberFocused,
    isLetterFocused,
    isImageUpload,
    validation,
    storageDestination,
    storagePath,
    exampleValue: FIELD_EXAMPLES[fieldName] ?? 'N/A',
    description,
  };
}

/** Full auto-generated documentation for every registered field */
export const FIELD_DOCS_SCHEMA: FieldDoc[] = Object.keys(FIELD_INPUT_TYPES).map(buildFieldDoc);

/** Docs grouped by category for section rendering */
export const FIELD_DOCS_BY_CATEGORY: Record<FieldCategory, FieldDoc[]> = {
  text: FIELD_DOCS_SCHEMA.filter((f) => f.category === 'text'),
  number: FIELD_DOCS_SCHEMA.filter((f) => f.category === 'number'),
  letter: FIELD_DOCS_SCHEMA.filter((f) => f.category === 'letter'),
  image: FIELD_DOCS_SCHEMA.filter((f) => f.category === 'image'),
};
