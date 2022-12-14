import { createContext } from 'react';

const AuthService = {

  userInfo: { loggedIn: false, username: null },

  logIn ( formData ) {
    const scope = this;

    return new Promise( (resolve, reject) => {
      if (!scope.client) reject( 'no client provided' );

      scope.client.post( '/login', formData )
      .then( ( res ) => {
        if ( !res.error ) {
          scope.userInfo = res.data;

          scope.userInfo.loggedIn = true;

          this._onUserStatusChanged&&this._onUserStatusChanged( scope.userInfo )
          resolve( res );
        } else {
          reject( res.error )
        }
      } )
      .finally( () => { resolve(null) } )
    } )
  },

  logOut () {
    const scope = this;


    return new Promise( (resolve, reject) => {
      if (!scope.client) reject( 'no client provided' );

      scope.client.post( '/logout' )
      .then( ( res ) => {
        resolve ( res );
      } )
      .finally( () => { resolve(null) } )
    } )
  },

  init ( client, { loginUrl, logoutUrl } ) {
    const scope = this;
    
    this.client = client;
    this.loginUrl = loginUrl;
    this.logoutUrl = logoutUrl;

    return new Promise( async (resolve, reject) => {
      const res = await scope.getUserData();

      if ( !res.error&&res.data ) {
        scope.userInfo = res.data;
        scope.userInfo.loggedIn = true;
      } else {
        console.log( res )
      }

      resolve( scope.userInfo )
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
  },

  onUserStatusChanged ( callback ) {
    AuthService._onUserStatusChanged = callback;
  }
}

const UserContext = createContext({
  userInfo:AuthService.userInfo
});

export { AuthService, UserContext }