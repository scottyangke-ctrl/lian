// Test script to verify API response formats
async function testAPIs() {
  const baseUrl = 'http://localhost:3002';

  console.log('Testing API response formats...\n');

  // Test strategy-log API
  try {
    console.log('1. Testing /api/strategy-log...');
    const response = await fetch(`${baseUrl}/api/strategy-log`);
    const data = await response.json();
    console.log('Response format:', {
      success: data.success,
      hasData: 'data' in data,
      hasMessage: 'message' in data,
      dataType: Array.isArray(data.data) ? 'array' : typeof data.data
    });
    console.log('✅ strategy-log API working\n');
  } catch (error) {
    console.log('❌ strategy-log API failed:', error.message, '\n');
  }

  // Test binance API
  try {
    console.log('2. Testing /api/binance...');
    const response = await fetch(`${baseUrl}/api/binance?symbol=BTCUSDT&interval=1h&limit=10`);
    const data = await response.json();
    console.log('Response format:', {
      success: data.success,
      hasData: 'data' in data,
      hasMessage: 'message' in data,
      dataKeys: data.success ? Object.keys(data.data) : []
    });
    console.log('✅ binance API working\n');
  } catch (error) {
    console.log('❌ binance API failed:', error.message, '\n');
  }

  console.log('API testing completed!');
}

testAPIs();
