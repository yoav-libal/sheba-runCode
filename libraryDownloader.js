#!/usr/bin/env node

/**
 * libraryDownloader.js - Download and embed external CDN libraries
 * 
 * Purpose: Download external libraries from CDNs and convert them to Base64 for embedding
 * Usage: Can be run standalone or integrated into runCodeV3
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class LibraryDownloader {
    constructor() {
        this.libraries = new Map();
        this.cacheDir = 'embedded-libs-cache';
        this.ensureCacheDir();
    }

    /**
     * Ensure cache directory exists
     */
    ensureCacheDir() {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    }

    /**
     * Download a file from URL
     * @param {string} url - URL to download
     * @returns {Promise<Buffer>} File contents as buffer
     */
    async downloadFile(url) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https:') ? https : http;
            
            console.log(`📥 Downloading: ${url}`);
            
            protocol.get(url, (response) => {
                // Handle redirects
                if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                    console.log(`🔄 Redirect to: ${response.headers.location}`);
                    return this.downloadFile(response.headers.location).then(resolve).catch(reject);
                }
                
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                    return;
                }
                
                const chunks = [];
                response.on('data', chunk => chunks.push(chunk));
                response.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    console.log(`✅ Downloaded: ${url} (${Math.round(buffer.length / 1024)}KB)`);
                    resolve(buffer);
                });
            }).on('error', reject);
        });
    }

    /**
     * Get MIME type from file extension
     * @param {string} url - URL or filename
     * @returns {string} MIME type
     */
    getMimeType(url) {
        const ext = path.extname(url.split('?')[0]).toLowerCase();
        const mimeTypes = {
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.svg': 'image/svg+xml'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }

    /**
     * Download and cache a library
     * @param {string} name - Library name
     * @param {string} url - CDN URL
     * @param {string} localPath - Local path for serving
     */
    async downloadLibrary(name, url, localPath) {
        try {
            const cacheFile = path.join(this.cacheDir, `${name}.cache`);
            
            // Check if already cached
            if (fs.existsSync(cacheFile)) {
                console.log(`📋 Using cached: ${name}`);
                const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
                this.libraries.set(localPath, cached);
                return cached;
            }

            // Download the file
            const buffer = await this.downloadFile(url);
            const base64 = buffer.toString('base64');
            const mimeType = this.getMimeType(url);
            
            const libraryData = {
                name,
                url,
                localPath,
                mimeType,
                base64,
                size: buffer.length,
                downloadDate: new Date().toISOString()
            };

            // Cache to file
            fs.writeFileSync(cacheFile, JSON.stringify(libraryData, null, 2));
            
            // Store in memory
            this.libraries.set(localPath, libraryData);
            
            console.log(`💾 Cached: ${name} → ${localPath} (${mimeType})`);
            return libraryData;
            
        } catch (error) {
            console.error(`❌ Failed to download ${name}:`, error.message);
            throw error;
        }
    }

    /**
     * Download all required libraries for the Tableau project
     */
    async downloadTableauLibraries() {
        console.log('🚀 Starting Tableau libraries download...');
        console.log('================================================');

        const libraries = [
            {
                name: 'font-awesome-css',
                url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
                localPath: '/embedded-libs/font-awesome/css/all.min.css'
            },
            {
                name: 'font-awesome-woff2',
                url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-solid-900.woff2',
                localPath: '/embedded-libs/font-awesome/webfonts/fa-solid-900.woff2'
            },
            {
                name: 'font-awesome-ttf',
                url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-solid-900.ttf',
                localPath: '/embedded-libs/font-awesome/webfonts/fa-solid-900.ttf'
            },
            {
                name: 'chart-js',
                url: 'https://cdn.jsdelivr.net/npm/chart.js',
                localPath: '/embedded-libs/chart.js/chart.min.js'
            },
            {
                name: 'xlsx-full',
                url: 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
                localPath: '/embedded-libs/xlsx/xlsx.full.min.js'
            },
            {
                name: 'tabulator-css',
                url: 'https://unpkg.com/tabulator-tables@5.5.0/dist/css/tabulator.min.css',
                localPath: '/embedded-libs/tabulator/css/tabulator.min.css'
            },
            {
                name: 'tabulator-js',
                url: 'https://unpkg.com/tabulator-tables@5.5.0/dist/js/tabulator.min.js',
                localPath: '/embedded-libs/tabulator/js/tabulator.min.js'
            }
        ];

        for (const lib of libraries) {
            await this.downloadLibrary(lib.name, lib.url, lib.localPath);
        }

        console.log('================================================');
        console.log(`✅ Downloaded ${libraries.length} libraries successfully!`);
        console.log(`📊 Total size: ${Math.round(this.getTotalSize() / 1024)}KB`);
        
        return this.libraries;
    }

    /**
     * Get total size of all libraries
     */
    getTotalSize() {
        let total = 0;
        for (const lib of this.libraries.values()) {
            total += lib.size;
        }
        return total;
    }

    /**
     * Generate embedded libraries data for runCodeV3
     */
    generateEmbeddedLibrariesCode() {
        const librariesArray = Array.from(this.libraries.values());
        
        const code = `
// Auto-generated embedded libraries data
// Generated on: ${new Date().toISOString()}
// Total libraries: ${librariesArray.length}
// Total size: ${Math.round(this.getTotalSize() / 1024)}KB

const EMBEDDED_LIBRARIES = new Map([
${librariesArray.map(lib => 
    `    ['${lib.localPath}', {
        name: '${lib.name}',
        mimeType: '${lib.mimeType}',
        size: ${lib.size},
        base64: '${lib.base64}'
    }]`
).join(',\n')}
]);

module.exports = EMBEDDED_LIBRARIES;
`;

        const outputFile = 'embeddedLibraries.js';
        fs.writeFileSync(outputFile, code);
        console.log(`📄 Generated: ${outputFile}`);
        
        return outputFile;
    }

    /**
     * Get library by local path
     */
    getLibrary(localPath) {
        return this.libraries.get(localPath);
    }

    /**
     * Check if library exists
     */
    hasLibrary(localPath) {
        return this.libraries.has(localPath);
    }

    /**
     * List all cached libraries
     */
    listLibraries() {
        console.log('\n📋 Cached Libraries:');
        console.log('====================');
        for (const [path, lib] of this.libraries) {
            console.log(`📦 ${lib.name}`);
            console.log(`   Local: ${path}`);
            console.log(`   MIME: ${lib.mimeType}`);
            console.log(`   Size: ${Math.round(lib.size / 1024)}KB`);
            console.log(`   Date: ${lib.downloadDate}`);
            console.log('');
        }
    }
}

// CLI usage
if (require.main === module) {
    const downloader = new LibraryDownloader();
    
    async function main() {
        try {
            await downloader.downloadTableauLibraries();
            downloader.listLibraries();
            downloader.generateEmbeddedLibrariesCode();
            
            console.log('\n🎉 Library downloading completed successfully!');
            console.log('💡 Next steps:');
            console.log('   1. Include embeddedLibraries.js in runCodeV3');
            console.log('   2. Add URL interception to HTTP server');
            console.log('   3. Test offline functionality');
            
        } catch (error) {
            console.error('💥 Error:', error.message);
            process.exit(1);
        }
    }
    
    main();
}

module.exports = LibraryDownloader;