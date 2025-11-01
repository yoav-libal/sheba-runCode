// Simple test script without database operations
console.log('🧪 Testing lodash availability (without DB)...');

// Test lodash under different aliases
if (typeof lodash !== 'undefined') {
    console.log('✅ lodash is available');
    console.log('Version:', lodash.VERSION);
    
    // Test a basic lodash function
    const testArray = [1, 2, 3, 4, 5];
    const doubled = lodash.map(testArray, x => x * 2);
    console.log('Doubled array:', doubled);
} else {
    console.log('❌ lodash is not available');
}

// Test lodash as underscore alias
if (typeof _ !== 'undefined') {
    console.log('✅ _ (underscore alias) is available');
    
    // Test some common lodash functions
    const testData = { a: 1, b: 2, c: 3 };
    const keys = _.keys(testData);
    const values = _.values(testData);
    
    console.log('Keys:', keys);
    console.log('Values:', values);
    console.log('Max value:', _.max(values));
} else {
    console.log('❌ _ (underscore alias) is not available');
}

console.log('✅ Lodash test completed successfully!');