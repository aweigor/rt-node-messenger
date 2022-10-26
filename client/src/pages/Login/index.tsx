import { useEffect, useRef, useState } from 'react';
import HttpClient from '../../services/http.fetch.client';

const baseUrl = '';
const client = new HttpClient( baseUrl );

export default () => {

  const inputEl = useRef<HTMLInputElement | null>(null);

  const onButtonClick = function (e: any) {
    e.preventDefault();
    e.stopPropagation();

    // `current` points to the mounted text input element
    const username : string = inputEl.current?inputEl.current.value:'';

    client.post( '/login', {
      username:username
    } ).then( res => {
      console.log( 'LOGIN RESULT', res );
    } )
      
  };


  return (
    <form name="publish">
      <input type="text" ref={inputEl} name="Имя"/>
      <input type="submit" onClick={onButtonClick} value="Вход"/>
    </form>
  )
}