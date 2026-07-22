import styles from './component.module.css'

export default function Header(root) {
    root.innerHTML = `
        <section class='${styles['left']}'>
            <div>
                <a href='#/'>
                    <i class="fa-solid fa-angle-left"></i>
                </a>
            </div>
            <div>
                <h1>Settings</h1>
            </div>
        </section>
                
        <section class='${styles['right']}'>
            <i class="fa-solid fa-moon" style="color: rgb(255, 212, 59);"></i>
        </section>
    `
    root.className = styles['header']
}
