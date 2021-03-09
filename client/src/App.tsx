import React, { useContext } from 'react';
import NavBar from './Components/NavBar';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import AdminPage from './Pages/AdminPage';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';
import ProfilePage from './Pages/ProfilePage';
import './main.css';
import { myContext } from './Context/Context';

function App() {
  const ctx = useContext(myContext);
  console.log(ctx);

  return (
    <BrowserRouter>
      <NavBar />
      <Switch>
        <Route path='/' exact component={HomePage}></Route>
        {ctx ? (
          <>
            {ctx.isAdmin ? <Route path='/admin' component={AdminPage}></Route> : null}
            <Route path='/profile' component={ProfilePage}></Route>
          </>
        ) : (
          <>
            <Route path='/login' component={LoginPage}></Route>
            <Route path='/register' component={RegisterPage}></Route>
          </>
        )}
      </Switch>
    </BrowserRouter>
  );
}

export default App;
