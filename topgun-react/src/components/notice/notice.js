import { useCallback, useState, useEffect, useMemo, useRef } from "react";
import { FaStar, FaExclamationTriangle, FaTrash, FaMeteor, FaDizzy } from 'react-icons/fa';

import { Link } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill";
import { useRecoilValue } from "recoil";
import { loginState, userState } from "../../util/recoil";
import 'react-quill/dist/quill.snow.css';
import './noticeButton.css';

import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

const NoticeBoard = () => {

    const [noticeList, setNoticeList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [noticesPerPage, setNoticesPerPage] = useState(6);
    const [input, setInput] = useState({
        noticeTitle: "",
        noticeContent: "",
        noticeAuthor: "",
        noticeCreatedAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
        mainNotice: "",
        urgentNotice: "",
        modifiedNotice: ""
    });


    const indexOfLastNotice = currentPage * noticesPerPage;
    const indexOfFirstNotice = indexOfLastNotice - noticesPerPage;
    const currentNotices = noticeList.slice(indexOfFirstNotice, indexOfLastNotice);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const quillRef = useRef(null);

    const login = useRecoilValue(loginState);
    const user = useRecoilValue(userState);

    useEffect(() => {
        loadList();
    }, []);

    const loadList = useCallback(async () => {
        try {
            const response = await axios.get("http://localhost:8080/notice/");
            // mainNotice가 1인 항목을 우선으로, 긴급 공지 항목을 그 다음으로 정렬
            const sortedList = response.data.sort((a, b) => {
                if (a.mainNotice === b.mainNotice) {
                    return b.urgentNotice - a.urgentNotice; // 긴급 공지가 먼저 오도록 정렬
                }
                return b.mainNotice - a.mainNotice; // 주요 공지가 먼저 오도록 정렬
            });
            setNoticeList(sortedList);
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
            noticeContent: value
        }));
    }, []);

    const addInput = useCallback(async () => {
        if (!login) {
            alert("로그인이 필요합니다.");
            return;
        }

        const newNotice = {

            noticeTitle: input.noticeTitle,
            noticeContent: input.noticeContent,
            noticeAuthor: `${user.userId} (${user.userType})`,
            noticeCreatedAt: new Date().toLocaleString('ko-KR', {

                timeZone: 'Asia/Seoul',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }),

            mainNotice: input.mainNotice, // 체크박스 상태 추가
            urgentNotice: input.urgentNotice, // 체크박스 상태 추가
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
            noticeTitle: "",
            noticeContent: "",
            noticeAuthor: "",
            noticeCreatedAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
            mainNotice: "",
            urgentNotice: "",
            modifiedNotice: ""
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

    const toggleCheckbox = (name) => {
        setInput(prevInput => ({
            ...prevInput,
            [name]: prevInput[name] === 0 ? 1 : 0 // 체크박스 상태 토글
        }));
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

                <hr style={{ width: '80%', border: '1px solid #080808', marginBottom: '18px' }} />

                <table className="table" style={{ width: '80%', tableLayout: 'fixed' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'center', width: '20%' }}>NO.</th>
                            <th style={{ padding: '15px', textAlign: 'center', width: '30%' }}>TITLE</th>
                            <th style={{ padding: '15px', textAlign: 'center', width: '13%' }}>AUTHOR</th>
                            <th style={{ padding: '15px', textAlign: 'center', width: '35%' }}>DATE</th>
                            <th style={{ padding: '15px', textAlign: 'center', width: '2%' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentNotices.map((notice) => (
                            <tr
                                key={notice.noticeId}
                                className={notice.mainNotice === 1 ? 'highlight-notice' : ''}
                                style={{
                                    padding: '15px',
                                    textAlign: 'center',
                                }}
                            >
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                <Link to={`/notice/${notice.noticeId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                    {notice.noticeId}
                                </Link>
                                    {notice.urgentNotice === 1 && (
                                        <span style={{ marginBottom: '15px', marginLeft: '5px', color: '#e63946' }}>
                                            <FaDizzy title="긴급 공지" style={{ fontSize: '1em' }} />
                                            <Link to={`/notice/${notice.noticeId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                            Danger
                                            </Link>
                                        </span>
                                    )}
                                    {/* 메인 공지인 경우 아이콘과 텍스트 추가 */}
                                    {notice.mainNotice === 1 && (
                                        <span style={{ marginLeft: '10px', color: '#ec7393' }}>
                                            <FaMeteor style={{ fontSize: '1em' }} title="주요 공지" />
                                            <Link to={`/notice/${notice.noticeId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                            main
                                            </Link>
                                        </span>
                                        
                                    )}
                                </td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    <Link to={`/notice/${notice.noticeId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                        {notice.noticeTitle}
                                    </Link>
                                </td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>{notice.noticeAuthor}</td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>{notice.noticeCreatedAt}</td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    {user.userType === 'ADMIN' && (
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

                   {/* 페이지네이션 추가 */}
<div style={{ display: 'flex', justifyContent: 'center', width: '500%', marginTop: '5px' }}>
    <Stack spacing={2}>
        <Pagination
            count={Math.ceil(noticeList.length / noticesPerPage)}
            page={currentPage}
            onChange={(event, page) => paginate(page)}
            variant=""
            color="primary"
        />
    </Stack>
</div>

                    <tfoot>
                        {user.userType === 'ADMIN' && (
                            <>
                                <tr>
                                    <td style={{ textAlign: 'center' }}></td>
                                    <td>
                                        <input type="text" className="form-control"
                                            placeholder="제목"
                                            name="noticeTitle"
                                            value={input.noticeTitle}
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
                                            ref={quillRef}
                                            value={input.noticeContent}
                                            onChange={handleContentChange}
                                            modules={modules}
                                            placeholder="오른쪽 아래 선택자로 에디터 크기를 자유롭게 조절하세요!"
                                            style={{ height: '290px', width: '110%', resize: 'vertical', overflowY: 'auto' }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'left', marginTop: '10px' }}>
                                        <label style={{ marginRight: '10px' }}>
                                            <input
                                                type="checkbox" style={{ marginRight: '5px' }}
                                                checked={input.mainNotice === 1}
                                                onChange={() => toggleCheckbox('mainNotice')}
                                            /> Main
                                        </label>
                                        <label style={{ marginRight: '10px' }}>
                                            <input
                                                type="checkbox" style={{ marginRight: '5px' }}
                                                checked={input.urgentNotice === 1}
                                                onChange={() => toggleCheckbox('urgentNotice')}
                                            /> Emergency
                                        </label>
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
