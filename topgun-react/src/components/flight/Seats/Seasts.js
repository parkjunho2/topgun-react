import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';

const Seats = () => {
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState(new Set()); // 선택된 좌석 상태를 관리하기 위한 Set
    // 선택 가능한 최대 좌석 수 이값을 받아오자
    const maxSelectableSeats = 4; 
    const { flightId } = useParams();

    const loadSeats = async () => {
        try {
            const response = await axios.get(`/seats/getSeats?flightId=${flightId}`);
            setSeats(response.data);
        } catch (error) {
            console.error("Error fetching seats:", error);
        }
    };

    useEffect(() => {
        loadSeats();
    }, []);

    useEffect(() => {
        // 선택된 좌석이 변경될 때마다 콘솔에 출력
        // console.log("선택된 좌석:", Array.from(selectedSeats));
    }, [selectedSeats]); // selectedSeats가 변경될 때마다 실행

    // 좌석 배열을 가공하여 2차원 배열로 변환
    const seatGrid = {};
    seats.forEach(seat => {
        const row = seat.seatsNumber.charAt(0); // 알파벳 부분
        const number = seat.seatsNumber.slice(1); // 숫자 부분
        if (!seatGrid[row]) {
            seatGrid[row] = [];
        }
        seatGrid[row][number - 1] = seat; // 숫자 - 1로 인덱싱
    });

    // 좌석 클릭 핸들러
    const SeatClick = (seatNumber) => {
        // 이미 선택된 좌석을 클릭한 경우, 선택 해제
        if (selectedSeats.has(seatNumber)) {
            setSelectedSeats(prev => {
                const newSelectedSeats = new Set(prev);
                newSelectedSeats.delete(seatNumber); // 선택 해제
                return newSelectedSeats;
            });
            return; // 아무런 동작도 하지 않음
        }

        // 선택 가능한 최대 좌석 수를 초과할 경우
        if (selectedSeats.size >= maxSelectableSeats) {
            toast.error(`최대 ${maxSelectableSeats}개의 좌석만 선택할 수 있습니다!`); // 오류 메시지 표시
            return;
        }

        // 선택된 좌석 상태 업데이트
        setSelectedSeats(prev => {
            const newSelectedSeats = new Set(prev);
            newSelectedSeats.add(seatNumber); // 선택되지 않은 좌석이면 선택
            return newSelectedSeats;
        });
    };

    return (
        <div className="container py-5">
            <div className="row">
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title text-center">좌석 배치도</h5>
                            <div className="seat-grid">
                                {Object.keys(seatGrid).map(row => (
                                    <div key={row} className="row mb-2">
                                        {seatGrid[row].map((seat, index) => {
                                            const isSeatUsed = seat && seat.seatsStatus === '사용'; // 좌석 사용 여부 확인
                                            return (
                                                <div key={index} className="col-2 d-flex justify-content-center align-items-center">
                                                    <button 
                                                        className={`btn m-3 p-3 ${isSeatUsed ? 'btn-danger' : (selectedSeats.has(seat ? seat.seatsNumber : '') ? 'btn-success' : 'btn-primary')}`} // 사용 중이면 빨간색, 선택되면 초록색, 아니면 파란색
                                                        disabled={isSeatUsed || !seat} // 사용 중이거나 좌석이 없으면 비활성화
                                                        onClick={() => SeatClick(seat ? seat.seatsNumber : '')} // 좌석 클릭 핸들러
                                                    >
                                                        {seat ? `${seat.seatsNumber}` : 'Empty'}
                                                    </button>
                                                    {/* 4와 5 사이에 통로를 삽입 (index가 3일 경우) */}
                                                    {index === 3 && (
                                                        <div style={{ width: '30px', height: '50px', backgroundColor: 'lightgray' }}></div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 offset-md-2">
                    <div className="alert alert-info">
                        선택된 좌석: {Array.from(selectedSeats).join(', ')} {/* 선택된 좌석 표시 */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Seats;
