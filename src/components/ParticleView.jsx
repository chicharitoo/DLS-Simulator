import React, { useRef, useEffect } from 'react';

const ParticleView = ({ positions, boxDimensions, wavelength }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;

        // Clear canvas
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, width, height);

        if (!positions || !boxDimensions) return;

        // Scale factor to fit boxDimensions into canvas
        // boxDimensions is [x, y, z]. We project x and y.
        const boxW = boxDimensions[0];
        const boxH = boxDimensions[1];

        // We want to fit boxW x boxH into canvas width x height
        // But we need space for sensor outside.
        // Let's add padding.
        const padding = 20;
        const availW = width - padding * 2;
        const availH = height - padding * 2;

        const scale = Math.min(availW / boxW, availH / boxH);

        const offsetX = (width - boxW * scale) / 2;
        const offsetY = (height - boxH * scale) / 2;

        // Draw particles
        ctx.fillStyle = '#00d4ff';
        const radius = 2; // Fixed visual size for visibility

        for (let i = 0; i < positions.length; i += 3) {
            // Positions are centered at 0, so range is [-boxW/2, boxW/2]
            // We need to map -boxW/2 to offsetX, and boxW/2 to offsetX + boxW*scale
            // So we add boxW/2 to position to make it [0, boxW]
            const x = (positions[i] + boxW / 2) * scale + offsetX;
            const y = (positions[i + 1] + boxH / 2) * scale + offsetY;
            // z is ignored for 2D projection

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw box border
        ctx.strokeStyle = '#334155';
        ctx.strokeRect(offsetX, offsetY, boxW * scale, boxH * scale);

        // Calculate Laser Color from Wavelength
        // Simple approximation
        const wl = wavelength * 1e9;
        let color = '#ff0000';
        if (wl >= 380 && wl < 440) color = '#8b00ff'; // Violet
        else if (wl >= 440 && wl < 490) color = '#0000ff'; // Blue
        else if (wl >= 490 && wl < 510) color = '#00ffff'; // Cyan
        else if (wl >= 510 && wl < 580) color = '#00ff00'; // Green
        else if (wl >= 580 && wl < 645) color = '#ffff00'; // Yellow
        else if (wl >= 645 && wl < 780) color = '#ff0000'; // Red

        // Draw Laser (Incoming from left)
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.moveTo(0, height / 2);
        ctx.lineTo(offsetX + boxW * scale / 2, height / 2);
        ctx.stroke();

        // Draw Laser Glow at center
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.2;
        ctx.arc(offsetX + boxW * scale / 2, height / 2, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Draw Sensor (at 90 degrees - Top, OUTSIDE the box)
        // Box top edge is at offsetY.
        // We place sensor above offsetY.
        const sensorY = offsetY - 30;
        const sensorX = width / 2;

        ctx.beginPath();
        ctx.fillStyle = '#fbbf24'; // Amber sensor
        ctx.fillRect(sensorX - 15, sensorY, 30, 20);

        // Draw scattered ray to sensor (dashed)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
        ctx.setLineDash([5, 5]);
        ctx.moveTo(offsetX + boxW * scale / 2, height / 2);
        ctx.lineTo(sensorX, sensorY + 20); // Connect to bottom of sensor
        ctx.stroke();
        ctx.setLineDash([]);

    }, [positions, boxDimensions, wavelength]);

    return <canvas ref={canvasRef} className="particle-canvas" />;
};

export default ParticleView;
