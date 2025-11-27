import init, { Simulation } from '../wasm/dls_sim_rs.js';

let simulation = null;
let isRunning = false;
let timer = null;
let currentWavelength = 633e-9;
let currentTemperature = 298.15;
let currentViscosity = 0.00089;
let isWasmInitialized = false;

// Simulation parameters
const DT = 0.000002; // Time step (seconds)
const FPS = 60;
const INTERVAL = 1000 / FPS;

self.onmessage = async (e) => {
    const { type, payload } = e.data;

    switch (type) {
        case 'INIT':
            await initWasmIfNeeded();
            initSimulation(payload);
            break;
        case 'UPDATE_PARAMS':
            if (simulation) {
                simulation.update_params(payload.temperature, payload.viscosity, payload.diameter, payload.polydispersity);
                if (payload.wavelength) currentWavelength = payload.wavelength;
                if (payload.temperature) currentTemperature = payload.temperature;
                if (payload.viscosity) currentViscosity = payload.viscosity;
                // Correlator reset is handled in Rust update_params
            }
            break;
        case 'START':
            isRunning = true;
            loop();
            break;
        case 'STOP':
            isRunning = false;
            if (timer) clearTimeout(timer);
            break;
    }
};

async function initWasmIfNeeded() {
    if (!isWasmInitialized) {
        await init();
        isWasmInitialized = true;
    }
}

function initSimulation(config) {
    const { numParticles, temperature, viscosity, diameter, boxDimensions, wavelength, polydispersity } = config;

    // Rust constructor: new(num_particles, temperature, viscosity, diameter, box_w, box_h, box_d, polydispersity)
    simulation = new Simulation(
        numParticles,
        temperature,
        viscosity,
        diameter,
        boxDimensions[0],
        boxDimensions[1],
        boxDimensions[2],
        polydispersity
    );



    if (wavelength) currentWavelength = wavelength;
    if (temperature) currentTemperature = temperature;
    if (viscosity) currentViscosity = viscosity;
}

function loop() {
    if (!isRunning || !simulation) return;

    const start = performance.now();

    // Run physics steps in Rust
    // Target: 0.03s simulated time per frame (Optimized).
    // DT = 2e-6 s.
    // Steps = 0.03 / 2e-6 = 15,000.
    const stepsPerFrame = 15000;

    // Run the loop entirely in Rust to avoid JS-Wasm boundary overhead
    simulation.run_steps(DT, stepsPerFrame, currentWavelength);

    // Get data for visualization
    // This copies the vector from Wasm memory to JS.
    const positions = simulation.get_positions(); // Float64Array
    const intensity = simulation.calculate_intensity(currentWavelength); // Current I
    // Get correlation
    // Throttled
    let correlationData = null;
    let estimatedSize = null;

    // Debug: Calculate every frame to verify
    // if (Math.random() < 0.1) { 
    const g2 = simulation.calculate_correlation();
    if (g2) {
        correlationData = g2;
        estimatedSize = simulation.estimate_size(DT, currentTemperature, currentViscosity, currentWavelength);
    } else {
        // console.log("Rust returned None for correlation");
    }
    // }

    self.postMessage({
        type: 'DATA',
        payload: {
            intensity: intensity,
            timestamp: Date.now(),
            positions: positions,
            correlation: correlationData,
            estimatedSize: estimatedSize
        }
    });

    const end = performance.now();
    const elapsed = end - start;
    const delay = Math.max(0, INTERVAL - elapsed);

    timer = setTimeout(loop, delay);
}
