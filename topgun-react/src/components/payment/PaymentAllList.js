import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import Flight from './../flight/Flight';

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
    const { paymentDetailPassport, paymentDetailPassanger, paymentDetailEnglish, 
        paymentDetailSex, paymentDetailBirth, paymentDetailCountry, 
        paymentDetailVisa, paymentDetailExpire } = selectedDetail;

        const isBasicInfo = isBasicInfoOnly(paymentList.find(payment => payment.paymentDetailList.some(detail => detail.paymentDetailNo === paymentDetailNo)));

        if (isBasicInfo) {
            // 기본 정보만 입력할 때는 패스포트, 성별, 국가, 비자, 만료일 필드는 체크하지 않음
            if (!paymentDetailPassanger || !paymentDetailBirth) {
                toast.error("탑승객 이름과 생년월일을 입력하세요."); // 경고 메시지
                return; // 등록을 중단
            }
        } else {
            // 일반 정보 입력 체크
            if (!paymentDetailPassport || !paymentDetailPassanger || !paymentDetailEnglish || 
                !paymentDetailSex || !paymentDetailBirth || !paymentDetailCountry || 
                !paymentDetailVisa || !paymentDetailExpire) {
                toast.error("모두 입력하세요."); // 경고 메시지
                return; // 등록을 중단
            }
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
    
    const isBasicInfoOnly = (payment) => {
        // payment가 undefined가 아닐 때만 접근
        const departureAirport = payment?.flightVO?.departureAirport;
        const arrivalAirport = payment?.flightVO?.arrivalAirport;
    
        return ["서울/김포(GMP)", "서울/인천(ICN)", "제주(CJU)"].includes(departureAirport) &&
               ["서울/김포(GMP)", "서울/인천(ICN)", "제주(CJU)"].includes(arrivalAirport);
    };

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
                             <h3 className="text-end">총 결제금액: {payment.paymentDto.paymentTotal.toLocaleString()}원</h3>
                         <h5 className="text-end">대표 주문번호:{payment.paymentDto.paymentNo}</h5>
                         <h3 className="text-end mt-4">
                         <h3 className="d-flex justify-content-between">
                            <div>{payment.paymentDto.paymentName}</div>
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
                        </h3>
                         </h3>
                        <h4 className="text-start">
                        <div className="mt-1">출발공항:{payment.flightVO.departureAirport}</div>
                        <div className="mt-1">출발시간:{payment.flightVO.departureTime}</div>
                        <div className="mt-3">도착공항:{payment.flightVO.arrivalAirport}</div>
                        <div className="mt-1">도착시간:{payment.flightVO.arrivalTime}</div>
                        </h4>
                        <h4 className="d-flex justify-content-between">
                        <div className="mt-2">운행시간:{payment.flightVO.flightTime}</div>
                            <div className="text-end mt-1">
                                <NavLink className="btn btn-warning" to={`/payment/detail/${payment.paymentDto.paymentNo}`}>결제상세내역</NavLink>
                              </div>
                        </h4>
                         <hr/>

        {/* 상세 결제 내용 */}
        {payment.paymentDetailList?.length > 0 && (
            <ul className="list-group list-group-flush mt-4">
                            {payment.paymentDetailList.map(detail => ( 
                                <li className="list-group-item" key={detail.paymentDetailNo}>
                                    {detail.flightId.airlineName}
                                    <div className={`text-end ${detail.paymentDetailStatus === '승인' ? 'text-primary' : detail.paymentDetailStatus === '취소' ? 'text-danger' : ''}`}>
                                        결제상태: {detail.paymentDetailStatus}완료
                                    </div>
                                    <h4 className="d-flex justify-content-between">
                                        {detail.paymentDetailName}
                                        <span />
                                        금액: {detail.paymentDetailPrice.toLocaleString()}원
                                    </h4>
                                    <h5 className="text-end"><small>주문번호:{detail.paymentDetailNo}</small></h5>
                                  {detail.paymentDetailStatus === '취소' ? ( 
                                <div>
                                    <h3><strong>취소된 좌석입니다.</strong></h3>
                                </div>
                                    ) : ( // 등록된 정보가 없으면 입력 필드 표시

                                        <div className="row">
                                        {detail.paymentDetailPassanger === null ? ( // passport가 null인 경우 입력 필드 표시
                                            <>
                                            <h5>여권정보 입력</h5>
                                            <div>
                                                            {(["서울/김포(GMP)", "서울/인천(ICN)", "제주(CJU)"].includes(payment.flightVO.departureAirport) &&
                                                                ["서울/김포(GMP)", "서울/인천(ICN)", "제주(CJU)"].includes(payment.flightVO.arrivalAirport)) ? (
                                                                <>
                                                                    <div className="mb-2">
                                                                        <label>한글이름</label>
                                                                        <input
                                                                            type="text"
                                                                            style={{ width: '25%' }}
                                                                            className="form-control"
                                                                            onChange={e => setSelectedDetail(prev => ({ ...prev, paymentDetailPassanger: e.target.value }))}
                                                                        />
                                                                    </div>
                                                                        <label>생년월일</label>
                                                                    <div className="d-flex justify-content-between">
                                                                        <input
                                                                            type="date"
                                                                            style={{ width: '25%' }}
                                                                            className="form-control"
                                                                            onChange={e => setSelectedDetail(prev => ({ ...prev, paymentDetailBirth: e.target.value }))}
                                                                        />
                                                                    <div className="text-end">
                                                                        <button
                                                                            className="btn btn-primary"
                                                                            onClick={() => updatePaymentDetail(detail.paymentDetailNo)}>
                                                                            등록
                                                                        </button>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            ) : (
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
                                                                        <span style={{ marginRight: '21px' }}>성별</span>
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
                                                                            <span style={{ marginRight: '21px' }}>국적</span>
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
                                                                            <span>여권 발행국</span>
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
                                                                        <span>여권 만료일</span>
                                                                        <div className="d-flex justify-content-between">
                                                                            <input className="form-control"
                                                                                style={{ width: '25%' }}
                                                                                type="date"
                                                                                onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailExpire: e.target.value }))}
                                                                            />
                                                                        <div className="text-end">
                                                                        <button
                                                                            className="btn btn-primary"
                                                                            onClick={() => updatePaymentDetail(detail.paymentDetailNo)}>
                                                                            등록
                                                                        </button>
                                                                        </div>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                            </>
                                        ) : ( //조건 탑승객 이름 입력되면 출력됨
                                            <div>
                                                {(["서울/김포(GMP)", "서울/인천(ICN)", "제주(CJU)"].includes(payment.flightVO.departureAirport) &&
                                                    ["서울/김포(GMP)", "서울/인천(ICN)", "제주(CJU)"].includes(payment.flightVO.arrivalAirport)) ? (
                                                    <div>
                                                        <p>탑승객 이름: {detail.paymentDetailPassanger}</p>
                                                        <p>생년월일: {detail.paymentDetailBirth}</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p>여권번호: {detail.paymentDetailPassport}</p>
                                                        <p>한글 이름: {detail.paymentDetailPassanger}</p>
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
