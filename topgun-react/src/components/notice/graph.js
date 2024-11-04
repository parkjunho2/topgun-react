import React, { useEffect, useState, useCallback } from 'react';
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import { useRecoilValue } from 'recoil';
import { loginState, userState } from "../../util/recoil";
import axios from 'axios';

Chart.register(...registerables);

function WorldMapWithGraphs() {
  const [seatData, setSeatData] = useState([]);
  const [airlineRevenueData, setAirlineRevenueData] = useState({ labels: [], datasets: [] });
  const [aircraftRevenueData, setAircraftRevenueData] = useState({});
  const [userInfo, setUserInfo] = useState(null);
  const login = useRecoilValue(loginState);
  const user = useRecoilValue(userState);

  const loadMyInfo = useCallback(async () => {
    if (!user || !user.userId || !user.userType) return;

    try {
      const response = await axios.post('http://localhost:8080/users/myInfo', {
        userId: user.userId,
        userType: user.userType
      });
      setUserInfo(response.data);
    } catch (error) {
      console.error("내 정보 로딩 오류:", error);
    }
  }, [user]);

  useEffect(() => {
    loadMyInfo();

    const fetchSeatData = async () => {
      try {
        const response = await fetch('http://localhost:8080/seats/flightInfoList');
        const data = await response.json();
        setSeatData(data);
        processSeatData(data);
      } catch (error) {
        console.error('좌석 데이터 가져오기 오류:', error);
      }
    };

    fetchSeatData();
  }, [loadMyInfo]);

  const processSeatData = (data) => {
    const airlineMap = new Map();
    data.forEach(seat => {
      const airline = seat.airlineName;
      const revenue = seat.seatsPrice || 0;

      if (!airlineMap.has(airline)) {
        airlineMap.set(airline, { total: 0, count: 0 });
      }

      airlineMap.get(airline).total += revenue;
      airlineMap.get(airline).count += 1;
    });

    const airlineLabels = Array.from(airlineMap.keys());
    const airlineRevenues = Array.from(airlineMap.values()).map(item => item.total);

    setAirlineRevenueData({
      labels: airlineLabels,
      datasets: [{
        label: "항공사별 총 매출",
        data: airlineRevenues,
        backgroundColor: "rgba(236, 115, 147, 0.8)",
        borderColor: "rgba(236, 115, 147, 1)",
        borderWidth: 2,
      }]
    });

    airlineLabels.forEach(airline => {
      const aircraftMap = new Map();
      data.forEach(seat => {
        if (seat.airlineName === airline) {
          const flightId = seat.flightId;
          const revenue = seat.seatsPrice || 0;

          if (!aircraftMap.has(flightId)) {
            aircraftMap.set(flightId, { total: 0, count: 0 });
          }

          aircraftMap.get(flightId).total += revenue;
          aircraftMap.get(flightId).count += 1;
        }
      });

      const aircraftLabels = Array.from(aircraftMap.keys());
      const aircraftRevenues = Array.from(aircraftMap.values()).map(item => item.total);

      setAircraftRevenueData(prevState => ({
        ...prevState,
        [airline]: {
          labels: aircraftLabels,
          datasets: [{
            label: `${airline} 항공기별 매출`,
            data: aircraftRevenues,
            backgroundColor: "rgba(75, 192, 192, 0.8)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
          }]
        }
      }));
    });
  };

  const graphOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: '항공기',
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 24,
        },
        grid: {
          display: true,
        },
      },
      y: {
        title: {
          display: true,
          text: '매출',
        },
        grid: {
          display: true,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
  };

  const renderAircraftRevenueGraph = (airline, title) => {
    const data = aircraftRevenueData[airline];
    if (data) {
      return (
        <div style={styles.graph} key={airline}>
          <h3 style={styles.graphTitle}>{title}</h3>
          <Bar data={data} options={graphOptions} />
        </div>
      );
    }
    return null;
  };

  console.log("로그인한 사용자 항공사:", userInfo?.airlineName);
  console.log("사용자 타입:", user.userType);
  console.log("aircraftRevenueData 객체:", aircraftRevenueData);

  const aircraftTitles = {
    "아시아나": "아시아나 항공기별 매출",
    "대한항공": "대한항공 항공기별 매출",
    // 추가적인 항공사 제목을 여기에 정의할 수 있습니다.
  };

  return (
    <div style={styles.container}>
      {userInfo && (
        <div className="row">
          <div className="col-sm-4">
            <p className="mb-0"></p>
          </div>
          <div className="col-sm-8">
            <p className="text-muted mb-0"></p>
          </div>
        </div>
      )}
      <div style={styles.graphContainer}>
        {/* 사용자 타입이 ADMIN 일 때만 총 매출 그래프를 조건부 렌더링 */}
        {user.userType == 'ADMIN' && (
          <div style={styles.graph}>
            <h3 style={styles.graphTitle}>항공사별 총 매출</h3>
            <Bar data={airlineRevenueData} options={graphOptions} />
          </div>
        )}

        {/* 사용자 항공사에 대한 그래프 렌더링 */}
        {userInfo?.airlineName && renderAircraftRevenueGraph(userInfo.airlineName, aircraftTitles[userInfo.airlineName] || `${userInfo.airlineName} 항공기별 매출`)}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "95%",
    margin: "40px auto",
  },
  graphContainer: {
    display: "flex",
    flexDirection: "column",
    width: "80%",
    gap: "20px",
  },
  graph: {
    borderRadius: "10px",
    padding: "30px",
    height: "400px",
  },
  graphTitle: {
    margin: "0 0 10px 0",
  },
};

export default WorldMapWithGraphs;
