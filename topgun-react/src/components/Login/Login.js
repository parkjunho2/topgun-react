import { useCallback, useState } from 'react';
import axios from 'axios'; // Axios import
import { FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import { MdAirlines, MdEmail, MdLock } from 'react-icons/md';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { IoCalendar, IoCall } from "react-icons/io5";
import './Login.css'; // 스타일을 위한 CSS 파일
import { NavLink, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { userState } from '../../util/recoil';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { debounce } from 'lodash';

const Login = () => {

    // 정규식: 숫자와 특수 문자, 대문자 한개 이상이 포함된 패턴
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$])(?=.*[A-Z]).{8,}$/;

    //
    const idRegex = /^[a-z][a-z0-9]{4,19}$/;

    // 이름은 2자 이상, 7자 이하이며, 한글만 허용
    const nameRegex = /^[가-힣]{2,7}$/;

    // 영문 이름은 2~10자 이내이며, 띄어쓰기가 포함된 First, Last Name 형식
    const nameEngRegex = /^(?=.*[a-zA-Z])([a-zA-Z\s]{2,10})$/;

    // 전화번호 
    const contactRegex = /^010[1-9][0-9]{6,7}$/;

    // 이메일 정규 표현식
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    //navigate
    const navigate = useNavigate();

    //recoil state
    const [, setUser] = useRecoilState(userState);

    // State
    // 비밀번호 재검증시 사용할 state
    const [pwCheck, setPwCheck] = useState('');

    const [isDuplicate, setIsDuplicate] = useState(false); // 중복 여부 상태 추가

    // 로그인 상태 관리
    const [loginData, setLoginData] = useState({
        usersId: '',
        usersPw: '',
        rememberMe: false,
    });

    // 회원가입 모달 상태 관리
    const [userType, setUserType] = useState('MEMBER'); // 기본값은 회원

    // 가입시 사용할 상태 관리
    const [joinData, setJoinData] = useState({
        usersId: '',
        usersPassword: '',
        usersName: '',
        usersEmail: '',
        usersContact: '',
        usersType: '',
        //회원이라면
        memberEngName: '',
        memberBirth: null,
        memberGender: '',
        //항공사라면
        airlineName: '',
        airlineNo: '',
    });

    // 유효성 검사 상태 관리
    const [validation, setValidation] = useState({
        usersIdValid: null,
        usersPasswordValid: null,
        passwordMatch: null,
        memberNameValid: null,
        memberEngNameValid: null,
        usersContactValid: null,
        usersEmailValid: null,
        memberGenderValid: null,
        memberBirthValid: null, // 초기값을 null로 설정
        // airlineIdValid: null,
        // airlineNameValid: null,
    });

    const CheckDuplicateUserId = useCallback(
        debounce(async (userId) => {
            console.log(userId); // userId 확인
            try {
                const response = await axios.post('http://localhost:8080/users/checkId', null, {
                    params: { userId: userId } // 쿼리 파라미터로 전달
                });
                console.log(response.data); // 서버 응답 확인
                setIsDuplicate(response.data); // 중복 여부 상태 업데이트
            } catch (error) {
                console.error("Error checking user ID:", error); // 에러 처리
                setIsDuplicate(true); // 오류 발생 시 중복으로 간주
            }
        }, 200), // 200ms 후에 실행
        [] // 의존성 배열 비워두기
    );

    // 개별 입력의 유효성 검사 함수
    // 아이디
    const validateUserId = (id) => {
        return id.trim() !== '' && idRegex.test(id);
    };

    const validateContact = (contact) => {
        return contact.trim() !== '' && contactRegex.test(contact);
    }

    const validatePassword = (password) => {
        return password.trim() !== '' && passwordRegex.test(password);
    };

    // 이름 유효성 검사 함수
    const validateName = (name) => {
        return nameRegex.test(name);
    };

    // 영문 이름 유효성 검사 함수
    const validateEngName = (engName) => {
        return nameEngRegex.test(engName);
    };

    // 이메일 유효성 검사 함수
    const validateEmail = (emailId, domain) => {
        const fullEmail = `${emailId}@${domain}`;
        setValidation(prev => ({
            ...prev,
            usersEmailValid: emailPattern.test(fullEmail), // 전체 이메일 형식 검사
        }));
    };

    // 기본적으로 필수 필드 유효성 검사
    const isBasicValid = validation.usersIdValid &&
        !isDuplicate &&
        validation.usersPasswordValid &&
        validation.passwordMatch;

    // useCallback
    // Handler
    const InputJoinChange = useCallback(e => {
        setJoinData({
            ...joinData,
            [e.target.name]: e.target.value
        });
    }, [joinData]);

    // 입력값 변경 핸들러
    const InputChange = useCallback(e => {
        const { name, value, type, checked } = e.target;
        setLoginData({
            ...loginData,
            [name]: type === 'checkbox' ? checked : value,
        });
    }, [loginData]);

    // 키다운 핸들러
    const KeyDown = (e) => {
        if (e.key === 'Enter' && loginData.usersId && loginData.usersPw) {
            Login();
        }
    };


    // Callback
    // 로그인 요청 함수
    const Login = useCallback(async () => {
        try {
            const resp = await axios.post('http://localhost:8080/users/login', loginData);

            setUser({
                userId: resp.data.usersId,
                userType: resp.data.usersType,
            });

            axios.defaults.headers.common["Authorization"]
                = "Bearer " + resp.data.accessToken;

            if (loginData.rememberMe === true) {//로그인 유지 체크 시
                window.localStorage.setItem("refreshToken", resp.data.refreshToken);
            }
            else {//로그인 유지 미 체크시
                window.sessionStorage.setItem("refreshToken", resp.data.refreshToken);
            }

            console.log('로그인 성공:', resp.data);
            navigate('/');
        } catch (error) {
            console.error('로그인 오류:', error);
        }
    }, [loginData, navigate, setUser]);


    // 비밀번호 표시 상태 관리
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    // 비밀번호 재확인 상태 관리
    const [showPasswordRe, setShowPasswordRe] = useState(false);
    const togglePasswordCheckVisibility = () => {
        setShowPasswordRe((prev) => !prev);
    };

    //멀티페이징
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = 2; // 페이지 수 (페이지 인덱스는 0부터 시작)

    const handleNext = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
    };

    const handlePrev = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
    };



    // 프로그레스 바 계산 함수 추가
    const calculateProgress = () => {
        if (userType === 'MEMBER') {
            return ((currentPage + 1) / totalPages) * 100;
        } else if (userType === 'AIRLINE') {
            return ((currentPage + 1) / totalPages) * 100;
        }
        return 0;
    };

    // 이메일 ID와 도메인을 관리할 상태 생성
    const [emailId, setEmailId] = useState('');
    const [domain, setDomain] = useState('');

    // 입력값 변경 핸들러
    const handleIdChange = (e) => {
        const newEmailId = e.target.value;
        setEmailId(newEmailId);
        validateEmail(newEmailId, domain); // 이메일 유효성 검사
    };

    const handleDomainChange = (e) => {
        const newDomain = e.target.value;
        setDomain(newDomain);
        validateEmail(emailId, newDomain); // 이메일 유효성 검사
    };

    // 이메일 ID와 도메인을 합치는 함수
    const getFullEmail = () => {
        return `${emailId}@${domain}`;
    };

    // 이메일 ID와 도메인을 합쳐서 데이터를 전송하는 함수
    const sendData = useCallback(async () => {
        const fullEmail = getFullEmail();
        const dataToSend = {
            ...joinData,
            usersType: userType,
            usersEmail: fullEmail, // 합쳐진 이메일을 업데이트
        };
        try {
            const response = await axios.post("http://localhost:8080/users/join", dataToSend);
            console.log(response.data); // 서버로부터 받은 응답 데이터 출력
        } catch (error) {
            console.error("Error occurred while joining:", error); // 에러 처리
        }
    }, [emailId, domain, joinData, userType]); // 의존성 배열

    // JSX
    return (
        <>
            <div className="container-fluid h-custom mt-5">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-md-9 col-lg-6 col-xl-5">
                        {/* 샘플 이미지 나중에 이미지 수정 필요 */}
                        <img
                            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
                            className="img-fluid"
                            alt="Sample"
                        />
                    </div>
                    <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
                        <div className="d-flex flex-row align-items-center justify-content-center justify-content-lg-start">
                            <p className="lead fw-normal mb-0 me-3">Sign in with</p>
                            <button type="button" className="btn btn-primary mx-1">
                                <FaFacebookF />
                            </button>
                            <button type="button" className="btn btn-primary mx-1">
                                <FaTwitter />
                            </button>
                            <button type="button" className="btn btn-primary mx-1">
                                <FaLinkedinIn />
                            </button>
                        </div>
                        <div className="divider d-flex align-items-center my-4">
                            <p className="text-center fw-bold mx-3 mb-0">Or</p>
                        </div>

                        <div className="form-floating form-outline mb-3">
                            <input
                                name="usersId"
                                type="text"
                                id="formId"
                                className="form-control form-control-lg"
                                placeholder="아이디" // 안쓰지만 써야함
                                value={loginData.usersId}
                                onChange={InputChange}
                                onKeyDown={KeyDown}
                                required
                            />
                            <label className="form-label" htmlFor="formId">
                                <MdEmail /> 아이디
                            </label>
                        </div>

                        <div className="form-floating form-outline mb-3">
                            <input
                                name="usersPw"
                                type='password'
                                id="formPassword"
                                className="form-control form-control-lg"
                                placeholder="비밀번호" // 안쓰지만 써야함
                                value={loginData.usersPw}
                                onChange={InputChange}
                                onKeyDown={KeyDown}
                                required
                            />
                            <label className="form-label" htmlFor="formPassword">
                                <MdLock /> 비밀번호
                            </label>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="form-check mb-0">
                                <input
                                    name="rememberMe"
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    id="formRemember"
                                    checked={loginData.rememberMe}
                                    onChange={InputChange}
                                />
                                <label className="form-check-label" htmlFor="formRemember">Remember me</label>
                            </div>
                            <NavLink to="/findPw" className="text-body">Forgot password?</NavLink>
                        </div>

                        <div className="text-center text-lg-start mt-4 pt-2 mb-0">
                            <button
                                type="button"
                                className="btn btn-primary btn-lg"
                                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                onClick={Login}
                            >
                                로그인
                            </button>
                            <p className="small fw-bold mt-2 pt-1 mb-0">
                                Don't have an account? <NavLink className="link-danger" data-bs-toggle="modal" data-bs-target="#JoinForm" onClick={(e) => {
                                    e.preventDefault(); // 기본 동작 방지
                                }}>Register</NavLink>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 모달 */}
            <div className="modal fade" id="JoinForm" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        {/* 헤더 */}
                        <div className="modal-header">
                            <h5 className="modal-title" id="staticBackdropLabel">회원 가입</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                                onClick={() => {
                                    setJoinData({
                                        usersId: '',
                                        usersPassword: '',
                                        usersName: '',
                                        usersEmail: '',
                                        usersContact: '',
                                        usersType: '', // 새로 설정된 userType을 joinData에 반영
                                        //회원이라면
                                        memberEngName: '',
                                        memberBirth: '',
                                        memberGender: '',
                                        //항공사라면
                                        airlineName: '',
                                        airlineNo: '',
                                    });
                                    setValidation({
                                        usersIdValid: null,
                                        usersPasswordValid: null,
                                        passwordMatch: null,
                                        memberNameValid: null,
                                        memberEngNameValid: null,
                                        usersContactValid: null,
                                        usersEmailValid: null,
                                        memberGenderValid: null,
                                        memberBirthValid: null, // 초기값을 null로 설정
                                        airlineIdValid: null,
                                        airlineNameValid: null,
                                    });
                                    setCurrentPage(0); // 변경 사항: 유저 타입 변경 시 페이지 초기화
                                    setEmailId('');
                                    setDomain('');
                                }}
                            />
                        </div>

                        {/* 유저 타입 선택 */}
                        <div className="d-flex justify-content-center mt-3">
                            <div className="form-check me-3">
                                <input
                                    className="form-check-input"
                                    type="radio" id="MemberForm"
                                    name="userType"
                                    value="MEMBER"
                                    checked={userType === 'MEMBER'}
                                    onChange={() => {
                                        setUserType('MEMBER');
                                        // joinData의 usersType도 업데이트
                                        setJoinData(() => ({
                                            usersId: '',
                                            usersPassword: '',
                                            usersName: '',
                                            usersEmail: '',
                                            usersContact: '',
                                            usersType: 'MEMBER', // 새로 설정된 userType을 joinData에 반영
                                            //회원이라면
                                            memberEngName: '',
                                            memberBirth: '',
                                            memberGender: '',
                                            //항공사라면
                                            airlineName: '',
                                            airlineNo: '',
                                        }));
                                        setPwCheck('');
                                        setValidation({
                                            usersIdValid: null,
                                            usersPasswordValid: null,
                                            passwordMatch: null,
                                            memberNameValid: null,
                                            memberEngNameValid: null,
                                            usersContactValid: null,
                                            usersEmailValid: null,
                                            memberGenderValid: null,
                                            memberBirthValid: null, // 초기값을 null로 설정
                                            airlineIdValid: null,
                                            airlineNameValid: null,
                                        });
                                        setCurrentPage(0); // 변경 사항: 유저 타입 변경 시 페이지 초기화
                                        setEmailId('');
                                        setDomain('');
                                    }} />
                                <label className="form-check-label" htmlFor="MemberForm">회원</label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    id="AirLineForm"
                                    name="userType"
                                    value="AIRLINE"
                                    checked={userType === 'AIRLINE'}
                                    onChange={() => {
                                        setUserType('AIRLINE');
                                        // joinData의 usersType도 업데이트
                                        setJoinData(() => ({
                                            usersId: '',
                                            usersPassword: '',
                                            usersName: '',
                                            usersEmail: '',
                                            usersContact: '',
                                            usersType: 'AIRLINE', // 새로 설정된 userType을 joinData에 반영
                                            //회원이라면
                                            memberEngName: '',
                                            memberBirth: '',
                                            memberGender: '',
                                            //항공사라면
                                            airlineName: '',
                                            airlineNo: '',
                                        }));
                                        setPwCheck('');
                                        setValidation({
                                            usersIdValid: null,
                                            usersPasswordValid: null,
                                            passwordMatch: null,
                                            memberNameValid: null,
                                            memberEngNameValid: null,
                                            usersContactValid: null,
                                            usersEmailValid: null,
                                            memberGenderValid: null,
                                            memberBirthValid: null, // 초기값을 null로 설정
                                            airlineIdValid: null,
                                            airlineNameValid: null,
                                        });
                                        setCurrentPage(0); // 변경 사항: 유저 타입 변경 시 페이지 초기화
                                        setEmailId('');
                                        setDomain('');
                                    }}
                                />
                                <label className="form-check-label" htmlFor="AirLineForm">항공사</label>
                            </div>
                        </div>

                        {/* 바디 전환 */}
                        <div className="modal-body">

                            {userType === 'MEMBER' ? (
                                <div className='shadow-sm p-3 bg-body rounded border'>

                                    {/* 프로그레스 바 추가 */}
                                    <div className="progress my-3"> {/* 변경 사항: 프로그레스 바 컨테이너 추가 */}
                                        <div
                                            className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                                            role="progressbar"
                                            style={{ width: `${calculateProgress()}%` }} // 변경 사항: 프로그레스 바 너비 설정
                                            aria-valuenow={calculateProgress()}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                        >
                                        </div>
                                    </div>

                                    {/* 페이지 1 */}
                                    <div className={`page ${currentPage !== 0 ? 'd-none' : ''}`}> {/* 변경 사항: currentPage에 따라 클래스 적용 */}

                                        <big>아이디</big>
                                        <div className="input-group has-validation">
                                            <span className="input-group-text">ID</span>
                                            <div className={`form-floating ${isDuplicate || (validation.usersIdValid === false) ? 'is-invalid' : (validation.usersIdValid ? 'is-valid' : '')}`}>
                                                <input
                                                    type="text"
                                                    className={`form-control ${isDuplicate || (validation.usersIdValid === false) ? 'is-invalid' : (validation.usersIdValid ? 'is-valid' : '')}`}
                                                    placeholder="아이디"
                                                    name="usersId"
                                                    value={joinData.usersId}
                                                    onChange={e => {
                                                        InputJoinChange(e);
                                                    }}
                                                    onInput={e => {
                                                        const userId = e.target.value; // 현재 입력된 값을 가져옴

                                                        // 빈 문자열 체크
                                                        if (userId.trim() === '') {
                                                            setValidation(prev => ({
                                                                ...prev,
                                                                usersIdValid: null, // 유효성 초기화
                                                            }));
                                                            setIsDuplicate(false); // 중복 여부 초기화
                                                            return; // 더 이상 진행하지 않음
                                                        }

                                                        InputJoinChange(e); // 입력 변경 함수 호출
                                                        const isValid = validateUserId(userId); // 개별 유효성 검사
                                                        setValidation(prev => ({
                                                            ...prev,
                                                            usersIdValid: isValid,
                                                        }));

                                                        CheckDuplicateUserId(userId); // 현재 입력된 값으로 중복 검사
                                                    }}
                                                    id="floatingUserId" // 아이디 추가
                                                />
                                                <label htmlFor="floatingUserId">아이디</label>
                                            </div>
                                            {/* 유효성 검사에 따른 피드백 */}
                                            <div className={`${isDuplicate ? 'invalid-feedback' : (validation.usersIdValid ? 'valid-feedback' : 'invalid-feedback')}`}>
                                                {isDuplicate // 중복 여부 체크
                                                    ? "이미 존재하는 아이디입니다." // 중복 시 피드백
                                                    : validation.usersIdValid === true
                                                        ? "아주 멋진 아이디네요!" // 유효성 검사가 통과했을 때
                                                        : joinData.usersId.trim() === ''
                                                            ? "아이디를 입력해주세요." // 빈 입력 시 피드백
                                                            : validation.usersIdValid === false && joinData.usersId.trim() !== ''
                                                                ? "아이디 형식이 올바르지 않습니다." // 유효성 검사 실패 시 피드백
                                                                : null}
                                            </div>
                                        </div>
                                        <div className="form-text text-muted mb-4">
                                            아이디는 소문자 알파벳으로 시작하며, 4~19자 사이의 길이로 소문자와 숫자로만 구성되어야 합니다.
                                        </div>


                                        <big>패스워드</big>
                                        <div className="input-group has-validation">
                                            <span className="input-group-text">PW</span>
                                            <div className={`form-floating ${validation.usersPasswordValid !== null ? (validation.usersPasswordValid ? 'is-valid' : 'is-invalid') : ''}`}>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    className={`form-control ${validation.usersPasswordValid !== null ? (validation.usersPasswordValid ? 'is-valid' : 'is-invalid') : ''}`}
                                                    name='usersPassword'
                                                    value={joinData.usersPassword}
                                                    onChange={e => {
                                                        InputJoinChange(e); // 입력 변경 함수 호출
                                                        const isValid = validatePassword(e.target.value); // 개별 유효성 검사
                                                        setValidation(prev => ({
                                                            ...prev,
                                                            usersPasswordValid: isValid,
                                                        }));
                                                    }}
                                                    placeholder="패스워드를 입력하세요"
                                                    id="floatingPassword" // 아이디 추가
                                                />
                                                <label htmlFor="floatingPassword">패스워드</label>
                                                <span
                                                    className="position-absolute"
                                                    style={{ right: '30px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                                                    onClick={togglePasswordVisibility}
                                                >
                                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                                </span>
                                            </div>
                                            {/* 유효성 검사에 따른 피드백 */}
                                            <div className={`${validation.usersPasswordValid === true ? 'valid-feedback' : 'invalid-feedback'}`}>
                                                {validation.usersPasswordValid === true
                                                    ? "유효한 비밀번호입니다!"
                                                    : joinData.usersPassword.trim() === ''
                                                        ? "비밀번호를 입력해주세요."
                                                        : "비밀번호 형식이 올바르지 않습니다."}
                                            </div>
                                        </div>
                                        <div className="form-text text-muted mb-5">
                                            비밀번호는 최소 8자 이상이어야 하며, 숫자, 특수 문자(!, @, #, $), 그리고 대문자가 각각 하나 이상 포함되어야 합니다.
                                        </div>


                                        <big>비밀번호 재확인</big>
                                        <div className="input-group has-validation mb-5">
                                            <span className="input-group-text">PW</span>
                                            <div className={`form-floating ${validation.passwordMatch !== null ? (validation.passwordMatch ? 'is-valid' : 'is-invalid') : ''}`}>
                                                <input
                                                    type={showPasswordRe ? 'text' : 'password'}
                                                    value={pwCheck}
                                                    onChange={e => {
                                                        const value = e.target.value;
                                                        setPwCheck(value);
                                                    }}
                                                    onBlur={e => {
                                                        const value = e.target.value;
                                                        setPwCheck(value);

                                                        // 비밀번호 일치 여부 확인
                                                        const isMatch = value.trim() !== '' && joinData.usersPassword === value;
                                                        setValidation(prev => ({
                                                            ...prev,
                                                            passwordMatch: isMatch,
                                                        }));
                                                    }}
                                                    className={`form-control ${validation.passwordMatch !== null ? (validation.passwordMatch ? 'is-valid' : 'is-invalid') : ''}`}
                                                    placeholder="패스워드를 입력하세요"
                                                    id="floatingPasswordCheck" // 아이디 추가
                                                />
                                                <label htmlFor="floatingPasswordCheck">패스워드 확인</label>
                                                <span
                                                    className="position-absolute"
                                                    style={{ right: '30px', top: '50%', transform: 'translateY(-50%)' }}
                                                    onClick={togglePasswordCheckVisibility}
                                                >
                                                    {showPasswordRe ? <FiEyeOff /> : <FiEye />}
                                                </span>
                                            </div>
                                            <div className="invalid-feedback">패스워드가 일치하지 않습니다.</div>
                                        </div>
                                    </div>

                                    {/* 페이지 2 */}
                                    <div className={`page ${currentPage !== 1 ? 'd-none' : ''}`}> {/* 변경 사항: currentPage에 따라 클래스 적용 */}

                                        <big>이름</big>
                                        <div className="input-group has-validation mb-4">
                                            <span className="input-group-text">Name</span>
                                            <div className={`form-floating ${validation.memberNameValid !== null ? (validation.memberNameValid ? 'is-valid' : 'is-invalid') : ''}`}>
                                                <input
                                                    type="text"
                                                    className={`form-control ${validation.memberNameValid !== null ? (validation.memberNameValid ? 'is-valid' : 'is-invalid') : ''}`}
                                                    name="usersName"
                                                    value={joinData.usersName}
                                                    onChange={e => InputJoinChange(e)}
                                                    onBlur={e => {
                                                        // 유효성 검사
                                                        const isValid = validateName(e.target.value);
                                                        setValidation(prev => ({
                                                            ...prev,
                                                            memberNameValid: isValid,
                                                        }));
                                                    }}
                                                    placeholder="이름을 입력하세요"
                                                />
                                                <label>이름</label>
                                            </div>

                                            {/* 유효성 검사에 따른 피드백 */}
                                            <div className={validation.memberNameValid === true ? "valid-feedback" : "invalid-feedback"}>
                                                {validation.memberNameValid === true
                                                    ? "" : "이름은 2자 이상, 7자 이하의 한글만 허용됩니다."}
                                            </div>
                                        </div>

                                        <big>영문 이름</big>
                                        <div className="input-group has-validation">
                                            <span className="input-group-text">ENG</span>
                                            <div className={`form-floating ${validation.memberEngNameValid !== null ? (validation.memberEngNameValid ? 'is-valid' : 'is-invalid') : ''}`}>
                                                <input
                                                    type="text"
                                                    className={`form-control ${validation.memberEngNameValid !== null ? (validation.memberEngNameValid ? 'is-valid' : 'is-invalid') : ''}`}
                                                    name="memberEngName"
                                                    value={joinData.memberEngName}
                                                    onChange={e => InputJoinChange(e)}
                                                    onBlur={e => {
                                                        // 유효성 검사
                                                        const isValid = validateEngName(e.target.value);
                                                        setValidation(prev => ({
                                                            ...prev,
                                                            memberEngNameValid: isValid,
                                                        }));
                                                    }}
                                                    placeholder="Eng Name"
                                                />
                                                <label>영문 이름</label>
                                            </div>
                                            {/* 유효성 검사에 따른 피드백 */}
                                            <div className={validation.memberEngNameValid === true ? "valid-feedback" : "invalid-feedback"}>
                                                {validation.memberEngNameValid === true
                                                    ? ""
                                                    : joinData.memberEngName === ''
                                                        ? "영문 이름을 입력하세요."
                                                        : "영문 이름 형식이 올바르지 않습니다."}
                                            </div>
                                        </div>
                                        <div className="form-text text-muted mb-4">
                                            영문 이름은 2~10자 이내의 영어만 허용되며 First LastName 형식만 허용됩니다.
                                        </div>

                                        <big>전화 번호</big>
                                        <div className="input-group has-validation">
                                            <span className="input-group-text"><IoCall /></span>
                                            <div className={`form-floating ${validation.usersContactValid === true ? 'is-valid' : validation.usersContactValid === false ? 'is-invalid' : ''}`}>
                                                <input
                                                    type="tel"
                                                    className={`form-control ${validation.usersContactValid === true ? 'is-valid' : validation.usersContactValid === false ? 'is-invalid' : ''}`} // 유효성 검사에 따른 클래스
                                                    name="usersContact"
                                                    value={joinData.usersContact}
                                                    onChange={e => {
                                                        InputJoinChange(e);
                                                    }}
                                                    onBlur={e => {
                                                        const isValid = validateContact(e.target.value); // 전화번호 유효성 검사
                                                        setValidation(prev => ({
                                                            ...prev,
                                                            usersContactValid: isValid,
                                                        }));
                                                    }}
                                                    placeholder="전화 번호"
                                                />
                                                <label>전화 번호</label>
                                            </div>

                                            {/* 유효성 검사에 따른 피드백 */}
                                            <div className={validation.usersContactValid === true ? "valid-feedback" : "invalid-feedback"}>
                                                {validation.usersContactValid === true
                                                    ? "전화번호가 유효합니다!"
                                                    : joinData.usersContact.trim() === ''
                                                        ? "전화번호를 입력해주세요."
                                                        : "전화번호 형식이 올바르지 않습니다."}
                                            </div>
                                        </div>
                                        <div className="form-text text-muted mb-3">
                                            ex : 01012345678
                                        </div>

                                        <big>생년월일</big>
                                        <div className="mb-3 py-1">
                                            <label htmlFor="datePicker" className="form-label">
                                                <IoCalendar className="me-2" /> {/* 아이콘 간격 조정 */}
                                            </label>
                                            <DatePicker
                                                id="datePicker"
                                                selected={joinData.memberBirth}
                                                onChange={(date) => {
                                                    setJoinData(prev => ({
                                                        ...prev,
                                                        memberBirth: date
                                                    }));
                                                    setValidation(prev => ({
                                                        ...prev,
                                                        memberBirthValid: date ? true : false,
                                                    }));
                                                }}
                                                maxDate={new Date()}
                                                className={`form-control ${validation.memberBirthValid ? 'is-valid' : validation.memberBirthValid === false ? 'is-invalid' : ''}`}
                                                placeholderText="생일을 선택하세요"
                                                wrapperClassName="date-picker" // 스타일링을 위해 wrapperClassName 추가
                                            />
                                            <div className="valid-feedback"></div>
                                            <div className="invalid-feedback">
                                                {validation.memberBirthValid === false ? "유효한 생일을 선택하세요." : ""}
                                            </div>
                                        </div>

                                        <big>성별</big>
                                        <div className='mb-3'>
                                            <div className="form-check form-check-inline">
                                                <input
                                                    className={`form-check-input ${validation.memberGenderValid === false ? 'is-invalid' : ''}`}
                                                    type="radio"
                                                    name="memberGender"
                                                    id="inlineRadio1"
                                                    value="M"
                                                    onChange={(e) => {
                                                        setJoinData(prev => ({
                                                            ...prev,
                                                            memberGender: e.target.value,
                                                        }));

                                                        // 유효성 검사: 선택된 값이 있을 때 valid로 설정
                                                        setValidation(prev => ({
                                                            ...prev,
                                                            memberGenderValid: e.target.value ? true : false,
                                                        }));
                                                    }}
                                                    checked={joinData.memberGender === 'M'}
                                                />
                                                <label className="form-check-label" htmlFor="inlineRadio1">남자</label>
                                            </div>
                                            <div className="form-check form-check-inline">
                                                <input
                                                    className={`form-check-input ${validation.memberGenderValid === false ? 'is-invalid' : ''}`}
                                                    type="radio"
                                                    name="memberGender"
                                                    id="inlineRadio2"
                                                    value="F"
                                                    onChange={(e) => {
                                                        setJoinData(prev => ({
                                                            ...prev,
                                                            memberGender: e.target.value,
                                                        }));

                                                        // 유효성 검사: 선택된 값이 있을 때 valid로 설정
                                                        setValidation(prev => ({
                                                            ...prev,
                                                            memberGenderValid: e.target.value ? true : false,
                                                        }));
                                                    }}
                                                    checked={joinData.memberGender === 'F'}
                                                />
                                                <label className="form-check-label" htmlFor="inlineRadio2">여자</label>
                                            </div>
                                            {/* 유효성 검사 피드백 */}
                                            <div className="invalid-feedback">
                                                {validation.memberGenderValid === false ? "성별을 선택하세요." : ""}
                                            </div>
                                        </div>


                                        <big>이메일</big>
                                        <div className="input-group mb-4" style={{ width: '80%' }}>
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className={`form-control ${validation.usersEmailValid === false && emailId ? 'is-invalid' : validation.usersEmailValid ? 'is-valid' : ''}`}
                                                    placeholder="이메일을 입력하세요"
                                                    value={emailId}
                                                    onChange={handleIdChange}
                                                    required
                                                />
                                                <label>ID</label>
                                            </div>
                                            <span className="input-group-text">@</span>
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className={`form-control ${validation.usersEmailValid === false && domain ? 'is-invalid' : validation.usersEmailValid ? 'is-valid' : ''}`}
                                                    placeholder="도메인"
                                                    value={domain}
                                                    onChange={handleDomainChange}
                                                    required
                                                />
                                                <label>Domain</label>
                                            </div>
                                        </div>
                                        {validation.usersEmailValid === false && (
                                            <div className="invalid-feedback" style={{ display: 'block' }}>
                                                유효한 이메일 형식을 입력하세요.
                                            </div>
                                        )}


                                    </div>

                                    {/* 네비게이션 버튼 (회원인 경우) */}
                                    <div className="row mt-3">
                                        <div className="col text-start">
                                            <button
                                                className='btn btn-secondary'
                                                onClick={handlePrev}
                                                disabled={currentPage === 0}
                                            >
                                                이전
                                            </button>
                                        </div>
                                        <div className="col text-end">
                                            <button
                                                className='btn btn-primary'
                                                onClick={handleNext}
                                                disabled={currentPage === totalPages - 1 || !isBasicValid}
                                            >
                                                다음
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div className='shadow-sm p-3 bg-body rounded border'>

                                    {/* 프로그레스 바 추가 */}
                                    <div className="progress my-3"> {/* 변경 사항: 프로그레스 바 컨테이너 추가 */}
                                        <div
                                            className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                                            role="progressbar"
                                            style={{ width: `${calculateProgress()}%` }} // 변경 사항: 프로그레스 바 너비 설정
                                            aria-valuenow={calculateProgress()}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                        >
                                        </div>
                                    </div>



                                    {/* 페이지 1 */}
                                    <div className={`page ${currentPage !== 0 ? 'd-none' : ''}`}> {/* 변경 사항: currentPage에 따라 클래스 적용 */}

                                        <big>아이디</big>
                                        <div className="input-group has-validation">
                                            <span className="input-group-text">ID</span>
                                            <div className={`form-floating ${isDuplicate || (validation.usersIdValid === false) ? 'is-invalid' : (validation.usersIdValid ? 'is-valid' : '')}`}>
                                                <input
                                                    type="text"
                                                    className={`form-control ${isDuplicate || (validation.usersIdValid === false) ? 'is-invalid' : (validation.usersIdValid ? 'is-valid' : '')}`}
                                                    placeholder="아이디"
                                                    name="usersId"
                                                    value={joinData.usersId}
                                                    onChange={e => {
                                                        InputJoinChange(e);
                                                    }}
                                                    onInput={e => {
                                                        const userId = e.target.value; // 현재 입력된 값을 가져옴

                                                        // 빈 문자열 체크
                                                        if (userId.trim() === '') {
                                                            setValidation(prev => ({
                                                                ...prev,
                                                                usersIdValid: null, // 유효성 초기화
                                                            }));
                                                            setIsDuplicate(false); // 중복 여부 초기화
                                                            return; // 더 이상 진행하지 않음
                                                        }

                                                        InputJoinChange(e); // 입력 변경 함수 호출
                                                        const isValid = validateUserId(userId); // 개별 유효성 검사
                                                        setValidation(prev => ({
                                                            ...prev,
                                                            usersIdValid: isValid,
                                                        }));

                                                        CheckDuplicateUserId(userId); // 현재 입력된 값으로 중복 검사
                                                    }}
                                                    id="floatingUserId" // 아이디 추가
                                                />
                                                <label htmlFor="floatingUserId">아이디</label>
                                            </div>
                                            {/* 유효성 검사에 따른 피드백 */}
                                            <div className={`${isDuplicate ? 'invalid-feedback' : (validation.usersIdValid ? 'valid-feedback' : 'invalid-feedback')}`}>
                                                {isDuplicate // 중복 여부 체크
                                                    ? "이미 존재하는 아이디입니다." // 중복 시 피드백
                                                    : validation.usersIdValid === true
                                                        ? "아주 멋진 아이디네요!" // 유효성 검사가 통과했을 때
                                                        : joinData.usersId.trim() === ''
                                                            ? "아이디를 입력해주세요." // 빈 입력 시 피드백
                                                            : validation.usersIdValid === false && joinData.usersId.trim() !== ''
                                                                ? "아이디 형식이 올바르지 않습니다." // 유효성 검사 실패 시 피드백
                                                                : null}
                                            </div>
                                        </div>
                                        <div className="form-text text-muted mb-4">
                                            아이디는 소문자 알파벳으로 시작하며, 4~19자 사이의 길이로 소문자와 숫자로만 구성되어야 합니다.
                                        </div>

                                        <big>패스워드</big>
                                        <div className="input-group has-validation">
                                            <span className="input-group-text">PW</span>
                                            <div className={`form-floating ${validation.usersPasswordValid !== null ? (validation.usersPasswordValid ? 'is-valid' : 'is-invalid') : ''}`}>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    className={`form-control ${validation.usersPasswordValid !== null ? (validation.usersPasswordValid ? 'is-valid' : 'is-invalid') : ''}`}
                                                    name='usersPassword'
                                                    value={joinData.usersPassword}
                                                    onChange={e => {
                                                        InputJoinChange(e); // 입력 변경 함수 호출
                                                        const isValid = validatePassword(e.target.value); // 개별 유효성 검사
                                                        setValidation(prev => ({
                                                            ...prev,
                                                            usersPasswordValid: isValid,
                                                        }));
                                                    }}
                                                    placeholder="패스워드를 입력하세요"
                                                    id="floatingPassword" // 아이디 추가
                                                />
                                                <label htmlFor="floatingPassword">패스워드</label>
                                                <span
                                                    className="position-absolute"
                                                    style={{ right: '30px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                                                    onClick={togglePasswordVisibility}
                                                >
                                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                                </span>
                                            </div>
                                            {/* 유효성 검사에 따른 피드백 */}
                                            <div className={`${validation.usersPasswordValid === true ? 'valid-feedback' : 'invalid-feedback'}`}>
                                                {validation.usersPasswordValid === true
                                                    ? "유효한 비밀번호입니다!"
                                                    : joinData.usersPassword.trim() === ''
                                                        ? "비밀번호를 입력해주세요."
                                                        : "비밀번호 형식이 올바르지 않습니다."}
                                            </div>
                                        </div>
                                        <div className="form-text text-muted mb-5">
                                            비밀번호는 최소 8자 이상이어야 하며, 숫자, 특수 문자(!, @, #, $), 그리고 대문자가 각각 하나 이상 포함되어야 합니다.
                                        </div>

                                        <big>비밀번호 재확인</big>
                                        <div className="input-group has-validation mb-5">
                                            <span className="input-group-text">PW</span>
                                            <div className={`form-floating ${validation.passwordMatch !== null ? (validation.passwordMatch ? 'is-valid' : 'is-invalid') : ''}`}>
                                                <input
                                                    type={showPasswordRe ? 'text' : 'password'}
                                                    value={pwCheck}
                                                    onChange={e => {
                                                        const value = e.target.value;
                                                        setPwCheck(value);
                                                    }}
                                                    onBlur={e => {
                                                        const value = e.target.value;
                                                        setPwCheck(value);

                                                        // 비밀번호 일치 여부 확인
                                                        const isMatch = value.trim() !== '' && joinData.usersPassword === value;
                                                        setValidation(prev => ({
                                                            ...prev,
                                                            passwordMatch: isMatch,
                                                        }));
                                                    }}
                                                    className={`form-control ${validation.passwordMatch !== null ? (validation.passwordMatch ? 'is-valid' : 'is-invalid') : ''}`}
                                                    placeholder="패스워드를 입력하세요"
                                                    id="floatingPasswordCheck" // 아이디 추가
                                                />
                                                <label htmlFor="floatingPasswordCheck">패스워드 확인</label>
                                                <span
                                                    className="position-absolute"
                                                    style={{ right: '30px', top: '50%', transform: 'translateY(-50%)' }}
                                                    onClick={togglePasswordCheckVisibility}
                                                >
                                                    {showPasswordRe ? <FiEyeOff /> : <FiEye />}
                                                </span>
                                            </div>
                                            <div className="invalid-feedback">패스워드가 일치하지 않습니다.</div>
                                        </div>
                                    </div>



                                    {/* 페이지 2 */}
                                    <div className={`page ${currentPage !== 1 ? 'd-none' : ''}`}> {/* 변경 사항: currentPage에 따라 클래스 적용 */}

                                        <big>이름</big>
                                        <div className="input-group has-validation mb-4">
                                            <span className="input-group-text">Name</span>
                                            <div className={`form-floating ${validation.memberNameValid !== null ? (validation.memberNameValid ? 'is-valid' : 'is-invalid') : ''}`}>
                                                <input
                                                    type="text"
                                                    className={`form-control ${validation.memberNameValid !== null ? (validation.memberNameValid ? 'is-valid' : 'is-invalid') : ''}`}
                                                    name="usersName"
                                                    value={joinData.usersName}
                                                    onChange={e => InputJoinChange(e)}
                                                    onBlur={e => {
                                                        // 유효성 검사
                                                        const isValid = validateName(e.target.value);
                                                        setValidation(prev => ({
                                                            ...prev,
                                                            memberNameValid: isValid,
                                                        }));
                                                    }}
                                                    placeholder="이름을 입력하세요"
                                                />
                                                <label>이름</label>
                                            </div>

                                            {/* 유효성 검사에 따른 피드백 */}
                                            <div className={validation.memberNameValid === true ? "valid-feedback" : "invalid-feedback"}>
                                                {validation.memberNameValid === true
                                                    ? "" : "이름은 2자 이상, 7자 이하의 한글만 허용됩니다."}
                                            </div>
                                        </div>

                                        <big>항공사 이름</big>
                                        <div className="input-group mb-4">
                                            <span className="input-group-text">Name</span>
                                            <div className="form-floating">
                                                <input type="text"
                                                    className="form-control"
                                                    placeholder="Airline Name"
                                                    value={joinData.airlineName}
                                                    onChange={e => InputJoinChange(e)}
                                                    name="airlineName"
                                                />
                                                <label>Airline Name</label>
                                            </div>
                                        </div>

                                        <big>항공사 번호</big>
                                        <div className="input-group mb-4">
                                            <span className="input-group-text"><MdAirlines /></span>
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Airline No"
                                                    value={joinData.airlineNo}
                                                    name="airlineNo"
                                                    onChange={e => InputJoinChange(e)}
                                                    onKeyDown={(e) => {
                                                        // 숫자(0-9)와 백스페이스, 화살표 키, Delete 키만 허용
                                                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Delete') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onInput={e => {
                                                        // 현재 입력된 값을 가져와 숫자가 아닌 경우 필터링
                                                        const value = e.target.value;
                                                        const filteredValue = value.replace(/[^0-9]/g, ''); // 숫자가 아닌 문자를 제거
                                                        if (value !== filteredValue) {
                                                            InputJoinChange({ target: { name: 'airlineNo', value: filteredValue } });
                                                        }
                                                    }}
                                                />
                                                <label>Airline Number</label>
                                            </div>
                                        </div>


                                        <big>전화 번호</big>
                                        <div className="input-group has-validation">
                                            <span className="input-group-text"><IoCall /></span>
                                            <div className={`form-floating ${validation.usersContactValid === true ? 'is-valid' : validation.usersContactValid === false ? 'is-invalid' : ''}`}>
                                                <input
                                                    type="tel"
                                                    className={`form-control ${validation.usersContactValid === true ? 'is-valid' : validation.usersContactValid === false ? 'is-invalid' : ''}`} // 유효성 검사에 따른 클래스
                                                    name="usersContact"
                                                    value={joinData.usersContact}
                                                    onChange={e => {
                                                        InputJoinChange(e);
                                                    }}
                                                    onBlur={e => {
                                                        const isValid = validateContact(e.target.value); // 전화번호 유효성 검사
                                                        setValidation(prev => ({
                                                            ...prev,
                                                            usersContactValid: isValid,
                                                        }));
                                                    }}
                                                    placeholder="전화 번호"
                                                />
                                                <label>전화 번호</label>
                                            </div>

                                            {/* 유효성 검사에 따른 피드백 */}
                                            <div className={validation.usersContactValid === true ? "valid-feedback" : "invalid-feedback"}>
                                                {validation.usersContactValid === true
                                                    ? "전화번호가 유효합니다!"
                                                    : joinData.usersContact.trim() === ''
                                                        ? "전화번호를 입력해주세요."
                                                        : "전화번호 형식이 올바르지 않습니다."}
                                            </div>
                                        </div>
                                        <div className="form-text text-muted mb-3">
                                            ex : 01012345678
                                        </div>

                                        <big>이메일</big>
                                        <div className="input-group mb-4" style={{ width: '90%' }}>
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className={`form-control ${validation.usersEmailValid === false && emailId ? 'is-invalid' : validation.usersEmailValid ? 'is-valid' : ''}`}
                                                    placeholder="이메일을 입력하세요"
                                                    value={emailId}
                                                    onChange={handleIdChange}
                                                    required
                                                />
                                                <label>ID</label>
                                            </div>
                                            <span className="input-group-text">@</span>
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className={`form-control ${validation.usersEmailValid === false && domain ? 'is-invalid' : validation.usersEmailValid ? 'is-valid' : ''}`}
                                                    placeholder="도메인"
                                                    value={domain}
                                                    onChange={handleDomainChange}
                                                    required
                                                />
                                                <label>Domain</label>
                                            </div>
                                        </div>
                                        {validation.usersEmailValid === false && (
                                            <div className="invalid-feedback" style={{ display: 'block' }}>
                                                유효한 이메일 형식을 입력하세요.
                                            </div>
                                        )}




                                    </div>

                                    {/* 네비게이션 버튼 (회원인 경우) */}
                                    <div className="row mt-3">
                                        <div className="col text-start">
                                            <button
                                                className='btn btn-secondary'
                                                onClick={handlePrev}
                                                disabled={currentPage === 0}
                                            >
                                                이전
                                            </button>
                                        </div>
                                        <div className="col text-end">
                                            <button
                                                className='btn btn-primary'
                                                onClick={handleNext}
                                                disabled={currentPage === totalPages - 1 || !isBasicValid}
                                            >
                                                다음
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={() => {
                                if (userType === 'MEMBER') {
                                    // 제외할 변수들
                                    const excludedKeys = ['airlineIdValid', 'airlineNameValid'];

                                    // 모든 유효성 검사 상태가 true인지 확인 (제외할 변수 포함)
                                    const isAllValid = Object.entries(validation)
                                        .filter(([key]) => !excludedKeys.includes(key)) // 제외할 변수
                                        .every(([, value]) => value === true);

                                    if (isAllValid) {
                                        sendData(); // 모든 필드가 유효할 경우 데이터 전송
                                        alert("MEMBER 타입의 가입 요청을 처리합니다!");

                                    } else {
                                        alert("유효하지 않은 필드가 있습니다. 확인해 주세요.");
                                    }
                                }
                                else if (userType === 'AIRLINE') {
                                    // 제외할 변수들
                                    const excludedKeys = ['memberGenderValid', 'memberBirthValid', 'memberNameValid', 'memberEngNameValid', 'airlineIdValid', 'airlineNameValid'];

                                    // 모든 유효성 검사 상태가 true인지 확인 (제외할 변수 포함)
                                    const isAllValid = Object.entries(validation)
                                        .filter(([key]) => !excludedKeys.includes(key)) // 제외할 변수
                                        .every(([, value]) => value === true);

                                    if (isAllValid) {
                                        sendData(); // 모든 필드가 유효할 경우 데이터 전송
                                        alert("AIRLINE 타입의 가입 요청을 처리합니다!");

                                    } else {
                                        alert("유효하지 않은 필드가 있습니다. 확인해 주세요.");
                                    }
                                } else {
                                    alert("전송이 유효하지 않습니다 다시 확인해 주세요");
                                }
                            }}>가입하기</button>
                        </div>
                    </div>
                </div>
            </div >
        </>
    );
};

export default Login;