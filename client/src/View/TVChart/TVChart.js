import './TVChart.css';
import {
	CrosshairMode,
	createChart,
	ColorType,
	LineStyle
} from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import useChartCtrl from './Controller/chartController';
import Input from '../Components/input';
import {
	chartOptions,
	seriesOptions,
	priceFormat,
	liqLineOptions,
	entryPLineOptions
} from './Controller/chartOptions';

export default function TVChart() {
	const chartRef = useRef();

	const [chart, setChart] = useState();
	const [series, setSeries] = useState();
	const [liqPriceLine, setLiqPriceLine] = useState();
	const [entryPriceLine, setEntryPriceLine] = useState();
	const { data, entryPrice, lastCandle } = useChartCtrl();
	const liqPrice = useSelector(state => state.outputs.liq_price);
	const handleResize = () => {
		chart.applyOptions({
			width: chartRef.current.clientWidth
		});
	};

	useEffect(
		() => {
			if (data) {
				setChart(
					createChart(chartRef.current, {
						...chartOptions,
						width: chartRef.current.clientWidth,
						height: chartRef.current.clientHeight
					})
				);
			}
		},
		[data]
	);

	useEffect(
		() => {
			if (chart) {
				const newSeries = chart.addCandlestickSeries({
					...seriesOptions
				});

				newSeries.setData(data);
				newSeries.applyOptions({
					priceFormat: priceFormat
				});
				setSeries(newSeries);
				window.addEventListener('resize', () => {
					handleResize();
				});
			}
			return () => {
				window.removeEventListener('resize', handleResize);

				chart && chart.remove();
			};
		},
		[chart]
	);

	useEffect(
		() => {
			if (series && liqPrice) {
				// series.removePriceLine(liqPriceLine);
				if (!liqPriceLine) {
					setLiqPriceLine(
						series.createPriceLine({
							price: liqPrice,
							...liqLineOptions
						})
					);
				} else {
					series.removePriceLine(liqPriceLine);
					setLiqPriceLine(
						series.createPriceLine({
							price: liqPrice,
							...liqLineOptions
						})
					);
				}
				if (!entryPriceLine) {
					setEntryPriceLine(
						series.createPriceLine({
							price: entryPrice,
							...entryPLineOptions
						})
					);
				} else {
					series.removePriceLine(entryPriceLine);
					setEntryPriceLine(
						series.createPriceLine({
							price: entryPrice,
							...entryPLineOptions
						})
					);
				}
			}
		},
		[liqPrice, entryPrice, series]
	);

	useEffect(
		() => {
			if (lastCandle && series) {
				series.update(lastCandle);
			}
		},
		[lastCandle]
	);
	return (
		<div className="chart-container">
			<Input
				name="interval"
				type="select"
				options={['1m', '5m', '15m', '30m', '1h', '4h', '1d']}
				defaultValue={'1h'}
			/>
			<Input
				name="symbol"
				type="select"
				options={[
					'BTCUSDT',
					'ETHUSDT',
					'LUNAUSDT',
					'SOLUSDT',
					'APEUSDT',
					'XRPUSDT',
					'TRXUSDT'
				]}
				defaultValue={'BTCUSDT'}
			/>
			<div className="tv-chart" ref={chartRef} />
		</div>
	);
}
