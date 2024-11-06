import React from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { loginState, memberLoadingState, userState } from "../../util/recoil";
import axios from "axios";
import { useCallback } from "react";
import Oval from 'react-loading-icons/dist/esm/components/oval';
import { AiFillHome } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";

const Header = () => {
    const navigate = useNavigate();
    const login = useRecoilValue(loginState);
    const [loading,] = useRecoilState(memberLoadingState);
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
                            <NavLink to="/" className="nav-link px-2 text-white">
                                <img src="/image/logo.png" alt="TopGun Logo"
                                    width={120}
                                    height={35}
                                />
                            </NavLink>
                        </span>
                        <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
                            {/* <li>
                                <NavLink to="/" className="nav-link px-2 text-white">
                                    <AiFillHome />
                                </NavLink>
                            </li> */}
                            {login && ( //로그인 회원
                                <>
                                <li>
                                    <NavLink to="/room" className="nav-link px-2 text-white">
                                        문의
                                    </NavLink>
                                </li>
                                <li>
                                <NavLink to="/payment/alllist" className="nav-link px-2 text-white">
                                    예약내역
                                </NavLink>
                            </li>
                            </>
                            )}
                            {user.userType === 'ADMIN' && (
                                <li>
                                    <NavLink to="/userlist" className="nav-link px-2 text-white">
                                        사용자목록
                                    </NavLink>
                                </li>
                            )}
                            {login && user.userType === "AIRLINE" && ( //로그인 상태, AIRLINE만
                            <>
                                <li>
                                    <NavLink to="/flight" className="nav-link px-2 text-white">
                                        항공편
                                    </NavLink>
                                </li>
                                <li>
                                <NavLink to="/graph" className="nav-link px-2 text-white">
                                    데이터차트
                                </NavLink>
                                </li>
                            </>
                            )}
                            {login && user.userType === "ADMIN" && ( //로그인 상태, ADMIN만
                                <>
                                    <li>
                                        <NavLink to="/admin/list" className="nav-link px-2 text-white">
                                            항공편
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/graph" className="nav-link px-2 text-white">
                                            데이터차트
                                        </NavLink>
                                    </li>
                                </>
                            )}
                            {/* <li>
                                <NavLink to="/payment" className="nav-link px-2 text-white">
                                    payment
                                </NavLink>
                            </li> */}
                            {/* {login && user.userType === "MEMBER" && (
                                <li>
                                    <NavLink to="/payment/alllist" className="nav-link px-2 text-white">
                                        예약내역
                                    </NavLink>
                                </li>
                            )} */}
                            <li>
                                <NavLink to="/notice" className="nav-link px-2 text-white">
                                    공지사항
                                </NavLink>
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
                                        <button type="button" onClick={() => navigate("/mypage")} className="btn text-light text-decoration-none">
                                            <FaUserCircle className="mb-1" /> 마이페이지
                                        </button>
                                        <button type="button" onClick={logout} className="btn text-white me-2">
                                            로그아웃
                                        </button>
                                    </>
                                ) : (
                                    <button type="button" onClick={() => navigate("/login")} className="btn me-2 text-white">
                                        <FaUserCircle className="mb-1" /> 로그인
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
