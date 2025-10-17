// Test backend health and registration
const testBackend = async () => {
  try {
    console.log('🔍 Testing backend health...');
    
    // Test 1: Health check
    const healthResponse = await fetch('https://socia-back.onrender.com/api/test-db');
    const healthData = await healthResponse.json();
    console.log('✅ Backend health:', healthData.status);
    console.log('📊 User count:', healthData.userCount);
    
    // Test 2: Try registration
    console.log('\n🔐 Testing registration...');
    const randomEmail = `test${Date.now()}@example.com`;
    const regResponse = await fetch('https://socia-back.onrender.com/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: `testuser${Date.now()}`,
        email: randomEmail,
        password: 'password123'
      })
    });
    
    const regData = await regResponse.json();
    console.log('📝 Registration response status:', regResponse.status);
    console.log('📝 Registration response:', regData);
    
    if (regResponse.status === 201 && regData.token) {
      console.log('✅ Registration successful!');
      console.log('🎫 Token received:', regData.token.substring(0, 30) + '...');
      
      // Test 3: Try using the token
      console.log('\n🔐 Testing token authentication...');
      const profileResponse = await fetch('https://socia-back.onrender.com/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${regData.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const profileData = await profileResponse.json();
      console.log('📝 Profile response status:', profileResponse.status);
      console.log('📝 Profile data:', profileData);
      
      if (profileResponse.status === 200) {
        console.log('✅ Token authentication works!');
        console.log('\n🎉 BACKEND IS WORKING PERFECTLY!');
        console.log('The issue is in the frontend configuration.');
      }
    } else {
      console.log('❌ Registration failed');
      console.log('Error:', regData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testBackend();