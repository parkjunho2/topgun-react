import React, { useEffect, useCallback, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ResetPw = () => {
    // 정규식: 숫자와 특수 문자, 대문자 한개 이상이 포함된 패턴
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$])(?=.*[A-Z]).{8,}$/;

    const navigate = useNavigate();
    const location = useLocation();

    // state
    const [resetPw, setResetPw] = useState({
        newPw: '',
        checkPw: '',
        userId: '', // userId 추가
        certEmail: '',
    });

    // 유효성 검사 상태 관리
    const [validation, setValidation] = useState({
        newPasswordValid: null,
        passwordMatch: null,
    });

    const validatePassword = (password) => {
        return password.trim() !== '' && passwordRegex.test(password);
    };

    const changeInput = (e) => {
        setResetPw(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));

        // 유효성 검사
        if (e.target.name === 'newPw') {
            setValidation(prev => ({
                ...prev,
                newPasswordValid: validatePassword(e.target.value),
            }));
        }

        if (e.target.name === 'checkPw') {
            setValidation(prev => ({
                ...prev,
                passwordMatch: e.target.value === resetPw.newPw,
            }));
        }
    };

    // callback
    const fetchResetPw = useCallback(async () => {
        const queryParams = new URLSearchParams(location.search);
        const certNumber = queryParams.get('certNumber');
        const certEmail = queryParams.get('certEmail');
        const userId = queryParams.get('userId');

        // 상태에 certEmail과 userId 설정
        setResetPw(prev => ({
            ...prev,
            certEmail: certEmail || '', // certEmail 설정
            userId: userId || '',       // userId 설정
        }));

        const certDto = {
            certNumber,
            certEmail,
        };

        try {
            const response = await axios.post(`/users/resetPw?userId=${userId}`, certDto);
            // console.log('Response:', response.data);
        } catch (error) {
            console.error('Error during password reset:', error);
            navigate("/");
        }
    }, [location.search]);

    useEffect(() => {
        fetchResetPw();
    }, []);

    // 비밀번호 변경 요청
    const changePassword = async () => {
        if (validation.newPasswordValid && validation.passwordMatch && resetPw.userId && resetPw.certEmail) {
            try {
                // 비밀번호 변경 요청
                await axios.put(`/users/changePassword`, {
                    newPassword: resetPw.newPw,
                    userId: resetPw.userId, // userId 사용
                    certEmail: resetPw.certEmail, // certEmail 추가
                });
                toast.success('비밀번호 변경 성공', {
                    onClose: () => navigate('/login') // 토스트가 닫히면 /login 페이지로 이동
                });
            } catch (error) {
                toast.error('비밀번호 변경 실패');
            }
        } else {
            toast.error('유효성 검사 실패');
        }
    };

    return (
        <div className="container py-5">
            <h2 className="text-center mb-4">비밀번호 변경</h2>
            <div className="mx-auto" style={{ maxWidth: '500px' }}>
                <div className="mb-4">
                    <big>새 비밀번호</big>
                    <div className="input-group has-validation">
                        <span className="input-group-text">PW</span>
                        <div className={`form-floating ${validation.newPasswordValid !== null ? (validation.newPasswordValid ? 'is-valid' : 'is-invalid') : ''}`}>
                            <input
                                type="password"
                                className={`form-control ${validation.newPasswordValid !== null ? (validation.newPasswordValid ? 'is-valid' : 'is-invalid') : ''}`}
                                name='newPw'
                                value={resetPw.newPw}
                                onChange={changeInput}
                                placeholder="패스워드를 입력하세요"
                                id="floatingPassword"
                                required
                            />
                            <label htmlFor="floatingPassword">패스워드</label>
                        </div>
                        <div className={`${validation.newPasswordValid === true ? 'valid-feedback' : 'invalid-feedback'}`}>
                            {validation.newPasswordValid === true
                                ? "유효한 비밀번호입니다!"
                                : resetPw.newPw.trim() === ''
                                    ? "비밀번호를 입력해주세요."
                                    : "비밀번호 형식이 올바르지 않습니다."}
                        </div>
                    </div>
                    <div className="form-text text-muted mb-4">
                        비밀번호는 최소 8자 이상이어야 하며, 숫자, 특수 문자(!, @, #, $), 그리고 대문자가 각각 하나 이상 포함되어야 합니다.
                    </div>
                </div>

                <div className="mb-4">
                    <big>비밀번호 재확인</big>
                    <div className="input-group has-validation">
                        <span className="input-group-text">PW</span>
                        <div className={`form-floating ${validation.passwordMatch !== null ? (validation.passwordMatch ? 'is-valid' : 'is-invalid') : ''}`}>
                            <input
                                type="password"
                                value={resetPw.checkPw}
                                name="checkPw"
                                onChange={changeInput}
                                className={`form-control ${validation.passwordMatch !== null ? (validation.passwordMatch ? 'is-valid' : 'is-invalid') : ''}`}
                                placeholder="패스워드를 재입력하세요"
                                id="floatingPasswordCheck"
                                required
                            />
                            <label htmlFor="floatingPasswordCheck">패스워드 확인</label>
                        </div>
                        <div className="invalid-feedback">패스워드가 일치하지 않습니다.</div>
                    </div>
                </div>

                <div className="text-center">
                    <button type="button" className="btn btn-primary" onClick={changePassword}>
                        비밀번호 변경
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPw;
