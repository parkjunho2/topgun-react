import { useCallback, useState, useEffect, useMemo, useRef } from "react";
import { FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill";
import { useRecoilValue } from "recoil"; // Recoil 상태 불러오기
import { loginState, userState } from "../../util/recoil"; // Recoil atoms
import 'react-quill/dist/quill.snow.css';
import './noticeButton.css'; // 프레임 라인 버튼 스타일을 포함한 CSS 파일

const NoticeBoard = () => {
    const [noticeList, setNoticeList] = useState([]);
    const [input, setInput] = useState({
        noticeTitle: "", // 제목 필드 이름 변경
        noticeContent: "", // 내용 필드 이름 변경
        noticeAuthor: "", // 작성자 필드 이름 변경
        noticeCreatedAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    });
    const quillRef = useRef(null);

    // 로그인 상태와 사용자 정보 가져오기
    const login = useRecoilValue(loginState);
    const user = useRecoilValue(userState);

    useEffect(() => {
        loadList();
    }, []);

    const loadList = useCallback(async () => {
        try {
            const response = await axios.get("http://localhost:8080/notice/");
            setNoticeList(response.data);
        } catch (error) {
            console.error("Failed to load notice list:", error);
            alert("공지사항 목록을 불러오는 데 실패했습니다.");
        }
    }, []);

    const deleteNotice = useCallback(async (target) => {
        const choice = window.confirm("정말 삭제하시겠습니까?");
        if (choice) {
            try {
                await axios.delete(`http://localhost:8080/notice/${target.noticeId}`);
                setNoticeList(prevNotices => prevNotices.filter(notice => notice.noticeId !== target.noticeId));
            } catch (error) {
                console.error("Failed to delete notice:", error);
                alert("공지사항 삭제에 실패했습니다.");
            }
        }
    }, []);

    const changeInput = useCallback(e => {
        const { name, value } = e.target;
        setInput(prevInput => ({
            ...prevInput,
            [name]: value
        }));
    }, []);

    const handleContentChange = useCallback(value => {
        setInput(prevInput => ({
            ...prevInput,
            noticeContent: value // 내용 필드 이름 변경
        }));
    }, []);

    const addInput = useCallback(async () => {
        if (!login) {
            alert("로그인이 필요합니다.");
            return;
        }

        const newNotice = {
            noticeTitle: input.noticeTitle, // 제목 필드 이름 변경
            noticeContent: input.noticeContent, // 내용 필드 이름 변경
            noticeAuthor: `${user.userId} (${user.userType})`, // 작성자 필드 이름 변경
            noticeCreatedAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
        };

        try {
            await axios.post("http://localhost:8080/notice/", newNotice);
            clearInput();
            await loadList();
        } catch (error) {
            console.error("Failed to add notice:", error);
            alert("공란을 모두 채워 주세요!.");
        }
    }, [input, loadList, login, user]);

    const clearInput = useCallback(() => {
        setInput({
            noticeTitle: "", // 제목 필드 이름 변경
            noticeContent: "", // 내용 필드 이름 변경
            noticeAuthor: "", // 작성자 필드 이름 변경
            noticeCreatedAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
        });
    }, []);

    const handleImageUpload = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = () => {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const quill = quillRef.current.getEditor();
                const range = quill.getSelection();
                if (range) {
                    quill.insertEmbed(range.index, 'image', reader.result);
                    quill.setSelection(range.index + 1, 0);
                }
            };
            if (file) {
                reader.readAsDataURL(file);
            }
        };
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                ['link', 'image'],
                [{ 'align': [] }],
                [{ 'color': [] }, { 'background': [] }],
                ['clean']
            ],
            handlers: {
                'image': handleImageUpload
            }
        }
    }), []);

    return (
        <div className="row mt-4">
            <div className="col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>NOTICE</h1>
                <hr style={{ width: '80%', border: '1px solid #e3305f', marginBottom: '18px' }} />
                <table className="table" style={{ width: '80%', tableLayout: 'fixed' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'center', width: '10%' }}>NO.</th>
                            <th style={{ padding: '15px', textAlign: 'center', width: '30%' }}>TITLE</th>
                            <th style={{ padding: '15px', textAlign: 'center', width: '20%' }}>AUTHOR</th>
                            <th style={{ padding: '15px', textAlign: 'center', width: '35%' }}>DATE</th>
                            <th style={{ padding: '15px', textAlign: 'center', width: '5%' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {noticeList.map((notice) => (
                            <tr key={notice.noticeId}>
                                <td style={{ padding: '15px', textAlign: 'center' }}>{notice.noticeId}</td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    <Link to={`/notice/${notice.noticeId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                        {notice.noticeTitle} {/* 제목 필드 이름 변경 */}
                                    </Link>
                                </td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>{notice.noticeAuthor}</td> {/* 작성자 필드 이름 변경 */}
                                <td style={{ padding: '15px', textAlign: 'center' }}>{notice.noticeCreatedAt}</td> {/* 생성일 필드 이름 변경 */}
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    {login && ( // 로그인 상태일 때만 쓰레기통 아이콘 표시
                                        <FaTrash
                                            className="text-danger trash-icon"
                                            style={{ color: '#ec7393', fill: '#ec7393', fontSize: '1em' }}
                                            onClick={() => deleteNotice(notice)}
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>

                    <tfoot>
                        {login && ( // 로그인한 사용자만 입력 폼 표시
                            <>
                                <tr>
                                    <td style={{ textAlign: 'center' }}></td>
                                    <td>
                                        <input type="text" className="form-control"
                                            placeholder="제목"
                                            name="noticeTitle" // 제목 필드 이름 변경
                                            value={input.noticeTitle} // 제목 필드 이름 변경
                                            onChange={changeInput} />
                                    </td>
                                    <td></td>
                                    <td style={{ textAlign: 'center', padding: '15px' }}>
                                        <div style={{ marginBottom: '52px' }}>
                                            <a className="frame-btn" href="#" onClick={addInput}>
                                                <span className="frame-btn__outline frame-btn__outline--tall">
                                                    <span className="frame-btn__line frame-btn__line--tall"></span>
                                                    <span className="frame-btn__line frame-btn__line--flat"></span>
                                                </span>
                                                <span className="frame-btn__outline frame-btn__outline--flat">
                                                    <span className="frame-btn__line frame-btn__line--tall"></span>
                                                    <span className="frame-btn__line frame-btn__line--flat"></span>
                                                </span>
                                                <span className="frame-btn__solid"></span>
                                                <span className="frame-btn__text">POST NOTICE</span>
                                            </a>
                                        </div>
                                    </td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan="5">
                                    <ReactQuill
                                    ref={quillRef} // ref 추가
                                    value={input.content}
                                    onChange={handleContentChange}
                                    modules={modules}
                                    placeholder="오른쪽 아래 선택자로 에디터 크기를 자유롭게 조절하세요!"
                                    style={{ height: '290px', width: '110%', resize: 'vertical', overflowY: 'auto' }} // 너비를 100%로 설정
                                />
                                    </td>
                                </tr>
                            </>
                        )}
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default NoticeBoard;
