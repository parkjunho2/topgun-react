import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";

const PaymentAllList=()=>{
     //state
     const [paymentList, setPaymentList] = useState([]); 
     const [selectedDetail, setSelectedDetail] = useState({});
     const [submittedDetails, setSubmittedDetails] = useState({}); // 등록된 정보를 저장
     //effect
     useEffect(()=>{
        loadPaymentList();
     }, []);

     //callback
     const loadPaymentList = useCallback(async()=>{
         const resp = await axios.get("http://localhost:8080/seats/paymentTotalList");
         setPaymentList(resp.data);
     }, []);

     
     //여권정보 입력
    const updatePaymentDetail = useCallback(async (paymentDetailNo) => {
        // 입력 값 체크
    const { paymentDetailPassport, paymentDetailPassanger, paymentDetailEnglish, paymentDetailSex, paymentDetailBirth, paymentDetailCountry, paymentDetailVisa, paymentDetailExpire } = selectedDetail;

    // 입력란 공란 체크
    if (!paymentDetailPassport || !paymentDetailPassanger || !paymentDetailEnglish || !paymentDetailSex || !paymentDetailBirth || !paymentDetailCountry || !paymentDetailVisa || !paymentDetailExpire) {
        toast.error("모두 입력하세요."); // 경고 메시지
        return; // 등록을 중단
    }
        // 경고문구 표시
        const confirmMessage = "입력한 정보는 한 번 등록하면 수정이 불가능합니다. 등록하시겠습니까?";
        if (!window.confirm(confirmMessage)) {
            return; // 사용자가 취소하면 함수 종료
        }
        try {
            const response = await axios.put("http://localhost:8080/seats/detailUpdate", {
                ...selectedDetail,
                paymentDetailNo
            });
            if (response.status === 200) {
                toast.success("여권정보가 저장되었습니다.");
                
                // 제출된 정보를 업데이트
                setSubmittedDetails(prev => ({
                    ...prev,
                    [paymentDetailNo]: { ...selectedDetail } // 등록된 정보를 저장
                }));
            
                loadPaymentList(); // 결제 목록을 다시 불러옵니다
                setSelectedDetail({}); // 입력 필드 초기화
            }
        } catch (error) {
            toast.error("여권정보 저장을 실패했습니다.");
        }
    }, [loadPaymentList, selectedDetail]);
    
     //view
     return(<>
      {paymentList.length === 0 ? (
            <h1 className="text-center mt-5">결제한 목록이 없습니다.</h1>
        ) : (
            <div className="container">
                <div className="row">
                    <div className="col">
             <ul className="list-group">
                 {paymentList.map(payment=>(
                     <li key={payment.paymentNo} className="list-group-item">

                         <h2 className="text-end">대표 주문번호:{payment.paymentDto.paymentNo}</h2>
                         <h3 className="text-end mt-4">
                        결제일: {new Date(payment.paymentDto.paymentTime).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                        })}
                        </h3>
                        <h3 className="text-end">
                        {new Date(payment.paymentDto.paymentTime).toLocaleString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                        })}
                        <h3>출발공항:{payment.flightVO.departureAirport}</h3>
                        <h3>출발시간:{payment.flightVO.departureTime}</h3>
                        <h3>도착공항:{payment.flightVO.arrivalAirport}</h3>
                        <h3>도착시간:{payment.flightVO.arrivalTime}</h3>
                        <h3>운행시간:{payment.flightVO.flightTime}</h3>
                        </h3>
                        {/* <h1>항공기번호:{payment.paymentDto.flightId}</h1> */}
                         <h3>
                             {payment.paymentDto.paymentName}    
                         </h3>
                         <h3 className="text-end">
                             총 결제금액: {payment.paymentDto.paymentTotal.toLocaleString()}원
                            <div className="text-end mt-1">
                                <NavLink className="btn btn-warning" to={`/payment/detail/${payment.paymentDto.paymentNo}`}>결제내역이동</NavLink>
                              </div>
                         </h3>
                         <hr/>
        {/* 상세 결제 내용 */}
        {payment.paymentDetailList?.length > 0 && (
                        <ul className="list-group list-group-flush mt-4">
                            {payment.paymentDetailList.map(detail => (
                                <li className="list-group-item" key={detail.paymentDetailNo}>
                                    {detail.flightId.airlineName}
                                    <h5 className="text-end"><small>주문번호:{detail.paymentDetailNo}</small></h5>
                                    <h4 className="d-flex justify-content-between">
                                        {detail.paymentDetailName}
                                        <span />
                                        금액: {detail.paymentDetailPrice.toLocaleString()}원
                                    </h4>
                                    {submittedDetails[detail.paymentDetailNo] ? ( // 등록된 정보가 있으면
                                        <div>
                                            <p>여권번호: {submittedDetails[detail.paymentDetailNo].paymentDetailPassport}</p>
                                            <p>탑승객 이름: {submittedDetails[detail.paymentDetailNo].paymentDetailPassanger}</p>
                                            <p>영문 이름: {submittedDetails[detail.paymentDetailNo].paymentDetailEnglish}</p>
                                            <p>성별: {submittedDetails[detail.paymentDetailNo].paymentDetailSex}</p>
                                            <p>생년월일: {submittedDetails[detail.paymentDetailNo].paymentDetailBirth}</p>
                                            <p>국적: {submittedDetails[detail.paymentDetailNo].paymentDetailCountry}</p>
                                            <p>여권 발행국: {submittedDetails[detail.paymentDetailNo].paymentDetailVisa}</p>
                                            <p>여권 만료일: {submittedDetails[detail.paymentDetailNo].paymentDetailExpire}</p>
                                        </div>
                                    ) : ( // 등록된 정보가 없으면 입력 필드 표시
                                        <div>
                                        {detail.paymentDetailPassanger === null ? ( // passport가 null인 경우 입력 필드 표시
                                            <>
                                            <div>
                                                여권번호
                                                <input className="form-control"
                                                    type="text"
                                                    style={{ width: '25%' }}
                                                    onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailPassport: e.target.value }))}
                                                    />
                                            </div>
                                            <div>
                                            <span>한글이름</span>
                                                <input className="form-control"
                                                    type="text"
                                                    style={{ width: '25%' }}
                                                    onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailPassanger: e.target.value }))}
                                                    />
                                            </div>
                                            <div>
                                            <span>영문이름</span>
                                                <input className="form-control"
                                                    type="text"
                                                    style={{ width: '25%' }}
                                                    onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailEnglish: e.target.value }))}
                                                    />
                                            </div>
                                                <div>
                                                <span style={{ marginRight: '21px' }}> 성 별 </span>
                                                    <select className="form-control"
                                                    style={{ width: '25%' }}
                                                        onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailSex: e.target.value }))}>
                                                        <option value="">선택하세요</option>
                                                        <option value="M">남성</option>
                                                        <option value="W">여성</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    생년월일
                                                    <input className="form-control"
                                                    style={{ width: '25%' }}
                                                        type="date"
                                                        onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailBirth: e.target.value }))}
                                                        />
                                                    <div>
                                                    <span style={{ marginRight: '21px' }}> 국 적 </span>
                                                        <select className="form-control"
                                                        style={{ width: '25%' }}
                                                            id="country"
                                                            onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailCountry: e.target.value }))}>
                                                            <option value="">국적을 선택하세요</option>
                                                            <option value="KR">대한민국</option>
                                                            <option value="US">미국</option>
                                                            <option value="JP">일본</option>
                                                            <option value="CN">중국</option>
                                                            <option value="FR">프랑스</option>
                                                            <option value="DE">독일</option>
                                                            <option value="GB">영국</option>
                                                            <option value="IT">이탈리아</option>
                                                            <option value="ES">스페인</option>
                                                            <option value="AU">호주</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                    <span> 여권 발행국 </span>
                                                        <select className="form-control"
                                                        style={{ width: '25%' }}
                                                            id="visaType"
                                                            onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailVisa: e.target.value }))}>
                                                            <option value="">국적을 선택하세요</option>
                                                            <option value="KR">대한민국</option>
                                                            <option value="US">미국</option>
                                                            <option value="JP">일본</option>
                                                            <option value="CN">중국</option>
                                                            <option value="FR">프랑스</option>
                                                            <option value="DE">독일</option>
                                                            <option value="GB">영국</option>
                                                            <option value="IT">이탈리아</option>
                                                            <option value="ES">스페인</option>
                                                            <option value="AU">호주</option>
                                                        </select>
                                                    </div>
                                                    <span> 여권 만료일 </span>
                                                    <input className="form-control"
                                                    style={{ width: '25%' }}
                                                        type="date"
                                                        onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailExpire: e.target.value }))}
                                                    />
                                                </div>
                                                <div className="text-end mt-2">
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => updatePaymentDetail(detail.paymentDetailNo)}>
                                                        등록
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div>
                                            <p>여권번호: {detail.paymentDetailPassport}</p>
                                            <p>탑승객 이름: {detail.paymentDetailPassanger}</p>
                                            <p>영문 이름: {detail.paymentDetailEnglish}</p>
                                            <p>성별: {detail.paymentDetailSex}</p>
                                            <p>생년월일: {detail.paymentDetailBirth}</p>
                                            <p>국적: {detail.paymentDetailCountry}</p>
                                            <p>여권 발행국: {detail.paymentDetailVisa}</p>
                                            <p>여권 만료일: {detail.paymentDetailExpire}</p>
                                            </div>
                                        )}
                                    </div>
                                    )}
                                </li>
                            ))}
                         </ul>
                         )}
                     </li>
                 ))}
             </ul>
         </div>
     </div>
        </div>
        )};
     </>);
};
export default PaymentAllList;
