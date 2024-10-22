import { useRecoilValue } from "recoil";
import { Navigate, Outlet } from "react-router-dom";
import { loginState, memberLoadingState } from "../../util/recoil";
import Oval from "react-loading-icons/dist/esm/components/oval";

const PrivateRoute = () => {
    // 로그인 검사 결과를 불러온다
    const login = useRecoilValue(loginState);
    const memberLoading = useRecoilValue(memberLoadingState);

    // 로딩 진행중이라면 로딩 화면을 보여준다
    if (memberLoading === false) {
        return (<>
            <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
                <Oval stroke="#007bff" /> {/* Oval 로딩 아이콘 */}
            </div>
        </>);
    }

    // 로그인 상태에 따라 Outlet을 렌더링
    return login === true ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
