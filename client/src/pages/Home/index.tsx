import { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { HttpClient, AuthService, UserContext } from '../../services';

export default () => 
{
  const navigate = useNavigate();

  const inputEl = useRef<HTMLInputElement | null>(null);

  const { userInfo } = useContext( UserContext );
  console.log( userInfo )

  const onButtonClick = function (e: any) {
    e.preventDefault();
    e.stopPropagation();

    // `current` points to the mounted text input element
    const username : string = inputEl.current?inputEl.current.value:'';

    AuthService.logIn( { username } )
    .then( 
      ( res:any ) => { navigate( res.redirect_url ); },
      ( error ) => { console.error( error ) } 
    )
      
  };

  const UserControls = () => 
  {
    const { userInfo } = useContext( UserContext );

    return (
      <div className="">
        <span>{userInfo['username']}</span>
        <form action='logout' method='post'>
          <input type='submit' value='logout'/>
        </form>
      </div>
    ) 
    
  }

  if (userInfo.loggedIn) {
    return (<>{UserControls()}</>)
  }
  return (
    <form name="publish">
      <input type="text" ref={inputEl} name="Имя"/>
      <input type="submit" onClick={onButtonClick} value="Вход"/>
    </form>
  )
  
}