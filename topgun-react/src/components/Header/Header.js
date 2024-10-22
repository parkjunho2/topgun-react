import React from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { loginState, memberLoadingState, userState } from "../../util/recoil";
import axios from "axios";
import { useCallback } from "react";
import Oval from 'react-loading-icons/dist/esm/components/oval';

const Header = () => {
    const navigate = useNavigate();
    const login = useRecoilValue(loginState);
    const [loading, setLoading] = useRecoilState(memberLoadingState);
    const [user, setUser] = useRecoilState(userState);

    const logout = useCallback(() => {
        setUser({ userId: '', userType: '' });
        delete axios.defaults.headers.common["Authorization"];
        window.localStorage.removeItem("refreshToken");
        window.sessionStorage.removeItem("refreshToken");
        navigate("/");
    }, [navigate, setUser]);

    return (
        <>
            {/* 헤더 */}
            <header className="p-3 bg-dark text-white">
                <div className="container">
                    <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
                        <span className="d-flex align-items-center mb-lg-0 text-white text-decoration-none fs-4">
                            TopGun
                        </span>
                        <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
                            <li>
                                <NavLink to="/" className="nav-link px-2 text-white">
                                    홈
                                </NavLink>
                            </li>
                            <li>
                                <a href="#" className="nav-link px-2 text-white">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a href="#" className="nav-link px-2 text-white">
                                    Pricing
                                </a>
                            </li>
                            <li>
                                <NavLink to="/room" className="nav-link px-2 text-white">
                                    Chat
                                </NavLink>
                            </li>
                            <li>
                                <a href="#" className="nav-link px-2 text-white">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="/flight" className="nav-link px-2 text-white">
                                    flight
                                </a>
                            </li>
                            <li>
                                <a href="/admin/list" className="nav-link px-2 text-white">
                                    AdminFlight
                                </a>
                            </li>
                            <li>
                                <NavLink to="/payment" className="nav-link px-2 text-white">
                                    payment
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/paymen/list" className="nav-link px-2 text-white">
                                    paymentlist
                                </NavLink>
                            </li>
                            <li>
                                <a href="/notice" className="nav-link px-2 text-white">
                                    notice

                                </a>
                            </li>
                        </ul>
                        <div className="text-end">
                            {!loading ? (
                                <div className=''>
                                    <Oval stroke="#000" strokeWidth={3} />
                                </div>
                            ) : (
                                login ? (
                                    <>
                                        <button type="button" onClick={() => navigate("/mypage")} className="btn text-light text-decoration-none me-2">
                                            {user.userId} ({user.userType})
                                        </button>
                                        <button type="button" onClick={logout} className="btn btn-danger me-2">
                                            로그아웃
                                        </button>
                                    </>
                                ) : (
                                    <button type="button" onClick={() => navigate("/login")} className="btn btn-success me-2">
                                        로그인
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
