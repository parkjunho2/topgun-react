import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PiTildeBold } from "react-icons/pi";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import { FaAngleDown } from "react-icons/fa";
import { throttle } from "lodash";
import moment from "moment";

const ComplexTest = () => {

    const [flightList , setFlightList] = useState([]);

    // state
    const [input, setInput] = useState({
        departureAirport: "",   // 출발 공항
        arrivalAirport: "",     // 도착 공항
        departureTime: "",         // 출발 날짜
        passengers: ""
    });

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
            const resp = await axios.post("http://localhost:8080/flight/complexSearch", input);
            setResult(resp.data);
            console.log(resp.data);
            loading.current = false;    //종료지점
        }, [input]);

        //더보기 버튼을 눌렀을 때 사용
        const sendMoreRequest = useCallback(async ()=>{
            loading.current = true; //시작지점
            const resp = await axios.post("http://localhost:8080/flight/complexSearch", input);
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


        const setFirstPage = useCallback(()=>{
            setPage(prev=>null);
            setTimeout(()=>{
                setPage(prev=>1);
            }, 1);  //이 코드는 1ms 뒤에 실행해라!
            
        }, [page]);

        //스크롤 관련된 처리
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
            window.addEventListener("scroll" , resizeHandler);
            // console.log("스크롤 관련 이펙트 실행");

            return ()=>{
                //윈도우에 설정된 resize 이벤트를 해제
                window.addEventListener("scroll" , resizeHandler);
            }
        });
                //스크롤의 현재 위치를 퍼센트로 계산하는 함수
                const getScrollPercent = useCallback(()=>{
                    const scrollTop = window.scrollY || document.documentElement.scrollTop;
                    const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                    const scrollPercent = (scrollTop / documentHeight) * 100;
                    return scrollPercent;
                });

        // ※※  로딩중에 추가 로딩이 불가능하게 처리하기 위한 REF 사용 ※※
        // 목록을 불러오기 시작하면 loading.current = true로 변경
        // 목록을 불러오고 나면  loading.current = false로 변경
        const loading = useRef(false);


    //view
    return (
        <>
            {/* 검색화면 */}
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">출발공항</label>
                <div className="col-sm-9">
                    <input type="text" className="form-control" 
                                                            value={input.departureAirport}
                                                            name="departureAirport"
                                                            onChange={changeInputString}/>
                </div>
            </div>
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">도착공항</label>
                <div className="col-sm-9">
                    <input type="text" className="form-control" 
                                            name="arrivalAirport" 
                                            value={input.arrivalAirport} 
                                            onChange={changeInputString} />
                </div>
            </div>

            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">출발날짜</label>
                <div className="col-sm-9 d-flex">
                    <input type="date" className="form-control" 
                                                name="departureTime" 
                                                value={input.departureTime} 
                                                onChange={changeInputString}/>
                    {/* <input type="date" className="form-control" 
                                                name="endMemberJoin" value={input.endMemberJoin} 
                                                onChange={changeInputString}/> */}
                </div>
            </div>

            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">인원수</label>
                <div className="col-sm-9 d-flex">
                    <input type="text" className="form-control" 
                                                name="passengers" value={input.passengers} 
                                                onChange={ChangeInputNumber}/>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <button type="button" className="btn btn-success w-100" 
                                                    onClick={setFirstPage}>
                        <FaSearch />이 조건으로 상세 검색하기</button>
                </div>
            </div>

            {/* 결과 표시 화면 */}
            <div className="row mt-4">
                <div className="col">
                    <ul className="list-group">
                        {result.flightList.length > 0 ? (
                            result.flightList.map(flight => (
                                <li className="list-group-item" key={flight.flightId}>
                                    <h3>항공편 번호: {flight.flightId}</h3>
                                    <div className="row">
                                        <div className="col-3">출발지</div>
                                        <div className="col-9">{flight.departureAirport}</div>
                                    </div>
                                    <div className="row mt-2">
                                        <div className="col-3">도착지</div>
                                        <div className="col-9">{flight.arrivalAirport}</div>
                                    </div>
                                    <div className="row mt-2">
                                        <div className="col-3">출발일</div>
                                        <div className="col-9">{flight.departureTime}</div>
                                    </div>
                                    <div className="row mt-2">
                                        <div className="col-3">항공사 이름</div>
                                        <div className="col-9">{flight.airlineDto ? flight.airlineDto.airlineName : '정보 없음'}</div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="list-group-item">
                                <h3>검색 결과가 존재하지 않습니다.</h3>
                            </li>
                        )}
                    </ul>
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
                            더보기<FaAngleDown /></button>
                    </div>
                </div>
            )}
        </>
    )
};
export default ComplexTest;