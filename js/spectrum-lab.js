// Universal Spectrum Laboratory Engine v5.0 - Simulation 2.0 Immersive Edition
document.addEventListener('DOMContentLoaded', () => {
    const mainCanvas = document.getElementById('unifiedCanvas');
    const interCanvas = document.getElementById('interactionCanvas');
    if (!mainCanvas || !interCanvas) return;

    const ctx = mainCanvas.getContext('2d');
    const iCtx = interCanvas.getContext('2d');

    const slider = document.getElementById('masterFrequencySlider');
    const freqDisp = document.getElementById('freqDisplay');
    const waveDisp = document.getElementById('waveDisplay');
    const energyDisp = document.getElementById('energyDisplay');
    const regimeDisp = document.getElementById('regimeDisplay');
    const modeTag = document.getElementById('modeTag');
    const physicsLog = document.getElementById('physicsLog');

    const C = 299792458;
    const H = 4.135667696e-15;

    // Simulation state
    let particles = [];

    function updateHUD(f) {
        if (f < 1e12) freqDisp.innerText = (f / 1e9).toFixed(2) + " GHz";
        else freqDisp.innerText = (f / 1e12).toFixed(2) + " THz";

        const lambda = C / f;
        if (lambda >= 0.01) waveDisp.innerText = (lambda * 100).toFixed(2) + " cm";
        else if (lambda >= 1e-6) waveDisp.innerText = (lambda * 1e6).toFixed(2) + " μm";
        else waveDisp.innerText = (lambda * 1e9).toFixed(2) + " nm";

        const energy = H * f;
        energyDisp.innerText = (energy < 1e-3) ? (energy * 1e6).toFixed(1) + " μeV" : (energy).toFixed(3) + " eV";

        if (f < 3e11) {
            regimeDisp.innerText = "MICROWAVE";
            regimeDisp.style.color = "var(--primary-cyan)";
            modeTag.innerText = "LINK: SATELLITE TO EARTH";
            physicsLog.innerText = "Current Properties: 12-15 year life cycle. Requires direct Line-of-Sight between high-gain parabolic antennas. Data rate: 1-10 Mbps.";
        } else if (f < 3e12) {
            regimeDisp.innerText = "THz GAP";
            regimeDisp.style.color = "var(--primary-amber)";
            modeTag.innerText = "LINK: SECURITY SCANNER";
            physicsLog.innerText = "Current Properties: High absorption by atmosphere. Used for non-ionizing medical imaging and high-resolution scanning.";
        } else {
            regimeDisp.innerText = "INFRARED";
            regimeDisp.style.color = "var(--primary-magenta)";
            modeTag.innerText = "LINK: LOCAL SECURE BEAM";
            physicsLog.innerText = "Current Properties: Short range local sync. Walls block transmission (Security advantange). Subject to solar interference.";
        }
    }

    // --- High Fidelity Drawing Helpets ---

    function drawSatellite(ctx, x, y, time) {
        ctx.save();
        ctx.translate(x, y + Math.sin(time * 0.5) * 10);

        // Body
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-20, -10, 40, 20);

        // Solar Panels
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(-60, -5, 40, 10);
        ctx.fillRect(20, -5, 40, 10);
        ctx.strokeStyle = '#3b82f6';
        ctx.strokeRect(-60, -5, 40, 10);
        ctx.strokeRect(20, -5, 40, 10);

        // Dish
        ctx.beginPath();
        ctx.arc(0, 15, 15, 0.2, Math.PI - 0.2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glow
        ctx.shadowBlur = 15; ctx.shadowColor = '#3b82f6';
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(0, 30, 2, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
    }

    function drawMountainTower(ctx, w, h) {
        // Mountains
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(w - 300, h);
        ctx.lineTo(w - 150, h - 200);
        ctx.lineTo(w, h);
        ctx.fill();

        // Tower
        const tx = w - 150, ty = h - 200;
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(tx, ty); ctx.lineTo(tx, ty - 60); ctx.stroke();

        // Antenna
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(tx, ty - 65, 10, 0, Math.PI * 2); ctx.fill();
    }

    function drawLivingRoom(ctx, w, h, isBlocked) {
        // Floor
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, h - 50, w, 50);

        // TV / Receiver
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(w - 120, h - 200, 20, 150); // TV frame
        ctx.fillStyle = '#000';
        ctx.fillRect(w - 115, h - 195, 10, 140);

        // IR Wall (The Obstacle)
        if (isBlocked) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(w / 2 - 10, 50, 20, h - 100);
            ctx.strokeStyle = '#475569';
            ctx.strokeRect(w / 2 - 10, 50, 20, h - 100);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '10px Inter';
            ctx.fillText("OPAQUE WALL", w / 2 - 35, 40);
        }

        // Remote
        ctx.fillStyle = '#334155';
        ctx.fillRect(50, h - 100, 40, 20);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(90, h - 90, 5, 0, Math.PI * 2); ctx.fill();
    }

    function drawSimulation(f) {
        const w = mainCanvas.width = mainCanvas.offsetWidth;
        const h = mainCanvas.height = 500;
        ctx.clearRect(0, 0, w, h);

        const time = Date.now() * 0.001;
        const isMW = f < 3e11;
        const isIR = f >= 3e12;

        // Background / Palette
        if (isMW) {
            // Space environment
            let grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#020617'); grad.addColorStop(1, '#1e1b4b');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            // Stars
            for (let i = 0; i < 50; i++) {
                ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5})`;
                ctx.fillRect((i * 137) % w, (i * 241) % h, 1.5, 1.5);
            }
            drawSatellite(ctx, 150, 100, time);
            drawMountainTower(ctx, w, h);
        } else if (isIR) {
            // Indoor environment
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, w, h);
            drawLivingRoom(ctx, w, h, true);
        } else {
            // THz environment
            ctx.fillStyle = '#0c0a09';
            ctx.fillRect(0, 0, w, h);
            // Sensing grid
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.1)';
            for (let i = 0; i < w; i += 50) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }
        }

        // --- Wave & Data Particles ---
        const color = isMW ? '#22d3ee' : isIR ? '#f472b6' : '#fbbf24';
        const startX = isMW ? 150 : 90;
        const startY = isMW ? 130 : h - 90;
        const endX = isMW ? w - 150 : w - 110;
        const endY = isMW ? h - 265 : h - 125;

        // Only draw wave if not blocked (IR)
        const isBlocked = isIR; // Simplify: in IR mode, wall is always there now
        const midX = w / 2;

        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10; ctx.shadowColor = color;

        ctx.beginPath();
        const dist = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        const steps = 200;
        const freqScale = Math.log10(f) - 8.5;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            let px = startX + (endX - startX) * t;
            let py = startY + (endY - startY) * t;

            // Check blockage
            if (isIR && px > midX - 10) {
                // Break the wave at the wall
                ctx.stroke();
                // Draw collision sparks
                if (i > steps / 2) {
                    ctx.fillStyle = '#fff';
                    ctx.beginPath(); ctx.arc(midX - 10, py, 2, 0, Math.PI * 2); ctx.fill();
                }
                break;
            }

            const wave = Math.sin(t * dist * 0.1 * freqScale - time * 10) * (20);
            // Perpendicular displacement
            const angle = Math.atan2(endY - startY, endX - startX) + Math.PI / 2;
            px += Math.cos(angle) * wave;
            py += Math.sin(angle) * wave;

            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
    }

    // --- Interaction Simulation Logic ---

    function drawInteractionSimulation(f) {
        const w = interCanvas.width = interCanvas.offsetWidth;
        const h = interCanvas.height = 300;
        iCtx.clearRect(0, 0, w, h);
        iCtx.fillStyle = '#020617';
        iCtx.fillRect(0, 0, w, h);

        const time = Date.now() * 0.005;

        if (f < 3e11) {
            // Antenna Dipole
            iCtx.strokeStyle = '#94a3b8'; iCtx.lineWidth = 10; iCtx.lineCap = 'round';
            iCtx.beginPath(); iCtx.moveTo(w / 2 - 80, h / 2); iCtx.lineTo(w / 2 - 10, h / 2); iCtx.stroke();
            iCtx.beginPath(); iCtx.moveTo(w / 2 + 10, h / 2); iCtx.lineTo(w / 2 + 80, h / 2); iCtx.stroke();

            iCtx.fillStyle = '#22d3ee';
            const drift = Math.sin(time * 2) * 20;
            for (let i = 0; i < 10; i++) {
                const x = (w / 2) + (i < 5 ? -1 : 1) * (20 + (i % 5) * 15) + drift;
                iCtx.beginPath(); iCtx.arc(x, h / 2, 4, 0, Math.PI * 2); iCtx.fill();
            }
        } else if (f >= 3e12) {
            // Precise Molecule Vibration
            const cx = w / 2, cy = h / 2;
            const vib = Math.sin(time * 5) * (10 + (Math.log10(f) - 12) * 5);
            iCtx.strokeStyle = '#475569'; iCtx.lineWidth = 4;
            iCtx.beginPath(); iCtx.moveTo(cx, cy); iCtx.lineTo(cx - 60 - vib, cy + 50); iCtx.stroke();
            iCtx.beginPath(); iCtx.moveTo(cx, cy); iCtx.lineTo(cx + 60 + vib, cy + 50); iCtx.stroke();
            iCtx.fillStyle = '#ef4444'; iCtx.beginPath(); iCtx.arc(cx, cy, 25, 0, Math.PI * 2); iCtx.fill();
            iCtx.fillStyle = '#fff';
            iCtx.beginPath(); iCtx.arc(cx - 60 - vib, cy + 50, 15, 0, Math.PI * 2); iCtx.fill();
            iCtx.beginPath(); iCtx.arc(cx + 60 + vib, cy + 50, 15, 0, Math.PI * 2); iCtx.fill();
        }
    }

    slider.addEventListener('input', (e) => {
        const f = Math.pow(10, parseFloat(e.target.value));
        updateHUD(f);
    });

    function loop() {
        const f = Math.pow(10, parseFloat(slider.value));
        drawSimulation(f);
        drawInteractionSimulation(f);
        requestAnimationFrame(loop);
    }

    updateHUD(Math.pow(10, parseFloat(slider.value)));
    loop();
});
