import { Navigate, useNavigate, useParams } from "react-router";
import { useEffect, useCallback, useState, useRef } from 'react';
import axios from "axios";
import { Modal } from "bootstrap";
import { toast } from "react-toastify";

const FlightDetail = () => {
    const { flightId } = useParams();
    const navigate = useNavigate();
    const [flight, setFlight] = useState(null);
    const [load, setLoad] = useState(false);
    const [input, setInput] = useState({});
    const modalRef = useRef();
    const [flightPassangerInfo, setFlightPassangerInfo]= useState([]);//탑승자명단 추가

    useEffect(() => {
        loadFlight();
        flightPassangerList();//탑승자명단 추가
    }, []);

 // `datetime-local` 형식으로 변환하는 함수
 const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // "yyyy-MM-ddTHH:mm" 형식으로 자르기
};

const flightPassangerList = useCallback(async () => {//탑승자명단 추가
    const resp = await axios.get(`/seats/passanger/${flightId}`);
    setFlightPassangerInfo(resp.data); 
}, [flightId]);

const loadFlight = useCallback(async () => {
    try {
        const resp = await axios.get(`/flight/${flightId}`);

        setFlight(resp.data);
        setInput({
            ...resp.data,
            departureTime: formatDateForInput(resp.data.departureTime),
            arrivalTime: formatDateForInput(resp.data.arrivalTime)
        });
    } catch (e) {
        setFlight(null);
    }
    setLoad(true);
}, [flightId]);

    const deleteFlight = useCallback(async () => {
        await axios.delete(`/flight/${flightId}`);
        navigate("/flight");
    }, [flightId, navigate]);

    const openModal = useCallback(() => {
        const modal = Modal.getOrCreateInstance(modalRef.current);
        modal.show();
    }, []);

    const closeModal = useCallback(() => {
        const modal = Modal.getInstance(modalRef.current);
        modal.hide();
    }, []);

    // 운항 시간 계산 함수
    const calculateFlightTime = (departureTime, arrivalTime) => {
        const depTime = new Date(departureTime);
        const arrTime = new Date(arrivalTime);

        const diffMs = arrTime - depTime; // 시간 차이 (밀리초)
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60)); // 시간
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)); // 분

        return `${diffHours}시간 ${diffMinutes}분`;
    };

    const updateFlight = useCallback(async () => {
        const updatedInput = {
            ...input,
            flightStatus: input.flightStatus === "거절" ? "대기" : input.flightStatus,
            departureTime: new Date(input.departureTime).toISOString(),
            arrivalTime: new Date(input.arrivalTime).toISOString(),
            
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
        loadFlight();
        closeModal();
    }, [input, loadFlight, closeModal]);

    // 출발 시간 또는 도착 시간이 변경될 때 운항 시간 자동 계산
    useEffect(() => {
        if (input.departureTime && input.arrivalTime) {
            const flightTime = calculateFlightTime(input.departureTime, input.arrivalTime);
            setInput(prev => ({ ...prev, flightTime }));
        }
    }, [input.departureTime, input.arrivalTime]);

    if (!load) {
        return (
            <div className="container mt-4">
                <h1>항공편 상세 정보</h1>
                <div className="row">
                    <div className="col-sm-3">
                        <span className="placeholder col-6"></span>
                    </div>
                </div>
                <div className="text-center mt-4">
                    <button className="btn btn-secondary placeholder col-2">목록보기</button>
                </div>
            </div>
        );
    }

    if (flight === null) {
        return <Navigate to="/notFound" />;
    }

    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4">항공편 상세정보</h1>
            <div className="card p-4 shadow">
                <div className="row mb-3">
                    <div className="col-sm-4"><strong>항공편 번호:</strong> {flight.flightNumber}</div>
                </div>
                <div className="row mb-3">
                    <div className="col-sm-4"><strong>출발 시간:</strong> {new Date(flight.departureTime).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div className="row mb-3">
                    <div className="col-sm-4"><strong>도착 시간:</strong> {new Date(flight.arrivalTime).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div className="row mb-3">
                    <div className="col-sm-4"><strong>운항 시간:</strong> {flight.flightTime}</div>
                </div>
                <div className="row mb-3">
                    <div className="col-sm-4"><strong>출발 공항:</strong> {flight.departureAirport}</div>
                </div>
                <div className="row mb-3">
                    <div className="col-sm-4"><strong>도착 공항:</strong> {flight.arrivalAirport}</div>
                </div>
                <div className="row mb-3">
                    <div className="col-sm-4"><strong>가격:</strong> {Number(flight.flightPrice).toLocaleString()}원</div>
                </div>
                <div className="row mb-3">
                    <div className="col-sm-4"><strong>상태:</strong>
                    <span className="text-dark bg-warning border border-warning p-1 rounded">{flight.flightStatus}</span>
                    </div>
                </div>
            </div>
{/* 버튼들 */}
<div className="text-center mt-4">
            {flight.flightStatus !== "승인" && (
        <>
            <button className="btn btn-warning ms-2" onClick={openModal}>수정하기</button>
            <button className="btn btn-danger ms-2" onClick={deleteFlight}>삭제하기</button>
        </>
    )}
                <button className="btn btn-secondary ms-2" onClick={() => navigate("/flight")}>목록보기</button>
            </div>

            {/* 탑승자명단 추가 */}
                <h3 className="text-center my-4 mt-4">탑승자명단</h3>

                <div className="card p-4 shadow">
                <div className="row mb-3">
            <table className="container" style={{width:"1000px"}}>
            <thead>
                <tr>
                    <th>좌석번호</th>
                    <th>한글이름</th>
                    <th>생년월일</th>
                </tr>
                </thead>
                <tbody>
                {flightPassangerInfo.map((passanger, index) => (
            <tr key={index}>
                <td>{passanger.paymentDetailName}</td>
                <td>{passanger.paymentDetailPassanger}</td>
                <td>{passanger.paymentDetailBirth}</td>
            </tr>
        ))}
                </tbody>
            </table>
            </div>
            </div>

            

            {/* 수정 모달 */}
            <div className="modal fade" tabIndex="-1" ref={modalRef}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">항공편 수정</h5>
                            <button type="button" className="btn-close" onClick={closeModal}></button>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className="mb-3">
                                    <label>항공편 번호</label>
                                    <input type="text" name="flightNumber" className="form-control" value={input.flightNumber} onChange={e => setInput({ ...input, flightNumber: e.target.value })} placeholder="AA1234"/>
                                </div>
                                <div className="mb-3">
                                    <label>출발 시간</label>
                                    <input type="datetime-local" name="departureTime" className="form-control" value={input.departureTime} onChange={e => setInput({ ...input, departureTime: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label>도착 시간</label>
                                    <input type="datetime-local" name="arrivalTime" className="form-control" value={input.arrivalTime} onChange={e => setInput({ ...input, arrivalTime: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label>운항 시간</label>
                                    <input type="text" name="flightTime" className="form-control" value={input.flightTime} readOnly />
                                </div>
                                <div className="mb-3">
                                    <label>출발 공항</label>
                                    <select name="departureAirport" className="form-control" value={input.departureAirport} onChange={e => setInput({ ...input, departureAirport: e.target.value })}>
                                        <option disabled>출발 공항 선택</option>
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
                                    <select name="arrivalAirport" className="form-control" value={input.arrivalAirport} onChange={e => setInput({ ...input, arrivalAirport: e.target.value })}>
                                        <option disabled>도착 공항 선택</option>
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
                                    <label>가격</label>
                                    <input type="number" name="flightPrice" className="form-control" value={input.flightPrice} onChange={e => setInput({ ...input, flightPrice: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label>상태</label>
                                    <input type="text" name="flightStatus" className="form-control" value={input.flightStatus} readOnly />
                                </div>
                            </form>
                        </div>
                        
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={closeModal}>닫기</button>
                            <button type="button" className="btn btn-warning" onClick={updateFlight}>수정</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default FlightDetail;