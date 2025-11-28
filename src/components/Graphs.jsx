import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();

    const correlationOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: t('graphs.intensityCorrelation'),
                color: '#f8fafc',
                font: { size: 14, weight: 'bold' }
            },
        },
        scales: {
            x: {
                type: 'logarithmic',
                min: 0.00001,
                max: 0.01,
                title: { display: true, text: t('graphs.delayTime'), color: '#94a3b8' },
                ticks: { color: '#94a3b8' },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
            },
            y: {
                min: 0.8,
                max: 2.0,
                title: { display: true, text: t('graphs.correlation'), color: '#94a3b8' },
                ticks: { color: '#94a3b8' },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
            }
        },
        elements: {
            point: { radius: 0 },
            line: { borderWidth: 2 }
        }
    }), [t]);

    const distributionOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: t('graphs.sizeDistribution'),
                color: '#f8fafc',
                font: { size: 14, weight: 'bold' }
            },
        },
        scales: {
            x: {
                type: 'linear',
                min: 0,
                max: 1200,
                title: { display: true, text: t('graphs.particleDiameterNm'), color: '#94a3b8' },
                ticks: { color: '#94a3b8' },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
            },
            y: {
                title: { display: true, text: t('graphs.distribution'), color: '#94a3b8' },
                ticks: { color: '#94a3b8' },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
            }
        },
        elements: {
            point: { radius: 0 },
            line: { borderWidth: 2 }
        }
    }), [t]);

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
