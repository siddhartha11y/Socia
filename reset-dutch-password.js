// Reset password for dutch777@gmail.com
const resetDutchPassword = async () => {
  try {
    console.log('🔐 Resetting password for dutch777@gmail.com...');
    
    const response = await fetch('https://socia-back.onrender.com/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'dutch777@gmail.com',
        newPassword: 'password123'
      })
    });
    
    const data = await response.json();
    console.log('📝 Reset response status:', response.status);
    console.log('📝 Reset response:', data);
    
    if (response.status === 200) {
      console.log('✅ Password reset successful!');
      console.log('🔑 New password: password123');
      
      // Now test login
      console.log('\n🔐 Testing login with new password...');
      const loginResponse = await fetch('https://socia-back.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'dutch777@gmail.com',
          password: 'password123'
        })
      });
      
      const loginData = await loginResponse.json();
      console.log('📝 Login response status:', loginResponse.status);
      console.log('📝 Login response:', loginData);
      
      if (loginResponse.status === 200) {
        console.log('🎉 SUCCESS! You can now login with:');
        console.log('   Email: dutch777@gmail.com');
        console.log('   Password: password123');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Wait a bit for deployment then run
setTimeout(resetDutchPassword, 3000);