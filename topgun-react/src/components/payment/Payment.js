import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router";
import { Seat , SeatGroup } from "hacademy-cinema-seat";

    const Payment=()=>{
    //params
    const{flightId} = useParams();
    //state
    //리스트 초기 값 불러오기
    const[seatsList, setSeatsList] =useState([]);
    const [flightInfo, setFlightInfo] = useState({});
    const [seatsInputValues, setSeatsInputValues] = useState({}); 
    const [seatsDisplayList, setSeatsDisplayList] = useState([]);

    //좌석UI
    useEffect(()=>{
        setSeatsDisplayList(seatsList.map(seat=>{
            const row = seat.seatsNumber.substring(0, 1);
            const col = seat.seatsNumber.substring(1);
            const reserved = seat.seatsStatus === "사용";
            return {
                ...seat,
                seatsRow : row,
                seatsColumn : col,
                seatsReserved : reserved
            };
        }));
    }, [seatsList]);

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
    }, [flightId]);

     // 항공편 정보 백엔드에 불러옴
     const loadFlightInfo = useCallback(async () => {
        const resp = await axios.get(`http://localhost:8080/seats/info/${flightId}`);
        setFlightInfo(resp.data[0]); // 첫 번째 항공편 정보만 가져오기
    }, [flightId]);
    
    //좌석선택
    const selectSeats = useCallback((target, checked)=>{ 
        setSeatsList(seatsList.map(seats=>{
            if(seats.seatsNo === target.seatsNo){
                return {...seats, select:checked};
            }
            return {...seats};
        })); 

         // 선택된 좌석의 입력 값 초기화
        if (checked) {
            setSeatsInputValues(prev => ({ ...prev, [target.seatsNo]: { passport: '', expire: '' } }));
        } else {
            setSeatsInputValues(prev => {
                const { [target.seatsNo]: removed, ...rest } = prev;
                return rest;
            });
        }
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
    const checkedSeatsTotal = useMemo(() => {
        return checkedSeatsList.reduce((before, current) => {
            // 좌석 가격 + 항공편 가격 * 수량을 합산
            return before + ((current.seatsPrice + (flightInfo.flightPrice || 0)) * current.qty);
        }, 0);
    }, [checkedSeatsList, flightInfo.flightPrice]);
    
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
            <div className="row mt-3">
                
                
                <div className="col mt-2">
                    <div className="table" style={{width: '100%', whiteSpace: 'nowrap'}}>
                        <thead>
                            <tr>
                                <th>선택</th>
                                <th>번호</th>
                                <th></th>
                                <th>좌석번호</th>
                                <th>등급</th>
                                <th>가격</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {seatsList.map(seats=>(
                                <tr key={seats.seatsNo}>
                                    <td>
                                        <input type="checkbox" className="form-check-input"
                                        checked={seats.select} onChange={e=>selectSeats(seats, e.target.checked)}
                                        disabled={seats.seatsStatus === "사용"} 
                                        />
                                    </td>
                                    <td>{seats.seatsNo}</td> 
                                    <td></td>
                                    <td>{seats.seatsNumber}</td>
                                    <td>{seats.seatsRank}</td>
                                    <td>+{seats.seatsPrice.toLocaleString()}원</td>
                                    <td>{seats.seatsStatus}</td>
                            </tr>))}
                        </tbody>
                    </div>
                </div>
               
                <div className="col mt-2">
                <SeatGroup map={seatsDisplayList} setMap={setSeatsDisplayList}
                        fields={{
                            no:'seatsNo', 
                            row:'seatsColumn', 
                            col:'seatsRow', 
                            price:'seatsPrice', 
                            grade:'seatsRank',
                            reserved:'seatsReserved', 
                            //disabled:'seatDisabled',
                            checked:'select',
                        }}
                        cols={['A', 'B', ' ', 'C', 'D','E']}
                        rows={['1', '2','3','4','5','6']}
                        showNames={true}
                />
                </div>
                
                                    
                <div className="col mt-2">
                    {/* <table className="table" style={{ position: 'fixed', top: '205px', width: '30%', right:'300px', whiteSpace: 'nowrap'}}> */}
                    <table className="table">
                        <thead>
                            <tr>
                                <th>항공사</th>
                                <th></th>
                                <th className="text-end">{flightInfo.airlineName}</th>
                            </tr>
                            <tr>
                                <th> {flightInfo.departureAirport}</th>
                                <th></th>
                                <th className="text-end">출국시간 {flightInfo.departureTime}</th>
                            </tr>
                            <tr>
                                <th> {flightInfo.arrivalAirport}</th>
                                <th></th>
                                <th className="text-end">입국시간 {flightInfo.arrivalTime}</th>
                            </tr>
                            <tr>
                                <th>항공편 가격</th>
                                <th></th>
                                <th className="text-end">{(flightInfo.flightPrice+0).toLocaleString()}원</th>
                            </tr>
                            <tr>
                               <th></th>
                               <th></th>
                               <th></th>
                            </tr>
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
                                            <td className="text-end">{(seats.seatsPrice+flightInfo.flightPrice).toLocaleString()}원</td>
                                        </tr>
                                    ))}
                            </>)}
                            {checkedEconomySeatsList.length > 0 && (<>
                                    {checkedEconomySeatsList.map(seats => (
                                        <tr key={seats.seatsNo}>
                                            <td>{seats.seatsRank}</td>
                                            <td>{seats.seatsNumber}</td>
                                            <td className="text-end">{(seats.seatsPrice+flightInfo.flightPrice).toLocaleString()}원</td>
                                        </tr>
                                    ))}
                            </>)}
                            {checkedBusinessSeatsList.length === 0 && checkedEconomySeatsList.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="text-center">선택된 좌석이 없습니다.</td>
                                </tr>
                            )}
                            <tr>
                            </tr>
                            <tr>
                                <td colSpan="2"><strong>총 결제금액</strong></td>
                                <td className="text-end"><strong>{checkedSeatsTotal.toLocaleString()}원</strong></td>
                            </tr>
                        </tbody>
                          
                         </table>


                          {/* 입력 필드 추가 */}
                          {checkedSeatsList.map(seats => (
                        <div key={seats.seatsNo} className="mb-3">
                            <h5>{seats.seatsRank} {seats.seatsNumber} 좌석 여권정보 입력</h5>
                            
                            <div className="mb-2">
                                <label>여권 번호</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={seatsInputValues[seats.seatsNo]?.payment_detail_passport || ''} 
                                    onChange={e => setSeatsInputValues(prev => ({
                                        ...prev,
                                        [seats.seatsNo]: { ...prev[seats.seatsNo], payment_detail_passport: e.target.value }
                                    }))} 
                                />
                            </div>

                            <div className="mb-2">
                                <label>탑승자 이름</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={seatsInputValues[seats.seatsNo]?.payment_detail_passanger || ''} 
                                    onChange={e => setSeatsInputValues(prev => ({
                                        ...prev,
                                        [seats.seatsNo]: { ...prev[seats.seatsNo], payment_detail_passanger: e.target.value }
                                    }))} 
                                />
                            </div>

                            <div className="mb-2">
                                <label>영문 이름</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={seatsInputValues[seats.seatsNo]?.payment_detail_english || ''} 
                                    onChange={e => setSeatsInputValues(prev => ({
                                        ...prev,
                                        [seats.seatsNo]: { ...prev[seats.seatsNo], payment_detail_english: e.target.value }
                                    }))} 
                                />
                            </div>

                            <div className="mb-2">
                                <label>성별</label>
                                <select 
                                    className="form-control" 
                                    value={seatsInputValues[seats.seatsNo]?.payment_detail_sex || ''} 
                                    onChange={e => setSeatsInputValues(prev => ({
                                        ...prev,
                                        [seats.seatsNo]: { ...prev[seats.seatsNo], payment_detail_sex: e.target.value }
                                    }))} 
                                >
                                    <option value="">선택하세요</option>
                                    <option value="남성">남성</option>
                                    <option value="여성">여성</option>
                                </select>
                            </div>

                            <div className="mb-2">
                                <label>생년월일</label>
                                <input 
                                    type="date" 
                                    className="form-control" 
                                    value={seatsInputValues[seats.seatsNo]?.payment_detail_birth || ''} 
                                    onChange={e => setSeatsInputValues(prev => ({
                                        ...prev,
                                        [seats.seatsNo]: { ...prev[seats.seatsNo], payment_detail_birth: e.target.value }
                                    }))} 
                                />
                            </div>

                            <div className="mb-2">
                            <label>국적</label>
                            <select 
                                className="form-control" 
                                id="country" 
                                value={seatsInputValues[seats.seatsNo]?.payment_detail_counrty || ''} 
                                onChange={e => setSeatsInputValues(prev => ({
                                    ...prev,
                                    [seats.seatsNo]: { ...prev[seats.seatsNo], payment_detail_counrty: e.target.value }
                                }))} 
                            >
                                <option value="">국적을 선택하세요</option>
                                <option value="KR">대한민국</option>
                                <option value="US">미국</option>
                                <option value="JP">일본</option>
                                <option value="CN">중국</option>
                                <option value="FR">프랑스</option>
                                <option value="DE">독일</option>
                                <option value="GB">영국</option>
                                <option value="IT">이탈리아</option>
                                <option value="ES">스페인</option>
                                <option value="AU">호주</option>
                            </select>
                        </div>

                        <div className="mb-2">
                        <label>발행국</label>
                        <select 
                            className="form-control" 
                            id="visaType" 
                            value={seatsInputValues[seats.seatsNo]?.payment_detail_visa || ''} 
                            onChange={e => setSeatsInputValues(prev => ({
                                ...prev,
                                [seats.seatsNo]: { ...prev[seats.seatsNo], payment_detail_visa: e.target.value }
                            }))} 
                        >
                            <option value="">여권 발행국을 선택하세요</option>
                            <option value="KR">대한민국</option>
                                <option value="US">미국</option>
                                <option value="JP">일본</option>
                                <option value="CN">중국</option>
                                <option value="FR">프랑스</option>
                                <option value="DE">독일</option>
                                <option value="GB">영국</option>
                                <option value="IT">이탈리아</option>
                                <option value="ES">스페인</option>
                                <option value="AU">호주</option>
                        </select>
                    </div>

                            <div className="mb-2">
                                <label>여권 만료일</label>
                                <input 
                                    type="date" 
                                    className="form-control" 
                                    value={seatsInputValues[seats.seatsNo]?.payment_detail_expire || ''} 
                                    onChange={e => setSeatsInputValues(prev => ({
                                        ...prev,
                                        [seats.seatsNo]: { ...prev[seats.seatsNo], payment_detail_expire: e.target.value }
                                    }))} 
                                />
                            </div>
                            <hr/>
                        </div>
                    ))}
                        <button className="btn btn-success w-100 my-3" onClick={sendPurchaseRequest}>
                            구매하기
                        </button>
                    </div>
                </div>
         </div>
    </>);
};
export default Payment;