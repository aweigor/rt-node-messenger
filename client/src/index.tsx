import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthService, HttpClient, UserContext } from './services';

HttpClient.init( 'http://localhost:8000',{} );
AuthService.init( HttpClient, {
  loginUrl: '/login',
  logoutUrl: '/logout'
} ).then( (identity:any) => mountApp( identity ) )

function mountApp ( identity: any ) {

  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  root.render(
    <React.StrictMode>
        <App identity={identity} onUserStatusChanged={AuthService.onUserStatusChanged}/>
    </React.StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
