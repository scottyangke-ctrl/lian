// Test script to verify authentication APIs
async function testAuthAPIs() {
  const baseUrl = 'http://localhost:3000';

  console.log('Testing Authentication APIs...\n');

  // Test user registration
  try {
    console.log('1. Testing user registration...');
    const registerResponse = await fetch(`${baseUrl}/api/auth`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword123'
      })
    });
    const registerData = await registerResponse.json();
    console.log('Registration response:', {
      status: registerResponse.status,
      success: registerData.success,
      message: registerData.message,
      hasData: 'data' in registerData
    });
    if (registerData.success) {
      console.log('✅ User registration working\n');
    } else {
      console.log('❌ User registration failed:', registerData.message, '\n');
    }
  } catch (error) {
    console.log('❌ Registration API failed:', error.message, '\n');
  }

  // Test user login
  try {
    console.log('2. Testing user login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'testpassword123'
      })
    });
    const loginData = await loginResponse.json();
    console.log('Login response:', {
      status: loginResponse.status,
      success: loginData.success,
      message: loginData.message,
      hasToken: loginData.success && 'data' in loginData && 'token' in loginData.data
    });
    if (loginData.success) {
      console.log('✅ User login working\n');
      return loginData.data.token; // Return token for further testing
    } else {
      console.log('❌ User login failed:', loginData.message, '\n');
    }
  } catch (error) {
    console.log('❌ Login API failed:', error.message, '\n');
  }

  return null;
}

// Test protected APIs
async function testProtectedAPIs(token) {
  const baseUrl = 'http://localhost:3000';

  console.log('Testing Protected APIs...\n');

  // Test strategy-log API with auth
  try {
    console.log('3. Testing protected /api/strategy-log...');
    const response = await fetch(`${baseUrl}/api/strategy-log`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    console.log('Protected API response:', {
      status: response.status,
      success: data.success,
      message: data.message
    });
    if (data.success) {
      console.log('✅ Protected strategy-log API working\n');
    } else {
      console.log('❌ Protected strategy-log API failed:', data.message, '\n');
    }
  } catch (error) {
    console.log('❌ Protected strategy-log API failed:', error.message, '\n');
  }
}

// Run tests
async function runTests() {
  const token = await testAuthAPIs();
  if (token) {
    await testProtectedAPIs(token);
  }
  console.log('Authentication testing completed.');
}

runTests().catch(console.error);
