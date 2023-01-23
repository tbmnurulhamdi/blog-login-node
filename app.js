const express = require('express'); // Lakukan import paket `express` setelah melakukan npm install express  di terminal
const mysql = require('mysql'); // npm install mysql
const session = require('express-session'); // Lakukan import paket `express-session` setelah melakukan npm install session di terminal
const app = express(); // definisikan express() kedalam variabel app

app.use(express.static('public')); //memberitahu ke express bahwa kita memiliki folder public yg bisa di akses siapapun karena defaultnya kita tidak bisa akses file2 static
app.use(express.urlencoded({extended: false}));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'progate',
  password: '',
  database: 'blog'
});

// code untuk menggunakan `express-session`
app.use(
  session({
    secret: 'my_secret_key',
    resave: false,
    saveUninitialized: false,
  })
);

// memulai session
// next yang diterima sebagai parameter function handler dalam function app.use dapat digunakan sebagai function dalam proses routing. Ketika function next dijalankan, Anda dapat menjalankan proses selanjutnya yang sesuai dengan request.
app.use((req, res, next) => {
  if (req.session.userId === undefined) { // jika userid tidak ditemukan

    res.locals.username = 'Tamu'; // maka ditetapkan sebagai tamu

    res.locals.isLoggedIn = false; // menetapkan property IsLoggedIn di object locals sebagai false jika tidak login

  } else {
    res.locals.username = req.session.username; // mengambil property username dan menetapkannya ketika login

    res.locals.isLoggedIn = true; // menetapkan property IsLoggedIn di object locals sebagai true jika login
  }
  next();
});

app.get('/', (req, res) => {
  res.render('top.ejs');
});

app.get('/list', (req, res) => {
  connection.query(
    'SELECT * FROM articles',
    (error, results) => {
      res.render('list.ejs', { articles: results }); // menetapkan property articles sebagai perwakilan table
    }
  );
});

app.get('/article/:id', (req, res) => {
  const id = req.params.id; // Tetapkan parameter id dari list pada constant id
  connection.query(
    'SELECT * FROM articles WHERE id = ?',
    [id],
    (error, results) => {
      res.render('article.ejs', { article: results[0] }); // menetapkan property article sebagai perwakilan table
    }
  );
});

// ini merupakan route login untuk mengakses login.ejs dengan method get
app.get('/login', (req, res) => {

  // saat mengklik login di menu list akan diteruskan ke hal login
  res.render('login.ejs');

});

// ini adalah route untuk autentikasi user login
app.post('/login', (req, res) => {
  // memulai autentikasi user
  const email = req.body.email; // Tetapkan nilai email dari form pada constant `email`

  connection.query(
    'SELECT * FROM users WHERE email = ?', // query untuk mendapatkan info user
    [email],

    (error, results) => { 
      // memisahkan proses berdasarkan banyaknya element-element dalam array `results
      if (results.length > 0) {
        if (req.body.password === results[0].password){ // jika password benar maka login

          req.session.userId = results[0].id; // menjadikan id sebagai paramater session

          req.session.username = results[0].username; // mengimpan username pada property session

          res.redirect('/list'); // dan dialihkan kehalaman list
        } else {
          res.redirect('/login'); // jika gagal akan kembali ke login
        }    
      } else {
        res.redirect('/login'); // kembali ke login
      }
    }
  );
});

app.get('/logout', (req, res) => {
  // proses penghapusan property-property session
  req.session.destroy((error) => {
    res.redirect('/list'); // setelah eksekusi dilakukan akan dialihkan kembali
  });
});

app.listen(3000); // akses localhost:3000 setelah perintah npm runstart

