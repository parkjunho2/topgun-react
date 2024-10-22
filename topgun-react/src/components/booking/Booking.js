import { IoLogoReddit } from "react-icons/io";
import { AiOutlineSwapRight } from "react-icons/ai";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IoIosAirplane } from "react-icons/io";
import { Modal } from 'bootstrap';
import { FaArrowDown } from "react-icons/fa";
import { PiLineVerticalBold } from "react-icons/pi";
import './Booking.css';

const Booking = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('economy'); // 'economy' or 'business'


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
          <button className="btn btn-success seat-normal-set" type="button" onClick={() => seatClassChange("economy")} style={{backgroundColor:"#00256c", color:"white", borderColor:"#00256c"}}>일반석</button>
        </div>
        <div className="col-md-3 mt-3">
          <button className="btn btn-success seat-business-set" type="button" onClick={() => seatClassChange("business")} style={{backgroundColor:"#00256c", color:"white", borderColor:"#00256c"}}>비지니스석</button>
        </div>
      </div>

      {selectedClass === "economy" && (
        <>
          {/* 일반석 항공권 리스트 */}
          <div className="row mt-4">
            <div className="flight-list">
              <div className="col-md-3 booking-time" style={{
                borderRight: isSmallScreen ? "1px solid black" : "none",  // 창이 좁아지면 borderRight 추가
                borderRadius: isSmallScreen ? "1em" : "0",
              }}>
                <span className="lowest-price">최저가</span>
                <div className="d-flex mt-5" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="mt-4" style={{ fontSize: "23px", fontWeight: "bolder", color: "black" }}>20:30</span>
                  <span className="mt-4">------------------<IoIosAirplane style={{ fontSize: "23px" }} />
                  </span>
                  <span className="mt-4" style={{ fontSize: "23px", fontWeight: "bolder", color: "black" }}>23:35</span>
                </div>
                <div className="d-flex" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>ICN</span>
                  <span>CXR</span>
                </div>
                <div className="d-flex mt-4" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>KE467<IoLogoReddit style={{ fontSize: "30px" }} /></span>
                  <button type="button" className='btn btn-outline-primary' style={{ borderRadius: "2em", fontSize: "13px" }} onClick={openInfoModal}>상세보기</button>
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
                  display: "flex", justifyContent: "center", alignItems: "center", alignContent: "center",
                  marginTop: isSmallScreen ? "1.5em" : "0",
                }}>일반석(정상운임)</span>
                <span className="mb-4 seat-noraml-price">360,000원</span>
              </div>
            </div>
        </div>
      <div>

        {/* 일반석 두번째 항공권 리스트 */}
        <div className="row mt-4">
            <div className="flight-list">
              <div className="col-md-3 booking-time" style={{
                borderRight: isSmallScreen ? "1px solid black" : "none",  // 창이 좁아지면 borderRight 추가
                borderRadius: isSmallScreen ? "1em" : "0",
              }}>
                <div className="d-flex mt-5" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="mt-4" style={{ fontSize: "23px", fontWeight: "bolder", color: "black" }}>19:00</span>
                  <span className="mt-4">------------------<IoIosAirplane style={{ fontSize: "23px" }} />
                  </span>
                  <span className="mt-4" style={{ fontSize: "23px", fontWeight: "bolder", color: "black" }}>22:00</span>
                </div>
                <div className="d-flex" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>ICN</span>
                  <span>CXR</span>
                </div>
                <div className="row mt-4">
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
              </div>
            </div>
        </div>          
      </div>
      </>
      )}

      {/* 비지니스석에 대한 리스트 */}
      {selectedClass === "business" && (
        <>
          <div className="row mt-4">
            {/* 항공권 예약 리스트 */}
              <div className="flight-list">
                <div className="col-md-3 booking-time" style={{
                  borderRight: isSmallScreen ? "1px solid black" : "none",  // 창이 좁아지면 borderRight 추가
                  borderRadius: isSmallScreen ? "1em" : "0",
                }}>
                  <span className="lowest-price">최저가</span>
                  <div className="d-flex mt-5" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="mt-4" style={{ fontSize: "23px", fontWeight: "bolder", color: "black" }}>20:30</span>
                    <span className="mt-4">------------------<IoIosAirplane style={{ fontSize: "23px" }} />
                    </span>
                    <span className="mt-4" style={{ fontSize: "23px", fontWeight: "bolder", color: "black" }}>23:35</span>
                  </div>
                  <div className="d-flex" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>ICN</span>
                    <span>CXR</span>
                  </div>
                  <div className="d-flex mt-4" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>KE467<IoLogoReddit style={{ fontSize: "30px" }} /></span>
                    <button type="button" className='btn btn-outline-primary' style={{ borderRadius: "2em", fontSize: "13px" }} onClick={openInfoModal}>상세보기</button>
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
                  }}>비지니스석(할인운임)</span>
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

          {/* 비지니스석 두번째 항공권 리스트 */}
          <div className="row mt-4">
              <div className="flight-list">
                <div className="col-md-3 booking-time" style={{
                  borderRight: isSmallScreen ? "1px solid black" : "none",  // 창이 좁아지면 borderRight 추가
                  borderRadius: isSmallScreen ? "1em" : "0",
                }}>
                  <div className="d-flex mt-5" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="mt-4" style={{ fontSize: "23px", fontWeight: "bolder", color: "black" }}>19:00</span>
                    <span className="mt-4">------------------<IoIosAirplane style={{ fontSize: "23px" }} />
                    </span>
                    <span className="mt-4" style={{ fontSize: "23px", fontWeight: "bolder", color: "black" }}>22:00</span>
                  </div>
                  <div className="d-flex" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>ICN</span>
                    <span>CXR</span>
                  </div>
                  <div className="row mt-4">
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
                </div>
            </div>
          </div>
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
          <div className="modal-content" style={{ maxHeight: "100%", overflowY: "auto", }}>
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
                      <span className='mt-4'>ICN 서울/인천</span>
                      <span className="ms-2 me-2 mt-4"><AiOutlineSwapRight /></span>
                      <span className='mt-4'>CXR 나트랑</span>
                      <p className='mt-4' style={{ marginLeft: "auto", fontSize: "14px", fontWeight: "bold" }}>5시간 5분 여정</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 목록 표시 부분 */}
              <div className="row mt-4" style={{ border: "1px solid lightgray", borderRadius: "1em", textAlign: "center" }}>
                <div className="row mt-3">
                  <div className="col" style={{ textAlign: "left" }}>
                    <span style={{ fontWeight: "bold", color: "#00256c" }}>항공편 : KE467</span>
                    <span>(A330-300)</span>
                  </div>
                </div>

                <div className="row mt-4">
                  <div className="row">
                    <div className="col">
                      <span style={{ display: "block", fontWeight: "bold", color: "black" }}>ICN 서울/인천</span>
                      <span>2024년 10월 25일 (금) 20:30</span>
                    </div>
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="row">
                    <div className="col">
                      <span style={{ fontWeight: "bold", color: "black", fontSize: "23px", right: "10px" }}><PiLineVerticalBold /></span>
                      <span style={{ display: "block", fontWeight: "bold", color: "#0064de", fontSize: "18px", right: "30px" }}>5시간 5분</span>
                      <span style={{ fontWeight: "bold", color: "black", fontSize: "23px" }}><FaArrowDown /></span>
                    </div>
                  </div>
                </div>

                <div className="row mt-3 my-4">
                  <div className="row">
                    <div className="col">
                      <span style={{ display: "block", fontWeight: "bold", color: "black" }}>CXR 나트랑</span>
                      <span>2024년 10월 25일 (금) 23:35</span>
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
        </div>
      </div>

    </>
  )
};
export default Booking;