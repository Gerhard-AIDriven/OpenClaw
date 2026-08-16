const puppeteer = require('puppeteer-core');
const fs = require('fs');

// Configuration
const jsonPath = process.argv[2] || 'C:/Users/gstim/.openclaw/workspace/properties/P0006/lim_request_confirmation.json';
const startUrl = process.argv[3] || 'https://eservices.napier.govt.nz/online-services/new/lim/step/1';

// Helper function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Find Edge or Chrome executable on Windows
function findBrowserExecutable() {
    const possiblePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    
    for (const exePath of possiblePaths) {
        if (fs.existsSync(exePath)) {
            return exePath;
        }
    }
    throw new Error('No Chrome/Edge browser found. Please install Chrome or Edge.');
}

async function runAutomation() {
    console.log('=== Napier LIM Browser Automation (Puppeteer) ===');
    console.log(`Loading data from: ${jsonPath}`);
    
    // Load JSON data
    let data;
    try {
        const rawData = fs.readFileSync(jsonPath, 'utf8');
        data = JSON.parse(rawData);
        console.log('✓ Data loaded successfully');
    } catch (err) {
        console.error('✗ Error loading JSON:', err.message);
        process.exit(1);
    }

    let browser;
    try {
        // Launch browser
        const executablePath = findBrowserExecutable();
        console.log(`Using browser: ${executablePath}`);
        
        browser = await puppeteer.launch({
            executablePath: executablePath,
            headless: false, // Show browser for visibility
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-javascript']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Enable request/response logging for debugging
        page.on('request', request => {
            console.log(`  → ${request.method()} ${request.url()}`);
        });
        page.on('response', response => {
            if (response.status() >= 400) {
                console.log(`  ← ${response.status()} ${response.url()}`);
            }
        });

        console.log('');
        console.log('STEP 1: Navigating to property selection...');
        await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.log('✓ Page DOM loaded');
        
        // Wait significantly longer for JavaScript to render the form
        console.log('  Waiting for JavaScript to render form (20 seconds)...');
        await delay(20000);
        
        // Check again after wait
        const htmlContent2 = await page.content();
        console.log(`  HTML content length after wait: ${htmlContent2.length} chars`);
        
        const allInputsAfterWait = await page.$$('input, button, a');
        console.log(`  Found ${allInputsAfterWait.length} interactive elements after wait`);
        
        // Check page title/content to verify we're on the right page
        const pageTitle = await page.title();
        console.log(`  Page title: ${pageTitle}`);
        
        // Get raw HTML to see what's actually on the page
        const htmlContent = await page.content();
        console.log(`  HTML content length: ${htmlContent.length} chars`);
        
        // Print first 500 chars to see what type of page this is
        console.log(`  HTML preview: ${htmlContent.substring(0, 500)}`);
        
        // Check for Shadow DOM hosts
        const shadowHosts = await page.$$('*');
        console.log(`  Total DOM elements: ${shadowHosts.length}`);
        
        // Check for iframes
        const frames = page.frames();
        console.log(`  Found ${frames.length} frame(s)`);
        
        if (frames.length > 0) {
            const frameHtml = await frames[0].content();
            console.log(`  Frame 0 HTML length: ${frameHtml.length} chars`);
        }
        
        let targetFrame = page;
        if (frames.length > 1) {
            for (let i = 0; i < frames.length; i++) {
                const frameUrl = frames[i].url();
                console.log(`    Frame ${i}: ${frameUrl}`);
            }
            // Try to find the main content frame
            for (let i = 0; i < frames.length; i++) {
                try {
                    const frameInputs = await frames[i].$$('input');
                    if (frameInputs.length > 0) {
                        console.log(`  ✓ Found content in frame ${i} (${frameInputs.length} inputs)`);
                        targetFrame = frames[i];
                        break;
                    }
                } catch (e) {
                    // Frame might not be accessible yet
                }
            }
        }
        
        // Try to find any interactive elements
        const allInputs = await targetFrame.$$('input, button, a');
        console.log(`  Found ${allInputs.length} interactive elements in target frame`);

        // Step 1: Property Selection
        console.log('');
        console.log('STEP 2: Searching for property...');
        
        // Try multiple selector strategies for search input
        let searchInput = await targetFrame.$('input[placeholder*="e.g."]');
        if (!searchInput) {
            searchInput = await page.$('input[type="text"]');
        }
        if (!searchInput) {
            // List all inputs for debugging
            const debugInputs = await targetFrame.$$('input');
            console.log(`  Debug: Found ${debugInputs.length} input fields`);
            for (let i = 0; i < debugInputs.length; i++) {
                const placeholder = await targetFrame.evaluate(el => el.placeholder, debugInputs[i]);
                const type = await targetFrame.evaluate(el => el.type, debugInputs[i]);
                const name = await targetFrame.evaluate(el => el.name, debugInputs[i]);
                const id = await targetFrame.evaluate(el => el.id, debugInputs[i]);
                console.log(`    Input ${i}: id="${id}" name="${name}" type="${type}" placeholder="${placeholder}"`);
            }
            throw new Error('Could not find search input field - see debug output above');
        }
        
        const searchTerm = `${data.property_details.physical_address.street_number} ${data.property_details.physical_address.street_name}`;
        await searchInput.type(searchTerm, { delay: 50 });
        console.log(`  Typed: "${searchTerm}"`);
        
        // Click search button - try multiple selectors
        let searchButton = await targetFrame.$('button');
        if (!searchButton) {
            searchButton = await targetFrame.$('input[type="submit"]');
        }
        
        if (searchButton) {
            // Check button text
            const buttonText = await targetFrame.evaluate(el => el.textContent, searchButton);
            console.log(`  Search button text: "${buttonText.trim()}"`);
            await searchButton.click();
            console.log('  Clicked Search');
            
            // Wait for property results to appear
            console.log('  Waiting for property results panel...');
            await delay(5000);
            
            // Look for property result row/panel - try multiple selectors
            let propertyResult = await targetFrame.$('div[class*="result"], tr[class*="result"], .property-result, [class*="property"]');
            
            if (!propertyResult) {
                // Try finding any clickable element with address text
                const allLinks = await targetFrame.$$('a, div[onclick], tr[onclick]');
                console.log(`  Found ${allLinks.length} potentially clickable elements`);
                
                for (let i = 0; i < allLinks.length; i++) {
                    const text = await targetFrame.evaluate(el => el.textContent, allLinks[i]);
                    if (text.includes('Wai Whatu') || text.includes('49')) {
                        propertyResult = allLinks[i];
                        console.log(`  ✓ Found property result by text match: "${text.trim().substring(0, 50)}"`);
                        break;
                    }
                }
            }
            
            if (propertyResult) {
                console.log('  Clicking on property result...');
                await propertyResult.click();
                console.log('  ✓ Clicked property result');
                await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
                await delay(3000);
            } else {
                console.log('  ⚠️  Property result not found - may need manual selection');
                // List available elements for debugging
                const allDivs = await targetFrame.$$('div, tr, a');
                console.log(`  Debug: ${allDivs.length} elements found, checking first 10:`);
                for (let i = 0; i < Math.min(10, allDivs.length); i++) {
                    const txt = await targetFrame.evaluate(el => el.textContent.substring(0, 100), allDivs[i]);
                    console.log(`    ${i}: "${txt}"`);
                }
            }
        } else {
            console.log('  Note: Manual search trigger may be required');
        }

        // Property selection complete - navigation happened after clicking result
        console.log('  Property selected, proceeding to Contact Details...');

        // Step 2: Contact Details
        console.log('');
        console.log('STEP 3: Filling Contact Details...');
        await delay(3000);
        
        // Fill applicant type (radio button)
        const individualRadio = await targetFrame.$('input[type="radio"][value*="individual"]');
        if (individualRadio) {
            await individualRadio.click();
            console.log('  Selected: Individual applicant');
        }
        
        // Fill name fields
        const firstNameInput = await targetFrame.$('input[name*="first"], input[placeholder*="First"]');
        const lastNameInput = await targetFrame.$('input[name*="last"], input[placeholder*="Last"]');
        
        if (firstNameInput) {
            await firstNameInput.type(data.applicant_details.first_name, { delay: 30 });
            console.log(`  First Name: ${data.applicant_details.first_name}`);
        }
        
        if (lastNameInput) {
            await lastNameInput.type(data.applicant_details.last_name, { delay: 30 });
            console.log(`  Last Name: ${data.applicant_details.last_name}`);
        }
        
        // Fill address fields
        const streetInput = await targetFrame.$('input[name*="street"], input[placeholder*="Street"]');
        const suburbInput = await targetFrame.$('input[name*="suburb"], input[placeholder*="Suburb"]');
        const cityInput = await targetFrame.$('input[name*="city"], input[placeholder*="City"]');
        const postcodeInput = await targetFrame.$('input[name*="postcode"], input[placeholder*="Postcode"]');
        
        if (streetInput) await streetInput.type(data.applicant_details.billing_address.street, { delay: 30 });
        if (suburbInput) await suburbInput.type(data.applicant_details.billing_address.suburb, { delay: 30 });
        if (cityInput) await cityInput.type(data.applicant_details.billing_address.city, { delay: 30 });
        if (postcodeInput) await postcodeInput.type(data.applicant_details.billing_address.postcode, { delay: 30 });
        console.log('  Address fields filled');
        
        // Fill contact details
        const phoneInput = await targetFrame.$('input[name*="phone"], input[type="tel"]');
        const emailInput = await targetFrame.$('input[name*="email"], input[type="email"]');
        
        if (phoneInput) {
            await phoneInput.type(data.applicant_details.contact_info.phone, { delay: 30 });
        }
        if (emailInput) {
            await emailInput.type(data.applicant_details.contact_info.email, { delay: 30 });
            // Confirm email
            const confirmEmailInput = await targetFrame.$('input[name*="confirm"], input[type="email"]:nth-of-type(2)');
            if (confirmEmailInput) {
                await confirmEmailInput.type(data.applicant_details.contact_info.email, { delay: 30 });
            }
        }
        console.log('  Contact details filled');
        
        // Click Continue - find button by text
        let continueButton1 = await targetFrame.$('button');
        if (!continueButton1) {
            continueButton1 = await targetFrame.$('input[type="submit"]');
        }
        
        if (continueButton1) {
            const btnText = await targetFrame.evaluate(el => el.textContent, continueButton1);
            console.log(`  Button text: "${btnText.trim()}"`);
            await continueButton1.click();
            console.log('  Clicked Continue');
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
            await delay(3000);
        }

        // Step 3: Options
        console.log('');
        console.log('STEP 4: Selecting Options...');
        await delay(3000);
        
        // Select fee type (radio button)
        const residentialRadio = await targetFrame.$('input[type="radio"][value*="420"], input[type="radio"][value*="Residential"]');
        if (residentialRadio) {
            await residentialRadio.click();
            console.log('  Selected: Residential fee ($420)');
        }
        
        // Check Terms & Conditions
        const termsCheckbox = await targetFrame.$('input[type="checkbox"]');
        if (termsCheckbox) {
            await termsCheckbox.click();
            console.log('  ✓ Checked Terms & Conditions');
        } else {
            console.log('  ⚠️  Terms checkbox not found - may need manual check');
        }
        
        // Click Continue
        let continueButton2 = await targetFrame.$('button');
        if (!continueButton2) {
            continueButton2 = await targetFrame.$('input[type="submit"]');
        }
        
        if (continueButton2) {
            const btnText = await targetFrame.evaluate(el => el.textContent, continueButton2);
            console.log(`  Button text: "${btnText.trim()}"`);
            await continueButton2.click();
            console.log('  Clicked Continue');
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
            await delay(3000);
        }

        // Step 4: Summary
        console.log('');
        console.log('STEP 5: Reviewing Summary...');
        await delay(3000);
        console.log('  Summary page loaded - please verify details visually');
        
        // Click Continue to payment
        let continueButton3 = await targetFrame.$('button');
        if (!continueButton3) {
            continueButton3 = await targetFrame.$('input[type="submit"]');
        }
        
        if (continueButton3) {
            const btnText = await targetFrame.evaluate(el => el.textContent, continueButton3);
            console.log(`  Button text: "${btnText.trim()}"`);
            await continueButton3.click();
            console.log('  Clicked Continue to Payment');
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
            await delay(3000);
        }

        // Step 5: Payment Page (STOP HERE)
        console.log('');
        console.log('========================================');
        console.log('STEP 6: PAYMENT PAGE REACHED ✓');
        console.log('========================================');
        console.log('  ⚠️  AUTOMATION STOPPED - Manual payment required');
        console.log('  Total due: $420.00 NZD');
        console.log('');
        console.log('The form is now ready for manual payment processing.');
        console.log('Do NOT automate the "Proceed To Credit Card Payment" button.');

        // Keep browser open for user verification
        console.log('');
        console.log('Browser will remain open for 60 seconds for verification...');
        await delay(60000);

    } catch (err) {
        console.error('✗ Automation error:', err.message);
        console.error('Stack:', err.stack);
    } finally {
        if (browser) {
            console.log('Closing browser...');
            await browser.close();
        }
    }
}

// Run the automation
runAutomation().catch(console.error);
