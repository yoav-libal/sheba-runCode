// testNoDb.js - Simplified test file without database connectivity
// This file tests the RunCodeV3 system without requiring external dependencies

async function main(context) {
    const { sql, moment, argv, fsExtra, ColorLog, excel, XLSX, XLSX_CALC, execSync } = context;
    
    // Set global references for compatibility
    global.ColorLog = ColorLog;
    global.moment = moment;
    global.fsExtra = fsExtra;
    
    try {
        ColorLog.BW('🚀 Starting testNoDb.js execution...');
        
        // Process command line parameters
        const params = processParameters(ColorLog, argv);
        ColorLog.GW('✅ Parameters processed successfully');
        
        // Test various modules and functionality
        await testModules(context, params);
        
        // Test file operations
        await testFileOperations(fsExtra, ColorLog);
        
        // Test date operations
        testDateOperations(moment, ColorLog);
        
        // Test calculations
        const result = testCalculations(params, ColorLog);
        
        ColorLog.GW('🎉 All tests completed successfully!');
        
        return {
            status: 'success',
            message: 'testNoDb.js executed successfully',
            result: result,
            timestamp: new Date().toISOString(),
            params: params
        };

    } catch (error) {
        ColorLog.RW('❌ Error in main function:', error.message);
        throw error;
    } finally {
        ColorLog.BW('🏁 Finally block executed');
    }
}

// Parameter definitions (simplified)
const parameters = {
    myParam: {
        type: 'string',
        description: 'Example parameter',
        default: 'Hello RunCodeV3!'
    },
    num1: {
        type: 'number',
        default: 10,
        description: 'First number for calculations'
    },
    num2: {
        type: 'number',
        default: 5,
        description: 'Second number for calculations'
    },
    testMode: {
        type: 'string',
        default: 'basic',
        description: 'Test mode: basic, advanced, or full'
    }
};

function processParameters(ColorLog, argv) {
    ColorLog.WB('📋 Processing parameters...');
    ColorLog.WB('Received argv:', argv);

    const processed = {};
    for (const [key, config] of Object.entries(parameters)) {
        processed[key] = argv[key] || config.default;

        if (processed[key] === undefined) {
            throw new Error(`Missing required parameter: ${key}`);
        }

        // Convert string numbers to actual numbers
        if (config.type === 'number' && typeof processed[key] === 'string') {
            processed[key] = Number(processed[key]);
        }
    }
    
    ColorLog.GW('✅ Processed parameters:', processed);
    return processed;
}

async function testModules(context, params) {
    const { ColorLog, moment, fsExtra, XLSX, execSync } = context;
    
    ColorLog.BW('🧪 Testing available modules...');
    
    // Test ColorLog
    ColorLog.WB('Testing ColorLog colors:');
    ColorLog.RW('Red background, white text');
    ColorLog.GW('Green background, white text');
    ColorLog.BW('Blue background, white text');
    ColorLog.YB('Yellow background, black text');
    
    // Test moment
    if (moment) {
        const now = moment();
        ColorLog.BW('Current time with moment:', now.format('YYYY-MM-DD HH:mm:ss'));
    } else {
        ColorLog.YW('⚠️ Moment module not available');
    }
    
    // Test fsExtra availability
    if (fsExtra) {
        ColorLog.BW('✅ fsExtra module available');
    } else {
        ColorLog.YW('⚠️ fsExtra module not available');
    }
    
    // Test XLSX availability
    if (XLSX) {
        ColorLog.BW('✅ XLSX module available');
    } else {
        ColorLog.YW('⚠️ XLSX module not available');
    }
    
    ColorLog.GW('✅ Module testing completed');
}

async function testFileOperations(fsExtra, ColorLog) {
    ColorLog.BW('📁 Testing file operations...');
    
    try {
        const testData = {
            timestamp: new Date().toISOString(),
            message: 'Test data from RunCodeV3',
            numbers: [1, 2, 3, 4, 5]
        };
        
        // Create test file (if fsExtra is available)
        if (fsExtra && fsExtra.writeJsonSync) {
            const testFile = 'test-output.json';
            fsExtra.writeJsonSync(testFile, testData, { spaces: 2 });
            ColorLog.GW(`✅ Created test file: ${testFile}`);
            
            // Read it back
            const readData = fsExtra.readJsonSync(testFile);
            ColorLog.BW('📖 Read back data:', readData.message);
            
            // Clean up
            fsExtra.removeSync(testFile);
            ColorLog.BW('🗑️ Cleaned up test file');
        } else {
            ColorLog.YW('⚠️ File operations skipped (fsExtra not available)');
        }
        
    } catch (error) {
        ColorLog.RW('❌ File operations failed:', error.message);
    }
}

function testDateOperations(moment, ColorLog) {
    ColorLog.BW('📅 Testing date operations...');
    
    if (moment) {
        const now = moment();
        const tomorrow = moment().add(1, 'day');
        const lastWeek = moment().subtract(1, 'week');
        
        ColorLog.BW('Now:', now.format('YYYY-MM-DD'));
        ColorLog.BW('Tomorrow:', tomorrow.format('YYYY-MM-DD'));
        ColorLog.BW('Last week:', lastWeek.format('YYYY-MM-DD'));
        ColorLog.GW('✅ Date operations completed');
    } else {
        // Fallback to native Date
        ColorLog.YW('⚠️ Using native Date instead of moment');
        const now = new Date();
        ColorLog.BW('Current date:', now.toISOString().split('T')[0]);
    }
}

function testCalculations(params, ColorLog) {
    ColorLog.BW('🔢 Testing calculations...');
    
    const { num1, num2 } = params;
    
    const results = {
        addition: num1 + num2,
        subtraction: num1 - num2,
        multiplication: num1 * num2,
        division: num2 !== 0 ? num1 / num2 : 'Cannot divide by zero'
    };
    
    ColorLog.BW(`${num1} + ${num2} = ${results.addition}`);
    ColorLog.BW(`${num1} - ${num2} = ${results.subtraction}`);
    ColorLog.BW(`${num1} * ${num2} = ${results.multiplication}`);
    ColorLog.BW(`${num1} / ${num2} = ${results.division}`);
    
    ColorLog.GW('✅ Calculations completed');
    return results;
}

// Export for potential use as module
module.exports = { main, parameters };