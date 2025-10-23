const _=global
//ignoreAllByLibal
//libalCodingHelper
//Sheba
//labDepartment

/**
 * Hebrew PDF Test - Check if Hebrew renders correctly
 */

async function main(context) {
    const { ColorLog, jsPDF, moment, fsExtra } = context;
    
    ColorLog.BW('🚀 Hebrew PDF Rendering Test');
    ColorLog.BW('============================');
    
    try {
        if (!jsPDF) {
            ColorLog.RW('❌ jsPDF not available');
            return { success: false, error: 'jsPDF not available' };
        }
        
        ColorLog.GW('✅ jsPDF is available');
        
        // Create PDF using jsPDF
        const { jsPDF: PDF } = jsPDF;
        const doc = new PDF();
        
        // Test different Hebrew text scenarios
        const hebrewTexts = [
            'שלום עולם',           // Hello World
            'בדיקת עברית',         // Hebrew Test
            'אבגדהוזחטיכלמנסעפצקרשת', // Hebrew alphabet
            'תאריך: ' + moment().format('DD/MM/YYYY'), // Date in Hebrew
            'מספר: 12345',         // Number with Hebrew
            'English + עברית',     // Mixed text
        ];
        
        // Add title
        doc.setFontSize(16);
        doc.text('Hebrew Rendering Test', 20, 20);
        doc.text('========================', 20, 30);
        
        // Test each Hebrew text
        doc.setFontSize(12);
        let yPos = 50;
        
        hebrewTexts.forEach((text, index) => {
            // Add English description
            doc.text(`Test ${index + 1}: `, 20, yPos);
            
            // Add Hebrew text (this will show if it renders correctly)
            doc.text(text, 80, yPos);
            
            yPos += 15;
        });
        
        // Add metadata
        doc.text('Generated: ' + new Date().toISOString(), 20, yPos + 20);
        doc.text('Platform: ' + process.platform, 20, yPos + 35);
        
        // Note about Hebrew support
        doc.setFontSize(10);
        doc.text('Note: If Hebrew text appears as gibberish or reversed,', 20, yPos + 60);
        doc.text('jsPDF needs additional Hebrew font support.', 20, yPos + 75);
        
        // Generate PDF buffer
        const pdfBuffer = doc.output('arraybuffer');
        
        // Save to file
        const filename = `hebrew_test_${moment().format('YYYYMMDD_HHmmss')}.pdf`;
        await fsExtra.writeFile(filename, Buffer.from(pdfBuffer));
        
        // Check file size
        const stats = await fsExtra.stat(filename);
        
        ColorLog.GW(`✅ Hebrew test PDF generated: ${filename}`);
        ColorLog.GW(`📊 Size: ${stats.size} bytes`);
        ColorLog.YB('📋 Please open the PDF manually to check if Hebrew text renders correctly');
        ColorLog.YB('   Expected Hebrew texts:');
        hebrewTexts.forEach((text, index) => {
            ColorLog.YB(`   ${index + 1}. ${text}`);
        });
        
        return { 
            success: true, 
            filename: filename,
            size: stats.size,
            hebrewTexts: hebrewTexts,
            note: 'Manual verification required - check if Hebrew renders correctly in PDF'
        };
        
    } catch (error) {
        ColorLog.RW('❌ Hebrew PDF test failed:', error.message);
        return { success: false, error: error.message };
    }
}