import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const PaymentAllList=()=>{
     //state
     const [paymentList, setPaymentList] = useState([]); 
     const [selectedDetail, setSelectedDetail] = useState({});
     //effect
     useEffect(()=>{
         loadPaymentList();
     }, []);
 
     //callback
     const loadPaymentList = useCallback(async()=>{
         const resp = await axios.get("http://localhost:8080/seats/paymentTotalList");
         setPaymentList(resp.data);
     }, []);
 
    //  const loadPaymentDetailList = useCallback(async (target)=>{
    //     const resp= await axios.get(
    //         "http://localhost:8080/seats/paymentlist/"+target.paymentNo);

    //     setPaymentList(paymentList.map(payment=>{
    //         if(payment.paymentNo===target.paymentNo){
    //             return{
    //                 ...payment,
    //                 paymentDetailList : resp.data
    //             };
    //         }  
    //         return {...payment};
    //     }));
    // }, [paymentList]);
    // callback to update passport number
    const updatePaymentDetail = useCallback(async () => {
        try {
            const response = await axios.put(`http://localhost:8080/seats/updatePaymentDetail/${selectedDetail.paymentDetailNo}`, {
                paymentDetailPassport: selectedDetail.paymentDetailPassport,
                paymentDetailPassanger: selectedDetail.paymentDetailPassanger,
                paymentDetailEnglish: selectedDetail.paymentDetailEnglish,
                paymentDetailSex: selectedDetail.paymentDetailSex,
                paymentDetailBirth: selectedDetail.paymentDetailBirth,
                paymentDetailCountry: selectedDetail.paymentDetailCountry,
                paymentDetailVisa: selectedDetail.paymentDetailVisa,
                paymentDetailExpire: selectedDetail.paymentDetailExpire
            });
            console.log(response);
            if (response.status === 200) {
                alert("결제 상세 정보가 성공적으로 업데이트되었습니다.");
                loadPaymentList(); // 결제 목록을 다시 불러옵니다
                setSelectedDetail({}); // 입력 필드 초기화
            }
        } catch (error) {
            console.error("결제 상세 정보 업데이트 중 오류가 발생했습니다:", error);
            alert("결제 상세 정보 업데이트에 실패했습니다.");
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
                         <h2 className="text-center my-4">{payment.paymentDto.paymentTime}</h2> {/* 날짜 */}
                         <h3 className="d-flex justify-content-between ">
                             {payment.paymentDto.paymentName}    
                             <span/>
                             총 결제금액: {payment.paymentDto.paymentTotal.toLocaleString()}원
                         </h3>

                         {/* 상세 결제 내용 */}
                         {payment.paymentDetailList?.length>0 && (
                         <ul className="list-group list-group-flush mt-4">
                             {payment.paymentDetailList.map(detail=>(
                             <li className="list-group-item" key={detail.paymentDetailNo}>
                                 <h3 className="d-flex justify-content-between">
                                     {detail.paymentDetailName}
                                     <span/>
                                     금액: {detail.paymentDetailPrice.toLocaleString()}원
                                 </h3>
                                 <div>
                                <input
                                    type="text"
                                    placeholder="여권번호"
                                    onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailPassport: e.target.value, paymentDetailNo: detail.paymentDetailNo }))}
                                />
                                <input
                                    type="text"
                                    placeholder="탑승객 이름"
                                    onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailPassanger: e.target.value }))}
                                />
                                <input
                                    type="text"
                                    placeholder="영문 이름"
                                    onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailEnglish: e.target.value }))}
                                />
                                <input
                                    type="text"
                                    placeholder="성별"
                                    onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailSex: e.target.value }))}
                                />
                                <input
                                    type="date"
                                    placeholder="생년월일"
                                    onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailBirth: e.target.value }))}
                                />
                                <input
                                    type="text"
                                    placeholder="국적"
                                    onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailCountry: e.target.value }))}
                                />
                                <input
                                    type="text"
                                    placeholder="비자 종류"
                                    onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailVisa: e.target.value }))}
                                />
                                <input
                                    type="date"
                                    placeholder="비자 만료일"
                                    onChange={(e) => setSelectedDetail(prev => ({ ...prev, paymentDetailExpire: e.target.value }))}
                                />
                            </div>
                            <div className="text-end">
                                <button className="btn btn-primary" onClick={updatePaymentDetail}>
                                    등록
                                </button>
                                </div>
                             </li>
                             ))}
                             <div className="text-end mt-1">
                             <NavLink className="btn btn-danger" to={`/payment/detail/${payment.paymentDto.paymentNo}`}>결제취소</NavLink>
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
