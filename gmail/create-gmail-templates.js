/**
 * Create Gmail Drafts for Manual Processing Email Templates
 * 
 * This script creates 5 draft emails in your Gmail account using the Gmail API.
 * After running, you'll see 5 drafts in Gmail - open each one and save as a template.
 * 
 * Prerequisites:
 * - Gmail API credentials already set up (gmail/credentials.json exists)
 * - Gmail API enabled for gerhard@aidriven.biz
 * 
 * Usage:
 *   node create-gmail-templates.js
 * 
 * After running:
 * 1. Open Gmail → Drafts folder
 * 2. Open each draft (they'll be titled "TEMPLATE: [Name]")
 * 3. Click three dots ⋮ → Templates → Save draft as template
 * 4. Name it (e.g., "DD - Manual Processing Ack")
 * 5. Delete the draft after saving as template
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CREDENTIALS_PATH = path.join(__dirname, '..', 'gmail', 'credentials.json');
const TOKEN_PATH = path.join(__dirname, '..', 'gmail', 'token.json');
const SCOPES = ['https://www.googleapis.com/auth/gmail.compose', 'https://www.googleapis.com/auth/gmail.send'];

// Email templates
const TEMPLATES = [
  {
    name: 'DD - Manual Processing Ack',
    subject: 'Your Property Due Diligence Report - Manual Processing Required',
    body: `Hi [Customer Name],

Thank you for your order for a [Package Name] Report for:
[Property Address]

I've received your request and note that you've selected:
☐ Rates Information
☐ Council Fees & Permits

These services require manual processing and will be completed within 24-48 hours (rather than the standard automated delivery time).

WHAT HAPPENS NEXT:
1. I'll personally retrieve the rates/council information for this property
2. Your full report will be compiled and quality-checked
3. You'll receive the complete PDF report via email within 48 hours

If you have any questions or need this sooner, please reply to this email or call/text me at 021 XXX XXXX.

Thanks for your patience!

Cheers,
Gerhard
AI Driven
gerhard@aidriven.biz
021 XXX XXXX

⚠️ Reminder: This is an informational report, not a legal LIM.`
  },
  {
    name: 'DD - Report Delivery',
    subject: 'Your Property Due Diligence Report is Ready - [Property Address]',
    body: `Hi [Customer Name],

Great news! Your comprehensive Property Due Diligence Report is ready.

ATTACHED: [Report Filename].pdf

This report includes:
✓ All [Package Name] package items
✓ Current rates information (as of [date])
✓ Council fees & permits history (if requested)

IMPORTANT NOTES:
• Rates information is current as of [date] but may change
• This is an informational report, NOT a legal LIM
• For final settlement decisions, please obtain a formal LIM

NEXT STEPS:
• Review the report carefully
• If anything is unclear, reply to this email
• Consider a full LIM if proceeding with purchase
• Book a 15-min call if you want to discuss findings (Premium only)

Questions? I'm here to help!

Cheers,
Gerhard
AI Driven
gerhard@aidriven.biz
021 XXX XXXX

⚠️ Disclaimer: This report is for informational purposes only and is not a substitute for professional legal, building, or valuation advice.`
  },
  {
    name: 'DD - RID Request Follow-up',
    subject: 'Quick question about your property report - [Address]',
    body: `Hi [Customer Name],

I'm working on your property report and need a quick clarification to ensure I pull the correct records.

Could you please confirm:
• Is the property freehold or unit title?
• Do you have the certificate of title number? (if available)
• Any other identifying details? (e.g., "the blue house on the corner", "unit 2 of 3")

This helps me locate the exact property in the council system, especially for multi-unit sites or complex titles.

Thanks for your help!

Cheers,
Gerhard
AI Driven
gerhard@aidriven.biz`
  },
  {
    name: 'DD - Expedited Service Offer',
    subject: 'Expedited service available for your report',
    body: `Hi [Customer Name],

I understand you need your report sooner than the standard 48-hour manual processing time.

I can offer an **expedited service** for an additional $50 NZD, which will prioritize your report and deliver it within 12 hours (or same business day if ordered before 2pm).

Would you like me to proceed with expedited processing? If yes, I'll send you a payment link for the rush fee.

Let me know!

Cheers,
Gerhard
AI Driven
gerhard@aidriven.biz
021 XXX XXXX`
  },
  {
    name: 'DD - Partial Delivery',
    subject: 'Part 1 of 2: Your Property Report (LINZ + Hazards) - [Address]',
    body: `Hi [Customer Name],

Good news! Part 1 of your Property Due Diligence Report is ready.

ATTACHED: [Report Filename]-Part1.pdf

This includes:
✓ LINZ title information
✓ Legal property details
✓ Natural hazard assessment
✓ Zoning confirmation

PART 2 (Rates & Council Fees):
I'm currently retrieving the rates and council information manually. This takes 24-48 hours and will be sent as a separate email with the complete consolidated report.

Expected delivery: Within 48 hours of your original order

If you need this sooner, reply to this email and I'll see what I can do!

Cheers,
Gerhard
AI Driven
gerhard@aidriven.biz`
  }
];

/**
 * Load authorized credentials
 */
async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  
  // Check for existing token
  let token;
  if (fs.existsSync(TOKEN_PATH)) {
    token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oauth2Client.setCredentials(token);
    console.log('✅ Loaded existing Gmail API token');
    return oauth2Client;
  }
  
  // Need to get new token
  console.log('❌ No Gmail API token found. Please authorize first.');
  console.log('\n📝 Run this command to authorize:');
  console.log('   node gmail-monitor.js --authorize\n');
  process.exit(1);
}

/**
 * Create a draft email
 */
async function createDraft(auth, subject, body) {
  const gmail = google.gmail({ version: 'v1', auth });
  
  const message = [
    'From: gerhard@aidriven.biz',
    'To: ',
    'Subject: ' + subject,
    '',
    body
  ].join('\n');
  
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  try {
    const response = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: {
        message: {
          raw: encodedMessage
        }
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to create draft:', error.message);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('📧 Creating Gmail drafts for email templates...\n');
  
  try {
    const auth = await authorize();
    
    console.log(`✅ Authorized as gerhard@aidriven.biz\n`);
    console.log(`Creating ${TEMPLATES.length} drafts...\n`);
    
    for (const template of TEMPLATES) {
      try {
        const draft = await createDraft(auth, template.subject, template.body);
        console.log(`✅ Created draft: "${template.name}"`);
        console.log(`   Draft ID: ${draft.id}`);
        console.log(`   Subject: ${template.subject}\n`);
      } catch (error) {
        console.error(`❌ Failed to create draft "${template.name}":`, error.message);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n🎉 DONE! Next steps:\n');
    console.log('1. Open Gmail → Drafts folder');
    console.log('2. You\'ll see 5 drafts with subjects starting with your template names');
    console.log('3. For each draft:');
    console.log('   a. Open the draft');
    console.log('   b. Replace [bracketed placeholders] with actual values when using');
    console.log('   c. Click three dots ⋮ (bottom right)');
    console.log('   d. Select "Templates" → "Save draft as template"');
    console.log('   e. Name it (e.g., "DD - Manual Processing Ack")');
    console.log('   f. Click Save');
    console.log('   g. Delete the draft (no longer needed)');
    console.log('\n4. Repeat for all 5 drafts\n');
    console.log('💡 Pro tip: Use short internal names like "DD - Manual Ack" so they');
    console.log('   group together in Gmail\'s template dropdown.\n');
    console.log('='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run
main();
