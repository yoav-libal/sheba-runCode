const _=global
//ignoreAllByLibal
//libalCodingHelper
//Sheba
//labDepartment

/**
 * HTML to PDF Test - Proper Hebrew Support
 * This approach converts HTML with Hebrew text to PDF using pdfmake
 */

async function main(context) {
    const { ColorLog, pdfMake, htmlToPdf, moment, fsExtra } = context;
    
    ColorLog.BW('🚀 HTML to PDF Hebrew Test');
    ColorLog.BW('===========================');
    
    try {
        if (!pdfMake || !htmlToPdf) {
            ColorLog.RW('❌ HTML to PDF modules not available');
            ColorLog.BW('Available modules:', Object.keys(context).filter(k => k.includes('pdf') || k.includes('Pdf')));
            return { success: false, error: 'PDF modules not available' };
        }
        
        ColorLog.GW('✅ HTML to PDF modules available');
        
        // Create HTML content with proper Hebrew
        const hebrewHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hebrew PDF Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            direction: rtl;
            text-align: right;
            padding: 20px;
        }
        .hebrew {
            font-size: 16px;
            line-height: 1.5;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .mixed {
            font-size: 14px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="title">בדיקת PDF בעברית</div>
    
    <div class="hebrew">
        <p>שלום עולם - זהו מבחן ליצירת PDF בעברית</p>
        <p>תאריך: ${moment().format('DD/MM/YYYY')}</p>
        <p>שעה: ${moment().format('HH:mm:ss')}</p>
    </div>
    
    <div class="mixed">
        <p>English + עברית mixed text</p>
        <p>מספרים: 1234567890</p>
        <p>אותיות: אבגדהוזחטיכלמנסעפצקרשת</p>
    </div>
    
    <div class="hebrew">
        <p>פסקה נוספת בעברית עם טקסט ארוך יותר כדי לבדוק איך מתנהג הטקסט בעברית</p>
        <p>זה צריך להיות מיושר לימין ולקרוא בצורה נכונה</p>
    </div>
</body>
</html>
        `;
        
        ColorLog.BW('📄 Converting HTML to PDF...');
        
        // Convert HTML to pdfmake format
        const pdfDocDef = htmlToPdf(hebrewHtml);
        
        // Add some metadata
        pdfDocDef.info = {
            title: 'Hebrew PDF Test',
            author: 'RunCodeV3',
            subject: 'Hebrew Text Rendering Test',
            creator: 'html-to-pdfmake'
        };
        
        // Generate PDF
        const filename = `hebrew_html_pdf_${moment().format('YYYYMMDD_HHmmss')}.pdf`;
        
        // Create PDF using pdfmake
        const pdfDoc = pdfMake.createPdf(pdfDocDef);
        
        // Get buffer and save
        pdfDoc.getBuffer((buffer) => {
            return new Promise(async (resolve, reject) => {
                try {
                    await fsExtra.writeFile(filename, buffer);
                    const stats = await fsExtra.stat(filename);
                    
                    ColorLog.GW(`✅ Hebrew HTML PDF generated: ${filename}`);
                    ColorLog.GW(`📊 Size: ${stats.size} bytes`);
                    ColorLog.YB('📋 Please check the PDF - Hebrew should be properly right-to-left');
                    
                    resolve({
                        success: true,
                        filename: filename,
                        size: stats.size,
                        method: 'HTML-to-PDF via pdfmake'
                    });
                } catch (error) {
                    reject(error);
                }
            });
        });
        
    } catch (error) {
        ColorLog.RW('❌ HTML to PDF test failed:', error.message);
        return { success: false, error: error.message };
    }
}