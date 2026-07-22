import styles from './component.module.css'

export default function Main(root) {
    root.innerHTML = `
        <section class='${styles['top']}'>
            <h1>Top</h1>
        </section>
        
        <section class='${styles['center']}'>
            <h1>Center</h1>
        </section>
        
        <section class='${styles['bottom']}'>
            <h1>Bottom</h1>
        </section>
    `
    root.className = styles['main']
}
