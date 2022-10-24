const path = require("path");
const express = require('express');
const uuid = require('uuid').v4;
const session = require('express-session');
const FileStore = require('./lib/auth/session-file-store')(session);
const bodyParser = require('body-parser');
const passport = require('passport');
const { Server } =require('socket.io');
const { createServer } = require('http');
const AnonymJSONStrategy = require('./lib/auth/passport-local-custom/lib').Strategy;

const port = 8000;

// Use the BasicStrategy within Passport.
//   This is used as a fallback in requests that prefer authentication, but
//   support unauthenticated clients.
passport.use(new AnonymJSONStrategy(
  { 
    identityField: 'username',
    extraFields: [ 'password' ]
  },
  (req, {user,identity}, done) => {
    req.sessionStore.find( identity, ( err, data ) => {
      if ( !err && !data ) {
        done(null, user);
      } else if (data) {
        done( null, false, { message: 'User already exists.\n' } );
      } else {
        done( err )
      }
    } )
  }
));

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done( null, user );
});

// create the server
const app = express();
const httpServer = createServer(app);

const sessionMiddleware = session({
  genid: () => uuid(),
  store: new FileStore(),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
})

// add & configure middleware

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, '../client/build')));
app.use(express.static("public"));

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "../client", "build", "index.html"));
});

/*
// create the homepage route at '/'
app.get('/', (req, res) => {
  res.send(`You got home page!\n`)
})

// create the login get and post routes
app.get('/login', (req, res) => {
  res.send(`You got the login page!\n`)
})
*/

app.post('/login', (req, res, next) => {
  passport.authenticate(['anonymIdentity'], (err, user, info) => 
  {
    if (info) { return res.send(info.message) }
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.login(user, (err) => {
      if (err) { return next(err); }
      //req.session.authenticated = true;
      //res.status(204).end();
      res.redirect('/');
      return true;
    })
  })(req, res, next);
})

/*
app.get('/authrequired', (req, res) => {
  if(req.isAuthenticated()) 
  {
    res.send( `Hello! ${req.user.email}\n` )
  } else {
    res.redirect('/')
  }
})
*/

const io = new Server(httpServer);

// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

// only allow authenticated users
io.use((socket, next) => {
  if (socket.request.user) {
    next();
  } else {
    next(new Error('unauthorized'))
  }
});

io.on("connection", (socket) => {
  console.log(socket.request.session);
});

httpServer.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});