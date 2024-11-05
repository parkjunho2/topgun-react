const NotFound = () => {
  return (
    <div className="container text-center mt-5">
      <h1 className="display-1">404</h1>
      <h2 className="display-4">페이지를 찾을 수 없습니다.</h2>
      <p className="lead">찾고 있는 페이지는 존재하지 않거나, URL이 잘못 입력되었을 수 있습니다.</p>
      <button type="button" className="btn btn-primary"
        onClick={e => navigate(-1)}>
        뒤로가기
      </button>
    </div>
  );
};

export default NotFound;