import { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import {HttpClient} from '../../services';

const client = HttpClient;

export default () => 
{
  const navigate = useNavigate();

  const inputEl = useRef<HTMLInputElement | null>(null);

  const onButtonClick = function (e: any) {
    e.preventDefault();
    e.stopPropagation();

    // `current` points to the mounted text input element
    const username : string = inputEl.current?inputEl.current.value:'';
    
    client.post( '/login', {
      username:username
    } ).then( ( res:any ) => {
      if ( !res.error ) {
        navigate( res.redirect_url );
      } else {
        console.error( res.error.message )
      }
    } )
      
  };

  return (
    <form name="publish">
      <input type="text" ref={inputEl} name="Имя"/>
      <input type="submit" onClick={onButtonClick} value="Вход"/>
    </form>
  )
}