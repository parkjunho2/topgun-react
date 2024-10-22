
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from 'react-router';
import { useRecoilValue } from 'recoil';
import { loginState, memberLoadingState } from "../../util/recoil";
const PaymentSuccess=()=>{
        //static
        const {partnerOrderId} = useParams();//수신
        //로그인 상태
        const login = useRecoilValue(loginState);
        const memberLoading = useRecoilValue(memberLoadingState);

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
                const qty = c.qty || 0; // 기본값을 0으로 설정
                return b + (price * qty);
            }, 0);
        }, [seatsList]);

        //view
        if(result===null){
            <h1>결제 진행중입니다...</h1>
        }

        else if(result){
        return(<>
        <h1>결제 성공 했습니다.</h1>
        <h1>partnerOrderId: {partnerOrderId}</h1>
        <h1>pg_token : {new URLSearchParams(window.location.search).get("pg_token")}</h1>
        <h1>tid:{window.sessionStorage.getItem("tid")}</h1>
        <div className="row mt-4">
            <div className="col">
                <table className="table">
                    <thead>
                        <tr>
                            <th>좌석번호</th>
                            <th>좌석등급</th>
                            <th>가격</th>
                        </tr>
                    </thead>
                    <tbody>
                        {seatsList.map(seats=>(
                            <tr key={seats.seatsNo}>
                                <td>{seats.seatsNo}</td>
                                <td>{seats.seatsRank}</td>
                                <td>{seats.seatsPrice}원</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colSpan={3}>총 결제 금액</th>
                            <th>{total}원</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
        </>);
        }
        else{
            return(<>
            <h1>결제 승인 실패</h1>
            </>);
        }
        
        
      
};

export default PaymentSuccess;