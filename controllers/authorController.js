const Author = require("../models/author");
const Book = require('../models/book');
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

  
  // Display Author create form on GET.
  exports.author_create_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Author create GET");
  });
  
  // Handle Author create on POST.
  exports.author_create_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Author create POST");
  });
  
  // Display Author delete form on GET.
  exports.author_delete_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Author delete GET");
  });
  
  // Handle Author delete on POST.
  exports.author_delete_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Author delete POST");
  });
  
  // Display Author update form on GET.
  exports.author_update_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Author update GET");
  });

// Handle Author update on POST.
exports.author_update_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Author update POST");
  });
  