# HTML to PDF Converter - Hebrew & RTL Support

## Overview
The `convertHtmlToPdf.js` script converts HTML files containing Hebrew and RTL (Right-to-Left) text to PDF format using server-side conversion (no browser required).

## Features
- ✅ **Hebrew text support** - Detects and preserves Hebrew characters
- ✅ **RTL (Right-to-Left) support** - Maintains proper text direction
- ✅ **Multiple conversion methods** - Tries different approaches automatically
- ✅ **Server-side conversion** - No browser automation required
- ✅ **UTF-8 encoding** - Preserves all Unicode characters

## Usage

### Method 1: Command Line Parameters
```bash
node runCodeV3.js -f convertHtmlToPdf.js --inputHtml input.html --outputPdf output.pdf
```

### Method 2: Configuration File
Create a JSON configuration file:
```json
{
  "inputHtml": "hebrew_report.html",
  "outputPdf": "my_document.pdf",
  "options": {
    "format": "A4",
    "orientation": "portrait",
    "border": "20mm"
  }
}
```

Then run:
```bash
node runCodeV3.js -f convertHtmlToPdf.js --extraParam config.json
```

## Example Usage

### Convert existing Hebrew HTML file:
```bash
node runCodeV3.js -f convertHtmlToPdf.js --inputHtml hebrew_report_20251023_121630.html --outputPdf my_output.pdf
```

### Generate HTML first, then convert:
```bash
# Step 1: Generate Hebrew HTML
node runCodeV3.js -f testHebrewHtml.js

# Step 2: Convert to PDF
node runCodeV3.js -f convertHtmlToPdf.js --inputHtml hebrew_report_YYYYMMDD_HHMMSS.html --outputPdf final_document.pdf
```

## Conversion Methods

The script tries multiple conversion methods in order:

1. **wkhtmltopdf** (Best quality) - System tool with excellent HTML/CSS support
2. **html-pdf** (Good quality) - Node.js package using PhantomJS
3. **jsPDF** (Basic) - Fallback with text extraction

## Installation Requirements

### For html-pdf method (Recommended):
```bash
npm install html-pdf
```

### For wkhtmltopdf method (Best quality):
1. Download wkhtmltopdf from: https://wkhtmltopdf.org/downloads.html
2. Install and add to system PATH
3. Restart terminal/command prompt

## Output Information

The script provides detailed information about:
- Input file analysis (Hebrew detection, RTL detection)
- Conversion method used
- Output file size
- Processing time
- Success/failure status

## File Structure

```
convertHtmlToPdf.js     # Main converter script
pdf-config.json         # Example configuration file
hebrew_report_*.html    # Generated Hebrew HTML files
hebrew_converted.pdf    # Output PDF files
```

## Supported HTML Features

- ✅ Hebrew text (Unicode)
- ✅ RTL direction (`dir="rtl"`)
- ✅ CSS styling
- ✅ Mixed content (Hebrew + English)
- ✅ UTF-8 encoding
- ✅ Print-ready CSS (@media print)

## Limitations

- **html-pdf**: Uses PhantomJS (deprecated but functional)
- **jsPDF fallback**: Basic text extraction only
- Complex CSS animations may not render properly
- External resources require internet connection

## Troubleshooting

### "No PDF conversion method available"
Install html-pdf: `npm install html-pdf`

### "Input HTML file not found"
Check file path and ensure the HTML file exists

### Poor Hebrew rendering
- Ensure HTML has `dir="rtl"` attribute
- Use proper Hebrew fonts (Arial, Tahoma)
- Include UTF-8 meta tag: `<meta charset="UTF-8">`

## Complete Workflow Example

```bash
# 1. Generate Hebrew HTML report
node runCodeV3.js -f testHebrewHtml.js

# 2. Convert HTML to PDF
node runCodeV3.js -f convertHtmlToPdf.js --inputHtml hebrew_report_20251023_121630.html --outputPdf final_report.pdf

# Result: final_report.pdf with perfect Hebrew and RTL support
```

## Success Indicators

When conversion is successful, you'll see:
- ✅ Hebrew detected: YES
- ✅ RTL detected: YES  
- ✅ PDF conversion successful
- 📁 Output file created with size information

The generated PDF will maintain Hebrew text direction and formatting from the original HTML.