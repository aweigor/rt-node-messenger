import '../../styles/layout.css';

const Container = ( { children } : {children: any} ) => {
  return (
    <div className='app-container'>
      { children }
    </div>
  )
}

const Content = ({ children } : {children: any}) => {
  return (
    <div className='app-content'>
      { children }
    </div>
  )
}

const Sidebar = ( { routes } : {routes: any} ) => 
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

export default ({ children, routes } : { children:any, routes:any }) => {
  return (
    <>
      <Container>
        <Sidebar routes = { routes }/>
        <Content>
          { children }
        </Content>
      </Container>
    </>
  )
};