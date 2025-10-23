// testDatabase.js - Database connection test using cleanTestV0DB.js parameters
// Usage: node runCodeV3.js -f testDatabase.js --config dbConfig.json

async function main(context) {
    const { sql, ColorLog, argv, dbConnect, dbClose, executeQuery, processDbParameters } = context;
    
    try {
        ColorLog.BW('🗄️  Starting Database Connection Test');
        ColorLog.BW('=====================================');
        
        // Process database parameters (similar to cleanTestV0DB.js)
        const dbParams = processDbParameters(argv);
        ColorLog.BW('📋 Database parameters processed:');
        ColorLog.WB(`   Server: ${dbParams.server}`);
        ColorLog.WB(`   Database: ${dbParams.database}`);
        ColorLog.WB(`   User: ${dbParams.user}`);
        
        // Test connection (in test mode, we won't actually connect)
        const testMode = argv.testMode || true; // Default to test mode
        
        if (testMode) {
            ColorLog.YW('🧪 Running in TEST MODE - Database connection will be simulated');
            
            // Simulate connection
            ColorLog.BW('🔗 Simulating database connection...');
            ColorLog.GW('✅ Database connection simulated successfully');
            
            // Simulate query execution
            ColorLog.BW('🔍 Simulating SQL query execution...');
            const mockResult = {
                recordset: [
                    { id: 1, name: 'Test Record 1', date: new Date() },
                    { id: 2, name: 'Test Record 2', date: new Date() }
                ],
                rowsAffected: [2]
            };
            
            ColorLog.GW(`✅ Query simulation completed - ${mockResult.recordset.length} rows returned`);
            ColorLog.WB('Sample records:');
            mockResult.recordset.forEach(record => {
                ColorLog.WB(`   ID: ${record.id}, Name: ${record.name}`);
            });
            
            ColorLog.BW('🔗 Simulating database disconnection...');
            ColorLog.GW('✅ Database disconnection simulated');
            
            return {
                status: 'success',
                message: 'Database test completed successfully (simulated)',
                testMode: true,
                connectionParams: {
                    server: dbParams.server,
                    database: dbParams.database,
                    user: dbParams.user
                },
                simulatedResults: mockResult.recordset.length
            };
            
        } else {
            // Real database connection (use with caution)
            ColorLog.RW('⚠️  REAL DATABASE MODE - This will attempt actual connection');
            
            let connection = null;
            try {
                // Connect to database
                connection = await dbConnect(dbParams, true); // readonly = true
                
                // Execute a simple test query
                const testQuery = 'SELECT @@VERSION as version, GETDATE() as current_time';
                const result = await executeQuery(testQuery);
                
                ColorLog.BW('📊 Database connection successful!');
                if (result.recordset && result.recordset.length > 0) {
                    const row = result.recordset[0];
                    ColorLog.WB('Server info:');
                    ColorLog.WB(`   Version: ${row.version?.substring(0, 100)}...`);
                    ColorLog.WB(`   Current time: ${row.current_time}`);
                }
                
                return {
                    status: 'success',
                    message: 'Database connection test completed successfully',
                    testMode: false,
                    connectionParams: {
                        server: dbParams.server,
                        database: dbParams.database,
                        user: dbParams.user
                    },
                    serverInfo: result.recordset?.[0]
                };
                
            } finally {
                // Always close connection
                if (connection) {
                    await dbClose();
                }
            }
        }
        
    } catch (error) {
        ColorLog.RW('❌ Database test failed:', error.message);
        throw error;
    }
}

// Export for potential use as module
module.exports = { main };