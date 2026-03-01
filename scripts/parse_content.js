import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

const htmlFilePath = '/Users/mac/projetos claude/apresentacao_doping.html';
const outDataPath = path.join(process.cwd(), 'src/data/parsedPresentation.json');

const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
const $ = cheerio.load(htmlContent);

const slides = [];

$('section.slide').each((i, el) => {
    const $slide = $(el);

    // Header
    const sectionName = $slide.find('.slide-header span').first().text().trim();
    const slideNumber = $slide.find('.slide-header span').last().text().trim();

    // Titles
    const title = $slide.find('h1, h2').first().text().trim();
    const subtitle = $slide.find('.subtitle, h3').first().text().trim();

    // Clean up title from DOM so we don't duplicate it in content
    $slide.find('h1, h2, .subtitle').remove();
    $slide.find('.slide-header').remove();

    // Extract Cards explicitly
    const cards = [];
    $slide.find('.card, .expand-card').each((j, cardEl) => {
        const $card = $(cardEl);
        const cardType = $card.hasClass('expand-card') ? 'expandable' : 'bento';
        const cardTitle = $card.find('h3, summary').first().text().trim();
        $card.find('h3, summary').remove();

        // Specific athlete dossier stats logic
        const attributes = [];
        $card.find('li').each((_, li) => {
            attributes.push($(li).text().trim().replace(/→/g, ''));
        });

        const innerHTML = $card.html().trim(); // Preserve tables and inner paragraphs

        cards.push({
            type: cardType,
            title: cardTitle,
            attributes,
            rawHtml: innerHTML
        });

        $card.remove(); // Remove from general content
    });

    // Extract remaining content (tables, paragraphs) as raw html
    const remainingContent = $slide.find('.slide-content').html();

    slides.push({
        id: i,
        sectionName,
        number: slideNumber,
        layout: cards.length > 0 ? 'bento' : 'prose',
        title,
        subtitle,
        content: remainingContent ? remainingContent.trim() : '',
        cards
    });
});

fs.writeFileSync(outDataPath, JSON.stringify(slides, null, 2));
console.log(`✅ Extracted ${slides.length} slides directly to JSON.`);
