require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('./src/models/User');

const outputFile = path.join(__dirname, 'test_user.example');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/rideshare';
        await mongoose.connect(mongoUri);
        console.log(`Connected to MongoDB at ${mongoUri}`);

        const users = await User.find({});

        const admins = users.filter(u => u.role === 'admin');
        const riders = users.filter(u => u.role === 'rider');
        const drivers = users.filter(u => u.role === 'driver');

        let content = `# Test Accounts Exported From DB\n# Date: ${new Date().toISOString()}\n\n`;

        if (admins.length > 0) {
            content += '## Admin\n';
            admins.forEach(u => {
                content += `- Username: ${u.username} / Email: ${u.email} / Role: ${u.role}\n`;
            });
            content += '\n';
        }

        if (riders.length > 0) {
            content += '## Riders\n';
            riders.forEach(u => {
                content += `- Username: ${u.username} / Email: ${u.email}\n`;
            });
            content += '\n';
        }

        if (drivers.length > 0) {
            content += '## Drivers\n';
            drivers.forEach(u => {
                // Check if vehicle info exists in profile or separate model (assuming simplified for now)
                content += `- Username: ${u.username} / Email: ${u.email}\n`;
            });
            content += '\n';
        }

        fs.writeFileSync(outputFile, content);
        console.log(`Successfully exported ${users.length} users to ${outputFile}`);

        process.exit(0);
    } catch (err) {
        console.error("Export Failed:", err.message);
        process.exit(1);
    }
};

connectDB();
