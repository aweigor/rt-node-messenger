
import { createContext } from 'react';



const userContext = createContext();

const getUserData = async function () {
  //return await client.post( '/user' );
}

export default class AuthService {
  
  constructor () {}

  static isLoggedIn () 
  {

    const identity = {
      authorized: false,
      userdata: {}
    };

    let isLoggedIn = false;

    ( async () => {
      const res = await getUserData();

      if ( !res.error ) {
        isLoggedIn = true;
        identity.authorized = true;
        identity.userdata = res.data;
      } else {
        identity.authorized = false;
        identity.userdata = {};
      }

    } ) ()

    console.log( 'is logged in', identity )
    return isLoggedIn;
  }

  
}

export { userContext }