const _=global
//ignoreAllByLibal
//libalCodingHelper
//Sheba
//labDepartment

/**
 * HTML to PDF Converter
 * Simple converter using Puppeteer-Core + System Chrome
 */

async function main() {
    console.log('🚀 HTML to PDF Converter');
    console.log('========================');
    
    // Parse command line arguments
    const inputFile = argv.inputHtml || 'input.html';
    const outputFile = argv.outputPdf || 'output.pdf';
    
    console.log(`📄 Input HTML: ${inputFile}`);
    console.log(`📊 Output PDF: ${outputFile}`);
    
    try {
        // Read HTML content
        console.log('📖 Reading HTML file...');
        const htmlContent = await fsExtra.readFile(inputFile, 'utf8');
        console.log(`✅ Read ${htmlContent.length} characters from HTML file`);
        
        // Find Chrome installation
        const possibleChromePaths = [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Users\\' + (process.env.USERNAME || 'User') + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
        ];
        
        let chromeExecutablePath = null;
        for (const path of possibleChromePaths) {
            if (await fsExtra.pathExists(path)) {
                chromeExecutablePath = path;
                break;
            }
        }
        
        if (!chromeExecutablePath) {
            throw new Error('Google Chrome not found. Please install Google Chrome.');
        }
        
        console.log('🌐 Launching Chrome browser...');
        
        // Launch Chrome
        const browser = await puppeteerCore.launch({
            headless: true,
            executablePath: chromeExecutablePath,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--disable-gpu'
            ]
        });
        
        // Create new page
        const page = await browser.newPage();
        
        // Set viewport
        await page.setViewport({
            width: 1200,
            height: 1600,
            deviceScaleFactor: 1
        });
        
        // Set content
        console.log('📄 Setting page content...');
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        
        console.log('📄 Generating PDF...');
        
        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            }
        });
        
        // Close browser
        await browser.close();
        
        console.log('💾 Saving PDF file...');
        await fsExtra.writeFile(outputFile, pdfBuffer);
        
        // Get file size
        const stats = await fsExtra.stat(outputFile);
        const sizeKB = Math.round(stats.size / 1024);
        
        console.log(`✅ PDF created successfully!`);
        console.log(`📊 File: ${outputFile}`);
        console.log(`📏 Size: ${sizeKB} KB`);
        
        return {
            success: true,
            outputFile: outputFile,
            sizeKB: sizeKB
        };
        
    } catch (error) {
        console.log(`❌ PDF conversion failed: ${error.message}`);
        return {
            success: false,
            error: error.message,
            inputFile: inputFile,
            outputFile: outputFile
        };
    }
}

// Execute with error handling
main()
    .then(result => {
        console.log('✅ Execution completed');
        console.log('📊 RESULT');
        console.log('=========');
        if (result.success) {
            console.log(`✅ SUCCESS - PDF generated`);
            console.log(`📤 Output: ${result.outputFile} (${result.sizeKB} KB)`);
        } else {
            console.log(`❌ FAILED - ${result.error}`);
        }
        console.log(`📤 Result: ${JSON.stringify(result, null, 2)}`);
    })
    .catch(error => {
        console.log(`💥 Critical error: ${error.message}`);
        console.log(`📤 Result: ${JSON.stringify({
            success: false,
            error: error.message,
            critical: true
        }, null, 2)}`);
    });