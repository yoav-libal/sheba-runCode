#!/usr/bin/env node

/**
 * convertHTML2PDF-standalone.js - TRUE standalone HTML to PDF converter
 * U
 * ses @sparticuz/chromium-min for embedded browser - NO external dependencies
 * Creates a SINGLE EXE with everything included
 */

const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const puppeteer = require('puppeteer-core');
        const path = require('path');
        const { execSync } = require('child_process');

        console.log('🚀 Standalone HTML to PDF Converter');
        console.log('===================================');

        // Parse command line arguments
        const args = process.argv.slice(2);
        
        if (args.length < 2 || args.includes('/?') || args.includes('--help')) {
            showHelp();
            process.exit(0);
        }

        // Parse arguments for browser path
        let browserPath = null;
        let inputFile = null;
        let outputFile = null;
        
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '--bpath' && i + 1 < args.length) {
                browserPath = args[i + 1];
                i++; // Skip next argument
            } else if (!inputFile) {
                inputFile = args[i];
            } else if (!outputFile) {
                outputFile = args[i];
            }
        }

        if (!inputFile && !outputFile) {
            throw new Error('❌ Missing both input and output files.\n\nUsage: convertHTML2PDF.exe [--bpath <browser-path>] <input.html> <output.pdf>');
        } else if (!inputFile) {
            throw new Error('❌ Missing input HTML file.\n\nUsage: convertHTML2PDF.exe [--bpath <browser-path>] <input.html> <output.pdf>');
        } else if (!outputFile) {
            throw new Error('❌ Missing output PDF file.\n\nUsage: convertHTML2PDF.exe [--bpath <browser-path>] <input.html> <output.pdf>');
        }

        // Validate input file
        if (!fs.existsSync(inputFile)) {
            throw new Error(`Input file not found: ${inputFile}`);
        }

        console.log(`📖 Input: ${inputFile}`);
        console.log(`💾 Output: ${outputFile}`);

        // Find Chrome executable using smart caching logic
        const executablePath = await findOrCacheChrome(browserPath);
        
        // Read HTML content
        const htmlContent = fs.readFileSync(inputFile, 'utf8');
        console.log(`✅ HTML content loaded (${htmlContent.length} characters)`);

        // Launch browser
        console.log('🔧 Launching browser...');
        console.log(`📍 Using Chrome: ${executablePath}`);
        
        const browser = await puppeteer.launch({
            executablePath: executablePath,
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-first-run',
                '--disable-web-security'
            ]
        });

        console.log('✅ Browser launched successfully');

        // Create page and set content
        const page = await browser.newPage();
        
        // Set viewport for proper rendering
        await page.setViewport({ width: 1200, height: 800 });
        
        // Set content with proper encoding
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        console.log('📄 HTML content loaded in browser');

        // Generate PDF
        console.log('🔄 Generating PDF...');
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        // Close browser
        await browser.close();
        console.log('🔒 Browser closed');

        // Write PDF file
        fs.writeFileSync(outputFile, pdfBuffer);
        
        console.log('✅ PDF generated successfully!');
        console.log(`📊 File size: ${Math.round(pdfBuffer.length / 1024)}KB`);
        console.log(`💾 Saved: ${path.resolve(outputFile)}`);

    } catch (error) {
        console.error('❌ Conversion failed:', error.message);
        process.exit(1);
    }
}

