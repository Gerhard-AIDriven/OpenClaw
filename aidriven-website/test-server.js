/**
 * LOCAL TEST SERVER
 * Simulates Cloudflare Pages environment for testing
 * 
 * Run: node test-server.js
 * Then open: http://localhost:3000
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Serve static files
app.use('/', express.static(path.join(__dirname, '.')));
app.use('/api', express.static(path.join(__dirname, 'api')));
app.use('/lib', express.static(path.join(__dirname, 'lib')));
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0-beta'
    });
});

// Import API handlers
let generateReportApp;
let whatsappWebhookApp;

try {
    generateReportApp = require('./api/generate-report');
    console.log('✅ Loaded generate-report.js');
} catch (err) {
    console.log('⚠️ Could not load generate-report.js:', err.message);
}

try {
    whatsappWebhookApp = require('./api/whatsapp-webhook');
    console.log('✅ Loaded whatsapp-webhook.js');
} catch (err) {
    console.log('⚠️ Could not load whatsapp-webhook.js:', err.message);
}

// Mount API apps
if (generateReportApp) {
    app.use('/api-generate', generateReportApp); // Mount at different path to avoid conflict
}

if (whatsappWebhookApp) {
    app.use('/api-whatsapp', whatsappWebhookApp);
}

// Direct route handlers for testing (simplified)
app.post('/api/generate-report', async (req, res) => {
    const { address, lat, lon, rid } = req.body;
    
    if (!address || !lat || !lon) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['address', 'lat', 'lon']
        });
    }
    
    try {
        console.log('\n🌐 Test server request:', { address, lat, lon, rid });
        
        // Import report engine directly
        const { generateStandardReport, generateReportHTML } = require('./api/report-engine');
        const fs = require('fs').promises;
        const path = require('path');
        
        // Generate report
        const report = await generateStandardReport({
            address,
            coords: { lat: parseFloat(lat), lon: parseFloat(lon) },
            rid
        });
        
        // Create report directory
        const reportId = report.reportId;
        const reportDir = path.join(__dirname, 'reports', reportId);
        await fs.mkdir(reportDir, { recursive: true });
        
        // Save JSON
        await fs.writeFile(
            path.join(reportDir, 'report.json'),
            JSON.stringify(report, null, 2),
            'utf8'
        );
        
        // Save HTML
        const html = generateReportHTML(report);
        await fs.writeFile(
            path.join(reportDir, 'report.html'),
            html,
            'utf8'
        );
        
        console.log(`✅ Report generated: ${reportId}`);
        
        // Return response
        res.json({
            success: true,
            reportId,
            tier: report.tier,
            price: report.price,
            summary: {
                address: report.property.address,
                riskRating: report.sections.hazards?.overallAssessment?.riskRating,
                gabrielleAffected: report.sections.hazards?.hazards?.cycloneGabrielle?.affected,
                ratesAvailable: report.sections.rates?.success || false
            },
            localPath: `http://localhost:${PORT}/reports/${reportId}/report.html`
        });
        
    } catch (error) {
        console.error('Report generation failed:', error);
        res.status(500).json({
            error: 'Report generation failed',
            message: error.message
        });
    }
});

// WhatsApp verification (GET request from Meta)
app.get('/api/whatsapp-webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN || 'test-token') {
        console.log('✅ WhatsApp webhook verified');
        res.status(200).send(challenge);
    } else {
        res.status(403).send('Verification failed');
    }
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 TEST SERVER RUNNING');
    console.log('=' .repeat(60));
    console.log(`Local URL:   http://localhost:${PORT}`);
    console.log(`Landing page: http://localhost:${PORT}/index.html`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log('');
    console.log('API Endpoints:');
    console.log(`  POST /api/generate-report   - Generate property report`);
    console.log(`  POST /api/whatsapp-webhook  - WhatsApp webhook`);
    console.log(`  GET  /api/whatsapp-webhook  - WhatsApp verification`);
    console.log('');
    console.log('Press Ctrl+C to stop');
    console.log('=' .repeat(60));
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down test server...');
    process.exit(0);
});
