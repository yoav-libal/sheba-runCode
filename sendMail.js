const _=global
//ignoreAllByLibal
//libalCodingHelper
//Sheba
//labDepartment

// sendMail.js - Email sending test with SMTP, Hebrew support, and file attachments
// Usage: node runCodeV3.js -f sendMail.js --file mailIt.json

async function main() {
    // Modules are automatically injected by runCodeV3 - no manual destructuring needed
    // This script will only work with runCodeV3, not with regular node.exe
    
    try {
        ColorLog.BW('📧 Starting Email Sending Test');
        ColorLog.BW('==============================');
        
        // Get email configuration from argv (loaded from JSON)
        const config = extractEmailConfig(argv, ColorLog);
        
        // Validate configuration
        validateEmailConfig(config, ColorLog);
        
        // Create SMTP transporter
        const transporter = await createTransporter(nodemailer || emailSender || mailer, config, ColorLog);
        
        // Prepare email content
        const emailData = await prepareEmailContent(config, fsExtra, ColorLog, moment);
        
        // Check attachments
        const attachments = await prepareAttachments(config.attachments || [], fsExtra, ColorLog);
        emailData.attachments = attachments;
        
        // Send email (or simulate in test mode)
        const result = await sendEmail(transporter, emailData, config, ColorLog);
        
        ColorLog.GW('🎉 Email operation completed successfully!');
        
        return {
            status: 'success',
            message: 'Email sent successfully',
            recipient: emailData.to,
            subject: emailData.subject,
            attachmentCount: attachments.length,
            testMode: config.options?.testMode || false,
            timestamp: moment ? moment().toISOString() : new Date().toISOString(),
            result: result
        };

    } catch (error) {
        ColorLog.RW('❌ Error in email sending:', error.message);
        throw error;
    }
}

function extractEmailConfig(argv, ColorLog) {
    ColorLog.BW('📋 Extracting email configuration...');
    
    // The JSON config should be merged into argv
    const config = {
        smtp: argv.smtp || {},
        email: argv.email || {},
        attachments: argv.attachments || [],
        options: argv.options || {}
    };
    
    ColorLog.BW('✅ Configuration extracted');
    return config;
}

function validateEmailConfig(config, ColorLog) {
    ColorLog.BW('🔍 Validating email configuration...');
    
    const errors = [];
    
    // Validate SMTP settings
    if (!config.smtp.host) errors.push('SMTP host is required');
    if (!config.smtp.port) errors.push('SMTP port is required');
    
    // Validate email settings
    if (!config.email.from) errors.push('From address is required');
    if (!config.email.to || config.email.to.length === 0) errors.push('To address is required');
    if (!config.email.subject) errors.push('Email subject is required');
    
    if (errors.length > 0) {
        ColorLog.RW('❌ Configuration validation failed:');
        errors.forEach(error => ColorLog.RW(`   - ${error}`));
        throw new Error(`Invalid configuration: ${errors.join(', ')}`);
    }
    
    ColorLog.GW('✅ Configuration validation passed');
    
    // Log configuration summary
    ColorLog.BW(`📨 SMTP: ${config.smtp.host}:${config.smtp.port}`);
    ColorLog.BW(`📧 From: ${config.email.from.name || ''} <${config.email.from.address}>`);
    ColorLog.BW(`📬 To: ${config.email.to.length} recipient(s)`);
    ColorLog.BW(`📎 Attachments: ${config.attachments.length} file(s)`);
    ColorLog.BW(`🇮🇱 Hebrew Support: ${config.options.enableHebrewSupport ? 'Enabled' : 'Disabled'}`);
    ColorLog.BW(`🧪 Test Mode: ${config.options.testMode ? 'Enabled' : 'Disabled'}`);
}

async function createTransporter(nodemailer, config, ColorLog) {
    ColorLog.BW('🔗 Creating SMTP transporter...');
    
    if (!nodemailer) {
        throw new Error('Nodemailer module not available');
    }
    
    const transportConfig = {
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure || false, // true for 465, false for other ports
        auth: config.smtp.auth,
        tls: config.smtp.tls || {}
    };
    
    // Add Hebrew support
    if (config.options.enableHebrewSupport) {
        transportConfig.encoding = 'utf8';
    }
    
    ColorLog.BW(`🌐 Connecting to ${transportConfig.host}:${transportConfig.port}`);
    
    const transporter = nodemailer.createTransport(transportConfig);
    
    // Test connection in non-test mode
    if (!config.options.testMode) {
        try {
            await transporter.verify();
            ColorLog.GW('✅ SMTP connection verified successfully');
        } catch (error) {
            ColorLog.RW('❌ SMTP connection failed:', error.message);
            throw new Error(`SMTP connection failed: ${error.message}`);
        }
    } else {
        ColorLog.YW('⚠️  Skipping SMTP verification (test mode)');
    }
    
    return transporter;
}

