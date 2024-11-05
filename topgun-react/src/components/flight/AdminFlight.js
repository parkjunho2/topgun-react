import { useCallback, useState, useEffect } from "react";
import axios from "axios";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";

const AdminFlight = () => {
    const [flightList, setFlightList] = useState([]);

    useEffect(() => {
        loadList();
    }, []);

    const [isLoading, setIsLoading] = useState(true); // 로딩 상태 초기화

    const loadList = useCallback(async () => {
        setIsLoading(true);//로딩
        try {
            const resp = await axios.get("http://localhost:8080/admin/");
            // 현재 시간 (오늘 날짜)
       const now = new Date();
       const filteredFlights = resp.data.filter(flight => {
       const arrivalTime = new Date(flight.arrivalTime);
       return arrivalTime >= now;
   });
   setFlightList(filteredFlights);
} catch (error) {
toast.error("데이터를 불러오는 중 오류가 발생했습니다.");
} finally {
setIsLoading(false);  // 로딩 종료
}
    }, []);

    const updateFlight = useCallback(async (flightId, status) => {

         // 승인 시 알림창
         if (status === "승인" && !window.confirm("승인 후 변경 불가합니다. 승인 처리하시겠습니까?")) return;

          // 반려 시 알림창
        if (status === "거절" && !window.confirm("거절 처리하시겠습니까?")) return;

        const updatedFlight = {
            ...flightList.find(flight => flight.flightId === flightId),
            flightStatus: status,
        };

        await axios.put("http://localhost:8080/admin/update", updatedFlight);
        loadList();
    }, [flightList, loadList]);

    // 검색창 관련
    const [column, setColumn] = useState("flight_number");
    const [keyword, setKeyword] = useState("");

    const searchFlightList = useCallback(async () => {
        if (keyword.length === 0) return;
        const resp = await axios.get(`http://localhost:8080/flight/column/${column}/keyword/${encodeURIComponent(keyword)}`);

          // 현재 시간 (오늘 날짜)
    const now = new Date();

    // 항공편 리스트에서 현재 로그인된 사용자 ID와 도착 시간이 현재 시간보다 이후인 항공편만 필터링
const filteredFlights = resp.data.filter(flight => {
    const arrivalTime = new Date(flight.arrivalTime);
    return arrivalTime >= now;
});

        setFlightList(filteredFlights);
    }, [column, keyword]);

    return (
        <>
          {/* 로딩 중 상태 메시지 */}
          {isLoading ? (
                <div className="text-center mt-5">
                    <p>로딩 중입니다...</p>
                </div>
            ) : (
                <>
  {/* 검색 화면 */}
  <div className="row mt-4">
            <div className="col-md-8 offset-md-2">
                
                <div className="input-group">
                    <div className="col-3">
            <select className="form-select"
     value={column} onChange={e => setColumn(e.target.value)}>
     <option value="flight_number">항공편 번호</option>
     <option value="departure_airport">출발공항</option>
     <option value="arrival_airport">도착공항</option>
     <option value="user_id">항공사 ID</option>
     <option value="flight_status">결제상태</option>
            </select>
            </div>
            <div className="col-7">
            <input type="text" className="form-control"
                value={keyword} onChange={e =>setKeyword(e.target.value)} 
                placeholder="검색어 입력" />
                </div>
                <div className="col-2">
            <button type="button" className="btn btn-secondary"
                onClick={searchFlightList}>
                <FaMagnifyingGlass />
            </button>
            </div>
                </div>
                
            </div>
        </div>


            <div className="row mt-4">
                <div className="col">
                    <table className="table">
                        <thead className="table-dark">
                            <tr>
                                <th>항공편 번호</th>
                                <th>출발시간</th>
                                <th>도착시간</th>
                                <th>운항시간</th>
                                <th>출발공항</th>
                                <th>도착공항</th>
                                <th>ID</th>
                                <th>가격</th>
                                <th>상태</th>
                                <th>결제</th>
                            </tr>
                        </thead>
                        <tbody>
                            {flightList.map((flight) => (
                                <tr key={flight.flightId}>
                                    <td><NavLink to={"/admin/detail/"+flight.flightId}>
                                    {flight.flightNumber}
                                    </NavLink></td>
                                    <td>{new Date(flight.departureTime).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>{new Date(flight.arrivalTime).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>{flight.flightTime}</td>
                                    <td>{flight.departureAirport}</td>
                                    <td>{flight.arrivalAirport}</td>
                                    <td>{flight.userId}</td>
                                    <td>{Number(flight.flightPrice).toLocaleString()}원</td>
                                    <td>{flight.flightStatus}</td>
                                    <td>
                            {/* 상태 값에 따른 버튼 */}
                    {flight.flightStatus === "대기" && (
                    <>
                        <button className="btn btn-success" onClick={() => updateFlight(flight.flightId, "승인")}>승인</button>
                        <button className="btn btn-danger" onClick={() => updateFlight(flight.flightId, "거절")}>거절</button>
                    </>
                )}
                {flight.flightStatus === "승인" && (
                    <button className="btn btn-secondary" disabled>승인됨</button>
                )}
                {flight.flightStatus === "거절" && (
                    <button className="btn btn-secondary" disabled>거절됨</button>
                )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            </>
            )}
        </>
    );
};

export default AdminFlight;
