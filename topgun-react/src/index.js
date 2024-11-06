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

//axios customize
//- 환경설정(.env)에 정의된 값을 읽어온다
//- process.env.항목이름
axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;//기본요청 URL
axios.defaults.timeout = 5000; // 5초동안 기다려본다
console.log(process.env.REACT_APP_BASE_URL);  // 콘솔에 출력

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <RecoilRoot>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </RecoilRoot>
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
