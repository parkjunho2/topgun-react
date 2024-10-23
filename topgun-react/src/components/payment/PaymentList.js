import axios from "axios";
import { useCallback, useEffect, useState } from "react";

const PaymentList=()=>{
    //state
    const [paymentList, setPaymentList] = useState([]); 

    //effect
    useEffect(()=>{
        loadPaymentList();
    }, []);

    //callback
    const loadPaymentList = useCallback(async()=>{
        const resp = await axios.get("http://localhost:8080/seats/paymentlist");
        setPaymentList(resp.data);
    }, []);

   const loadPaymentDetailList = useCallback(async (target) => {
    const isAlreadyOpen = paymentList.some(payment => payment.paymentNo === target.paymentNo && payment.paymentDetailList?.length > 0);

    if (isAlreadyOpen) {
        setPaymentList(paymentList.map(payment => {
            if (payment.paymentNo === target.paymentNo) {
                return {
                    ...payment,
                    paymentDetailList: [] 
                };
            }
            return payment;
        }));
    } else {
        const resp = await axios.get("http://localhost:8080/seats/paymentlist/" + target.paymentNo);
        setPaymentList(paymentList.map(payment => {
            if (payment.paymentNo === target.paymentNo) {
                return {
                    ...payment,
                    paymentDetailList: resp.data
                };
            }
            return payment;
        }));
    }
}, [paymentList]);

    //view
    return(<>
    <div className="row mt-4">
        <div className="col">

            <ul className="list-group">
                {paymentList.map(payment=>(
                    <li key={payment.paymentNo} className="list-group-item" 
                    onClick={e=>loadPaymentDetailList(payment)}>
                        <h3 className="d-flex justify-content-between">
                            {payment.paymentTime}
                            <span/>
                            {payment.paymentName}    
                            <span/>
                            총 결제금액: {payment.paymentTotal.toLocaleString()}원
                        </h3>
                        {/* 상세 결제 내용 */}
                        {payment.paymentDetailList?.length>0 && (
                        <ul className="list-group list-group-flush mt-4">
                            {payment.paymentDetailList.map(detail=>(
                            <li className="list-group-item" key={detail.paymentDetailNo}>
                                <h3 className="d-flex justify-content-between">
                                    {detail.paymentDetailName}
                                    <span/>
                                    {detail.paymentDetailPrice.toLocaleString()}원
                                </h3>
                            </li>
                            ))}
                        </ul>
                        )}
                        <div className="text-end">
                            더보기
                        </div>
                    </li>
                ))}
            </ul>
        </div>

    </div>

    </>);

};
export default PaymentList;