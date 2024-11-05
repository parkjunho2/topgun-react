import './FlightTicketSearch.css'
import 'lightpick/css/lightpick.css';
import './MainPage.css'
import { useCallback, useRef, useEffect, useState, useMemo } from "react";
import axios from 'axios';
import { FaSearch } from "react-icons/fa";
import Lightpick from 'lightpick';
import moment from "moment";
import { useNavigate } from 'react-router';
import { IoClose } from "react-icons/io5";
import * as hangul from 'hangul-js';
import { wmoCode } from '../../util/wmoCode/wmoCode';
import { toast } from "react-toastify";
import { IoMdClose } from "react-icons/io";

const MainPage = () => {
    const [recentSearches, setRecentSearches] = useState([]); // recentSearches 상태 추가
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    const [keyword, setKeyword] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1); // 선택된 항목의 인덱스


    // state
    const [input, setInput] = useState({
        departureAirport: "",   // 출발 공항
        arrivalAirport: "",     // 도착 공항
        departureTime: "",         // 출발 날짜
    });

    const handleSearch = () => {
        const { departureAirport, arrivalAirport, departureTime } = input;

        if (departureAirport.length === 0) {
            return window.alert("출발지를 입력해주세요.");
        } else if (arrivalAirport.length === 0) {
            return window.alert("도착지를 입력해주세요.");
        } else if (departureTime.length === 0) {
            return window.alert("출발일자를 입력해주세요.");
        } else {
            const recentSearch = { departureAirport, arrivalAirport };
            // 최근 검색 항목을 LocalStorage에 저장
            let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
            recentSearches.unshift(recentSearch); // 최근 검색을 맨 앞에 추가
            recentSearches = recentSearches.slice(0, 5); // 최대 5개만 유지
            localStorage.setItem("recentSearches", JSON.stringify(recentSearches));

            // 쿼리 파라미터 없이 state로 데이터 전달
            navigate("/flight/bookingList", {
                state: {
                    departureAirport,
                    arrivalAirport,
                    departureTime
                }
            });
        }
    };

    // 검색 항목 삭제 함수
    const recentSearchesDelete = (index) => {
        const updatedSearches = recentSearches.filter((_, i) => i !== index);
        setRecentSearches(updatedSearches);
        localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    };

    // LocalStorage에서 최근 검색 항목을 불러와 화면에 표시
    useEffect(() => {
        const storedSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
        setRecentSearches(storedSearches);
    }, []);

    /*======================   복합검색을 위한 기능    =============================*/
    const [result, setResult] = useState({
        count: 0,
        last: true,
        flightList: []
    });

    //페이징 관련 state
    const [page, setPage] = useState(null);
    const [size, setSize] = useState(10);

    // [2] effect로 계산 (권장하는 방법)
    useEffect(() => {
        setInput({
            ...input,
            beginRow: page * size - (size - 1),
            endRow: page * size
        })
    }, [page, size]);

    // useEffect(()=>{
    //     if(page === null) return;   //초기상태 page 값이 null이라면 아무것도 동작 X

    //    console.log("beginRow , endRow 변경 : " , input.beginRow , input.endRow);
    //    if(page === 1  ) {
    //         sendRequest();
    //    }
    //    if(page >= 2) {
    //        sendMoreRequest();
    //    }
    // } , [input.beginRow , input.endRow]);

    //callback
    const changeInputString = useCallback(e => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    }, [input]);

    //첫 목록을 불러올 때 사용
    const sendRequest = useCallback(async () => {
        loading.current = true; //시작지점
        const resp = await axios.post("http://localhost:8080/flight/complexSearch", input);
        // console.log(resp.data);

        setResult(resp.data);
        loading.current = false;    //종료지점
    }, [input]);

    const setFirstPage = useCallback(() => {
        setPage(prev => null);
        setTimeout(() => {
            setPage(prev => 1);
        }, 1);  //이 코드는 1ms 뒤에 실행해라!

    }, [page]);
    // ※※  로딩중에 추가 로딩이 불가능하게 처리하기 위한 REF 사용 ※※
    // 목록을 불러오기 시작하면 loading.current = true로 변경
    // 목록을 불러오고 나면  loading.current = false로 변경
    const loading = useRef(false);



    // 창 크기 변화 감지
    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 768);  // 768px 이하일 때 true
        };

        // 처음 로드될 때와 창 크기 변화할 때 이벤트 핸들러 실행
        window.addEventListener('resize', handleResize);
        handleResize(); // 초기 실행

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    //navigate
    const navigate = useNavigate();



    //조회 버튼에 대한 navigate 구현
    const checkInputEmpty = useCallback(() => {
        // e.preventDefault();
        if (input.departureAirport.length === 0) {
            return toast.error("출발지를 입력해주세요.");
        }
        else if (input.arrivalAirport.length === 0) {
            return toast.error("도착지를 입력해주세요.");
        }
        else if (input.departureTime.length === 0) {
            return toast.error("출발일자를 입력해주세요.");
        }
        // else if (input.departureDate.length === 0) {
        //     return window.alert("도착일자를 입력해주세요.");
        // }
        else {
            navigate("/flight/bookingList");   //위의 항목들이 모두 pass라면 이동
        }
    }, [input]);

    /*                         ☆☆☆☆ 출발지에 대한 기능 state ☆☆☆☆                              */
    //출발지에 대한 state
    const [departureInputClick, setDepartureInputClick] = useState(false); // 출발지 입력창 표시 여부
    const [selectedDepNational, setSelectedDepNational] = useState("한국") //초기값은 한국으로 설정
    const [selectedDepCity, setSelectedDepCity] = useState(null);     //초기값은 null로 설정. 선택된 도시가 없음
    const [selectedArrivalCity, setSelectedArrivalCity] = useState(null);     //초기값은 null로 설정. 선택된 도시가 없음
    const [cities, setCities] = useState([]); // 동적으로 표시할 도시 목록

    // 기본적으로 "한국"이 선택되었을 때 도시 목록 설정
    useEffect(() => {
        departureNationalClick('한국');
    }, []);

    const handleCityClick = (city) => {
        setSelectedDepCity(city);  // 클릭된 도시를 상태로 설정
    };

    // 선택된 값(selectedValue)과 현재 값(currentValue)을 비교하여, 
    // 일치하면 'btn-primary' 클래스를, 그렇지 않으면 'btn-outline-primary' 클래스를 반환.
    const getButtonClass = (selectedValue, currentValue) => {
        return `btn w-100 ${selectedValue === currentValue ? 'btn-primary' : 'btn-outline-primary'}`;
    };

    // 'value'와 'onClickHandler'를 받아서, 'onClickHandler'가 호출될 때 그 값(value)을 인자로 넘김
    const sendNationDep = (value, onClickHandler) => {
        return () => onClickHandler(value);
    };

    // 출발지 input 클릭 시 출발지 기능을 표시하는 함수
    const DepartureClick = () => {
        setDepartureInputClick(true); // 출발지 입력창을 열도록 상태 변경
    };

    // 닫기 버튼 클릭 시 출발지 입력창 기능을 닫는 함수
    const CloseSetting = () => {
        setDepartureInputClick(false); // 출발지 입력창을 닫도록 상태 변경
        setDestinationInputClick(false);    //도착지 입력창을 닫도록 상태 변경
    };

    // 출발지 값이 선택된 도시로 설정되도록 useMemo로 메모이제이션
    const departureText = useMemo(() => {
        // 우선적으로 keyword가 있으면 keyword를 반환, 그 다음 selectedDepCity를 반환
        // if (keyword) return keyword;
        return selectedDepCity ? selectedDepCity : input.departureAirport;     // selectedDepCity가 있으면 해당 도시를 반환, 없으면 기존 input.departureAirport 값을 유지
    }, [keyword, selectedDepCity, input.departureAirport]);

    // 출발지 상태 변경 처리
    useEffect(() => {
        setInput((prev) => ({
            ...prev,
            departureAirport: selectedDepCity ? selectedDepCity : prev.departureAirport // 선택된 도시가 있으면 해당 도시로 설정
        }));
    }, [selectedDepCity]); // 선택된 도시가 변경될 때마다 업데이트

    //사용자가 특정 국가/도시 버튼을 클릭할 때, 그 국가/도시를 선택된 도시로 기록
    const departureNationalClick = (nation) => {
        setSelectedDepNational(nation);  // 클릭된 국가를 상태로 설정
        if (nation === '동북아시아') {
            setCities(['도쿄/나리타(NRT)', '오사카/간사이(KIX)', '삿포로(CTS)']); // 동북아시아 클릭 시 도시 목록 설정
        } else if (nation === '동남아시아') {
            setCities(['다낭(DAD)', '나트랑(CXR)']); // 동남아시아 클릭 시 도시 목록 설정
        } else {
            setCities(['서울/인천(ICN)', '서울/김포(GMP)', '제주(CJU)', '광주(KWJ)', '여수(RSU)', '청주(CJJ)', '대구(TAE)']); // 기본 도시 목록
        }
    };

    // '다음' 버튼 클릭 시 도착지 입력창으로 포커스 이동 및 값 반영
    const handleNextClick = () => {
        if (input.departureAirport.length === 0) {
            return toast.error("출발지를 입력해주세요.");
        }
        // 자동완성된 키워드 값을 input.departure에 설정
        if (selectedDepCity) { // selectedDepCity가 존재하면
            setInput(prev => ({
                ...prev,
                departureAirport: selectedDepCity // 선택된 도시로 설정
            }));
        } else if (keyword) {
            setInput(prev => ({
                ...prev,
                departureAirport: keyword // 키워드로 설정
            }));
        }

        setOpen(false); // 자동완성 리스트 닫기

        // 도착지 입력창으로 포커스 이동
        setTimeout(() => {
            const destinationInput = document.querySelector('input[name="arrivalAirport"]');
            if (destinationInput) {
                destinationInput.focus(); // 도착지 입력창에 포커스
            }
            setDestinationInputClick(true); // 도착지 선택 UI 열기
        }, 100); // 약간의 딜레이 후 포커스 이동
    };

    // '도착지' 다음 버튼 클릭 시 출발일 입력창으로 포커스 이동
    const handleArrivalNextClick = () => {
        if (selectedArrivalCity) {
            setInput(prev => ({
                ...prev,
                arrivalAirport: selectedArrivalCity
            }));
        } else if (keyword) {
            setInput(prev => ({
                ...prev,
                arrivalAirport: keyword
            }));
        }
        setOpen(false);

        // 출발일 입력창으로 포커스 이동
        setTimeout(() => {
            if (datePickerRef.current) {
                datePickerRef.current.focus();
            }
        }, 100);
    };


    /*                         ☆☆☆☆ 도착지에 대한 기능 state ☆☆☆☆                             */
    const [destinationInputClick, setDestinationInputClick] = useState(false); // 도착지 입력창 표시 여부
    const [selectedDesNational, setSelectedDesNational] = useState(null) //초기값은 null로 설정. 선택된 국가가 없음
    const [selectedDesCity, setSelectedDesCity] = useState(null);     //초기값은 null로 설정. 선택된 도시가 없음
    const [destinationCities, setDestinationCities] = useState([]); // 동적으로 표시할 도시 목록

    // 도착지 input 클릭 시 출발지 기능을 표시하는 함수
    const destinationClick = () => {
        if (input.departureAirport.length === 0) {
            toast.error("출발지를 입력해주세요.");

            // 도착지 입력창의 포커스를 해제합니다.
            const destinationInput = document.querySelector('input[name="arrivalAirport"]');
            if (destinationInput) {
                destinationInput.blur(); // 포커스를 해제
            }
            return;
        }
        setDestinationInputClick(true); // 도착지 입력창을 열도록 상태 변경
    };

    const destinationCity = (cityDes) => {
        setSelectedDesCity(cityDes);  // 클릭된 도시를 상태로 설정
    };

    // 'value'와 'onClickHandler'를 받아서, 'onClickHandler'가 호출될 때 그 값(value)을 인자로 넘김
    const sendNationalDes = (value, onClickHandler) => {
        return () => onClickHandler(value);
    };

    // 도착지 값이 선택된 도시로 설정되도록 useMemo로 메모이제이션 
    const destinationText = useMemo(() => {
        // selectedDesCity가 있으면 해당 도시를 반환, 없으면 기존 input.arrivalAirport 값을 유지
        return selectedDesCity ? selectedDesCity : input.arrivalAirport;
    }, [selectedDesCity, input.arrivalAirport]);

    // 도착지 상태 변경 처리
    useEffect(() => {
        setInput((prev) => ({
            ...prev,
            arrivalAirport: destinationText // 선택된 도착지를 도착지 입력창에 설정
        }));
    }, [destinationText]); // 선택된 도시가 변경될 때마다 업데이트

    //사용자가 특정 국가/도시 버튼을 클릭할 때, 그 국가/도시를 선택된 도시로 기록
    const destinationNationalClick = (nationDestination) => {
        setSelectedDesNational(nationDestination);  // 클릭된 국가를 상태로 설정
        if (nationDestination === '동북아시아') {
            setDestinationCities(['도쿄/나리타(NRT)', '오사카/간사이(KIX)', '삿포로(CTS)']); // 동북아시아 클릭 시 도시 목록 설정
        } else if (nationDestination === '동남아시아') {
            setDestinationCities(['다낭(DAD)', '나트랑(CXR)']); // 동남아시아 클릭 시 도시 목록 설정
        } else {
            setDestinationCities(['서울/인천(ICN)', '서울/김포(GMP)', '제주(CJU)', '광주(KWJ)', '여수(RSU)', '청주(CJJ)', '대구(TAE)']); // 기본 도시 목록
        }
    };


    /*                         ☆☆☆☆가는편/오는편 기능 구현☆☆☆☆                               */
    // callback
    const changeInput = useCallback((e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    }, [input]);

    // date picker ref
    const datePickerRef = useRef(null);
    const lightpickRef = useRef(null);

    // Lightpick 인스턴스 초기화
    useEffect(() => {
        if (datePickerRef.current) {
            lightpickRef.current = new Lightpick({
                field: datePickerRef.current,
                singleDate: true, // 범위 선택 가능
                format: 'YYYY-MM-DD', // 날짜 표시 형식
                firstDay: 7, // 일요일부터 표시
                numberOfMonths: 2, // 표시할 월의 수
                numberOfColumns: 2, // 한 줄에 표시할 월의 수
                footer: true,
                minDate: moment().add(0, 'days'), // 내일부터 선택 가능
                onSelect: (start, end) => { // 끝 날짜(end)를 추가
                    if (start) {
                        setInput((prev) => ({
                            ...prev,
                            departureTime: start.format('YYYY-MM-DD') // 가는편 날짜 설정
                        }));
                    }
                }
            });
        }
        return () => {
            if (lightpickRef.current) {
                lightpickRef.current.destroy(); // 컴포넌트 언마운트 시 인스턴스 정리
            }
        };
    }, []);

    // 탑승일 클릭 시 날짜 선택기 표시
    const handleDateClick = () => {
        if (lightpickRef.current) {
            lightpickRef.current.show();
        }
    };

    // 다른 입력 필드 클릭 시 좌석 등급 설정 UI 숨기기
    const handleInputFocus = () => {
        setDepartureInputClick(false); // 출발지 입력창을 닫도록 상태 변경
        setDestinationInputClick(false);
    };

    /* ================== 자동완성 기능 구현 ================== */
    //state
    const [nationalList, setNationalList] = useState([
        { nationalNo: 1, nationalName: "서울/인천(ICN)" },
        { nationalNo: 2, nationalName: "서울/김포(GMP)" },
        { nationalNo: 3, nationalName: "광주(KWJ)" },
        { nationalNo: 4, nationalName: "대구(TAE)" },
        { nationalNo: 5, nationalName: "제주(CJU)" },
        { nationalNo: 6, nationalName: "여수(RSU)" },
        { nationalNo: 7, nationalName: "도쿄/나리타(NRT)" },
        { nationalNo: 8, nationalName: "오사카/간사이(KIX)" },
        { nationalNo: 9, nationalName: "나트랑(CXR)" }
    ]);

    //========================자동완성 기능 사용 시 백엔드와 연결하기 위한 코드================
    // //effect
    // useEffect(()=>{
    //     loadNationalList();
    // } , [])

    // //callback
    // const loadNationalList = useCallback(async()=>{
    //     const resp = await axios.get("/경로/");
    //     setNationalList(resp.data);
    // }, [setNationalList])

    const changeKeyword = useCallback((e) => {
        setKeyword(e.target.value);
        setOpen(e.target.value.length > 0);   // 입력값이 있을 때만 자동완성 리스트를 보여줌
        setSelectedIndex(-1); // 키워드가 변경되면 선택된 인덱스를 초기화
    }, []);

    const selectKeyword = useCallback((text) => {
        setKeyword(text); // 키워드를 상태로 유지
        setInput(prev => ({
            ...prev,
            departureAirport: text // 출발지 입력창에 반영
        }));
        setOpen(false); // 자동완성 리스트 닫기
    }, [setKeyword, setInput]);

    //memo
    const searchResult = useMemo(() => {
        if (keyword.length === 0) return [];  //키워드가 없으면 결과를 표시하지 않음

        //키워드가 있으면 이름을 비교해서 필터링
        return nationalList.filter(national => {
            if (hangul.search(national.nationalName, keyword) >= 0) {
                return true;
            }
            return false;
        });
    }, [keyword, nationalList]);

    // 키보드 이벤트 처리 함수
    const handleKeyDown = useCallback((e) => {
        if (!open) return;

        if (e.key === "ArrowDown") {
            // 아래 방향키를 누르면 인덱스를 증가
            setSelectedIndex((prevIndex) =>
                prevIndex < searchResult.length - 1 ? prevIndex + 1 : prevIndex
            );
        } else if (e.key === "ArrowUp") {
            // 위 방향키를 누르면 인덱스를 감소
            setSelectedIndex((prevIndex) =>
                prevIndex > 0 ? prevIndex - 1 : prevIndex
            );
        } else if (e.key === "Enter" && selectedIndex >= 0) {
            // Enter 키를 누르면 현재 선택된 항목을 선택
            selectKeyword(searchResult[selectedIndex].nationalName);
        }
    }, [open, selectedIndex, searchResult, selectKeyword]);


    // 최근 검색 기록에 대한 출발지와 도착지 값을 업데이트하는 함수
    const applySearchToInput = (departure, arrival) => {
        setInput(prev => ({
            ...prev,
            departureAirport: departure,
            arrivalAirport: arrival
        }));
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 환율 및 날씨에 대한 코드 정의
    const [exchangeRates, setExchangeRates] = useState({ jpy: null, vnd: null });
    const [currWeather, setCurrWeather] = useState(null);
    const [weekWeather, setWeekWeather] = useState({}); // 초기값을 빈 배열로 설정
    const [newLoading, setNewLoading] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState("krw");
    const [amount, setAmount] = useState(1); // 기본값 1

    // 환율 가져오기
    const getExchangeRates = useCallback(async (currency) => {
        if (!currency) return;

        const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${currency}.json`;
        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: undefined  // 이 요청에만 Authorization 헤더 제거
                }
            });
            const data = response.data;

            if (data[currency]) {
                setExchangeRates({
                    jpy: data[currency]['krw'],
                    vnd: data[currency]['krw'],
                });
            } else {
                console.error("환율 데이터가 없습니다.");
            }
        } catch (error) {
            console.error("환율 조회 중 오류 발생:", error);
        }
    }, []);

    const getWeatherData = useCallback(async (latitude, longitude) => {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Asia%2FSeoul&start_date=${moment().utcOffset(9).format('YYYY-MM-DD')}&end_date=${moment().utcOffset(9).add(7, 'days').format('YYYY-MM-DD')}`;

        try {
            const response = await axios.get(url);
            const data = response.data;
            console.log(data);
            if (data.current_weather) {
                setCurrWeather(data.current_weather);
            } else {
                console.error("현재 날씨 데이터가 없습니다.");
            }
            // 데이터 파싱 및 결합
            if (data.daily) {

                // weekWeather 상태 업데이트
                setWeekWeather(data.daily);
                console.log(weekWeather);
            } else {
                console.error("주간 날씨 데이터가 없습니다.");
            }
        } catch (error) {
            console.error("날씨 조회 중 오류 발생:", error);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([getExchangeRates()]);
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!selectedCountry) return;

        setNewLoading(true);

        const countryCoordinates = {
            jpy: { latitude: 35.6895, longitude: 139.6917 }, // 일본 도쿄
            vnd: { latitude: 21.0285, longitude: 105.8542 }, // 베트남 하노이
            krw: { latitude: 37.5665, longitude: 126.9780 }  // 한국 서울
        };

        const coordinates = countryCoordinates[selectedCountry];
        if (coordinates) {
            getWeatherData(coordinates.latitude, coordinates.longitude).finally(() => {
                setNewLoading(false);
            });
        }

        // 선택된 국가 통화로 환율 업데이트
        getExchangeRates(selectedCountry); // selectedCountry를 인자로 전달
    }, [selectedCountry, getWeatherData, getExchangeRates]);

    const CountryChange = (e) => {
        setSelectedCountry(e.target.value);
        setCurrWeather(null);
        setExchangeRates({}); // 환율 정보를 초기화
    };


    return (
        <>
            <header className="bg-dark">
                <div className="container">
                    {/* 가는편 오는편 기능 구현 */}
                    <div className="flight-all-div">   {/* 전체 기능에 대한 div */}
                        <div className="flight-search-check row mt-4 mb-4" style={{ marginLeft: "7rem" }}>    {/* 안쪽 여백을 위한 div(전체 기능을 감싸는) */}
                            <h3 className="text-white mb-4">항공권 조회를 한 번에!</h3>
                            <div className="col-sm-3">
                                <input
                                    type="text"
                                    name="departureAirport"
                                    className="form-control" style={{ height: "5em" }}
                                    placeholder="출발지"
                                    value={input.departureAirport}
                                    onChange={changeInput}
                                    onFocus={handleInputFocus} // 다른 입력 필드 클릭 시 숨기기
                                    onClick={DepartureClick}
                                    autoComplete="off"
                                    readOnly
                                />
                            </div>

                            <div className="col-sm-3">
                                <input
                                    type="text"
                                    name="arrivalAirport"
                                    className="form-control" style={{ height: "5em" }}
                                    placeholder="도착지"
                                    value={input.arrivalAirport}
                                    onChange={changeInput}
                                    onFocus={handleInputFocus} // 다른 입력 필드 클릭 시 숨기기
                                    onClick={destinationClick}
                                    autoComplete="off"
                                    readOnly></input>
                            </div>

                            <div className="col-sm-3">
                                <input
                                    type="text"
                                    name="departureTime"
                                    className="form-control" style={{ height: "5em" }}
                                    placeholder="출발일"
                                    value={input.departureTime}
                                    onClick={handleDateClick} // 클릭 시 날짜 선택기 표시
                                    onFocus={handleInputFocus} // 다른 입력 필드 클릭 시 숨기기
                                    ref={datePickerRef} // ref 추가
                                    readOnly
                                />
                            </div>

                            <div className="col-sm-3">
                                <button className="btn btn-primary" style={{ height: "5em" }}
                                    onClick={handleSearch}
                                    onFocus={handleInputFocus}><FaSearch /> 검색하기
                                </button>
                            </div>
                        </div>

                        <div className="row" style={{ width: "85%", marginLeft: "13%" }}>
                            {/*   ☆☆☆☆ 출발지 입력창 기능 구현 ☆☆☆☆ */}
                            {departureInputClick && ( // 출발지 입력창 클릭 시에만 보여주기
                                <>
                                    <div className="row mb-1 me-1" style={{ marginLeft: "-6.2%" }}>
                                        <div className="col">
                                            <div className="form-group" style={{ position: "relative" }}>
                                                <input type="text" className="form-control" placeholder="출발지를 검색하세요." value={keyword}
                                                    onChange={changeKeyword} onKeyUp={handleKeyDown} // 키보드 이벤트 핸들러 추가
                                                    style={{ width: "26%" }}
                                                />
                                                {/* {open === true && 화면} 왼쪽만 쓰겠다
                                            {open === true || 화면} 오르쪽만 쓰겠다 */}
                                                {open === true && (
                                                    <ul className="auto-search list-group" style={{ width: "26%" }}>
                                                        {/* 골라서 찍을 수 있도록 구현해야 함(자동완성이 동작할 수 있도록) */}
                                                        {searchResult.map((national, index) => (
                                                            <li key={national.nationalNo}
                                                                className={`list-group-item ${selectedIndex === index ? 'active' : ''}`} // 선택된 항목에 'active' 클래스 적용
                                                                onClick={e => selectKeyword(national.nationalName)}>
                                                                {national.nationalName}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 검색창 */}
                                    <div className="flight-select-div mt-2 me-3 mb-3 bg-white" style={{ marginLeft: "-4%" }}>
                                        <div className="d-flex ms-2 me-2" style={{ display: "flex", justifyContent: "space-between" }}>
                                            <h4 className="mt-3 ms-2" style={{ fontWeight: "bold" }}>출발지 선택</h4>
                                            <button className="btn btn-danger mt-3 me-2" onClick={CloseSetting}><IoClose /></button>
                                        </div>
                                        <div className="flights_list_national row mt-3 ms-1">
                                            <div className="nation col-2">
                                                <ul className="list-group nation-group-box">
                                                    <li className="nation-list">
                                                        <button type="button" className={getButtonClass(selectedDepNational, '한국')}
                                                            onClick={sendNationDep('한국', departureNationalClick)}>
                                                            <span>한국</span>
                                                        </button>
                                                    </li>
                                                    <li className="nation-box-list">
                                                        <button type="button" className={getButtonClass(selectedDepNational, '동북아시아')}
                                                            onClick={sendNationDep('동북아시아', departureNationalClick)}>
                                                            <span>동북아시아</span>
                                                        </button>
                                                    </li>
                                                    <li className="nation-box-list">
                                                        <button type="button" className={getButtonClass(selectedDepNational, '동남아시아')}
                                                            onClick={sendNationDep('동남아시아', departureNationalClick)}>
                                                            <span>동남아시아</span>
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="list_airport col-4" style={{ marginBottom: "1em" }}>
                                                <h5 style={{ fontWeight: "bold" }}>취항지</h5>
                                                <div className="national_list_box">
                                                    <ul className="list-group city_group-box">
                                                        {cities.map((city) => (
                                                            <li key={city} className="city_name_list">
                                                                <button type="button" className={getButtonClass(selectedDepCity, city)}
                                                                    onClick={sendNationDep(city, handleCityClick)}>
                                                                    <span>{city}</span>
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                            {/* 최근 검색 목록에 대한 코드 */}
                                            <div className="col-4 ms-5">
                                                <h5 style={{ fontWeight: "bold" }}>최근 검색 목록(최대5개)</h5>
                                                <div className="row flight-add-text">
                                                    {recentSearches.length > 0 ? (
                                                        recentSearches.map((search, index) => (
                                                            <div key={index}>
                                                                <div className="row mt-2" style={{ border: "1px solid lightGray", width: "100%", borderRadius: "0.5em", fontSize: "15px" }}>
                                                                    <span style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                                                                        onClick={() => applySearchToInput(search.departureAirport, search.arrivalAirport)}>
                                                                        {search.departureAirport} → {search.arrivalAirport}
                                                                        <IoMdClose style={{ marginLeft: "auto", cursor: "pointer" }} onClick={() => recentSearchesDelete(index)} />
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span>최근 검색 기록이 없습니다.</span>
                                                    )}
                                                </div>
                                                <div className="row" style={{ width: "100%" }}>
                                                    <button className="btn btn-success mt-3" onClick={handleNextClick}>다음</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/*    ☆☆☆☆ 도착지 입력창 기능 구현 ☆☆☆☆   */}
                            {destinationInputClick && ( // 도착지 입력창 클릭 시에만 보여주기
                                <>
                                    {/* 검색창 기능 */}
                                    <div className="flight-select-div mt-2 mb-3 bg-white" style={{ marginLeft: "-3.9%" }}>
                                        <div className="d-flex ms-3 me-2" style={{ display: "flex", justifyContent: "space-between" }}>
                                            <h4 className="mt-3 ms-2" style={{ fontWeight: "bold" }}>도착지 선택</h4>
                                            <button className="btn btn-danger mt-3 me-2" onClick={CloseSetting}><IoClose /></button>
                                        </div>
                                        <div className="flights_list_national row mt-3 ms-1">
                                            <div className="nation col-2">
                                                <ul className="list-group nation-group-box">
                                                    <li className="nation-list">
                                                        <button type="button" className={getButtonClass(selectedDesNational, '한국')}
                                                            onClick={sendNationalDes('한국', destinationNationalClick)}>
                                                            <span>한국</span>
                                                        </button>
                                                    </li>
                                                    <li className="nation-box-list">
                                                        <button type="button" className={getButtonClass(selectedDesNational, '동북아시아')}
                                                            onClick={sendNationalDes('동북아시아', destinationNationalClick)}>
                                                            <span>동북아시아</span>
                                                        </button>
                                                    </li>
                                                    <li className="nation-box-list">
                                                        <button type="button" className={getButtonClass(selectedDesNational, '동남아시아')}
                                                            onClick={sendNationalDes('동남아시아', destinationNationalClick)}>
                                                            <span>동남아시아</span>
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="list_airport col-4" style={{ marginBottom: "1em" }}>
                                                <h6 style={{ fontWeight: "bold" }}>취항지</h6>
                                                <div className="national_list_box">
                                                    <ul className="list-group city_group-box">
                                                        {destinationCities.map((cityDes) => (
                                                            <li key={cityDes} className="city_name_list">
                                                                <button type="button" className={getButtonClass(selectedDesCity, cityDes)}
                                                                    onClick={sendNationalDes(cityDes, destinationCity)}>
                                                                    <span>{cityDes}</span>
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                            {/* 최근 검색 목록에 대한 코드 */}
                                            <div className="col-4 ms-5">
                                                <h5 style={{ fontWeight: "bold" }}>최근 검색 목록(최대 5개)</h5>
                                                <div className="row flight-add-text">
                                                    {recentSearches.length > 0 ? (
                                                        recentSearches.map((search, index) => (
                                                            <div key={index}>
                                                                <div className="row mt-2" style={{ border: "1px solid lightGray", width: "100%", borderRadius: "0.5em", fontSize: "15px" }}>
                                                                    <span style={{ display: "flex", alignItems: "center" }}
                                                                            onClick={() => applySearchToInput(search.departureAirport, search.arrivalAirport)}>
                                                                        {search.departureAirport} → {search.arrivalAirport}
                                                                        <IoMdClose style={{ marginLeft: "auto", cursor: "pointer" }} onClick={() => recentSearchesDelete(index)} />
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span>최근 검색 기록이 없습니다.</span>
                                                    )}
                                                </div>
                                                <div className="row" style={{ width: "100%" }}>
                                                    <button className="btn btn-success mt-3" onClick={handleArrivalNextClick}>다음</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Marketing messaging and featurettes
            ================================================== */}
            <div className="container">
                <div className="container marketing">
                    {/* 날씨 및 환율 정보창 */}
                    <div className="row">
                        <div className="col-md-4">
                            <div className="card border-0 mb-4 shadow-sm">
                                <div className="card-body bg-light rounded-3">
                                    <h5 className="card-title">나라 선택</h5>
                                    <select
                                        className="form-select"
                                        value={selectedCountry || "krw"}
                                        onChange={CountryChange}
                                    >
                                        <option value="" disabled>나라를 선택하세요</option> {/* 기본 안내 메시지 */}
                                        <option value="krw">KRW - 한국</option>
                                        <option value="jpy">JPY - 일본</option>
                                        <option value="vnd">VND - 베트남</option>
                                    </select>
                                </div>
                            </div>

                            <div className="card border-0 mb-4 shadow-sm">
                                <div className="card-body bg-light rounded-3">
                                    <h5 className="card-title">환율 정보</h5>
                                    {selectedCountry === 'krw' ? (
                                        <input
                                            type="number"
                                            value={amount === 0 ? '' : amount} // 0일 때 빈 문자열로 설정
                                            className="form-control"
                                            disabled // disabled 속성 추가
                                        />
                                    ) : (
                                        <input
                                            type="number"
                                            value={amount === 0 ? '' : amount}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setAmount(value === '' ? '' : Number(value));
                                            }}
                                            className="form-control"
                                        />
                                    )}
                                    <small className="form-text text-muted">
                                        {selectedCountry === 'jpy' && exchangeRates.jpy ? (
                                            `1 JPY = ${exchangeRates.jpy.toFixed(3)} 원`
                                        ) : selectedCountry === 'vnd' && exchangeRates.vnd ? (
                                            `1 VND = ${exchangeRates.vnd.toFixed(3)} 원`
                                        ) : selectedCountry === 'krw' ? (
                                            null // No output for KRW
                                        ) : (
                                            "환율을 가져오는 중입니다..."
                                        )}
                                    </small>
                                    {selectedCountry === 'jpy' && exchangeRates.jpy && (
                                        <div
                                            className="form-control mt-2"
                                            style={{ backgroundColor: "#e9ecef" }}
                                        >
                                            {`${amount.toLocaleString()} JPY는 ${(amount * exchangeRates.jpy.toFixed(3)).toLocaleString()} 원 입니다.`}
                                        </div>
                                    )}
                                    {selectedCountry === 'vnd' && exchangeRates.vnd && (
                                        <div
                                            className="form-control mt-2"
                                            style={{ backgroundColor: "#e9ecef" }}
                                        >
                                            {`${amount.toLocaleString()} VND는 ${(amount * exchangeRates.vnd.toFixed(3)).toLocaleString()} 원 입니다.`}
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        <div className="col-md-8">
                            <div className="card border-0 mb-4 shadow-sm">
                                <div className="card-body bg-light rounded-3">
                                    <h5 className="card-title">날씨 정보</h5>

                                    {/* 주간 날씨 예보 칼럼 */}
                                    <h6 className="card-subtitle mb-2">주간 날씨 예보</h6>
                                    {weekWeather && weekWeather.time && weekWeather.time.length > 0 ? (
                                        <div className="row">
                                            {weekWeather.time.map((date, index) => {
                                                return (
                                                    <div key={index} className="col-3 mb-3"> {/* 모바일에서 1열, 중간 크기에서 2열 */}
                                                        <div className="card border-light shadow-sm">
                                                            <div className="card-body rounded-3">
                                                                <h6 className="card-title">{moment(date).format('D일 (dd)')}</h6>
                                                                <p className="card-text">
                                                                    <span className="text-primary"> {weekWeather.temperature_2m_min[index]}°C </span>/
                                                                    <span className="text-danger"> {weekWeather.temperature_2m_max[index]}°C</span>
                                                                    <img
                                                                        src={wmoCode(weekWeather.weathercode[index]).icon}
                                                                        alt={wmoCode(weekWeather.weathercode[index]).description}
                                                                        style={{ width: '30px', height: '30px' }}
                                                                    />
                                                                </p>

                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p>주간 날씨 데이터가 없습니다.</p>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                    {/* 날씨 및 환율 정보창 끝라인 */}

                    <div className="row">
                        <div className="col">
                            <h3 className="mb-3">✈TopGun에서 추천하는 여행지
                            </h3>
                        </div>
                    </div>
                    <div id="travelCarousel" className="carousel slide" data-bs-ride="carousel">
                        <div className="carousel-inner">
                            <div className="carousel-item active" data-bs-interval="6000">
                                <div className="row">
                                    <div className="col">
                                        <img
                                            className="img-fluid" // 이미지가 화면에 꽉 차도록 설정
                                            src="/image/도쿄후지산.jpg"
                                            alt="도쿄"
                                            style={{ objectFit: "cover", width: "100%", height: "400px" }} // 이미지를 꽉 차게, 비율 유지하면서 잘라냄
                                        />
                                        <h2 className="fw-normal mt-3">도쿄</h2>
                                        <span className="mb-0">
                                            다채로운 모습을 가진 도쿄.
                                            넓은 면적만큼이나 매력적인 지역들이 여행자를 기다린다. <br />
                                            어느 곳을 가더라도 멋진 시간을 선물하는 도쿄를 추천합니다.
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* 두 번째 여행지 */}
                            <div className="carousel-item" data-bs-interval="6000">
                                <div className="row">
                                    <div className="col">
                                        <img
                                            className="img-fluid"
                                            src="/image/제주도.jpg"
                                            alt="제주도"
                                            style={{ objectFit: "cover", width: "100%", height: "400px" }}
                                        />
                                        <h2 className="fw-normal mt-3">제주도</h2>
                                        <span className="mb-0">
                                            서울에서 비행기로 1시간 거리에 있는 한국에서 가장 큰 섬인 제주도.<br/>
                                            특산물로 만든 다양한 먹거리와 4계절의 모습이 아름다운 제주도를 추천합니다.
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* 세 번째 여행지 */}
                            <div className="carousel-item" data-bs-interval="6000">
                                <div className="row">
                                    <div className="col">
                                        <img
                                            className="img-fluid"
                                            src="/image/나트랑.webp"
                                            alt="나트랑"
                                            style={{ objectFit: "cover", width: "100%", height: "400px" }}
                                        />
                                        <h2 className="fw-normal mt-3">나트랑</h2>
                                        <span>
                                            맑고 푸른 바다와 황금빛 모래가 만나는 곳, 나트랑. <br />
                                            이 해안 도시는 휴식과 모험을 모두 즐길 수 있는 이상적인 나트랑을 추천합니다.<br />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button className="carousel-control-prev" type="button" data-bs-target="#travelCarousel" data-bs-slide="prev">
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="visually-hidden"></span>
                        </button>
                        <button className="carousel-control-next" type="button" data-bs-target="#travelCarousel" data-bs-slide="next">
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="visually-hidden"></span>
                        </button>
                    </div>

                </div>
            </div>
            {/* /.container */}
        </>
    );
};

export default MainPage;