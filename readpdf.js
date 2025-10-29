const _=global
//ignoreAllByLibal
//libalCodingHelper
//Sheba
//labDepartment

/**
 * PDF Reader Script - Extract and print text content from PDF files
 * Usage: node runCodeV3.js -f readpdf.js --input mypdf.pdf
 * Usage: runcodev3.exe -f readpdf.js --input mypdf.pdf
 */

async function main() {
    // Modules are automatically injected by runCodeV3 - no manual destructuring needed
    // This script will only work with runCodeV3, not with regular node.exe
    
    try {
        ColorLog.BW('📄 PDF Reader - Text Extraction Tool');
        ColorLog.BW('====================================');
        
        // Get the input PDF filename from command line arguments
        const inputFile = argv.input;
        
        if (!inputFile) {
            ColorLog.RW('❌ Error: No input PDF file specified');
            ColorLog.YW('Usage: node runCodeV3.js -f readpdf.js --input mypdf.pdf');
            ColorLog.YW('   or: runcodev3.exe -f readpdf.js --input mypdf.pdf');
            return { success: false, error: 'No input file specified' };
        }
        
        // Check if file exists
        if (!fsExtra.existsSync(inputFile)) {
            ColorLog.RW(`❌ Error: PDF file not found: ${inputFile}`);
            return { success: false, error: 'File not found' };
        }
        
        ColorLog.BW(`📂 Reading PDF file: ${inputFile}`);
        
        const fileStats = fsExtra.statSync(inputFile);
        ColorLog.GW(`✅ File found successfully (${Math.round(fileStats.size / 1024)} KB)`);
        
        // Parse the PDF content using pdf2json
        ColorLog.BW('🔍 Extracting text content...');
        
        const PDFParser = pdf2json.default || pdf2json;
        const pdfParser = new PDFParser();
        
        // Create a promise to handle the async parsing
        const data = await new Promise((resolve, reject) => {
            pdfParser.on("pdfParser_dataReady", (pdfData) => {
                resolve(pdfData);
            });
            
            pdfParser.on("pdfParser_dataError", (err) => {
                reject(err);
            });
            
            pdfParser.loadPDF(inputFile);
        });
        
        // Extract text from pdf2json data structure
        let extractedText = '';
        let pageCount = 0;
        
        if (data && data.Pages && Array.isArray(data.Pages)) {
            pageCount = data.Pages.length;
            
            data.Pages.forEach((page, pageIndex) => {
                if (page.Texts && Array.isArray(page.Texts)) {
                    page.Texts.forEach(text => {
                        if (text.R && Array.isArray(text.R)) {
                            text.R.forEach(run => {
                                if (run.T) {
                                    // Decode URI component and add space
                                    extractedText += decodeURIComponent(run.T) + ' ';
                                }
                            });
                        }
                    });
                    extractedText += '\n'; // New line after each page
                }
            });
        }
        
        // Clean up the text
        extractedText = extractedText.replace(/\s+/g, ' ').trim();
        
        // Display PDF information
        ColorLog.BW('');
        ColorLog.GW('📊 PDF Information:');
        ColorLog.BW(`   📑 Pages: ${pageCount}`);
        ColorLog.BW(`   📝 Text length: ${extractedText.length} characters`);
        
        if (data.Meta) {
            ColorLog.BW('   📋 Metadata:');
            if (data.Meta.Title) ColorLog.BW(`      Title: ${data.Meta.Title}`);
            if (data.Meta.Author) ColorLog.BW(`      Author: ${data.Meta.Author}`);
            if (data.Meta.Subject) ColorLog.BW(`      Subject: ${data.Meta.Subject}`);
            if (data.Meta.Creator) ColorLog.BW(`      Creator: ${data.Meta.Creator}`);
            if (data.Meta.Producer) ColorLog.BW(`      Producer: ${data.Meta.Producer}`);
            if (data.Meta.CreationDate) ColorLog.BW(`      Created: ${data.Meta.CreationDate}`);
            if (data.Meta.ModDate) ColorLog.BW(`      Modified: ${data.Meta.ModDate}`);
        }
        
        ColorLog.BW('');
        ColorLog.GW('📄 PDF TEXT CONTENT:');
        ColorLog.BW('=====================');
        
        if (extractedText && extractedText.trim().length > 0) {
            // Print the extracted text content to console
            console.log(extractedText);
            
            ColorLog.BW('');
            ColorLog.BW('=====================');
            ColorLog.GW(`✅ Successfully extracted ${extractedText.length} characters from ${pageCount} pages`);
        } else {
            ColorLog.YW('⚠️  No text content found in the PDF file');
            ColorLog.YW('   This might be a scanned PDF or contain only images');
        }
        
        return {
            success: true,
            filename: inputFile,
            pages: pageCount,
            textLength: extractedText.length,
            hasText: extractedText.trim().length > 0,
            metadata: data.Meta || {}
        };
        
    } catch (error) {
        ColorLog.RW('❌ Error processing PDF file:', error.message);
        ColorLog.RW('Stack trace:', error.stack);
        
        // Provide helpful error messages
        if (error.message.includes('Invalid PDF')) {
            ColorLog.YW('💡 Tip: Make sure the file is a valid PDF document');
        } else if (error.message.includes('ENOENT')) {
            ColorLog.YW('💡 Tip: Check the file path and make sure the file exists');
        } else if (error.message.includes('permission')) {
            ColorLog.YW('💡 Tip: Check file permissions or close the PDF if it\'s open in another application');
        }
        
        return {
            success: false,
            error: error.message,
            filename: argv.input || 'unknown'
        };
    }
}

module.exports = { main };