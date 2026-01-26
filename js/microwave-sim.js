// Microwave Simulation Logic v3.2 - High Fidelity Edition
document.addEventListener('DOMContentLoaded', () => {
    const mwCanvas = document.getElementById('microwaveCanvas');
    if (!mwCanvas) return;

    const mwCtx = mwCanvas.getContext('2d');
    const freqNum = document.getElementById('freqNum');
    const powerSlider = document.getElementById('powerSlider');
    const gainSlider = document.getElementById('gainSlider');
    const rxReadout = document.getElementById('rxReadout');
    const successOverlay = document.getElementById('mwSuccess');

    let won = false;
    const distance = 150;
    const alpha = 0.5;

    function calculateAdvancedFriis() {
        const fGHz = parseFloat(freqNum.value) || 1;
        const Pt = parseFloat(powerSlider.value);
        const Gt = parseFloat(gainSlider.value);
        const Gr = 10;

        const fspl = 20 * Math.log10(distance) + 20 * Math.log10(fGHz) + 32.44;
        const atmosLoss = alpha * (distance / 4);

        let Pr = Pt + Gt + Gr - fspl - atmosLoss;
        return Pr;
    }

    function drawRover(x, y) {
        // Body
        let grad = mwCtx.createLinearGradient(x - 20, y, x + 20, y + 20);
        grad.addColorStop(0, '#475569');
        grad.addColorStop(1, '#1e293b');
        mwCtx.fillStyle = grad;
        mwCtx.fillRect(x - 25, y, 50, 20);

        // Wheels
        mwCtx.fillStyle = '#0f172a';
        mwCtx.beginPath();
        mwCtx.arc(x - 18, y + 22, 6, 0, Math.PI * 2);
        mwCtx.arc(x, y + 22, 6, 0, Math.PI * 2);
        mwCtx.arc(x + 18, y + 22, 6, 0, Math.PI * 2);
        mwCtx.fill();

        // Antenna Mast
        mwCtx.strokeStyle = '#94a3b8';
        mwCtx.lineWidth = 3;
        mwCtx.beginPath();
        mwCtx.moveTo(x, y);
        mwCtx.lineTo(x, y - 40);
        mwCtx.stroke();

        // Dish
        mwCtx.beginPath();
        mwCtx.arc(x, y - 45, 12, Math.PI, 0);
        mwCtx.strokeStyle = '#22d3ee';
        mwCtx.stroke();

        // Glow
        if (won) {
            mwCtx.shadowBlur = 15;
            mwCtx.shadowColor = '#22d3ee';
            mwCtx.beginPath();
            mwCtx.arc(x, y - 45, 2, 0, Math.PI * 2);
            mwCtx.fillStyle = '#22d3ee';
            mwCtx.fill();
            mwCtx.shadowBlur = 0;
        }
    }

    function drawEarthStation(x, y) {
        // Outer glow
        let grad = mwCtx.createRadialGradient(x, y, 10, x, y, 60);
        grad.addColorStop(0, 'rgba(34, 211, 238, 0.2)');
        grad.addColorStop(1, 'transparent');
        mwCtx.fillStyle = grad;
        mwCtx.beginPath();
        mwCtx.arc(x, y, 60, 0, Math.PI * 2);
        mwCtx.fill();

        // Base
        mwCtx.fillStyle = '#1e293b';
        mwCtx.beginPath();
        mwCtx.moveTo(x - 40, y + 60);
        mwCtx.lineTo(x + 40, y + 60);
        mwCtx.lineTo(x, y);
        mwCtx.fill();

        // Dish (Deep parabolic)
        mwCtx.strokeStyle = '#22d3ee';
        mwCtx.lineWidth = 4;
        mwCtx.beginPath();
        mwCtx.arc(x, y, 50, 0.2, Math.PI - 0.2);
        mwCtx.stroke();

        // Receiver head
        mwCtx.fillStyle = '#22d3ee';
        mwCtx.beginPath();
        mwCtx.arc(x, y + 35, 5, 0, Math.PI * 2);
        mwCtx.fill();
    }

    function drawMicrowave() {
        const width = mwCanvas.width = mwCanvas.offsetWidth;
        const height = mwCanvas.height = 450;

        mwCtx.clearRect(0, 0, width, height);

        // Deep Space Gradient
        let skyGrad = mwCtx.createLinearGradient(0, 0, 0, height);
        skyGrad.addColorStop(0, '#020617');
        skyGrad.addColorStop(1, '#0f172a');
        mwCtx.fillStyle = skyGrad;
        mwCtx.fillRect(0, 0, width, height);

        // Stars with scintillation
        for (let i = 0; i < 80; i++) {
            let opacity = Math.abs(Math.sin(Date.now() * 0.001 + i));
            mwCtx.fillStyle = `rgba(255,255,255,${opacity * 0.5})`;
            mwCtx.fillRect((i * 137.5) % width, (i * 241) % height, 1.5, 1.5);
        }

        const power = calculateAdvancedFriis();
        if (rxReadout) {
            rxReadout.innerText = `${power.toFixed(1)} dBm`;
            rxReadout.style.color = power > -75 ? '#22c55e' : '#f472b6';
        }

        if (power > -75 && !won) {
            won = true;
            if (successOverlay) successOverlay.style.display = 'flex';
        }

        // Animated Dust Cloud (Procedural)
        mwCtx.fillStyle = 'rgba(120, 113, 108, 0.15)';
        for (let j = 0; j < 5; j++) {
            let dx = (Date.now() * 0.02 + j * 150) % width;
            mwCtx.beginPath();
            mwCtx.ellipse(dx, height / 2 + Math.sin(j) * 50, 150, height / 3, 0, 0, Math.PI * 2);
            mwCtx.fill();
        }

        const txX = 150, txY = 350;
        const rxX = width - 150, rxY = 150;

        drawRover(txX, txY);
        drawEarthStation(rxX, rxY);

        // Enhanced Signal Beams
        if (power > -90) {
            mwCtx.save();
            const beamColor = power > -75 ? 'rgba(34, 211, 238,' : 'rgba(244, 114, 182,';
            const opacity = Math.min(1, (power + 95) / 20);

            mwCtx.strokeStyle = beamColor + (opacity * 0.2) + ')';
            mwCtx.lineWidth = 15;
            mwCtx.shadowBlur = 20;
            mwCtx.shadowColor = power > -75 ? '#22d3ee' : '#f472b6';

            mwCtx.beginPath();
            mwCtx.moveTo(txX, txY - 45);
            mwCtx.lineTo(rxX, rxY + 35);
            mwCtx.stroke();
            mwCtx.restore();

            // Data Particles
            if (power > -75) {
                const t = Date.now() * 0.003;
                for (let i = 0; i < 8; i++) {
                    const progress = (t + i / 8) % 1;
                    const px = txX + (rxX - txX) * progress;
                    const py = (txY - 45) + (rxY + 35 - (txY - 45)) * progress;

                    mwCtx.fillStyle = '#fff';
                    mwCtx.shadowBlur = 10;
                    mwCtx.shadowColor = '#22d3ee';
                    mwCtx.beginPath();
                    mwCtx.arc(px, py, 2, 0, Math.PI * 2);
                    mwCtx.fill();
                }
            }
        }

        requestAnimationFrame(drawMicrowave);
    }

    window.resetMW = function () {
        won = false;
        successOverlay.style.display = 'none';
        freqNum.value = 15;
    };

    drawMicrowave();

    [freqNum, powerSlider, gainSlider].forEach(el => {
        if (el) el.addEventListener('input', () => {
            if (won && calculateAdvancedFriis() < -75) won = false;
        });
    });
});
