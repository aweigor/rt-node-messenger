const path = require("path");
const express = require('express');
const uuid = require('uuid').v4;
const session = require('express-session');
const FileStore = require('./lib/session-file-store')(session);
const bodyParser = require('body-parser');
const passport = require('passport');
const { Server } =require('ws');
const { createServer } = require('http');
const AnonymJSONStrategy = require('./lib/passport-local-custom/lib').Strategy;

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
    console.log( 'creating session...' )
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
  saveUninitialized: false
})

// add & configure middleware

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, '../client/build')));

app.get( '/runpage', (req, res, next) => 
{
  if(req.isAuthenticated()) 
  {
    res.sendFile(path.join(__dirname, "../client", "build", "index.html"));  
  } else {
    res.redirect('/' );
  }
} );


/*
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "../client", "build", "index.html"));
});

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
  passport.authenticate(['local'], (err, user, info) => 
  {
    //if (info) { return res.send(info.message) }
    if (err) { return next(err); }
    if (!user) {
      if ( info ) {
        return res.send( { error: 1, message: info[0].message } )
      }
      console.log( 'no user provided' )  
    }
    req.login(user, (err) => {
      if (err) { return next(err); }
      res.send( { redirect_url: '/runpage' } );
    })
  })(req, res, next);
})

app.post( '/user', ( req, res, next ) => 
{
  if(req.isAuthenticated()) {
    res.send( { data: req.user } );
  } else {
    res.send( { error: { code: 401, message: 'unauthorized' } } );
  }
  return next();
} )

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

const Broadcast = require( './src/broadcast.js' );
const broadcast = new Broadcast();

const WebsocketMiddleware = function( req, res ) {

  this.commutations = Object.create( null );
  this.clients = new Set();

  this.broadcast = function ( message, sessionId ) {
    const commutationList = scope.commutations[ sessionId ];

    if ( commutationList&&commutationList.length ) {

      const removalIds = [];

      for ( let i = 0, socket; i < commutationList.length; i++  ) {

        socket = commutationList[i];

        if ( !scope.clients.has( socket ) ) {
          removalIds.push( i );
        } else {
          socket.send( message );
        }
      }

      if ( removalIds.length ) 
        scope.commutations[ sessionId ] = scope.reap( commutationList, removalIds )
    }
  }

  this.reap = function ( arr, removelIds ) {
    let reaped = [];

    if ( arr instanceof Array ) {
      
      reaped = JSON.decode( JSON.encode(arr) );

      for ( let i = removelIds.length - 1; i >= 0; i-- ) {
        reaped.splice( removalIds[i],1 );
      }

    }

    return reaped;
  }

  const scope = this;
  const ws = new Server({server: httpServer});

  ws.on( 'connection', (socket) => {

    clients.add( socket );

    socket.on( 'message', function ( message ) 
    {
      try {
        message = JSON.parse( message );

        if ( message.type === 'listen' ) 
        {
          if ( !message.data ) return;
          if ( !commutations[ message.data ] ) 
            commutations[ message.data ] = [];
          
          commutations[ message.data ].push(socket);

        } else if (message.type === 'commit') 
        {

          scope.broadcast( message.data, socket.session.Id );

        } else {

          throw new Error();

        }
      } catch( err ) {

        console.error( err );

      }
    } )

    socket.on( 'close', function () {
      clients.delete( socket );
    } )
    
  });
}

app.use( WebsocketMiddleware );


httpServer.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});