import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useRecoilValue } from "recoil";
import { loginState, userState } from "../../util/recoil";

const NoticeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notice, setNotice] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [updatedNotice, setUpdatedNotice] = useState({
        noticeTitle: '',
        noticeContent: '',
        noticeAuthor: '',
        noticeCreatedAt: '',
        mainNotice: 0, // 기본값 0으로 설정
        urgentNotice: 0, // 기본값 0으로 설정
        modifiedNotice: ""
    });
    const login = useRecoilValue(loginState);
    const user = useRecoilValue(userState);

    const quillRef = useRef(null);

    const loadNotice = async () => {
        if (!id) {
            alert("Invalid notice ID");
            navigate('/notice');
            return;
        }
        try {
            const response = await axios.get(`http://localhost:8080/notice/${id}`);
            setNotice(response.data);
            setUpdatedNotice({
                noticeTitle: response.data.noticeTitle,
                noticeContent: response.data.noticeContent,
                noticeAuthor: response.data.noticeAuthor,
                noticeCreatedAt: response.data.noticeCreatedAt,
                mainNotice: response.data.mainNotice ? 1 : 0, // 서버로부터 가져온 값 설정
                urgentNotice: response.data.urgentNotice ? 1 : 0 // 서버로부터 가져온 값 설정
            });
        } catch (error) {
            console.error("Failed to load notice:", error);
        }
    };

    useEffect(() => {
        loadNotice();
    }, [id, navigate]);

    const handleUpdate = async () => {
        const content = quillRef.current ? quillRef.current.getEditor().root.innerHTML : '';
        try {
            // 공지사항이 수정되었으므로 modifiedNotice를 1로 설정
            const updatedData = { ...updatedNotice, noticeContent: content, modifiedNotice: 1 };
    
            await axios.put(`http://localhost:8080/notice/${id}`, updatedData);
            alert('공지사항이 수정되었습니다!');
            setIsEditing(false);
            await loadNotice(); // 수정된 공지사항을 다시 불러오기
        } catch (error) {
            console.error("Failed to update notice:", error);
            alert('수정 실패. 다시 시도해 주세요.');
        }
    };

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

    if (!notice) return <div>Loading...</div>;
    return (
        <div style={styles.container}>
            {isEditing ? (
                <div style={styles.editMode}>
                    <h1 style={styles.title}>NOTICE EDIT</h1>
                    <input
                        type="text"
                        style={styles.titleInput}
                        value={updatedNotice.noticeTitle}
                        onChange={(e) => setUpdatedNotice({ ...updatedNotice, noticeTitle: e.target.value })}
                        placeholder="제목을 입력하세요"
                    />
                    <ReactQuill
                        ref={quillRef}
                        value={updatedNotice.noticeContent}
                        onChange={(content) => setUpdatedNotice({ ...updatedNotice, noticeContent: content })}
                        modules={modules}
                        style={styles.quillEditor}
                    />
             
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '30px' }}>
                    <div style={{ marginRight: '20px' ,marginTop: '10px'}}>
                        <label>
                            <input
                                type="checkbox"
                                checked={updatedNotice.mainNotice === 1}
                                onChange={(e) => setUpdatedNotice({ ...updatedNotice, mainNotice: e.target.checked ? 1 : 0 })}
                            />
                            Main
                        </label>
                    </div>

                    <div style={{ marginRight: '20px' ,marginTop: '10px'}}>
                        <label>
                            <input
                                type="checkbox"
                                checked={updatedNotice.urgentNotice === 1}
                                onChange={(e) => setUpdatedNotice({ ...updatedNotice, urgentNotice: e.target.checked ? 1 : 0 })}
                            />
                            Emergency
                        </label>
                    </div>
                </div>
            </div>
            ) : (
                <div style={styles.viewMode}>
                    <h1 style={styles.title}>{notice.noticeTitle}</h1>
                    <hr style={styles.divider} />
                    <h4>작성자: {notice.noticeAuthor}</h4>
                    <p>작성일: {notice.noticeCreatedAt}</p>
                    <div style={styles.noticeContent}>
                        <ReactQuill
                            value={notice.noticeContent}
                            readOnly={true}
                            theme="bubble"
                        />
                    </div>
                </div>
            )}
            <div style={styles.buttonContainer}>
                {isEditing ? (
                    <>
                        <a className="arrow-btn" href="#" onClick={handleUpdate} style={{ marginRight: '19px', color: '#ec7393' }}>
                            confirm
                        </a>
                        <a className="arrow-btn" href="#" onClick={() => navigate('/notice')} style={{ color: '#ccc' }}>
                            exit
                        </a>
                    </>
                ) : (
                    login && user.userType === 'ADMIN' && (
                        <a className="arrow-btn" href="#" onClick={() => setIsEditing(true)} style={{ marginRight: '19px', color: '#ec7393' }}>
                            EDIT
                        </a>
                    )
                )}
            </div>
        </div>
    );
};

// 스타일 객체
const styles = {
    container: {
        maxWidth: '800px',
        margin: '20px auto',
        padding: '20px',
        backgroundColor: 'transparent',
        position: 'relative',
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
    },
    titleInput: {
        width: '100%',
        padding: '10px',
        marginBottom: '15px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '16px',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        position: 'absolute',
        top: '20px',
        right: '20px',
        marginTop: '0',
        marginBottom: '0',
    },
    editMode: {
        marginTop: '20px',
    },
    viewMode: {
        marginTop: '20px',
    },
    quillEditor: {
        height: '500px',
        marginBottom: '40px',
    },
    noticeContent: {
        margin: '20px 0',
        lineHeight: '13',
    },
    divider: {
        border: '1px solid #080808',
        margin: '20px 0',
    },
};

export default NoticeDetail;
