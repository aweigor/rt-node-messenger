const express = require('express');
const uuid = require('uuid').v4;
const session = require('express-session');
const FileStore = require('./auth/session-store')(session);
const bodyParser = require('body-parser');
const passport = require('passport');
const AnonymJSONStrategy = require('./auth/passport-anonym-json/lib/index').Strategy;

// Use the BasicStrategy within Passport.
//   This is used as a fallback in requests that prefer authentication, but
//   support unauthenticated clients.
passport.use(new AnonymJSONStrategy(
  { 
    identityField: 'email',
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

// add & configure middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({
  genid: (req) => {
    return uuid() // use UUIDs for session IDs
  },
  store: new FileStore(),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());

// create the homepage route at '/'
app.get('/', (req, res) => {
  res.send(`You got home page!\n`)
})

// create the login get and post routes
app.get('/login', (req, res) => {
  res.send(`You got the login page!\n`)
})

app.post('/login', (req, res, next) => {
  passport.authenticate(['anonymIdentity'], (err, user, info) => 
  {
    if (info) { return res.send(info.message) }
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.login(user, (err) => {
      if (err) { return next(err); }
      return res.redirect('/authrequired');
    })
  })(req, res, next);
})

app.get('/authrequired', (req, res) => {
  if(req.isAuthenticated()) 
  {
    res.send( `Hello! ${req.user.email}\n` )
  } else {
    res.redirect('/')
  }
})

// tell the server what port to listen on
app.listen(3000, () => {
  console.log('Listening on localhost:3000')
})