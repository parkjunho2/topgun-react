import React, { useEffect, useState } from 'react';
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import { useRecoilValue } from 'recoil';
import { loginState, userState } from "../../util/recoil";

Chart.register(...registerables);

function WorldMapWithGraphs() {
  const [seatData, setSeatData] = useState([]);
  const [airlineRevenueData, setAirlineRevenueData] = useState({ labels: [], datasets: [] });
  const [aircraftRevenueData, setAircraftRevenueData] = useState({ labels: [], datasets: [] });
  const [aircraftAverageRevenueData, setAircraftAverageRevenueData] = useState({ labels: [], datasets: [] }); // 추가된 항공기별 평균 매출 데이터
  const [airlineAverageRevenueData, setAirlineAverageRevenueData] = useState({ labels: [], datasets: [] });

  const login = useRecoilValue(loginState);
  const user = useRecoilValue(userState);

  useEffect(() => {
    const fetchSeatData = async () => {
      try {
        const response = await fetch('http://localhost:8080/seats/flightInfoList');
        const data = await response.json();
        console.log("Fetched seat data:", data);
        setSeatData(data);

        if (user.userType === "ADMIN") {
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
          const airlineAverageRevenues = Array.from(airlineMap.values()).map(item => item.total / item.count);

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

          setAirlineAverageRevenueData({
            labels: airlineLabels,
            datasets: [{
              label: "항공사별 평균 매출",
              data: airlineAverageRevenues,
              backgroundColor: "rgba(75, 192, 192, 0.8)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 2,
            }]
          });
        } else if (user.userType === "AIRLINE") {
          const aircraftMap = new Map();
          data.forEach(seat => {
            const flightId = seat.flightId;
            const revenue = seat.seatsPrice || 0;

            if (!aircraftMap.has(flightId)) {
              aircraftMap.set(flightId, { total: 0, count: 0 });
            }

            aircraftMap.get(flightId).total += revenue;
            aircraftMap.get(flightId).count += 1; // 항공기별 수 증가
          });

          const aircraftLabels = Array.from(aircraftMap.keys());
          const aircraftRevenues = Array.from(aircraftMap.values()).map(item => item.total);
          const aircraftAverageRevenues = Array.from(aircraftMap.values()).map(item => item.total / item.count); // 평균 매출 계산

          setAircraftRevenueData({
            labels: aircraftLabels,
            datasets: [{
              label: "항공기별 매출",
              data: aircraftRevenues,
              backgroundColor: "rgba(75, 192, 192, 0.8)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 2,
            }]
          });

          // 항공기별 평균 매출 데이터 설정
          setAircraftAverageRevenueData({
            labels: aircraftLabels,
            datasets: [{
              label: "항공기별 평균 매출",
              data: aircraftAverageRevenues,
              backgroundColor: "rgba(236, 115, 147, 0.8)", // 다른 색상 사용
              borderColor: "rgba(236, 115, 147, 1)",
              borderWidth: 2,
            }]
          });
        }

      } catch (error) {
        console.error('좌석 데이터 가져오기 오류:', error);
      }
    };

    fetchSeatData();
  }, [user.userType]);

  const graphOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: user.userType === 'ADMIN' ? '항공사' : '항공기',
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

  return (
    <div style={styles.container}>
      <div style={styles.graphContainer}>
        {user.userType === 'ADMIN' && (
          <>
            <div style={styles.graph}>
              <h3 style={styles.graphTitle}>항공사별 총 매출</h3>
              <Bar data={airlineRevenueData} options={graphOptions} />
            </div>
            <div style={styles.graph}>
              <h3 style={styles.graphTitle}>항공사별 평균 매출</h3>
              <Bar data={airlineAverageRevenueData} options={graphOptions} />
            </div>
          </>
        )}
        {user.userType === 'AIRLINE' && (
          <>
            <div style={styles.graph}>
              <h3 style={styles.graphTitle}>항공기별 매출</h3>
              <Bar data={aircraftRevenueData} options={graphOptions} />
            </div>
            <div style={styles.graph}>
              <h3 style={styles.graphTitle}>항공기별 평균 매출</h3>
              <Bar data={aircraftAverageRevenueData} options={graphOptions} />
            </div>
          </>
        )}
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
