#!/usr/bin/env node

/**
 * Standalone HTML to PDF Converter
 * Independent script for Windows environment only
 * Compiles to: convertHTML2PDF.exe
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer'); // Use full puppeteer with bundled Chromium

// Color console output - robust for any directory
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

function log(color, message) {
    try {
        // Use process.stdout.write for more reliable output
        const colorCode = colors[color] || colors.white;
        const output = colorCode + message + colors.reset + '\n';
        process.stdout.write(output);
    } catch (error) {
        // Fallback to console.log if stdout fails
        console.log(message);
    }
}

function printUsage() {
    try {
        // Ensure usage is always printed regardless of directory
        const usageText = `
convertHTML2PDF - Standalone HTML to PDF Converter
=================================================

USAGE:
  convertHTML2PDF.exe <input.html> <output.pdf>
  convertHTML2PDF.exe /? | -? | --help | -h

PARAMETERS:
  input.html    Input HTML file to convert (required)
  output.pdf    Output PDF file to create (required)

OPTIONS:
  /?            Display this help message
  -?            Display this help message
  --help        Display this help message
  -h            Display this help message

EXAMPLES:
  convertHTML2PDF.exe document.html document.pdf
  convertHTML2PDF.exe "report file.html" "C:\\Reports\\report.pdf"
  convertHTML2PDF.exe index.htm output.pdf
  convertHTML2PDF.exe /?

NOTES:
  - Input file must have .html or .htm extension
  - Output file must have .pdf extension
  - Output directory must exist

`;
        // Try multiple output methods for maximum compatibility
        try {
            process.stdout.write(usageText);
        } catch (e1) {
            try {
                console.log(usageText);
            } catch (e2) {
                // Last resort - direct write
                process.stderr.write(usageText);
            }
        }
    } catch (error) {
        // Emergency fallback
        console.log('convertHTML2PDF.exe <input.html> <output.pdf>');
        console.log('Use convertHTML2PDF.exe /? for help');
    }
}

// Parse command line arguments
function parseArguments() {
    const args = process.argv.slice(2);
    
    // Check for help switches first (Windows standard)
    if (args.length === 0 || 
        args.includes('/?') || 
        args.includes('-?') || 
        args.includes('--help') || 
        args.includes('-h')) {
        printUsage();
        process.exit(0);
    }
    
    // Validate parameter count
    if (args.length < 2) {
        log('red', '❌ Error: Insufficient parameters provided');
        log('white', '   Expected: 2 parameters, got: ' + args.length);
        printUsage();
        process.exit(1);
    }
    
    if (args.length > 2) {
        log('yellow', '⚠️  Warning: Too many parameters provided');
        log('white', `   Expected: 2 parameters, got: ${args.length}`);
        log('white', '   Only the first two parameters will be used');
        log('white', '');
    }
    
    const inputFile = args[0];
    const outputFile = args[1];
    
    // Validate input file exists
    if (!fs.existsSync(inputFile)) {
        log('red', `❌ Error: Input file not found`);
        log('white', `   File: "${inputFile}"`);
        log('white', '   Please check the file path and try again');
        printUsage();
        process.exit(1);
    }
    
    // Validate input file extension
    if (!inputFile.toLowerCase().endsWith('.html') && !inputFile.toLowerCase().endsWith('.htm')) {
        log('red', '❌ Error: Invalid input file type');
        log('white', `   File: "${inputFile}"`);
        log('white', '   Expected: .html or .htm file');
        printUsage();
        process.exit(1);
    }
    
    // Validate output file extension
    if (!outputFile.toLowerCase().endsWith('.pdf')) {
        log('red', '❌ Error: Invalid output file type');
        log('white', `   File: "${outputFile}"`);
        log('white', '   Expected: .pdf file');
        printUsage();
        process.exit(1);
    }
    
    // Check if output directory exists and is writable
    const outputDir = require('path').dirname(outputFile);
    if (outputDir !== '.' && !fs.existsSync(outputDir)) {
        log('red', `❌ Error: Output directory does not exist`);
        log('white', `   Directory: "${outputDir}"`);
        log('white', '   Please create the directory first or use an existing path');
        printUsage();
        process.exit(1);
    }
    
    // Check if output file already exists (warning only)
    if (fs.existsSync(outputFile)) {
        log('yellow', `⚠️  Warning: Output file will be overwritten`);
        log('white', `   File: "${outputFile}"`);
        log('white', '');
    }
    
    return { inputFile, outputFile };
}

// Main conversion function
async function convertHTMLtoPDF(inputFile, outputFile) {
    let browser = null;
    
    try {
        log('cyan', '🚀 HTML to PDF Converter - Standalone');
        log('cyan', '====================================');
        log('white', `📄 Input:  ${inputFile}`);
        log('white', `📊 Output: ${outputFile}`);
        
        // Read HTML content
        log('blue', '📖 Reading HTML file...');
        const htmlContent = fs.readFileSync(inputFile, 'utf8');
        log('green', `✅ Read ${htmlContent.length} characters`);
        
        // Use bundled Chromium from full puppeteer package
        
        
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });
        
        
        // Create new page
        const page = await browser.newPage();
        
        // Set viewport for consistent rendering
        await page.setViewport({
            width: 1200,
            height: 1600,
            deviceScaleFactor: 1
        });
        
        // Set content and wait for everything to load
        log('blue', '📄 Setting page content...');
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        
        log('blue', '📄 Generating PDF...');
        
        // Generate PDF with optimized settings
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: false,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            },
            displayHeaderFooter: false
        });
        
        // Save PDF
        log('blue', '💾 Saving PDF file...');
        fs.writeFileSync(outputFile, pdfBuffer);
        
        // Get file size
        const stats = fs.statSync(outputFile);
        const sizeKB = Math.round(stats.size / 1024);
        
        log('green', '✅ PDF created successfully!');
        log('white', `📊 File: ${outputFile}`);
        log('white', `📏 Size: ${sizeKB} KB`);
        
        return true;
        
    } catch (error) {
        log('red', `❌ Conversion failed: ${error.message}`);
        log('white', '');
        
        // Print specific guidance for common error types
        if (error.message.includes('ENOENT') || error.message.includes('no such file')) {
            log('white', 'CAUSE: Input file not found or path incorrect');
            log('white', 'SOLUTION: Check the file path and ensure the file exists');
        } else if (error.message.includes('EACCES') || error.message.includes('permission denied')) {
            log('white', 'CAUSE: Permission denied to write output file');
            log('white', 'SOLUTION: Check write permissions or choose a different output location');
        } else if (error.message.includes('Browser') || error.message.includes('Chrome')) {
            log('white', 'CAUSE: Bundled Chromium browser failed to launch');
            log('white', 'SOLUTION: This is a platform compatibility issue with the bundled browser');
        } else if (error.message.includes('timeout')) {
            log('white', 'CAUSE: Conversion timeout (file too complex or large)');
            log('white', 'SOLUTION: Try with a simpler HTML file or check network connectivity');
        } else {
            log('white', 'CAUSE: Unexpected error during conversion');
            log('white', 'SOLUTION: Check input file format and try again');
        }
        
        log('white', '');
        log('white', 'Use convertHTML2PDF.exe /? for help and usage information');
        
        return false;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Main execution
async function main() {
    try {
        const { inputFile, outputFile } = parseArguments();
        
        const success = await convertHTMLtoPDF(inputFile, outputFile);
        
        if (success) {
            log('green', '🎉 Conversion completed successfully!');
            process.exit(0);
        } else {
            log('red', '💥 Conversion failed!');
            process.exit(1);
        }
        
    } catch (error) {
        log('red', `💥 Critical error: ${error.message}`);
        process.exit(1);
    }
}

// Handle unhandled rejections - ensure output works anywhere
process.on('unhandledRejection', (reason, promise) => {
    try {
        process.stderr.write(`Error: ${reason}\n`);
        process.stderr.write('Use convertHTML2PDF.exe /? for help\n');
    } catch (e) {
        console.error('Error occurred. Use convertHTML2PDF.exe /? for help');
    }
    process.exit(1);
});

// Handle uncaught exceptions - ensure output works anywhere
process.on('uncaughtException', (error) => {
    try {
        process.stderr.write(`Error: ${error.message}\n`);
        process.stderr.write('Use convertHTML2PDF.exe /? for help\n');
    } catch (e) {
        console.error('Error occurred. Use convertHTML2PDF.exe /? for help');
    }
    process.exit(1);
});

// Run the converter
main();