async function prepareEmailContent(config, fsExtra, ColorLog, moment) {
    ColorLog.BW('✍️  Preparing email content...');
    
    const timestamp = moment ? moment().format('YYYY-MM-DD HH:mm:ss') : new Date().toISOString();
    
    // Replace template variables
    const subject = config.email.subject.replace('{{timestamp}}', timestamp);
    const htmlContent = config.email.html ? config.email.html.replace('{{timestamp}}', timestamp) : '';
    const textContent = config.email.text ? config.email.text.replace('{{timestamp}}', timestamp) : '';
    
    // Format recipients
    const toAddresses = config.email.to.map(recipient => {
        if (typeof recipient === 'string') {
            return recipient;
        }
        return recipient.name ? `"${recipient.name}" <${recipient.address}>` : recipient.address;
    });
    
    const emailData = {
        from: config.email.from.name ? 
              `"${config.email.from.name}" <${config.email.from.address}>` : 
              config.email.from.address,
        to: toAddresses.join(', '),
        cc: config.email.cc ? config.email.cc.join(', ') : undefined,
        bcc: config.email.bcc ? config.email.bcc.join(', ') : undefined,
        subject: subject,
        text: textContent,
        html: htmlContent,
        encoding: 'utf8', // Ensure UTF-8 for Hebrew support
        headers: {
            'Content-Type': 'text/html; charset=UTF-8',
            'Content-Language': 'he',
            'X-Priority': '3'
        }
    };
    
    ColorLog.BW(`📧 Subject: ${subject}`);
    ColorLog.BW(`📝 Content: ${htmlContent ? 'HTML + Text' : 'Text only'}`);
    ColorLog.GW('✅ Email content prepared');
    
    return emailData;
}

async function prepareAttachments(attachmentConfigs, fsExtra, ColorLog) {
    ColorLog.BW(`📎 Preparing ${attachmentConfigs.length} attachment(s)...`);
    
    const attachments = [];
    const fs = fsExtra || require('fs');
    
    for (const attachConfig of attachmentConfigs) {
        try {
            if (fs.existsSync(attachConfig.path)) {
                attachments.push({
                    filename: attachConfig.filename,
                    path: attachConfig.path,
                    contentType: attachConfig.contentType
                });
                
                const stats = fs.statSync(attachConfig.path);
                ColorLog.BW(`   ✅ ${attachConfig.filename} (${Math.round(stats.size / 1024)}KB)`);
            } else {
                ColorLog.YW(`   ⚠️  File not found: ${attachConfig.path}`);
            }
        } catch (error) {
            ColorLog.RW(`   ❌ Error with attachment ${attachConfig.filename}:`, error.message);
        }
    }
    
    ColorLog.GW(`✅ ${attachments.length} attachment(s) ready`);
    return attachments;
}

async function sendEmail(transporter, emailData, config, ColorLog) {
    ColorLog.BW('📤 Sending email...');
    
    if (config.options.testMode) {
        ColorLog.YW('🧪 TEST MODE: Email will be simulated, not actually sent');
        
        // Simulate email sending
        const result = {
            messageId: 'test-' + Date.now(),
            response: 'Test mode - email not actually sent',
            envelope: {
                from: emailData.from,
                to: emailData.to.split(', ')
            }
        };
        
        ColorLog.GW('✅ Email simulated successfully');
        ColorLog.BW('📨 Simulated email details:');
        ColorLog.WB(`   From: ${emailData.from}`);
        ColorLog.WB(`   To: ${emailData.to}`);
        ColorLog.WB(`   Subject: ${emailData.subject}`);
        ColorLog.WB(`   Attachments: ${emailData.attachments ? emailData.attachments.length : 0}`);
        
        return result;
    } else {
        try {
            const info = await transporter.sendMail(emailData);
            
            ColorLog.GW('✅ Email sent successfully!');
            ColorLog.BW(`📬 Message ID: ${info.messageId}`);
            ColorLog.BW(`📤 Response: ${info.response}`);
            
            return info;
        } catch (error) {
            ColorLog.RW('❌ Failed to send email:', error.message);
            throw error;
        }
    }
}

// Export for potential use as module
module.exports = { main };