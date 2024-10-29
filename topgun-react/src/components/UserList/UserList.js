import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaChevronDown } from "react-icons/fa";

const UserList = () => {

    const [input, setInput] = useState({
        usersId: '',
        usersName: '',
        usersContact: '',
        usersEmail: '',
        usersType: ''
    });

    const [result, setResult] = useState({
        count: 0,
        last: true,
        userList: []
    });

    //페이징 관련 state
    const [page, setPage] = useState(1);
    const [size,] = useState(6);

    // [2] effect로 계산 (권장하는 방법!)
    useEffect(() => {
        setInput({
            ...input,
            beginRow: page * size - (size - 1),
            endRow: page * size
        });
    }, [page, size]);

    useEffect(() => {
        //console.log("beginRow, endRow 변경! ", input.beginRow, input.endRow);
        if (page === 1) {
            sendRequest();
        }
        else if (page >= 2) {
            sendMoreRequest();
        }
    }, [input.beginRow, input.endRow]);

    //callback
    const changeInputString = useCallback(e => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    }, [input]);

    //첫 목록 불러올 때 사용
    const sendRequest = useCallback(async () => {
        loading.current = true;//시작지점
        const resp = await axios.post("http://localhost:8080/users/search", input);
        setResult(resp.data);
        loading.current = false;//종료지점
    }, [input]);

    //더보기 눌렀을 때 사용
    const sendMoreRequest = useCallback(async () => {
        loading.current = true;//시작지점
        const resp = await axios.post("http://localhost:8080/users/search", input);
        setResult({
            ...result,
            last: resp.data.last,//서버에서 준 응답 데이터에 있는 last로 갱신
            userList: [...result.userList, ...resp.data.userList]
        });
        loading.current = false;//종료지점
    }, [input.beginRow, input.endRow]);



    const setFirstPage = useCallback(() => {

        //아래 명령은 어느게 먼저 실행된다고 장담할 수 없다(비동기)
        //setPage(null);
        //setPage(1);

        //useState에서 제공하는 set 메소드에 동기로 처리할 수 있는 코드가 존재
        //setPage(prev=>?);
        setPage(prev => null);
        setTimeout(() => {
            setPage(prev => 1);
        }, 1);//이 코드는 1ms 뒤에 실행해라!

    }, [page]);

    const loading = useRef(false);

    return (
        <>
            <section style={{ backgroundColor: "#eee" }}>
                <div className="container py-5">
                    <div className="row justify-content-center">

                        {/* 복합 검색 창 (작은 화면에서는 12칸, 큰 화면에서는 4칸) */}
                        <div className="col-12 col-lg-4 mb-4">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">검색</h5>
                                    <div className="mb-3">
                                        <label htmlFor="searchId" className="form-label">아이디</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="searchId"
                                            placeholder="아이디 검색"
                                            name="usersId"
                                            value={input.usersId}
                                            onChange={changeInputString}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="searchName" className="form-label">이름</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="searchName"
                                            placeholder="이름 검색"
                                            name="usersName"
                                            value={input.usersName}
                                            onChange={changeInputString}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="searchType" className="form-label">유형</label>
                                        <select className="form-select" id="searchType" name="usersType" onChange={changeInputString}>
                                            <option value="">모든 유형</option>
                                            <option value="ADMIN">관리자</option>
                                            <option value="MEMBER">회원</option>
                                            <option value="AIRLINE">항공사</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="searchEmail" className="form-label">이메일</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="searchEmail"
                                            placeholder="이메일 검색"
                                            name="usersEmail"
                                            value={input.usersEmail}
                                            onChange={changeInputString}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="searchContact" className="form-label">연락처</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            id="searchContact"
                                            placeholder="연락처 검색"
                                            name="usersContact"
                                            value={input.usersContact}
                                            onChange={changeInputString}
                                        />
                                    </div>
                                    <button type="button" onClick={setFirstPage} className="btn btn-primary">검색</button>
                                </div>
                            </div>
                        </div>

                        {/* 사용자 목록 (항상 보이도록 설정) */}
                        <div className="col-12 col-lg-7 offset-lg-1 mb-4 bg-white shadow-sm border-0 rounded">
                            <div className="main-box no-header clearfix"> {/* 배경색을 하얀색으로 설정 */}
                                <div className="main-box-body clearfix">
                                    <div className="user-list">
                                        {/* 헤더 */}
                                        <div className="row header border-bottom mb-3">
                                            <div className="col py-2"><strong>ID / Name</strong></div>
                                            <div className="col text-center py-2"><strong>Type</strong></div>
                                            <div className="col py-2"><strong>Email</strong></div>
                                            <div className="col py-2 text-right"><strong>Contact</strong></div>
                                        </div>
                                        {/* 사용자 목록 */}
                                        {result.userList.map((user) => (
                                            <div className="row user align-items-center mb-3 border-bottom" key={user.usersId}>
                                                <div className="col py-2 px-3">
                                                    <div className="col py-2 px-3">
                                                        <div className="d-block">
                                                            <big className="fw-bold">{user.usersId}</big>
                                                            <small className="d-block text-muted">{user.usersName}</small>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col text-center py-2 px-3">
                                                    <span className={`badge ${user.usersType === 'ADMIN' ? 'bg-danger' : user.usersType === 'MEMBER' ? 'bg-primary' : user.usersType === 'AIRLINE' ? 'bg-success' : 'bg-secondary'}`}>
                                                        {user.usersType}
                                                    </span>
                                                </div>
                                                <div className="col py-2 px-3">
                                                    <span>{user.usersEmail}</span>
                                                </div>
                                                <div className="col py-2 px-3 text-right">
                                                    <span>{user.usersContact}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {result.last === false && (
                                <div className="row my-4">
                                    <div className="col">
                                        <button className="btn btn-success w-100"
                                            onClick={e => setPage(page + 1)}>
                                            <FaChevronDown />
                                            <span className="mx-4">더보기</span>
                                            <FaChevronDown />
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>

                    </div>
                </div>
            </section>
        </>
    );


};

export default UserList;
