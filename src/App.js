// // src/App.js
// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Header from './components/Header/Header';
// import Home from './pages/Home/Home';

// import Register from './components/Register/Register';
// import Login from './components/Login/Login'; // Импортируйте Login

// const App = () => {
//     return (
//         <Router>
//             <div>
//                 {/* Шапка сайта */}
//                 <Header />
//                 {/* Маршрутизация */}
                
//                 {/* 
//                     <Register />
//                     <Login />
//                 </div> */}
//                 <Routes>
//                     <Route
//                         path='/'
//                         element={<Home />}
//                     />
//                 </Routes>
//             </div>
//         </Router>
//     );
// };

// export default App;
// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout'; // Импортируем новый компонент Layout
import Home from './pages/Home/Home';
import Register from './components/Register/Register';
import Login from './components/Login/Login'; // Импортируйте Login

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}> {/* Используем Layout как обертку */}
          <Route path='/' element={<Home />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
