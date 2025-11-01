#!/usr/bin/env node

/**
 * runCodeV3-server-only.js - Simplified version for local HTTP server with embedded libraries
 * 
 * Purpose: Provides local HTTP server functionality with embedded CDN libraries
 * Usage: runCodeV3-server-only.exe --localserver <port>
 * 
 * Features:
 * - Local HTTP server with embedded library support
 * - CDN URL replacement for offline operation
 * - No external module dependencies for pkg compilation
 */

const ColorLog = require('./colorLog');

// Import embedded libraries for offline functionality
let EMBEDDED_LIBRARIES = null;
try {
    EMBEDDED_LIBRARIES = require('./embeddedLibraries');
    ColorLog.GW('📦 Embedded libraries loaded successfully');
} catch (error) {
    ColorLog.YW('⚠️  No embedded libraries found - CDN mode only');
}

const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const path = require('path');
const fs = require('fs');
const http = require('http');
const url = require('url');

/**
 * Simplified RunCode Server Application
 */
class RunCodeServerOnly {
    constructor() {
        this.startTime = Date.now();
        this.server = null;
    }

    /**
     * Main entry point
     */
    async run() {
        try {
            ColorLog.BW('🚀 RunCodeV3 Server-Only Mode');
            ColorLog.BW('================================================');
            
            const args = this.parseArguments();
            ColorLog.GW('📋 Command line arguments parsed successfully');
            
            if (args.localserver) {
                await this.startLocalServer(args.localserver, args.f);
            } else {
                ColorLog.RW('❌ Server-only mode requires --localserver option');
                process.exit(1);
            }
        } catch (error) {
            ColorLog.RW(`💥 Fatal error: ${error.message}`);
            process.exit(1);
        }
    }

    /**
     * Parse command line arguments
     */
    parseArguments() {
        return yargs(hideBin(process.argv))
            .option('localserver', {
                type: 'number',
                description: 'Start local HTTP server on specified port'
            })
            .option('f', {
                type: 'string',
                description: 'Target script file (for compatibility)'
            })
            .help()
            .argv;
    }

    /**
     * Map CDN URLs to local embedded library paths
     * @param {string} cdnUrl - Original CDN URL
     * @returns {string|null} Local embedded path or null if not found
     */
    static mapCdnToLocal(cdnUrl) {
        const cdnMappings = {
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css': '/embedded-libs/font-awesome/css/all.min.css',
            'https://cdn.jsdelivr.net/npm/chart.js': '/embedded-libs/chart.js/chart.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js': '/embedded-libs/chart.js/chart.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js': '/embedded-libs/xlsx/xlsx.full.min.js',
            'https://unpkg.com/tabulator-tables@5.4.4/dist/css/tabulator.min.css': '/embedded-libs/tabulator/css/tabulator.min.css',
            'https://unpkg.com/tabulator-tables@5.4.4/dist/js/tabulator.min.js': '/embedded-libs/tabulator/js/tabulator.min.js',
            'https://unpkg.com/tabulator-tables@5.5.0/dist/css/tabulator.min.css': '/embedded-libs/tabulator/css/tabulator.min.css',
            'https://unpkg.com/tabulator-tables@5.5.0/dist/js/tabulator.min.js': '/embedded-libs/tabulator/js/tabulator.min.js'
        };
        
        return cdnMappings[cdnUrl] || null;
    }

