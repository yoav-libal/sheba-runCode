// readJson.js - Demonstrates reading JSON configuration and processing data
// Usage: node runCodeV3.js -f readJson.js --extraParam demo.json

async function main(context) {
    const { sql, moment, argv, fsExtra, ColorLog, excel, XLSX, XLSX_CALC, execSync } = context;
    
    try {
        ColorLog.BW('🚀 Starting readJson.js - JSON Processing Demo');
        ColorLog.BW('================================================');
        
        // Show all received arguments
        ColorLog.BW('📋 Received arguments:', argv);
        
        // Read JSON file if provided
        const jsonData = await readJsonFile(argv, fsExtra, ColorLog);
        
        // Process the JSON data
        await processJsonData(jsonData, ColorLog, moment);
        
        // Demonstrate calculations
        const calculations = performCalculations(jsonData, ColorLog);
        
        // Create output report
        const report = await createReport(jsonData, calculations, fsExtra, ColorLog, moment);
        
        ColorLog.GW('🎉 JSON processing completed successfully!');
        
        return {
            status: 'success',
            message: 'JSON file processed successfully',
            inputFile: argv.extraParam || argv.file || 'none',
            dataProcessed: jsonData ? Object.keys(jsonData).length : 0,
            calculations: calculations,
            report: report,
            timestamp: moment ? moment().toISOString() : new Date().toISOString()
        };

    } catch (error) {
        ColorLog.RW('❌ Error in readJson.js:', error.message);
        throw error;
    }
}

async function readJsonFile(argv, fsExtra, ColorLog) {
    // Check for JSON file in different argument formats
    const jsonFile = argv.extraParam || argv.file || argv.json || argv.config;
    
    if (!jsonFile) {
        ColorLog.YW('⚠️  No JSON file specified. Using default demo data.');
        return createDefaultData();
    }
    
    try {
        ColorLog.BW(`📖 Reading JSON file: ${jsonFile}`);
        
        if (fsExtra && fsExtra.readJsonSync) {
            const data = fsExtra.readJsonSync(jsonFile);
            ColorLog.GW(`✅ Successfully read JSON file with ${Object.keys(data).length} top-level properties`);
            return data;
        } else {
            // Fallback to native fs
            const fs = require('fs');
            const rawData = fs.readFileSync(jsonFile, 'utf8');
            const data = JSON.parse(rawData);
            ColorLog.GW(`✅ Successfully read JSON file (fallback method)`);
            return data;
        }
        
    } catch (error) {
        ColorLog.RW(`❌ Failed to read JSON file: ${error.message}`);
        ColorLog.YW('⚠️  Using default demo data instead.');
        return createDefaultData();
    }
}

function createDefaultData() {
    return {
        projectName: "Default Demo",
        settings: { maxRetries: 1, timeout: 1000 },
        calculations: { baseValue: 50, multiplier: 2, discount: 0.05 }
    };
}

async function processJsonData(data, ColorLog, moment) {
    ColorLog.BW('🔍 Processing JSON data...');
    
    // Display project information
    if (data.projectName) {
        ColorLog.GW(`📊 Project: ${data.projectName}`);
        if (data.version) {
            ColorLog.BW(`📋 Version: ${data.version}`);
        }
    }
    
    // Process settings
    if (data.settings) {
        ColorLog.BW('⚙️  Settings found:');
        for (const [key, value] of Object.entries(data.settings)) {
            ColorLog.WB(`  ${key}: ${value}`);
        }
    }
    
    // Process database config
    if (data.database) {
        ColorLog.BW('💾 Database configuration:');
        ColorLog.WB(`  Host: ${data.database.host || 'not specified'}`);
        ColorLog.WB(`  Port: ${data.database.port || 'not specified'}`);
        ColorLog.WB(`  Database: ${data.database.name || 'not specified'}`);
    }
    
    // Process users
    if (data.users && Array.isArray(data.users)) {
        ColorLog.BW(`👥 Found ${data.users.length} users:`);
        data.users.forEach(user => {
            ColorLog.WB(`  ${user.name} (${user.role}) - Permissions: ${user.permissions?.join(', ') || 'none'}`);
        });
    }
    
    // Process features
    if (data.features) {
        ColorLog.BW('🎛️  Features:');
        for (const [feature, enabled] of Object.entries(data.features)) {
            const status = enabled ? '✅ Enabled' : '❌ Disabled';
            ColorLog.WB(`  ${feature}: ${status}`);
        }
    }
}

function performCalculations(data, ColorLog) {
    ColorLog.BW('🔢 Performing calculations...');
    
    const calc = data.calculations || { baseValue: 0, multiplier: 1, discount: 0 };
    
    const results = {
        baseValue: calc.baseValue || 0,
        beforeDiscount: (calc.baseValue || 0) * (calc.multiplier || 1),
        discountAmount: ((calc.baseValue || 0) * (calc.multiplier || 1)) * (calc.discount || 0),
        finalValue: 0
    };
    
    results.finalValue = results.beforeDiscount - results.discountAmount;
    
    ColorLog.BW(`💰 Base Value: ${results.baseValue}`);
    ColorLog.BW(`📈 After Multiplier (${calc.multiplier}): ${results.beforeDiscount}`);
    ColorLog.BW(`💸 Discount (${(calc.discount * 100).toFixed(1)}%): -${results.discountAmount}`);
    ColorLog.GW(`🎯 Final Value: ${results.finalValue}`);
    
    return results;
}

async function createReport(data, calculations, fsExtra, ColorLog, moment) {
    ColorLog.BW('📝 Creating processing report...');
    
    const timestamp = moment ? moment().format('YYYY-MM-DD HH:mm:ss') : new Date().toISOString();
    
    const report = {
        timestamp: timestamp,
        summary: {
            projectName: data.projectName || 'Unknown',
            version: data.version || 'Unknown',
            totalUsers: data.users ? data.users.length : 0,
            featuresEnabled: data.features ? Object.values(data.features).filter(Boolean).length : 0,
            calculations: calculations
        },
        processingDetails: {
            hasSettings: !!data.settings,
            hasDatabase: !!data.database,
            hasUsers: !!data.users,
            hasFeatures: !!data.features,
            hasCalculations: !!data.calculations
        }
    };
    
    // Try to save report to file
    try {
        const reportFile = 'processing-report.json';
        if (fsExtra && fsExtra.writeJsonSync) {
            fsExtra.writeJsonSync(reportFile, report, { spaces: 2 });
            ColorLog.GW(`📄 Report saved to: ${reportFile}`);
        }
    } catch (error) {
        ColorLog.YW('⚠️  Could not save report file:', error.message);
    }
    
    return report;
}

// Export for potential use as module
module.exports = { main };