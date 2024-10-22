import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react"

const Payment=()=>{
   //state
   //리스트 초기 값 불러오기
   const[seatsList, setSeatsList] =useState([]);

    //effect
    ;//좌석 리스트 callback에 있는거 갖고옴
    useEffect(()=>{
        loadSeatsList()
    },[]);

   //callback
   //좌석 리스트 백엔드에 불러옴
   const loadSeatsList= useCallback(async()=>{ 
        const resp = await axios.get("http://localhost:8080/seats/");
        setSeatsList(resp.data.map(seats=>{
            return{
                ...seats,
                select:false,
                qty:1
            }
        }));
   }, []);
 
   //좌석선택
   const selectSeats = useCallback((target, checked)=>{ 
    setSeatsList(seatsList.map(seats=>{
        if(seats.seatsNo === target.seatsNo){
            return {...seats, select:checked};
        }
        return {...seats};
    }));
   }, [seatsList]);

   //좌석 갯수 선택 *추후 삭제예정*
   const changeSeatsQty = useCallback((target, qty)=>{
    setSeatsList(seatsList.map(seats=>{
        if(seats.seatsNo===target.seatsNo){
            return {...seats, qty:qty};
        }
        return {...seats};
    }));
   }, [seatsList]);

   //memo 
   //체크된 도서 목록
   const checkedSeatsList= useMemo(()=>{
    return seatsList.filter(seats=>seats.select);//filter 원하는것만 추려서 사용하는 명령어
   }, [seatsList]);
   //체크된 총 계산된 금액
   const checkedSeatsTotal = useMemo(()=>{
    return checkedSeatsList.reduce((before, current)=>{//reduce 반복문 사용
       return before + (current.seatsPrice * current.qty);
    }, 0);
   },[checkedSeatsList]);
   
   //결제 후 이동할 주소
   const getCurrentUrl = useCallback(()=>{
    return window.location.origin + window.location.pathname + (window.location.hash||'');
   }, []);
   //체크된 좌석 금액 결제
   const sendPurchaseRequest = useCallback(async()=>{
    if(checkedSeatsList.length===0) return;
    const resp = await axios.post(
        "http://localhost:8080/seats/purchase", 
        {//백엔드 puchaseReqeustVO 로 전송
            seatsList: checkedSeatsList, //seatNo,qty
            approvalUrl: getCurrentUrl() + "/success",
            cancelUrl: getCurrentUrl() + "/cancel",
            failUrl: getCurrentUrl() + "/fail",
        }
    );//결제페이지로 전송
        window.sessionStorage.setItem("tid", resp.data.tid);//pc_url 가기전 먼저 tid 전송
        window.sessionStorage.setItem("checkedSeatsList", JSON.stringify(checkedSeatsList));//체크된 결제한 리스트 전송
        window.location.href= resp.data.next_redirect_pc_url;//결제 페이지로 이동
   }, [checkedSeatsList]);

    //view
    return(<>
        <h1>?월?일 ??공항 // ?월?일 ??공항 // ??항공사 </h1>
        <div className="row mt-4">
            <div className="col">
                <div className="table">
                    <thead>
                        <tr>
                            <th>선택</th>
                            <th>좌석번호</th>
                            <th>등급</th>
                            {/* <th>가격</th> */}
                            <th>수량</th>{/* 추후 삭제 예정 */}
                        </tr>
                    </thead>
                    <tbody>{/* 컨테이너 2개로 나눠서 오른쪽에 */}
                        {seatsList.map(seats=>(
                            <tr key={seats.seatsNo}>
                                <td>
                                    <input type="checkbox" className="form-check-input"
                                    checked={seats.select} onChange={e=>selectSeats(seats, e.target.checked)}/>
                                </td>
                                <td>{seats.seatsNo}</td>
                                <td>{seats.seatsRank}</td>
                                {/* <td>{seats.seatsPrice}</td> */}
                                <td>
                                    <input type="number" className="form-control" min="1" max="1" step="1"
                                    style={{width:"100px"}} value={seats.qty}
                                    onChange={e=>changeSeatsQty(seats, e.target.value)}
                                        />{/* 추후 changeSeatsQty 삭제 예정*/}
                                </td>
                        </tr>))}
                    </tbody>
                </div>
            </div>
        </div>

        <hr/>
        <div className="row mt-4">
            <div className="col">
                {/* 비지니스 선택 금액 , 이코노미 선택 금액  */}
                <h2>결제하실 총 금액은 {checkedSeatsTotal}원 입니다.</h2>{/* 총 금액 */}
            </div>
        </div>
        <div className="row mt-4">
            <div className="col">
                <button className="btn btn-success w-100" 
                onClick={sendPurchaseRequest}>
                    구매하기
                </button>
            </div>
        </div>
    </>);
};
export default Payment;