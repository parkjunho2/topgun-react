import axios from "axios";
import { useCallback, useEffect, useState } from "react";

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
     <div className="row mt-4">
         <div className="col">
 
             <ul className="list-group">
                 {paymentList.map(payment=>(
                     <li key={payment.paymentNo} className="list-group-item">
                         <h3 className="d-flex justify-content-between">
                             {payment.paymentDto.paymentTime}
                             <span/>
                             {payment.paymentDto.paymentName}    
                             <span/>
                             총 결제금액: {payment.paymentDto.paymentTotal}원
                         </h3>
                         {/* 상세 결제 내용 */}
                         {payment.paymentDetailList?.length>0 && (
                         <ul className="list-group list-group-flush mt-4">
                             {payment.paymentDetailList.map(detail=>(
                             <li className="list-group-item" key={detail.paymentDetailNo}>
                                 <h3 className="d-flex justify-content-between">
                                     {detail.paymentDetailName}
                                     <span/>
                                     {detail.paymentDetailPrice}원
                                 </h3>
                                 <div className="text-end">
                                <small>여권정보 등록 및 변경</small>
                               </div>
                             </li>
                             ))}
                         </ul>
                         )}
                     </li>
                 ))}
             </ul>
         </div>
 
     </div>
 
     </>);
};
export default PaymentAllList;
