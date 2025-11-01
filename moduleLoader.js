const ColorLog = require('./colorLog');

/**
 * Module Loader - Handles loading and managing all required npm modules
 * This ensures all dependencies are available before executing target scripts
 */
class ModuleLoader {
    constructor() {
        this.modules = {};
        this.loadedModules = new Set();
        this.failedModules = new Set();
    }

    /**
     * Load all required modules
     * @param {boolean} isLocalServerMode - Whether running in local server mode (relaxed module requirements)
     * @returns {Object} Object containing all loaded modules
     */
    async loadAllModules(isLocalServerMode = false) {
        ColorLog.BW('🔄 Loading required modules...');
        
        const requiredModules = [
            { name: 'mssql', alias: 'sql' },
            { name: 'moment', alias: 'moment' },
            { name: 'yargs', alias: 'yargs' },
            { name: 'fs-extra', alias: 'fsExtra' },
            { name: 'xlsx', alias: 'XLSX' },
            { name: 'xlsx-calc', alias: 'XLSX_CALC' },
            { name: 'pdf2json', alias: 'pdf2json' },
            { name: 'nodemailer', alias: 'nodemailer' },
            { name: 'child_process', alias: 'childProcess', isBuiltIn: true }
        ];

        for (const moduleInfo of requiredModules) {
            await this.loadModule(moduleInfo);
        }

        // Add additional utilities
        this.addUtilities();

        //ColorLog.GW(`✅ Successfully loaded ${this.loadedModules.size} modules`);
        
        if (this.failedModules.size > 0) {
            ColorLog.RW(`❌ Failed to load ${this.failedModules.size} modules:`, Array.from(this.failedModules));
        }

        return this.modules;
    }

    /**
     * Load a single module
     * @param {Object} moduleInfo - Module information
     */
    async loadModule(moduleInfo) {
        const { name, alias, isBuiltIn = false } = moduleInfo;
        
        try {
            //ColorLog.WB(`Loading ${name}...`);
            
            if (isBuiltIn) {
                this.modules[alias] = require(name);
            } else {
                this.modules[alias] = require(name);
            }
            
            this.loadedModules.add(name);
            //ColorLog.GW(`✅ ${name} loaded as '${alias}'`);
            
        } catch (error) {
            this.failedModules.add(name);
            ColorLog.RW(`❌ Failed to load ${name}:`, error.message);
            
            // Provide fallback or placeholder for critical modules
            this.provideFallback(alias, name);
        }
    }

    /**
     * Provide fallback implementations for failed modules
     * @param {string} alias - Module alias
     * @param {string} name - Original module name
     */
    provideFallback(alias, name) {
        switch (name) {
            case 'moment':
                this.modules[alias] = {
                    format: () => new Date().toISOString(),
                    isValid: () => true,
                    unix: () => Math.floor(Date.now() / 1000)
                };
                ColorLog.YB(`⚠️  Using fallback for ${name}`);
                break;
                
            case 'fs-extra':
                this.modules[alias] = require('fs');
                ColorLog.YB(`⚠️  Using built-in 'fs' instead of ${name}`);
                break;
                
            default:
                this.modules[alias] = null;
                ColorLog.RW(`❌ No fallback available for ${name}`);
        }
    }

    /**
     * Add additional utilities to the modules object
     */
    addUtilities() {
        // Add execSync from child_process
        if (this.modules.childProcess) {
            this.modules.execSync = this.modules.childProcess.execSync;
        }

        // Add excel alias for XLSX
        this.modules.excel = this.modules.XLSX;

        // Add utility aliases
        this.modules.htmlGenerator = this.modules.fsExtra; // For HTML file generation
        
        // Add PDF reading aliases
        this.modules.pdfReader = this.modules.pdf2json;
        
        // Add email aliases
        this.modules.emailSender = this.modules.nodemailer;
        this.modules.mailer = this.modules.nodemailer;

        // Add ColorLog
        this.modules.ColorLog = ColorLog;

        //ColorLog.BW('📦 Added utility aliases and email modules');

        //ColorLog.BW('');
        //ColorLog.BW('📋 Optimized build - HTML to PDF conversion via convertHTML2PDF.exe');
    }

    /**
     * Get specific module
     * @param {string} moduleName - Name of the module to get
     * @returns {*} The requested module or null
     */
    getModule(moduleName) {
        return this.modules[moduleName] || null;
    }

    /**
     * Check if all critical modules are loaded
     * @param {boolean} isLocalServerMode - Whether running in local server mode (relaxed requirements)
     * @returns {boolean} True if all critical modules are available
     */
    validateCriticalModules(isLocalServerMode = false) {
        // For local server mode, only require basic modules
        const critical = isLocalServerMode ? ['moment', 'fsExtra'] : ['sql', 'moment', 'fsExtra'];
        const missing = critical.filter(name => !this.modules[name]);
        
        if (missing.length > 0) {
            ColorLog.RW('❌ Critical modules missing:', missing);
            return false;
        }
        
        // Check PDF modules (important but not critical)
        const pdfModules = ['pdf2json'];
        const missingPdf = pdfModules.filter(name => !this.modules[name]);
        
        if (missingPdf.length > 0) {
            ColorLog.YW('⚠️  PDF modules missing (non-critical):', missingPdf);
        } else {
            //ColorLog.GW('✅ PDF reading modules loaded successfully');
        }

        // Check email modules (important but not critical)
        const emailModules = ['nodemailer'];
        const missingEmail = emailModules.filter(name => !this.modules[name]);
        
        if (missingEmail.length > 0) {
            //ColorLog.YW('⚠️  Email modules missing (non-critical):', missingEmail);
        } else {
            //ColorLog.GW('✅ Email modules loaded successfully');
        }
        
        //ColorLog.GW('✅ All critical modules loaded successfully');
        
        // Note: HTML to PDF conversion handled by external convertHTML2PDF.exe
        ColorLog.BW('📋 Optimized build - HTML to PDF conversion via external exe');
        return true;
    }

    /**
     * Get loading summary
     * @param {boolean} isLocalServerMode - Whether running in local server mode
     * @returns {Object} Summary of loading results
     */
    getSummary(isLocalServerMode = false) {
        return {
            loaded: Array.from(this.loadedModules),
            failed: Array.from(this.failedModules),
            totalModules: Object.keys(this.modules).length,
            isValid: this.validateCriticalModules(isLocalServerMode)
        };
    }
}

module.exports = ModuleLoader;