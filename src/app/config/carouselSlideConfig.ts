const carouselSlideConfig = {
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    infinite: true,
    responsive: [
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 2
            }
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 3
            }
        },
        {
            breakpoint: 1100,
            settings: {
                slidesToShow: 4
            }
        }
    ]
}

export default carouselSlideConfig;