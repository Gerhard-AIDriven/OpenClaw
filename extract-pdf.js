const fs = require('fs');
const pdfjs = require('pdfjs-dist');

const pdfPath = 'C:\\Users\\gstim\\.openclaw\\workspace\\Documents\\CC Statement.pdf';

async function extractText() {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const doc = await pdfjs.getDocument(dataBuffer).promise;
    let fullText = '';

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');
      fullText += `\n--- PAGE ${i} ---\n${pageText}`;
    }

    console.log('=== EXTRACTED TEXT FROM PDF ===');
    console.log(fullText);
    console.log('\n=== END OF DOCUMENT ===');
  } catch (err) {
    console.error('Error:', err);
  }
}

extractText();
