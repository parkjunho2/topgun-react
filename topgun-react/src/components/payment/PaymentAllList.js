import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const PaymentAllList=()=>{

     //state
     const [paymentList, setPaymentList] = useState([]); 

     //effect
     useEffect(()=>{
         loadPaymentList();
     }, []);
 
     //callback
     const loadPaymentList = useCallback(async()=>{
         const resp = await axios.get("http://localhost:8080/seats/paymentTotalList");
         setPaymentList(resp.data);
     }, []);
 
     const loadPaymentDetailList = useCallback(async (target)=>{
        const resp= await axios.get(
            "http://localhost:8080/seats/paymentlist/"+target.paymentNo);

        setPaymentList(paymentList.map(payment=>{
            if(payment.paymentNo===target.paymentNo){
                return{
                    ...payment,
                    paymentDetailList : resp.data
                };
            }  
            return {...payment};
        }));
    }, [paymentList]);
 
     //view
     return(<>
      {paymentList.length === 0 ? (
            <h1 className="text-center">결제한 목록이 없습니다.</h1>
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
