import styles from './component.module.css'
import IconContainer from './icon'

export default function Main(root) {
    root.innerHTML = `
        <section class='${styles['top']}'>
            <div class='${styles['top-checkbox']}'>
                <div class='${styles['top-left-checkbox']}'>
                    <label for='checkbox-duck'>Auto Duck</label>
                    <p>Automatically ducks the background tabs</p>
                </div>
                <div class='${styles['top-right-checkbox']}'>
                    <label class='${styles['checkbox-switch']}'>
                        <input id='checkbox-duck' type="checkbox" checked>
                            <span class='${styles['checkbox-slider']}'></span>
                        </div>
                    </label>    
                </div>
            <div class='${styles['top-range']}'>
                <div class='${styles['top-range-left']}'>
                    <label for='range'>Duck Level</label>
                    <span id="value">20%</span>
                </div>
                <input id='range' type="range" min="0" max="100" value="20">
            </div>
        </section>
        
        <section class='${styles['center']}'>
            <div class='${styles['center-top']}'>
                <ul class='${styles['center-top-ul']}'>
                    <li class='${styles['center-top-ul-li']}'>0 <span class='${styles['center-top-ul-li-span']}'>tabs</span></li>
                    <li class='${styles['center-top-ul-li']}'>0 <span class='${styles['center-top-ul-li-span']}'>playing</span></li>
                    <li class='${styles['center-top-ul-li']}'>0 <span class='${styles['center-top-ul-li-span']}'>ducked</span></li>
                </ul>
            </div>
            <div class='${styles['center-bottom']}'>
                <p class='${styles['center-bottom-p']}'>No active tabs</p>
            </div>
        </section>
        
        <section class='${styles['bottom']}'>
            <div class='${styles['bottom-left-checkbox']}'>
                ${IconContainer({
                    icon: 'fa-solid fa-microphone',
                    color: '#125678',
                })}
            </div>
            <div class='${styles['bottom-center-checkbox']}'>
                <label for='checkbox-detection'>Voice Detection</label>
                <span class='${styles['bottom-center-span']}'>BETA</span>
                <p>Ducks background audio when your voice is detected. Experimental feature.</p>
            </div>
            <div class='${styles['bottom-right-checkbox']}'>
                <label class='${styles['checkbox-switch']}'>
                    <input id='checkbox-detection' type="checkbox">
                        <span class='${styles['checkbox-slider']}'></span>
                    </div>
                </label> 
            </div>
        </section>
    `
    root.className = styles['main']
}
