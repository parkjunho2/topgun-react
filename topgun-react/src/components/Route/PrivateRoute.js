import { useRecoilValue } from "recoil";
import { Navigate, Outlet } from "react-router-dom";
import { loginState, memberLoadingState } from "../../util/recoil";
import Oval from "react-loading-icons/dist/esm/components/oval";
import { ToastContainer, toast } from 'react-toastify'; // 추가
import 'react-toastify/dist/ReactToastify.css';

const PrivateRoute = () => {
    const login = useRecoilValue(loginState);
    const memberLoading = useRecoilValue(memberLoadingState);

    if (memberLoading === false) {
        return (
            <>
                <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
                    <Oval stroke="#007bff" />
                </div>
            </>
        );
    }

    if (!login) {
        toast.error('로그인 필요!', {
            position: "top-center",
        });
        return <Navigate to="/" />;
    }

    return <Outlet />;
};

export default PrivateRoute;
