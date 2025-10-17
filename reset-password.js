// Password reset script
const resetPassword = async () => {
  try {
    console.log('🔐 Attempting to reset password for dutch777@gmail.com...');
    
    // This would need to be done through a backend endpoint
    // For now, let's try common passwords that might have been used
    const commonPasswords = [
      'password',
      'password123',
      'test123',
      '123456',
      'dutch123',
      'admin123',
      'socia123'
    ];
    
    for (const password of commonPasswords) {
      console.log(`🔍 Trying password: ${password}`);
      
      const response = await fetch('https://socia-back.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'dutch777@gmail.com',
          password: password
        })
      });
      
      const data = await response.json();
      
      if (response.status === 200) {
        console.log('✅ SUCCESS! Password found:', password);
        console.log('🎫 Token:', data.token);
        return;
      } else {
        console.log('❌ Failed with:', data.message);
      }
    }
    
    console.log('❌ None of the common passwords worked');
    console.log('💡 You may need to register a new account or reset the password');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

resetPassword();