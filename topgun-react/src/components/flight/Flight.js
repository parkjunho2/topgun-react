import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { FaTrash, FaEdit } from "react-icons/fa";
import { Modal, Toast } from "bootstrap";
import { FaMagnifyingGlass, FaPlus} from "react-icons/fa6";
import { NavLink } from "react-router-dom";
import { useRecoilState } from "recoil";
import { userState } from "../../util/recoil";
import { toast } from "react-toastify";

const Flight = () => {
    const [flightList, setFlightList] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태 초기화
    const [input, setInput] = useState({
        flightId: "",
        flightNumber: "",
        departureTime: "",
        arrivalTime: "",
        flightTime: "",
        departureAirport: "",
        arrivalAirport: "",
        userId: "", // 이 값은 자동으로 설정되므로 초기화 시 비워둡니다.
        flightPrice: "",
        flightStatus: "대기", // 기본 상태
    });

    const modal = useRef();
    const [user, setUser] = useRecoilState(userState);
    const currentDateTime = new Date().toISOString().slice(0, 16); // 현재 날짜와 시간을 ISO 형식으로 가져오기

    useEffect(() => {
        loadList();
    }, []);

    useEffect(() => {
        if (input.departureTime && input.arrivalTime) {
            const departure = new Date(input.departureTime);
            const arrival = new Date(input.arrivalTime);
            const timeDiff = (arrival - departure) / 1000; // 차이를 초 단위로 계산

            const hours = Math.floor(timeDiff / 3600); // 시간 계산
            const minutes = Math.floor((timeDiff % 3600) / 60); // 분 계산

            setInput((prevInput) => ({
                ...prevInput,
                flightTime: `${hours}시간 ${minutes}분`, // 포맷팅
            }));
        }
    }, [input.departureTime, input.arrivalTime]);

    const loadList = useCallback(async () => {
        setIsLoading(true);//로딩
        try {
        const resp = await axios.get("/flight/");
        // 현재 시간 (오늘 날짜)
        const now = new Date();
        // 항공편 리스트에서 현재 로그인된 사용자 ID와 도착 시간이 현재 시간보다 이후인 항공편만 필터링
    const filteredFlights = resp.data.filter(flight => {
        const arrivalTime = new Date(flight.arrivalTime);
        return flight.userId === user.userId && arrivalTime >= now;
    });
    setFlightList(filteredFlights);
        } catch (error) {
    toast.error("데이터를 불러오는 중 오류가 발생했습니다.");
        } finally {
    setIsLoading(false);  // 로딩 종료
        }
}, [user.userId]);

    const deleteFlight = useCallback(async (flightId) => {
        const choice = window.confirm("정말 삭제하시겠습니까?");
        if (!choice) return;
        try {
            await axios.delete(`/flight/${flightId}`);
            toast.success("삭제 완료되었습니다."); // 삭제 성공 시 토스트 알림 표시
            loadList(); // 목록 새로고침
        } catch (error) {
            toast.error("삭제에 실패했습니다. 다시 시도해주세요."); // 에러 발생 시 토스트 알림 표시
        }
    }, [loadList]);

    const updateFlight = useCallback(async () => {
        // 서버에서 현재 항공편 상태 확인
    const currentFlight = await axios.get(`/flight/${input.flightId}`);
    
    // 최신 상태가 승인 상태인지 확인
    if (currentFlight.data.flightStatus === "승인") {
        toast.error("해당 항공편은 이미 승인되었습니다.");
        closeModal();
        return;
    }
        const updatedInput = {
            ...input,
            flightStatus: input.flightStatus === "거절" ? "대기" : input.flightStatus,
            departureTime: new Date(input.departureTime).toISOString(),
            arrivalTime: new Date(input.arrivalTime).toISOString(),
            userId: user.userId, // 수정할 때도 사용자 ID 설정
        };
        const departureTime = new Date(input.departureTime);
        const arrivalTime = new Date(input.arrivalTime);

        // 필드 검증
        if (!/^[A-Z]{2}[0-9]{4}$/.test(input.flightNumber)) {
            toast.error("항공편 번호는 대문자 2개와 숫자 4개로 구성되어야 합니다.");
            return;
        }

            if (!input.flightNumber) {
                toast.error("항공편 번호를 입력하세요.");
                return;
            }
            if (!input.departureTime) {
                toast.error("출발 시간을 입력하세요.");
                return;
            }
            if (!input.arrivalTime) {
                toast.error("도착 시간을 입력하세요.");
                return;
            }
            if (input.flightPrice <= 0) {  // 가격이 0 이하일 때 경고
                toast.error("가격은 0원 이상이여야합니다.");
                return;
            }
            if (!input.departureAirport) {
                toast.error("출발 공항을 선택하세요.");
                return;
            }
            if (!input.arrivalAirport) {
                toast.error("도착 공항을 선택하세요.");
                return;
            }

            if (input.departureAirport === input.arrivalAirport) {
                toast.error("출발 공항과 도착 공항이 동일할 수 없습니다.");
                return;
            }
    
            // 도착 시간이 출발 시간보다 빠른지 확인
            if (arrivalTime <= departureTime) {
                toast.error("도착 시간은 출발 시간보다 늦어야 합니다.");
                return;
            }
    
        await axios.put("/flight/", updatedInput);
        loadList();
        closeModal();
    }, [input, user.userId, loadList]);
    

    // memo
    const addMode = useMemo(() => {
        return input?.flightId === "";
    }, [input]);

    const changeInput = useCallback((e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
        
    }, [input]);

    const clearInput = useCallback(() => {
        setInput({
            flightId: "",
            flightNumber: "",
            departureTime: "",
            arrivalTime: "",
            flightTime: "",
            departureAirport: "",
            arrivalAirport: "",
            userId: "", // 초기화 시 비워둡니다.
            flightPrice: "",
            flightStatus: "대기",
        });
    }, [input]);

    
    

    const openModal = useCallback(() => {
        if (user.userType !== "AIRLINE") {
            toast.error("항공편 등록 권한이 없습니다.");
            return;
        }
        setInput((prevInput) => ({
            ...prevInput,
            userId: user.userId, // 현재 로그인된 사용자 ID를 설정
        }));
        const target = Modal.getOrCreateInstance(modal.current);
        target.show();
    }, [user.userId, modal]);

    const closeModal = useCallback(() => {
        const target = Modal.getInstance(modal.current);
        target.hide();
        clearInput();
    }, [modal]);

    const saveFlight = useCallback(async () => {
        if (input.departureTime && input.arrivalTime) {
            const departureTime = new Date(input.departureTime);
            const arrivalTime = new Date(input.arrivalTime);
    
            // 필드 검증
            if (!/^[A-Z]{2}[0-9]{4}$/.test(input.flightNumber)) {
                toast.error("항공편 번호는 대문자 2개와 숫자 4개로 구성되어야 합니다.");
                return;
            }

            if (!input.flightNumber) {
                toast.error("항공편 번호를 입력하세요.");
                return;
            }
            if (!input.departureTime) {
                toast.error("출발 시간을 입력하세요.");
                return;
            }
            if (!input.arrivalTime) {
                toast.error("도착 시간을 입력하세요.");
                return;
            }
            if (input.flightPrice <= 0) {  // 가격이 0 이하일 때 경고
                toast.error("가격은 0원 이상이여야합니다.");
                return;
            }
            if (!input.departureAirport) {
                toast.error("출발 공항을 선택하세요.");
                return;
            }
            if (!input.arrivalAirport) {
                toast.error("도착 공항을 선택하세요.");
                return;
            }

            if (input.departureAirport === input.arrivalAirport) {
                toast.error("출발 공항과 도착 공항이 동일할 수 없습니다.");
                return;
            }
    
            // 도착 시간이 출발 시간보다 빠른지 확인
            if (arrivalTime <= departureTime) {
                toast.error("도착 시간은 출발 시간보다 늦어야 합니다.");
                return;
            }
    
            // 시간을 ISO 형식으로 변환하여 서버로 전송
            const flightData = {
                ...input,
                departureTime: departureTime.toISOString(),
                arrivalTime: arrivalTime.toISOString(),
                userId: user.userId, // 현재 로그인된 사용자 ID 추가
            };

            

            const copy = {...input};
            delete copy.flightId;

            await axios.post("/flight/", flightData, copy);
            loadList();
            closeModal();
        }
    }, [input, user.userId, loadList, closeModal]);
    

    const editFlight = useCallback((flight) => {
        setInput({ ...flight });
        openModal();
    }, [openModal]);

    // 검색창 관련
    const [column, setColumn] = useState("flight_number");
    const [keyword, setKeyword] = useState("");

    const searchFlightList = useCallback(async () => {
        if (keyword.trim().length === 0) {
            loadList()
            return;
        }
        
         // 현재 시간
    const now = new Date();
        
        const resp = await axios.get(`/flight/column/${column}/keyword/${encodeURIComponent(keyword)}`);
     // 항공편 리스트에서 현재 로그인된 사용자 ID와 도착 시간이 현재 시간보다 이후인 항공편만 필터링
     const filteredFlights = resp.data.filter(flight => {
        const arrivalTime = new Date(flight.arrivalTime);
        return flight.userId === user.userId && arrivalTime >= now;
    });
    
    setFlightList(filteredFlights);
    }, [column, keyword, flightList]);

    

    // 뷰
    return (
        <>
        {/* 로딩 중 상태 메시지 */}
        {isLoading ? (
                <div className="text-center mt-5">
                    <p>로딩 중입니다...</p>
                </div>
            ) : (
                <>
         {/* 검색 화면 */}
         <div className="row mt-4">
            <div className="col-md-8 offset-md-2">
                
                <div className="input-group">
                    <div className="col-3">
            <select className="form-select"
                value={column} onChange={e => setColumn(e.target.value)}>
                <option value="flight_number">항공편 번호</option>
                <option value="departure_airport">출발공항</option>
                <option value="arrival_airport">도착공항</option>
                <option value="flight_status">결제상태</option>
            </select>
            </div>
            <div className="col-7">
            <input type="text" className="form-control"
                value={keyword} onChange={e =>setKeyword(e.target.value)} 
                placeholder="검색어 입력" />
                </div>
                <div className="col-2">
            <button type="button" className="btn btn-secondary"
                onClick={searchFlightList}>
                <FaMagnifyingGlass />
            </button>
            </div>
                </div>
                
            </div>
        </div>

            <div className="row mt-4">
                <div className="col">
                    <table className="table">
                        <thead>
                        <tr>
                        <div className="row mt-4">
                        <div className="col">
                            <button className="btn btn-success" onClick={openModal}>
                            <FaPlus/>신규등록
                         </button>
                        </div>
                        </div>  
                        
                        </tr>
                        </thead>
                        <tbody className="table-dark">
                        <tr>
                            <th>항공편번호</th>
                            <th>출발시간</th>
                            <th>도착시간</th>
                            <th>운항시간</th>
                            <th>출발공항</th>
                            <th>도착공항</th>
                            <th>ID</th>
                            <th>가격</th>
                            <th>상태</th>
                            <th>메뉴</th>
                        </tr>
                        </tbody>
                        <tfoot>
                            {flightList.map((flight) => (
                                <tr key={flight.flightId}>
                                    <td>
                                        <NavLink to={"/flight/detail/" + flight.flightId}>
                                            {flight.flightNumber}
                                        </NavLink>
                                    </td>
                                    <td>{new Date(flight.departureTime).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>{new Date(flight.arrivalTime).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>{flight.flightTime}</td>
                                    <td>{flight.departureAirport}</td>
                                    <td>{flight.arrivalAirport}</td>
                                    <td>{flight.userId}</td>
                                    <td>{Number(flight.flightPrice).toLocaleString()}원</td>
                                    <td>{flight.flightStatus}</td>
                                    <td>
                                        <FaEdit 
                                            className={`text-warning ${flight.flightStatus === "승인" ? "disabled" : ""}`} 
                                            onClick={() => {
                                                if (flight.flightStatus === "승인") {
                                                    alert("수정이 불가능합니다.");
                                                } else {
                                                    editFlight(flight);
                                                }
                                            }} 
                                        />
                                        <FaTrash 
                                            className={`text-danger ms-2 ${flight.flightStatus === "승인" ? "disabled" : ""}`} 
                                            onClick={() => {
                                                if (flight.flightStatus === "승인") {
                                                    alert("삭제가 불가능합니다.");
                                                } else {
                                                    deleteFlight(flight.flightId);
                                                }
                                            }} 
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* 모달 */}
            <div className="modal fade" tabIndex="-1" ref={modal} data-bs-backdrop="static">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{addMode ? '항공편 수정' : '항공편 등록'}</h5>
                            <button type="button" className="btn-close" onClick={closeModal}></button>
                        </div>

                        <div className="modal-body">
                            {/* 입력 필드들 */}
                            <div className="mb-3">
                                <label>항공편 번호</label>
                                <input type="text" name="flightNumber" className="form-control" value={input.flightNumber} onChange={changeInput} placeholder="AA1234"/>
                            </div>
                            <div className="mb-3">
                                <label>출발 시간</label>
                                <input type="datetime-local" name="departureTime" className="form-control" value={input.departureTime} onChange={changeInput} min={currentDateTime} />
                            </div>
                            <div className="mb-3">
                                <label>도착 시간</label>
                                <input type="datetime-local" name="arrivalTime" className="form-control" value={input.arrivalTime} onChange={changeInput} min={currentDateTime} />
                            </div>
                            <div className="mb-3">
                                <label>운항 시간</label>
                                <input type="text" name="flightTime" className="form-control" readOnly value={input.flightTime} onChange={changeInput} />
                            </div>
                            <div className="mb-3">
                                <label>출발 공항</label>
                                <select name="departureAirport" className="form-control" value={input.departureAirport} onChange={changeInput}>
                                    <option>출발 공항 선택</option>
                                    <option>서울/인천(ICN)</option>
                                    <option>서울/김포(GMP)</option>
                                    <option>제주(CJU)</option>
                                    <option>도쿄/나리타(NRT)</option>
                                    <option>오사카/간사이(KIX)</option>
                                    <option>삿포로(CTS)</option>
                                    <option>나트랑(CXR)</option>
                                    <option>다낭(DAD)</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label>도착 공항</label>
                                <select name="arrivalAirport" className="form-control" value={input.arrivalAirport} onChange={changeInput}>
                                    <option>도착 공항 선택</option>
                                    <option>서울/인천(ICN)</option>
                                    <option>서울/김포(GMP)</option>
                                    <option>제주(CJU)</option>
                                    <option>도쿄/나리타(NRT)</option>
                                    <option>오사카/간사이(KIX)</option>
                                    <option>삿포로(CTS)</option>
                                    <option>나트랑(CXR)</option>
                                    <option>다낭(DAD)</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                
                                <input 
                                    type="hidden" 
                                    name="userId" 
                                    className="form-control" 
                                    value={user.userId} // userId는 비활성화
                                    readOnly // 비활성화 설정
                                />
                            </div>
                            <div className="mb-3">
                                <label>가격</label>
                                <input type="number" name="flightPrice" className="form-control" value={input.flightPrice} onChange={changeInput} />
                            </div>
                            <div className="mb-3">
                                <label>상태</label>
                                <span className="badge bg-secondary" 
                                name="flightStatus">
                                    {input.flightStatus}
                                </span>
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary btn-manual-close"
                                    onClick={closeModal}>닫기</button>
                            {addMode ? (
                                <button type="button" className="btn btn-success"
                                        onClick={saveFlight}>저장</button>
                            ) : (
                                <button type="button" className="btn btn-warning"
                                        onClick={updateFlight}>수정</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            </>
            )}
        </>
    );
};

export default Flight;