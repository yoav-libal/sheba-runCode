const ColorLog = require('./colorLog');
const fs = require('fs-extra'); // Use fs-extra for enhanced functionality
const path = require('path');
const vm = require('vm');

/**
 * Sandbox Runner - Executes target JavaScript files in a controlled environment
 * Provides isolation and security while allowing access to required modules
 */
class SandboxRunner {
    constructor() {
        this.executionStartTime = null;
        this.executionEndTime = null;
        this.result = null;
        this.errors = [];
    }

    /**
     * Execute a JavaScript file in sandbox environment
     * @param {string} filePath - Path to the JavaScript file to execute
     * @param {Object} context - Execution context with modules and utilities
     * @returns {Object} Execution result
     */
    async executeFile(filePath, context) {
        ColorLog.BW(`🚀 Starting execution of ${path.basename(filePath)}...`);
        this.executionStartTime = Date.now();

        try {
            // Validate inputs
            if (!this.validateInputs(filePath, context)) {
                throw new Error('Invalid inputs provided to sandbox runner');
            }

            // Read the target file
            const fileContent = this.readTargetFile(filePath);

            // Prepare the sandbox environment
            const sandbox = this.prepareSandbox(context, filePath);

            // Execute the file
            const result = await this.runInSandbox(fileContent, sandbox, filePath);

            this.executionEndTime = Date.now();
            this.result = result;

            ColorLog.GW(`✅ Execution completed successfully in ${this.getExecutionTime()}ms`);
            return {
                success: true,
                result: result,
                executionTime: this.getExecutionTime(),
                errors: this.errors
            };

        } catch (error) {
            this.executionEndTime = Date.now();
            this.errors.push(error);
            
            ColorLog.RW('❌ Execution failed:', error.message);
            return {
                success: false,
                result: null,
                executionTime: this.getExecutionTime(),
                errors: this.errors,
                error: error.message
            };
        }
    }

    /**
     * Validate execution inputs
     * @param {string} filePath - Target file path
     * @param {Object} context - Execution context
     * @returns {boolean} True if inputs are valid
     */
    validateInputs(filePath, context) {
        if (!filePath || typeof filePath !== 'string') {
            ColorLog.RW('❌ Invalid file path provided');
            return false;
        }

        if (!fs.existsSync(filePath)) {
            ColorLog.RW(`❌ File not found: ${filePath}`);
            return false;
        }

        if (!context || typeof context !== 'object') {
            ColorLog.RW('❌ Invalid context provided');
            return false;
        }

        return true;
    }

    /**
     * Read target file content
     * @param {string} filePath - Path to the file
     * @returns {string} File content
     */
    readTargetFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            ColorLog.BW(`📖 Read ${content.length} characters from ${path.basename(filePath)}`);
            return content;
        } catch (error) {
            throw new Error(`Failed to read file ${filePath}: ${error.message}`);
        }
    }

    /**
     * Prepare sandbox environment
     * @param {Object} context - Execution context
     * @param {string} filePath - Target file path
     * @returns {Object} Sandbox environment
     */
    prepareSandbox(context, filePath) {
        // Create sandbox with context
        const sandbox = {
            // Add all context modules and utilities
            ...context,
            
            // Add Node.js globals that might be needed
            require: require,
            __filename: path.resolve(filePath),
            __dirname: path.dirname(path.resolve(filePath)),
            Buffer: Buffer,
            setTimeout: setTimeout,
            setInterval: setInterval,
            clearTimeout: clearTimeout,
            clearInterval: clearInterval,
            
            // Add module exports system
            module: { exports: {} },
            exports: {},
            
            // Safe console override
            console: {
                log: (...args) => ColorLog.WB('[TARGET]', ...args),
                error: (...args) => ColorLog.RW('[TARGET ERROR]', ...args),
                warn: (...args) => ColorLog.YB('[TARGET WARN]', ...args),
                info: (...args) => ColorLog.BW('[TARGET INFO]', ...args)
            }
        };

        // Ensure global reference points to sandbox
        sandbox.global = sandbox;

        ColorLog.BW('🛡️  Sandbox environment prepared');
        return sandbox;
    }

    /**
     * Execute code in sandbox using Node.js VM
     * @param {string} code - JavaScript code to execute
     * @param {Object} sandbox - Sandbox environment
     * @param {string} filePath - File path for error reporting
     * @returns {*} Execution result
     */
    async runInSandbox(code, sandbox, filePath) {
        try {
            // Create VM context
            const vmContext = vm.createContext(sandbox);
            
            // Wrap the code to handle async main function
            const wrappedCode = this.wrapCodeForExecution(code);
            
            ColorLog.WB('⚡ Executing in sandbox...');
            
            // Execute the code
            const script = new vm.Script(wrappedCode, {
                filename: path.basename(filePath),
                timeout: 30000 // 30 second timeout
            });
            
            const result = script.runInContext(vmContext);
            
            // If result is a Promise (async function), wait for it
            if (result && typeof result.then === 'function') {
                ColorLog.WB('⏳ Waiting for async execution...');
                return await result;
            }
            
            return result;
            
        } catch (error) {
            // Enhanced error reporting
            const enhancedError = new Error(`Sandbox execution error: ${error.message}`);
            enhancedError.originalError = error;
            enhancedError.file = filePath;
            throw enhancedError;
        }
    }

    /**
     * Wrap target code to handle main function execution
     * @param {string} code - Original code
     * @returns {string} Wrapped code
     */
    wrapCodeForExecution(code) {
        return `
(async function() {
    try {
        // Execute the original code
        ${code}
        
        // If there's a main function, call it with context
        if (typeof main === 'function') {
            const context = {
                sql, moment, argv, fsExtra, ColorLog, excel, XLSX, XLSX_CALC, execSync,
                nodemailer, emailSender, mailer,
                dbConnect, dbClose, executeQuery, processDbParameters,
                process, console, global
            };
            return await main(context);
        }
        
        // If no main function, just return the module.exports
        return module.exports;
        
    } catch (error) {
        console.error('Error in target script:', error);
        throw error;
    }
})();
        `;
    }

    /**
     * Get execution time in milliseconds
     * @returns {number} Execution time
     */
    getExecutionTime() {
        if (this.executionStartTime && this.executionEndTime) {
            return this.executionEndTime - this.executionStartTime;
        }
        return 0;
    }

    /**
     * Reset runner state for new execution
     */
    reset() {
        this.executionStartTime = null;
        this.executionEndTime = null;
        this.result = null;
        this.errors = [];
    }

    /**
     * Get execution summary
     * @returns {Object} Execution summary
     */
    getSummary() {
        return {
            executionTime: this.getExecutionTime(),
            hasResult: this.result !== null,
            errorCount: this.errors.length,
            lastExecution: this.executionEndTime
        };
    }
}

module.exports = SandboxRunner;