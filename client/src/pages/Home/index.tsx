import { useEffect, useRef, useState } from 'react';

let url ='ws://localhost:8080/ws';
const socket = new WebSocket(url);

export default () => {

  const [messages, addMessage] = useState<any[]>([]);
  const inputEl = useRef<HTMLInputElement | null>(null);
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
  

  useEffect( () => {
    
    socket.onmessage = function(event:any) {
      let incomingMessage = event.data;

      console.log( "socket onmessage", incomingMessage )

      addMessage( ( prevState: any[] ) => [...prevState, incomingMessage] );
    };

    socket.onclose = (event:any) => console.log(`Closed ${event.code}`);

    return () => {};
  },[] )

  return (
    <>
      <div>
        <form name="publish">
          <input type="text" ref={inputEl} name="message"/>
          <input type="submit" onClick={onButtonClick} value="Send"/>
        </form>
        { messages.map( function (message, index) {
            console.log( "MESSAGE", message )
            return (<div key={index}>{message}</div>)
          } ) 
        }
      </div>
    </>
  )
}