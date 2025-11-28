import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const templatesDir = path.join(__dirname, '../src/core/email/templates');
const outputFile = path.join(__dirname, '../src/types/email/template-types.ts');

// Read template files
const templateFiles = fs
  .readdirSync(templatesDir)
  .filter(file => file.endsWith('.html'))
  .map(file => file.replace('.html', ''));

// Generate TypeScript type file
const typeContent = `// Auto-generated file - do not edit manually
// Run: node scripts/generate-template-types.js to regenerate

export const TEMPLATE_NAMES = ${JSON.stringify(templateFiles)} as const;

export type TemplateName = typeof TEMPLATE_NAMES[number];
`;

fs.writeFileSync(outputFile, typeContent);
