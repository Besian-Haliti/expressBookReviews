const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{"username": "john_doe","password": "securepassword123"}];

const isValid = (username)=>{ //returns boolean
    return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    const token = jwt.sign({ username }, "secret_key", { expiresIn: '1h' });
    req.session.token = token; // Saving JWT to session

    return res.status(200).json({ message: "Login successful", token });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.token && jwt.verify(req.session.token, "secret_key").username; 

  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }
  
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const token = req.session.token;

    if (!token) {
        return res.status(401).json({ message: "User not logged in" });
    }

    let username;
    try {
        const decoded = jwt.verify(token, "secret_key");
        username = decoded.username;
    } catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    const reviews = books[isbn].reviews;
    if (reviews[username]) {
        delete reviews[username];
        return res.status(200).json({ message: "Review deleted successfully", reviews });
    } else {
        return res.status(404).json({ message: "No review found for this user" });
    }
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;