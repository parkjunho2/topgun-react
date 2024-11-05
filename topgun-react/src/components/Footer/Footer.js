import { NavLink } from "react-router-dom";
import { FaExternalLinkAlt } from "react-icons/fa";

const Footer = () => {
    return (
        <>
            {/* 푸터 */}
            <div className="container">
                <footer className="row row-cols-1 row-cols-sm-2 row-cols-md-4 py-5 my-5 border-top">
                    <div className="col mb-3">
                        <div className="d-flex flex-column align-items-start ms-5">
                            <p className="text-body-secondary  mb-0 ms-4">TopGun Travel Agency</p>
                            <NavLink to="/" className="nav-link px-2 text-white">
                                <img src="/image/1-removebg-preview.png"  
                                        style={{ width: "200px", height: "auto" }} alt="TopGun Logo"/>
                            </NavLink>
                        </div>
                    </div>
                    <div className="col mb-2">
                    </div>
                    <div className="col mb-3">
                        <h5>고객 서비스</h5>
                        <ul className="nav flex-column">
                            <li className="nav-item mb-2"><NavLink to="/" className="nav-link p-0 text-body-secondary">홈</NavLink></li>
                            <li className="nav-item mb-2"><NavLink to="/login" className="nav-link p-0 text-body-secondary">로그인</NavLink></li>
                            <li className="nav-item mb-2"><NavLink to="/notice" className="nav-link p-0 text-body-secondary">공지사항</NavLink></li>
                        </ul>
                    </div>
                    <div className="col mb-3">
                        <h5>파트너사</h5>
                        <ul className="nav flex-column">
                            <li className="nav-item mb-2"><NavLink to="https://flyasiana.com/" className="nav-link p-0 text-body-secondary"><FaExternalLinkAlt /> 아시아나항공</NavLink></li>
                            <li className="nav-item mb-2"><NavLink to="https://www.koreanair.com/" className="nav-link p-0 text-body-secondary"><FaExternalLinkAlt /> 대한항공</NavLink></li>
                            <li className="nav-item mb-2"><NavLink to="https://www.jejuair.net/" className="nav-link p-0 text-body-secondary"><FaExternalLinkAlt /> 제주항공 </NavLink></li>
                        </ul>
                    </div>
                </footer>
            </div>
        </>
    );

};

export default Footer;