import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from "react-chartjs-2"; // Doughnut 차트 추가
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { userState } from "../../util/recoil";
import './WorldMapWithGraphs.css'; // CSS 파일 임포트

// Chart.js의 모든 차트 유형을 등록합니다.
Chart.register(...registerables);

const WorldMapWithGraphs = () => {
    const user = useRecoilValue(userState);
    const [flightChartData, setFlightChartData] = useState(null);
    const [airlineChartData, setAirlineChartData] = useState(null);
    const [airlineName, setAirlineName] = useState('');
    const [flightPieChartData, setFlightPieChartData] = useState(null);
    const [airlinePieChartData, setAirlinePieChartData] = useState(null);

    useEffect(() => {
        const fetchFlightChartData = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/flight-payments`, {
                    params: { userId: user.userId }
                });
                const data = response.data;

                const labels = data.map(item => `Flight ${item.flightId}`);
                const payments = data.map(item => item.totalPayment);

                if (data.length > 0) {
                    setAirlineName(data[0].airlineName);
                }

                setFlightChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Total Payment',
                            data: payments,
                            backgroundColor: 'rgba(54, 162, 235, 0.8)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                            hoverBackgroundColor: 'rgba(54, 162, 235, 1)',
                            hoverBorderColor: 'rgba(255, 99, 132, 1)',
                        }
                    ]
                });

                // 파이 차트 데이터 설정
                setFlightPieChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Payment Distribution',
                            data: payments,
                            backgroundColor: payments.map((_, index) => `rgba(${index * 30 % 255}, ${100 + index * 30 % 155}, ${200}, 0.6)`), // 다채로운 색상
                            hoverBackgroundColor: payments.map((_, index) => `rgba(${index * 30 % 255}, ${100 + index * 30 % 155}, ${200}, 1)`),
                        }
                    ]
                });
            } catch (error) {
                console.error("Error fetching flight chart data:", error);
            }
        };

        const fetchAirlineChartData = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/all-flight-payments`);
                const allData = response.data;

                const airlinePayments = {};
                allData.forEach(item => {
                    if (!airlinePayments[item.airlineName]) {
                        airlinePayments[item.airlineName] = 0;
                    }
                    airlinePayments[item.airlineName] += item.totalPayment;
                });

                const airlineLabels = Object.keys(airlinePayments);
                const airlineTotalPayments = Object.values(airlinePayments);

                setAirlineChartData({
                    labels: airlineLabels,
                    datasets: [
                        {
                            label: 'Total Revenue by Airline',
                            data: airlineTotalPayments,
                            backgroundColor: 'rgba(255, 99, 132, 0.8)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1,
                            hoverBackgroundColor: 'rgba(255, 99, 132, 1)',
                            hoverBorderColor: 'rgba(54, 162, 235, 1)',
                        }
                    ]
                });

                // 파이 차트 데이터 설정
                setAirlinePieChartData({
                    labels: airlineLabels,
                    datasets: [
                        {
                            label: 'Airline Revenue Distribution',
                            data: airlineTotalPayments,
                            backgroundColor: airlineTotalPayments.map((_, index) => `rgba(${index * 60 % 255}, ${200 - index * 30 % 155}, ${100 + index * 30 % 155}, 0.6)`),
                            hoverBackgroundColor: airlineTotalPayments.map((_, index) => `rgba(${index * 60 % 255}, ${200 - index * 30 % 155}, ${100 + index * 30 % 155}, 1)`),
                        }
                    ]
                });
            } catch (error) {
                console.error("Error fetching airline chart data:", error);
            }
        };

        fetchFlightChartData();
        fetchAirlineChartData();
    }, [user.userId]);

    const flightOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Total Payment by Flight ID for ${airlineName} (${user.userType})`,
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        return `${tooltipItem.dataset.label}: $${tooltipItem.raw.toLocaleString()}`;
                    }
                }
            }
        },
        animation: {
            duration: 1000,
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Total Payment ($)',
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Flight ID',
                }
            }
        }
    };

    const airlineOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Total Revenue by Airline (${user.userType})`,
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        return `${tooltipItem.dataset.label}: $${tooltipItem.raw.toLocaleString()}`;
                    }
                }
            }
        },
        animation: {
            duration: 1000,
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Total Revenue ($)',
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Airlines',
                }
            }
        }
    };

    return (
        <div className="charts-container">
            <div className="charts-row">
                {user.userType === 'AIRLINE' && flightChartData ? (
                    <div className="chart-wrapper">
                        <Bar data={flightChartData} options={flightOptions} />
                        {flightPieChartData && (
                            <div className="pie-chart-wrapper">
                                <Doughnut data={flightPieChartData} options={{ responsive: true }} />
                            </div>
                        )}
                    </div>
                ) : (
                    user.userType === 'AIRLINE' ? (
                        <p>Loading flight payment chart data...</p>
                    ) : null
                )}
            </div>
            <div className="charts-row">
                {user.userType === 'ADMIN' && airlineChartData ? (
                    <div className="chart-wrapper">
                        <Bar data={airlineChartData} options={airlineOptions} />
                        {airlinePieChartData && (
                            <div className="pie-chart-wrapper">
                                <Doughnut data={airlinePieChartData} options={{ responsive: true }} />
                            </div>
                        )}
                    </div>
                ) : (
                    user.userType === 'ADMIN' ? (
                        <p>Loading airline revenue chart data...</p>
                    ) : null
                )}
            </div>
        </div>
    );
};

export default WorldMapWithGraphs;
