import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import './Room.css'; // CSS 파일 import
import { useRecoilValue } from "recoil";
import { loginState, memberLoadingState, userState } from "../../util/recoil";
import { IoEnterOutline } from "react-icons/io5";
import { MdDeleteOutline } from "react-icons/md";
import { IoLogoWechat } from "react-icons/io5";
import { FaPlus } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import moment from "moment";

const Room = () => {
    //navigator
    const navigate = useNavigate();

    //state
    const [roomList, setRoomList] = useState([]);
    const [input, setInput] = useState({ roomName: "" });

    //recoil
    const user = useRecoilValue(userState);
    const login = useRecoilValue(loginState);
    const memberLoading = useRecoilValue(memberLoadingState);

    //token
    const accessToken = axios.defaults.headers.common["Authorization"];
    const refreshToken = window.localStorage.getItem("refreshToken")
        || window.sessionStorage.getItem("refreshToken");

    //effect
    useEffect(() => {
        loadRoomList();
    }, []);

    //callback
    const loadRoomList = useCallback(async () => {
        const resp = await axios.get("http://localhost:8080/room/");
        let filteredRooms = resp.data;

        // 사용자의 타입에 따라 방 목록 필터링
        if (user.userType === "MEMBER") {
            filteredRooms = resp.data.filter(room => room.roomCreatedBy === user.userId); // 방 생성자와 현재 사용자가 동일한 방만 표시
        }
        else if (user.userType === "ADMIN") {
            filteredRooms = resp.data.filter(room => room.roomName === '관리자에게 문의'); // '관리자에게 문의'인 방만 표시
        }
        else if (user.userType === "AIRLINE") {
            filteredRooms = resp.data.filter(room => room.roomCreatedBy === user.userId || room.join === 'Y');
        }

        setRoomList(filteredRooms);
    }, [roomList, userState]);

    const changeInput = useCallback(e => {
        setInput({ roomName: e.target.value });
    }, [input]);

    const saveInput = useCallback(async () => {
        const resp = await axios.post("http://localhost:8080/room/", input);
        loadRoomList();
        setInput({ roomName: "" });
    }, [input]);

    const deleteRoom = useCallback(async (target) => {
        const resp = await axios.delete("http://localhost:8080/room/" + target.roomNo);
        window.alert("채팅방을 삭제하시겠습니까?");
        loadRoomList();
    }, [roomList]);

    const enterRoom = useCallback(async (target) => {
        if (target.join === user.userId) {
            navigate("/chat/" + target.roomNo); //이미 참여중인 방으로 이동
        }
        else {
            await axios.post("http://localhost:8080/room/enter", { roomNo: target.roomNo });
            loadRoomList();
            navigate("/chat/" + target.roomNo);
        }
    }, [roomList]);

    const leaveRoom = useCallback(async (target) => {
        await axios.post("http://localhost:8080/room/leave", { roomNo: target.roomNo });
        loadRoomList();
    }, [roomList]);

    const roomOptions = [
        { value: '관리자에게 문의', label: '관리자에게 문의' },
    ];

    const filteredRoomOptions = user.userType === "AIRLINE"
        ? [{ value: '관리자에게 문의', label: '관리자에게 문의' }]
        : roomOptions;

    const formatMessageTime = (time) => {
        const messageDate = moment(time);
        const today = moment();

        if (messageDate.isSame(today, 'day')) {
            return messageDate.format("a h:mm");
        } else {
            return messageDate.format("MM월 DD일 a h:mm");
        }
    };

    return (
        <div className="container">
            <div className="room-container">
                {/* 방 생성 화면 */}
                {user.userType !== "ADMIN" && (
                    <div className="row mt-4">
                        <div className="col">
                            <div className="input-group">
                                <select name="roomName" className="form-select" onChange={changeInput} value={input.roomName}>
                                    <option value="">채팅방 선택</option>
                                    {filteredRoomOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                <button className="btn btn-success" onClick={saveInput}><FaPlus /></button>
                            </div>
                        </div>
                    </div>
                )}

                <h3 className="room-title mt-4">채팅방 목록</h3>
                <div className="list-group">
                    {roomList.map(room => (
                        <div className="list-group-item" key={room.roomNo}>
                            <div className="room-item">
                                <div className="room-name">
                                    {login && user.userType === "ADMIN" && (
                                        <span className="badge bg-primary me-2">{room.roomNo}번</span>
                                    )}
                                    <span onClick={e => enterRoom(room)}>{room.roomName}</span>
                                </div>
                                <div className="last-message-container">
                                    <span className="last-message">{room.lastMessage}</span>
                                    {room.lastMessageTime && (
                                        <span className="last-message-time ms-5">{formatMessageTime(room.lastMessageTime)}</span>
                                    )}
                                </div>
                                {/* <button className="btn btn-primary ms-2" onClick={e => enterRoom(room)}>
                                    <IoEnterOutline style={{ fontSize: '1.5rem' }} />
                                </button> */}
                                <button className="btn btn-danger ms-2" onClick={e => deleteRoom(room)}>
                                    <FaXmark style={{ fontSize: '1.5rem' }} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Room;