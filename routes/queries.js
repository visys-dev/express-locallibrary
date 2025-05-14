const express = require('express');
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");

// --- /author ---
router.get('/author', async function (req, res, next) {
  const firstName = req.query["first_name"];
  const familyName = req.query["family_name"];

  let query = {};
  if (firstName) query.first_name = new RegExp(firstName, "i");
  if (familyName) query.family_name = new RegExp(familyName, "i");

  try {
    const authors = await Author.find(query);

    let result = "";

    if (authors.length > 0) {
      result = `<ul>${authors
        .map((author) => `<li>${author.first_name} ${author.family_name}</li>`)
        .join("")}</ul>`;
    } else {
      result = "<h1>Not found</h1>";
    }

    res.send(result);
  } catch (err) {
    next(err);
  }
});

// --- /books ---
router.get('/books', async function (req, res, next) {
  const title = req.query["title"];
  const query = {};

  if (title) {
    query.title = new RegExp(title, "i");
  }

  try {
    const books = await Book.find(query).populate("author");

    let result = "";

    if (books.length > 0) {
      result = `<ul>${books
        .map((book) => {
          const author = book.author;
          const authorName = author ? `${author.first_name} ${author.family_name}` : "Unknown";
          return `<li>${book.title} by ${authorName}</li>`;
        })
        .join("")}</ul>`;
    } else {
      result = "<h1>Not found</h1>";
    }

    res.send(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
