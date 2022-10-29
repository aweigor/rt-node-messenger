import { useEffect, useRef, useState, useContext } from 'react';
import '../../styles/home.css';
import { HttpClient, AuthService, UserContext, WebsocketService } from '../../services';

const ws_url = 'ws://localhost:8000/ws';
const ws = new WebsocketService( ws_url );

export default () => {

  const { userInfo } = useContext( UserContext );

  const [messages, addMessage] = useState<any[]>([]);
  const inputEl = useRef<HTMLTextAreaElement | null>(null);
  const outputEl = useRef<HTMLTextAreaElement | null>(null);

  const  handleInput = function ( event: any ) {
    
    const value = event.nativeEvent.data;
    ws.commit( 'input', value );
    
  };

  useEffect( () => {

    const handleConnection = ( isConnected: any ) => {
      if ( isConnected ) ws.commit( 'listen', userInfo.username );
    }

    const handleMessage = ( message: any ) => {
      console.log( 'message handled!', message );

      //addMessage( ( prevState: any[] ) => [...prevState, incomingMessage] );
    }

    ws.on( 'connected', handleConnection );
    ws.on( 'message', handleMessage );

    const socket = ws.connect();

    socket.onclose = ( event:any ) => console.log(`Closed ${event.code}`);

    return () => {
      ws.off( 'connected', handleConnection );
    };
  },[] )

  return (
    <>
      <div>
        <textarea rows={10} cols={45} onChange={handleInput} ref={outputEl} name="outcommingmessage"/>
        <textarea rows={10} cols={45} ref={inputEl} name="incomming_message"/>

        { messages.map( function (message, index) {
            console.log( "MESSAGE", message )
            return (<div key={index}>{message}</div>)
          } ) 
        }
      </div>
    </>
  )
}