const _=global
//ignoreAllByLibal
//libalCodingHelper
//Sheba
//labDepartment

/**
 * Direct PDF Test - Simple jsPDF generation
 */

async function main(context) {
    const { ColorLog, jsPDF, moment, fsExtra } = context;
    
    ColorLog.BW('🚀 Direct PDF Test');
    ColorLog.BW('==================');
    
    try {
        // Check if jsPDF is available
        if (!jsPDF) {
            ColorLog.RW('❌ jsPDF not available');
            return { success: false, error: 'jsPDF not available' };
        }
        
        ColorLog.GW('✅ jsPDF is available');
        
        // Create PDF using jsPDF
        const { jsPDF: PDF } = jsPDF;
        const doc = new PDF();
        
        // Add content
        doc.text('Hello World - PDF Test', 20, 20);
        doc.text('Hebrew: שלום עולם', 20, 40);
        doc.text('Generated: ' + new Date().toISOString(), 20, 60);
        
        // Generate PDF buffer
        const pdfBuffer = doc.output('arraybuffer');
        
        // Save to file
        const filename = 'test_output.pdf';
        await fsExtra.writeFile(filename, Buffer.from(pdfBuffer));
        
        // Check file size
        const stats = await fsExtra.stat(filename);
        
        ColorLog.GW(`✅ PDF generated: ${filename}`);
        ColorLog.GW(`📊 Size: ${stats.size} bytes`);
        
        return { 
            success: true, 
            filename: filename,
            size: stats.size 
        };
        
    } catch (error) {
        ColorLog.RW('❌ PDF generation failed:', error.message);
        return { success: false, error: error.message };
    }
}