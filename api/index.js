// ./api/index.js
const mongoose = require('mongoose');
const app = require('../app');

module.exports = async (req, res) => {
    // перевіряємо, що ENV підхопився
    console.log('🔑 MONGO_URI:', process.env.MONGO_URI);

    // якщо ще не підключені — підключаємося
    if (mongoose.connection.readyState !== 1) {
        try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('✔️ MongoDB connected (runtime)');
        } catch (err) {
            console.error('❌ MongoDB connection error (runtime):', err);
            return res.status(500).send('Database connection failed');
        }
    }

    // далі передаємо всі запити в Express
    return app(req, res);
};
