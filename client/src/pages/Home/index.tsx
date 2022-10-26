import { useEffect, useRef, useState } from 'react';
import '../../styles/home.css';

let url ='ws://localhost:8000/ws';
const socket = new WebSocket(url);

export default () => {

  const [messages, addMessage] = useState<any[]>([]);
  const inputEl = useRef<HTMLTextAreaElement | null>(null);
  const outputEl = useRef<HTMLTextAreaElement | null>(null);
  const scope = this;

  const onButtonClick = function (e: any) {
    e.preventDefault();
    e.stopPropagation();

    // `current` points to the mounted text input element
    const message : string = inputEl.current?inputEl.current.value:'';

    console.log( "BUTTON CLICKED", socket )

    if (socket) {
      socket.send(message)
    }
    
  };

  const  handleInput = function ( event: any ) {
    
    let data = event.nativeEvent.data;
    console.log( 'handling input...', event, socket, data );
    if (socket) {
      socket.send( JSON.stringify({
        type: 'input',
        data: data
      }) );
    }
    
  };

  useEffect( () => {
    
    socket.onmessage = function(event:any) {
      let incomingMessage = event.data;

      console.log( "socket onmessage", incomingMessage )

      addMessage( ( prevState: any[] ) => [...prevState, incomingMessage] );
    };

    socket.onclose = ( event:any ) => console.log(`Closed ${event.code}`);

    return () => {};
  },[] )

  return (
    <>
      <div>
        <textarea rows={10} cols={45} onChange={handleInput} ref={outputEl} name="outcommingmessage"/>
        <textarea rows={10} cols={45} onChange={handleInput} ref={inputEl} name="incomming_message"/>

        { messages.map( function (message, index) {
            console.log( "MESSAGE", message )
            return (<div key={index}>{message}</div>)
          } ) 
        }
      </div>
    </>
  )
}