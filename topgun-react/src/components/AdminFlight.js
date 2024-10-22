import { useCallback, useState, useEffect } from "react";
import axios from "axios";
import { FaMagnifyingGlass } from "react-icons/fa6";

const AdminFlight = () => {
    const [flightList, setFlightList] = useState([]);
    const [column, setColumn] = useState("flight_number");
    const [keyword, setKeyword] = useState("");

    useEffect(() => {
        loadList();
    }, []);

    const loadList = useCallback(async () => {
        const resp = await axios.get("http://localhost:8080/admin/");
        setFlightList(resp.data);
    }, []);

    const updateFlight = useCallback(async (flightId, status) => {
        const updatedFlight = {
            ...flightList.find(flight => flight.flightId === flightId),
            flightStatus: status,
        };

        await axios.put("http://localhost:8080/admin/update", updatedFlight);
        loadList();
    }, [flightList, loadList]);

    const searchFlightList = useCallback(async () => {
        if (keyword.length === 0) return;
        const resp = await axios.get(`http://localhost:8080/admin/${column}/keyword/${encodeURIComponent(keyword)}`);
        setFlightList(resp.data);
    }, [column, keyword]);

    return (
        <>
            <div className="row mt-2">
                <div className="col-md-8 col-sm-10">
                    <div className="input-group">
                        <select name="column" className="form-select w-auto" value={column} onChange={e => setColumn(e.target.value)}>
                            <option value="flight_number">항공편 번호</option>
                            <option value="departure_airport">출발 공항</option>
                            <option value="arrival_airport">도착 공항</option>
                        </select>
                        <input type="text" className="form-control w-auto" value={keyword} onChange={e => setKeyword(e.target.value)} />
                        <button type="button" className="btn btn-secondary" onClick={searchFlightList}>
                            <FaMagnifyingGlass />
                        </button>
                    </div>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>항공편 번호</th>
                                <th>출발 시간</th>
                                <th>도착 시간</th>
                                <th>운항 시간</th>
                                <th>출발 공항</th>
                                <th>도착 공항</th>
                                <th>ID</th>
                                <th>총 좌석 수</th>
                                <th>상태</th>
                                <th>승인 및 반려</th>
                            </tr>
                        </thead>
                        <tbody>
                            {flightList.map((flight) => (
                                <tr key={flight.flightId}>
                                    <td>{flight.flightNumber}</td>
                                    <td>{new Date(flight.departureTime).toLocaleString()}</td>
                                    <td>{new Date(flight.arrivalTime).toLocaleString()}</td>
                                    <td>{flight.flightTime}</td>
                                    <td>{flight.departureAirport}</td>
                                    <td>{flight.arrivalAirport}</td>
                                    <td>{flight.userId}</td>
                                    <td>{flight.flightTotalSeat}</td>
                                    <td>{flight.flightStatus}</td>
                                    <td>
                                        <button className="btn btn-success" onClick={() => updateFlight(flight.flightId, "승인")}>승인</button>
                                        <button className="btn btn-danger" onClick={() => updateFlight(flight.flightId, "반려")}>반려</button>
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
