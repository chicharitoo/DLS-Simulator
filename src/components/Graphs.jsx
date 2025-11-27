import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    LogarithmicScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    LogarithmicScale
);

const Graphs = ({ intensityData, correlationData, distributionData }) => {

    const intensityOptions = {
        responsive: true,
        animation: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Scattered Intensity I(t)' },
        },
        scales: {
            x: {
                display: true,
                title: { display: true, text: 'Time (frames)', color: '#94a3b8' },
                ticks: { color: '#94a3b8' }
            },
            y: {
                min: 0.8,
                title: { display: true, text: 'Intensity (a.u.)', color: '#94a3b8' },
                ticks: { color: '#94a3b8' }
            }
        },
        elements: {
            point: { radius: 0 }
        }
    };

    const correlationOptions = {
        responsive: true,
        animation: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Intensity Autocorrelation g2(τ)' },
        },
        scales: {
            x: {
                type: 'logarithmic',
                title: { display: true, text: 'Lag time τ (s)', color: '#94a3b8' },
                ticks: { color: '#94a3b8' },
                min: 1e-5,
                max: 0.1
            },
            y: {
                min: 0.8,
                max: 2,
                title: { display: true, text: 'g2(τ)', color: '#94a3b8' },
                ticks: { color: '#94a3b8' }
            }
        },
        elements: {
            point: { radius: 2 }
        }
    };

    const distributionOptions = {
        responsive: true,
        animation: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Size Distribution' },
            tooltip: {
                enabled: true,
                callbacks: {
                    title: (context) => {
                        const val = context[0].parsed.x;
                        return `Diameter: ${val.toFixed(1)} nm`;
                    },
                    label: (context) => {
                        return `Density: ${context.parsed.y.toFixed(4)}`;
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        scales: {
            x: {
                type: 'logarithmic',
                title: { display: true, text: 'Diameter (nm)', color: '#94a3b8' },
                ticks: { color: '#94a3b8' },
                min: 1,
                max: 10000
            },
            y: {
                title: { display: true, text: 'Rel. Abundance', color: '#94a3b8' },
                ticks: { display: false } // Normalize visual
            }
        },
        elements: {
            point: { radius: 0 }
        }
    };

    const intensityChartData = useMemo(() => ({
        labels: intensityData.map((_, i) => i),
        datasets: [
            {
                label: 'Intensity',
                data: intensityData,
                borderColor: 'rgb(0, 212, 255)',
                backgroundColor: 'rgba(0, 212, 255, 0.5)',
                borderWidth: 1,
            },
        ],
    }), [intensityData]);

    // Assume lags are passed or calculated. For visualization, we use index as proxy or pass real time.
    // Worker DT = 0.000002s
    const dt = 0.000002;

    const correlationChartData = useMemo(() => {
        const labels = correlationData.map((_, i) => i * dt).filter((_, i) => i > 0);
        const data = correlationData.filter((_, i) => i > 0);

        return {
            labels: labels,
            datasets: [
                {
                    label: 'Experimental g2(τ)',
                    data: data,
                    borderColor: 'rgb(244, 63, 94)',
                    backgroundColor: 'rgba(244, 63, 94, 0.5)',
                    borderWidth: 2,
                }
            ]
        };
    }, [correlationData]);

    const distributionChartData = useMemo(() => {
        return {
            labels: distributionData.map(d => d.x),
            datasets: [
                {
                    label: 'Distribution',
                    data: distributionData.map(d => d.y),
                    backgroundColor: 'rgba(34, 197, 94, 0.5)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 2,
                    fill: true
                }
            ]
        };
    }, [distributionData]);

    return (
        <div className="graphs-view">
            <div className="graph-container" style={{ gridColumn: '1 / -1', height: '200px' }}>
                <Line options={intensityOptions} data={intensityChartData} />
            </div>
            <div className="graph-container" style={{ height: '300px' }}>
                <Line options={correlationOptions} data={correlationChartData} />
            </div>
            <div className="graph-container" style={{ height: '300px' }}>
                <Line options={distributionOptions} data={distributionChartData} />
            </div>
        </div>
    );
};

export default Graphs;
