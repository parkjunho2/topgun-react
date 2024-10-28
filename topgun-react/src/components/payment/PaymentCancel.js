import { useEffect } from "react";

const PaymentCancel=()=>{
    
    useEffect(()=>{
        window.sessionStorage.removeItem("tid");
        window.sessionStorage.removeItem("checkedSeatsList");
    },[]);

    return(<>
    <h1 className="text-center mt-5">결제 취소</h1>
    </>);
};

export default PaymentCancel;