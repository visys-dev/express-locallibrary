const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");


// Display list of all Genres.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find()
    .sort({ name: 1 })
    .exec();
  res.render("genre_list", {
    title: "Список жанрів",
    genre_list: allGenres,
  });
});

// Відображення сторінки деталей для конкретного жанру.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  // Отримання деталей жанру та всіх пов'язаних книг (паралельно)
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);
  if (genre === null) {
    // Немає результатів.
    const err = new Error("Жанр не знайдено");
    err.status = 404;
    return next(err);
  }

  res.render("genre_detail", {
    title: "Деталі жанру",
    genre: genre,
    genre_books: booksInGenre,
  });
});

// Відображення форми створення жанру на GET.
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", { title: "Створити жанр" });
};

// POST: Створити новий жанр
exports.genre_create_post = [
  // 1) Валідація та санація поля name
  body('name', 'Назва жанру повинна містити мінімум 3 символи')
      .trim()
      .isLength({ min: 3 })
      .escape(),

  // 2) Обробка запиту після валідації
  asyncHandler(async (req, res, next) => {
    // Отримуємо результати валідації
    const errors = validationResult(req);

    // Створюємо об’єкт жанру для повторного рендеру форми при помилках
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // Є помилки валідації — рендеримо форму з помилками
      res.render('genre_form', {
        title: 'Створити жанр',
        genre,
        errors: errors.array(),
      });
      return;
    }

    // 3) Перевірка, чи такий жанр уже є в БД (без врахування регістру)
    const found = await Genre.findOne({ name: req.body.name })
        .collation({ locale: 'en', strength: 2 })
        .exec();

    if (found) {
      // Жанр уже існує — перенаправляємо на його сторінку
      res.redirect(found.url);
    } else {
      // Новий жанр — зберігаємо в БД та перенаправляємо
      await genre.save();
      res.redirect(genre.url);
    }
  }),
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const [genre, books] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }).exec(),
  ]);
  if (!genre) {
    return res.redirect('/catalog/genres');
  }
  res.render('genre_delete', { title: 'Видалити жанр', genre, books });
});

// POST /catalog/genre/:id/delete
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [genre, books] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }).exec(),
  ]);
  if (books.length > 0) {
    return res.render('genre_delete', { title: 'Видалити жанр', genre, books });
  }
  await Genre.findByIdAndDelete(req.body.genreid);
  res.redirect('/catalog/genres');
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) {
    return res.redirect('/catalog/genres');
  }
  res.render('genre_form', { title: 'Редагувати жанр', genre });
});

// Handle Genre update on POST.
exports.genre_update_post = [
  asyncHandler(async (req, res, next) => {
    const gen = new Genre({ name: req.body.name, _id: req.params.id });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('genre_form', {
        title: 'Редагувати жанр',
        genre: gen,
        errors: errors.array(),
      });
    }
    await Genre.findByIdAndUpdate(req.params.id, gen);
    res.redirect(gen.url);
  })
];
