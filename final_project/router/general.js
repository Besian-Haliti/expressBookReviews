const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users.find(user => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.json(JSON.parse(JSON.stringify(books)));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  
  if (books[isbn]) {
    res.json(books[isbn]);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;

  const booksByAuthor = Object.values(books).filter(book =>
    book.author.toLowerCase().includes(author.toLowerCase())
  );

  if (booksByAuthor.length > 0) {
    res.json(booksByAuthor);
  } else {
    res.status(404).json({ message: "No books found by this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;

  const booksByTitle = Object.values(books).filter(book =>
    book.title.toLowerCase().includes(title.toLowerCase())
  );

  if (booksByTitle.length > 0) {
    res.json(booksByTitle);
  } else {
    res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    const reviews = books[isbn].reviews;
    
    if (Object.keys(reviews).length > 0) {
      res.json(reviews);
    } else {
      res.status(404).json({ message: "No reviews yet for this book" });
    }
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

public_users.get('/async-books', function (req, res) {
    axios.get('http://localhost:5000/')
        .then(response => {
            res.json(response.data);
        })
        .catch(error => {
            res.status(500).json({ message: "Error fetching book list", error: error.message });
        });
});

// Using Promise callbacks to fetch book details by ISBN
public_users.get('/async-isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    axios.get(`http://localhost:5000/isbn/${isbn}`)
        .then(response => {
            res.json(response.data);
        })
        .catch(error => {
            res.status(500).json({ message: "Error fetching book details", error: error.message });
        });
});

// Using async-await to fetch book details by author
public_users.get('/async-author/:author', async function (req, res) {
    const author = req.params.author;

    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books by author", error: error.message });
    }
});

public_users.get('/async-title/:title', function (req, res) {
    const title = req.params.title;

    axios.get(`http://localhost:5000/title/${title}`)
        .then(response => {
            res.json(response.data);
        })
        .catch(error => {
            res.status(500).json({ message: "Error fetching books by title", error: error.message });
        });
});

module.exports.general = public_users;
