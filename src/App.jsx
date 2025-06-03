import React from "react";
import { Route, Routes } from 'react-router-dom';
import Navbar from "./Component/Navbar/Navbar";
import Home from "./Pages/Home/home";
import About from "./Pages/About/about";
import Contact from "./Pages/Contact/contact";
import Newscreen from "./Pages/Newscreen/newscreen"; // Import the new screen

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/new-screen' element={<Newscreen />} /> {/* New Route */}
      </Routes>
    </>
  );
}
