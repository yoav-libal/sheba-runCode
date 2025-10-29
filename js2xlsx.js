const _=global
//ignoreAllByLibal
//libalCodingHelper
//Sheba
//labDepartment

// js2xlsx.js - Convert JavaScript files to XLSX format to bypass corporate email filters
// Usage: node runCodeV3.js -f js2xlsx.js --inputFile script.js --outputFile script.xlsx

async function main() {
    // Modules are automatically injected by runCodeV3
    
    try {
        ColorLog.BW('📊 JS to XLSX Converter - Corporate Filter Bypass');
        ColorLog.BW('==================================================');
        
        // Get input parameters
        const inputFile = argv.inputFile || argv.input || argv.jsFile;
        const outputFile = argv.outputFile || argv.output || argv.xlsxFile;
        
        if (!inputFile) {
            throw new Error('Input JS file not specified. Use --inputFile parameter');
        }
        
        // Generate output filename if not provided
        const finalOutputFile = outputFile || generateOutputFilename(inputFile);
        
        // Read the JavaScript file
        const jsContent = await readJavaScriptFile(inputFile, fsExtra, ColorLog);
        
        // Create XLSX workbook with embedded JS content
        const workbook = await createXLSXWithJSContent(jsContent, inputFile, XLSX, ColorLog, moment);
        
        // Write the XLSX file
        await writeXLSXFile(workbook, finalOutputFile, XLSX, ColorLog);
        
        // Generate extraction instructions
        const instructions = generateExtractionInstructions(finalOutputFile, inputFile);
        
        ColorLog.GW('🎉 Conversion completed successfully!');
        ColorLog.BW('📋 Instructions for recipient:');
        ColorLog.WB(instructions);
        
        return {
            status: 'success',
            inputFile: inputFile,
            outputFile: finalOutputFile,
            originalSize: jsContent.length,
            xlsxSize: await getFileSize(finalOutputFile, fsExtra),
            instructions: instructions
        };

    } catch (error) {
        ColorLog.RW('❌ Error in JS to XLSX conversion:', error.message);
        throw error;
    }
}

function generateOutputFilename(inputFile) {
    const path = require('path');
    const baseName = path.basename(inputFile, '.js');
    return `${baseName}-data.xlsx`;
}

async function readJavaScriptFile(inputFile, fsExtra, ColorLog) {
    ColorLog.BW(`📖 Reading JavaScript file: ${inputFile}`);
    
    if (!fsExtra.existsSync(inputFile)) {
        throw new Error(`Input file not found: ${inputFile}`);
    }
    
    const content = fsExtra.readFileSync(inputFile, 'utf8');
    
    if (!content || content.trim().length === 0) {
        throw new Error('Input file is empty or contains no content');
    }
    
    ColorLog.GW(`✅ JavaScript file read successfully (${content.length} characters)`);
    return content;
}

async function createXLSXWithJSContent(jsContent, originalFilename, XLSX, ColorLog, moment) {
    ColorLog.BW('🏗️  Creating XLSX workbook with embedded JS content...');
    
    const workbook = XLSX.utils.book_new();
    
    // Create metadata sheet (looks innocent)
    const metadataSheet = createMetadataSheet(originalFilename, jsContent.length, moment);
    XLSX.utils.book_append_sheet(workbook, metadataSheet, 'FileInfo');
    
    // Create main data sheet with JS content
    const dataSheet = createDataSheetWithJS(jsContent, ColorLog);
    XLSX.utils.book_append_sheet(workbook, dataSheet, 'ProcessingData');
    
    // Create decoy sheets to look more legitimate
    const summarySheet = createDecoySheet('Summary', ColorLog);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    const configSheet = createDecoySheet('Configuration', ColorLog);
    XLSX.utils.book_append_sheet(workbook, configSheet, 'Config');
    
    ColorLog.GW('✅ XLSX workbook created with 4 sheets');
    return workbook;
}

function createMetadataSheet(filename, contentLength, moment) {
    const timestamp = moment ? moment().format('YYYY-MM-DD HH:mm:ss') : new Date().toISOString();
    
    const metadata = [
        ['Property', 'Value'],
        ['Original Filename', filename],
        ['Content Length', contentLength],
        ['Conversion Date', timestamp],
        ['Type', 'Processing Data Export'],
        ['Version', '4.0.0'],
        ['Status', 'Ready for Processing'],
        ['Encoding', 'UTF-8'],
        ['Notes', 'Contains processing instructions and data']
    ];
    
    return XLSX.utils.aoa_to_sheet(metadata);
}

