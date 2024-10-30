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
import { FaStar } from "react-icons/fa";

const MainPage = () => {
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
            const {departureAirport, arrivalAirport, departureTime} = input;
            // navigate를 사용하여 쿼리 파라미터를 설정합니다.
            navigate(`/flight/bookingList?departureAirport=${departureAirport}&arrivalAirport=${arrivalAirport}&departureTime=${departureTime}`);
        };

      /*======================   복합검색을 위한 기능    =============================*/
      const [result , setResult] = useState({
        count : 0,
        last : true,
        flightList : []
    });

    //페이징 관련 state
    const [page , setPage] = useState(null);
    const [size , setSize] = useState(10);

    // [2] effect로 계산 (권장하는 방법)
    useEffect(()=> {
        setInput({
            ...input,
            beginRow : page * size - (size-1),
            endRow : page * size
        })
    } , [page,size]);

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
        const changeInputString = useCallback(e=>{
            setInput({
                ...input, 
                [e.target.name] : e.target.value
            });
        }, [input]);
        
        const ChangeInputNumber = useCallback((e)=>{
            setInput({
                ...input, 
                [e.target.name] : parseInt(e.target.value) || ""
            });
        } , [input]);

        const changeInputArray = useCallback(e=>{
            //console.log(e.target.name, e.target.value, e.target.checked);
            const origin = input[e.target.name];//input의 항목을 하나 꺼낸다
    
            if(e.target.checked === true) {//추가
                setInput({
                    ...input,
                    [e.target.name] : origin.concat(e.target.value)
                });
            }
            else {//삭제
                setInput({
                    ...input,
                    [e.target.name] : origin.filter(level=>level !== e.target.value)
                });
            }
        }, [input]);

        //첫 목록을 불러올 때 사용
        const sendRequest = useCallback(async ()=>{
            loading.current = true; //시작지점
            const resp = await axios.post("http://localhost:8080/flight/complexSearch", input);
            // console.log(resp.data);

            setResult(resp.data);
            loading.current = false;    //종료지점
        }, [input]);

        const setFirstPage = useCallback(()=>{
            setPage(prev=>null);
            setTimeout(()=>{
                setPage(prev=>1);
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
            return window.alert("출발지를 입력해주세요.");
        }
        else if (input.arrivalAirport.length === 0) {
            return window.alert("도착지를 입력해주세요.");
        }
        else if (input.departureTime.length === 0) {
            return window.alert("출발일자를 입력해주세요.");
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
        setShowPassengerSettings(false);    //인원수 입력창을 닫도록 상태 변경
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


    /*                         ☆☆☆☆ 도착지에 대한 기능 state ☆☆☆☆                             */
    const [destinationInputClick, setDestinationInputClick] = useState(false); // 도착지 입력창 표시 여부
    const [selectedDesNational, setSelectedDesNational] = useState(null) //초기값은 null로 설정. 선택된 국가가 없음
    const [selectedDesCity, setSelectedDesCity] = useState(null);     //초기값은 null로 설정. 선택된 도시가 없음
    const [destinationCities, setDestinationCities] = useState([]); // 동적으로 표시할 도시 목록

    // 도착지 input 클릭 시 출발지 기능을 표시하는 함수
    const destinationClick = () => {
        if (input.departureAirport.length === 0) {
            window.alert("출발지를 입력해주세요.");
            
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


    /*                         ☆☆☆☆가는편/오는편 , 좌석에 대한 기능 구현☆☆☆☆                               */
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

    // 탑승객 및 좌석 등급 설정 UI 표시 여부
    const [showPassengerSettings, setShowPassengerSettings] = useState(false);

    // 탑승객 및 좌석 등급 클릭 시 UI 보여주기
    const showPassengerClick = () => {
        setShowPassengerSettings(!showPassengerSettings);
    };

    // 다른 입력 필드 클릭 시 좌석 등급 설정 UI 숨기기
    const handleInputFocus = () => {
        setShowPassengerSettings(false);
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


    // //effect
    // useEffect(()=>{
    //     loadNationalList();
    // } , [])

    // //callback
    // const loadNationalList = useCallback(async()=>{
    //     const resp = await axios.get("/경로/");
    //     setNationalList(resp.data);
    // }, [setNationalList])



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
    return (
        <>
        <div className="container">
            {/* 가는편 오는편 기능 구현 */}
            <div className="flight-all-div mt-3">   {/* 전체 기능에 대한 div */}
                <div className="flight-search-check row mt-4 mb-4 ms-3">    {/* 안쪽 여백을 위한 div(전체 기능을 감싸는) */}
                    {/* <h5>항공권 조회 구현중..</h5> */}
                        <div className="col-sm-3">
                            <input
                                type="text"
                                name="departureAirport"
                                className="form-control"
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
                                className="form-control"
                                placeholder="도착지"
                                value={input.arrivalAirport} 
                                onChange={changeInput}
                                onFocus={handleInputFocus} // 다른 입력 필드 클릭 시 숨기기
                                onClick={destinationClick}
                                autoComplete="off"
                                readOnly
                            />
                        </div>

                        <div className="col-sm-3">
                            <input
                                type="text"
                                name="departureTime"
                                className="form-control"
                                placeholder="출발일"
                                alue={input.departureTime} 
                                onClick={handleDateClick} // 클릭 시 날짜 선택기 표시
                                onFocus={handleInputFocus} // 다른 입력 필드 클릭 시 숨기기
                                ref={datePickerRef} // ref 추가
                                readOnly
                            />
                        </div>

                        <div className="col-sm-3">
                            <button className="btn btn-primary" onClick={handleSearch}><FaSearch /> 항공권 검색</button>
                        </div>
                    </div>

                    {/*   ☆☆☆☆ 출발지 입력창 기능 구현 ☆☆☆☆ */}
                    {departureInputClick && ( // 출발지 입력창 클릭 시에만 보여주기
                        <>
                            <div className="row mt-3 mb-1 ms-1 me-1">
                                <div className="col">
                                    <div className="form-group" style={{ position: "relative" }}>
                                        <input type="text" className="form-control" placeholder="출발지를 검색하세요." value={keyword}
                                            onChange={changeKeyword} onKeyUp={handleKeyDown} // 키보드 이벤트 핸들러 추가
                                            style={{width:"100%"}}
                                        />
                                        {/* {open === true && 화면} 왼쪽만 쓰겠다
                                            {open === true || 화면} 오르쪽만 쓰겠다 */}
                                        {open === true && (
                                            <ul className="auto-search list-group">
                                                {/* 골라서 찍을 수 있도록 구현해야 함(자동완성이 동작할 수 있도록) */}
                                                {searchResult.map((national, index) => (
                                                    <li key={national.nationalNo}
                                                        className={`list-group-item ${selectedIndex === index ? 'active' : ''}`} // 선택된 항목에 'active' 클래스 적용
                                                        onClick={e => selectKeyword(national.nationalName)}>
                                                        {national.nationalName}
                                                        {/* <span className="text-muted ms-1">({poketmon.poketmonType})</span> */}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 검색창 */}
                            <div className="flight-select-div mt-2 ms-3 me-3 mb-3">   
                                <div className="d-flex ms-2 me-2" style={{ display: "flex", justifyContent: "space-between"}}>
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
                                    <div className="col-3">
                                        <h5 style={{ fontWeight: "bold" }}>최근 검색 목록</h5>
                                        <button className="btn btn-success" onClick={handleNextClick}>다음</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/*    ☆☆☆☆ 도착지 입력창 기능 구현 ☆☆☆☆   */}
                    {destinationInputClick && ( // 도착지 입력창 클릭 시에만 보여주기
                        // 검색창 기능
                        <div className="flight-select-div mt-2 ms-3 me-3">
                            <div className="d-flex ms-3 me-2" style={{ display: "flex", justifyContent: "space-between" }}>
                                <h4 className="mt-3" style={{ fontWeight: "bold" }}>도착지 선택</h4>
                                <button className="btn btn-danger mt-3" onClick={CloseSetting}><IoClose /></button>
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
                                <div className="col-3">
                                    <h5 style={{ fontWeight: "bold" }}>최근 검색 목록</h5>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                

            {/* Marketing messaging and featurettes
  ================================================== */}
            <div className="container marketing">
                <div className="row">
                    <div className="col">
                        <h3 className="mb-3"> <FaStar className="mb-2 me-2"/>TopGun에서 추천하는 여행지<FaStar className="mb-2 ms-2"/>
                        </h3>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-4">
                        <img
                            className="bd-placeholder-img rounded-circle"
                            width={200}
                            height={200}
                            src="https://i.ibb.co/09T9VTT/image.jpg"                            
                        />
                            <title>Placeholder</title>
                            <rect width="100%" height="100%" fill="var(--bs-secondary-color)" />                       
                        <h2 className="fw-normal mt-3">도쿄</h2>
                        <p className="mb-0">
                            다채로운 모습을 가진 도쿄 <br/>                   
                            넓은 면적만큼이나 매력적인 지역들이 <br/> 
                            여행자를 기다린다. <br/>                   
                            어느 곳을 가더라도 멋진 시간을 선물하는 <br/> 
                            도쿄를 추천합니다.
                        </p>
                    </div>
                    {/* /.col-lg-4 */}
                    <div className="col-lg-4">
                    <img
                            className="bd-placeholder-img rounded-circle"
                            width={200}
                            height={200}
                            src="https://i.ibb.co/qYVfVxq/image.jpg"                            
                        />
                            <title>Placeholder</title>
                            <rect width="100%" height="100%" fill="var(--bs-secondary-color)" />
                        <h2 className="fw-normal mt-3">제주도</h2>
                        <p>
                            서울에서 비행기로 1시간 거리에 있는 <br/> 
                            한국에서 가장 큰 섬인 제주도 <br/>
                            4계절 각각의 모습이 너무나 아름다운 섬입니다.<br/>
                            특산물과 특산물로 만든 먹거리도 다양한 <br/>
                            제주도를 추천합니다.
                        </p>
                    </div>
                    {/* /.col-lg-4 */}
                    <div className="col-lg-4">
                    <img
                            className="bd-placeholder-img rounded-circle"
                            width={200}
                            height={200}
                            src="https://i.ibb.co/7NtShdX/image.webp"                            
                        />
                            <title>Placeholder</title>
                            <rect width="100%" height="100%" fill="var(--bs-secondary-color)" />
                        <h2 className="fw-normal mt-3">나트랑</h2>
                        <p>
                            맑고 푸른 바다와 <br/>
                            황금빛 모래가 만나는 곳, 나트랑 <br/>
                            이 해안 도시는 휴식과 모험을 모두 즐길 수 있는 <br/>
                            이상적인 장소입니다.<br/>
                            현지 음식을 맛보며, 다양한 수상 활동을 즐길 수 있는 나트랑을 추천합니다.
                        </p>
                    </div>
                    {/* /.col-lg-4 */}
                </div>
                {/* /.row */}


                {/* START THE FEATURETTES */}
                <hr className="featurette-divider" />
                <div className="row featurette">
                    <div className="col-md-7">
                        <h2 className="featurette-heading fw-normal lh-1">
                            First featurette heading.{" "}
                            <span className="text-body-secondary">It’ll blow your mind.</span>
                        </h2>
                        <p className="lead">
                            Some great placeholder content for the first featurette here.
                            Imagine some exciting prose here.
                        </p>
                    </div>
                    <div className="col-md-5">
                        <svg
                            className="bd-placeholder-img bd-placeholder-img-lg featurette-image img-fluid mx-auto"
                            width={500}
                            height={500}
                            xmlns="http://www.w3.org/2000/svg"
                            role="img"
                            aria-label="Placeholder: 500x500"
                            preserveAspectRatio="xMidYMid slice"
                            focusable="false"
                        >
                            <title>Placeholder</title>
                            <rect width="100%" height="100%" fill="var(--bs-secondary-bg)" />
                            <text x="50%" y="50%" fill="var(--bs-secondary-color)" dy=".3em">
                                500x500
                            </text>
                        </svg>
                    </div>
                </div>
                <hr className="featurette-divider" />
                <div className="row featurette">
                    <div className="col-md-7 order-md-2">
                        <h2 className="featurette-heading fw-normal lh-1">
                            Oh yeah, it’s that good.{" "}
                            <span className="text-body-secondary">See for yourself.</span>
                        </h2>
                        <p className="lead">
                            Another featurette? Of course. More placeholder content here to give
                            you an idea of how this layout would work with some actual
                            real-world content in place.
                        </p>
                    </div>
                    <div className="col-md-5 order-md-1">
                        <svg
                            className="bd-placeholder-img bd-placeholder-img-lg featurette-image img-fluid mx-auto"
                            width={500}
                            height={500}
                            xmlns="http://www.w3.org/2000/svg"
                            role="img"
                            aria-label="Placeholder: 500x500"
                            preserveAspectRatio="xMidYMid slice"
                            focusable="false"
                        >
                            <title>Placeholder</title>
                            <rect width="100%" height="100%" fill="var(--bs-secondary-bg)" />
                            <text x="50%" y="50%" fill="var(--bs-secondary-color)" dy=".3em">
                                500x500
                            </text>
                        </svg>
                    </div>
                </div>
                <hr className="featurette-divider" />
                <div className="row featurette">
                    <div className="col-md-7">
                        <h2 className="featurette-heading fw-normal lh-1">
                            And lastly, this one.{" "}
                            <span className="text-body-secondary">Checkmate.</span>
                        </h2>
                        <p className="lead">
                            And yes, this is the last block of representative placeholder
                            content. Again, not really intended to be actually read, simply here
                            to give you a better view of what this would look like with some
                            actual content. Your content.
                        </p>
                    </div>
                    <div className="col-md-5">
                        <svg
                            className="bd-placeholder-img bd-placeholder-img-lg featurette-image img-fluid mx-auto"
                            width={500}
                            height={500}
                            xmlns="http://www.w3.org/2000/svg"
                            role="img"
                            aria-label="Placeholder: 500x500"
                            preserveAspectRatio="xMidYMid slice"
                            focusable="false"
                        >
                            <title>Placeholder</title>
                            <rect width="100%" height="100%" fill="var(--bs-secondary-bg)" />
                            <text x="50%" y="50%" fill="var(--bs-secondary-color)" dy=".3em">
                                500x500
                            </text>
                        </svg>
                    </div>
                </div>
                <hr className="featurette-divider" />
                {/* /END THE FEATURETTES */}

            </div>
            </div>
            {/* /.container */}
        </>

    );
};

export default MainPage;
