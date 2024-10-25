import { useState } from "react";
import { AiOutlineMail, AiOutlineUser } from "react-icons/ai";
import axios from "axios";
import { toast } from "react-toastify";
import Oval from "react-loading-icons/dist/esm/components/oval";

const FindPw = () => {
    // state
    const [email, setEmail] = useState("");
    const [certId, setCertId] = useState(""); // 아이디 상태 추가
    const [errorMessage, setErrorMessage] = useState(""); // 에러 메시지 상태 추가
    const [loading, setLoading] = useState(false); // 로딩 상태 추가

    const SendEmail = async () => {
        setLoading(true); // 로딩 시작
        try {
            // certId와 certEmail을 함께 전송
            await axios.post(`http://localhost:8080/cert/send?certEmail=${encodeURIComponent(email)}&certId=${encodeURIComponent(certId)}`);
            toast.success("인증 메일이 발송되었습니다.");
            setErrorMessage(""); // 성공적으로 전송되면 에러 메시지 초기화
        } catch (error) {
            setErrorMessage("메일 전송에 실패했습니다."); // 에러 메시지 설정
        } finally {
            setLoading(false); // 로딩 종료
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center flex-grow-1 ">
                <div className="col-lg-8">
                    <div className="text-center mb-5">
                        <h1 className="mb-4">비밀번호 찾기</h1>
                        <big>비밀번호를 잃어버리셨습니까?</big>
                        <p className="text-muted">
                            아래 입력란에 아이디와 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                        </p>
                    </div>

                    {/* 에러 메시지 */}
                    {errorMessage && (
                        <div className="alert alert-danger text-center mb-4">
                            {errorMessage}
                        </div>
                    )}

                    {/* Input Group for ID */}
                    <div className="d-flex justify-content-center mb-4">
                        <div className="input-group input-group-lg w-50"> {/* 50% 너비 */}
                            <span className="input-group-text">
                                <AiOutlineUser />
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="아이디를 입력하세요"
                                value={certId}
                                onChange={(e) => setCertId(e.target.value)} // 아이디 입력 값 상태 업데이트
                            />
                        </div>
                    </div>

                    {/* Input Group with Icon for Email */}
                    <div className="d-flex justify-content-center mb-4">
                        <div className="input-group input-group-lg w-50"> {/* 50% 너비 */}
                            <span className="input-group-text">
                                <AiOutlineMail />
                            </span>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="이메일을 입력하세요"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} // 이메일 입력 값 상태 업데이트
                            />
                        </div>
                    </div>

                    {/* 별도의 버튼 */}
                    <div className="text-center">
                        <button className="btn btn-primary" type="button" onClick={SendEmail} disabled={loading}>
                            {loading ? (
                                <Oval
                                    height="24"
                                    width="24"
                                    color="white"
                                    ariaLabel="loading"
                                />
                            ) : (
                                "비밀번호 재설정 링크 보내기"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FindPw;
