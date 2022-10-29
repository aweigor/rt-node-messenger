import '../../styles/layout.css';
import { useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { UserContext, AuthService } from '../../services'

const undefinedIdentity = {
  username: '',
  password: ''
}

interface identityInterface {
  username: string,
  password: string
}

const Container = ( { children } : {children: any} ) => 
{
  return (
    <div className='app-container'>
      { children }
    </div>
  )
}

const Content = ({ children } : {children: any}) => 
{
  return (
    <div className='app-content'>
      { children }
    </div>
  )
}

const Navbar = ( { routes } : {routes: any} ) => 
{  
  const navItems = routes
    .filter( (item:any) => item.title&&item.title.length )
    .map( ( item:any, index:any ) => 
    (
      <li key={ index }>
        <a href={item.path}> { item.title } </a>
        
      </li> 
    ) )

  return (
    <div className='app-navigation'>
      <ul> { navItems } </ul>
      <UserControls/>
    </div>
  )
}

const UserControls = () => 
{
  const { userInfo } = useContext( UserContext );

  const controls = ( userInfo:any ) => {
    if (userInfo.loggedIn) {
      return (
        <>
          <span>{userInfo['username']}</span>
          <form action='logout' method='post'>
            <input type='submit' value='logout'/>
          </form>
        </>
      )
    }
    return (<></>)
  }

  return (
    <div className="user-controls">
      {controls(userInfo)}
    </div>
  ) 
  
}

const Header = ( { children }: any ) => {

  return (
    <>
      <div className='app-header'>
        { children }
      </div>
    </>
  )
}

export default ({ children, routes } : { children:any, routes:any }) => 
{
  return (
    <>
      <Container>
        <Header>
          <Navbar routes = { routes }/>
        </Header>
        
        <Content>
          { children }
        </Content>
      </Container>
    </>
  )
};