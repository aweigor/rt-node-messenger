import homePage from './pages/Home';
import runPage from './pages/Runpage';
import Layout from './components/Layout';
import { useEffect,useState } from 'react';
import { AuthService, HttpClient, UserContext } from './services';

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
    path: '/runpage',
    title: 'Runpage',
    private: false,
    Component: runPage
  }
]
const RouterComponents = ({ userInfo }: any  ) => 
{
  const publicComponents = routes.filter( r => true ).map( ( { path, Component }, index ) => 
  {
    const RouteComponent = () => 
    {
      return (
          <Layout routes={routes}>
            <UserContext.Provider value={{ userInfo }}>
              <Component/>
            </UserContext.Provider>
          </Layout>
      )
    }
    return <Route path={path} element={<RouteComponent/>} key={index}/>
  } );

  const privateComponents = routes.filter( r => false ).map( ( { path, Component }, index ) =>
  {
    const RouteComponent = () => 
    {
      const isLoggedIn = AuthService.isLoggedIn;
      
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


function App( { identity,onUserStatusChanged }: any ) 
{

  const [userInfo, setUserInfo] = useState(identity);

  onUserStatusChanged( (identity:any) => {
    setUserInfo( identity );
  } )

  return (
    <>
      <Router>
        <RouterComponents userInfo={userInfo}/>
      </Router>
    </>
  )
}



export default App;