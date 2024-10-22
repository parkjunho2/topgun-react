import { useRecoilValue } from "recoil";
import { Navigate, Outlet } from "react-router-dom";
import { AdminState, memberLoadingState } from "../../util/recoil";

const AdminRoute = () => {
    // 로그인 검사 결과를 불러온다
    const admin = useRecoilValue(AdminState);
    const memberLoading = useRecoilValue(memberLoadingState);

    // 로딩 진행중이라면 로딩 화면을 보여준다
    if (memberLoading === false) {
        return <h1>Loading...</h1>;
    }

    // 로그인 상태에 따라 Outlet을 렌더링
    return admin === true ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;
