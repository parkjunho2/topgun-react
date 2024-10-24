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
        noticeCreatedAt: ''
    });
    const login = useRecoilValue(loginState);
    const user = useRecoilValue(userState);

    const quillRef = useRef(null);

    useEffect(() => {
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
                    noticeCreatedAt: response.data.noticeCreatedAt
                });
            } catch (error) {
                console.error("Failed to load notice:", error);
            }
        };
        loadNotice();
    }, [id, navigate]);

    const handleUpdate = async () => {
        const content = quillRef.current ? quillRef.current.getEditor().root.innerHTML : '';
        try {
            await axios.put(`http://localhost:8080/notice/${id}`, { ...updatedNotice, noticeContent: content });
            alert('공지사항이 수정되었습니다!');
            setIsEditing(false);
            
            // 수정된 공지사항을 다시 불러오기
            await loadNotice();
        } catch (error) {
            console.error("Failed to update notice:", error);
            alert('수정 실패. 다시 시도해 주세요.');
        }
    };

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
                noticeCreatedAt: response.data.noticeCreatedAt
            });
        } catch (error) {
            console.error("Failed to load notice:", error);
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
    primaryButton: {
        padding: '10px 15px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        backgroundColor: '#ec7393',
        color: 'white',
        marginRight: '10px',
        transition: 'background-color 0.3s ease',
        fontSize: '16px',
    },
    primaryButtonHover: {
        backgroundColor: '#d6286b',
    },
    secondaryButton: {
        padding: '10px 15px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        backgroundColor: '#ccc',
        color: 'black',
        transition: 'background-color 0.3s ease',
        fontSize: '16px',
    },
    secondaryButtonHover: {
        backgroundColor: '#b3b3b3',
    },
    editButton: {
        marginTop: '25px',
        padding: '10px 15px',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        margin: '10px',
        backgroundColor: '#ec7393',
        color: 'white',
        transition: 'background-color 0.3s ease',
        fontSize: '16px',
    },
    noticeContent: {
        margin: '20px 0',
        lineHeight: '13',
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
    divider: {
        border: '1px solid #e3305f',
        margin: '20px 0',
    },
};

export default NoticeDetail;
