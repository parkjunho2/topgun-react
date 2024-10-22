import './MainPage.css'

const MainPage = () => {
    return (
        <>
            {/* 캐러셀 */}
            <div
                id="myCarousel"
                className="carousel slide mb-6"
                data-bs-ride="carousel"
            >
                <div className="carousel-indicators">
                    <button
                        type="button"
                        data-bs-target="#myCarousel"
                        data-bs-slide-to={0}
                        className="active"
                        aria-current="true"
                        aria-label="Slide 1"
                    />
                    <button
                        type="button"
                        data-bs-target="#myCarousel"
                        data-bs-slide-to={1}
                        aria-label="Slide 2"
                    />
                    <button
                        type="button"
                        data-bs-target="#myCarousel"
                        data-bs-slide-to={2}
                        aria-label="Slide 3"
                    />
                </div>
                <div className="carousel-inner">
                    {/* 이미지1 */}
                    <div className="carousel-item active">
                        <img
                            src="https://picsum.photos/800/400"
                            alt="Example image"
                            className="bd-placeholder-img d-block w-100 h-100"
                            aria-hidden="true"
                            focusable="false"
                            style={{ backgroundColor: 'var(--bs-secondary-color)', width: '100%', height: '100%' }}
                        />
                        <div className="container">
                            <div className="carousel-caption text-start">
                                <h1>Example headline.</h1>
                                <p className="opacity-75">
                                    Some representative placeholder content for the first slide of
                                    the carousel.
                                </p>
                                <p>
                                    <a className="btn btn-lg btn-primary" href="#">
                                        Sign up today
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* 이미지2 */}
                    <div className="carousel-item">
                        <svg
                            className="bd-placeholder-img"
                            width="100%"
                            height="100%"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            preserveAspectRatio="xMidYMid slice"
                            focusable="false"
                        >
                            <rect width="100%" height="100%" fill="var(--bs-secondary-color)" />
                        </svg>
                        <div className="container">
                            <div className="carousel-caption">
                                <h1>두번째 example headline.</h1>
                                <p>
                                    Some representative placeholder content for the second slide of
                                    the carousel.
                                </p>
                                <p>
                                    <a className="btn btn-lg btn-primary" href="#">
                                        Learn more
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* 이미지3 */}
                    <div className="carousel-item">
                        <svg
                            className="bd-placeholder-img"
                            width="100%"
                            height="100%"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            preserveAspectRatio="xMidYMid slice"
                            focusable="false"
                        >
                            <rect width="100%" height="100%" fill="var(--bs-secondary-color)" />
                        </svg>
                        <div className="container">
                            <div className="carousel-caption text-end">
                                <h1>세번째 for good measure.</h1>
                                <p>
                                    Some representative placeholder content for the third slide of
                                    this carousel.
                                </p>
                                <p>
                                    <a className="btn btn-lg btn-primary" href="#">
                                        Browse gallery
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* 캐러셀 이전 버튼 */}
                <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target="#myCarousel"
                    data-bs-slide="prev"
                >
                    <span className="carousel-control-prev-icon" aria-hidden="true" />
                    <span className="visually-hidden">Previous</span>
                </button>
                {/* 캐러셀 다음 버튼 */}
                <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target="#myCarousel"
                    data-bs-slide="next"
                >
                    <span className="carousel-control-next-icon" aria-hidden="true" />
                    <span className="visually-hidden">Next</span>
                </button>
            </div>



            {/* 검색창 */}
            {/* <div className="search-container">
                <input
                    type="text"
                    placeholder="검색어를 입력하세요..."
                    className="search-input"
                />
                <button type='button' className="search-button">검색</button>
            </div> */}


            {/* Marketing messaging and featurettes
  ================================================== */}
            {/* Wrap the rest of the page in another container to center all the content. */}

            {/* 수정예정 */}
            <div className="container marketing">
                {/* Three columns of text below the carousel */}
                <div className="row">
                    <div className="col-lg-4">
                        <svg
                            className="bd-placeholder-img rounded-circle"
                            width={140}
                            height={140}
                            xmlns="http://www.w3.org/2000/svg"
                            role="img"
                            aria-label="Placeholder"
                            preserveAspectRatio="xMidYMid slice"
                            focusable="false"
                        >
                            <title>Placeholder</title>
                            <rect width="100%" height="100%" fill="var(--bs-secondary-color)" />
                        </svg>
                        <h2 className="fw-normal">Heading</h2>
                        <p>
                            Some representative placeholder content for the three columns of
                            text below the carousel. This is the first column.
                        </p>
                        <p>
                            <a className="btn btn-secondary" href="#">
                                View details »
                            </a>
                        </p>
                    </div>
                    {/* /.col-lg-4 */}
                    <div className="col-lg-4">
                        <svg
                            className="bd-placeholder-img rounded-circle"
                            width={140}
                            height={140}
                            xmlns="http://www.w3.org/2000/svg"
                            role="img"
                            aria-label="Placeholder"
                            preserveAspectRatio="xMidYMid slice"
                            focusable="false"
                        >
                            <title>Placeholder</title>
                            <rect width="100%" height="100%" fill="var(--bs-secondary-color)" />
                        </svg>
                        <h2 className="fw-normal">Heading</h2>
                        <p>
                            Another exciting bit of representative placeholder content. This
                            time, we've moved on to the second column.
                        </p>
                        <p>
                            <a className="btn btn-secondary" href="#">
                                View details »
                            </a>
                        </p>
                    </div>
                    {/* /.col-lg-4 */}
                    <div className="col-lg-4">
                        <svg
                            className="bd-placeholder-img rounded-circle"
                            width={140}
                            height={140}
                            xmlns="http://www.w3.org/2000/svg"
                            role="img"
                            aria-label="Placeholder"
                            preserveAspectRatio="xMidYMid slice"
                            focusable="false"
                        >
                            <title>Placeholder</title>
                            <rect width="100%" height="100%" fill="var(--bs-secondary-color)" />
                        </svg>
                        <h2 className="fw-normal">Heading</h2>
                        <p>
                            And lastly this, the third column of representative placeholder
                            content.
                        </p>
                        <p>
                            <a className="btn btn-secondary" href="#">
                                View details »
                            </a>
                        </p>
                    </div>
                    {/* /.col-lg-4 */}
                </div>
                {/* /.row */}


                {/* START THE FEATURETTES */}
                <hr className="featurette-divider" />
                <div className="row featurette">
                    <div className="col-md-7">
                        <h2 className="featurette-heading fw-normal lh-1">
                            First featurette heading.{" "}
                            <span className="text-body-secondary">It’ll blow your mind.</span>
                        </h2>
                        <p className="lead">
                            Some great placeholder content for the first featurette here.
                            Imagine some exciting prose here.
                        </p>
                    </div>
                    <div className="col-md-5">
                        <svg
                            className="bd-placeholder-img bd-placeholder-img-lg featurette-image img-fluid mx-auto"
                            width={500}
                            height={500}
                            xmlns="http://www.w3.org/2000/svg"
                            role="img"
                            aria-label="Placeholder: 500x500"
                            preserveAspectRatio="xMidYMid slice"
                            focusable="false"
                        >
                            <title>Placeholder</title>
                            <rect width="100%" height="100%" fill="var(--bs-secondary-bg)" />
                            <text x="50%" y="50%" fill="var(--bs-secondary-color)" dy=".3em">
                                500x500
                            </text>
                        </svg>
                    </div>
                </div>
                <hr className="featurette-divider" />
                <div className="row featurette">
                    <div className="col-md-7 order-md-2">
                        <h2 className="featurette-heading fw-normal lh-1">
                            Oh yeah, it’s that good.{" "}
                            <span className="text-body-secondary">See for yourself.</span>
                        </h2>
                        <p className="lead">
                            Another featurette? Of course. More placeholder content here to give
                            you an idea of how this layout would work with some actual
                            real-world content in place.
                        </p>
                    </div>
                    <div className="col-md-5 order-md-1">
                        <svg
                            className="bd-placeholder-img bd-placeholder-img-lg featurette-image img-fluid mx-auto"
                            width={500}
                            height={500}
                            xmlns="http://www.w3.org/2000/svg"
                            role="img"
                            aria-label="Placeholder: 500x500"
                            preserveAspectRatio="xMidYMid slice"
                            focusable="false"
                        >
                            <title>Placeholder</title>
                            <rect width="100%" height="100%" fill="var(--bs-secondary-bg)" />
                            <text x="50%" y="50%" fill="var(--bs-secondary-color)" dy=".3em">
                                500x500
                            </text>
                        </svg>
                    </div>
                </div>
                <hr className="featurette-divider" />
                <div className="row featurette">
                    <div className="col-md-7">
                        <h2 className="featurette-heading fw-normal lh-1">
                            And lastly, this one.{" "}
                            <span className="text-body-secondary">Checkmate.</span>
                        </h2>
                        <p className="lead">
                            And yes, this is the last block of representative placeholder
                            content. Again, not really intended to be actually read, simply here
                            to give you a better view of what this would look like with some
                            actual content. Your content.
                        </p>
                    </div>
                    <div className="col-md-5">
                        <svg
                            className="bd-placeholder-img bd-placeholder-img-lg featurette-image img-fluid mx-auto"
                            width={500}
                            height={500}
                            xmlns="http://www.w3.org/2000/svg"
                            role="img"
                            aria-label="Placeholder: 500x500"
                            preserveAspectRatio="xMidYMid slice"
                            focusable="false"
                        >
                            <title>Placeholder</title>
                            <rect width="100%" height="100%" fill="var(--bs-secondary-bg)" />
                            <text x="50%" y="50%" fill="var(--bs-secondary-color)" dy=".3em">
                                500x500
                            </text>
                        </svg>
                    </div>
                </div>
                <hr className="featurette-divider" />
                {/* /END THE FEATURETTES */}

            </div>
            {/* /.container */}
        </>

    );
};

export default MainPage;
