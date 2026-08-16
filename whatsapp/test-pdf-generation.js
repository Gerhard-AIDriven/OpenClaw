// Test PDF Generation
const fs = require('fs');
const path = require('path');
const htmlPdf = require('html-pdf-node');

const WEB_REPORTS_DIR = 'C:\\Users\\gstim\\.openclaw\\workspace\\aidriven-site\\reports';
const WEB_PDF_DIR = path.join(WEB_REPORTS_DIR, 'pdf');

// Simple test HTML
const testHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { color: #007A4D; }
        .box { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>🧠 AI Driven - Test Report</h1>
    <div class="box">
        <p>This is a test PDF generation.</p>
        <p>If you can read this, PDF generation is working! ✅</p>
        <p>Generated: ${new Date().toISOString()}</p>
    </div>
</body>
</html>`;

async function testPdf() {
  console.log('Testing PDF generation...');
  
  try {
    const file = { content: testHtml };
    const options = { 
      format: 'A4',
      quality: 100,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    };
    
    console.log('Generating PDF...');
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    const pdfPath = path.join(WEB_PDF_DIR, 'test-report.pdf');
    fs.writeFileSync(pdfPath, pdfBuffer);
    
    console.log(`✅ PDF generated successfully: ${pdfPath}`);
    console.log(`File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    
    // Also save HTML
    const htmlPath = path.join(WEB_REPORTS_DIR, 'test-report.html');
    fs.writeFileSync(htmlPath, testHtml);
    console.log(`✅ HTML saved: ${htmlPath}`);
    
  } catch (error) {
    console.error('❌ PDF generation failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testPdf();
