const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
require('dotenv').config();

const routes = express();

// handle POST Request
routes.use(express.json());

// redirect routes
routes.get('/', (req, res) => res.redirect('/signin'));

// sign-up page
// post request
routes.post('/signup', async (req, res) => {
  // hash password using bcrypt
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

  // make document from moongose schema
  const newUser = new User({
    email: req.body.email,
    username: req.body.username,
    password: hashedPassword,
  });

  // save to database
  newUser.save((err) => {
    if (err) {
      return res.status(500).json({
        error: true,
        statusCode: '500',
        message: err,
      });
    }
    res.status(200).json({
      error: false,
      statusCode: '200',
      message: 'successfully created user',
    });
  });
});

// sign-in page
routes.post('/signin', async (req, res) => {
  // find user by email
  const { email, password } = req.body;
  const getUser = await User.findOne({ email });

  // check password login user using bcrypt compare
  bcrypt.compare(password, getUser.password, async (err, result) => {
    if (result === false) {
      return res.status(400).json({
        error: true,
        statusCode: '400',
        message: err,
      });
    }

    // storing user data for making jw token
    const payload = { email: getUser.email, username: getUser.username };
    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h', algorithm: 'HS256' });

    // return data
    res.status(200).json({
      error: false,
      statusCode: '200',
      message: 'Login Successfully',
      token,
    });
  });
});

// verify jwt and extract information from it
routes.use((req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];

    // check jw token and send it to another routes
    jwt.verify(bearerToken, process.env.SECRET_KEY, (err, result) => {
      if (err) {
        return res.status(400).json({
          error: true,
          statusCode: '400',
          message: err,
        });
      }

      req.data = result;
      next();
    });
  } else {
    res.status(403);
  }
});

routes.get('/homepage', (req, res) => {
  const getUser = req.data;
  res.send(`hello ${getUser.username}`);
});

module.exports = routes;
