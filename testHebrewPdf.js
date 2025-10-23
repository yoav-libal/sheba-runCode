// testHebrewPdf.js - Test Hebrew support with different PDF libraries
// Usage: node runCodeV3.js -f testHebrewPdf.js

async function main(context) {
    const { fsExtra, ColorLog, moment } = context;
    
    try {
        ColorLog.BW('🚀 Testing Hebrew PDF Generation with Multiple Libraries');
        ColorLog.BW('====================================================');
        
        const hebrewText = 'שלום עולם - מסמך PDF בעברית';
        const englishText = 'Hello World - Hebrew PDF Document';
        
        // Test 1: jsPDF (client-side library that works in Node)
        await testJsPDF(hebrewText, englishText, ColorLog, moment);
        
        // Test 2: Puppeteer (HTML to PDF with full browser font support)
        await testPuppeteer(hebrewText, englishText, ColorLog, moment);
        
        // Test 3: html-pdf (PhantomJS-based, deprecated but might work)
        await testHtmlPdf(hebrewText, englishText, ColorLog, moment);
        
        ColorLog.GW('🎉 All Hebrew PDF tests completed!');
        
        return {
            status: 'success',
            message: 'Hebrew PDF tests completed',
            libraries: ['jsPDF', 'Puppeteer', 'html-pdf'],
            timestamp: moment ? moment().toISOString() : new Date().toISOString()
        };

    } catch (error) {
        ColorLog.RW('❌ Error in Hebrew PDF test:', error.message);
        throw error;
    }
}

async function testJsPDF(hebrewText, englishText, ColorLog, moment) {
    ColorLog.BW('📄 Testing jsPDF with Hebrew...');
    
    try {
        const { jsPDF } = require('jspdf');
        const fs = require('fs');
        
        const doc = new jsPDF();
        
        // Try to add Hebrew text
        doc.setFontSize(20);
        doc.text(englishText, 20, 30);
        
        doc.setFontSize(16);
        doc.text('Hebrew Text:', 20, 50);
        doc.text(hebrewText, 20, 70);
        
        // Add timestamp
        const timestamp = moment ? moment().format('YYYY-MM-DD HH:mm:ss') : new Date().toISOString();
        doc.setFontSize(10);
        doc.text(`Generated with jsPDF on: ${timestamp}`, 20, 200);
        
        // Save PDF
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        fs.writeFileSync('hebrew-jspdf.pdf', pdfBuffer);
        
        ColorLog.GW('✅ jsPDF test completed: hebrew-jspdf.pdf');
        
    } catch (error) {
        ColorLog.RW('❌ jsPDF test failed:', error.message);
    }
}

async function testPuppeteer(hebrewText, englishText, ColorLog, moment) {
    ColorLog.BW('🌐 Testing Puppeteer with Hebrew...');
    
    try {
        const puppeteer = require('puppeteer');
        
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        const timestamp = moment ? moment().format('YYYY-MM-DD HH:mm:ss') : new Date().toISOString();
        
        const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Hebrew PDF Test</title>
            <style>
                body {
                    font-family: Arial, 'Noto Sans Hebrew', 'David', 'Times New Roman', sans-serif;
                    font-size: 16px;
                    line-height: 1.6;
                    margin: 40px;
                    direction: rtl;
                }
                .english {
                    direction: ltr;
                    text-align: left;
                }
                .hebrew {
                    direction: rtl;
                    text-align: right;
                    font-size: 18px;
                    font-weight: bold;
                }
                .title {
                    font-size: 24px;
                    color: #2c3e50;
                    margin-bottom: 20px;
                }
                .timestamp {
                    font-size: 12px;
                    color: #7f8c8d;
                    margin-top: 30px;
                }
            </style>
        </head>
        <body>
            <div class="title english">${englishText}</div>
            <div class="hebrew">${hebrewText}</div>
            
            <div class="english" style="margin-top: 30px;">
                <h3>Hebrew Text Features:</h3>
                <ul>
                    <li>Right-to-left (RTL) text direction</li>
                    <li>Hebrew Unicode characters</li>
                    <li>Proper font fallback support</li>
                    <li>Mixed Hebrew and English content</li>
                </ul>
            </div>
            
            <div class="hebrew">
                <h3>תכונות הטקסט העברי:</h3>
                <ul>
                    <li>כיוון טקסט מימין לשמאל</li>
                    <li>תווי יוניקוד עבריים</li>
                    <li>תמיכה בגופני גיבוי</li>
                    <li>תוכן מעורב עברי ואנגלי</li>
                </ul>
            </div>
            
            <div class="timestamp english">Generated with Puppeteer on: ${timestamp}</div>
        </body>
        </html>`;
        
        await page.setContent(htmlContent);
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        });
        
        await browser.close();
        
        require('fs').writeFileSync('hebrew-puppeteer.pdf', pdfBuffer);
        
        ColorLog.GW('✅ Puppeteer test completed: hebrew-puppeteer.pdf');
        
    } catch (error) {
        ColorLog.RW('❌ Puppeteer test failed:', error.message);
        ColorLog.YW('Note: Puppeteer may require additional setup in some environments');
    }
}

async function testHtmlPdf(hebrewText, englishText, ColorLog, moment) {
    ColorLog.BW('📋 Testing html-pdf with Hebrew...');
    
    try {
        const pdf = require('html-pdf');
        const fs = require('fs');
        
        const timestamp = moment ? moment().format('YYYY-MM-DD HH:mm:ss') : new Date().toISOString();
        
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    direction: rtl;
                    font-size: 14px;
                }
                .english { direction: ltr; }
                .hebrew { direction: rtl; font-size: 16px; }
            </style>
        </head>
        <body>
            <h1 class="english">${englishText}</h1>
            <h2 class="hebrew">${hebrewText}</h2>
            <p class="english">Generated with html-pdf on: ${timestamp}</p>
        </body>
        </html>`;
        
        const options = {
            format: 'A4',
            border: {
                top: "0.5in",
                right: "0.5in",
                bottom: "0.5in",
                left: "0.5in"
            }
        };
        
        await new Promise((resolve, reject) => {
            pdf.create(htmlContent, options).toFile('hebrew-htmlpdf.pdf', (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });
        
        ColorLog.GW('✅ html-pdf test completed: hebrew-htmlpdf.pdf');
        
    } catch (error) {
        ColorLog.RW('❌ html-pdf test failed:', error.message);
    }
}

// Export for potential use as module
module.exports = { main };
//Sheba
//labDepartment
//ignoreAllByLibal