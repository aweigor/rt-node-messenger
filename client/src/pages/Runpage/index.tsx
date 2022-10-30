import { useEffect, useRef, useState, useContext } from 'react';
import '../../styles/home.css';
import { HttpClient, AuthService, UserContext, WebsocketService } from '../../services';

const ws_url = 'ws://localhost:8000/ws';
const ws = new WebsocketService( ws_url );

const ContactSelect = ( {onChange}:any ) => {
  const [contacts,setContacts] = useState<string[]>(['']);
  const [selectedContact,setSelectedContact] = useState<string>('');
  
  useEffect( () => {
    HttpClient.post( '/contactlist' ).then( (res:any) => 
    {
      if (res.error||!res.data) return;

      console.log( 'contact list', res )

      try {
        const contacts = res.data;
        
        setContacts( ['',...contacts]  );
      } catch (err) {}

    } )
  },[] )

  const handleOnchange = function (event:any) {

    const prevValue = selectedContact;
    const currentValue = event.target.value;
    onChange( prevValue, currentValue );

    setSelectedContact(currentValue);
  }

  return (
    <>
    <form>
      <select onChange={handleOnchange} value={selectedContact}>
        { contacts.map( c => <option value={c} selected={selectedContact == c}>{c}</option> ) }
      </select>
      </form>
    </>
  )
}

export default () => {

  const { userInfo } = useContext( UserContext );

  const [messages, addMessage] = useState<any[]>([]);
  const [listenTarget, setListenTarget] = useState<string|null>(null)
  const inputEl = useRef<HTMLTextAreaElement | null>(null);
  const outputEl = useRef<HTMLTextAreaElement | null>(null);

  const  handleInput = function ( event: any ) {
    
    const value = event.nativeEvent.data;
    ws.commit( 'input', value );
    
  };

  const handleContactChange = function ( prevTarget:any, currentTarget:any ) {
    ws.commit( 'listen', {prevTarget, currentTarget} )
    setListenTarget(currentTarget);
  }

  useEffect( () => {
    
    const handleConnection = ( isConnected: any ) => {
      if ( isConnected ) ws.commit( 'listen', 
        {prevValue:null, currentValue:listenTarget}
      );
    }

    const handleMessage = ( message: any ) => {
      addMessage( ( prevState: any[] ) => [...prevState, message] );
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
        <ContactSelect onChange={handleContactChange}/>
      </div>
      <div>
        <textarea rows={10} cols={45} onChange={handleInput} ref={outputEl} name="outcommingmessage"/>
        <textarea rows={10} cols={45} value={messages.join('')} ref={inputEl} name="incomming_message"/>
      </div>
    </>
  )
}