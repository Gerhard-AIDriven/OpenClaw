const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
    const inputFile = path.join(__dirname, 'sample-reports', 'sample-basic-42-marewa-road.html');
    const outputFile = path.join(__dirname, 'sample-reports', 'sample-basic-42-marewa-road.pdf');
    
    // Check if input file exists
    if (!fs.existsSync(inputFile)) {
        console.error(`❌ Input file not found: ${inputFile}`);
        process.exit(1);
    }
    
    console.log(`📄 Converting: ${path.basename(inputFile)}`);
    console.log(`📍 Output: ${path.basename(outputFile)}`);
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        timeout: 120000  // 2 minutes for first-time Chromium download
    });
    
    try {
        const page = await browser.newPage();
        
        // Load the HTML file
        const htmlContent = fs.readFileSync(inputFile, 'utf8');
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0',
            timeout: 60000
        });
        
        // Generate PDF with A4 settings
        await page.pdf({
            path: outputFile,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            },
            displayHeaderFooter: false,
            preferCSSPageSize: true
        });
        
        console.log(`✅ PDF generated successfully!`);
        console.log(`📁 File: ${outputFile}`);
        
        // Get file size
        const stats = fs.statSync(outputFile);
        console.log(`📊 Size: ${(stats.size / 1024).toFixed(2)} KB`);
        
    } catch (error) {
        console.error('❌ Error generating PDF:', error.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

generatePDF();
