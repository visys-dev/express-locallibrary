// /api/index.js
const mongoose = require('mongoose');
const app = require('../app');      // ваш Express app

module.exports = async (req, res) => {
    // Лог для перевірки, що змінна підхопилася
    console.log('🔑 MONGO_URI:', process.env.MONGO_URI);

    // Якщо ще не підключилися — підключаємося
    if (mongoose.connection.readyState !== 1) {
        try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('✔️ MongoDB connected (runtime)');
        } catch (err) {
            console.error('❌ MongoDB connection error (runtime):', err);
            res.status(500).send('DB connection failed');
            return;
        }
    }

    // Далі передаємо обробку Express
    return app(req, res);
};
