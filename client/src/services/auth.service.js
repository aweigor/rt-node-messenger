import { createContext } from 'react';

const userContext = createContext();

const AuthService = {

  userInfo: {},

  logIn ( formData ) {
    const scope = this;

    return new Promise( (resolve, reject) => {
      if (!scope.client) reject( 'no client provided' );

      scope.client.post( '/login', {
        username:formData.username
      } )
      .then( ( res ) => {
        if ( !res.error ) {
          console.log( 'logged in', res )
          scope.userInfo = res.data;
          resolve( res );
        } else {
          reject( res.error )
        }
      } )
      .finally( () => { resolve(null) } )
    } )
  },

  logOut () {},

  init ( client, { loginUrl, logoutUrl } ) {
    const scope = this;
    
    this.client = client;
    this.loginUrl = loginUrl;
    this.logoutUrl = logoutUrl;

    return new Promise( async (resolve, reject) => {
      const res = await scope.getUserData();

      if ( !res.error ) {
        console.log( res )
      } else {
        console.log( res )
      }

      resolve( userContext )
    } )
  },

  async getUserData () {
    const scope = this;
    return await scope.client.post( '/user' );
  },

  get isLoggedIn () {
    const scope = this;

    let isLoggedIn = false;

    ( async () => {
      const res = await scope.getUserData();

      if ( !res.error ) {
        isLoggedIn = true;
      }

    } ) ()
    return isLoggedIn;
  }
}

export { AuthService }