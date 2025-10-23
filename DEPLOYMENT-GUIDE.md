# Sheba RunCode - Independent Executable

## 📦 Distribution Package

**File**: `dist/sheba-runcode.exe`  
**Size**: ~102 MB  
**Dependencies**: None (fully standalone)

## ✅ Features Included

- ✅ **JavaScript Sandbox Executor** - Secure script execution
- ✅ **Hebrew HTML Generation** - Perfect RTL and Unicode support  
- ✅ **Database Connectivity** - MSSQL integration
- ✅ **Excel Processing** - XLSX read/write capabilities
- ✅ **Email Sending** - SMTP with attachments
- ✅ **File System Operations** - Enhanced fs-extra functionality
- ✅ **Date/Time Utilities** - Moment.js integration
- ✅ **No Browser Dependencies** - Clean server-side only

## 🚀 Usage Examples

### Generate Hebrew HTML Report
```cmd
sheba-runcode.exe -f testHebrewHtml.js
```

### Convert HTML to PDF (Workflow)
```cmd
# Step 1: Generate HTML
sheba-runcode.exe -f testHebrewHtml.js

# Step 2: Analyze for conversion 
sheba-runcode.exe -f convertHtmlToPdf.js --inputHtml hebrew_report_*.html

# Step 3: Manual conversion (recommended)
# Open the HTML file in any browser and print to PDF
```

### Database Operations
```cmd
sheba-runcode.exe -f yourScript.js --user dbUser --password dbPass --server dbServer
```

### Custom Scripts
```cmd
sheba-runcode.exe -f myScript.js --extraParam config.json
```

## 📁 File Structure for Distribution

```
your-app/
├── sheba-runcode.exe          # Main executable (102MB)
├── your-scripts/              # Your JavaScript files
│   ├── script1.js
│   ├── script2.js
│   └── config.json
└── README.md                  # Usage instructions
```

## 🎯 Script Requirements

Your JavaScript files must include these signatures:
```javascript
//ignoreAllByLibal
//Sheba  
//labDepartment

async function main(context) {
    const { ColorLog, fsExtra, moment, sql, argv } = context;
    // Your code here
}
```

## 🌐 Hebrew & RTL Support

The system provides **perfect Hebrew support**:
- ✅ Unicode UTF-8 encoding
- ✅ Right-to-left (RTL) text direction
- ✅ Mixed Hebrew/English content
- ✅ Browser-ready HTML output
- ✅ Print-to-PDF optimized CSS

### Hebrew HTML Features:
- `dir="rtl"` attribute for proper direction
- `lang="he"` for Hebrew language 
- Hebrew fonts (Arial, Tahoma)
- RTL-aware CSS styling
- Print media queries for PDF conversion

## 🔄 HTML to PDF Workflow

Since this is a **browser-free** solution, the recommended workflow is:

1. **Generate HTML** using the executable
2. **Open HTML file** in any modern browser
3. **Print to PDF** (Ctrl+P → Save as PDF)
4. **Result**: Perfect Hebrew PDF with RTL support

This approach ensures:
- ✅ Perfect Hebrew rendering
- ✅ No browser automation complexity  
- ✅ Works on any system with a browser
- ✅ High-quality PDF output
- ✅ No additional dependencies

## 🛠️ Available Modules in Scripts

Your scripts have access to:
- `sql` - MSSQL database operations
- `moment` - Date/time manipulation  
- `fsExtra` - Enhanced file operations
- `XLSX` - Excel file processing
- `nodemailer` - Email sending
- `execSync` - System command execution
- `ColorLog` - Colored console output
- `argv` - Command line arguments

## 🚨 Important Notes

- **No browser automation** - Clean server-side execution only
- **No PhantomJS dependencies** - Eliminated all browser engines  
- **Standalone deployment** - Single executable, no installation needed
- **Hebrew optimized** - Specifically designed for RTL languages
- **Print-ready output** - HTML designed for browser PDF conversion

## 🎯 Perfect for:

- ✅ Report generation systems
- ✅ Database automation scripts  
- ✅ Hebrew document processing
- ✅ Server-side JavaScript execution
- ✅ Standalone tool deployment
- ✅ No-installation environments

## 📞 Command Line Options

```cmd
Options:
  -f                 JavaScript file to execute [required]
  --extraParam       JSON configuration file
  --inputHtml        HTML input file (for conversion)
  --outputPdf        PDF output file name
  --verbose, -v      Enable verbose logging
  --timeout          Execution timeout in seconds [default: 30]
  --help, -h         Show help
  --version          Show version information
```

The executable is **100% independent** and ready for deployment on any Windows system without requiring Node.js or any other runtime!