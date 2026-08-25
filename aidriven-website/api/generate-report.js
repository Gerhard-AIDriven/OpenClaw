#!/usr/bin/env node

/**
 * AI Driven - Web Form Report Handler
 * 
 * Simple Express server to handle property report requests from website form
 * Generates reports and returns HTML/PDF
 */

const express = require('express');
const cors = require('cors');
const { generateStandardReport, generateReportHTML } = require('./report-engine');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

/**
 * POST /api/generate-report
 * Body: { address, lat, lon, rid?, email? }
 */
app.post('/api/generate-report', async (req, res) => {
  try {
    const { address, lat, lon, rid, email } = req.body;
    
    if (!address || !lat || !lon) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['address', 'lat', 'lon']
      });
    }
    
    console.log('\n🌐 Web form request:', { address, lat, lon, rid });
    
    // Generate report
    const report = await generateStandardReport({
      address,
      coords: { lat: parseFloat(lat), lon: parseFloat(lon) },
      rid
    });
    
    // Create report directory
    const reportId = report.reportId;
    const reportDir = path.join(__dirname, 'web-reports', reportId);
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
      viewUrl: `https://aidriven.biz/reports/${reportId}/report.html`,
      downloadUrl: `https://aidriven.biz/reports/${reportId}/report.json`
    });
    
  } catch (error) {
    console.error('Report generation failed:', error);
    res.status(500).json({
      error: 'Report generation failed',
      message: error.message
    });
  }
});

/**
 * GET /api/report/:id
 * View existing report
 */
app.get('/api/report/:id', async (req, res) => {
  try {
    const reportId = req.params.id;
    const reportPath = path.join(__dirname, 'web-reports', reportId, 'report.html');
    
    const html = await fs.readFile(reportPath, 'utf8');
    res.type('text/html').send(html);
    
  } catch (error) {
    res.status(404).json({ error: 'Report not found' });
  }
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Web form handler running on port ${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/api/generate-report`);
  });
}

module.exports = app;
