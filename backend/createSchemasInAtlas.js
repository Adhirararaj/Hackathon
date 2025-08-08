const mongoose = require('mongoose');
require('dotenv').config();

// Import all your models
const User = require('./models/User');
const Question = require('./models/Question');
const Document = require('./models/Document');
const AwarenessContent = require('./models/AwarenessContent');
const Analytics = require('./models/Analytics');

const createSchemasInAtlas = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    // Connect to Atlas (removed deprecated options)
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Connected to MongoDB Atlas');
    console.log('🌐 Cloud Database:', mongoose.connection.host);
    console.log('📊 Database:', mongoose.connection.name);
    
    // Clear existing data (optional)
    console.log('🧹 Clearing existing collections...');
    await User.deleteMany({});
    await Question.deleteMany({});
    await Document.deleteMany({});
    await AwarenessContent.deleteMany({});
    await Analytics.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create sample data for each schema
    console.log('📝 Creating schema collections in Atlas...');

    // 1. Create Users Collection
    const sampleUsers = await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91-9876543210',
        language: 'en',
        account: {
          accountNo: '1234567890123456',
          ifscCode: 'SBIN0001234',
          branch: 'Main Branch Delhi',
          isLinked: true
        }
      },
      {
        name: 'राम शर्मा',
        email: 'ram@example.com', 
        phone: '+91-9876543211',
        language: 'hi',
        account: {
          accountNo: '2345678901234567',
          ifscCode: 'HDFC0002345',
          branch: 'Central Branch Mumbai',
          isLinked: true
        }
      },
      {
        name: 'Priya Patel',
        email: 'priya@example.com',
        phone: '+91-9876543212',
        language: 'gu'
      }
    ]);
    console.log(`✅ Created ${sampleUsers.length} users in Atlas`);

    // 2. Create Questions Collection
    const sampleQuestions = await Question.create([
      {
        userId: sampleUsers[0]._id,
        text: 'How do I apply for a personal loan?',
        inputType: 'text',
        language: 'en',
        answer: 'To apply for a personal loan, you need to visit your bank branch with necessary documents.',
        status: 'completed',
        rating: 5
      },
      {
        userId: sampleUsers[1]._id,
        text: 'बैंक खाता कैसे खोलें?',
        inputType: 'voice',
        language: 'hi',
        answer: 'बैंक खाता खोलने के लिए आपको नजदीकी बैंक शाखा में जाना होगा।',
        status: 'completed',
        voiceData: {
          transcript: 'बैंक खाता कैसे खोलें?',
          confidence: 0.95,
          duration: 3.2
        },
        rating: 4
      }
    ]);
    console.log(`✅ Created ${sampleQuestions.length} questions in Atlas`);

    // 3. Create Documents Collection
    const sampleDocuments = await Document.create([
      {
        userId: sampleUsers[0]._id,
        filename: '1691234567890-bank-statement.pdf',
        originalName: 'bank_statement_july_2024.pdf',
        mimeType: 'application/pdf',
        size: 1024576,
        filePath: '/uploads/1691234567890-bank-statement.pdf',
        extractedText: 'Bank Statement for Account: 1234567890123456. Balance: Rs. 50,000.',
        isProcessed: true,
        tags: ['banking', 'statement']
      }
    ]);
    console.log(`✅ Created ${sampleDocuments.length} documents in Atlas`);

    // 4. Create Awareness Content Collection
    const sampleContent = await AwarenessContent.create([
      {
        title: 'How to Open a Bank Account in India',
        content: 'Opening a bank account in India is a straightforward process...',
        category: 'banking',
        slug: 'how-to-open-bank-account-india',
        isPublished: true,
        tags: ['banking', 'tutorial'],
        translations: [
          {
            language: 'hi',
            title: 'भारत में बैंक खाता कैसे खोलें',
            content: 'भारत में बैंक खाता खोलना एक सीधी प्रक्रिया है...'
          }
        ],
        views: 1250
      }
    ]);
    console.log(`✅ Created ${sampleContent.length} awareness content in Atlas`);

    // 5. Create Analytics Collection (FIXED)
    const sampleAnalytics = await Analytics.create([
      {
        date: new Date('2024-08-09'),
        metrics: {
          totalUsers: 178,
          newUsers: 13,
          totalQuestions: 348,
          totalDocuments: 89,
          languageDistribution: [
            { language: 'en', count: 208 },
            { language: 'hi', count: 95 },
            { language: 'te', count: 32 }
          ],
          inputTypeDistribution: [
            { type: 'text', count: 228 },
            { type: 'voice', count: 90 },
            { type: 'doc', count: 30 }
          ],
          avgResponseTime: 2.1,
          successRate: 0.98
        }
      }
    ]);
    console.log(`✅ Created ${sampleAnalytics.length} analytics records in Atlas`);

    // List all collections created
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n🎉 SUCCESS! All schemas created in MongoDB Atlas');
    console.log('🌐 Cloud Database Host:', mongoose.connection.host);
    console.log('📊 Database Name:', mongoose.connection.name);
    console.log('📁 Collections Created:');
    collections.forEach(collection => {
      console.log(`   └── ${collection.name}`);
    });

    console.log('\n📱 Now check:');
    console.log('1. MongoDB Atlas Dashboard - Browse Collections');
    console.log('2. MongoDB Compass - Refresh to see Atlas data');
    console.log('3. Your collections are now stored in the cloud!');

    await mongoose.connection.close();
    console.log('\n🔒 Atlas connection closed');
    
  } catch (error) {
    console.error('❌ Error creating schemas in Atlas:', error);
    process.exit(1);
  }
};

// Run the schema creation
createSchemasInAtlas();