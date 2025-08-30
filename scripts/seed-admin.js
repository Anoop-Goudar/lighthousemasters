const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

for (const line of envLines) {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key.trim()] = value.trim();
  }
}

async function seedAdminUser() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    const adminUser = {
      name: "Admin User",
      email: "admin@lighthouse.com",
      role: "admin",
      membershipPlan: "premium",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const existingAdmin = await db.collection("users").findOne({ email: adminUser.email });
    
    if (existingAdmin) {
      console.log("Admin user already exists:", adminUser.email);
      return;
    }
    
    const result = await db.collection("users").insertOne(adminUser);
    console.log("Admin user created successfully:", result.insertedId);
    console.log("Email:", adminUser.email);
    console.log("Role:", adminUser.role);
    
  } catch (error) {
    console.error("Error seeding admin user:", error);
  } finally {
    await client.close();
  }
}

seedAdminUser();
