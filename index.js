const elements = document.querySelectorAll('.left, .right, .hide, .show');

elements.forEach(element => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (element.classList.contains('left')) {
                    element.classList.remove("left");
                }
                
                if (element.classList.contains('right')) {
                    element.classList.remove("right");
                }

                if (element.classList.contains('hide')) {
                    element.classList.remove("hide");
                    element.classList.add("show");
                }
            }
        });
    });

    observer.observe(element);
});
