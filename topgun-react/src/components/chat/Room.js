import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import './Room.css'; // CSS 파일 import
import { useRecoilValue } from "recoil";
import { loginState, memberLoadingState, userState } from "../../util/recoil";

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
        else if(user.userType === "AIRLINE"){
            filteredRooms = resp.data.filter(room => room.roomCreatedBy === user.userId);
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
        loadRoomList();
    }, [roomList]);

    const enterRoom = useCallback(async (target) => {
        if (target.join === 'Y') {
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
    }, [roomList]);

    const roomOptions = [
        { value: '관리자에게 문의', label: '관리자에게 문의' },
        { value: 'A 항공사에게 문의', label: 'A 항공사에게 문의' },
        { value: 'B 항공사에게 문의', label: 'B 항공사에게 문의' },
    ];

    const filteredRoomOptions = user.userType === "AIRLINE" 
    ? [{ value: '관리자에게 문의', label: '관리자에게 문의' }] 
    : roomOptions;

    return (
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

                            <button className="btn btn-success" onClick={saveInput}>등록</button>
                        </div>
                    </div>
                </div>
            )}

            <h3 className="room-title mt-4">채팅방 목록</h3>
            <div className="list-group">
                {roomList.map(room => (
                    <div className="list-group-item" key={room.roomNo} onClick={e => enterRoom(room)}>
                        <div className="room-item">
                            <div className="room-name">
                                <span className="badge bg-primary me-2">{room.roomNo}번</span>
                                <span> {room.roomName}({user.userType})</span>
                                {/* <button className="btn btn-primary ms-2" onClick={e=>enterRoom(room)}>채팅방 입장</button> */}
                                <button className="btn btn-danger ms-2" onClick={e=>deleteRoom(room)}></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Room;