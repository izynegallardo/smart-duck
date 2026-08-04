import styles from './component.module.css'
import { updateIcons } from '@/helpers/lucide'

export default function Main(root) {
    root.innerHTML = `
        <section id='top' class='${styles['top']}'>
            <div class='${styles['top-checkbox']}'>
                <div class='${styles['top-left-checkbox']}'>
                    <label for='checkbox-duck'>Auto Duck</label>
                    <p>Automatically ducks the background tabs</p>
                </div>
                <div class='${styles['top-right-checkbox']}'>
                    <label id='checkbox-switch' class='${styles['checkbox-switch']}'>
                        <input id='checkbox-duck' type="checkbox" checked>
                        <span class='${styles['checkbox-slider']}'></span>
                    </label>    
                </div>
            </div>    
            <div id='top-div-range' class='${styles['top-div-range']}'>
                <div class='${styles['top-range-left']}'>
                    <label id='top-range-label' for='range'>Background Volume</label>
                    <span id="top-range-span">20%</span>
                </div>
                <input id='top-range' type="range" min="0" max="100" value="20">
            </div>
        </section>
        
        <section class='${styles['center']}'>
            <div class='${styles['center-top']}'>
                <ul class='${styles['center-top-ul']}'>
                    <li class='${styles['center-top-ul-li']}'><span id='stat-tabs'>0</span> <span class='${styles['center-top-ul-li-span']}'>tabs |</span></li>
                    <li class='${styles['center-top-ul-li']}'><span id='stat-playing'>0</span> <span class='${styles['center-top-ul-li-span']}'>playing |</span></li>
                    <li class='${styles['center-top-ul-li']}'><span id='stat-ducked'>0</span> <span class='${styles['center-top-ul-li-span']}'>ducked</span></li>
                </ul>
            </div>
            <div id='center-bottom' class='${styles['center-bottom']}'>
                <p class='${styles['center-bottom-p']}'>No active tabs</p>
            </div>
        </section>
        
        <section class='${styles['bottom']}'>
            <div id='bottom-left' class='${styles['bottom-left']}'>
                <div class='${styles['bottom-left-checkbox']}'>
                    <div class="${styles['icon-container']}" style="background-color: #125678" aria-label="speech">
                        <i data-lucide="speech"></i>  
                    </div>
                </div>
                <div class='${styles['bottom-center-checkbox']}'>
                    <label for='checkbox-detection'>Voice Detection</label>
                    <span class='${styles['bottom-center-span']}'>BETA</span>
                    <p>Ducks background audio when a voice is detected. Experimental feature.</p>
                </div>
            </div>
            <div class='${styles['bottom-right-checkbox']}'>
                <label class='${styles['checkbox-switch']}'>
                    <input id='checkbox-detection' type="checkbox">
                    <span class='${styles['checkbox-slider']}'></span>
                </label> 
            </div>
        </section>
    `
    updateIcons(root)
    root.className = styles['main']
}
