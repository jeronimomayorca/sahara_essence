const fs = require('fs');

try {
  const content = fs.readFileSync('google-credentials.json', 'utf-8');
  console.log('File content length:', content.length);
  
  const json = JSON.parse(content);
  console.log('JSON Keys:', Object.keys(json));
  
  if (json.client_email) {
    console.log('✅ client_email is present');
  } else {
    console.log('❌ client_email is MISSING');
  }
  
  if (json.private_key) {
    console.log('✅ private_key is present');
  } else {
    console.log('❌ private_key is MISSING');
  }

  if (json.type) {
    console.log('Type:', json.type);
  }

} catch (e) {
  console.error('Error parsing JSON:', e.message);
}
