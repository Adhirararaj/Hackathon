const mongoose = require('mongoose');
require('dotenv').config();

const testAtlasConnection = async () => {
  try {
    console.log('🔄 Testing Atlas connection...');
    console.log('📡 Connection URI:', process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Atlas Connected Successfully!');
    console.log('🌐 Cloud Provider:', conn.connection.host);
    console.log('📊 Database Name:', conn.connection.db.databaseName);
    console.log('🔗 Connection State:', conn.connection.readyState === 1 ? 'Connected' : 'Not Connected');
    
    // List existing collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('📁 Existing Collections:', collections.map(c => c.name));
    
    await mongoose.connection.close();
    console.log('🔒 Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Atlas connection failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Check your username and password in the connection string');
    console.log('2. Make sure your IP address is whitelisted in Atlas');
    console.log('3. Verify the database name in the connection string');
    process.exit(1);
  }
};

testAtlasConnection();