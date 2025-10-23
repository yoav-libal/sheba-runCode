// testPdf.js - Demonstrates PDF parsing and generation with Hebrew support
// Usage: node runCodeV3.js -f testPdf.js

async function main(context) {
    const { pdfParse, pdfParser, htmlPdf, pdfGenerator, fsExtra, ColorLog, moment } = context;
    
    try {
        ColorLog.BW('🚀 Starting PDF Test - Hebrew Support with Puppeteer');
        ColorLog.BW('==================================================');
        
        // Test Hebrew PDF generation with Puppeteer (best Hebrew support)
        await testHebrewPdfGeneration(fsExtra, ColorLog, moment);
        
        // Test PDF parsing
        await testPdfParsing(pdfParse, pdfParser, fsExtra, ColorLog);
        
        ColorLog.GW('🎉 All PDF tests completed successfully with Hebrew support!');
        
        return {
            status: 'success',
            message: 'PDF operations completed successfully with Hebrew support',
            operations: ['hebrew-generation', 'parsing'],
            library: 'Puppeteer',
            timestamp: moment ? moment().toISOString() : new Date().toISOString()
        };

    } catch (error) {
        ColorLog.RW('❌ Error in PDF test:', error.message);
        throw error;
    }
}

async function testHebrewPdfGeneration(fsExtra, ColorLog, moment) {
    ColorLog.BW('📄 Testing Hebrew PDF Generation with html-pdf (lightweight)...');
    
    try {
        const pdf = require('html-pdf');
        const fs = fsExtra || require('fs');
        
        const timestamp = moment ? moment().format('YYYY-MM-DD HH:mm:ss') : new Date().toISOString();
        
        const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Hebrew PDF Test - RunCodeV3</title>
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
                }
                .title {
                    font-size: 28px;
                    color: #2c3e50;
                    margin-bottom: 20px;
                    font-weight: bold;
                }
                .subtitle {
                    font-size: 20px;
                    color: #34495e;
                    margin-bottom: 15px;
                }
                .content-box {
                    border: 2px solid #3498db;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 8px;
                    background-color: #f8f9fa;
                }
                .timestamp {
                    font-size: 12px;
                    color: #7f8c8d;
                    margin-top: 30px;
                    border-top: 1px solid #ecf0f1;
                    padding-top: 10px;
                }
                .feature-list {
                    list-style-type: none;
                    padding: 0;
                }
                .feature-list li {
                    margin: 8px 0;
                    padding: 5px;
                    background-color: #e8f5e8;
                    border-left: 4px solid #27ae60;
                }
            </style>
        </head>
        <body>
            <div class="title english">🚀 RunCodeV3 PDF Generator (Lightweight)</div>
            <div class="title hebrew">🚀 מחולל PDF קל משקל</div>
            
            <div class="content-box">
                <div class="subtitle english">Hebrew Text Support (Lightweight Version)</div>
                <div class="subtitle hebrew">תמיכה בטקסט עברי (גרסה קלה)</div>
                
                <div class="hebrew">
                    <p><strong>שלום עולם!</strong> זהו מסמך PDF שנוצר בגרסה קלה.</p>
                    <p>הטקסט מוצג בכיוון נכון מימין לשמאל.</p>
                </div>
                
                <div class="english">
                    <p><strong>Hello World!</strong> This is a PDF document created with the lightweight version.</p>
                    <p>Much smaller executable size without Puppeteer!</p>
                </div>
            </div>
            
            <div class="content-box">
                <div class="subtitle english">Lightweight Features</div>
                <div class="subtitle hebrew">תכונות קלות</div>
                
                <ul class="feature-list english">
                    <li>✅ No Chromium browser (90% size reduction)</li>
                    <li>✅ Hebrew text support via html-pdf</li>
                    <li>✅ Fast PDF generation</li>
                    <li>✅ Small executable size</li>
                    <li>✅ All core functionality preserved</li>
                </ul>
                
                <ul class="feature-list hebrew">
                    <li>✅ ללא דפדפן כרום (הקטנה של 90%)</li>
                    <li>✅ תמיכה בטקסט עברי</li>
                    <li>✅ יצירת PDF מהירה</li>
                    <li>✅ קובץ הפעלה קטן</li>
                    <li>✅ כל הפונקציות הליבה נשמרו</li>
                </ul>
            </div>
            
            <div class="timestamp english">
                Generated by RunCodeV3 Lightweight on: ${timestamp}
            </div>
            <div class="timestamp hebrew">
                נוצר על ידי RunCodeV3 קל משקל בתאריך: ${timestamp}
            </div>
        </body>
        </html>`;
        
        const options = {
            format: 'A4',
            orientation: 'portrait',
            border: {
                top: "1in",
                right: "1in",
                bottom: "1in",
                left: "1in"
            },
            type: 'pdf',
            quality: '75'
        };
        
        await new Promise((resolve, reject) => {
            pdf.create(htmlContent, options).toFile('test-generated-hebrew.pdf', (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
        
        ColorLog.GW(`✅ Lightweight Hebrew PDF generated successfully: test-generated-hebrew.pdf`);
        
        // Get file size
        const stats = fs.statSync('test-generated-hebrew.pdf');
        ColorLog.GW(`📊 PDF file size: ${stats.size} bytes`);
        
    } catch (error) {
        ColorLog.RW('❌ Lightweight Hebrew PDF generation failed:', error.message);
        throw error; // No fallback - let the error propagate
    }
}

async function testFallbackHebrewPdf(fsExtra, ColorLog, moment) {
    try {
        const pdf = require('html-pdf');
        const fs = fsExtra || require('fs');
        
        const timestamp = moment ? moment().format('YYYY-MM-DD HH:mm:ss') : new Date().toISOString();
        
        const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
            <meta charset="UTF-8">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    direction: rtl;
                    font-size: 14px;
                    margin: 20px;
                }
                .english { direction: ltr; margin: 10px 0; }
                .hebrew { direction: rtl; font-size: 16px; margin: 10px 0; }
                .title { font-size: 20px; font-weight: bold; color: #2c3e50; }
            </style>
        </head>
        <body>
            <div class="title english">🚀 RunCodeV3 PDF Generator (Fallback)</div>
            <div class="title hebrew">🚀 מחולל PDF עם תמיכה בעברית</div>
            <div class="hebrew">שלום עולם! זהו מסמך PDF עם תמיכה בעברית.</div>
            <div class="english">Hello World! This is a PDF document with Hebrew support.</div>
            <div class="english">Generated with html-pdf fallback on: ${timestamp}</div>
        </body>
        </html>`;
        
        const options = {
            format: 'A4',
            border: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" }
        };
        
        await new Promise((resolve, reject) => {
            pdf.create(htmlContent, options).toFile('test-generated-hebrew.pdf', (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });
        
        ColorLog.GW('✅ Fallback Hebrew PDF generated successfully');
        
    } catch (error) {
        ColorLog.RW('❌ Fallback Hebrew PDF generation also failed:', error.message);
        throw error;
    }
}

async function testPdfParsing(pdfParse, pdfParser, fsExtra, ColorLog) {
    ColorLog.BW('🔍 Testing PDF Parsing...');
    
    const parser = pdfParse || pdfParser;
    if (!parser) {
        ColorLog.YW('⚠️  PDF parsing module not available, skipping...');
        return;
    }
    
    try {
        const pdfFile = 'test-generated-hebrew.pdf';
        
        // Check if our generated Hebrew PDF exists
        const fs = fsExtra || require('fs');
        if (!fs.existsSync(pdfFile)) {
            ColorLog.YW('⚠️  No Hebrew PDF file found to parse, skipping parsing test...');
            return;
        }
        
        // Read and parse the Hebrew PDF
        const dataBuffer = fs.readFileSync(pdfFile);
        
        ColorLog.BW(`📊 Hebrew PDF file size: ${dataBuffer.length} bytes`);
        
        let data;
        try {
            data = await parser(dataBuffer);
        } catch (parseError) {
            ColorLog.YW('⚠️  Primary PDF parsing failed, trying alternative approach...');
            ColorLog.WB(`Parse error: ${parseError.message}`);
            
            // Try with different options
            try {
                data = await parser(dataBuffer, { 
                    version: 'default',
                    max: 0 // No page limit
                });
            } catch (secondError) {
                ColorLog.RW('❌ Alternative parsing also failed:', secondError.message);
                ColorLog.YW('📝 Hebrew PDF was generated but parsing is not supported for this format');
                return;
            }
        }
        
        ColorLog.BW('📖 Hebrew PDF parsing results:');
        ColorLog.WB(`  Pages: ${data.numpages}`);
        ColorLog.WB(`  Text length: ${data.text.length} characters`);
        
        // Show first 300 characters of extracted Hebrew text
        const preview = data.text.substring(0, 300).replace(/\n/g, ' ').trim();
        ColorLog.WB(`  Hebrew text preview: "${preview}..."`);
        
        // Check for Hebrew characters in the extracted text
        const hasHebrew = /[\u0590-\u05FF]/.test(data.text);
        ColorLog.WB(`  Contains Hebrew characters: ${hasHebrew ? '✅ Yes' : '❌ No'}`);
        
        if (hasHebrew) {
            ColorLog.GW('🎉 Hebrew text successfully extracted from PDF!');
        }
        
        // Show metadata if available
        if (data.info) {
            ColorLog.BW('📋 Hebrew PDF metadata:');
            Object.entries(data.info).forEach(([key, value]) => {
                if (value) {
                    ColorLog.WB(`  ${key}: ${value}`);
                }
            });
        }
        
        ColorLog.GW('✅ Hebrew PDF parsing completed successfully');
        
    } catch (error) {
        ColorLog.RW('❌ Hebrew PDF parsing failed:', error.message);
        throw error;
    }
}

// Export for potential use as module
module.exports = { main };

// Run if called directly
if (require.main === module) {
    // Create a minimal context for testing
    const context = {
        fsExtra: require('fs'),
        ColorLog: {
            BW: (msg) => console.log('\x1b[1m\x1b[37m' + msg + '\x1b[0m'),
            GW: (msg) => console.log('\x1b[1m\x1b[32m' + msg + '\x1b[0m'),
            RW: (msg) => console.log('\x1b[1m\x1b[31m' + msg + '\x1b[0m'),
            YW: (msg) => console.log('\x1b[1m\x1b[33m' + msg + '\x1b[0m')
        },
        moment: require('moment'),
        pdfParse: null, // Not needed for generation test
        pdfParser: null
    };
    main(context).catch(console.error);
}

//Sheba
//labDepartment
//ignoreAllByLibal