import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router";
import { Seat , SeatGroup } from "hacademy-cinema-seat";
import { toast } from "react-toastify";

    const Payment=()=>{
    //params
    const{flightId} = useParams();
    //state
    //리스트 초기 값 불러오기
    const[seatsList, setSeatsList] =useState([]);
    const [flightInfo, setFlightInfo] = useState({});
    const [seatsDisplayList, setSeatsDisplayList] = useState([]);
    const passangerRegex = /^[가-힣]+$/;
    const englishRegex = /^[a-zA-Z]+$/;
    const passportRegex = /^[A-Za-z][0-9]{8}$$/;

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
        const resp=await axios.get(`/seats/${flightId}`);
            setSeatsList(resp.data.map(seats=>{
                return{
                    ...seats,
                    select:false,
                    qty:1,
                    paymentDetailPassport:"",
                    paymentDetailPassanger:"",
                    paymentDetailEnglish:"",
                    paymentDetailSex:"",
                    paymentDetailBirth:"",
                    paymentDetailCountry:"",
                    paymentDetailVisa:"",
                    paymentDetailExpire:""
                }
            }));
    }, [flightId]);

     // 항공편 정보 백엔드에 불러옴
     const loadFlightInfo = useCallback(async () => {
        const resp = await axios.get(`/seats/info/${flightId}`);
        setFlightInfo(resp.data[0]); // 첫 번째 항공편 정보만 가져오기
    }, [flightId]);

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
    const sendPurchaseRequest = useCallback(async () => {
        // 필수 입력 조건을 설정
        const isBasicInfoOnly = ["서울/김포(GMP)", "서울/인천(ICN)", "제주(CJU)"].includes(flightInfo.departureAirport) &&
                                ["서울/김포(GMP)", "서울/인천(ICN)", "제주(CJU)"].includes(flightInfo.arrivalAirport);
        // 조건에 맞춰 모든 입력 필드가 채워져 있거나 모두 비어있는지 확인
        const allFilled = checkedSeatsList.every(seat =>
            isBasicInfoOnly
                ? seat.paymentDetailPassanger && seat.paymentDetailBirth// 기본 정보만 입력 체크
                : seat.paymentDetailPassport && // 모든 정보 입력 체크
                  seat.paymentDetailPassanger &&
                  seat.paymentDetailEnglish &&
                  seat.paymentDetailSex &&
                  seat.paymentDetailBirth &&
                  seat.paymentDetailCountry &&
                  seat.paymentDetailVisa &&
                  seat.paymentDetailExpire 
        );
        const allEmpty = checkedSeatsList.every(seat =>
            isBasicInfoOnly
                ? !seat.paymentDetailPassanger && !seat.paymentDetailBirth
                : !seat.paymentDetailPassport &&
                  !seat.paymentDetailPassanger &&
                  !seat.paymentDetailEnglish &&
                  !seat.paymentDetailSex &&
                  !seat.paymentDetailBirth &&
                  !seat.paymentDetailCountry &&
                  !seat.paymentDetailVisa &&
                  !seat.paymentDetailExpire
        );

        // 최소 하나의 좌석은 입력되어야 하고, 다른 좌석은 입력되지 않아야 함
    const mixedFilled = checkedSeatsList.some(seat =>
        isBasicInfoOnly
            ? seat.paymentDetailPassanger && seat.paymentDetailBirth
            : seat.paymentDetailPassport &&
              seat.paymentDetailPassanger &&
              seat.paymentDetailEnglish &&
              seat.paymentDetailSex &&
              seat.paymentDetailBirth &&
              seat.paymentDetailCountry &&
              seat.paymentDetailVisa &&
              seat.paymentDetailExpire
    ) && checkedSeatsList.some(seat =>
        isBasicInfoOnly
            ? !seat.paymentDetailPassanger && !seat.paymentDetailBirth
            : !seat.paymentDetailPassport &&
              !seat.paymentDetailPassanger &&
              !seat.paymentDetailEnglish &&
              !seat.paymentDetailSex &&
              !seat.paymentDetailBirth &&
              !seat.paymentDetailCountry &&
              !seat.paymentDetailVisa &&
              !seat.paymentDetailExpire
    );

    if (!(allFilled || allEmpty || mixedFilled)) {
        toast.error("모든 정보를 입력하거나 아무것도 입력하지 않아야 합니다.");
        return; // 조건이 충족되지 않으면 함수 종료
    }

    if(checkedSeatsList.length===0){
            toast.error("좌석을 선택하세요.");
            return;
    } 
        const resp = await axios.post(
            "/seats/purchase", 
            {//백엔드 puchaseReqeustVO 로 전송
                seatsList: checkedSeatsList, //seatNo,qty,여권정보
                approvalUrl: getCurrentUrl() + "/success",
                cancelUrl: getCurrentUrl() + "/cancel",
                failUrl: getCurrentUrl() + "/fail",
            }
        );//결제페이지로 전송
            window.sessionStorage.setItem("tid", resp.data.tid);//pc_url 가기전 먼저 tid 전송
            window.sessionStorage.setItem("checkedSeatsList", JSON.stringify(checkedSeatsList));//체크된 결제한 리스트 전송
            window.location.href= resp.data.next_redirect_pc_url;//결제 페이지로 이동
    }, [checkedSeatsList]);


    const changeSeats= useCallback((target, input, field)=>{
        setSeatsList(seatsList.map(seats=>{
            if(seats.seatsNo===target.seatsNo){
                return{...seats, 
                    [field]:input
                };
            }
            return{...seats};
        }));
    }, [seatsList]);

        //view
        return(<>
        <div className="container">
            <div className="row mt-3">
                <div className="col mt-2">
                <SeatGroup map={seatsDisplayList} setMap={setSeatsList}
                        fields={{
                            no:'seatsNo', 
                            col:'seatsRow', 
                            row:'seatsColumn', 
                            price:'seatsPrice', 
                            grade:'seatsRank',
                            reserved:'seatsReserved', 
                            disabled:'seatsStatus',
                            checked:'select',
                        }}
                        cols={['A', 'B', ' ', 'C', 'D','E']}
                        rows={['1', '2','3','4','5','6']}
                        showNames={true}
                />
                </div>
                                   
                <div className="col mt-2">
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
                         <button
                                className="btn btn-success w-100 my-3"
                                onClick={sendPurchaseRequest}
                                disabled={
                                    checkedSeatsList.some(seat => 
                                        (seat.paymentDetailPassanger && !passangerRegex.test(seat.paymentDetailPassanger)) ||
                                        (seat.paymentDetailEnglish && !englishRegex.test(seat.paymentDetailEnglish)) || 
                                        (seat.paymentDetailPassport && passportRegex.test(seat.paymentDetailPassport))
                                    ) || checkedSeatsList.length === 0
                                }
                            >
                                구매하기
                            </button>
                        <div className="text-center text-primary"><strong>여권 정보는 결제 완료 후에도 입력하실 수 있습니다</strong></div>

                        {seatsList.map(seats => (
                        checkedSeatsList.some(checkedSeat => checkedSeat.seatsNo === seats.seatsNo) && (
                            <div key={seats.seatsNo} className="mb-3">
                                <hr/>
                                <h5>{seats.seatsRank} {seats.seatsNumber} 좌석 여권정보 입력</h5>

                                {(["서울/김포(GMP)", "서울/인천(ICN)", "제주(CJU)"].includes(flightInfo.departureAirport) &&
                                ["서울/김포(GMP)", "서울/인천(ICN)", "제주(CJU)"].includes(flightInfo.arrivalAirport)) ? (
                                    <>
                                        <div className="mb-2">
                                            <label>이름</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={seats.paymentDetailPassanger}
                                                onChange={e => changeSeats(seats, e.target.value, 'paymentDetailPassanger')}
                                                onBlur={() => {
                                                    if (!passangerRegex.test(seats.paymentDetailPassanger)) {
                                                        toast.error("한글만 입력하세요");
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label>생년월일</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={seats.paymentDetailBirth}
                                                onChange={e => changeSeats(seats, e.target.value, 'paymentDetailBirth')}
                                                max={new Date().toISOString().split("T")[0]} 
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-2">
                                            <label>여권 번호</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={seats.paymentDetailPassport}
                                                onChange={e => changeSeats(seats, e.target.value, 'paymentDetailPassport')}
                                                onBlur={() => {
                                                    if (!passangerRegex.test(seats.paymentDetailPassport)) {
                                                        toast.error("여권 번호는 영문자 1개 뒤에 숫자 8개로 이루어져야 합니다.");
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label>한글이름</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={seats.paymentDetailPassanger}
                                                onChange={e => changeSeats(seats, e.target.value, 'paymentDetailPassanger')}
                                                onBlur={() => {
                                                    if (!passangerRegex.test(seats.paymentDetailPassanger)) {
                                                        toast.error("한글만 입력하세요");
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label>영문이름</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={seats.paymentDetailEnglish}
                                                onChange={e => changeSeats(seats, e.target.value, 'paymentDetailEnglish')}
                                                onBlur={() => {
                                                    if (!passangerRegex.test(seats.paymentDetailEnglish)) {
                                                        toast.error("영어만 입력하세요");
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label>성별</label>
                                            <select 
                                                className="form-control" 
                                                value={seats.paymentDetailSex} 
                                                onChange={e => changeSeats(seats, e.target.value, 'paymentDetailSex')} 
                                            >
                                                <option value="">선택하세요</option>
                                                <option value="M">남성</option>
                                                <option value="W">여성</option>
                                            </select>
                                        </div>
                                        <div className="mb-2">
                                            <label>생년월일</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={seats.paymentDetailBirth}
                                                onChange={e => changeSeats(seats, e.target.value, 'paymentDetailBirth')}
                                                max={new Date().toISOString().split("T")[0]} 
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label>국적</label>
                                            <select 
                                                className="form-control" 
                                                value={seats.paymentDetailCountry} 
                                                onChange={e => changeSeats(seats, e.target.value, 'paymentDetailCountry')} 
                                            >
                                                <option value="">선택하세요</option>
                                                <option value="대한민국">대한민국</option>
                                                <option value="미국">미국</option>
                                                <option value="일본">일본</option>
                                                <option value="중국">중국</option>
                                                <option value="영국">영국</option>
                                                <option value="독일">독일</option>
                                                <option value="프랑스">프랑스</option>
                                                <option value="캐나다">캐나다</option>
                                                <option value="호주">호주</option>
                                                <option value="인도">인도</option>
                                            </select>
                                        </div>
                                        <div className="mb-2">
                                            <label>여권 발행국</label>
                                            <select 
                                                className="form-control" 
                                                value={seats.paymentDetailVisa} 
                                                onChange={e => changeSeats(seats, e.target.value, 'paymentDetailVisa')} 
                                            >
                                                <option value="">선택하세요</option>
                                                <option value="대한민국">대한민국</option>
                                                <option value="미국">미국</option>
                                                <option value="일본">일본</option>
                                                <option value="중국">중국</option>
                                                <option value="영국">영국</option>
                                                <option value="독일">독일</option>
                                                <option value="프랑스">프랑스</option>
                                                <option value="캐나다">캐나다</option>
                                                <option value="호주">호주</option>
                                                <option value="인도">인도</option>
                                            </select>
                                        </div>
                                        <div className="mb-2">
                                            <label>여권 만료일</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={seats.paymentDetailExpire}
                                                onChange={e => changeSeats(seats, e.target.value, 'paymentDetailExpire')}
                                                min={new Date().toISOString().split("T")[0]}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )))}
                    </div>
                </div>
         </div>
    </>);
};
export default Payment;