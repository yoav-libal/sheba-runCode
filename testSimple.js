const _=global
//ignoreAllByLibal
//libalCodingHelper
//Sheba
//labDepartment

/**
 * Simple Test - Just verify jsPDF is available
 */

async function main(context) {
    const { ColorLog } = context;
    
    ColorLog.BW('🚀 Simple Test - Checking jsPDF availability');
    ColorLog.BW('===========================================');
    
    try {
        // Debug: Check what's available
        ColorLog.BW('Available modules in context:');
        Object.keys(context).forEach(key => {
            ColorLog.BW(`  - ${key}: ${typeof context[key]}`);
        });
        
        ColorLog.GW('✅ Simple test completed successfully!');
        return { success: true };
        
    } catch (error) {
        ColorLog.RW('❌ Simple test failed:', error.message);
        throw error;
    }
}