async function findOrCacheChrome(providedPath) {
    const { execSync } = require('child_process');
    const configFile = 'configPdf2HTML.json';
    
    console.log('🔍 Looking for Chrome/Edge browser...');
    
    // Step 1: Check if user provided --bpath
    if (providedPath) {
        console.log(`📋 User provided browser path: ${providedPath}`);
        
        if (fs.existsSync(providedPath)) {
            console.log('✅ User-provided browser path is valid');
            
            // Save to config file for future use
            const config = { chromePath: providedPath, lastUpdated: new Date().toISOString() };
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            console.log(`💾 Browser path saved to ${configFile} for future use`);
            
            return providedPath;
        } else {
            throw new Error(`❌ Browser executable not found at provided path: ${providedPath}

🔧 SOLUTION: 
  Please verify the exact path to chrome.exe or msedge.exe

📍 EXAMPLE:
  convertHTML2PDF.exe --bpath "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" input.html output.pdf

⚠️  IMPORTANT: Path must include the .exe filename (chrome.exe or msedge.exe)`);
        }
    }
    
    // Step 2: Check if config file exists with cached Chrome path
    if (fs.existsSync(configFile)) {
        console.log(`📄 Found existing config file: ${configFile}`);
        
        try {
            const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
            
            if (config.chromePath && fs.existsSync(config.chromePath)) {
                console.log(`✅ Using cached Chrome path: ${config.chromePath}`);
                console.log(`📅 Last updated: ${config.lastUpdated}`);
                return config.chromePath;
            } else {
                console.log('⚠️  Cached Chrome path is no longer valid, searching for new installation...');
            }
        } catch (error) {
            console.log('⚠️  Config file is corrupted, searching for Chrome installation...');
        }
    }
    
    // Step 3: Auto-detect Chrome using 'where' command
    console.log('🔎 Auto-detecting Chrome/Edge installation...');
    
    const browsers = [
        { name: 'chrome', displayName: 'Google Chrome' },
        { name: 'msedge', displayName: 'Microsoft Edge' },
        { name: 'chromium', displayName: 'Chromium' }
    ];
    
    for (const browser of browsers) {
        try {
            console.log(`   Searching for ${browser.displayName}...`);
            const result = execSync(`where ${browser.name}`, { encoding: 'utf8' }).trim();
            const detectedPath = result.split('\n')[0]; // First result
            
            if (fs.existsSync(detectedPath)) {
                console.log(`✅ Found ${browser.displayName}: ${detectedPath}`);
                
                // Save to config file for future use
                const config = { 
                    chromePath: detectedPath, 
                    browserName: browser.displayName,
                    lastUpdated: new Date().toISOString() 
                };
                fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
                console.log(`💾 Chrome path saved to ${configFile} for future use`);
                
                return detectedPath;
            }
        } catch (error) {
            console.log(`   ${browser.displayName} not found in PATH`);
        }
    }
    
    // Step 4: No Chrome found - provide clear instructions for exact path
    throw new Error(`❌ No Chrome/Edge installation found automatically!

🎯 SOLUTION: Provide exact browser path using --bpath

USAGE:
  convertHTML2PDF.exe --bpath "<EXACT_BROWSER_PATH>" input.html output.pdf

⚠️  IMPORTANT: Path must include chrome.exe or msedge.exe filename

📍 FIND YOUR BROWSER PATH:
  
  Google Chrome:
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    
  Microsoft Edge:
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"

💡 EXAMPLE WITH QUOTES:
  convertHTML2PDF.exe --bpath "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" document.html document.pdf

✅ ONCE WORKING: Path will be saved to configPdf2HTML.json for future automatic use.

🔧 ALTERNATIVE: Install Google Chrome from https://www.google.com/chrome/`);
}

function showHelp() {
    console.log(`
Standalone HTML to PDF Converter with Smart Chrome Detection
===========================================================

Usage: 
  convertHTML2PDF.exe <input.html> <output.pdf>
  convertHTML2PDF.exe --bpath <browser-path> <input.html> <output.pdf>

Examples:
  convertHTML2PDF.exe document.html document.pdf
  convertHTML2PDF.exe --bpath "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" doc.html doc.pdf

Options:
  --bpath <path>          Specify Chrome/Edge executable path (will be cached for future use)
  --help, /?              Show this help message

🔧 Smart Chrome Detection:
  1. If --bpath provided: Uses specified path and saves to configPdf2HTML.json
  2. If configPdf2HTML.json exists: Uses cached Chrome path  
  3. Auto-detection: Searches for Chrome/Edge using 'where' command
  4. If none found: Shows installation instructions

💾 Configuration File:
  The program creates 'configPdf2HTML.json' to cache Chrome location for faster startup.

🌐 Supported Browsers:
  - Google Chrome (preferred)
  - Microsoft Edge (Windows 10/11 default)
  - Chromium (open source)

✅ Features:
  - Hebrew/RTL text support
  - CSS styling and images  
  - JavaScript execution
  - Fast PDF generation
  - Smart browser caching

Note: This converter requires a Chromium-based browser (Chrome/Edge) to function.
    `);
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = { main };