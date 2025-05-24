require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const RateLimit = require('express-rate-limit');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

// // Підключення до MongoDB
// mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log('✔️ MongoDB connected successfully'))
//     .catch(err => console.error('❌ MongoDB connection error:', err));

// Імпортуємо роутери
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog');
const queriesRouter = require('./routes/queries');

const app = express();

// Стиснення відповіді
app.use(compression());

// Захист HTTP заголовків
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
        },
    }),
);

// Обмеження швидкості: максимум 20 запитів на хвилину
const limiter = RateLimit({
    windowMs: 1 * 60 * 1000, // 1 хвилина
    max: 20,
});
app.use(limiter);

// Налаштування view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Статичні файли
app.use(express.static(path.join(__dirname, 'public')));

// Роутери
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);
app.use('/queries', queriesRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
