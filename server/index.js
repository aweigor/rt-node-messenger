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

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done( null, user );
});

const app = express();
const httpServer = createServer(app);

const sessionMiddleware = session({
  genid: () => uuid(),
  store: new FileStore(),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
})

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
    console.log( 'session works', req.session )
    res.sendFile(path.join(__dirname, "../client", "build", "index.html"));  
  } else {
    res.redirect('/' );
  }
} );


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
      res.send( { redirect_url: '/runpage',data:user } );
    })
  })(req, res, next);
})

app.post('/logout', ( req, res, next ) => {
  req.logout( function( err ) {
    if ( err ) return next( err );
    res.redirect('/');
  } )
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

app.post( '/contactlist', ( req, res, next ) => {
  if(req.isAuthenticated()) {
    
    req.sessionStore.map( ( err, sessions_list ) => {
      if (!err) {
        console.log ( 'get contacts', );
        if ( !sessions_list ) return res.send( { error : 'storage error' } );
        res.send( { error :null, data: Object.keys( sessions_list ) } );
      } else {
        res.send( { error :res } );
      }
    } )
  } else {
    return next();
  }
} )



const WebsocketMiddleware = function( socket ) {

  const ws = socket;

  const commutations = Object.create( null );
  const clients = new Set();
  
  this.broadcast = function ( message, req ) {

    function broadcastMessage ( identity, scope ) {
      const commutationList = commutations[ identity.username ];

      if ( commutationList&&commutationList.length ) {

        const removalIds = [];

        for ( let i = 0, socket; i < commutationList.length; i++  ) {

          socket = commutationList[i];

          if ( !clients.has( socket ) ) {
            removalIds.push( i );
          } else {
            socket.send( JSON.stringify( {
              type: 'message',
              value: message
            } ) );
          }
        }

        if ( removalIds.length ) 
          commutations[ identity.username ] = scope.reap( commutationList, removalIds )
      }
    }

    sessionMiddleware( req, {}, function() {
      
      broadcastMessage( req.session.passport.user, scope );
      
    } )
  }

  this.reap = function ( arr, removalIds ) {
    let reaped = [];

    if ( arr instanceof Array ) {
      
      reaped = [...arr];

      for ( let i = removalIds.length - 1; i >= 0; i-- ) {
        reaped.splice( removalIds[i],1 );
      }

    }

    return reaped;
  }

  const scope = this;

  ws.on( 'connection', (socket, req) => {

    
    clients.add( socket );

    socket.send( JSON.stringify({
      type: 'connected',
      value: true
    }) )

    socket.on( 'message', function ( message ) 
    {
      try {
        message = JSON.parse( message );

        if ( message.type === 'listen' ) 
        {
          
          if ( !message.value ) return;
          
          const {prevTarget, currentTarget} = message.value;

          if ( !currentTarget ) return;
          
          if ( !commutations[ currentTarget ] ) 
            commutations[ currentTarget ] = [];
          
          commutations[ currentTarget ].push(socket);


          // remove prev
          if ( commutations[ prevTarget ] ) {
            const removalId = commutations[ prevTarget ].indexOf( socket );
            if ( removalId !== -1 ) {
              commutations[ prevTarget ].splice( removalId, 1 );
            }
          }

        } else if (message.type === 'input') 
        {
          scope.broadcast( message.value, req );

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
  

  return function (req, res) {

  }
  
}

const wss = new Server({server: httpServer});
app.use( WebsocketMiddleware( wss ) );


httpServer.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});