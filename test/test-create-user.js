import fetch from 'node-fetch';

async function createDefaultUser() {
  try {
    console.log('Creating default user...');
    const response = await fetch('http://localhost:3002/api/auth/create-default', {
      method: 'POST',
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

createDefaultUser();
