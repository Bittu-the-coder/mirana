const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Manual .env parsing
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length) {
    envVars[key.trim()] = value.join('=').trim();
  }
});
const DATABASE_URL = envVars.MONGODB_URI;

async function dropEmailIndex() {
  try {
    await mongoose.connect(DATABASE_URL);
    console.log('Connected to MongoDB');

    const collection = mongoose.connection.collection('users');

    // List all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);

    // Drop email index if it exists
    const emailIndex = indexes.find(idx => idx.name === 'email_1');
    if (emailIndex) {
      await collection.dropIndex('email_1');
      console.log('Successfully dropped email_1 index!');
    } else {
      console.log('email_1 index not found');
    }

    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

dropEmailIndex();
