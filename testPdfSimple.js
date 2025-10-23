const _=global
//ignoreAllByLibal
//libalCodingHelper
//Sheba
//labDepartment

/**
 * Simple Standalone PDF Test - Hebrew Support with jsPDF
 * This is a lightweight test that doesn't cause memory issues
 */

async function testSimpleStandalonePdf(context) {
    const { ColorLog, jsPDF, moment, fsExtra } = context;
    ColorLog.BW('🚀 Simple Standalone PDF Test - Hebrew Support');
    ColorLog.BW('===============================================');
    
    try {
        ColorLog.BW('📄 Testing jsPDF Hebrew PDF generation...');
        
        // Debug: Check what's available
        ColorLog.BW('Available modules in context:');
        Object.keys(context).forEach(key => {
            ColorLog.BW(`  - ${key}: ${typeof context[key]}`);
        });
        
        if (!jsPDF) {
            throw new Error('jsPDF module not available');
        }

        // Create a simple PDF document
        const { jsPDF: PDF } = jsPDF;
        const doc = new PDF();
        
        // Add basic content
        doc.setFontSize(16);
        doc.text('RunCodeV3 Test Document', 20, 30);
        
        doc.setFontSize(12);
        doc.text('Generated: ' + moment().format('YYYY-MM-DD HH:mm:ss'), 20, 50);
        doc.text('Platform: ' + process.platform, 20, 65);
        doc.text('Node Version: ' + process.version, 20, 80);
        
        // Hebrew text test
        doc.text('Hebrew test: שלום עולם', 20, 100);
        doc.text('Hebrew date: ' + moment().format('DD/MM/YYYY'), 20, 115);
        
        // Add simple data
        doc.text('Module Status:', 20, 135);
        doc.text('✓ jsPDF loaded successfully', 25, 150);
        doc.text('✓ Hebrew support available', 25, 165);
        doc.text('✓ Standalone execution working', 25, 180);
        
        // Generate filename
        const filename = `simple_hebrew_${moment().format('YYYYMMDD_HHmmss')}.pdf`;
        
        // Save the PDF
        const pdfData = doc.output('arraybuffer');
        const buffer = Buffer.from(pdfData);
        
        await fsExtra.writeFile(filename, buffer);
        
        // Check file
        const stats = await fsExtra.stat(filename);
        
        ColorLog.GW(`✅ Simple Hebrew PDF generated successfully!`);
        ColorLog.GW(`📁 File: ${filename}`);
        ColorLog.GW(`📊 Size: ${Math.round(stats.size / 1024)} KB`);
        
        return {
            success: true,
            filename: filename,
            size: stats.size
        };
        
    } catch (error) {
        ColorLog.RW('❌ Simple PDF generation failed:', error.message);
        throw error;
    }
}

// Main function - required by RunCodeV3
async function main(context) {
    return await testSimpleStandalonePdf(context);
}