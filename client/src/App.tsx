import homePage from './pages/Home';
import loginPage from './pages/Login';
import Layout from './components/Layout';
import HttpClient from './services/http.fetch.client';
import AuthService from './services/auth.service';
import { useEffect } from 'react';

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom';

const routes = [
  {
    path: '/',
    title: 'Home',
    private: true,
    Component: homePage
  },
  {
    path: '/login',
    title: 'Login',
    private: false,
    Component: loginPage
  }
]
const RouterComponents = () => 
{
  const publicComponents = routes.filter( r => !r.private ).map( ( { path, Component }, index ) => 
  {
    const RouteComponent = () => 
    {
      return (
        <Layout routes={routes}>
          <Component/>
        </Layout>
      )
    }
    return <Route path={path} element={<RouteComponent/>} key={index}/>
  } );

  const privateComponents = routes.filter( r => r.private ).map( ( { path, Component }, index ) =>
  {
    const RouteComponent = () => 
    {
      const isLoggedIn = AuthService.isLoggedIn();
      
      return isLoggedIn ? (
        <Layout routes={routes}> <Component/> </Layout>
      ) : (
        <Navigate to='/login' replace={true} />
      )
    }
    return <Route path={path} element={<RouteComponent/>} key={index}/>
  } ) 

  return (<Routes>{publicComponents}{privateComponents}</Routes>);
}

interface apiErrorInterface {
  code: number,
  message: string
}

interface identityInterface {
  username: string,
  password: string
}

interface apiUserGetResponseInterface {
  error: apiErrorInterface | undefined,
  data: identityInterface
}


function App() 
{
  return (
    <>
      <Router>
        <RouterComponents />
      </Router>
    </>
  )
}



export default App;