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
import { NavLink } from "react-router-dom";
import { TiInfoOutline } from "react-icons/ti";
import { FaArrowRight } from "react-icons/fa6";

const Booking = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
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


    // 첫 번째 모달에 대한 기능
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


    //두 번째 모달에 대한 기능
    const openBaggage = useRef();

    const openBaggageModal =useCallback(() => {
      // 여기에서 openBaggage.current를 사용하여 모달을 엽니다.
      const modal = Modal.getOrCreateInstance(openBaggage.current);
      modal.show();
    }, [openBaggage]);

    const closeBaggageModal = useCallback(() => {
      const modal = Modal.getOrCreateInstance(openBaggage.current);
      modal.hide();
    }, [openBaggage]);



  return (
    <>
      <div className="container">
              {/* 항공권 리스트 */}
                  {flightList.map((flight)=>(
                    <div className="row mt-4" key={flight.flightId}>
                        <div className="row mb-3" style={{width:"70%", textAlign:"center"}}>
                            <h3>선택한 항공편 정보</h3>
                        </div>
                      <div className="flight-list">
                            <div className="col-md-3 booking-time"  style={{width:"50%"}}>
                                <div className="badge-text-box row">
                                  <span className="badge-text badge mt-4">편도</span>
                                </div>
                              {/* <span className="lowest-price">최저가</span> */}
                                <div className="d-flex ms-3 me-3" style={{ display: "flex", justifyContent: "space-between" }}>
                                  <span className="mt-3" style={{ fontSize: "23px", fontWeight: "bolder", color: "black" }}>{moment(flight.departureTime).format("HH:mm")}</span>
                                  <span className="mt-3">--------------------------------------------<IoIosAirplane style={{ fontSize: "23px" }} />
                                  </span>
                                  <span className="mt-3" style={{ fontSize: "23px", fontWeight: "bolder", color: "black" }}>{moment(flight.arrivalTime).format("HH:mm ")}</span>
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
                      </div>
                  </div>
                  ))}

                    {/* 페이지 하단 가격 보여줌 */}
                      <div className="flight-bottom-price row mt-4">
                            <div className="d-flex" style={{ width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                                <div className="row">
                                    <span className="flight-detail-price" onClick={openBaggageModal}>항공사 운임 및 수하물 규정</span>
                                </div>
                                <div className="d-flex align-items-center">
                                    {flightList.map((flight) => (
                                        <div className="row mt-2" key={flight.flightId}>
                                            <span style={{fontSize: "23px", fontWeight: "bolder" }}>총액: {flight.flightPrice.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <NavLink to={`/payment/${flightId}`}>
                                      <button type="button" className='btn btn-success ms-3'>좌석 선택</button>
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                    </div>

              {/* 첫 번째 모달(modal) : 항공편의 상세 정보를 보여줌 */}
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


          {/* 두번째 모달(modal) : 수하물 정보 */}
          <div className="modal fade flight-info-text" tabIndex="-1" ref={openBaggage}>
            <div className="modal-dialog modal-dialog-centered" style={{maxWidth: "50%", maxWidth: isSmallScreen ? "100%" : "50%" }}>
              {/* 중앙 정렬을 위한 클래스 추가 */}
              {flightList.map((flight)=>(
                  <div className="modal-content" key={flight.flightId} style={{maxHeight: "100%", overflowY: "auto"}}>
                    {/* 모달 헤더 - 제목, x버튼 */}
                    <div className="modal-header" style={{display:"inline"}}>
                      <div className="d-flex mt-2" style={{justifyContent:"space-between"}}>
                        <h4 className="modal-title" style={{ color: "black", fontWeight: "bold"}}>항공사 운임 및 수하물 규정</h4>
                        <button type="button" className="btn-close" onClick={closeBaggageModal} aria-label="Close"></button>
                      </div>
                      <span>선택하신 항공편에 따라, 운임규정이 항공사 규정 원문인 영문으로만 제공될 수도 있습니다.</span><br/>
                      <span>관련 문의사항은 고객센터로 연락주시기 바랍니다.</span>
                    </div>
                    {/* 모달 본문 */}
                    <div className="modal-body modal-body-set">
                      {/* 모달 내부에 있을 화면 구현 */}
                      <div className="row">
                          {/* 변경/환불 규정에 대한 내용 */}
                              <div className="d-flex mt-1" style={{justifyContent:"space-between"}}>
                                  <h4 className="modal-title" style={{ color: "black", fontWeight: "bold"}}>변경/환불</h4>
                              </div>
                            <div className="row">
                                <span>
                                  <span style={{color:"red", fontWeight:"bold"}}>변경<TiInfoOutline style={{fontSize:"23px"}}/></span> <br/>
                                  - 예약 변경 시 동일 요금, 동일 시즌 및 항공권 유효기간 내에서 구간 별 재발행 수수료 징수<br/>
                                  - 하위 운임으로 변경 불가/제세 공과금(TAX), 유류할증료 및 운임 차액 발생 시 추가 지불 <br/>
                                  - 재발행은 1회 한정이며 추가 변경 시 환불 후 재 구매해야 함 <br/>
                                  - 구간 변경 시 환불 후 재 구매해야 함(단, 동일 국가 내에서는 구간 변경 가능) <br/>
                                  - 각 구간의 탑승 일자를 기준으로 시점별 수수료 부과 <br/>
                                  출발 당일(No-Show 이전) : 100,000원 <br/>
                                  출발 6일 이내 ~ 1일 이전: 100,000원 <br/>
                                  출발 30일 이내 ~ 7일 이전 : 60,000원 <br/>
                                  출발 60일 이내 ~ 31일 이전 : 40,000원 <br/>
                                  출발 90일 이내 ~ 61일 이전 : 40,000원 <br/>
                                  출발 91일 이전 : 없음 <br/>

                                  - 해당구간 취소(환불, 취소) 시 구간 별 KRW 100,000 수수료 징수 <br/>
                                  <span style={{color:"red", fontWeight:"bold" }}>환불<TiInfoOutline style={{fontSize:"23px"}}/></span> <br/>
                                  - 해당 구간 취소(취소, 환불) 시 구간 별 수수료 징수 <br/>
                                  - 각 구간의 탑승 일자를 기준으로 시점별 수수료 부과 <br/>
                                  출발 당일(No-Show 이전) : 100,000원 <br/>
                                  출발 6일 이내 ~ 1일 이전: 100,000원 <br/>
                                  출발 30일 이내 ~ 7일 이전 : 60,000원 <br/>
                                  출발 60일 이내 ~ 31일 이전 : 40,000원 <br/>
                                  출발 90일 이내 ~ 61일 이전 : 40,000원 <br/>
                                  출발 91일 이전 : 없음 <br/><br/>
                                  - 해당구간 취소(NO-SHOW) 시 구간 별 KRW 120,000 수수료 징수 <br/>
                                  - 예약 부도(NO-SHOW, 탑승수속 마감 전까지 예약취소를 하지 않은 경우)일 경우 항공사 예약 부도 위약금 부과/재발행 항공권은 최초 발권일 기준으로 적용(환불 시 이중부과됨) <br/>
                                  - 여정 취소, 환불 등의 각종 작업은 탑승수속 마감 전 여행사 및 항공사 업무 처리 가능 시간 내까지 환불 완료되어야 함 (이후 작업 완료 시 NO-SHOW 처리됨) <br/>
                                  </span>
                              </div>
                                <hr/>
                                {/* 항공사 일반 규정에 대한 내용 */}
                              <div className="d-flex mt-1" style={{justifyContent:"space-between"}}>
                                  <h4 className="modal-title" style={{ color: "black", fontWeight: "bold"}}>항공사 일반 규정</h4>
                              </div>
                              <div className="row">
                                <span>
                                  - 여정 취소, 환불 등의 각종 작업은 예약된 날짜 이전의 여행사 및 항공사 업무 처리 가능 시간 내까지 환불 완료되어야 함 (이후 작업 완료 시 NO-SHOW 처리됨)<br/>
                                  - NO SHOW 기준 : 탑승수속 마감 전(출발 시각 기준 50분 전)까지 예약취소를 하지 않은 경우.<br/>
                                  - 환불은 항공권 유효기간 내에 이루어져야 하며, 전 구간 미사용 항공권은 발권일 기준으로 1년 이내 접수가 가능.<br/>
                                  - 환불금이 없는 경우에도 미사용 제세공과금(TAX)및 유류할증료는 환불 가능<br/>
                                  - 환불 패널티 적용 시점 : 각 구간의 탑승 일자를 기준으로 시점별 수수료 부과<br/>
                                  - 항공권 유효기간 : 미사용 항공권 - 최초 발권일로부터 1년 / 여정 개시 후의 항공권 - 최초 출발일로부터 1년<br/>
                                  - 재발행 : 재발행은 1회 한정이며 추가 변경 시 환불 후 재구매 해야 함.( 2019.01.04 이후 시행 )<br/>
                                  - 여정변경 불가 조건의 운임으로 발권된 경우 전체 여정 예약변경 불가<br/>
                                  - 승객 연락처 정보는 최초 예약 생성 시 입력 후 변경 불가하며, 변경된 정보는 미반영되어 예약 관련(결항 및 지연 등) 안내 불가하오니 예약 시 주의 요망.<br/>
                                  - 영문 이름 변경: 동일 발음/동일인이라고 판단되는 범주 내에서 철자/알파벳이 틀린 경우 수수료 10,000 지불 후 변경.
                                      (알파벳 4자 이내/변경 상세조건 및 가능 여부 반드시 사전 확인 요망/항공사 근무시간 내에서만 변경 가능)<br/>
                                  - 발권일 기준 2024년 6월 1일부 탑승 수속 후 탑승을 하지 않을 시(GATE NO-SHOW) 게이트 노쇼 수수료 200,000원 부과
                                      (환불 수수료와 별도로 부과되며, 구간 당 부과/출발지 기준 위약금 화폐단위 상이하므로 별도 문의)<br/>
                                  </span>
                              </div>

                              <hr/>
                              {/* 비자 입국 규정에 대한 내용 */}
                              <div className="d-flex mt-1" style={{justifyContent:"space-between"}}>
                                  <h4 className="modal-title" style={{ color: "black", fontWeight: "bold"}}>비자 입국</h4>
                              </div>
                              <div className="row">
                                <span>
                                      - 출국 전 경유지 및 목적지 국가의 비자 필요 여부를 반드시 확인하여, 출/입국시 문제가 발생하지 않도록 사전에 준비하여 주십시오.<br/>
                                      - 무비자 입국 가능 국가인 경우는 반드시 왕복 항공권을 소지하셔야 합니다. (무비자 편도 입국불가)<br/>
                                      - 편도/장기체류로 여행하시는 경우는 반드시 목적 국가에 편도/장기체류로 입국이 가능한 비자를 준비하셔야 합니다.<br/>
                                      - 비자 미소지자로 출국 또는 해당 국가의 입국이 거절되는 경우 발생하는 문제와 그에 따른 발생 비용 및 항공사 환불 수수료, 여행사 발권수수료등은 당사가 책임지지 않습니다.<br/>
                                      - 비자관련 상담은 해당 국가 대사관 또는 영사관을 통해 확인하여 주십시오.
                                  </span>
                              </div>
                              <hr/>
                              {/* 수하물 규정에 대한 내용 */}
                              <div className="d-flex mt-1" style={{justifyContent:"space-between"}}>
                                  <h4 className="modal-title" style={{ color: "black", fontWeight: "bold"}}>수하물 규정</h4>
                              </div>
                              {flightList.map((flight)=>(
                                  <div className="row" key={flight.flightId}>
                                    <span>
                                          - [선택여정 무료수하물] <br/>
                                          - {flight.departureAirport} <FaArrowRight style={{fontSize:"18px"}}/> {flight.arrivalAirport} ({flight.flightNumber}) : 15kg
                                      </span>
                                  </div>
                              ))}

                      </div>
                    </div>

                    {/* 모달 푸터 - 종료, 확인, 저장 등 각종 버튼 */}
                    <div className="modal-footer d-flex" style={{ justifyContent: "center", display: "flex" }}>
                      <button type="button" className="btn btn-primary" style={{
                        width: "30%", backgroundColor: "#00256c", height: "60px",
                        width: isSmallScreen ? "100%" : "30%"
                      }} onClick={closeBaggageModal}>확인</button>
                    </div>
                  </div>
              ))}
        </div>
      </div>

    </>
  )
};
export default Booking;