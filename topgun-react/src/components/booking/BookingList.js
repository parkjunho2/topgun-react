import './BookingList.css';
import { GiCommercialAirplane } from "react-icons/gi";
import { useNavigate } from 'react-router';
import { FaPlus } from "react-icons/fa";
import { FaMinus } from "react-icons/fa";
import Lightpick from 'lightpick';
import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { IoClose } from "react-icons/io5";
import * as hangul from 'hangul-js';
import { useRecoilValue } from 'recoil';
import { userState } from '../../util/recoil';
import { throttle } from 'lodash';

const BookingList = () => {
    //const [flightList , setflightList] = useState([]);
    const [flightList , setFlightList] = useState([]);
    const [flightComplexList , setFlightComplexList] = useState([]);

    const [isSmallScreen, setIsSmallScreen] = useState(false);

    const [keyword, setKeyword] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1); // 선택된 항목의 인덱스

    //navigate
    const navigate = useNavigate();
    const [departureTime, setDepartureTime] = useState(12); // 출발 시간 초기 값 (시간.분 형태)
    const [departureRightTime, setDepartureRightTime] = useState(12); // 출발 시간 초기 값 (시간.분 형태)

    const [returnTime, setReturnTime] = useState(23.5); // 오는 편 시간 초기 값 (오후 11시 30분)
    const [returnRightTime, setReturnRightTime] = useState(23.5); // 오는 편 시간 초기 값 (오후 11시 30분)

    // 시간 포맷팅 함수 (24시간 -> 12시간 AM/PM, 분 포함)
    const formatTime = (time) => {
        const hour = Math.floor(time); // 정수부: 시간
        const minute = (time % 1) === 0.5 ? 30 : 0; // 소수부 0.5는 30분
        const hourIn12 = hour % 12 || 12;
        const ampm = hour >= 12 ? '오후' : '오전';
        return `${ampm} ${hourIn12}:${minute === 0 ? '00' : '30'}`;
    };

    const accessToken = axios.defaults.headers.common["Authorization"];
    const refreshToken = window.localStorage.getItem("refreshToken")
        || window.sessionStorage.getItem("refreshToken");

    const user = useRecoilValue(userState);

    //페이지 갱신 후 한번만 실행
    useEffect(()=>{
        loadFlightList();
    },[]);

    const loadFlightList = useCallback(async()=>{
        const resp = await axios.get("http://localhost:8080/flight/");
        setFlightList(resp.data);
        // console.log(resp.data);
    },[flightList]);

    const createRoom = useCallback(async(target)=>{
        window.alert("문의하시겠습니까?");
        const resp = await axios.post("http://localhost:8080/room/createAndEnter",
            {roomName : target.airlineDto.airlineName},
            {params : {userId : target.userId}})
            const newRoomNo = resp.data.roomNo;
            navigate("/chat/"+newRoomNo);
    });



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

    // state
    const [input, setInput] = useState({
        departure: '',
        destination: '',
        boardingDate: '',
        // departureDate: "",
        passengers: ''
    });


    useEffect(()=>{
        complexSearch();
    } , []);

    //하히
    const complexSearch = useCallback(async () => {
        const requestData = {
            departureAirport: "서울/인천(ICN)",
            arrivalAirport: "광주(KWJ)",
            departureTime: "2024-10-25", // 유효한 날짜 형식으로 입력
            passengers: 1,
            orderList: []
        };
    
        try {
            const resp = await axios.post("http://localhost:8080/flight/complexSearch", requestData);
            setFlightList(resp.data.flightList);
            // console.log(resp.data);
        } catch (error) {
            console.error("Error fetching flight data:", error);
        }
    }, [flightList]);

    //조회 버튼에 대한 navigate 구현
    const checkInputEmpty = useCallback(() => {
        // e.preventDefault();
        if (input.departure.length === 0) {
            return window.alert("출발지를 입력해주세요.");
        }
        else if (input.destination.length === 0) {
            return window.alert("도착지를 입력해주세요.");
        }
        else if (input.boardingDate.length === 0) {
            return window.alert("출발일자를 입력해주세요.");
        }
        // else if (input.departureDate.length === 0) {
        //     return window.alert("도착일자를 입력해주세요.");
        // }
        else if (adultNum === 0 && childNum === 0 && babyNum === 0) {
            return window.alert("인원을 입력해주세요.");
        }
        else {
            navigate("/flight/bookingList");   //위의 항목들이 모두 pass라면 이동
        }
    }, [input]);

    // 인원수에 대한 state
    const [adultNum, setAdultNum] = useState(0);       // 성인
    const [childNum, setChildNum] = useState(0);      // 소아
    const [babyNum, setBabyNum] = useState(0);     // 유아
    const [selectedSeatClass, setSelectedSeatClass] = useState(''); // 좌석 등급

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
        return selectedDepCity ? selectedDepCity : input.departure;     // selectedDepCity가 있으면 해당 도시를 반환, 없으면 기존 input.departure 값을 유지
    }, [keyword, selectedDepCity, input.departure]);

    // 출발지 상태 변경 처리
    useEffect(() => {
        setInput((prev) => ({
            ...prev,
            departure: selectedDepCity ? selectedDepCity : prev.departure // 선택된 도시가 있으면 해당 도시로 설정
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
            departure: selectedDepCity // 선택된 도시로 설정
        }));
    } else if (keyword) {
        setInput(prev => ({
            ...prev,
            departure: keyword // 키워드로 설정
        }));
    }
    
    setOpen(false); // 자동완성 리스트 닫기

    // 도착지 입력창으로 포커스 이동
    setTimeout(() => {
        const destinationInput = document.querySelector('input[name="destination"]');
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
        if (input.departure.length === 0) {
            window.alert("출발지를 입력해주세요.");
            
            // 도착지 입력창의 포커스를 해제합니다.
            const destinationInput = document.querySelector('input[name="destination"]');
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
        // selectedDesCity가 있으면 해당 도시를 반환, 없으면 기존 input.destination 값을 유지
        return selectedDesCity ? selectedDesCity : input.destination;
    }, [selectedDesCity, input.destination]);

    // 도착지 상태 변경 처리
    useEffect(() => {
        setInput((prev) => ({
            ...prev,
            destination: destinationText // 선택된 도착지를 도착지 입력창에 설정
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
    // 공통 감소 함수
    const decreaseCount = (type) => {
        if (type === 'adult' && adultNum > 0) {
            setAdultNum(adultNum - 1);
        } else if (type === 'child' && childNum > 0) {
            setChildNum(childNum - 1);
        } else if (type === 'baby' && babyNum > 0) {
            setBabyNum(babyNum - 1);
        }
    };

    // 공통 증가 함수(총 인원은 9명으로 제한)
    const increaseCount = (type) => {
        const totalCountNum = adultNum + childNum + babyNum;
        if (type === 'adult' && totalCountNum < 9) {
            setAdultNum(adultNum + 1);
        } else if (type === 'child' && totalCountNum < 9) {
            setChildNum(childNum + 1);
        } else if (type === 'baby' && adultNum > babyNum && totalCountNum < 9) {
            setBabyNum(babyNum + 1);
        }
    };

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
                            boardingDate: start.format('YYYY-MM-DD') // 가는편 날짜 설정
                        }));
                    }
                    // if (end) {
                    //     setInput((prev) => ({
                    //         ...prev,
                    //         departureDate: end.format('YYYY-MM-DD') // 오는편 날짜 설정
                    //     }));
                    // }
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

    // 탑승객 문자열을 useMemo로 계산
    const passengerText = useMemo(() => {
        const text = `성인${adultNum}, 소아${childNum}, 유아${babyNum} `;
        // 만약 텍스트가 설정값을 넘으면 ... 처리 (필요에 따라 길이 조정 필요)
        const maxLength = 15; // 최대 길이 설정
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    }, [adultNum, childNum, babyNum]); // adultNum, childNum, babyNum가 변경될 때마다 재계산

    // useEffect를 사용하여 passengers 상태를 업데이트
    useEffect(() => {
        setInput((prev) => ({
            ...prev,
            passengers: passengerText // passengers 필드를 새로 업데이트
        }));
    }, [passengerText]); // passengerText가 변경될 때마다 업데이트


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

    //자동완성 기능 사용 시 백엔드와 연결하기 위한 코드
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
            departure: text // 출발지 입력창에 반영
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




    //================================더보기를 위한 기능 구현=========================================

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

    useEffect(()=>{
        if(page === null) return;   //초기상태 page 값이 null이라면 아무것도 동작 X

       console.log("beginRow , endRow 변경 : " , input.beginRow , input.endRow);
       if(page === 1  ) {
            sendRequest();
       }
       if(page >= 2) {
           sendMoreRequest();
       }
    } , [input.beginRow , input.endRow]);

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
            const resp = await axios.post("/flight/bookingList", input);
            // console.log(resp.data);

            setResult(resp.data);
            loading.current = false;    //종료지점
        }, [input]);

        //더보기 버튼을 눌렀을 때 사용
        const sendMoreRequest = useCallback(async ()=>{
            loading.current = true; //시작지점
            const resp = await axios.post("/flight/bookingList", input);
            // console.log(resp.data);
            //setResult(resp.data);     //덮어쓰기라 안됨
            setResult({
                ...result,
                last : resp.data.last,      //서버에서 준 응답 데이터에 있는 last로 갱신
                //flightList : result.flightList.concat(resp.data.flightList),    //concat 사용
                flightList : [...result.flightList , ...resp.data.flightList]   //전개연산자 사용
            });
            loading.current = false;    //종료지점
        }, [input.beginRow , input.endRow]);

        // 지금까지의 구조가 만족스럽지만 1%의 아쉬움이 있다.
        // effect는 같은 값으로 변경될 때 인지하지 못한다.
        // 어떤 항목을 연속적으로 검색하면 계속 1페이지여서 반영이 안된다.
        // 시간차를 두고 1--->1이 아니라 1===null--->
        // JS의 setTimeout(함수 , 시간)을 이용하여 약간의 시간차를 부여

        const setFirstPage = useCallback(()=>{

            //아래 명령은 어느게 먼저 실행된다고 장담할 수 없다(비동기)
            //setPage(null);
            //setPage(1);
    
            //useState에서 제공하는 set 메소드에 동기로 처리할 수 있는 코드가 존재
            //setPage(prev=>?);
            setPage(prev=>null);
            setTimeout(()=>{
                setPage(prev=>1);
            }, 1);//이 코드는 1ms 뒤에 실행해라!
            
        }, [page]);

        //스크롤 관련된 처리
        // - useEffect(함수) - 화면이 변경될 때마다 실행됨
        // - useEffect에서 함수를 반환하면 화면이 사라질 때 실행할 작업 지정 가능
        useEffect(()=>{
            if(page === null) return;   //결과를 검색하지 않았을 때
            if(result.last === true) return;    //결과를 더이상 볼게 없을 때

            //resize에 사용할 함수
            const resizeHandler = throttle(()=>{
                console.log("% : " , getScrollPercent()); //현재 스크롤의 퍼센트지를 확인 할 수 있음
                const percent = getScrollPercent();
                if(percent >= 70 && loading.current === false) {
                    console.log("더보기를 실행");
                }
            } , 350);

            //윈도우에 resize 이벤트를 설정
            // window.addEventListener("scroll" , 함수);
            window.addEventListener("scroll" , resizeHandler);
            // console.log("스크롤 관련 이펙트 실행");

            return ()=>{
                //윈도우에 설정된 resize 이벤트를 해제
                // window.addEventListener("scroll" , 함수);
                window.addEventListener("scroll" , resizeHandler);
                // console.log("사라질 때 실행");
            }
        });

                //스크롤의 현재 위치를 퍼센트로 계산하는 함수
                const getScrollPercent = useCallback(()=>{
                    const scrollTop = window.scrollY || document.documentElement.scrollTop;
                    const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                    const scrollPercent = (scrollTop / documentHeight) * 100;
                    return scrollPercent;
                });

        const loading = useRef(false);


    return (
        <>
        <div className="container">
            <div className="row mt-4">
                {/* 상단바에 대한 처리 구현 */}
                <div className="d-flex" style={{justifyContent:"center", border:"1px solid black"}}>
                    <div className="col-sm-2">
                        <input
                            type="text"
                            name="departure"
                            className="form-control"
                            placeholder="출발지"
                            value={departureText}
                            onChange={changeInput}
                            onFocus={handleInputFocus} // 다른 입력 필드 클릭 시 숨기기
                            onClick={DepartureClick}
                            autoComplete="off"
                            readOnly
                        />
                    </div>

                    <div className="col-sm-2">
                        <input
                            type="text"
                            name="destination"
                            className="form-control"
                            placeholder="도착지"
                            value={destinationText}
                            onChange={changeInput}
                            onFocus={handleInputFocus} // 다른 입력 필드 클릭 시 숨기기
                            onClick={destinationClick}
                            autoComplete="off"
                        />
                    </div>

                    <div className="col-sm-2">
                        <input
                            type="text"
                            name="boardingDate"
                            className="form-control"
                            placeholder="가는편"
                            readOnly
                            value={input.boardingDate}
                            onClick={handleDateClick} // 클릭 시 날짜 선택기 표시
                            ref={datePickerRef} // ref 추가
                            onFocus={handleInputFocus} // 다른 입력 필드 클릭 시 숨기기
                        />
                    </div>

                    <div className="col-sm-3">
                        <input
                            type="text"
                            name="passengers"
                            className="form-control"
                            placeholder="탑승객 및 좌석등급"
                            readOnly
                            value={input.passengers}
                            onClick={showPassengerClick} // 클릭 시 설정 기능 표시
                            onFocus={handleInputFocus} // 다른 입력 필드 클릭 시 숨기기
                        />
                    </div>

                    <div className="row">
                        <div className="col">
                            <button className="btn btn-primary" onClick={complexSearch}>검색</button>
                        </div>
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
                            <div className="flight-select-div mt-2 ms-3 me-3">   
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

                        {/*    ☆☆☆☆    탑승객 및 좌석 등급 설정 기능 구현   ☆☆☆☆  */}
                        {showPassengerSettings && (
                            <div className="row mt-4" style={{ width: "600px", border: "1px solid skyblue", borderRadius: "0.5em",  marginLeft:"36%"}}>
                                <div className="row mt-4">
                                    <div className="d-flex" style={{display: "flex", justifyContent: "space-between" }}>
                                        <h3 style={{ fontWeight: "bold" }}>승객 선택</h3>
                                        <button className="btn btn-danger" onClick={CloseSetting}><IoClose /></button>
                                    </div>
                                    <div className="row mt-5">
                                        <h5 style={{ fontWeight: "bold" }}>성인 (만 12세~)</h5>
                                        <div className="col mt-1">
                                            <button className="btn btn-primary" onClick={() => decreaseCount('adult')}
                                                disabled={adultNum <= 0}>
                                                <FaMinus />
                                            </button>
                                            <span className="ms-3 mx-3">{adultNum}</span>
                                            <button className="btn btn-primary" onClick={() => increaseCount('adult')}
                                                disabled={adultNum + childNum + babyNum >= 9}>
                                                <FaPlus />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {/* 소아 설정 */}
                                <div className="row mt-4">
                                    <div className="col">
                                        <h5 style={{ fontWeight: "bold" }}>소아 (만 2세 ~ 12세 미만)</h5>
                                        <div className="col mt-1">
                                            <button className="btn btn-primary" onClick={() => decreaseCount('child')}
                                                disabled={childNum <= 0}>
                                                <FaMinus />
                                            </button>
                                            <span className="ms-3 mx-3">{childNum}</span>
                                            <button className="btn btn-primary" onClick={() => increaseCount('child')}
                                                disabled={adultNum + childNum + babyNum >= 9}><FaPlus />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {/* 유아 설정 */}
                                <div className="row mt-2">
                                    <div className="row mt-4">
                                        <div className="col">
                                            <h5 style={{ fontWeight: "bold" }}>유아 (만 2세 미만)</h5>
                                            <div className="col mt-1">
                                                <button className="btn btn-primary" onClick={() => decreaseCount('baby')}
                                                    disabled={babyNum <= 0}>
                                                    <FaMinus />
                                                </button>
                                                <span className="ms-3 mx-3">{babyNum}</span>
                                                <button className="btn btn-primary" onClick={() => increaseCount('baby')}
                                                    disabled={adultNum + childNum + babyNum >= 9}><FaPlus />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <ul>
                                    <li className="mt-3" style={{ marginLeft: "1em" }}>
                                        <span style={{ color: "lightskyblue", fontWeight: "bold" }}>
                                            만 14세 미만 승객은 예매 시 법정대리인의 동의 및 인증이 필요합니다. 로그인 후 예매를 진행하여 주시기 바랍니다.
                                        </span>
                                    </li>
                                    <li style={{ marginLeft: "1em" }}>
                                        <span>
                                            2인 이상 예매 시 로그인 회원 본인의 마일리지만 사용 가능합니다.
                                        </span>
                                    </li>
                                    <li style={{ marginLeft: "1em" }}>
                                        <span>
                                            예약인원은 성인, 소아, 유아를 포함하여 총 9명까지 선택 가능합니다.
                                        </span>
                                    </li>
                                    <li style={{ marginLeft: "1em" }}>
                                        <span>
                                            유아는 탑승일 기준 만 2세 미만까지이며, 좌석을 점유하지 않습니다.
                                        </span>
                                    </li>
                                </ul>
                        </div>
                    )}


                {/* 항공권에 대한 리스트를 출력 */}
                <div className="col-md-3">
                    <div style={{ padding: '20px', width: "70%" }}>
                        <h3>출발 시간대 설정</h3>
                        {/* 가는 날 출발시간 */}
                        <div>
                            <span style={{display:"block"}}>가는 날 출발시간 :</span>
                            <span>{formatTime(departureTime)} ~ {formatTime(departureRightTime)}</span>
                            <input type="range" min="0" max="23.5" step="0.5" // 30분 단위로 조절 가능
                                value={departureTime} onChange={(e) => setDepartureTime(Number(e.target.value))}
                                style={{ width: '100%' }} />

                            <input type="range" min="0" max="23.5" step="0.5" // 30분 단위로 조절 가능
                                value={departureRightTime} onChange={(e) => setDepartureRightTime(Number(e.target.value))}
                                style={{ width: '100%' }} />
                        </div>
                        {/* 오는 편 시간 */}
                        <div>
                            <p>오는 편: {formatTime(returnTime)} ~ {formatTime(23.5)}</p>
                            <input
                                type="range"
                                min="0"
                                max="23.5"
                                step="0.5" // 30분 단위로 조절 가능
                                value={returnTime}
                                onChange={(e) => setReturnTime(Number(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                </div>
                {/* 항공편 리스트에 대한 기능 */}
                <div className="col-md-6">
                    <div className="d-flex mb-3">
                        <span className="me-2">출발시간순 |</span>
                        <span className="ms -2 me-2">도착시간순 |</span>
                        <span className="ms -2 me-2">최저가순</span>
                    </div>



                                    <div className="row">
                    {flightList.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "20px", color: "gray" }}>
                            <h2>검색결과가 존재하지 않습니다.</h2>
                        </div>
                    ) : (
                        flightList.map((flight) => (
                            <NavLink to={`/flight/booking/${flight.flightId}`} style={{ textDecoration: "none" }} key={flight.flightId}>
                                <div className="d-flex mt-3" style={{ border: "1px solid black", borderRadius: "1.5em", width: "100%" }}>
                                    <div className="row mt-3 mb-3 ms-1" style={{ width: "70%" }}>
                                        <h3 style={{ color: "black" }}>{flight.airlineDto ? flight.airlineDto.airlineName : '정보 없음'}<GiCommercialAirplane /></h3>
                                        <div className="d-flex mb-2" style={{ justifyContent: "space-between" }}>
                                            <div className="d-flex mt-3" style={{ width: "200px", justifyContent: "space-between" }}>
                                                <span style={{ width: "100%", textAlign: "center" }}>
                                                    {moment(flight.departureTime).format("a HH:mm")}
                                                    <p>{flight.departureAirport.substring(
                                                        flight.departureAirport.indexOf("(") + 1,
                                                        flight.departureAirport.indexOf(")")
                                                    )}</p>
                                                </span>
                                            </div>
                                            <div className="row" style={{ width: "200px" }}>
                                                <span style={{ textAlign: "center" }}>{flight.flightTime}</span>
                                                <span style={{ textAlign: "center" }}>------------</span>
                                                <span style={{ textAlign: "center" }}>직항</span>
                                            </div>
                                            <div className="d-flex mt-3" style={{ width: "200px", justifyContent: "space-between" }}>
                                                <span style={{ width: "100%", textAlign: "center" }}>
                                                    {moment(flight.arrivalTime).format("a HH:mm")}
                                                    <p>{flight.arrivalAirport.substring(
                                                        flight.arrivalAirport.indexOf("(") + 1,
                                                        flight.arrivalAirport.indexOf(")")
                                                    )}</p>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row flight-price-box" style={{ width: "30%" }}>
                                        <span className="mt-3" style={{ textAlign: "center", color: "black", fontWeight: "bolder" }}>
                                            {flight.flightPrice.toLocaleString()}원
                                        </span>
                                        <button className="btn btn-primary ms-5" style={{ width: "50%", height: "30%" }}>선택하기</button>
                                        {user.userType === "MEMBER" && (
                                            <button className="btn btn-secondary ms-5" style={{ width: "50%", height: "30%" }} onClick={() => createRoom(flight)}>문의하기</button>
                                        )}
                                    </div>
                                </div>
                            </NavLink>
                        ))
                    )}
                </div>

                </div>
                </div>
            </div>


            {/* 더보기 버튼 : result의 last가 false이면 ( 더 볼게 있다면) */}
            {/* A ? : B : C */}
            {/* A && B */}
            {/* A || C */}
            {result.last === false && (
                <div className="row mt-4">
                    <div className="col">
                        <button className="btn btn-success w-100"
                                    onClick={e=>setPage(page+1)}>
                            더보기</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default BookingList;
