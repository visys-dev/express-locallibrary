const mongoose = require('mongoose');

const mongoURI = "mongodb+srv://vitalii:84wMlG1BfJwRalwj@cluster0.yiuqq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
   try {
       await mongoose.connect(mongoURI);
       console.log('MongoDB connected successfully');
   } catch (err) {
       console.error('Database connection failed:', err);
   }
};

module.exports = connectDB;
