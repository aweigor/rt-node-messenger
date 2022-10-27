import '../../styles/layout.css';
import { useNavigate } from "react-router-dom";

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
    </div>
  )
}

const UserControls = () => 
{
  const navigate = useNavigate();
  let userInfo: string | null = sessionStorage.getItem( 'identity' );

  if (!userInfo) {
    navigate( '/login' );
  }
  const identity: identityInterface = userInfo?JSON.parse( userInfo ):undefinedIdentity;

  return (
    <>
      <div className="user-controls">
        <span>{identity['username']}</span>
      </div>
    </>
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
          <UserControls/>
        </Header>
        
        <Content>
          { children }
        </Content>
      </Container>
    </>
  )
};