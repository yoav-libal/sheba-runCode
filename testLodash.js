// Test script to verify lodash is available in the context
console.log('🧪 Testing lodash availability...');

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
    console.log('Version:', _.VERSION);
    
    // Test some common lodash functions
    const testData = { a: 1, b: 2, c: 3 };
    const keys = _.keys(testData);
    const values = _.values(testData);
    
    console.log('Keys:', keys);
    console.log('Values:', values);
    console.log('Max value:', _.max(values));
    console.log('Sum:', _.sum(values));
} else {
    console.log('❌ _ (underscore alias) is not available');
}

// Test lodash as utils alias
if (typeof utils !== 'undefined') {
    console.log('✅ utils alias is available');
    
    // Test utility functions
    const nested = { a: { b: { c: 'deep value' } } };
    const deepValue = utils.get(nested, 'a.b.c', 'default');
    console.log('Deep get:', deepValue);
    
    const chunked = utils.chunk([1, 2, 3, 4, 5, 6], 2);
    console.log('Chunked:', chunked);
} else {
    console.log('❌ utils alias is not available');
}

console.log('');
console.log('📋 Module availability summary:');
console.log('- lodash:', typeof lodash !== 'undefined' ? '✅' : '❌');
console.log('- _:', typeof _ !== 'undefined' ? '✅' : '❌');
console.log('- utils:', typeof utils !== 'undefined' ? '✅' : '❌');