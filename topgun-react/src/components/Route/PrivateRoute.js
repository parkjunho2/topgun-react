import { useRecoilValue } from "recoil";
import { Outlet, useNavigate } from "react-router-dom";
import { loginState, memberLoadingState } from "../../util/recoil";
import Oval from "react-loading-icons/dist/esm/components/oval";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from "react";

const PrivateRoute = () => {
    const login = useRecoilValue(loginState);
    const memberLoading = useRecoilValue(memberLoadingState);
    const navigate = useNavigate();

    useEffect(() => {
        if (login === false) {
            toast.error("로그인이 필요합니다.", {
                position: "top-center", // 또는 "bottom-center"로 변경
            });
            setTimeout(() => navigate("/"), 1000); // 1초 후 메인 페이지로 이동
        }
    }, [login, navigate]);

    // 로딩 진행 중 화면 표시
    if (!memberLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
                <Oval stroke="#007bff" /> {/* Oval 로딩 아이콘 */}
            </div>
        );
    }

    // 로그인 상태일 때만 Outlet 렌더링
    return login ? (
        <>
            <Outlet />
        </>
    ) : null;
};

export default PrivateRoute;