    /**
     * Process HTML content to replace CDN URLs with local embedded paths
     * @param {string} htmlContent - Original HTML content
     * @returns {string} Modified HTML with local paths
     */
    static processHtmlForEmbeddedLibs(htmlContent) {
        if (!EMBEDDED_LIBRARIES) {
            return htmlContent; // No embedded libraries, return as-is
        }

        let modifiedHtml = htmlContent;
        
        // Replace CDN URLs with local embedded paths
        const replacements = [
            {
                original: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
                replacement: '/embedded-libs/font-awesome/css/all.min.css'
            },
            {
                original: 'https://cdn.jsdelivr.net/npm/chart.js',
                replacement: '/embedded-libs/chart.js/chart.min.js'
            },
            {
                original: 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js',
                replacement: '/embedded-libs/chart.js/chart.min.js'
            },
            {
                original: 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
                replacement: '/embedded-libs/xlsx/xlsx.full.min.js'
            },
            {
                original: 'https://unpkg.com/tabulator-tables@5.4.4/dist/css/tabulator.min.css',
                replacement: '/embedded-libs/tabulator/css/tabulator.min.css'
            },
            {
                original: 'https://unpkg.com/tabulator-tables@5.4.4/dist/js/tabulator.min.js',
                replacement: '/embedded-libs/tabulator/js/tabulator.min.js'
            },
            {
                original: 'https://unpkg.com/tabulator-tables@5.5.0/dist/css/tabulator.min.css',
                replacement: '/embedded-libs/tabulator/css/tabulator.min.css'
            },
            {
                original: 'https://unpkg.com/tabulator-tables@5.5.0/dist/js/tabulator.min.js',
                replacement: '/embedded-libs/tabulator/js/tabulator.min.js'
            }
        ];

        for (const { original, replacement } of replacements) {
            modifiedHtml = modifiedHtml.replace(new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
        }

        return modifiedHtml;
    }

    /**
     * Start local HTTP server
     */
    async startLocalServer(port, scriptFile) {
        ColorLog.BW(`🌐 Starting local HTTP server on port ${port}...`);
        
        // Simple validation check (no database required for server-only mode)
        ColorLog.GW('✅ Server-only mode - No database validation required');
        
        const serverDirectory = process.cwd();
        
        this.server = http.createServer((req, res) => {
            const parsedUrl = url.parse(req.url, true);
            const pathname = parsedUrl.pathname;

            // Handle embedded library requests
            if (pathname.startsWith('/embedded-libs/') && EMBEDDED_LIBRARIES) {
                const libraryData = EMBEDDED_LIBRARIES.get(pathname);
                if (libraryData) {
                    const content = Buffer.from(libraryData.data, 'base64');
                    res.writeHead(200, {
                        'Content-Type': libraryData.mimeType,
                        'Content-Length': content.length,
                        'Cache-Control': 'public, max-age=31536000'
                    });
                    res.end(content);
                    ColorLog.GW(`📦 Served embedded library: ${pathname} (${libraryData.mimeType})`);
                    return;
                }
            }

            // Handle regular file requests
            const requestedPath = pathname === '/' ? '/index.html' : pathname;
            const filePath = path.join(serverDirectory, requestedPath.substring(1));
            
            // Security check - ensure file is within server directory
            if (!filePath.startsWith(serverDirectory)) {
                res.writeHead(403, { 'Content-Type': 'text/plain' });
                res.end('Forbidden');
                ColorLog.RW(`❌ 403: Access denied to ${requestedPath}`);
                return;
            }

            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
                    ColorLog.RW(`❌ 404: ${requestedPath} not found`);
                    return;
                }

                // Determine content type
                const ext = path.extname(filePath).toLowerCase();
                const contentType = this.getContentType(ext);
                
                let responseData = data;
                
                // Process HTML files for embedded library URL replacement
                if (ext === '.html' && EMBEDDED_LIBRARIES) {
                    const htmlString = data.toString('utf8');
                    const processedHtml = RunCodeServerOnly.processHtmlForEmbeddedLibs(htmlString);
                    responseData = Buffer.from(processedHtml, 'utf8');
                    ColorLog.BW(`🔄 Processed HTML for embedded libs: ${requestedPath}`);
                }

                res.writeHead(200, { 
                    'Content-Type': contentType,
                    'Content-Length': responseData.length
                });
                res.end(responseData);
                ColorLog.GW(`✅ 200: Served ${requestedPath} (${contentType})`);
            });
        });

        this.server.listen(port, () => {
            ColorLog.GW('========================================');
            ColorLog.GW('🚀 Local HTTP Server started successfully!');
            ColorLog.GW(`📍 Server running at: http://localhost:${port}`);
            ColorLog.GW(`📁 Serving files from: ${serverDirectory}`);
            ColorLog.GW(`🔗 Direct access: http://localhost:${port}/index.html`);
            ColorLog.GW('⏹️  Press Ctrl+C to stop server');
            ColorLog.GW('========================================');
        });

        // Handle graceful shutdown
        process.on('SIGINT', () => {
            ColorLog.YW('\n⏹️  Shutting down server...');
            this.server.close(() => {
                ColorLog.GW('✅ Server stopped gracefully');
                process.exit(0);
            });
        });
    }

    /**
     * Get MIME type for file extension
     */
    getContentType(ext) {
        const types = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.txt': 'text/plain'
        };
        return types[ext] || 'application/octet-stream';
    }
}

// Run the application
if (require.main === module) {
    const app = new RunCodeServerOnly();
    app.run().catch(error => {
        ColorLog.RW(`💥 Application error: ${error.message}`);
        process.exit(1);
    });
}

module.exports = RunCodeServerOnly;