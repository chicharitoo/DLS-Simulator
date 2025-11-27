import React, { useState, useEffect, useRef, useCallback } from 'react';
import Controls from './components/Controls';
import ParticleView from './components/ParticleView';
import Graphs from './components/Graphs';
// import { Correlator } from './analysis/correlation'; // Moved to worker
// import { estimateSize } from './analysis/fitting'; // Moved to Rust
import { T_DEFAULT, ETA_WATER } from './physics/constants';

// Worker is imported using Vite's query suffix or just standard import if configured
// Vite requires `new Worker(new URL(..., import.meta.url))`
import Worker from './workers/simWorker?worker';

const BOX_DIMENSIONS = [40e-6, 200e-6, 40e-6]; // Reverted to original size to keep calculations intact
// const NUM_PARTICLES = 300; // Moved to state

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'white' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error && this.state.error.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  console.log("App rendering");
  const [params, setParams] = useState({
    temperature: T_DEFAULT,
    viscosity: ETA_WATER,
    diameter: 100e-9, // 100 nm
    wavelength: 633e-9,
    numParticles: 300,
    polydispersity: 0
  });

  const [positions, setPositions] = useState(null);
  const [intensityHistory, setIntensityHistory] = useState([]);
  const [correlationData, setCorrelationData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [estimatedSize, setEstimatedSize] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runtime, setRuntime] = useState(0);
  const [samples, setSamples] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const startTimeRef = useRef(null);

  const smoothedDiameterRef = useRef(null);

  const workerRef = useRef(null);
  // const correlatorRef = useRef(new Correlator(600)); // Moved to worker
  const frameCountRef = useRef(0);

  // Accumulator for Size Distribution
  const distributionAccumulator = useRef(new Float32Array(101).fill(0));

  const distributionSamples = useRef(0);




  useEffect(() => {
    // Initialize Worker
    workerRef.current = new Worker();

    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'DATA') {
        const { intensity, positions: newPositions } = payload;

        // Update visualization (throttle to 30fps if needed, but here we try 60)
        setPositions(newPositions);

        // Update Analysis
        // correlatorRef.current.addIntensity(intensity); // Done in worker

        // Update Graphs & Stats every frame (60fps)
        frameCountRef.current++;
        if (true) {
          const tStart = performance.now();
          // Update Intensity Graph Data
          setIntensityHistory(prev => {
            const next = [...prev, intensity];
            if (next.length > 500) next.shift(); // Keep last 500 points
            return next;
          });

          // Update Correlation
          // const g2 = correlatorRef.current.calculate();
          const g2_raw = payload.correlation; // Received from worker
          if (g2_raw) {
            // Convert to standard array for easier handling and debugging
            const g2 = Array.from(g2_raw);
            setCorrelationData(g2);

            // Debug log every 60 frames
            if (frameCountRef.current % 60 === 0) {
              console.log("G2 Data:", {
                length: g2.length,
                first5: g2.slice(0, 5),
                last5: g2.slice(-5),
                min: Math.min(...g2),
                max: Math.max(...g2)
              });
            }

            // Estimate Size
            // The worker samples at DT = 0.000002s.
            // const dt_sample = 0.000002;
            // const lags = g2.map((_, i) => i * dt_sample);

            // Estimate Size (Now done in Rust!)
            // Returns object { diameter, diffusion, gamma, slope, q, baseline, samples } or null
            const result = payload.estimatedSize;
            const estimatedDiameter = result ? result.diameter : null;

            if (result && result.samples) {
              setSamples(result.samples);
            }

            if (startTimeRef.current && isRunning) {
              setRuntime((Date.now() - startTimeRef.current) / 1000);
            }

            if (frameCountRef.current % 60 === 0 && result) {
              console.log("Estimate Result (Rust):", result);
            }

            if (estimatedDiameter && estimatedDiameter > 0) {
              // Smooth the estimated size using a moving average
              let smoothed = estimatedDiameter;
              if (smoothedDiameterRef.current !== null) {
                // Alpha = 0.05 for smoothing
                smoothed = smoothedDiameterRef.current * 0.95 + estimatedDiameter * 0.05;
              }
              smoothedDiameterRef.current = smoothed;

              setEstimatedSize(smoothed);

              // Generate Size Distribution (Gaussian approximation)
              // Center at estimated diameter, use PDI for width
              // PDI = (sigma / mean)^2  => sigma = mean * sqrt(PDI)
              const center = smoothed * 1e9; // nm (Use smoothed value!)

              // Use user PDI, but ensure a minimum width for visualization if PDI is 0
              let pdi = params.polydispersity;
              if (pdi < 0.01) pdi = 0.01; // Min PDI for graph visibility

              const sigma = center * Math.sqrt(pdi);

              // Accumulate distribution with decay (Leaky Integrator) to prevent ghost peaks
              // Decay factor 0.995 means "memory" of ~200 frames (3-4 seconds)
              const decay = 0.995;
              distributionSamples.current = distributionSamples.current * decay + 1;

              const currentDist = [];

              if (sigma > 0) {
                // Generate points logarithmically for smoother log plot
                for (let i = 0; i <= 100; i++) {
                  // Log range from 1nm to 10000nm
                  const logMin = Math.log10(1);
                  const logMax = Math.log10(10000);
                  const logVal = logMin + (i / 100) * (logMax - logMin);
                  const d = Math.pow(10, logVal);

                  const val = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((d - center) / sigma, 2));

                  if (!isNaN(val)) {
                    distributionAccumulator.current[i] = distributionAccumulator.current[i] * decay + val;
                    // Normalize by count for display
                    currentDist.push({ x: d, y: distributionAccumulator.current[i] / distributionSamples.current });
                  } else {
                    distributionAccumulator.current[i] *= decay;
                    currentDist.push({ x: d, y: distributionAccumulator.current[i] / distributionSamples.current });
                  }
                }
              }
              setDistributionData(currentDist);

              // Debug logs for size estimation
              if (frameCountRef.current % 60 === 0) {
                console.log("Est. Size Debug:", {
                  diameter: estimatedDiameter,
                  // diffusion: result.diffusionCoeff, // Not returned by Rust yet
                  temp: params.temperature,
                  visc: params.viscosity,
                  samples: distributionSamples.current
                });
              }

              // Update DOM directly for performance
              const el = document.getElementById('stat-diameter');
              if (el) {
                el.innerText = (smoothed * 1e9).toFixed(1) + ' nm';
              }
            }
          }

          // Update DOM intensity
          // Use moving average for display
          const el = document.getElementById('stat-intensity');
          if (el) {
            // Simple exponential moving average for display
            const currentVal = parseFloat(el.innerText) || 0;
            const newVal = currentVal * 0.9 + intensity * 0.1;
            el.innerText = newVal.toFixed(2);
          }
          // const tEnd = performance.now();
          // QA: Log every update
          // console.log(`[QA Graphs] Update Duration: ${(tEnd - tStart).toFixed(2)}ms`);
        }
      }
    };

    // Start Simulation
    workerRef.current.postMessage({
      type: 'INIT',
      payload: {
        numParticles: params.numParticles,
        temperature: params.temperature,
        viscosity: params.viscosity,
        diameter: params.diameter,
        boxDimensions: BOX_DIMENSIONS
      }
    });

    // Do not auto-start
    // workerRef.current.postMessage({ type: 'START' });

    return () => {
      workerRef.current.terminate();
    };
  }, []); // Run once on mount

  const handleStart = () => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'START' });
      setIsRunning(true);
      startTimeRef.current = Date.now();
      setRuntime(0);
      setSamples(0);
    }
  };

  const handleStop = () => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'STOP' });
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    if (workerRef.current) {
      // Stop simulation
      workerRef.current.postMessage({ type: 'STOP' });
      setIsRunning(false);

      // Reset all state
      setPositions([]);
      setIntensityHistory([]);
      setCorrelationData([]);
      setDistributionData([]);
      setEstimatedSize(null);
      smoothedDiameterRef.current = null;
      distributionAccumulator.current.fill(0);
      distributionSamples.current = 0;
      setRuntime(0);
      setSamples(0);
      startTimeRef.current = null;

      // Reset DOM elements
      const elDia = document.getElementById('stat-diameter');
      if (elDia) elDia.innerText = '--';
      const elInt = document.getElementById('stat-intensity');
      if (elInt) elInt.innerText = '0';

      // Re-init simulation to reset positions
      workerRef.current.postMessage({
        type: 'INIT',
        payload: {
          numParticles: params.numParticles,
          temperature: params.temperature,
          viscosity: params.viscosity,
          diameter: params.diameter,
          wavelength: params.wavelength,
          polydispersity: params.polydispersity,
          boxDimensions: BOX_DIMENSIONS
        }
      });
    }
  };

  // Update params in worker when they change

  // Effect for Physics Params (T, eta, d, lambda, pdi)
  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'UPDATE_PARAMS',
        payload: {
          temperature: params.temperature,
          viscosity: params.viscosity,
          diameter: params.diameter,
          wavelength: params.wavelength,
          polydispersity: params.polydispersity
        }
      });
    }
    // Reset correlator when params change to avoid mixing data
    // correlatorRef.current.reset();
    setIntensityHistory([]);
    setCorrelationData([]);
    setDistributionData([]);
    // Reset accumulator
    distributionAccumulator.current.fill(0);
    distributionSamples.current = 0;
    smoothedDiameterRef.current = null;
  }, [params.temperature, params.viscosity, params.diameter, params.wavelength, params.polydispersity]);

  // Update runtime continuously while running
  useEffect(() => {
    if (!isRunning || !startTimeRef.current) return;

    const interval = setInterval(() => {
      setRuntime((Date.now() - startTimeRef.current) / 1000);
    }, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, [isRunning]);

  // Effect for Particle Count (Requires Re-Init)
  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'INIT',
        payload: {
          numParticles: params.numParticles,
          temperature: params.temperature,
          viscosity: params.viscosity,
          diameter: params.diameter,
          boxDimensions: BOX_DIMENSIONS,
          polydispersity: params.polydispersity,
          wavelength: params.wavelength
        }
      });
      // Reset data
      setIntensityHistory([]);
      setCorrelationData([]);
      setDistributionData([]);
      // Reset accumulator
      distributionAccumulator.current.fill(0);
      distributionSamples.current = 0;
      smoothedDiameterRef.current = null;
      // correlatorRef.current.reset();
    }
  }, [params.numParticles]);

  // QA Interface
  useEffect(() => {
    window.dlsQA = {
      setParams: (newParams) => {
        setParams(prev => ({ ...prev, ...newParams }));
      },
      getEstimatedSize: () => estimatedSize,
      getParams: () => params,
      reset: handleReset,
      start: handleStart
    };
  }, [params, estimatedSize, handleReset, handleStart]);

  return (
    <ErrorBoundary>
      <div className="app-container">
        <Controls
          params={params}
          setParams={setParams}
          isRunning={isRunning}
          onStart={handleStart}
          onStop={handleStop}
          onReset={handleReset}
          runtime={runtime}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          samples={samples}
        />

        <div className="main-content">
          <div className="main-view">
            <ParticleView positions={positions} boxDimensions={BOX_DIMENSIONS} wavelength={params.wavelength} />
          </div>
          <Graphs
            intensityData={intensityHistory}
            correlationData={correlationData}
            distributionData={distributionData}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
