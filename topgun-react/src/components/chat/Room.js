import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import './Room.css'; // CSS 파일 import
import { useRecoilValue } from "recoil";
import { loginState, memberLoadingState, userState } from "../../util/recoil";

const Room = ()=>{
    //navigator
    const navigate = useNavigate();

    //recoil
    const user = useRecoilValue(userState);
    const login = useRecoilValue(loginState);
    const memberLoading = useRecoilValue(memberLoadingState);

    //token
    const accessToken = axios.defaults.headers.common["Authorization"];
    const refreshToken = window.localStorage.getItem("refreshToken") 
                || window.sessionStorage.getItem("refreshToken");

    //state
    const [roomList, setRoomList] = useState([]);
    
    //effect
    useEffect(()=>{
        loadRoomList();
    },[]);

    //callback
    const loadRoomList = useCallback(async ()=>{
        const resp = await axios.get("http://localhost:8080/room/");
        console.log(resp);

        //userType에 따라 목록 필터링
    const filterRoomList = resp.data.filter(room=>{
        if(user.userType === "ADMIN" || user.userType === "AIRLINE" || user.userType === "MEMBER"){
            return room.roomNo === 1 || room.roomNo === 2 || room.roomNo === 3;
        }
        return false;
    });
        setRoomList(filterRoomList);
    },[roomList, userState]);

    const enterRoom = useCallback(async (target)=>{
        if(target.join === 'Y'){
            navigate("/chat/"+target.roomNo); //이미 참여중인 방으로 이동
        }
        else{
            await axios.post("http://localhost:8080/room/enter", {roomNo : target.roomNo});
            loadRoomList();
            navigate("/chat/"+target.roomNo);
        }
    },[roomList]);

    return (
        <div className="room-container">
            <h3 className="room-title">채팅방 목록</h3>
            <div className="list-group">

                {roomList.map(room => (
                    <div className="list-group-item" key={room.roomNo} onClick={() => enterRoom(room)}>
                        <div className="room-item">
                            <div className="room-name">
                                <span className="badge bg-primary me-2">{room.roomNo}번</span>
                                <span> {room.roomName}</span>
                            </div>
                            <div className="room-info">
                                <span className="room-last-message">{room.lastMessage}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Room;