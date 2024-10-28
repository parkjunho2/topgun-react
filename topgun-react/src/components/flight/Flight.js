import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { FaTrash, FaEdit } from "react-icons/fa";
import { Modal } from "bootstrap";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { NavLink } from "react-router-dom";
import { useRecoilState } from "recoil";
import { userState } from "../../util/recoil";

const Flight = () => {
    const [flightList, setFlightList] = useState([]);
    const [input, setInput] = useState({
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

    const modalRef = useRef();
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
        const resp = await axios.get("http://localhost:8080/flight/");

        // 현재 시간 (오늘 날짜)
    const now = new Date();

        // 항공편 리스트에서 현재 로그인된 사용자 ID와 도착 시간이 현재 시간보다 이후인 항공편만 필터링
    const filteredFlights = resp.data.filter(flight => {
        const arrivalTime = new Date(flight.arrivalTime);
        return flight.userId === user.userId && arrivalTime >= now;
    });
    
    setFlightList(filteredFlights);
}, [user.userId]);

    const deleteFlight = useCallback(async (flightId) => {
        const choice = window.confirm("정말 삭제하시겠습니까?");
        if (!choice) return;
        await axios.delete(`http://localhost:8080/flight/${flightId}`);
        loadList();
    }, [loadList]);

    const updateFlight = useCallback(async () => {
        const updatedInput = {
            ...input,
            flightStatus: input.flightStatus === "거절" ? "대기" : input.flightStatus,
            departureTime: new Date(input.departureTime).toISOString(),
            arrivalTime: new Date(input.arrivalTime).toISOString(),
            userId: user.userId, // 수정할 때도 사용자 ID 설정
        };
    
        await axios.put("http://localhost:8080/flight/", updatedInput);
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
    }, []);

    const addInput = useCallback(() => {
        if (input.departureTime && input.arrivalTime) {
            const departure = new Date(input.departureTime);
            const arrival = new Date(input.arrivalTime);
    
            // 필드 검증
            if (!input.flightNumber) {
                alert("항공편 번호를 입력하세요.");
                return;
            }
            if (!input.departureTime) {
                alert("출발 시간을 입력하세요.");
                return;
            }
            if (!input.arrivalTime) {
                alert("도착 시간을 입력하세요.");
                return;
            }
            if (input.flightPrice <= 0) {  // 가격이 0 이하일 때 경고
                alert("가격은 0원 이상이어야 합니다.");
                return;
            }
            if (!input.departureAirport) {
                alert("출발 공항을 선택하세요.");
                return;
            }
            if (!input.arrivalAirport) {
                alert("도착 공항을 선택하세요.");
                return;
            }
    
            // 도착 시간이 출발 시간보다 빠른지 확인
            if (arrival <= departure) {
                alert("도착 시간은 출발 시간보다 늦어야 합니다.");
                return;
            }
        }
    
        const flightData = {
            ...input,
            // 입력된 시간을 UTC로 변환하여 서버로 전송
            departureTime: new Date(input.departureTime).toISOString(),
            arrivalTime: new Date(input.arrivalTime).toISOString(),
            userId: user.userId, // 현재 로그인된 사용자 ID 추가
        };
    
        axios({
            url: "http://localhost:8080/flight/",
            method: "post",
            data: flightData,
        })
        .then(resp => {
            clearInput(); // 입력창 초기화
            loadList(); // 목록 다시 불러오기
        });
    }, [input, user.userId, loadList, clearInput]);
    

    const openModal = useCallback(() => {
        setInput((prevInput) => ({
            ...prevInput,
            userId: user.userId, // 현재 로그인된 사용자 ID를 설정
        }));
        const modal = Modal.getOrCreateInstance(modalRef.current);
        modal.show();
    }, [user.userId]);

    const closeModal = useCallback(() => {
        const modal = Modal.getInstance(modalRef.current);
        modal.hide();
        clearInput();
    }, [clearInput]);

    const saveFlight = useCallback(async () => {
        if (input.departureTime && input.arrivalTime) {
            const departure = new Date(input.departureTime);
            const arrival = new Date(input.arrivalTime);
    
            if (arrival <= departure) {
                alert("도착 시간은 출발 시간보다 늦어야 합니다.");
                return;
            }
    
            // 시간을 ISO 형식으로 변환하여 서버로 전송
            const flightData = {
                ...input,
                departureTime: departure.toISOString(),
                arrivalTime: arrival.toISOString(),
                userId: user.userId, // 현재 로그인된 사용자 ID 추가
            };
    
            await axios.post("http://localhost:8080/flight/", flightData);
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
        
        const resp = await axios.get(`http://localhost:8080/flight/column/${column}/keyword/${encodeURIComponent(keyword)}`);
       // 항공편 리스트에서 현재 로그인된 사용자 ID와 일치하는 항공편만 필터링
       const filteredFlights = resp.data.filter(flight => flight.userId === user.userId);
        setFlightList(filteredFlights);
    }, [column, keyword, flightList]);

    

    // 뷰
    return (
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
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <td>
                                <input type="text" className="form-control"
                                       placeholder="항공편 번호"
                                       name="flightNumber"
                                       value={input.flightNumber}
                                       onChange={changeInput} />
                            </td>
                            <td>
                                <input type="datetime-local" className="form-control"
                                       name="departureTime"
                                       value={input.departureTime}
                                       onChange={changeInput}
                                       min={currentDateTime} />
                            </td>
                            <td>
                                <input type="datetime-local" className="form-control"
                                       name="arrivalTime"
                                       value={input.arrivalTime}
                                       onChange={changeInput}
                                       min={currentDateTime}/>
                            </td>
                            <td>
                                <input type="text" className="form-control"
                                placeholder="운항 시간"
                                       name="flightTime"
                                       value={input.flightTime}
                                       onChange={changeInput} />
                            </td>
                            <td>
                                <select name="departureAirport" className="form-control" value={input.departureAirport} onChange={changeInput}>
                                    <option>출발 공항 선택</option>
                                    <option>서울/인천(ICN)</option>
                                    <option>서울/김포(GMP)</option>
                                    <option>광주(KWJ)</option>
                                    <option>대구(TAE)</option>
                                    <option>제주(CJU)</option>
                                    <option>여수(RSU)</option>
                                    <option>도쿄/나리타(NRT)</option>
                                    <option>오사카/간사이(KIX)</option>
                                    <option>나트랑(CXR)</option>
                                </select>
                            </td>
                            <td>
                                <select name="arrivalAirport" className="form-control" value={input.arrivalAirport} onChange={changeInput}>
                                    <option>도착 공항 선택</option>
                                    <option>서울/인천(ICN)</option>
                                    <option>서울/김포(GMP)</option>
                                    <option>광주(KWJ)</option>
                                    <option>대구(TAE)</option>
                                    <option>제주(CJU)</option>
                                    <option>여수(RSU)</option>
                                    <option>도쿄/나리타(NRT)</option>
                                    <option>오사카/간사이(KIX)</option>
                                    <option>나트랑(CXR)</option>
                                </select>
                            </td>

                            <td>
                                <input type="hidden" className="form-control"
                                       placeholder="아이디"
                                       name="userId"
                                       value={user.userId} // userId는 비활성화
                                       readOnly // 비활성화 설정
                                       onChange={changeInput} />
                            </td>
                            <td>
                                <input type="number" className="form-control"
                                       placeholder="가격"
                                       name="flightPrice"
                                       value={input.flightPrice}
                                       onChange={changeInput} />
                            </td>
                            <td>
                                <span className="badge bg-secondary">
                                    {input.flightStatus}
                                </span>
                            </td>
                            <td>
                                <button type="button"
                                        className="btn btn-success"
                                        onClick={addInput}>
                                    신규 등록
                                </button>
                            </td>
                        </tr>
                        </thead>
                        <tbody className="table-dark">
                        <tr>
                            <th>항공편 번호</th>
                            <th>출발 시간</th>
                            <th>도착 시간</th>
                            <th>운항 시간</th>
                            <th>출발 공항</th>
                            <th>도착 공항</th>
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
            <div className="modal fade" tabIndex="-1" ref={modalRef} data-bs-backdrop="static">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{input.flightNumber ? '항공편 수정' : '항공편 등록'}</h5>
                            <button type="button" className="btn-close" onClick={closeModal}></button>
                        </div>
                        <div className="modal-body">
                            {/* 입력 필드들 */}
                            <div className="mb-3">
                                <label>항공편 번호</label>
                                <input type="text" name="flightNumber" className="form-control" value={input.flightNumber} onChange={changeInput} />
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
                                <input type="text" name="flightTime" className="form-control" value={input.flightTime} onChange={changeInput} />
                            </div>
                            <div className="mb-3">
                                <label>출발 공항</label>
                                <select name="departureAirport" className="form-control" value={input.departureAirport} onChange={changeInput}>
                                    <option>출발 공항 선택</option>
                                    <option>서울/인천(ICN)</option>
                                    <option>서울/김포(GMP)</option>
                                    <option>광주(KWJ)</option>
                                    <option>대구(TAE)</option>
                                    <option>제주(CJU)</option>
                                    <option>여수(RSU)</option>
                                    <option>도쿄/나리타(NRT)</option>
                                    <option>오사카/간사이(KIX)</option>
                                    <option>나트랑(CXR)</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label>도착 공항</label>
                                <select name="arrivalAirport" className="form-control" value={input.arrivalAirport} onChange={changeInput}>
                                    <option>도착 공항 선택</option>
                                    <option>서울/인천(ICN)</option>
                                    <option>서울/김포(GMP)</option>
                                    <option>광주(KWJ)</option>
                                    <option>대구(TAE)</option>
                                    <option>제주(CJU)</option>
                                    <option>여수(RSU)</option>
                                    <option>도쿄/나리타(NRT)</option>
                                    <option>오사카/간사이(KIX)</option>
                                    <option>나트랑(CXR)</option>
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
    );
};

export default Flight;