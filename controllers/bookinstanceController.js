const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find()
    .populate("book")
    .exec();
  res.render("bookinstance_list", {
    title: "Список екземплярів книг",
    bookinstance_list: allBookInstances,
  });
});

exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  // Шукаємо екземпляр за id та підвантажуємо пов'язану книгу
  const bookinstance = await BookInstance.findById(req.params.id)
      .populate("book")
      .exec();

  if (!bookinstance) {
    const err = new Error("Екземпляр книги не знайдено");
    err.status = 404;
    return next(err);
  }

  // Рендеримо шаблон із передачею знайденого об'єкта
  res.render("bookinstance_detail", {
    title: "Інформація про екземпляр",
    bookinstance,
  });
});


// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  // Завантажуємо всі книги, відсортувавши їх за назвою
  const allBooks = await Book.find().sort({ title: 1 }).exec();
  // Рендеримо форму з передачею списку книг і заголовку
  res.render("bookinstance_form", {
    title: "Створити екземпляр книги",
    book_list: allBooks,
  });
});


exports.bookinstance_create_post = [
  // 1) Валідація та очищення полів
  body("book", "Книга обов'язкова.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
  body("imprint", "Видавництво обов'язкове.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
  body("status")
      .optional()
      .escape(),
  body("due_back", "Недійсна дата повернення.")
      .optional({ checkFalsy: true })
      .isISO8601()
      .toDate(),

  // 2) Обробка після валідації
  asyncHandler(async (req, res, next) => {
    // Отримуємо результати валідації
    const errors = validationResult(req);

    // Створюємо об'єкт BookInstance на основі req.body
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      // Є помилки — заново підвантажуємо список книг для селекта
      const allBooks = await Book.find().sort({ title: 1 }).exec();
      // Позначаємо поточне обране значення
      res.render("bookinstance_form", {
        title: "Створити екземпляр книги",
        book_list: allBooks,
        selected_book: req.body.book,
        bookinstance: bookInstance,
        errors: errors.array(),
      });
    } else {
      // Дані коректні — зберігаємо та редіректимо
      await bookInstance.save();
      res.redirect(bookInstance.url);
    }
  }),
];


// GET /catalog/bookinstance/:id/delete
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const instance = await BookInstance.findById(req.params.id).populate('book').exec();
  if (!instance) {
    return res.redirect('/catalog/bookinstances');
  }
  res.render('bookinstance_delete', {
    title: 'Видалити екземпляр',
    instance,
  });
});

// POST /catalog/bookinstance/:id/delete
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  const instance = await BookInstance.findById(req.body.instanceid).populate('book');
  if (!instance) {
    return res.redirect('/catalog/bookinstances');
  }
  const bookUrl = instance.book.url;
  await BookInstance.findByIdAndDelete(req.body.instanceid);
  res.redirect(bookUrl);
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  const [instance, allBooks] = await Promise.all([
    BookInstance.findById(req.params.id).exec(),
    Book.find().exec(),
  ]);
  if (!instance) {
    return res.redirect('/catalog/bookinstances');
  }
  res.render('bookinstance_form', {
    title: 'Редагувати екземпляр',
    bookinstance: instance,
    book_list: allBooks,
  });
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  // валідація/санітизація полів...
  asyncHandler(async (req, res, next) => {
    const inst = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id, // важливо для оновлення
    });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const allBooks = await Book.find().exec();
      return res.render('bookinstance_form', {
        title: 'Редагувати екземпляр',
        bookinstance: inst,
        book_list: allBooks,
        errors: errors.array(),
      });
    }
    await BookInstance.findByIdAndUpdate(req.params.id, inst);
    res.redirect(inst.url);
  })
];