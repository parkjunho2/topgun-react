import './BookingList.css';
import { GiCommercialAirplane } from "react-icons/gi";
import { useNavigate } from 'react-router';
import { IoRemoveOutline } from "react-icons/io5";
import React, { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

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
                {/* 상단바에 대한 처리 구현 */}
                <div className="d-flex" style={{justifyContent:"center"}}>
                    <div className="row me-3">
                        <div className="col">
                            <h2>출발지</h2>
                        </div>
                    </div>
                    <div className="row me-3">
                        <div className="col">
                            <h2>도착지</h2>
                        </div>
                    </div>
                    <div className="row me-3">
                        <div className="col">
                            <h2>날짜</h2>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <h2>인원수</h2>
                        </div>
                    </div>
                </div>

                {/* 항공권에 대한 리스트를 출력 */}
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
                    <div className="d-flex mb-3">
                        <span className="me-2">출발시간순 |</span>
                        <span className="ms -2 me-2">도착시간순 |</span>
                        <span className="ms -2 me-2">최저가순</span>
                    </div>
                    <div className="row">
                        {flightList.map((flight) => (
                            <NavLink to="/booking" style={{textDecoration:"none"}} key={flight.flightId}>
                                <div className="row mt-3" style={{border:"1px solid black", borderRadius:"1.5em", width:"100%"}}>
                                    <div className="row mt-3 mb-3 ms-1">
                                        {/* 가는날 */}
                                        <h3 style={{color:"black", fontWeight:"bold"}}>{flight.airlineDto ? flight.airlineDto.airlineName : '정보 없음'}<GiCommercialAirplane /></h3>
                                            {/* <div className="row">
                                                <span style={{color:"red"}}>(+1 day)</span>
                                            </div> */}
                                        <div className="d-flex mb-2" style={{justifyContent:"space-between"}}>
                                            <div className="d-flex mt-3" style={{width:"300px" , justifyContent:"space-between"}}>
                                                <span style={{width:"50%", textAlign:"center"}}>{flight.departureAirport}</span>
                                                <span style={{width:"50%", textAlign:"center"}}>{moment(flight.departureTime).format("a HH:mm")}</span>
                                            </div>
                                            <div className="row" style={{width:"150px"}}>
                                                <span style={{textAlign:"center"}}>{flight.flightTime}</span>
                                                <span style={{textAlign:"center"}}>------------</span>
                                                <span style={{textAlign:"center"}}>직항</span>
                                            </div>
                                            <div className="d-flex mt-3" style={{width:"300px" , justifyContent:"space-between"}}>
                                                <span style={{width:"50%", textAlign:"center"}}>{moment(flight.arrivalTime).format("a HH:mm ")}</span>
                                                <span style={{width:"50%", textAlign:"center"}}>{flight.arrivalAirport}</span>
                                            </div>
                                                
                                        </div>

                                        <hr/>
                                        {/* 오는날 */}
                                        <div className="d-flex mt-2" style={{justifyContent:"space-between"}}>
                                            <div className="d-flex mt-4" style={{width:"300px" , justifyContent:"space-between"}}>
                                                <span style={{width:"50%" , textAlign:"center"}}>{flight.arrivalAirport}</span>
                                                <span className="ms-2" style={{width:"50%", textAlign:"center"}}>{moment(flight.arrivalTime).format("a HH:mm ")}</span>
                                            </div>
                                            <div className="row" style={{width:"150px"}}>
                                                <span style={{textAlign:"center"}}>{flight.flightTime}</span>
                                                <span style={{textAlign:"center"}}>------------</span>
                                                <span style={{textAlign:"center"}}>직항</span>
                                            </div>
                                            <div className="d-flex mt-4" style={{width:"300px" , justifyContent:"space-between"}}>
                                                <span style={{width:"50%", textAlign:"center"}}>{moment(flight.departureTime).format("a HH:mm")}</span>
                                                <span style={{textAlign:"center" , width:"50%"}}>{flight.departureAirport}</span>
                                            </div>
                                        </div>
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
