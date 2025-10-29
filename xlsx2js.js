const _=global
//ignoreAllByLibal
//libalCodingHelper
//Sheba
//labDepartment

// xlsx2js.js - Extract JavaScript files from XLSX format (companion to js2xlsx.js)
// Usage: node runCodeV3.js -f xlsx2js.js --inputFile script-data.xlsx --outputFile script.js

async function main() {
    // Modules are automatically injected by runCodeV3
    
    try {
        ColorLog.BW('📊 XLSX to JS Extractor - Corporate Filter Bypass Decoder');
        ColorLog.BW('=========================================================');
        
        // Get input parameters
        const inputFile = argv.inputFile || argv.input || argv.xlsxFile;
        const outputFile = argv.outputFile || argv.output || argv.jsFile;
        
        if (!inputFile) {
            throw new Error('Input XLSX file not specified. Use --inputFile parameter');
        }
        
        // Generate output filename if not provided
        const finalOutputFile = outputFile || generateOutputFilename(inputFile);
        
        // Read and parse the XLSX file
        const workbook = await readXLSXFile(inputFile, XLSX, fsExtra, ColorLog);
        
        // Extract Base64 content from ProcessingData sheet
        const base64Content = extractBase64Content(workbook, XLSX, ColorLog);
        
        // Decode Base64 back to JavaScript
        const jsContent = decodeBase64ToJS(base64Content, ColorLog);
        
        // Write the reconstructed JavaScript file
        await writeJavaScriptFile(jsContent, finalOutputFile, fsExtra, ColorLog);
        
        // Validate the reconstructed file
        await validateReconstructedFile(finalOutputFile, fsExtra, ColorLog);
        
        ColorLog.GW('🎉 Extraction completed successfully!');
        
        return {
            status: 'success',
            inputFile: inputFile,
            outputFile: finalOutputFile,
            originalBase64Size: base64Content.length,
            decodedJSSize: jsContent.length,
            extractedFromCells: Math.ceil(base64Content.length / 1000),
            timestamp: moment ? moment().toISOString() : new Date().toISOString()
        };

    } catch (error) {
        ColorLog.RW('❌ Error in XLSX to JS extraction:', error.message);
        throw error;
    }
}

function generateOutputFilename(inputFile) {
    const path = require('path');
    const baseName = path.basename(inputFile, '.xlsx');
    // Remove -data suffix if present
    const cleanName = baseName.replace(/-data$/, '');
    return `${cleanName}.js`;
}

async function readXLSXFile(inputFile, XLSX, fsExtra, ColorLog) {
    ColorLog.BW(`📖 Reading XLSX file: ${inputFile}`);
    
    if (!fsExtra.existsSync(inputFile)) {
        throw new Error(`Input XLSX file not found: ${inputFile}`);
    }
    
    try {
        const workbook = XLSX.readFile(inputFile);
        ColorLog.GW(`✅ XLSX file loaded successfully`);
        
        // List available sheets
        const sheetNames = workbook.SheetNames;
        ColorLog.BW(`📋 Available sheets: ${sheetNames.join(', ')}`);
        
        return workbook;
    } catch (error) {
        throw new Error(`Failed to read XLSX file: ${error.message}`);
    }
}

function extractBase64Content(workbook, XLSX, ColorLog) {
    ColorLog.BW('🔍 Extracting Base64 content from ProcessingData sheet...');
    
    // Check if ProcessingData sheet exists
    if (!workbook.Sheets['ProcessingData']) {
        throw new Error('ProcessingData sheet not found. This may not be a valid js2xlsx generated file.');
    }
    
    const sheet = workbook.Sheets['ProcessingData'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    ColorLog.BW(`📊 Found ${data.length} rows in ProcessingData sheet`);
    
    let base64Chunks = [];
    let encodingFound = false;
    
    // Extract Base64 chunks from DataContent column (column index 2)
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        // Check for encoding indicator
        if (row[1] === 'Encoding' && row[2] === 'BASE64') {
            encodingFound = true;
            ColorLog.GW('✅ Base64 encoding confirmed');
            continue;
        }
        
        // Extract data processing rows (skip headers, meta, and footer)
        if (row[1] === 'DataProcessing' && row[2]) {
            base64Chunks.push(row[2]);
        }
    }
    
    if (!encodingFound) {
        ColorLog.YW('⚠️  Base64 encoding not explicitly marked. Attempting extraction anyway...');
    }
    
    if (base64Chunks.length === 0) {
        throw new Error('No Base64 content found in ProcessingData sheet');
    }
    
    // Join all chunks into single Base64 string
    const fullBase64 = base64Chunks.join('');
    
    ColorLog.GW(`✅ Extracted ${base64Chunks.length} Base64 chunks (${fullBase64.length} characters total)`);
    
    return fullBase64;
}

function decodeBase64ToJS(base64Content, ColorLog) {
    ColorLog.BW('🔓 Decoding Base64 content back to JavaScript...');
    
    try {
        // Validate Base64 format
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Content)) {
            throw new Error('Invalid Base64 format detected');
        }
        
        // Decode Base64 to JavaScript
        const jsContent = Buffer.from(base64Content, 'base64').toString('utf8');
        
        if (!jsContent || jsContent.trim().length === 0) {
            throw new Error('Decoded content is empty');
        }
        
        ColorLog.GW(`✅ Base64 decoded successfully (${jsContent.length} characters)`);
        
        // Basic validation - check if it looks like JavaScript
        const hasJSKeywords = /\b(function|const|let|var|if|for|while|class|module|require|async)\b/.test(jsContent);
        if (hasJSKeywords) {
            ColorLog.GW('✅ Content appears to be valid JavaScript');
        } else {
            ColorLog.YW('⚠️  Content may not be JavaScript (no common keywords found)');
        }
        
        return jsContent;
        
    } catch (error) {
        throw new Error(`Base64 decoding failed: ${error.message}`);
    }
}

async function writeJavaScriptFile(jsContent, outputFile, fsExtra, ColorLog) {
    ColorLog.BW(`💾 Writing JavaScript file: ${outputFile}`);
    
    try {
        fsExtra.writeFileSync(outputFile, jsContent, 'utf8');
        ColorLog.GW(`✅ JavaScript file written successfully: ${outputFile}`);
    } catch (error) {
        throw new Error(`Failed to write JavaScript file: ${error.message}`);
    }
}

async function validateReconstructedFile(outputFile, fsExtra, ColorLog) {
    ColorLog.BW('🔍 Validating reconstructed JavaScript file...');
    
    try {
        // Check file exists and has content
        const stats = fsExtra.statSync(outputFile);
        ColorLog.BW(`📊 File size: ${Math.round(stats.size / 1024)}KB`);
        
        // Read back and verify content
        const content = fsExtra.readFileSync(outputFile, 'utf8');
        
        // Basic syntax checks
        const checks = {
            hasContent: content.length > 0,
            hasValidChars: !/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(content), // No control chars
            looksLikeJS: /\b(function|const|let|var|if|async|require)\b/.test(content)
        };
        
        const passed = Object.values(checks).every(check => check === true);
        
        if (passed) {
            ColorLog.GW('✅ File validation passed - appears to be valid JavaScript');
        } else {
            ColorLog.YW('⚠️  File validation warnings detected');
            Object.entries(checks).forEach(([check, result]) => {
                if (!result) {
                    ColorLog.YW(`   - ${check}: Failed`);
                }
            });
        }
        
    } catch (error) {
        ColorLog.YW(`⚠️  Validation error: ${error.message}`);
    }
}

// Export for potential use as module
module.exports = { main };