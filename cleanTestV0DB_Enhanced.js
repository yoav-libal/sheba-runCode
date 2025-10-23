// cleanTestV0DB_Enhanced.js - Enhanced version with test mode support
// Usage: node runCodeV3.js -f cleanTestV0DB_Enhanced.js --config dbConfig.json

const _=global

async function main(context) {
    const { sql, moment, argv, fsExtra, ColorLog, excel, XLSX, XLSX_CALC, execSync, dbConnect, dbClose } = context;
    global.ColorLog = ColorLog;
    global.sql = sql;
    global.moment = moment;
    global.fsExtra = fsExtra;
    
    try {
        // Process command line parameters
        const params = processParameters(ColorLog, argv);
        
        // Check if we're in test mode
        const testMode = argv.testMode || params.testMode || false;
        
        if (testMode) {
            ColorLog.YW('🧪 Running in TEST MODE - Database operations will be simulated');
            
            ColorLog.BW('🔗 Simulating database connection...');
            ColorLog.GW('✅ Database connection simulated successfully');
            
            ColorLog.BW('🔍 Simulating database operations...');
            // Simulate some database work
            await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async work
            
            ColorLog.GW('✅ Database operations simulated');
            ColorLog.BW('🔗 Simulating database disconnection...');
            ColorLog.GW('✅ Database disconnection simulated');
            
            return {
                status: 'success',
                message: 'cleanTestV0DB completed successfully (test mode)',
                testMode: true,
                params: maskSensitiveData(params)
            };
            
        } else {
            // Real database connection
            ColorLog.RW('⚠️  REAL DATABASE MODE - Attempting actual connection');
            
            try {
                // Use the enhanced dbConnect function
                await dbConnect(params, false);
                ColorLog.GW('✅ Database connected successfully');
                
                // Perform actual database operations here
                // ... your database logic ...
                
                await dbClose();
                ColorLog.GW('✅ Database closed successfully');
                
                return {
                    status: 'success',
                    message: 'cleanTestV0DB completed successfully',
                    testMode: false,
                    params: maskSensitiveData(params)
                };
                
            } catch (e) {
                ColorLog.RW('❌ Error connecting to database:', e.message);
                throw e;
            }
        }
        
    } catch (error) {
        ColorLog.RW('❌ Error in main function:', error.message);
        throw error;
    } finally {
        ColorLog.BW('🏁 Finally block executed');
    }
}

const parameters = {
    myParam: {
        type: 'string',
        description: 'Example parameter',
        default: 'default'
    },
    num1: { type: 'number', default: 0, description: 'First number for sum' },
    num2: { type: 'number', default: 0, description: 'Second number for sum' },
    user: { type: 'string', default: 'uMagicLabDBO', description: 'DB user' },
    password: { type: 'string', default: 'SDFL#)4fms0#$kd2025', description: 'DB password' },
    server: { type: 'string', default: 'SBWND182E', description: 'DB server' },
    database: { type: 'string', default: 'labDepartment', description: 'DB database name' },
    testMode: { type: 'boolean', default: true, description: 'Run in test mode (no real DB connection)' }
};

function processParameters(ColorLog, argv) {
    ColorLog.WB('📋 Processing parameters...');
    ColorLog.WB('Received parameters:', maskSensitiveData(argv));

    const processed = {};
    for (const [key, config] of Object.entries(parameters)) {
        processed[key] = argv[key] !== undefined ? argv[key] : config.default;

        if (processed[key] === undefined) {
            throw new Error(`Missing required parameter: ${key}`);
        }

        // Convert string numbers to actual numbers
        if (config.type === 'number' && typeof processed[key] === 'string') {
            processed[key] = Number(processed[key]);
        }
        
        // Convert string booleans to actual booleans
        if (config.type === 'boolean' && typeof processed[key] === 'string') {
            processed[key] = processed[key].toLowerCase() === 'true';
        }
    }
    
    ColorLog.GW('✅ Parameters processed successfully');
    return processed;
}

/**
 * Mask sensitive data in objects for logging
 * @param {Object} obj - Object that may contain sensitive data
 * @returns {Object} Object with masked sensitive fields
 */
function maskSensitiveData(obj) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    const sensitiveFields = ['password', 'user', 'username', 'pass', 'pwd'];
    const masked = { ...obj };

    for (const [key, value] of Object.entries(masked)) {
        if (sensitiveFields.includes(key.toLowerCase()) && typeof value === 'string' && value.length > 4) {
            const start = value.substring(0, 2);
            const end = value.substring(value.length - 2);
            masked[key] = `${start}.......${end}`;
        } else if (typeof value === 'object' && value !== null) {
            masked[key] = maskSensitiveData(value);
        }
    }

    return masked;
}

module.exports = { main, parameters };