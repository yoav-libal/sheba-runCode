// runCodeV3-lite.js - Lightweight version without Puppeteer
// This version excludes Puppeteer to reduce EXE size significantly

const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const moment = require('moment');

// Import only essential modules (no Puppeteer)
const modules = {
    sql: null,
    moment: require('moment'),
    yargs: require('yargs'),
    fsExtra: require('fs-extra'),
    XLSX: require('xlsx'),
    XLSX_CALC: require('xlsx-calc'),
    pdfParse: require('pdf-parse'),
    PDFKit: require('pdfkit'),
    nodemailer: require('nodemailer'),
    childProcess: require('child_process')
};

// Lightweight PDF generator using only PDFKit
async function generateLightweightPDF(outputFile = 'lightweight-output.pdf') {
    const PDFDocument = modules.PDFKit;
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputFile);
    doc.pipe(stream);
    
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    
    // English content only (to avoid Hebrew font issues)
    doc.fontSize(20)
       .text('RunCodeV3 Lightweight PDF Generator', 100, 100);
    
    doc.fontSize(14)
       .text(`Generated on: ${timestamp}`, 100, 150);
    
    doc.text('This PDF was generated using the lightweight version.', 100, 200);
    doc.text('Features:', 100, 250);
    doc.text('• Smaller EXE size (no Chromium browser)', 120, 280);
    doc.text('• Fast startup and execution', 120, 300);
    doc.text('• All core modules included', 120, 320);
    doc.text('• English PDF generation only', 120, 340);
    
    doc.rect(100, 380, 400, 60).stroke();
    doc.text('Lightweight RunCodeV3 - Optimized for Size', 120, 405);
    
    doc.end();
    
    await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
    });
    
    console.log(`✅ Lightweight PDF generated: ${outputFile}`);
    return outputFile;
}

// Copy most of the original runCodeV3.js logic but exclude Puppeteer
// ... (copying essential functions from runCodeV3.js)

// Main execution
async function main() {
    console.log('🚀 RunCodeV3 Lightweight - Optimized for Size');
    console.log('=============================================');
    
    try {
        await generateLightweightPDF();
        console.log('✅ Lightweight execution completed successfully');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main, generateLightweightPDF };