import styles from './component.module.css'

export default function Header(root) {
    root.innerHTML = `
        <section class='${styles['left']}'>
            <div>
                <i class="fa-solid fa-volume ${styles['logo']}"></i>
            </div>
            <div>
                <h1>Smart Duck</h1>
                <p>Audio control</p>           
            </div>
        </section>
                
        <section class='${styles['right']}'>
            <i class="fa-solid fa-moon" style="color: rgb(255, 212, 59);"></i>
            <a href='#/settings'>
                <i class="fa-solid fa-gear"></i>
            </a>
        </section>
    `
    root.className = styles['header']
}
