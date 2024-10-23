import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { userState } from "../../util/recoil";
import moment from 'moment';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS import
import 'react-datepicker/dist/react-datepicker.css';
import './Mypage.css'; // 스타일을 위한 CSS 파일
import DatePicker from "react-datepicker";
// Handle save click
import { toast } from 'react-toastify';

const MyPage = () => {
    // Recoil
    const user = useRecoilValue(userState);

    //ref
    const modalRef = useRef(null);

    // State
    const [userInfo, setUserInfo] = useState(null); // 상태 초기화
    const [isEditing, setIsEditing] = useState(false); // 편집 모드 상태 추가
    const [editedUserInfo, setEditedUserInfo] = useState(null); // 편집할 사용자 정보 상태 추가
    const [checkPw, setCheckPw] = useState(''); // 체크 비밀번호

    // Callback
    const loadMyInfo = useCallback(async () => {
        if (!user || !user.userId || !user.userType) return; // user가 유효한지 확인

        try {
            const response = await axios.post('http://localhost:8080/users/myInfo', {
                userId: user.userId,
                userType: user.userType
            });
            setUserInfo(response.data); // 서버에서 받은 데이터 처리
            setEditedUserInfo(response.data); // 서버에서 받은 데이터를 수정을 위한 state에 업데이트
        } catch (error) {
            console.error("Error loading my info:", error);
        }
    }, [user]); // user를 의존성 배열에 추가

    // Effect
    useEffect(() => {
        loadMyInfo(); // 컴포넌트 마운트 시 사용자 정보 로드
    }, []); // loadMyInfo를 의존성 배열에 추가

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target || {}; // e.target이 없을 수도 있으니 기본값으로 빈 객체를 설정

        setEditedUserInfo((prev) => ({
            ...prev,
            [name]: name === 'memberBirth' ? new Date(value) : value, // memberBirth일 경우 Date로 변환
        }));
    };

    const saveEdit = useCallback(async () => {
        try {
            const response = await axios.put('http://localhost:8080/users/update', editedUserInfo, {
                params: {
                    authPassword: checkPw // authPassword를 쿼리 파라미터로 전달
                }
            });
    
            // 요청이 성공하면 처리할 내용
            console.log('성공:', response.data);
    
            if (response.data === true) {
                // data가 true일 경우
                toast.success('정보가 성공적으로 수정되었습니다!'); // 성공 메시지
    
                // 체크 비밀번호 초기화
                setCheckPw('');
                // 수정 모드 초기화
                setIsEditing(false);
    
                // 저장내용 리로드
                loadMyInfo();
    
            } else {
                // data가 false일 경우
                toast.error('정보 수정에 실패했습니다.'); // 실패 메시지
                // 체크 비밀번호 초기화
                setCheckPw('');
                // 수정 모드 초기화
                setIsEditing(false);
            }
        } catch (error) {
            toast.error('정보 수정 중 오류가 발생했습니다.'); // 오류 메시지
            // 체크 비밀번호 초기화
            setCheckPw('');
            // 수정 모드 초기화
            setIsEditing(false);
        }
    }, [editedUserInfo, checkPw, modalRef]);
    



    // View
    return (
        <section style={{ backgroundColor: "#eee" }}>
            <div className="container py-5">
                {/* 상태창 바 */}
                <div className="row">
                    <div className="col">
                        <nav aria-label="breadcrumb" className="bg-light rounded-3 p-3 mb-4 shadow-sm">
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">Home</li>
                                <li className="breadcrumb-item active" aria-current="page">My Profile</li>
                            </ol>
                        </nav>
                    </div>
                </div>

                {/* 왼쪽 상단 프로필 카드 */}
                <div className="row">
                    <div className="col-lg-4">
                        <div className="card border-0 mb-4 shadow-sm">
                            <div className="card-body text-center">
                                <img
                                    src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp"
                                    alt="avatar"
                                    className="rounded-circle img-fluid"
                                    style={{ width: "150px" }}
                                />
                                <h5 className="my-3">{userInfo ? userInfo.usersName : "Loading..."}</h5>
                                <p className="text-muted mb-1">{userInfo ? (userInfo.usersType === 'AIRLINE' ? "Airline" : userInfo.usersType) : ""}</p>
                                <p className="text-muted mb-1"><big>{userInfo ? userInfo.usersEmail : "Loading..."}</big></p>
                                {/* <div className="d-flex justify-content-center mb-2">
                                    <button type="button" className="btn btn-primary">
                                        Follow
                                    </button>
                                    <button type="button" className="btn btn-outline-primary ms-1">
                                        Message
                                    </button>
                                </div> */}
                            </div>
                        </div>

                        <div className="mb-4 mb-lg-0">
                            {isEditing ? (
                                <>
                                    <button className="btn btn-success w-100 shadow-sm" data-bs-toggle="modal" data-bs-target="#EditForm">
                                        정보 저장
                                    </button>
                                    <button type="button" onClick={
                                        () => {
                                            setIsEditing(false);
                                            setEditedUserInfo(null); // 서버에서 받은 데이터를 수정을 위한 state에 업데이트
                                        }
                                    } className="btn btn-danger w-100 shadow-sm mt-3">
                                        취소
                                    </button>
                                </>
                            ) : (
                                <button type="button" onClick={() => {
                                    setIsEditing(true);
                                    setEditedUserInfo(userInfo); // 서버에서 받은 데이터를 수정을 위한 state에 업데이트
                                }} className="btn btn-primary w-100 shadow-sm">
                                    정보 수정 하기
                                </button>
                            )}
                        </div>

                        {/* 하단 프로필 카드 */}
                        {/* <div className="card border-0 mb-4 mb-lg-0 shadow-sm">
                            <div className="card-body p-0">
                                <ul className="list-group list-group-flush rounded-3">
                                    <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                                        <i className="fas fa-globe fa-lg text-warning"></i>
                                        <p className="mb-0">https://example.com</p>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                                        <i className="fab fa-github fa-lg text-body"></i>
                                        <p className="mb-0">example-github</p>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                                        <i className="fab fa-twitter fa-lg" style={{ color: "#55acee" }}></i>
                                        <p className="mb-0">@exampletwitter</p>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                                        <i className="fab fa-instagram fa-lg" style={{ color: "#ac2bac" }}></i>
                                        <p className="mb-0">exampleinsta</p>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                                        <i className="fab fa-facebook-f fa-lg" style={{ color: "#3b5998" }}></i>
                                        <p className="mb-0">examplefb</p>
                                    </li>
                                </ul>
                            </div>
                        </div> */}
                    </div>


                    {/* 상세 프로필 우 상단 */}
                    <div className="col-lg-8">
                        <div className="card border-0 mb-4 shadow-sm">
                            <div className="card-body">
                                {userInfo ? (
                                    <>
                                        <div className="row">
                                            <div className="col-sm-4">
                                                <p className="mb-0">ID</p>
                                            </div>
                                            <div className="col-sm-8">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="usersId"
                                                        value={editedUserInfo.usersId}
                                                        onChange={handleInputChange}
                                                        className="form-control"
                                                    />
                                                ) : (
                                                    <p className="text-muted mb-0">{userInfo.usersId}</p>
                                                )}
                                            </div>
                                        </div>
                                        <hr />
                                        <div className="row">
                                            <div className="col-sm-4">
                                                <p className="mb-0">Name</p>
                                            </div>
                                            <div className="col-sm-8">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="usersName"
                                                        value={editedUserInfo.usersName}
                                                        onChange={handleInputChange}
                                                        className="form-control"
                                                    />
                                                ) : (
                                                    <p className="text-muted mb-0">{userInfo.usersName}</p>
                                                )}
                                            </div>
                                        </div>
                                        <hr />
                                        <div className="row">
                                            <div className="col-sm-4">
                                                <p className="mb-0">Email</p>
                                            </div>
                                            <div className="col-sm-8">
                                                {isEditing ? (
                                                    <input
                                                        type="email"
                                                        name="usersEmail"
                                                        value={editedUserInfo.usersEmail}
                                                        onChange={handleInputChange}
                                                        className="form-control"
                                                    />
                                                ) : (
                                                    <p className="text-muted mb-0">{userInfo.usersEmail}</p>
                                                )}
                                            </div>
                                        </div>
                                        <hr />
                                        <div className="row">
                                            <div className="col-sm-4">
                                                <p className="mb-0">Contact</p>
                                            </div>
                                            <div className="col-sm-8">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="usersContact"
                                                        value={editedUserInfo.usersContact}
                                                        onChange={handleInputChange}
                                                        className="form-control"
                                                    />
                                                ) : (
                                                    <p className="text-muted mb-0">{userInfo.usersContact}</p>
                                                )}
                                            </div>
                                        </div>
                                        <hr />
                                        {userInfo.usersType === 'AIRLINE' && (
                                            <>
                                                <div className="row">
                                                    <div className="col-sm-4">
                                                        <p className="mb-0">Airline Name</p>
                                                    </div>
                                                    <div className="col-sm-8">
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                name="airlineName"
                                                                value={editedUserInfo.airlineName}
                                                                onChange={handleInputChange}
                                                                className="form-control"
                                                            />
                                                        ) : (
                                                            <p className="text-muted mb-0">{userInfo.airlineName}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <hr />
                                                <div className="row">
                                                    <div className="col-sm-4">
                                                        <p className="mb-0">Airline No</p>
                                                    </div>
                                                    <div className="col-sm-8">
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                name="airlineNo"
                                                                value={editedUserInfo.airlineNo}
                                                                onChange={handleInputChange}
                                                                className="form-control"
                                                            />
                                                        ) : (
                                                            <p className="text-muted mb-0">{userInfo.airlineNo}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {userInfo.usersType === 'MEMBER' && (
                                            <>
                                                <div className="row">
                                                    <div className="col-sm-4">
                                                        <p className="mb-0">English Name</p>
                                                    </div>
                                                    <div className="col-sm-8">
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                name="memberEngName"
                                                                value={editedUserInfo.memberEngName}
                                                                onChange={handleInputChange}
                                                                className="form-control"
                                                            />
                                                        ) : (
                                                            <p className="text-muted mb-0">{userInfo.memberEngName}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <hr />
                                                <div className="row">
                                                    <div className="col-sm-4">
                                                        <p className="mb-0">Birth</p>
                                                    </div>
                                                    <div className="col-sm-8">
                                                        {isEditing ? (
                                                            <DatePicker

                                                                selected={editedUserInfo.memberBirth}
                                                                onChange={(date) => handleInputChange({ target: { name: 'memberBirth', value: date } })} // 날짜 선택 시 핸들러 호출
                                                                className="form-control"
                                                                placeholderText="생일을 선택하세요" // Placeholder 추가
                                                                maxDate={new Date()}
                                                            />
                                                        ) : (
                                                            <p className="text-muted mb-0">{moment(userInfo.memberBirth).format('YYYY년 MM월 DD일')} {/* 형식화된 날짜 출력 */}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <hr />
                                                <div className="row">
                                                    <div className="col-sm-4">
                                                        <p className="mb-0">Gender</p>
                                                    </div>
                                                    <div className="col-sm-8">
                                                        {isEditing ? (
                                                            <>
                                                                <label>
                                                                    <input
                                                                        type="radio"
                                                                        name="memberGender"
                                                                        value="M" // 남성 선택
                                                                        checked={editedUserInfo.memberGender === 'M'} // 체크 상태 설정
                                                                        onChange={handleInputChange}
                                                                        className="form-check-input" // Bootstrap 클래스 사용
                                                                    />
                                                                    <span className="ms-2">Male</span> {/* 왼쪽 마진 추가 */}
                                                                </label>
                                                                <label>
                                                                    <input
                                                                        type="radio"
                                                                        name="memberGender"
                                                                        value="F" // 여성 선택
                                                                        checked={editedUserInfo.memberGender === 'F'} // 체크 상태 설정
                                                                        onChange={handleInputChange}
                                                                        className="form-check-input ms-4" // Bootstrap 클래스 사용
                                                                    />
                                                                    <span className="ms-2">Female</span> {/* 왼쪽 마진 추가 */}
                                                                </label>
                                                            </>
                                                        ) : (
                                                            <p className="text-muted mb-0">{userInfo.memberGender}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {userInfo.usersType === 'ADMIN' && (
                                            <>
                                                <div className="row">
                                                    <div className="col-sm-4">
                                                        <p className="mb-0">Admin Department</p>
                                                    </div>
                                                    <div className="col-sm-8">
                                                        <p className="text-muted mb-0">{userInfo.adminDepartment}</p>
                                                    </div>
                                                </div>
                                                <hr />
                                                <div className="row">
                                                    <div className="col-sm-4">
                                                        <p className="mb-0">Admin Access Level</p>
                                                    </div>
                                                    <div className="col-sm-8">
                                                        <p className="text-muted mb-0">{userInfo.adminAccessLevel}</p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <p>No user information available.</p>
                                )}
                            </div>
                        </div>

                        {/* 하단카드 1 */}
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card border-0 mb-4 mb-md-0 shadow-sm">
                                    <div className="card-body">
                                        <p className="mb-4">
                                            <span className="text-primary font-italic me-1">assignment</span> Project Status
                                        </p>
                                        <p className="mb-1" style={{ fontSize: ".77rem" }}>
                                            Web Design
                                        </p>
                                        <div className="progress rounded" style={{ height: "5px" }}>
                                            <div
                                                className="progress-bar"
                                                role="progressbar"
                                                style={{ width: "80%" }}
                                                aria-valuenow="80"
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            ></div>
                                        </div>
                                        <p className="mt-4 mb-1" style={{ fontSize: ".77rem" }}>
                                            Website Markup
                                        </p>
                                        <div className="progress rounded" style={{ height: "5px" }}>
                                            <div
                                                className="progress-bar"
                                                role="progressbar"
                                                style={{ width: "72%" }}
                                                aria-valuenow="72"
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            ></div>
                                        </div>
                                        <p className="mt-4 mb-1" style={{ fontSize: ".77rem" }}>
                                            One Page
                                        </p>
                                        <div className="progress rounded" style={{ height: "5px" }}>
                                            <div
                                                className="progress-bar"
                                                role="progressbar"
                                                style={{ width: "89%" }}
                                                aria-valuenow="89"
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            ></div>
                                        </div>
                                        <p className="mt-4 mb-1" style={{ fontSize: ".77rem" }}>
                                            Mobile Template
                                        </p>
                                        <div className="progress rounded" style={{ height: "5px" }}>
                                            <div
                                                className="progress-bar"
                                                role="progressbar"
                                                style={{ width: "55%" }}
                                                aria-valuenow="55"
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            ></div>
                                        </div>
                                        <p className="mt-4 mb-1" style={{ fontSize: ".77rem" }}>
                                            Backend API
                                        </p>
                                        <div className="progress rounded mb-2" style={{ height: "5px" }}>
                                            <div
                                                className="progress-bar"
                                                role="progressbar"
                                                style={{ width: "66%" }}
                                                aria-valuenow="66"
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 두번째 하단 카드 2 */}
                            <div className="col-md-6">
                                <div className="card border-0 mb-4 mb-md-0 shadow-sm">
                                    <div className="card-body">
                                        <p className="mb-4">
                                            <span className="text-primary font-italic me-1">assignment</span> Project Status
                                        </p>
                                        <p className="mb-1" style={{ fontSize: ".77rem" }}>
                                            Web Design
                                        </p>
                                        <div className="progress rounded" style={{ height: "5px" }}>
                                            <div
                                                className="progress-bar"
                                                role="progressbar"
                                                style={{ width: "80%" }}
                                                aria-valuenow="80"
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            ></div>
                                        </div>
                                        <p className="mt-4 mb-1" style={{ fontSize: ".77rem" }}>
                                            Website Markup
                                        </p>
                                        <div className="progress rounded" style={{ height: "5px" }}>
                                            <div
                                                className="progress-bar"
                                                role="progressbar"
                                                style={{ width: "72%" }}
                                                aria-valuenow="72"
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            ></div>
                                        </div>
                                        <p className="mt-4 mb-1" style={{ fontSize: ".77rem" }}>
                                            One Page
                                        </p>
                                        <div className="progress rounded" style={{ height: "5px" }}>
                                            <div
                                                className="progress-bar"
                                                role="progressbar"
                                                style={{ width: "89%" }}
                                                aria-valuenow="89"
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            ></div>
                                        </div>
                                        <p className="mt-4 mb-1" style={{ fontSize: ".77rem" }}>
                                            Mobile Template
                                        </p>
                                        <div className="progress rounded" style={{ height: "5px" }}>
                                            <div
                                                className="progress-bar"
                                                role="progressbar"
                                                style={{ width: "55%" }}
                                                aria-valuenow="55"
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            ></div>
                                        </div>
                                        <p className="mt-4 mb-1" style={{ fontSize: ".77rem" }}>
                                            Backend API
                                        </p>
                                        <div className="progress rounded mb-2" style={{ height: "5px" }}>
                                            <div
                                                className="progress-bar"
                                                role="progressbar"
                                                style={{ width: "66%" }}
                                                aria-valuenow="66"
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 모달 기본 폼 */}
            <div
                className="modal fade"
                id="EditForm"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                tabIndex="-1"
                aria-labelledby="staticBackdropLabel"
                ref={modalRef} // ref 연결
            >
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">정보 수정</h5>
                        </div>
                        <div className="modal-body">

                            <p>정보를 수정하기위해 비밀번호 입력:</p>
                            <div className="form-floating">
                                <input
                                    type="password"
                                    value={checkPw}
                                    onChange={(e) => setCheckPw(e.target.value)}
                                    className="form-control"
                                    id="floatingPassword" placeholder="Password"
                                />
                                <label htmlFor="floatingPassword">비밀번호</label>
                            </div>
                        </div>
                        <div className="modal-footer d-flex">
                            <button
                                type="button"
                                className="btn btn-secondary flex-fill me-1" // 오른쪽 여백 추가
                                data-bs-dismiss="modal"
                                onClick={e => setCheckPw('')}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary flex-fill ms-1" // 왼쪽 여백 추가
                                data-bs-dismiss="modal"
                                onClick={saveEdit}
                            >
                                Confirm
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </section>

    );
};

export default MyPage;
