import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import MainPage from './components/MainPage/MainPage';
import Login from './components/Login/Login';
import NotFound from './components/NotFound/NotFound';
import Test from './components/Test';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { memberLoadingState, userState } from './util/recoil';
import { useCallback, useEffect } from 'react';
import axios from 'axios';
import PrivateRoute from './components/Route/PrivateRoute';
import Flight from './components/flight/Flight.js';
import Payment from "./components/payment/Payment";
import PaymentSuccess from "./components/payment/PaymentSuccess";
import PaymentCancel from "./components/payment/PaymentCancel";
import PaymentFail from "./components/payment/PaymentFail";
import AdminRoute from './components/Route/AdminRoute';
import Admin from './components/Admin';
import NotMemberRoute from './components/Route/NotMemberRoute';
import AirLine from './components/AirLine.js';
import AdminFlight from './components/flight/AdminFlight.js';
import Chat from './components/chat/Chat';
import Notice from './components/notice/notice.js'; // Notice 컴포넌트 임포트
import NoticeDetail from './components/notice/noticeDetail.js'; // 공지사항 상세 페이지 컴포넌트 임포트
import Graph from './components/notice/graph'; // 대문자로 변경
import MyPage from './components/MyPage/MyPage';
import Booking from './components/booking/Booking.js';
import PaymentList from "./components/payment/PaymentList.js";
import PaymentAllList from "./components/payment/PaymentAllList.js";
import FlightDetail from './components/flight/FlightDetail.js';
import AdminFlightDetail from './components/flight/AdminFlightDetail.js';
import BookingList from './components/booking/BookingList.js';
import Room from "./components/chat/Room.js";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import PaymentDetail from "./components/payment/PaymentDetail.js";
import FindPw from './components/ForgotPw/FindPw/FindPw';
import ResetPw from './components/ForgotPw/ResetPw/ResetPw.js';
import Seats from './components/flight/Seats/Seasts.js';






const App = () => {

  //recoil state
  const [, setUser] = useRecoilState(userState);
  const [, setMemberLoading] = useRecoilState(memberLoadingState);



  //최초 1회 실행
  useEffect(() => {
    refreshLogin();
  }, []);

  //callback
  const refreshLogin = useCallback(async () => {
    //[1] sessionStorage에 refreshToken이라는 이름의 값이 있는지 확인
    const sessionToken = window.sessionStorage.getItem("refreshToken");
    //[2] localStorage에 refreshToken이라는 이름의 값이 있는지 확인
    const localToken = window.localStorage.getItem("refreshToken");
    //[3] 둘다 없으면 차단
    if (sessionToken === null && localToken === null) {
      setMemberLoading(true);
      return;
    }
    //[4] 둘 중 하나라도 있다면 로그인 갱신을 진행
    const refreshToken = sessionToken || localToken;

    //[5] 헤더에 Authorization 설정
    axios.defaults.headers.common["Authorization"] = "Bearer " + refreshToken;

    //[6] 백엔드에 갱신 요청을 전송
    const resp = await axios.post("http://localhost:8080/users/refresh");

    //[7] 갱신 성공 시 응답(resp)에 담긴 데이터들을 적절하게 분배하여 저장(로그인과 동일)
    setUser({
      userId: resp.data.usersId,
      userType: resp.data.usersType,
    });

    axios.defaults.headers.common["Authorization"] = "Bearer " + resp.data.accessToken;
    if (window.localStorage.getItem("refreshToken") !== null) {
      window.localStorage.setItem("refreshToken", resp.data.refreshToken);
    }
    else {
      window.sessionStorage.setItem("refreshToken", resp.data.refreshToken);
    }

    setMemberLoading(true);
  }, []);


  const location = useLocation();

  // 헤더를 숨길 경로 배열
  const noHeaderRoutes = ['/login', '/join'];

  return (
    <>{/* ToastContainer 추가 */}
      <ToastContainer
        position="top-right" // 토스트 위치
        autoClose={2000} // 자동 닫힘 시간
        hideProgressBar={false} // 진행 바 표시 여부
        closeOnClick
        pauseOnHover
        draggable
      />
      {!noHeaderRoutes.includes(location.pathname) && <Header />}
      <Routes>
        <Route exact path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} /> {/* 로그인 */}
        <Route path='/findPw' element={<FindPw />} />
        <Route path="/resetPw" element={<ResetPw />} />

        {/* 예약페이지 */}
        <Route path="/flight/booking/:flightId" element={<Booking />} />
        <Route path="/flight/booking/:flightId/seats" element={<Seats />} />
        <Route path="/flight/bookingList" element={<BookingList />} />

        {/* 로그인 되어야지만 볼 수 있는 페이지 */}
        <Route element={<PrivateRoute />}>
          <Route path="/payment/:flightId" element={<Payment />} />
          <Route path="/payment/success/:partnerOrderId" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/payment/fail" element={<PaymentFail />} />
          <Route path="/test" element={<Test />} />
          <Route path="/chat" element={<Chat />} />
          <Route path='/mypage' element={<MyPage />} />
          <Route path='/payment/list' element={<PaymentList />} />
          <Route path='/payment/alllist' element={<PaymentAllList />} />
          <Route path="/chat/:roomNo" element={<Chat />} />
          <Route path="/room" element={<Room />} />
          <Route path='/payment/list' element={<PaymentList />} />
          <Route path='/payment/detail/:paymentNo' element={<PaymentDetail />} />
        </Route>


        {/* 관리자만 봐야하는 페이지 */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/list" element={<AdminFlight />} />
          <Route path="/admin/detail/:flightId" element={<AdminFlightDetail />} />
        </Route>

        {/* 멤버만 못보는 페이지 -> ADMIN, AIRLINE만 가능 */}
        <Route element={<NotMemberRoute />}>
          <Route path="/airline" element={<AirLine />} />
          <Route path="/flight" element={<Flight />} />
          <Route path="/flight/detail/:flightId" element={<FlightDetail />} />
        </Route>


        {/* 공지사항 페이지 추가 */}
        <Route path="/notice" element={<Notice />} />  {/* Notice 페이지 경로 설정 */}
        <Route path="/notice/:id" element={<NoticeDetail />} />  {/* 공지사항 상세 페이지 경로 설정 */}
        <Route path="/graph" element={<Graph />} /> // 대문자로 변경


        <Route path="*" element={<NotFound />} /> {/* 모든 잘못된 경로 처리 */}
      </Routes>
      <Footer />

    </>
  );
}

export default App;