import fs from 'fs';
import path from 'path';

const htmlFilePath = '/Users/mac/projetos claude/apresentacao_doping.html';
const outCssPath = path.join(process.cwd(), 'src/presentation.css');
const outDataPath = path.join(process.cwd(), 'src/data/slidesData.ts');

const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

// Extract styles
const styleMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
    fs.writeFileSync(outCssPath, styleMatch[1].trim());
    console.log('✅ Wrote presentation.css');
} else {
    console.log('⚠️ No style block found.');
}

// Extract slides
const slideRegex = /<section class="slide([\s\S]*?)<\/section>/g;
let match;
const slides = [];

while ((match = slideRegex.exec(htmlContent)) !== null) {
    const fullMatch = match[0];
    // Extract classes
    const classMatch = fullMatch.match(/class="slide([^"]*)"/);
    const classes = classMatch ? classMatch[1].trim() : '';

    // Extract innerHTML
    const innerMatch = fullMatch.match(/>([\s\S]*?)<\/section>/);
    const innerHTML = innerMatch ? innerMatch[1].trim() : '';

    slides.push({
        classes,
        content: innerHTML
    });
}

const tsContent = `export interface SlideData {
  id: number;
  classes: string;
  content: string;
}

export const slidesData: SlideData[] = [
${slides.map((s, i) => `  {
    id: ${i},
    classes: \`${s.classes.replace(/`/g, '\\`')}\`,
    content: \`${s.content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`
  }`).join(',\n')}
];
`;

fs.writeFileSync(outDataPath, tsContent);
console.log(`✅ Wrote ${slides.length} slides to slidesData.ts`);
