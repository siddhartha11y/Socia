// Quick test script to check login
const testLogin = async () => {
  try {
    // Test 1: Check if backend is accessible
    console.log('🔍 Testing backend accessibility...');
    const healthResponse = await fetch('https://socia-back.onrender.com/api/test-db');
    const healthData = await healthResponse.json();
    console.log('✅ Backend health:', healthData.status);
    console.log('📊 User count:', healthData.userCount);
    console.log('👥 Sample users:', healthData.sampleUsers);
    
    // Test 2: Try login with one of the existing users
    console.log('\n🔐 Testing login...');
    const loginResponse = await fetch('https://socia-back.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'abagail30495@gmail.com', // Using email from sample users
        password: 'test123' // Common test password
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('📝 Login response status:', loginResponse.status);
    console.log('📝 Login response:', loginData);
    
    // Test 3: Try with dutch777@gmail.com
    console.log('\n🔐 Testing with dutch777@gmail.com...');
    const dutchLoginResponse = await fetch('https://socia-back.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'dutch777@gmail.com',
        password: 'test123' // Try common password
      })
    });
    
    const dutchLoginData = await dutchLoginResponse.json();
    console.log('📝 Dutch login response status:', dutchLoginResponse.status);
    console.log('📝 Dutch login response:', dutchLoginData);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testLogin();