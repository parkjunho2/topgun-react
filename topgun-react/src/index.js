import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import 'react-datepicker/dist/react-datepicker.css'; // 스타일 가져오기
import './components/Global.css';
import { RecoilRoot } from 'recoil';
import { BrowserRouter } from 'react-router-dom';
//axios customize
import axios from 'axios';

axios.defaults.timeout = 5000;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

  <RecoilRoot>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </RecoilRoot>

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
