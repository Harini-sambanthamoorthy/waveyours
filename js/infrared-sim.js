// Infrared Simulation Logic v3.2 - High Fidelity Edition
document.addEventListener('DOMContentLoaded', () => {
    const irCanvas = document.getElementById('infraredCanvas');
    if (!irCanvas) return;

    const irCtx = irCanvas.getContext('2d');
    const sampleSlider = document.getElementById('sampleSlider');
    const dutySlider = document.getElementById('dutySlider');
    const snrReadout = document.getElementById('snrReadout');
    const successOverlay = document.getElementById('irSuccess');
    const payloadDisplay = document.getElementById('payloadText');

    let won = false;
    const noiseLevel = 65;
    const targetPayload = "0xAF32_77_E9";

    function calculateAdvancedSNR() {
        const sampleRate = parseFloat(sampleSlider.value);
        const duty = parseFloat(dutySlider.value) / 100;
        const freqMatch = 1 - Math.abs(sampleRate - 38) / 38;
        const dutyMatch = 1 - Math.abs(duty - 0.3) / 0.7;
        const signalPower = 1000 * duty * freqMatch * dutyMatch;
        const snr = 10 * Math.log10(Math.max(0.1, signalPower / noiseLevel));
        return snr;
    }

    function drawOscilloscopeBackground(width, height) {
        // CRT Background
        let grad = irCtx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
        grad.addColorStop(0, '#0a0f1e');
        grad.addColorStop(1, '#020617');
        irCtx.fillStyle = grad;
        irCtx.fillRect(0, 0, width, height);

        // Grid Lines
        irCtx.strokeStyle = 'rgba(34, 211, 238, 0.05)';
        irCtx.lineWidth = 0.5;
        for (let i = 0; i < width; i += 40) {
            irCtx.beginPath(); irCtx.moveTo(i, 0); irCtx.lineTo(i, height); irCtx.stroke();
        }
        for (let j = 0; j < height; j += 40) {
            irCtx.beginPath(); irCtx.moveTo(0, j); irCtx.lineTo(width, j); irCtx.stroke();
        }

        // Center Lines
        irCtx.strokeStyle = 'rgba(34, 211, 238, 0.15)';
        irCtx.lineWidth = 1;
        irCtx.beginPath(); irCtx.moveTo(width / 2, 0); irCtx.lineTo(width / 2, height); irCtx.stroke();
        irCtx.beginPath(); irCtx.moveTo(0, height / 2); irCtx.lineTo(width, height / 2); irCtx.stroke();
    }

    function drawInfrared() {
        const width = irCanvas.width = irCanvas.offsetWidth;
        const height = irCanvas.height = 450;

        irCtx.clearRect(0, 0, width, height);
        drawOscilloscopeBackground(width, height);

        const snr = calculateAdvancedSNR();
        if (snrReadout) {
            snrReadout.innerText = `${snr.toFixed(1)} dB`;
            snrReadout.style.color = snr > 12 ? '#22d3ee' : '#f472b6';
        }

        if (snr > 12 && !won) {
            won = true;
            if (successOverlay) successOverlay.style.display = 'flex';
            if (payloadDisplay) payloadDisplay.innerText = targetPayload;
        }

        // Noise Grain (Animated)
        irCtx.fillStyle = `rgba(255,255,255,${(Math.random() * 0.02)})`;
        irCtx.fillRect(0, 0, width, height);

        // Primary Bitstream Trace
        irCtx.save();
        irCtx.strokeStyle = snr > 12 ? '#22d3ee' : '#f472b6';
        irCtx.lineWidth = 2.5;
        irCtx.shadowBlur = 10;
        irCtx.shadowColor = irCtx.strokeStyle;
        irCtx.beginPath();

        const tBase = Date.now() * 0.008;
        for (let x = 0; x < width; x += 2) {
            const t = tBase + x * 0.04;
            const bit = Math.sin(t) + Math.cos(t * 0.3) + Math.sin(t * 0.7) > 0 ? 1 : 0;
            const jitter = (Math.random() - 0.5) * (noiseLevel / (snr > 12 ? 8 : 1.5));
            const y = height / 2 - (bit * 120) + jitter + 60;
            if (x === 0) irCtx.moveTo(x, y);
            else irCtx.lineTo(x, y);
        }
        irCtx.stroke();
        irCtx.restore();

        // Sub-carrier visualization
        if (snr > 8) {
            irCtx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
            irCtx.lineWidth = 1;
            irCtx.beginPath();
            for (let x = 0; x < width; x += 4) {
                const t = tBase + x * 0.04;
                const bit = Math.sin(t) + Math.cos(t * 0.3) + Math.sin(t * 0.7) > 0 ? 1 : 0;
                if (bit) {
                    const carrier = Math.sin(x * 1.2 + Date.now() * 0.2) * 20;
                    irCtx.lineTo(x, height / 2 - 60 + carrier);
                }
            }
            irCtx.stroke();
        }

        // CRT Scanline Overlay
        irCtx.fillStyle = 'rgba(0,0,0,0.1)';
        for (let i = 0; i < height; i += 4) {
            irCtx.fillRect(0, i, width, 2);
        }

        // Status Overlay on Trace
        irCtx.fillStyle = snr > 12 ? '#22d3ee' : '#f472b6';
        irCtx.font = '800 12px Inter';
        irCtx.fillText("TRIG'D", 40, 40);
        irCtx.fillText(snr > 12 ? "SNK:100%" : "SNK:ERROR", width - 100, 40);

        requestAnimationFrame(drawInfrared);
    }

    window.resetIR = function () {
        won = false;
        successOverlay.style.display = 'none';
        sampleSlider.value = 38;
    };

    drawInfrared();

    [sampleSlider, dutySlider].forEach(el => {
        if (el) el.addEventListener('input', () => {
            if (won && calculateAdvancedSNR() < 12) won = false;
        });
    });
});
