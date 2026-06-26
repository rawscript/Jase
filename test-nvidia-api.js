// Test NVIDIA API connection
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

async function testNVIDIAAPI() {
  console.log('🔍 Testing NVIDIA API connection...');
  
  const apiKey = process.env.NVIDIA_API_KEY;
  const baseURL = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
  const model = process.env.NVIDIA_MODEL || 'deepseek-ai/deepseek-v4-pro';
  
  if (!apiKey || apiKey === 'your_nvidia_api_key_here') {
    console.log('❌ NVIDIA API key not configured');
    console.log('Please update your .env file with:');
    console.log('NVIDIA_API_KEY=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');
    return;
  }
  
  console.log(`📱 API Key: ${apiKey.substring(0, 15)}...`);
  console.log(`🌐 Base URL: ${baseURL}`);
  console.log(`🤖 Model: ${model}`);
  
  try {
    const client = new OpenAI({
      baseURL: baseURL,
      apiKey: apiKey,
    });
    
    console.log('🔄 Sending test request to NVIDIA API...');
    
    const completion = await client.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: 'Hello, this is a test. Please respond with "NVIDIA API is working!"' }],
      temperature: 1.0,
      top_p: 0.95,
      max_tokens: 50,
      extra_body: {
        chat_template_kwargs: {
          thinking: false
        }
      },
      stream: false,
    });
    
    const response = completion.choices[0].message.content;
    console.log('✅ NVIDIA API Response:');
    console.log(response);
    console.log('\n🎉 NVIDIA API connection successful!');
    
  } catch (error) {
    console.error('❌ NVIDIA API Error:', error.message || error);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check if the API key is valid');
    console.log('2. Verify you have access to the DeepSeek V4 Pro model');
    console.log('3. Check your internet connection');
    console.log('4. Visit https://integrate.api.nvidia.com to verify API status');
  }
}

// Run test
testNVIDIAAPI().catch(console.error);