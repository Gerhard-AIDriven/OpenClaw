#!/usr/bin/env node

/**
 * AI Driven - WhatsApp Property Report Webhook Handler
 * 
 * Receives property inquiries via WhatsApp Meta API
 * Generates Standard Tier reports automatically
 * Returns report summary + PDF link via WhatsApp
 * 
 * Endpoints:
 * POST /webhook/whatsapp - Meta webhook receiver
 */

const express = require('express');
const { generateStandardReport, generateReportHTML } = require('./report-engine');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

// Meta WhatsApp webhook config
const CONFIG = {
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'ai-driven-verify-2026',
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '1200711009799782',
  port: process.env.PORT || 3000
};

/**
 * WhatsApp Webhook GET (verification)
 * Meta verifies webhooks with GET request
 */
app.get('/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === CONFIG.verifyToken) {
    console.log('✅ WhatsApp webhook verified');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    res.sendStatus(403);
  }
});

/**
 * WhatsApp Webhook POST (incoming messages)
 * Handles property report requests
 */
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    const body = req.body;
    
    // Check if this is a message from Meta
    if (body.object !== 'whatsapp_business_account') {
      return res.sendStatus(404);
    }
    
    // Get message details
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];
    
    if (!message) {
      return res.sendStatus(400);
    }
    
    const from = message.from; // WhatsApp user ID
    const text = message.text?.body || '';
    
    console.log(`\n📱 WhatsApp message from ${from}:`);
    console.log(text);
    
    // Check if this is a property report request
    if (text.toLowerCase().includes('property report') || 
        text.toLowerCase().includes('due diligence') ||
        text.includes('RID:') ||
        text.includes('address:')) {
      
      // Extract address and RID from message
      const addressMatch = text.match(/address:\s*([^\n\r]+)/i);
      const ridMatch = text.match(/rid:\s*(\d+-\d+)/i);
      const coordsMatch = text.match(/coords?:\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/i);
      
      const address = addressMatch ? addressMatch[1].trim() : 'Unknown';
      const rid = ridMatch ? ridMatch[1] : null;
      const coords = coordsMatch ? {
        lat: parseFloat(coordsMatch[1]),
        lon: parseFloat(coordsMatch[2])
      } : null;
      
      // Send "generating report" message
      await sendWhatsAppMessage(from, '🔍 Generating your property report... This may take 1-2 minutes.');
      
      // Generate report
      try {
        const report = await generateStandardReport({
          address,
          coords: coords || { lat: -39.4928, lon: 176.9120 }, // Default to Napier
          rid
        });
        
        // Save HTML report
        const reportDir = path.join(__dirname, 'reports', from);
        await fs.mkdir(reportDir, { recursive: true });
        const htmlPath = path.join(reportDir, `${report.reportId}.html`);
        await fs.writeFile(htmlPath, generateReportHTML(report), 'utf8');
        
        // Send summary via WhatsApp
        const summary = generateWhatsAppSummary(report);
        await sendWhatsAppMessage(from, summary);
        
        // Send report link
        const reportUrl = `https://aidriven.biz/reports/${from}/${report.reportId}.html`;
        await sendWhatsAppMessage(from, `📄 View full report:\n${reportUrl}`);
        
      } catch (error) {
        console.error('Report generation failed:', error);
        await sendWhatsAppMessage(from, '❌ Sorry, report generation failed. Please try again or contact support.');
      }
    }
    
    // Always acknowledge receipt
    res.sendStatus(200);
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

/**
 * Generate WhatsApp-friendly report summary
 */
function generateWhatsAppSummary(report) {
  const { sections, property } = report;
  
  let summary = `*Property Report Summary*\n\n`;
  summary += `📍 ${property.address}\n\n`;
  
  // Hazard summary
  if (sections.hazards?.overallAssessment) {
    const risk = sections.hazards.overallAssessment.riskRating;
    const emoji = risk === 'High' ? '⚠️' : risk === 'Moderate' ? '⚡' : '✅';
    summary += `${emoji} *Hazard Risk:* ${risk}\n`;
    
    if (sections.hazards.hazards.cycloneGabrielle?.affected) {
      summary += `💧 *Gabrielle Flood:* YES - Affected\n`;
    } else {
      summary += `💧 *Gabrielle Flood:* No impact\n`;
    }
  }
  
  // Rates summary
  if (sections.rates?.success) {
    const cv = sections.rates.data.capital_value?.toLocaleString();
    const rates = sections.rates.data.annual_rates?.toLocaleString();
    summary += `\n💰 *Capital Value:* $${cv}\n`;
    summary += `📊 *Annual Rates:* $${rates}\n`;
  }
  
  summary += `\n_View full report for complete details and HBRC verification links._`;
  
  return summary;
}

/**
 * Send WhatsApp message via Meta API
 */
async function sendWhatsAppMessage(to, text) {
  const url = `https://graph.facebook.com/v17.0/${CONFIG.phoneNumberId}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { body: text }
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`);
    }
    
    console.log(`✅ Message sent to ${to}`);
    return response.json();
    
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    throw error;
  }
}

// Start server
if (require.main === module) {
  app.listen(CONFIG.port, () => {
    console.log('🚀 WhatsApp webhook server running on port', CONFIG.port);
    console.log('Webhook URL: http://localhost:' + CONFIG.port + '/webhook/whatsapp');
  });
}

module.exports = app;
