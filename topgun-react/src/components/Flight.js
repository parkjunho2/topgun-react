import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { FaTrash, FaEdit } from "react-icons/fa";
import { Modal } from "bootstrap";
import { FaMagnifyingGlass } from "react-icons/fa6";

const Flight = () => {
    const [flightList, setFlightList] = useState([]);
    const [input, setInput] = useState({
        flightNumber: "",
        departureTime: "",
        arrivalTime: "",
        flightTime: "",
        departureAirport: "",
        arrivalAirport: "",
        userId: "",
        flightTotalSeat: "",
        flightStatus: "대기", // 기본 상태
    });

    const modalRef = useRef();

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
        setFlightList(resp.data);
    }, []);

    const deleteFlight = useCallback(async (flightId) => {
        const choice = window.confirm("정말 삭제하시겠습니까?");
        if (!choice) return;
        await axios.delete(`http://localhost:8080/flight/${flightId}`);
        loadList();
    }, [loadList]);

    const updateFlight = useCallback(async ()=>{
        await axios.put("http://localhost:8080/flight/", input);
        loadList();
        closeModal();
    }, [input]);

      //memo
      const addMode = useMemo(()=>{
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
            userId: "",
            flightTotalSeat: "",
            flightStatus: "대기",
        });
    }, []);

    const addInput = useCallback(()=>{
        if (input.departureTime && input.arrivalTime) {
            const departure = new Date(input.departureTime);
            const arrival = new Date(input.arrivalTime);
    
            if (arrival <= departure) {
                alert("도착 시간은 출발 시간보다 늦어야 합니다.");
                return;
            }
        }

        axios({
            url:"http://localhost:8080/flight/",
            method:"post",
            data: input
        })
        .then(resp=>{
            clearInput();//입력창 초기화
            loadList();//목록 다시 불러오기
        });
    }, [input]);

    const openModal = useCallback(() => {
        const modal = Modal.getOrCreateInstance(modalRef.current);
        modal.show();
    }, []);

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
        }
    

        await axios.post("http://localhost:8080/flight/", input);
        loadList();
        closeModal();
    }, [input, loadList, closeModal]);

    const editFlight = useCallback((flight) => {
        setInput({ ...flight });
        openModal();
    }, [openModal]);

    //검색창 관련
    const [column, setColumn] = useState("flight_number");
    const [keyword, setKeyword] = useState("");

    const searchFlightList = useCallback(async ()=>{
        if(keyword.length === 0) return;
    const resp = await axios.get(`http://localhost:8080/flight/${column}/keyword/${encodeURIComponent(keyword)}`);
    setFlightList(resp.data);
}, [column, keyword, flightList]);

    
    // 뷰
    return (
        <>

        {/* 검색 화면 */}
        <div className="row mt-2">
            <div className="col-md-8 col-sm-10">
                <div className="input-group">
                    <select name="column" className="form-select w-auto"
                        value={column} onChange={e=>setColumn(e.target.value)}>
                        <option value="flight_number">항공편 번호</option>
                        <option value="departure_airport">출발항공</option>
                        <option value="arrival_airport">도착항공</option>
                    </select>
                    <input type="text" className="form-control w-auto"
                        value={keyword} onChange={e=>setKeyword(e.target.value)}/>
                    <button type="button" className="btn btn-secondary"
                            onClick={searchFlightList}>
                        <FaMagnifyingGlass/>
                    </button>
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
                                           onChange={changeInput} />
                                </td>
                                <td>
                                    <input type="datetime-local" className="form-control"
                                           name="arrivalTime"
                                           value={input.arrivalTime}
                                           onChange={changeInput} />
                                </td>
                                <td>
                                    <input type="text" className="form-control"
                                           name="flightTime"
                                           value={input.flightTime}
                                           onChange={changeInput} />
                                </td>
                                <td>
                                    <select name="departureAirport" className="form-control" value={input.departureAirport} onChange={changeInput}>
                                        <option>출발 공항 선택</option>
                                        <option>김포</option>
                                        <option>인천</option>
                                        <option>제주</option>
                                        <option>도쿄</option>
                                    </select>
                                </td>
                                <td>
                                    <select name="arrivalAirport" className="form-control" value={input.arrivalAirport} onChange={changeInput}>
                                        <option>도착 공항 선택</option>
                                        <option>김포</option>
                                        <option>인천</option>
                                        <option>제주</option>
                                        <option>도쿄</option>
                                    </select>
                                </td>

                                <td>
                                    <input type="text" className="form-control"
                                           placeholder="아이디"
                                           name="userId"
                                           value={input.userId}
                                           onChange={changeInput} />
                                </td>
                                <td>
                                    <input type="number" className="form-control"
                                           placeholder="총 좌석 수"
                                           name="flightTotalSeat"
                                           value={input.flightTotalSeat}
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
                                <th>총 좌석 수</th>
                                <th>상태</th>
                                <th>메뉴</th>
                            </tr> 
                        </tbody>
                        <tfoot>
                            {flightList.map((flight) => (
                                <tr key={flight.flightId}>
                                    <td>{flight.flightNumber}</td>
                                    <td>{new Date(flight.departureTime).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>{new Date(flight.arrivalTime).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'})}</td>
                                    <td>{flight.flightTime}</td>
                                    <td>{flight.departureAirport}</td>
                                    <td>{flight.arrivalAirport}</td>
                                    <td>{flight.userId}</td>
                                    <td>{flight.flightTotalSeat}</td>
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
                                <input type="datetime-local" name="departureTime" className="form-control" value={input.departureTime} onChange={changeInput} />
                            </div>
                            <div className="mb-3">
                                <label>도착 시간</label>
                                <input type="datetime-local" name="arrivalTime" className="form-control" value={input.arrivalTime} onChange={changeInput} />
                            </div>
                            <div className="mb-3">
                                <label>운항 시간</label>
                                <input type="text" name="flightTime" className="form-control" value={input.flightTime} onChange={changeInput} />
                            </div>
                            <div className="mb-3">
                                <label>출발 공항</label>
                                <input type="text" name="departureAirport" className="form-control" value={input.departureAirport} onChange={changeInput} />
                            </div>
                            <div className="mb-3">
                                <label>도착 공항</label>
                                <input type="text" name="arrivalAirport" className="form-control" value={input.arrivalAirport} onChange={changeInput} />
                            </div>
                            <div className="mb-3">
                                <label>ID</label>
                                <input type="text" name="userId" className="form-control" value={input.userId} onChange={changeInput} />
                            </div>
                            <div className="mb-3">
                                <label>총 좌석 수</label>
                                <input type="number" name="flightTotalSeat" className="form-control" value={input.flightTotalSeat} onChange={changeInput} />
                            </div>
                            <div className="mb-3">
                                <label>상태</label>
                                <span className="badge bg-secondary" 
                                name="flightStatus"
                                value={input.flightStatus}
                                onChange={changeInput}>
                                    대기
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

