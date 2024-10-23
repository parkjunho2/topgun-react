import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";

const PaymentDetail=()=>{
    //params
    const {paymentNo} = useParams();
    //state
    const [info, setInfo] = useState(null);

    //effect
    useEffect(()=>{
        loadPaymentInfo();
    },[]);

    //callback
    const loadPaymentInfo= useCallback(async()=>{
        const resp= await axios.get("http://localhost:8080/seats/detail/"+paymentNo);
        setInfo(resp.data);
    }, [])
    ;
    //view
    return(<>
            <div className="row mt-4">
                <div className="col">
                  <h2> 결제 요약 정보</h2>
                </div>
            </div>


         <div className="row mt-4">
            <div className="col">
                카카오페이 정보
            </div>
        </div>
        {info ? (  // info가 존재할 경우에만 렌더링
            <div className="row mt-4">
                <div className="col">
                    <div className="row">
                        <div className="col-3">거래번호</div>
                        <div className="col-9">{info.responseVO.tid}</div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-3">거래상태</div>
                        <div className="col-9">{info.responseVO.status}</div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-3">가맹점 내부 거래번호</div>
                        <div className="col-9">{info.responseVO.partner_order_id}</div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-3">구매자ID</div>
                        <div className="col-9">{info.responseVO.partner_user_id}</div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-3">구매방식</div>
                        <div className="col-9">{info.responseVO.payment_method_type}</div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-3">구매금액</div>
                        <div className="col-9">{info.responseVO.amount.total.toLocaleString()}원
                            (부가세 포함, 부가세 {info.responseVO.amount.vat.toLocaleString()}원)
                    </div>
                    <div className="row mt-2">
                        <div className="col-3">취소가능금액</div>
                        <div className="col-9">
                            {info.responseVO.cancel_available_amount.total.toLocaleString()}원
                        </div>
                    </div>
                        
                        {info.responseVO.canceled_amount.total >0 && (
                    <div className="row mt-2">
                        <div className="col-3">취소완료금액</div>
                        <div className="col-9">{info.responseVO.canceled_amount.total.toLocaleString()}원
                        </div>
                    </div>
                        )}
                        {info.responseVO.item_code !==null && (
                    <div className="row mt-2">
                        <div className="col-3">상품코드</div>
                        <div className="col-9">{info.responseVO.item_code}</div>
                    </div>
                        )}
                    <div className="row mt-2">
                        <div className="col-3">상품명</div>
                        <div className="col-9">{info.responseVO.item_name}</div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-3">결제완료일시</div>
                        <div className="col-9">{info.responseVO.approved_at}</div>
                    </div>
                    {info.responseVO.canceled_at !==null &&(
                    <div className="row mt-2">
                        <div className="col-3">결제취소일시</div>
                        <div className="col-9">{info.responseVO.canceld_at}</div>
                    </div>
                    )}
                    {/* 결제 상세 내역 */}
                    <ul className="list-group mt-4">
                    {info.responseVO.payment_action_details.map((action, index)=>(
                        <li className="list-group-item" key={index}>
                            <div className="row">
                                <div className="col-3">요청번호</div>
                                <div className="col-9">{action.aid}</div>
                            </div>
                            <div className="row">
                                <div className="col-3">요청유형</div>
                                <div className="col-9">{action.payment_action_type}</div>
                            </div>
                            <div className="row">
                                <div className="col-3">요청금액</div>
                                <div className="col-9">{action.amount}</div>
                            </div>
                            <div className="row">
                                <div className="col-3">요청승인일시</div>
                                <div className="col-9">{action.approved_at}</div>
                            </div>
                            {action.payload !==null && (
                            <div className="row">
                                <div className="col-3">추가요청사항</div>
                                <div className="col-9">{action.payload}</div>
                            </div>
                            )}
                        </li>
                    ))}
                    </ul>
                    </div>
                </div>
            </div>
        ) : (
            <div>Loading...</div>  // 데이터 로딩 중 표시할 메시지
        )}
    </>);
};
export default PaymentDetail;
