import { useEffect } from "react";

const PaymentFail=()=>{
   
    useEffect(()=>{
        window.sessionStorage.removeItem("tid");
        window.sessionStorage.removeItem("checkedSeatsList");
    },[]);

   return(<>
    <h1>실패</h1>    
    </>);
};

export default PaymentFail;