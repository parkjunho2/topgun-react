import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router";

    const Payment=()=>{
    //params
    const{flightId} = useParams();
    //state
    //리스트 초기 값 불러오기
    const[seatsList, setSeatsList] =useState([]);
    const [flightInfo, setFlightInfo] = useState({});

    //effect
    //좌석 리스트 callback에 있는거 갖고옴
    useEffect(()=>{
        loadSeatsList();
        loadFlightInfo();
    },[]);

    //callback
    //좌석 리스트 백엔드에 불러옴
    const loadSeatsList= useCallback(async()=>{ 
        const resp=await axios.get(`http://localhost:8080/seats/${flightId}`);
            setSeatsList(resp.data.map(seats=>{
                return{
                    ...seats,
                      select:false,
                    qty:1//고정
                }
            }));
    }, []);

     // 항공편 정보 백엔드에 불러옴
     const loadFlightInfo = useCallback(async () => {
        const resp = await axios.get(`http://localhost:8080/seats/info/${flightId}`);
        setFlightInfo(resp.data[0]); // 첫 번째 항공편 정보만 가져오기
    }, [flightId]);
    
    //  // 항공편 정보 불러오기
    //  const loadFlightInfo = useCallback(async () => {
    //     const resp = await axios.get(`http://localhost:8080/seats/flightInfo`);
    //     setFlightInfo(resp.data.find(info => info.flightId === flightId)); // 해당 flightId에 맞는 정보 찾기
    // }, [flightId]);
    
    //좌석선택
    const selectSeats = useCallback((target, checked)=>{ 
        setSeatsList(seatsList.map(seats=>{
            if(seats.seatsNo === target.seatsNo){
                return {...seats, select:checked};
            }
            return {...seats};
        }));
    }, [seatsList]);


    //memo 
    //체크된 좌석 목록
    const checkedSeatsList= useMemo(()=>{
        return seatsList.filter(seats=>seats.select);//filter 원하는것만 추려서 사용하는 명령어
    }, [seatsList]);

    // 체크된 비즈니스 좌석 목록
    const checkedBusinessSeatsList = useMemo(() => {
        return checkedSeatsList.filter(seats => seats.seatsRank === "비즈니스");
        }, [checkedSeatsList]);

    // 체크된 이코노미 좌석 목록
    const checkedEconomySeatsList = useMemo(() => {
        return checkedSeatsList.filter(seats => seats.seatsRank === "이코노미");
        }, [checkedSeatsList]);

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
        <div className="container">
            {/* 항공편 정보 표시 */}
            <div>
                {flightInfo.airlineName}
            </div>
            <div>
            출국공항 {flightInfo.departureAirport}
            출국시간 {flightInfo.departureTime}
            </div>
            <div>
            입국공항 {flightInfo.arrivalAirport}
            입국시간 {flightInfo.arrivalTime}
            </div>
            <div className="row mt-3">
                <div className="col mt-2">
                    <div className="table" style={{width: '100%', whiteSpace: 'nowrap'}}>
                        <thead>
                            <tr>
                                <th>선택</th>
                                <th>번호</th>
                                <th>좌석번호</th>
                                <th>등급</th>
                                <th>가격</th>
                            </tr>
                        </thead>
                        <tbody>
                            {seatsList.map(seats=>(
                                <tr key={seats.seatsNo}>
                                    <td>
                                        <input type="checkbox" className="form-check-input"
                                        checked={seats.select} onChange={e=>selectSeats(seats, e.target.checked)}
                                        disabled={seats.status === "사용"} // 사용된 좌석은 선택 불가
                                        />
                                    </td>
                                    <td>{seats.seatsNo}</td>
                                    <td>{seats.seatsNumber}</td>
                                    <td>{seats.seatsRank}</td>
                                    <td>{seats.seatsPrice.toLocaleString()}원</td>
                            </tr>))}
                        </tbody>
                    </div>
                </div>
                <div className="col mt-2">
                    <table className="table" style={{ position: 'fixed', top: '205px', width: '30%', right:'100px', whiteSpace: 'nowrap'}}>
                        <thead>
                            <tr>
                                <th>등급</th>
                                <th>좌석 번호</th>
                                <th className="text-end">가격</th>
                            </tr>
                        </thead>    
                        <tbody>
                            {checkedBusinessSeatsList.length > 0 && (<>
                                    {checkedBusinessSeatsList.map(seats => (
                                        <tr key={seats.seatsNo}>
                                            <td>{seats.seatsRank}</td>
                                            <td>{seats.seatsNumber}</td>
                                            <td className="text-end">{seats.seatsPrice.toLocaleString()}원</td>
                                        </tr>
                                    ))}
                            </>)}
                            {checkedEconomySeatsList.length > 0 && (<>
                                    {checkedEconomySeatsList.map(seats => (
                                        <tr key={seats.seatsNo}>
                                            <td>{seats.seatsRank}</td>
                                            <td>{seats.seatsNumber}</td>
                                            <td className="text-end">{seats.seatsPrice.toLocaleString()}원</td>
                                        </tr>
                                    ))}
                            </>)}
                            {checkedBusinessSeatsList.length === 0 && checkedEconomySeatsList.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="text-center">선택된 좌석이 없습니다.</td>
                                </tr>
                            )}
                            <tr>

                                <td colSpan="2"><strong>추가 금액</strong></td>
                                <td className="text-end"><strong>{checkedSeatsTotal.toLocaleString()}원</strong></td>
                            </tr>
                        </tbody>
                            <tfoot>
                            <button className="btn btn-success w-100 my-3"
                                onClick={sendPurchaseRequest}>
                                    구매하기
                                </button>
                            </tfoot>
                         </table>
                    </div>
                </div>
         </div>
    </>);
};
export default Payment;