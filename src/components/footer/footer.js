import styles from './component.module.css'

export default function Footer(root) {
    root.innerHTML = `
        <section id='footer-ratings' class='${styles['top']}'>
            <a id='top-a-rate' href='https://chromewebstore.google.com/detail/smart-duck/pilioinemkligcmnjjlagbepddckibjd/reviews' target='_blank'>
                <i class="fa-regular fa-star" style="color: rgb(255, 212, 59);"></i>
                <i class="fa-regular fa-star" style="color: rgb(255, 212, 59);"></i>
                <i class="fa-regular fa-star" style="color: rgb(255, 212, 59);"></i>
                <i class="fa-regular fa-star" style="color: rgb(255, 212, 59);"></i>
                <i class="fa-regular fa-star" style="color: rgb(255, 212, 59);"></i>
            </a>
        </section>

        <section class='${styles['bottom']}'>
            <div class='${styles['bottom-left']}'>
                    <p>Developed by</p>
                    <a href='https://github.com/izynegallardo' target='_blank'>
                        Izyne Howie
                    </a>         
            </div>
                    
            <div class='${styles['bottom-right']}'>
                <a href='https://ko-fi.com/izynehowie' target='_blank'>
                    <p>Buy me a Coffee</p>
                    <i class="fa-solid fa-mug-hot"></i>
                </a>
            </div>
        </section>

    `
    root.className = styles['footer']
}
