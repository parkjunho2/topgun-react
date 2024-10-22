import './FlightTicketSearch.css'
import 'lightpick/css/lightpick.css';
import './MainPage.css'
import { useCallback, useRef, useEffect, useState, useMemo } from "react";
import { FaPlus } from "react-icons/fa";
import { FaMinus } from "react-icons/fa";
import Lightpick from 'lightpick';
import moment from "moment";
import { useNavigate } from 'react-router';
import { IoClose } from "react-icons/io5";
import * as hangul from 'hangul-js';

const MainPage = () => {
    //navigate
    const navigate = useNavigate();

    // state
    const [input, setInput] = useState({
        departure: '',
        destination: '',
        boardingDate: '',
        departureDate: "",
        passengers: ''
    });

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
        else if (input.departureDate.length === 0) {
            return window.alert("도착일자를 입력해주세요.");
        }
        else if (adultNum === 0 && childNum === 0 && babyNum === 0) {
            return window.alert("인원을 입력해주세요.");
        }
        else {
            navigate("/booking");   //위의 항목들이 모두 pass라면 이동
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
        // selectedDepCity가 있으면 해당 도시를 반환, 없으면 기존 input.departure 값을 유지
        return selectedDepCity ? selectedDepCity : input.departure;
    }, [selectedDepCity, input.departure]);

    // 출발지 상태 변경 처리
    useEffect(() => {
        setInput((prev) => ({
            ...prev,
            departure: departureText // 선택된 취항지를 출발지 입력창에 설정
        }));
    }, [departureText]); // 선택된 도시가 변경될 때마다 업데이트

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

    // 다음 버튼 클릭 시 도착지 입력창을 열고 포커스를 맞추는 함수
    const handleNextClick = () => {
        setTimeout(() => {
            const destinationInput = document.querySelector('input[name="destination"]');
            if (destinationInput) {
                destinationInput.focus(); // 도착지 입력창에 포커스
            }
            setDestinationInputClick(true); // 도착지 입력창에 포커스 이후 도착지 선택 UI 열기
        }, 100); // 약간의 딜레이를 두어 UI가 렌더링된 후에 포커스 이동
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
                singleDate: false, // 범위 선택 가능
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
                    if (end) {
                        setInput((prev) => ({
                            ...prev,
                            departureDate: end.format('YYYY-MM-DD') // 오는편 날짜 설정
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

    const [keyword, setKeyword] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1); // 선택된 항목의 인덱스

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
        setKeyword(text);
        setOpen(false);     // 자동완성 키워드를 클릭했을 때 사라지게 함
    }, []);

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
            {/* 캐러셀 */}
            <div className="row">
                {/* 이미지1 */}
                <div className="carousel-item active">
                    {/* <img
                            src="https://picsum.photos/800/400"
                            alt="Example image"
                            className="bd-placeholder-img d-block w-100 h-100"
                            aria-hidden="true"
                            focusable="false"
                            style={{ backgroundColor: 'var(--bs-secondary-color)', width: '100%', height: '100%' }} /> */}
                </div>


            </div>
                            {/* 가는편 오는편 기능 구현 */}
                            <div className="row mt-4">
                <h2>항공권 조회 구현중..</h2>
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

                    <div className="col-sm-2">
                        <input
                            type="text"
                            name="departureDate"
                            className="form-control"
                            placeholder="오는편"
                            readOnly
                            value={input.departureDate}
                            onClick={handleDateClick} // 클릭 시 날짜 선택기 표시
                            ref={datePickerRef} // ref 추가
                            onFocus={handleInputFocus} // 다른 입력 필드 클릭 시 숨기기
                        />
                    </div>

                    <div className="col-sm-2">
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

                    <div className="col-sm-2">
                        <button className="btn btn-success" onClick={checkInputEmpty}>조회</button>
                    </div>
                </div>

                {/*   ☆☆☆☆ 출발지 입력창 기능 구현 ☆☆☆☆ */}
                {departureInputClick && ( // 출발지 입력창 클릭 시에만 보여주기
                    // 검색창 기능
                    <div className="row mt-3" style={{ width: "1000px", border: "1px solid skyblue", borderRadius: "0.5em" }}>
                        <div className="d-flex" style={{ display: "flex", justifyContent: "space-between" }}>
                            <h4 className="mt-3" style={{ fontWeight: "bold" }}>출발지 선택</h4>
                            <button className="btn btn-danger mt-3" onClick={CloseSetting}><IoClose /></button>
                        </div>
                        <div className="flights_list_national row mt-3">
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
                )}

                {/*    ☆☆☆☆ 도착지 입력창 기능 구현 ☆☆☆☆   */}
                {destinationInputClick && ( // 도착지 입력창 클릭 시에만 보여주기
                    // 검색창 기능
                    <div className="row mt-3" style={{ width: "1000px", border: "1px solid skyblue", borderRadius: "0.5em" }}>
                        <div className="d-flex" style={{ display: "flex", justifyContent: "space-between" }}>
                            <h4 className="mt-3" style={{ fontWeight: "bold" }}>도착지 선택</h4>
                            <button className="btn btn-danger mt-3" onClick={CloseSetting}><IoClose /></button>
                        </div>
                        <div className="flights_list_national row mt-3">
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
                        <div className="row mt-4" style={{ width: "600px", border: "1px solid skyblue", borderRadius: "0.5em",  marginLeft:"450px"}}>
                            {/* <div className="row">
                            <div className="col">
                                <h5 style={{fontWeight:"bold"}}>좌석 등급</h5>
                                <select className="select-seat form-select" value={selectedSeatClass} onChange={SeatClassChange}>
                                    <option value="">좌석 등급을 선택해주세요.</option>
                                    <option value="일반석">일반석</option>
                                    <option value="비지니스석">비지니스석</option>
                                </select>
                            </div>
                        </div>*/}
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

                {/* 자동완성 기능을 구현 연습 중 */}
                <hr />
                <div className="row mt-5 mb-5">
                    <h3>자동완성 기능 구현중..(ex오사카,서울 등)</h3>
                    <div className="col">
                        <div className="form-group">
                            <input type="text"
                                className="form-control"
                                placeholder="출발지를 검색하세요."
                                value={keyword}
                                onChange={changeKeyword}
                                onKeyUp={handleKeyDown} // 키보드 이벤트 핸들러 추가
                            />

                            {/* {open === true && 화면} 왼쪽만 쓰겠다
                                {open === true || 화면} 오르쪽만 쓰겠다 */}
                            {open === true && (
                                <ul className="list-group">
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


            {/* Marketing messaging and featurettes
  ================================================== */}
            {/* Wrap the rest of the page in another container to center all the content. */}

            {/* 수정예정 */}
            <div className="container marketing">
                {/* Three columns of text below the carousel */}
                <div className="row">
                    <div className="col-lg-4">
                        <svg
                            className="bd-placeholder-img rounded-circle"
                            width={140}
                            height={140}
                            xmlns="http://www.w3.org/2000/svg"
                            role="img"
                            aria-label="Placeholder"
                            preserveAspectRatio="xMidYMid slice"
                            focusable="false"
                        >
                            <title>Placeholder</title>
                            <rect width="100%" height="100%" fill="var(--bs-secondary-color)" />
                        </svg>
                        <h2 className="fw-normal">Heading</h2>
                        <p>
                            Some representative placeholder content for the three columns of
                            text below the carousel. This is the first column.
                        </p>
                        <p>
                            <a className="btn btn-secondary" href="#">
                                View details »
                            </a>
                        </p>
                    </div>
                    {/* /.col-lg-4 */}
                    <div className="col-lg-4">
                        <svg
                            className="bd-placeholder-img rounded-circle"
                            width={140}
                            height={140}
                            xmlns="http://www.w3.org/2000/svg"
                            role="img"
                            aria-label="Placeholder"
                            preserveAspectRatio="xMidYMid slice"
                            focusable="false"
                        >
                            <title>Placeholder</title>
                            <rect width="100%" height="100%" fill="var(--bs-secondary-color)" />
                        </svg>
                        <h2 className="fw-normal">Heading</h2>
                        <p>
                            Another exciting bit of representative placeholder content. This
                            time, we've moved on to the second column.
                        </p>
                        <p>
                            <a className="btn btn-secondary" href="#">
                                View details »
                            </a>
                        </p>
                    </div>
                    {/* /.col-lg-4 */}
                    <div className="col-lg-4">
                        <svg
                            className="bd-placeholder-img rounded-circle"
                            width={140}
                            height={140}
                            xmlns="http://www.w3.org/2000/svg"
                            role="img"
                            aria-label="Placeholder"
                            preserveAspectRatio="xMidYMid slice"
                            focusable="false"
                        >
                            <title>Placeholder</title>
                            <rect width="100%" height="100%" fill="var(--bs-secondary-color)" />
                        </svg>
                        <h2 className="fw-normal">Heading</h2>
                        <p>
                            And lastly this, the third column of representative placeholder
                            content.
                        </p>
                        <p>
                            <a className="btn btn-secondary" href="#">
                                View details »
                            </a>
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
            {/* /.container */}
        </>

    );
};

export default MainPage;
