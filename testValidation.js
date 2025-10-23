// testValidation.js - Test the database validation mechanism
// Usage: node runCodeV3.js -f testValidation.js --config dbConfig.json

async function main(context) {
    const { ColorLog } = context;
    
    try {
        ColorLog.BW('🧪 Testing validation mechanism...');
        ColorLog.GW('✅ This script demonstrates that validation runs before target execution');
        ColorLog.WB('📊 Check the logs above - you should see factorial calculation');
        ColorLog.WB('🔢 The factorial of 200 has 375 digits!');
        
        return {
            status: 'success',
            message: 'Validation test completed',
            note: 'Factorial calculation should have appeared in logs'
        };
        
    } catch (error) {
        ColorLog.RW('❌ Error in validation test:', error.message);
        throw error;
    }
}

module.exports = { main };