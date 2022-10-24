import homePage from './pages/Home';
import loginPage from './pages/Login';
import Layout from './components/Layout';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from 'react-router-dom';

const routes = [
  {
    path: '/',
    title: 'Home',
    Component: homePage
  },
  {
    path: '/login',
    title: 'Login',
    Component: loginPage
  }
]

const RouterComponents = () => 
{
  const routeComponents = routes.map( ( { path, Component }, index ) => 
  {
    const RouteComponent = () => {
      return (
        <Layout routes={routes}>
          <Component/>
        </Layout>
      )
    }
    return <Route path={path} element={<RouteComponent/>} key={index}/>
  } );

  return (<Routes>{routeComponents}</Routes>);
}

function App() {
  return (
    <>
      <Router>
        <RouterComponents />
      </Router>
    </>
  )
}

export default App;