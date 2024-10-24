import { IoLogoReddit } from "react-icons/io";
import { AiOutlineSwapRight } from "react-icons/ai";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IoIosAirplane } from "react-icons/io";
import { Modal } from 'bootstrap';
import { FaArrowDown } from "react-icons/fa";
import { PiLineVerticalBold } from "react-icons/pi";
import './Booking.css';
import axios from "axios";
import { useParams } from "react-router";
import moment from "moment";

const Booking = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('economy'); // 'economy' or 'business'
  
  //flightNo 를 받아오기 위한 기능 
  const [flightList , setflightList] = useState([]);
  const { flightId } = useParams();

  // 창 크기 변화 감지
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);  // 768px 이하일 때 true
    };

    // 처음 로드될 때와 창 크기 변화할 때 이벤트 핸들러 실행
    window.addEventListener('resize', handleResize);
    handleResize(); // 초기 실행

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);



      //페이지 갱신 후 한번만 실행
      useEffect(()=>{
        loadFlightList();
    },[]);

    const loadFlightList = async () => {
        const response = await axios.get(`http://localhost:8080/flight/${flightId}`);
        // console.log(response.data); // 응답 데이터가 배열인지 확인
        setflightList(Array.isArray(response.data) ? response.data : [response.data]);  // 응답 데이터가 배열인지 확인. 배열이면 그대로 상태에 저장하고, 배열이 아니면 배열로 감싸서 상태에 저장
    };


  // const 변수명 = useRef(초기값);
  const openModal = useRef();

  //모달 생성
  const openInfoModal = useCallback(() => {
    const tag = Modal.getOrCreateInstance(openModal.current);
    tag.show();
  }, [openModal]);

  //모달 닫기
  const closeInfoModal = useCallback(() => {
    var tag = Modal.getInstance(openModal.current);
    tag.hide();
  }, [openModal]);

  // 좌석 클래스 변경
  const seatClassChange = (classType) => {
    setSelectedClass(classType);
  };



  return (
    <>
      {/* 일반석,비지니스석 버튼  */}
      <h1>항공편 예약 페이지</h1>
      <div className="row seat-set-row">
        <div className="col-md-3 mt-3">
          <button className="btn btn-success seat-normal-set" type="button" onClick={() => seatClassChange("economy")} 
                        style={{backgroundColor:"#00256c", color:"white", borderColor:"#00256c"}}>
            일반석
          </button>
        </div>
        <div className="col-md-3 mt-3">
          <button className="btn btn-success seat-business-set" type="button" onClick={() => seatClassChange("business")} 
                      style={{backgroundColor:"#00256c", color:"white", borderColor:"#00256c"}}>
            비지니스석
          </button>
        </div>
      </div>

      {selectedClass === "economy" && (
        <>
          {/* 일반석 항공권 리스트 */}
              {flightList.map((flight)=>(
                <div className="row mt-4" key={flight.flightId}>
                  <div className="flight-list">
                        <div className="col-md-3 booking-time"    style={{
                                borderRight: isSmallScreen ? "1px solid black" : "none",  // 창이 좁아지면 borderRight 추가
                                borderRadius: isSmallScreen ? "1em" : "0",
                              }}>
                          <span className="lowest-price">최저가</span>
                            <div className="d-flex mt-5 ms-3 me-3" style={{ display: "flex", justifyContent: "space-between" }}>
                              <span className="mt-4" style={{ fontSize: "23px", fontWeight: "bolder", color: "black" }}>{moment(flight.departureTime).format("HH:mm")}</span>
                              <span className="mt-4">------------------<IoIosAirplane style={{ fontSize: "23px" }} />
                              </span>
                              <span className="mt-4" style={{ fontSize: "23px", fontWeight: "bolder", color: "black" }}>{moment(flight.arrivalTime).format("HH:mm ")}</span>
                            </div>
                            <div className="d-flex ms-4 me-4" style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>
                                  {flight.departureAirport.substring(
                                      flight.departureAirport.indexOf("(") + 1,  // 시작 인덱스: 괄호 다음
                                      flight.departureAirport.indexOf(")")      // 종료 인덱스: 괄호 전
                                  )}
                              </span>
                              <span>
                                  {flight.arrivalAirport.substring(
                                      flight.arrivalAirport.indexOf("(") + 1,  // 시작 인덱스: 괄호 다음
                                      flight.arrivalAirport.indexOf(")")      // 종료 인덱스: 괄호 전
                                  )}
                              </span>
                            </div>
                            <div className="d-flex mt-4 ms-3" style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>{flight.flightNumber}<IoLogoReddit style={{ fontSize: "30px" }} /></span>
                              <button type="button" className='btn btn-outline-primary me-2' style={{ borderRadius: "2em", fontSize: "13px" }} onClick={openInfoModal}>상세보기</button>
                            </div>
                        </div>
                      <div className="col-md-3 seat-normal-discount">
                            <button type="button" className="btn btn-outline-success seat-normal-discount w-100" style={{
                                                                                          height:"100%",                            
                                                                                          borderRight: isSmallScreen ? "1px solid black" : "none",  // 창이 좁아지면 borderRight 추가
                                                                                          borderRadius: isSmallScreen ? "1em" : "0",
                                                                                          marginTop: isSmallScreen ? "1em" : "0",}}>
                              <span style={{
                                display: "flex", justifyContent: "center", alignItems: "center", alignContent: "center",
                                marginTop: isSmallScreen ? "1.5em" : "0"
                              }}>일반석(할인운임)</span>
                              <span className="mb-4 seat-noraml-price">250,000원</span>
                            </button>
                      </div>

                      <div className="col-md-3 seat-normal">
                            <button type="button" className="btn btn-outline-success seat-normal w-100" style={{height:"100%",                             
                                                                                                                  borderRadius: isSmallScreen ? "1em" : "0",
                                                                                                                  marginTop: isSmallScreen ? "1em" : "0",}}>
                                <span className="seat-noraml-text" style={{
                                      display: "flex", justifyContent: "center", alignItems: "center", alignContent: "center",
                                      marginTop: isSmallScreen ? "1.5em" : "0",
                                    }}>일반석(정상운임)
                                </span>
                                <span className="mb-4 seat-noraml-price">
                                  360,000원
                                </span>
                            </button>
                      </div>
                  </div>
              </div>
              ))}
        </>
      )}

      {/* 일반석 두번째 항공권 리스트 사용 안함 */}
      {/* <div>
        <div className="row mt-4">
            <div className="flight-list"> */}
              {/* 사용 안함 */}
              {/* <div className="col-md-3 booking-time" style={{
                borderRight: isSmallScreen ? "1px solid black" : "none",  // 창이 좁아지면 borderRight 추가
                borderRadius: isSmallScreen ? "1em" : "0",
              }}>
                <div className="d-flex mt-5 ms-3 me-3" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="mt-4" style={{ fontSize: "23px", fontWeight: "bolder", color: "black" }}>19:00</span>
                  <span className="mt-4">------------------<IoIosAirplane style={{ fontSize: "23px" }} />
                  </span>
                  <span className="mt-4" style={{ fontSize: "23px", fontWeight: "bolder", color: "black" }}>22:00</span>
                </div>
                <div className="d-flex ms-4 me-4" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>ICN</span>
                  <span>CXR</span>
                </div>
                <div className="row mt-4 ms-1">
                  <span>KE467<IoLogoReddit style={{ fontSize: "30px" }} /></span>
                </div>
              </div>

              <div className="col-md-3 seat-normal-discount" style={{
                    borderRight: isSmallScreen ? "1px solid black" : "none",  // 창이 좁아지면 borderRight 추가
                    borderRadius: isSmallScreen ? "1em" : "0",
                    marginTop: isSmallScreen ? "1em" : "0",
              }}>
                <span className="seat-noraml-text" style={{
                  marginTop: isSmallScreen ? "1.5em" : "0"
                }}>일반석(할인운임)</span>
                <span className="mb-4 seat-noraml-price">250,000원</span>
              </div>

              <div className="col-md-3 seat-normal" style={{
                borderRadius: isSmallScreen ? "1em" : "0",
                marginTop: isSmallScreen ? "1em" : "0",
                justifyContent: "center",
                alignContent: "center"
              }}>
                <span className="seat-noraml-text" style={{
                  marginTop: isSmallScreen ? "1.5em" : "0",
                }}>일반석(정상운임)</span>
                <span className="mb-4 seat-noraml-price">360,000원</span>
              </div> */}
            {/* </div>
        </div>          
      </div> */}


      {/* 비지니스석에 대한 리스트 */}
      {selectedClass === "business" && (
        <>
          {/* 항공권 예약 리스트 */}
          {flightList.map((flight)=>(
              <div className="row mt-4" key={flight.flightId}>
                  <div className="flight-list">
                    <div className="col-md-3 booking-time" style={{
                            borderRight: isSmallScreen ? "1px solid black" : "none",  // 창이 좁아지면 borderRight 추가
                            borderRadius: isSmallScreen ? "1em" : "0",
                        }}>
                        <span className="lowest-price">최저가</span>
                        <div className="d-flex mt-5 ms-3 me-3" style={{ display: "flex", justifyContent: "space-between" }}>
                          <span className="mt-4" style={{ fontSize: "23px", fontWeight: "bolder", color: "black" }}>{moment(flight.departureTime).format("HH:mm")}</span>
                          <span className="mt-4">------------------<IoIosAirplane style={{ fontSize: "23px" }} />
                          </span>
                          <span className="mt-4" style={{ fontSize: "23px", fontWeight: "bolder", color: "black" }}>{moment(flight.arrivalTime).format("HH:mm")}</span>
                        </div>
                        <div className="d-flex ms-4 me-4" style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>
                                      {flight.departureAirport.substring(
                                          flight.departureAirport.indexOf("(") + 1,  // 시작 인덱스: 괄호 다음
                                          flight.departureAirport.indexOf(")")      // 종료 인덱스: 괄호 전
                                      )}
                              </span>
                            <span>
                                      {flight.arrivalAirport.substring(
                                          flight.arrivalAirport.indexOf("(") + 1,  // 시작 인덱스: 괄호 다음
                                          flight.arrivalAirport.indexOf(")")      // 종료 인덱스: 괄호 전
                                      )}
                              </span>
                        </div>
                        <div className="d-flex mt-4 ms-3" style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>{flight.flightNumber}<IoLogoReddit style={{ fontSize: "30px" }} /></span>
                          <button type="button" className='btn btn-outline-primary me-2' style={{ borderRadius: "2em", fontSize: "13px" }} onClick={openInfoModal}>상세보기</button>
                        </div>
                      </div>
                      
                      <div className="col-md-3 seat-normal-discount" style={{
                        border: "1px solid black",
                        borderRight: isSmallScreen ? "1px solid black" : "none",  // 창이 좁아지면 borderRight 추가
                        borderRadius: isSmallScreen ? "1em" : "0",
                        marginTop: isSmallScreen ? "1em" : "0",
                        justifyContent: "center",
                        alignContent: "center"
                      }}>
                        <span className="seat-noraml-text" style={{
                                marginTop: isSmallScreen ? "1.5em" : "0"
                              }}>비지니스석(할인운임)
                        </span>
                        <span className="mb-4 seat-noraml-price">650,000원</span>
                      </div>

                      <div className="col-md-3 seat-normal" style={{
                        borderRadius: isSmallScreen ? "1em" : "0",
                        marginTop: isSmallScreen ? "1em" : "0",
                        justifyContent: "center",
                        alignContent: "center"
                      }}>
                        <span className="seat-noraml-text" style={{
                          marginTop: isSmallScreen ? "1.5em" : "0",
                        }}>비지니스(정상운임)</span>
                        <span className="mb-4 seat-noraml-price">750,000원</span>
                    </div>
                  </div>
              </div>
          ))}

          {/* 비지니스석 두번째 항공권 리스트 */}
          {/* <div className="row mt-4">
              <div className="flight-list"> */}
                {/* <div className="col-md-3 booking-time" style={{
                  borderRight: isSmallScreen ? "1px solid black" : "none",  // 창이 좁아지면 borderRight 추가
                  borderRadius: isSmallScreen ? "1em" : "0",
                }}>
                  <div className="d-flex mt-5 ms-3 me-3" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="mt-4" style={{ fontSize: "23px", fontWeight: "bolder", color: "black" }}>19:00</span>
                    <span className="mt-4">------------------<IoIosAirplane style={{ fontSize: "23px" }} />
                    </span>
                    <span className="mt-4" style={{ fontSize: "23px", fontWeight: "bolder", color: "black" }}>22:00</span>
                  </div>
                  <div className="d-flex ms-4 me-4" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>ICN</span>
                    <span>CXR</span>
                  </div>
                  <div className="row mt-4 ms-1">
                    <span>KE467<IoLogoReddit style={{ fontSize: "30px" }} /></span>
                  </div>
                </div>

                <div className="col-md-3 seat-normal-discount" style={{
                  border: "1px solid black",
                  borderRight: isSmallScreen ? "1px solid black" : "none",  // 창이 좁아지면 borderRight 추가
                  borderRadius: isSmallScreen ? "1em" : "0",
                  marginTop: isSmallScreen ? "1em" : "0",
                  justifyContent: "center",
                  alignContent: "center"
                }}>
                  <span style={{
                    display: "flex", justifyContent: "center", alignItems: "center", alignContent: "center",
                    marginTop: isSmallScreen ? "1.5em" : "0"
                  }}>비지니스(할인운임)</span>
                  <span className="mb-4 seat-noraml-price">800,000원</span>
                </div>

                <div className="col-md-3 seat-normal" style={{
                  borderRadius: isSmallScreen ? "1em" : "0",
                  marginTop: isSmallScreen ? "1em" : "0",
                  justifyContent: "center",
                  alignContent: "center"
                }}>
                  <span className="seat-noraml-text" style={{
                    display: "flex", justifyContent: "center", alignItems: "center", alignContent: "center",
                    marginTop: isSmallScreen ? "1.5em" : "0",
                  }}>비지니스(정상운임)</span>
                  <span className="mb-4 seat-noraml-price">850,000원</span>
                </div> */}
            {/* </div>
          </div> */}
        </>
      )}
          {/* 페이지 하단 가격 보여줌 */}
          <div className="row mt-4" style={{border:"1px solid black"}}>
            <div className="d-flex">
              <div className="row mt-2">
                <span>총액</span>
              </div>
              <div className="row mt-2">
                <span>300,000원</span>
                </div>
              <button type="button" className='btn btn-success'>다음여정</button>
            </div>
          </div>


      {/* 모달(modal) - useRef로 만든 리모컨(modal)과 연동 */}
      <div className="modal fade" tabIndex="-1" ref={openModal}>
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "50%", maxWidth: isSmallScreen ? "100%" : "50%" }}>
          {/* 중앙 정렬을 위한 클래스 추가 */}
          {flightList.map((flight)=>(
              <div className="modal-content" key={flight.flightId} style={{ maxHeight: "100%", overflowY: "auto", }}>
                {/* 모달 헤더 - 제목, x버튼 */}
                <div className="modal-header">
                  <h3 className="modal-title" style={{ color: "black", fontWeight: "bold" }}>여정 정보</h3>
                  <button type="button" className="btn-close" onClick={closeInfoModal} aria-label="Close"></button>
                </div>
                {/* 모달 본문 */}
                <div className="modal-body modal-body-set">
                  {/* 모달 내부에 있을 화면 구현 */}
                  <div className="row mt-2">
                    <div className="col">
                      <div className="row">
                        <div className="d-flex travel-info-title" >
                          <span className='mt-4'>{flight.departureAirport}</span>
                          <span className="ms-2 me-2 mt-4"><AiOutlineSwapRight /></span>
                          <span className='mt-4'>{flight.arrivalAirport}</span>
                          <p className='mt-4' style={{ marginLeft: "auto", fontSize: "14px", fontWeight: "bold" }}>{flight.flightTime} 여정</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 목록 표시 부분 */}
                  <div className="row mt-4" style={{ border: "1px solid lightgray", borderRadius: "1em", textAlign: "center" }}>
                    <div className="row mt-3">
                      <div className="col" style={{ textAlign: "left" }}>
                        <span style={{ fontWeight: "bold", color: "#00256c" }}>항공편 : {flight.flightNumber}</span>
                      </div>
                    </div>

                    <div className="row mt-4">
                      <div className="row">
                        <div className="col">
                          <span style={{ display: "block", fontWeight: "bold", color: "black" }}>{flight.departureAirport}</span>
                          <span>{moment(flight.departureTime).format("yyyy년 MM월 DD일 (dd) a HH:mm")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="row mt-2">
                      <div className="row">
                        <div className="col">
                          <span style={{ fontWeight: "bold", color: "black", fontSize: "23px", right: "10px" }}><PiLineVerticalBold /></span>
                          <span style={{ display: "block", fontWeight: "bold", color: "#0064de", fontSize: "18px", right: "30px" }}>{flight.flightTime}</span>
                          <span style={{ fontWeight: "bold", color: "black", fontSize: "23px" }}><FaArrowDown /></span>
                        </div>
                      </div>
                    </div>

                    <div className="row mt-3 my-4">
                      <div className="row">
                        <div className="col">
                          <span style={{ display: "block", fontWeight: "bold", color: "black" }}>{flight.arrivalAirport}</span>
                          <span>{moment(flight.arrivalTime).format("yyyy년 MM월 DD일 (dd) a HH:mm")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 모달 푸터 - 종료, 확인, 저장 등 각종 버튼 */}
                <div className="modal-footer d-flex" style={{ justifyContent: "center", display: "flex" }}>
                  <button type="button" className="btn btn-primary" style={{
                    width: "30%", backgroundColor: "#00256c", height: "60px",
                    width: isSmallScreen ? "100%" : "30%"
                  }} onClick={closeInfoModal}>확인</button>
                </div>
              </div>
          ))}
        </div>
      </div>

    </>
  )
};
export default Booking;