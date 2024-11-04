import { json, useLocation, useNavigate, useParams } from "react-router";
import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useLinkClickHandler } from "react-router-dom";
import { loginState, memberLoadingState, userState } from "../../util/recoil";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useRecoilValue } from "recoil";
import axios from "axios";
import moment from "moment";
import "moment/locale/ko";//moment 한국어 정보 불러오기
import './Chat.css'; // CSS 파일 임포트

const Chat = () => {
    //방번호
    const { roomNo } = useParams();
    const navigate = useNavigate();

    //state
    const [input, setInput] = useState("");
    const [messageList, setMessageList] = useState([]);
    const [client, setClient] = useState(null);
    const [connect, setConnect] = useState(false);
    const [shouldScroll, setShouldScroll] = useState(true);

    //memo
    const firstMessageNo = useMemo(() => {
        if (messageList.length === 0) return null; //메세지 없음(첫메세지도 없음)
        //제일 앞 메세지의 no를 조사
        const message = messageList[0];
        return message.no || null; //메세지 번호 반환 or 없으면 null
    }, [messageList]);

    const [more, setMore] = useState(false);

    //recoil
    const user = useRecoilValue(userState);
    const login = useRecoilValue(loginState);
    const memberLoading = useRecoilValue(memberLoadingState);

    //token
    const accessToken = axios.defaults.headers.common["Authorization"];
    const refreshToken = window.localStorage.getItem("refreshToken")
        || window.sessionStorage.getItem("refreshToken");

    //effect
    const location = useLocation();

    useEffect(() => {
        if (memberLoading === false) return;

        const canEnter = checkRoom();

        const client = connectToServer();
        setClient(client);
        return () => {
            disconnectFromServer(client);
        }
    }, [location.pathname, memberLoading]);

    //callback
    const connectToServer = useCallback(() => {
        const socket = new SockJS("http://localhost:8080/ws");

        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                accessToken: accessToken,
                refreshToken: refreshToken,
            },
            onConnect: () => {
                setClient(client);
                //채널 구독 처리
                client.subscribe("/private/chat/" + roomNo, (message) => {
                    const data = JSON.parse(message.body);
                    setMessageList(prev => [...prev, data]); //새 메세지를 list에 추가
                    //setMore(json.last === false); //더보기 여부
                });
                client.subscribe("/private/db/" + roomNo + "/" + user.userId, (message) => {
                    const data = JSON.parse(message.body);
                    console.log("마지막:", data.last);
                    setMessageList(data.messageList);
                    console.log("받은 데이터 : ", data);
                    setMore(json.last === false);
                });
                setConnect(true); //연결상태 갱신
            },
            onDisconnect: () => {
                setConnect(false); //연결상태 갱신
            },
            debug: (str) => {
                console.log("[DEBUG] " + str);
            }
        });
        client.activate();
        setClient(client);
        return client;
    }, [memberLoading]);

    const disconnectFromServer = useCallback((client) => {
        if (client) {
            client.deactivate();
        }
    }, []);

    const sendMessage = useCallback(() => {
        if (client === null) return;
        if (connect === false) return;
        if (input.length === 0) return;

        // const message = {
        //     content: input,
        //     senderUsersId: user.userId,
        //     senderUsersType: user.userType,
        //     time: new Date().toISOString()
        //     destination : "/app/chat",
        //     body : JSON.stringify(json),
        // };

        client.publish({
            destination: "/app/room/" + roomNo,
            headers: {
                accessToken: accessToken,
                refreshToken: refreshToken
            },
            body: JSON.stringify({ content: input })
        });
        // setMessageList(prev => [...prev, message]);
        setInput(""); // 입력창 초기화
        setShouldScroll(true);
    }, [input, client, connect]);

    const checkRoom = useCallback(async () => {
        const resp = await axios.get("http://localhost:8080/room/check/" + roomNo);
        if (resp.data === false) {
            navigate("/room", { replace: true });
        }
    }, [roomNo]);

    const [isTyping, setIsTyping] = useState(false); // 입력 중인지 여부

    // 메시지 목록 끝에 대한 ref 추가
    const messagesEndRef = useRef(null);

    // 메시지 목록 업데이트 시 자동 스크롤
    useEffect(() => {
        if (shouldScroll && !isTyping) {
            scrollToBottom();
        }
    }, [messageList, isTyping, shouldScroll]);

    // 자동 스크롤 함수
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" }); // 부드럽게 스크롤
        }
    };

    const formatMessageTime = (time) => {
        const messageDate = moment(time);
        const today = moment();

        if (messageDate.isSame(today, 'day')) {
            return messageDate.format("a h:mm");
        } else {
            return messageDate.format("MM월 DD일 a h:mm");
        }
    };

    // 사용자 ID 앞 3글자 외 * 처리
    const maskUserId = (userId) => {
        if (userId.length <= 3) return userId;
        const maskedPart = '*'.repeat(userId.length - 3);
        return userId.slice(0, 3) + maskedPart;
    };

    const loadMoreMessageList = useCallback(async () => {
        setShouldScroll(false); // 더보기 클릭 시 스크롤 방지
        const resp = await axios.get("http://localhost:8080/room/" + roomNo + "/more/" + firstMessageNo);
        setMessageList(prev => [...resp.data.messageList, ...prev]);
        setMore(resp.data.last === false); //더보기 여부 설정
        console.log("라스트", resp.data.last);
    }, [firstMessageNo, roomNo, messageList, more]);

    console.log(more);

    return (<>
        <div className="container" style={{ width: "700px" }}>
            <div className="row mt-4">
                <div className="col">
                    {/* {more === true && (
                        <button className="btn btn-outline-success w-100" onClick={loadMoreMessageList}>
                            더보기
                        </button>
                    )} */}
                    <div className="chat-container mt-3">
                        <ul className="list-group">
                            {messageList.map((message, index) => (
                                <li className="list-group-item" key={index} style={{ border: "none" }}>
                                    {message.type === "chat" && (
                                        <div className={`chat-message ${login && user.userId === message.senderUsersId ? "my-message" : "other-message"}`}>
                                            <div className="chat-bubble">
                                                {/* 발신자 정보 */}
                                                {login && message.senderUsersId !== null ? (
                                                    <>
                                                        {user.userId !== message.senderUsersId && (
                                                            <div className="message-header">
                                                                <h5>
                                                                    {user.userType === 'ADMIN' ? message.senderUsersId : maskUserId(message.senderUsersId)}
                                                                    <small className="text-muted"> ({message.senderUsersType})</small>
                                                                </h5>
                                                            </div>
                                                        )}
                                                        <p className="message-content">{message.content}</p>
                                                        <p className="text-muted message-time">{formatMessageTime(message.time)}</p>
                                                    </>
                                                ) : (
                                                    <div className="message-header">
                                                        <h5 className="text-danger">탈퇴한 사용자</h5>
                                                        <p className="message-content">{message.content}</p>
                                                        <p className="text-muted message-time">{formatMessageTime(message.time)}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <div ref={messagesEndRef} />
                    </div>
                    {/* 입력창 */}
                    <div className="input-container mt-3">
                        <div className='col'>
                            <div className="input-group my-3">
                                <input type="text" className="form-control"
                                    value={input} onChange={e => setInput(e.target.value)}
                                    onKeyUp={e => {
                                        if (e.key === 'Enter' && login) { sendMessage(); }
                                    }} disabled={login === false} placeholder="메세지를 입력하세요" />
                                <button className="btn btn-success" disabled={login === false} onClick={sendMessage}>보내기</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>);
};

export default Chat;