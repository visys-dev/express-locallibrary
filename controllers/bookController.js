const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");


exports.index = asyncHandler(async (req, res, next) => {
    const [
      numBooks,
      numBookInstances,
      numAvailableBookInstances,
      numAuthors,
      numGenres,
    ] = await Promise.all([
      Book.countDocuments({}).exec(),
      BookInstance.countDocuments({}).exec(),
      BookInstance.countDocuments({ status: "Available" }).exec(),
      Author.countDocuments({}).exec(),
      Genre.countDocuments({}).exec(),
    ]);
  
    res.render("index", {
      title: "Домашня сторінка Local Library",
      book_count: numBooks,
      book_instance_count: numBookInstances,
      book_instance_available_count: numAvailableBookInstances,
      author_count: numAuthors,
      genre_count: numGenres,
    });
  });

// Відображення списку всіх книг.
exports.book_list = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title author")
    .sort({ title: 1 })
    .populate("author")
    .exec();

  res.render("book_list", { title: "Список книг", book_list: allBooks });
});

// Відображення сторінки деталей для конкретної книги.
exports.book_detail = asyncHandler(async (req, res, next) => {
  // Отримання деталей книг, екземплярів книг для конкретної книги
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.params.id).populate("author").populate("genre").exec(),
    BookInstance.find({ book: req.params.id }).exec(),
  ]);

  if (book === null) {
    // Немає результатів.
    const err = new Error("Книгу не знайдено");
    err.status = 404;
    return next(err);
  }

  res.render("book_detail", {
    title: book.title,
    book: book,
    book_instances: bookInstances,
  });
});

// Відображення форми створення книги при GET-запиті.
exports.book_create_get = asyncHandler(async (req, res, next) => {
  // Отримання всіх авторів і жанрів, які ми можемо використовувати для додавання до нашої книги.
  const [allAuthors, allGenres] = await Promise.all([
    Author.find().sort({ family_name: 1 }).exec(),
    Genre.find().sort({ name: 1 }).exec(),
  ]);

  res.render("book_form", {
    title: "Створити книгу",
    authors: allAuthors,
    genres: allGenres,
  });
});


// Обробка створення книги при POST-запиті.
exports.book_create_post = [
  // Перетворення жанру на масив.
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
          typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Валідація та очищення полів.
  body("title", "Назва не повинна бути порожньою.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
  body("author", "Автор не повинен бути порожнім.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
  body("summary", "Опис не повинен бути порожнім.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
  body("isbn", "ISBN не повинен бути порожнім.").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),
  // Обробка запиту після валідації та очищення.

  asyncHandler(async (req, res, next) => {
    // Витягнення помилок валідації з запиту.
    const errors = validationResult(req);

    // Створення об'єкта книги з екранованими та обрізаними даними.
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      // Є помилки. Відображення форми знову з очищеними значеннями/повідомленнями про помилки.

      // Отримання всіх авторів і жанрів для форми.
      const [allAuthors, allGenres] = await Promise.all([
        Author.find().sort({ family_name: 1 }).exec(),
        Genre.find().sort({ name: 1 }).exec(),
      ]);

      // Позначення вибраних жанрів як відмічених.
      for (const genre of allGenres) {
        if (book.genre.includes(genre._id)) {
          genre.checked = "true";
        }
      }
      res.render("book_form", {
        title: "Створити книгу",
        authors: allAuthors,
        genres: allGenres,
        book: book,
        errors: errors.array(),
      });
    } else {
      // Дані з форми є дійсними. Збереження книги.
      await book.save();
      res.redirect(book.url);
    }
  }),
];


exports.book_delete_get = asyncHandler(async (req, res, next) => {
  const [book, book_instances] = await Promise.all([
    Book.findById(req.params.id).exec(),
    BookInstance.find({ book: req.params.id }).exec(),
  ]);
  if (!book) {
    return res.redirect('/catalog/books');
  }
  res.render('book_delete', {
    title: 'Видалити книгу',
    book,
    book_instances,
  });
});


// POST /catalog/book/:id/delete
exports.book_delete_post = asyncHandler(async (req, res, next) => {
  const [book, book_instances] = await Promise.all([
    Book.findById(req.params.id).exec(),
    BookInstance.find({ book: req.params.id }).exec(),
  ]);
  if (book_instances.length > 0) {
    // є екземпляри — показати форму з переліком
    return res.render('book_delete', {
      title: 'Видалити книгу',
      book,
      book_instances,
    });
  }
  // видалити книгу
  await Book.findByIdAndDelete(req.body.bookid);
  res.redirect('/catalog/books');
});


// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book update GET");
});

// Handle book update on POST.
exports.book_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book update POST");
});