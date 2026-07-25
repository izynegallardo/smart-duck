export default function rate() {
    const stars = document.querySelectorAll('#top-a-rate .fa-star')

    stars.forEach((star, index) => {
        star.addEventListener('mouseenter', () => {
            stars.forEach((s, i) => {
                if (i <= index) {
                    s.classList.replace('fa-regular', 'fa-solid')
                } else {
                    s.classList.replace('fa-solid', 'fa-regular')
                }
            })
        })
    })

    document.getElementById('top-a-rate').addEventListener('mouseleave', () => {
        stars.forEach((star) => {
            star.classList.replace('fa-solid', 'fa-regular')
        })
    })
}
