import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

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

     
     //추가정보 입력
    const updatePaymentDetail = useCallback(async (paymentDetailNo) => {
        // 입력 값 체크
    const { paymentDetailPassport, paymentDetailPassanger, paymentDetailEnglish, paymentDetailSex, paymentDetailBirth, paymentDetailCountry, paymentDetailVisa, paymentDetailExpire } = selectedDetail;

    // 입력란 공란 체크
    if (!paymentDetailPassport || !paymentDetailPassanger || !paymentDetailEnglish || !paymentDetailSex || !paymentDetailBirth || !paymentDetailCountry || !paymentDetailVisa || !paymentDetailExpire) {
        alert("모두 입력하세요."); // 경고 메시지
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
                alert("여권정보가 저장되었습니다.");
                
                // 제출된 정보를 업데이트
                setSubmittedDetails(prev => ({
                    ...prev,
                    [paymentDetailNo]: { ...selectedDetail } // 등록된 정보를 저장
                }));
            
                loadPaymentList(); // 결제 목록을 다시 불러옵니다
                setSelectedDetail({}); // 입력 필드 초기화
            }
        } catch (error) {
            alert("여권정보 저장을 실패했습니다.");
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
                         <h2 className="text-end my-4">결제일: {payment.paymentDto.paymentTime}</h2>
                         <h3>
                             {payment.paymentDto.paymentName}    
                         </h3>
                         <h3 className="text-end">
                             총 결제금액: {payment.paymentDto.paymentTotal.toLocaleString()}원
                         </h3>
        {/* 상세 결제 내용 */}
        {payment.paymentDetailList?.length > 0 && (
                        <ul className="list-group list-group-flush mt-4">
                            {payment.paymentDetailList.map(detail => (
                                <li className="list-group-item" key={detail.paymentDetailNo}>
                                    {detail.flightId.airlineName}
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
                                            <p>비자 종류: {submittedDetails[detail.paymentDetailNo].paymentDetailVisa}</p>
                                            <p>비자 만료일: {submittedDetails[detail.paymentDetailNo].paymentDetailExpire}</p>
                                        </div>
                                    ) : ( // 등록된 정보가 없으면 입력 필드 표시
                                        <div>
                                        {detail.paymentDetailPassport === null ? ( // passport가 null인 경우 입력 필드 표시
                                            <>
                                            <div>
                                                여권번호
                                                <input className="w-25"
                                                    type="text"
                                                    onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailPassport: e.target.value }))}
                                                />
                                            </div>
                                            <div>
                                            <span>한글이름</span>
                                                <input className="w-25"
                                                    type="text"
                                                    onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailPassanger: e.target.value }))}
                                                />
                                            </div>
                                            <div>
                                            <span>영문이름</span>
                                                <input className="w-25"
                                                    type="text"
                                                    onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailEnglish: e.target.value }))}
                                                />
                                            </div>
                                                <div>
                                                <span style={{ marginRight: '21px' }}> 성 별 </span>
                                                    <select className="w-25"
                                                        onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailSex: e.target.value }))}>
                                                        <option value="">선택하세요</option>
                                                        <option value="M">남성</option>
                                                        <option value="W">여성</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    생년월일
                                                    <input className="w-25"
                                                        type="date"
                                                        onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailBirth: e.target.value }))}
                                                    />
                                                    <div>
                                                    <span style={{ marginRight: '21px' }}> 국 적 </span>
                                                        <select className="w-25"
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
                                                    <span> 발 행 국 </span>
                                                        <select className="w-25"
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
                                                    <span> 만 료 일 </span>
                                                    <input className="w-25"
                                                        type="date"
                                                        onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailExpire: e.target.value }))}
                                                    />
                                                </div>
                                                <div className="text-end">
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => updatePaymentDetail(detail.paymentDetailNo)}
                                                    >
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
                                            <p>비자 종류: {detail.paymentDetailVisa}</p>
                                            <p>비자 만료일: {detail.paymentDetailExpire}</p>
                                            </div>
                                        )}
                                    </div>
                                    )}
                                </li>
                            ))}
                             <div className="text-end mt-1">
                             <NavLink className="btn btn-warning" to={`/payment/detail/${payment.paymentDto.paymentNo}`}>결제내역이동</NavLink>
                           </div>
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
