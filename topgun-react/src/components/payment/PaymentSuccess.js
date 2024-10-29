
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from 'react-router';
import { useRecoilValue } from 'recoil';
import { loginState, memberLoadingState } from "../../util/recoil";
const PaymentSuccess=()=>{
        const navigate = useNavigate();
        //수신
        const {partnerOrderId} = useParams();
        //로그인 상태
        const login = useRecoilValue(loginState);
        const memberLoading = useRecoilValue(memberLoadingState);
        //static

        //결제 승인 상태
        const [result, setResult] = useState(null);//결제 대기중

        //state
        //리스트 불러오기
        const [seatsList, setSeatsList] = useState([]);

        //effect
        //로그인 상태면 결제백엔드로 이동
        useEffect(()=>{
            if(login && memberLoading)
                sendApproveRequest();
        }, [login, memberLoading]);

        //callback
        const sendApproveRequest = useCallback(async()=>{
            try{//approveRequestVO 에 전송
                const resp = await axios.post("http://localhost:8080/seats/approve", {
                    
                    //정보 전송 cid, userId, orderId, pg_token, tid
                    partnerOrderId: partnerOrderId,
                    pgToken:new URLSearchParams(window.location.search).get("pg_token"),
                    tid: window.sessionStorage.getItem("tid"),
                    seatsList: JSON.parse(window.sessionStorage.getItem("checkedSeatsList"))
                });
                setSeatsList(JSON.parse(window.sessionStorage.getItem("checkedSeatsList")));//리스트 불러오기
                setResult(true);//결제성공
            }
            catch(e){
                setResult(false);//결제실패
            }
            finally{//삭제
                window.sessionStorage.removeItem("tid");
                window.sessionStorage.removeItem("checkedSeatsList");
            }
        }, [login, memberLoading]);

        //memo
        const total = useMemo(() => {
            return seatsList.reduce((b, c) => {
                const price = c.seatsPrice || 0; // 기본값을 0으로 설정
                const flightPrice = c.flightPrice || 0; //기본값을 0으로 설정
                const qty = c.qty || 0; // 기본값을 0으로 설정
                return b + ((price+flightPrice) * qty);
            }, 0);
        }, [seatsList]);

        const handleNavigate = () => {
            navigate("/payment/alllist");
        };

        //view
        if(result===null){
            return <>
            <div className="container">
                <h1>결제 진행중입니다...</h1>
            </div>
            </>
        }

        else if(result){
            const flightId = seatsList.length > 0 ? seatsList[0].flightId : "알 수 없음";
        return(<>
        <div className="container text-center">
        <div className="row mt-4">
            <div className="col">
                <h1 className="text-center">{flightId}항공편</h1>
                <table className="table">
                   <tbody>
                    <tr>
                        <th>좌석번호</th>
                        <th>좌석등급</th>
                        <th>가격</th>
                    </tr>
                        {seatsList.map(seats=>(
                            <tr key={seats.seatsNo}>
                                <td>{seats.seatsNumber}</td>
                                <td>{seats.seatsRank}</td>
                                <td>{seats.seatsPrice.toLocaleString()}원</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th>총 결제 금액</th>
                            <th></th>
                            <th>{total.toLocaleString()}원</th>
                        </tr>
                    </tfoot>
                </table>
                <div className="text-end">
                <button className="btn btn-primary" onClick={handleNavigate}>
                            여권정보 이동
                </button>
                </div>
            </div>
        </div>
    </div>
        </>);
        }
        else{
            return(<>
            <div className="container">
            <h1 className="text-center mt-5">결제 승인 실패</h1>
            </div>
            </>);
        }
};

export default PaymentSuccess;