require('dotenv').config();
const mongoose = require('mongoose');

console.log('Connecting with URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✔️ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

