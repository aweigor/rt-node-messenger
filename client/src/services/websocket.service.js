class WebsocketService {
  constructor ( url ) {
    this._url = url
    this._state = 0;
    this._events = {};

    this.connect = function () {
      this._socket = new WebSocket( this._url )
      this._socket.onmessage = handleMessage;
      return this._socket;
    }
  
    this.on = function ( type, callback ) {
      if ( !scope._events[ type ] )
        scope._events[ type ] = [];
      
      scope._events[ type ].push( callback );
    }

    this.off = function ( type, callback ) {
      if (scope._events[ type ]) {
        const delIdx = scope._events[ type ].indexOf( callback );
        if ( delIdx !== -1 ) {
          scope._events[ type ].splice( delIdx, 1 );
        }
      }
    }

    this.commit = function ( type, message ) {
      if (this._socket) {
        this._socket.send( JSON.stringify( {
          type: type,
          value: message
        } ) );
      }
    }

    const scope = this;

    function handleMessage( e ) {
      console.log( 'handle websocket message', e )
      try {
        const message = JSON.parse( e.data );

        if (message.type) {
          scope._events[ message.type ].forEach( f => f( message.value ) )
        }

      } catch (err) {
        console.error (err)
      }
    }
  }

  
}

export { WebsocketService }