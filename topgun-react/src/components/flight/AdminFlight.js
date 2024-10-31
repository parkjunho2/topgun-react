import { useCallback, useState, useEffect } from "react";
import axios from "axios";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { NavLink } from "react-router-dom";

const AdminFlight = () => {
    const [flightList, setFlightList] = useState([]);

    useEffect(() => {
        loadList();
    }, []);

    const loadList = useCallback(async () => {
        const resp = await axios.get("http://localhost:8080/admin/");

         // 현재 시간 (오늘 날짜)
    const now = new Date();

        const filteredFlights = resp.data.filter(flight => {
        const arrivalTime = new Date(flight.arrivalTime);
        return arrivalTime >= now;
    });
        setFlightList(filteredFlights);
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
{/* 검색 화면 */}
<div className="d-flex justify-content-center mt-2">
    <div className="col-md-8 col-sm-10">
        <div className="input-group">
            <select name="column" className="form-select w-auto"
                value={column} onChange={e => setColumn(e.target.value)}>
                <option value="flight_number">항공편 번호</option>
                <option value="departure_airport">출발공항</option>
                <option value="arrival_airport">도착공항</option>
                <option value="user_id">항공사 ID</option>
                <option value="flight_status">결제상태</option>
            </select>
            <input type="text" className="form-control w-auto"
                value={keyword} onChange={e => setKeyword(e.target.value)} 
                placeholder="검색어 입력" />
            <button type="button" className="btn btn-secondary"
                onClick={searchFlightList}>
                <FaMagnifyingGlass />
            </button>
        </div>
    </div>
</div>


            <div className="row mt-4">
                <div className="col">
                    <table className="table table-striped">
                        <thead className="table-dark">
                            <tr>
                                <th>항공편 번호</th>
                                <th>출발 시간</th>
                                <th>도착 시간</th>
                                <th>운항 시간</th>
                                <th>출발 공항</th>
                                <th>도착 공항</th>
                                <th>ID</th>
                                <th>가격</th>
                                <th>상태</th>
                                <th>승인 및 거절</th>
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
    );
};

export default AdminFlight;
