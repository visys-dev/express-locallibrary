const Author = require("../models/author");
const Book = require('../models/book');
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

// Display list of all Authors.
exports.author_list = asyncHandler(async (req, res, next) => {
  const allAuthors = await Author.find().sort({ family_name: 1 }).exec();
  res.render("author_list", {
    title: "Список авторів",
    author_list: allAuthors,
  });
});


exports.author_detail = asyncHandler(async (req, res, next) => {
  const authorId = req.params.id;

  // одночасно запитуємо автора та всі його книги
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(authorId).exec(),
    Book.find({ author: authorId }).exec()
  ]);

  // якщо автора не знайдено — повертаємо 404
  if (!author) {
    const err = new Error('Author not found');
    err.status = 404;
    throw err;
  }

  // рендеримо сторінку з потрібними параметрами
  res.render('author_detail', {
    title: 'Деталі автора',
    author: author,
    author_books: allBooksByAuthor,
  });
});


// Відображення форми створення автора при GET-запиті.
exports.author_create_get = (req, res, next) => {
  res.render("author_form", { title: "Створити автора" });
};

exports.author_create_post = [
  // Валідація та очищення полів.
  body("first_name")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Ім'я повинно бути вказано.")
      .isAlphanumeric("uk-UA")
      .withMessage("Ім'я містить неалфанумерні символи."),
  body("family_name")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Прізвище повинно бути вказано.")
      .isAlphanumeric("uk-UA")
      .withMessage("Прізвище містить неалфанумерні символи."),
  body("date_of_birth", "Недійсна дата народження")
      .optional({ values: "falsy" })
      .isISO8601()
      .toDate(),
  body("date_of_death", "Недійсна дата смерті")
      .optional({ values: "falsy" })
      .isISO8601()
      .toDate(),

  // Обробка запиту після валідації та очищення.
  asyncHandler(async (req, res, next) => {
    // Витягнення помилок валідації з запиту.
    const errors = validationResult(req);

    // Створення об'єкта автора з екранованими та обрізаними даними
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });

    if (!errors.isEmpty()) {
      // Є помилки. Відображення форми знову з очищеними значеннями та повідомленнями про помилки.
      res.render("author_form", {
        title: "Створити автора",
        author: author,
        errors: errors.array(),
      });
      return;
    } else {
      // Дані з форми є дійсними.

      // Збереження автора.
      await author.save();
      // Перенаправлення на сторінку нового запису автора.
      res.redirect(author.url);
    }
  }),
];

// Відображення форми видалення автора при GET-запиті.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  // Отримання деталей автора та всіх його книг (паралельно)
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (author === null) {
    // Немає результатів.
    res.redirect("/catalog/authors");
  }

  res.render("author_delete", {
    title: "Видалити автора",
    author: author,
    author_books: allBooksByAuthor,
  });
});


// Обробка видалення автора при POST-запиті.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  // Отримання деталей автора та всіх його книг (паралельно)
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (allBooksByAuthor.length > 0) {
    // У автора є книги. Відображення так само, як і для GET-маршруту.
    res.render("author_delete", {
      title: "Видалити автора",
      author: author,
      author_books: allBooksByAuthor,
    });
    return;
  } else {
    // У автора немає книг. Видалення об'єкта та перенаправлення на список авторів.
    await Author.findByIdAndDelete(req.body.authorid);
    res.redirect("/catalog/authors");
  }
});
  
  // Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
  const author = await Author.findById(req.params.id);
  if (!author) {
    return res.redirect('/catalog/authors');
  }
  res.render('author_form', { title: 'Редагувати автора', author });
});


// Handle Author update on POST.
exports.author_update_post = [
  // валідація/санітизація...
  asyncHandler(async (req, res, next) => {
    const auth = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      _id: req.params.id,
    });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('author_form', {
        title: 'Редагувати автора',
        author: auth,
        errors: errors.array(),
      });
    }
    await Author.findByIdAndUpdate(req.params.id, auth);
    res.redirect(auth.url);
  })
];
  