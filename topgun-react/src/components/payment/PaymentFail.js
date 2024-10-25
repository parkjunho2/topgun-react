import { useEffect } from "react";

const PaymentFail=()=>{
   
    useEffect(()=>{
        window.sessionStorage.removeItem("tid");
        window.sessionStorage.removeItem("checkedSeatsList");
    },[]);

   return(<>
    <h1 className="text-center">결제승인 시간초과 입니다.</h1>    
    </>);
};

export default PaymentFail;