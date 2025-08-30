import { useState } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import DataProvider from './context/DataProvider';
import Login from './components/account/Login';
import Home from './components/home/Home';
import Header from './components/header/Header.jsx';
import CreatePost from './components/create/CreatePost.jsx';
import Update from './components/create/Update.jsx';

const PrivateRoute = ({ isAuthenticated, ...props }) => {
  const token = sessionStorage.getItem('accessToken');
  return isAuthenticated && token ? (
    <>
      <Header />
      <Outlet />
    </>
  ) : (
    <Navigate replace to="/login" />
  );
};

function App() {
  const [isAuthenticated, isUserAuthenticated] = useState(false);

  return (
    <DataProvider>
      <Routes>
        <Route path="/login" element={<Login isUserAuthenticated={isUserAuthenticated} />} />
        
        {/* Protected routes */}
        <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/details/:id" element={<CreatePost />} />
          <Route path='/update/:id' element={<Update />} />
        </Route>
      </Routes>
    </DataProvider>
  );
}

export default App;