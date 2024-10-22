import './BookingList.css';
import { useNavigate } from 'react-router';
import { IoRemoveOutline } from "react-icons/io5";
import React, { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';

const BookingList = () => {
    //navigate
    const navigate = useNavigate();
    const [departureTime, setDepartureTime] = useState(12); // 출발 시간 초기 값 (시간.분 형태)
    const [departureRightTime, setDepartureRightTime] = useState(12); // 출발 시간 초기 값 (시간.분 형태)

    const [returnTime, setReturnTime] = useState(23.5); // 오는 편 시간 초기 값 (오후 11시 30분)
    const [returnRightTime, setReturnRightTime] = useState(23.5); // 오는 편 시간 초기 값 (오후 11시 30분)

    // 시간 포맷팅 함수 (24시간 -> 12시간 AM/PM, 분 포함)
    const formatTime = (time) => {
        const hour = Math.floor(time); // 정수부: 시간
        const minute = (time % 1) === 0.5 ? 30 : 0; // 소수부 0.5는 30분
        const hourIn12 = hour % 12 || 12;
        const ampm = hour >= 12 ? '오후' : '오전';
        return `${ampm} ${hourIn12}:${minute === 0 ? '00' : '30'}`;
    };

    const [flightList , setflightList] = useState([]);

    //페이지 갱신 후 한번만 실행
    useEffect(()=>{
        loadFlightList();
    },[]);

    const loadFlightList = useCallback(async()=>{
        const resp = await axios.get("http://localhost:8080/flight/");
        setflightList(resp.data);
    },[flightList]);



    return (
        <>
            <div className="row mt-4">
                <div className="col-md-3">
                    <div style={{ padding: '20px', width: "70%" }}>
                        <h3>출발 시간대 설정</h3>
                        {/* 가는 날 출발시간 */}
                        <div>
                            <span style={{display:"block"}}>가는 날 출발시간 :</span>
                            <span>{formatTime(departureTime)} ~ {formatTime(departureRightTime)}</span>
                            <input type="range" min="0" max="23.5" step="0.5" // 30분 단위로 조절 가능
                                value={departureTime} onChange={(e) => setDepartureTime(Number(e.target.value))}
                                style={{ width: '100%' }} />

                            <input type="range" min="0" max="23.5" step="0.5" // 30분 단위로 조절 가능
                                value={departureRightTime} onChange={(e) => setDepartureRightTime(Number(e.target.value))}
                                style={{ width: '100%' }} />
                        </div>
                        {/* 오는 편 시간 */}
                        <div>
                            <p>오는 편: {formatTime(returnTime)} ~ {formatTime(23.5)}</p>
                            <input
                                type="range"
                                min="0"
                                max="23.5"
                                step="0.5" // 30분 단위로 조절 가능
                                value={returnTime}
                                onChange={(e) => setReturnTime(Number(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                </div>
                {/* 항공편 리스트에 대한 기능 */}
                <div className="col-md-5">
                    <div className="row">
                        {flightList.map((flight) => (
                            <NavLink to="/booking" style={{textDecoration:"none"}} key={flight.flightId}>
                                <div className="row mt-3" style={{border:"1px solid black", borderRadius:"1.5em", width:"80%"}}>
                                    <div className="row mt-3 mb-3">
                                        {/* 가는날 */}
                                        <div className="d-flex" style={{justifyContent:"space-between"}}>
                                            <div className="row mt-3">
                                                <span>{flight.departureAirport}</span>
                                            </div>
                                            <div className="row ms-4 me-4" style={{width:"25%"}}>
                                                <span>{flight.flightTime}</span>
                                                <span>------------</span>
                                                <span className="ms-4">직항</span>
                                            </div>
                                            <div className="row mt-3">
                                                <span>{flight.arrivalAirport}</span>
                                            </div>
                                        </div>
                                        {/* 오는날 */}
                                        {/* <div className="d-flex">
                                            <span>오전 06:50</span>
                                            <span className="ms-2 me-2">---------</span>
                                            <span>오전 08:30</span>
                                        </div> */}
                                    </div>
                                </div>
                            </NavLink>
                        ))}
                    </div>
                </div>

            </div>

        </>
    );
};

export default BookingList;
