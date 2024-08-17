import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignUp from './components/SignUp';
import PrivateComponent from './components/PrivateComponent';
import Login from './components/Login';
import AddProduct from './components/AddProduct';
import UpdateProduct from './components/UpdateProduct';
import UserProfile from './components/UserProfile';
import ProductList from './components/ProductList';
import Header from './components/Header';
import AdminDashboard from './components/AdminDashboard';
import Testimonial from './components/Testimonial';
import ProductDetails from './components/ProductDetails';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route element={<PrivateComponent />}>
          <Route path='/' element={<ProductList />} />
          <Route path='/add' element={<AddProduct />} />
          <Route path='/update/:id' element={<UpdateProduct />} />
          <Route path='/profile' element={<UserProfile />} />
          <Route path='/productdetails/:id' element={<ProductDetails />} />
          <Route path='/testimonials' element={<Testimonial />} />
          <Route path='/logout' element={<h1>Logout Component</h1>} />
          <Route path='/admindashboard' element={<AdminDashboard />} />
        </Route>
        <Route path='/signup' element={<SignUp />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
