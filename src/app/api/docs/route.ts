import { NextResponse } from 'next/server';
import { FIELD_DOCS_SCHEMA, FIELD_DOCS_BY_CATEGORY } from '@/config/fieldRegistry';

/**
 * GET /api/docs
 * Returns auto-generated field documentation from the field registry.
 * Used by the Documentation section to render per-field docs dynamically.
 */
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      generatedAt: new Date().toISOString(),
      totalFields: FIELD_DOCS_SCHEMA.length,
      categories: {
        text: FIELD_DOCS_BY_CATEGORY.text.length,
        number: FIELD_DOCS_BY_CATEGORY.number.length,
        letter: FIELD_DOCS_BY_CATEGORY.letter.length,
        image: FIELD_DOCS_BY_CATEGORY.image.length,
      },
      fieldsByCategory: FIELD_DOCS_BY_CATEGORY,
      allFields: FIELD_DOCS_SCHEMA,
    },
    { status: 200 }
  );
}
