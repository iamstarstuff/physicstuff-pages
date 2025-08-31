// Interactive Lissajous 3D Controls
class LissajousInteractive {
    constructor() {
        this.initControls();
        this.generatePlot();
    }

    initControls() {
        // Create control panel HTML
        const controlsHTML = `
            <div class="lissajous-controls" style="
                background: var(--card-bg, #f8f9fa);
                border: 1px solid var(--border-color, #ddd);
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
                <h3 style="margin-top: 0; color: var(--text-color, #333);">🎛️ Interactive Controls</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                    <div>
                        <h4 style="color: var(--text-color, #333);">Frequency Ratios</h4>
                        <label>L (X-axis): <input type="range" id="l-slider" min="1" max="10" value="8" step="1"></label>
                        <span id="l-value">8</span><br>
                        
                        <label>M (Z-axis): <input type="range" id="m-slider" min="1" max="10" value="9" step="1"></label>
                        <span id="m-value">9</span><br>
                        
                        <label>N (Y-axis): <input type="range" id="n-slider" min="1" max="10" value="10" step="1"></label>
                        <span id="n-value">10</span>
                    </div>
                    
                    <div>
                        <h4 style="color: var(--text-color, #333);">Phase Shifts (degrees)</h4>
                        <label>φ (Phi): <input type="range" id="phi-slider" min="0" max="360" value="45" step="15"></label>
                        <span id="phi-value">45°</span><br>
                        
                        <label>ψ (Psi): <input type="range" id="psi-slider" min="0" max="360" value="45" step="15"></label>
                        <span id="psi-value">45°</span>
                    </div>
                </div>
                
                <button id="generate-btn" style="
                    background: var(--primary-color, #007bff);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 15px;
                    font-size: 16px;
                ">Generate New Lissajous Figure</button>
                
                <div id="loading" style="display: none; color: var(--text-color, #333);">
                    🔄 Generating plot...
                </div>
            </div>
        `;

        // Insert controls before the iframe
        const iframe = document.querySelector('iframe[src*="lissajous"]');
        if (iframe) {
            iframe.insertAdjacentHTML('beforebegin', controlsHTML);
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Update display values
        ['l', 'm', 'n', 'phi', 'psi'].forEach(param => {
            const slider = document.getElementById(`${param}-slider`);
            const display = document.getElementById(`${param}-value`);
            
            slider.addEventListener('input', () => {
                const value = slider.value;
                display.textContent = ['phi', 'psi'].includes(param) ? `${value}°` : value;
            });
        });

        // Generate button
        document.getElementById('generate-btn').addEventListener('click', () => {
            this.generatePlot();
        });
    }

    async generatePlot() {
        const loading = document.getElementById('loading');
        const button = document.getElementById('generate-btn');
        
        // Show loading state
        loading.style.display = 'block';
        button.disabled = true;

        try {
            // Get parameter values
            const params = {
                l: document.getElementById('l-slider').value,
                m: document.getElementById('m-slider').value,
                n: document.getElementById('n-slider').value,
                phi: document.getElementById('phi-slider').value,
                psi: document.getElementById('psi-slider').value
            };

            // Send request to Flask backend
            const response = await fetch('/generate-lissajous', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params)
            });

            if (response.ok) {
                const result = await response.json();
                
                // Update iframe source
                const iframe = document.querySelector('iframe[src*="lissajous"]');
                if (iframe) {
                    iframe.src = result.html_path + '?t=' + Date.now(); // Cache bust
                }
            } else {
                console.error('Failed to generate plot');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            // Hide loading state
            loading.style.display = 'none';
            button.disabled = false;
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('iframe[src*="lissajous"]')) {
        new LissajousInteractive();
    }
});
