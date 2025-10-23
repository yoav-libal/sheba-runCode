const ColorLog = require('./colorLog');
const path = require('path');
const fs = require('fs-extra'); // Use fs-extra for enhanced functionality

/**
 * Context Builder - Creates execution context for target scripts
 * Assembles all modules, arguments, and configurations into a single context object
 */
class ContextBuilder {
    constructor(modules) {
        this.modules = modules;
        this.context = {};
    }

    /**
     * Build complete execution context
     * @param {Object} argv - Parsed command line arguments
     * @param {string} targetFile - Path to the target JS file
     * @param {string} extraParamFile - Path to extra parameters JSON file
     * @returns {Object} Complete execution context
     */
    async buildContext(argv, targetFile, extraParamFile = null) {
        ColorLog.BW('🔧 Building execution context...');

        try {
            // Start with base modules
            this.context = { ...this.modules };

            // Add command line arguments
            this.addArguments(argv);

            // Add extra parameters from JSON file if provided
            if (extraParamFile) {
                await this.addExtraParameters(extraParamFile);
            }

            // Add target file information
            this.addFileInfo(targetFile);

            // Add execution utilities
            this.addExecutionUtilities();

            ColorLog.GW('✅ Context built successfully');
            this.logContextSummary();

            return this.context;

        } catch (error) {
            ColorLog.RW('❌ Failed to build context:', error.message);
            throw new Error(`Context building failed: ${error.message}`);
        }
    }

    /**
     * Add command line arguments to context
     * @param {Object} argv - Parsed command line arguments
     */
    addArguments(argv) {
        // Clean up argv to remove yargs internal properties
        const cleanArgv = {};
        
        for (const [key, value] of Object.entries(argv)) {
            // Skip yargs internal properties
            if (!key.startsWith('_') && !key.startsWith('$')) {
                cleanArgv[key] = value;
            }
        }

        this.context.argv = cleanArgv;
        ColorLog.BW('📋 Added command line arguments to context');
    }

    /**
     * Add extra parameters from JSON file
     * @param {string} extraParamFile - Path to JSON file
     */
    async addExtraParameters(extraParamFile) {
        try {
            if (!fs.existsSync(extraParamFile)) {
                ColorLog.YW(`⚠️  Extra param file not found: ${extraParamFile}`);
                return;
            }

            const rawData = fs.readFileSync(extraParamFile, 'utf8');
            const extraParams = JSON.parse(rawData);

            // Merge extra parameters into argv
            this.context.argv = { ...this.context.argv, ...extraParams };
            
            ColorLog.GW(`✅ Loaded extra parameters from ${extraParamFile}`);
            ColorLog.WB('Extra parameters:', this.maskSensitiveData(extraParams));

        } catch (error) {
            ColorLog.RW(`❌ Failed to load extra parameters: ${error.message}`);
            // Don't throw error, just continue without extra params
        }
    }

    /**
     * Add target file information
     * @param {string} targetFile - Path to target file
     */
    addFileInfo(targetFile) {
        const resolvedPath = path.resolve(targetFile);
        
        this.context.fileInfo = {
            originalPath: targetFile,
            resolvedPath: resolvedPath,
            fileName: path.basename(targetFile),
            directory: path.dirname(resolvedPath),
            exists: fs.existsSync(resolvedPath)
        };

        ColorLog.BW(`📄 Target file: ${this.context.fileInfo.fileName}`);
    }

    /**
     * Add execution utilities
     */
    addExecutionUtilities() {
        // Add process utilities
        this.context.process = {
            exit: process.exit,
            cwd: process.cwd,
            env: process.env
        };

        // Add console utilities (wrapped with ColorLog awareness)
        this.context.console = {
            log: (...args) => {
                if (this.context.ColorLog) {
                    this.context.ColorLog.WB(...args);
                } else {
                    console.log(...args);
                }
            },
            error: (...args) => {
                if (this.context.ColorLog) {
                    this.context.ColorLog.RW(...args);
                } else {
                    console.error(...args);
                }
            },
            warn: (...args) => {
                if (this.context.ColorLog) {
                    this.context.ColorLog.YB(...args);
                } else {
                    console.warn(...args);
                }
            }
        };

        // Add database utilities
        this.addDatabaseUtilities();

        // Add global reference
        this.context.global = global;

        ColorLog.BW('🛠️  Added execution utilities');
    }

    /**
     * Add database connection utilities
     */
    addDatabaseUtilities() {
        const RunCodeV3 = require('./runCodeV3');
        const dbUtils = RunCodeV3.createDatabaseUtilities(this.modules);
        
        if (dbUtils) {
            this.context.dbConnect = dbUtils.dbConnect;
            this.context.dbClose = dbUtils.dbClose;
            this.context.executeQuery = dbUtils.executeQuery;
            this.context.processDbParameters = dbUtils.processDbParameters;
            
            ColorLog.BW('📊 Added database utilities to context');
        } else {
            ColorLog.YW('⚠️  Database utilities not available (SQL module missing)');
        }
    }

    /**
     * Validate the built context
     * @returns {boolean} True if context is valid
     */
    validateContext() {
        const required = ['sql', 'moment', 'argv', 'ColorLog'];
        const missing = required.filter(key => !this.context[key]);

        if (missing.length > 0) {
            ColorLog.RW('❌ Context validation failed. Missing:', missing);
            return false;
        }

        if (!this.context.fileInfo || !this.context.fileInfo.exists) {
            ColorLog.RW('❌ Target file not found:', this.context.fileInfo?.originalPath);
            return false;
        }

        ColorLog.GW('✅ Context validation passed');
        return true;
    }

    /**
     * Log context summary for debugging
     */
    logContextSummary() {
        const summary = {
            modules: Object.keys(this.modules).length,
            arguments: Object.keys(this.context.argv || {}).length,
            targetFile: this.context.fileInfo?.fileName,
            hasExtraParams: Object.keys(this.context.argv || {}).length > 2 // More than just 'f' and file name
        };

        ColorLog.BW('📊 Context Summary:', summary);
    }

    /**
     * Get context for specific module
     * @param {string} moduleName - Name of the module
     * @returns {*} The module or null
     */
    getModuleFromContext(moduleName) {
        return this.context[moduleName] || null;
    }

    /**
     * Add custom property to context
     * @param {string} key - Property key
     * @param {*} value - Property value
     */
    addToContext(key, value) {
        this.context[key] = value;
        ColorLog.BW(`➕ Added '${key}' to context`);
    }

    /**
     * Mask sensitive data in objects for logging
     * @param {Object} obj - Object that may contain sensitive data
     * @returns {Object} Object with masked sensitive fields
     */
    maskSensitiveData(obj) {
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
                masked[key] = this.maskSensitiveData(value);
            }
        }

        return masked;
    }
}

module.exports = ContextBuilder;