function createDataSheetWithJS(jsContent, ColorLog) {
    ColorLog.BW('🔄 Encoding JS content as Base64 and embedding in data cells...');
    
    // Convert JS content to Base64 to avoid quote/escape issues
    const base64Content = Buffer.from(jsContent, 'utf8').toString('base64');
    
    // Split Base64 content into chunks to distribute across cells
    const chunkSize = 1000; // Characters per cell (Base64 safe)
    const chunks = [];
    
    for (let i = 0; i < base64Content.length; i += chunkSize) {
        chunks.push(base64Content.slice(i, i + chunkSize));
    }
    
    // Create data structure that looks like processing data
    const sheetData = [
        ['Row', 'ProcessingType', 'DataContent', 'Status', 'Timestamp'],
        ['Header', 'Initialization', 'System startup and configuration', 'Complete', new Date().toISOString()],
        ['Meta', 'Encoding', 'BASE64', 'Ready', new Date().toISOString()]
    ];
    
    // Add Base64 content chunks as "processing data"
    chunks.forEach((chunk, index) => {
        sheetData.push([
            index + 1,
            'DataProcessing',
            chunk, // This is our Base64 encoded JS content
            'Pending',
            new Date().toISOString()
        ]);
    });
    
    // Add footer rows
    sheetData.push([
        'Footer',
        'Completion',
        'Processing data ready for decoding',
        'Ready',
        new Date().toISOString()
    ]);
    
    ColorLog.BW(`📊 JS content encoded as Base64 and split into ${chunks.length} data rows`);
    ColorLog.BW(`🔢 Original size: ${jsContent.length} chars, Base64 size: ${base64Content.length} chars`);
    
    return XLSX.utils.aoa_to_sheet(sheetData);
}

function createDecoySheet(sheetType, ColorLog) {
    let data;
    
    if (sheetType === 'Summary') {
        data = [
            ['Metric', 'Value', 'Status'],
            ['Total Records', 1247, 'Complete'],
            ['Processing Time', '2.3 seconds', 'Optimal'],
            ['Memory Usage', '45MB', 'Normal'],
            ['Error Count', 0, 'Success'],
            ['Output Quality', '99.8%', 'Excellent']
        ];
    } else if (sheetType === 'Configuration') {
        data = [
            ['Parameter', 'Value', 'Description'],
            ['MaxBuffer', 8192, 'Maximum buffer size'],
            ['Timeout', 30000, 'Operation timeout in ms'],
            ['Encoding', 'UTF-8', 'Character encoding'],
            ['Compression', true, 'Enable compression'],
            ['LogLevel', 'INFO', 'Logging verbosity']
        ];
    }
    
    return XLSX.utils.aoa_to_sheet(data);
}

async function writeXLSXFile(workbook, outputFile, XLSX, ColorLog) {
    ColorLog.BW(`💾 Writing XLSX file: ${outputFile}`);
    
    try {
        XLSX.writeFile(workbook, outputFile);
        ColorLog.GW(`✅ XLSX file written successfully: ${outputFile}`);
    } catch (error) {
        throw new Error(`Failed to write XLSX file: ${error.message}`);
    }
}

async function getFileSize(filename, fsExtra) {
    try {
        const stats = fsExtra.statSync(filename);
        return `${Math.round(stats.size / 1024)}KB`;
    } catch (error) {
        return 'Unknown';
    }
}

function generateExtractionInstructions(xlsxFile, originalJsFile) {
    return `
📋 EXTRACTION INSTRUCTIONS FOR RECIPIENT:

🤖 AUTOMATED METHOD (Recommended with runCodeV3):
   runcodev3.exe -f xlsx2js.js --inputFile ${xlsxFile} --outputFile ${originalJsFile}

📋 MANUAL METHOD:
1. Open ${xlsxFile} in Excel or any spreadsheet software
2. Go to "ProcessingData" sheet
3. Column C contains Base64 encoded JavaScript content (split across rows)
4. Copy all Base64 content from Column C (excluding headers and meta rows)
5. Join all chunks into one continuous Base64 string
6. Decode Base64 to get original JavaScript:
   
   Method A: Node.js
   const fs = require('fs');
   const base64 = 'YOUR_BASE64_STRING_HERE';
   const jsCode = Buffer.from(base64, 'base64').toString('utf8');
   fs.writeFileSync('${originalJsFile}', jsCode);
   
   Method B: Online Base64 decoder (base64decode.org)

⚠️  SECURITY NOTE:
This file bypasses email filters by disguising code as Base64 data.
Only use for legitimate business purposes and with proper authorization.

🔧 Base64 encoding eliminates quote/newline issues in Excel cells.
    `.trim();
}

// Export for potential use as module
module.exports = { main };