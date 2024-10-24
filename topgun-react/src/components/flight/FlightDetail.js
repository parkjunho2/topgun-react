import { Navigate, useNavigate, useParams } from "react-router";
import { useEffect, useCallback, useState, useRef } from 'react';
import axios from "axios";
import { Modal } from "bootstrap";

const FlightDetail = () => {
    const { flightId } = useParams();
    const navigate = useNavigate();
    const [flight, setFlight] = useState(null);
    const [load, setLoad] = useState(false);
    const [input, setInput] = useState({});
    const modalRef = useRef();

    useEffect(() => {
        loadFlight();
    }, []);

    const loadFlight = useCallback(async () => {
        try {
            const resp = await axios.get(`http://localhost:8080/flight/${flightId}`);
            setFlight(resp.data);
            setInput(resp.data);
        } catch (e) {
            setFlight(null);
        }
        setLoad(true);
    }, [flightId]);

    const deleteFlight = useCallback(async () => {
        await axios.delete(`http://localhost:8080/flight/${flightId}`);
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

    const updateFlight = useCallback(async () => {
        await axios.put("http://localhost:8080/flight/", input);
        loadFlight();
        closeModal();
    }, [input, loadFlight, closeModal]);

    if (!load) {
        return (
            <div className="container mt-4">
                <h1>항공편 상세 정보</h1>
                <div className="row">
                    {Array(7).fill().map((_, index) => (
                        <div className="col-sm-3" key={index}>
                            <span className="placeholder col-6"></span>
                        </div>
                    ))}
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
                <div className="col-sm-4"><strong>출발 시간:</strong> {new Date(flight.departureTime).toLocaleString()}</div>
                </div>
                <div className="row mb-3">
                <div className="col-sm-4"><strong>도착 시간:</strong> {new Date(flight.arrivalTime).toLocaleString()}</div>
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
                <button className="btn btn-warning ms-2" onClick={openModal}>수정하기</button>
                <button className="btn btn-danger ms-2" onClick={deleteFlight}>삭제하기</button>
                <button className="btn btn-secondary ms-2" onClick={() => navigate("/flight")}>목록보기</button>
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
                                    <input type="text" name="flightNumber" className="form-control" value={input.flightNumber} onChange={e => setInput({ ...input, flightNumber: e.target.value })} />
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
                                    <label>출발 공항</label>
                                    <select name="departureAirport" className="form-control" value={input.departureAirport} onChange={e => setInput({ ...input, departureAirport: e.target.value })}>
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
                                    <select name="arrivalAirport" className="form-control" value={input.arrivalAirport} onChange={e => setInput({ ...input, arrivalAirport: e.target.value })}>
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
                                    <label>총 좌석 수</label>
                                    <input type="number" name="flightTotalSeat" className="form-control" value={input.flightTotalSeat} onChange={e => setInput({ ...input, flightTotalSeat: e.target.value })} />
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
