/**
 * Конвертер данных BTC/USDT из CSV в формат TradingVue.js
 * Формат OHLCV: [timestamp, open, high, low, close, volume]
 */

const fs = require('fs');
const path = require('path');

// Читаем CSV файл
function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');

    // Пропускаем заголовок (первые 2 строки)
    const dataLines = lines.slice(2);

    const ohlcv = [];

    for (const line of dataLines) {
        if (!line.trim()) continue;

        const parts = line.split(',');
        let unix = parseInt(parts[0]);

        // Исправляем timestamps в микросекундах (делим на 1000)
        if (unix > 2000000000000) {
            unix = Math.floor(unix / 1000);
        }

        // Пропускаем аномальные timestamps
        if (unix < 1400000000000 || unix > 2000000000000) {
            continue;
        }

        const open = parseFloat(parts[3]);
        const high = parseFloat(parts[4]);
        const low = parseFloat(parts[5]);
        const close = parseFloat(parts[6]);
        const volume = parseFloat(parts[8]); // Volume USDT

        // Проверяем валидность данных
        if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
            continue;
        }

        ohlcv.push([unix, open, high, low, close, volume]);
    }

    // Сортируем по времени (от старых к новым)
    ohlcv.sort((a, b) => a[0] - b[0]);

    // Удаляем дубликаты
    const uniqueOhlcv = [];
    const seen = new Set();
    for (const candle of ohlcv) {
        const key = candle[0];
        if (!seen.has(key)) {
            seen.add(key);
            uniqueOhlcv.push(candle);
        }
    }

    return uniqueOhlcv;
}

// Конвертируем данные
function convertData() {
    const dailyPath = path.join(__dirname, '../../../download/Binance_BTCUSDT_daily.csv');
    const hourlyPath = path.join(__dirname, '../../../download/Binance_BTCUSDT_hourly.csv');

    // Daily data
    console.log('Converting daily data...');
    const dailyData = parseCSV(dailyPath);
    console.log(`Daily candles: ${dailyData.length}`);
    console.log(`Date range: ${new Date(dailyData[0][0]).toISOString().split('T')[0]} - ${new Date(dailyData[dailyData.length-1][0]).toISOString().split('T')[0]}`);

    // Hourly data
    console.log('\nConverting hourly data...');
    const hourlyData = parseCSV(hourlyPath);
    console.log(`Hourly candles: ${hourlyData.length}`);
    console.log(`Date range: ${new Date(hourlyData[0][0]).toISOString().split('T')[0]} - ${new Date(hourlyData[hourlyData.length-1][0]).toISOString().split('T')[0]}`);

    // Сохраняем в формате TradingVue.js
    const outputDaily = {
        pair: 'BTC/USDT',
        exchange: 'Binance',
        timeframe: '1D',
        data: dailyData
    };

    const outputHourly = {
        pair: 'BTC/USDT',
        exchange: 'Binance',
        timeframe: '1h',
        data: hourlyData
    };

    const dailyOutPath = path.join(__dirname, 'data_btc_usdt_1d.json');
    const hourlyOutPath = path.join(__dirname, 'data_btc_usdt_1h.json');

    fs.writeFileSync(dailyOutPath, JSON.stringify(outputDaily, null, 2));
    fs.writeFileSync(hourlyOutPath, JSON.stringify(outputHourly));

    console.log('\nFiles saved:');
    console.log(`- ${dailyOutPath} (${(fs.statSync(dailyOutPath).size / 1024).toFixed(1)} KB)`);
    console.log(`- ${hourlyOutPath} (${(fs.statSync(hourlyOutPath).size / 1024 / 1024).toFixed(1)} MB)`);

    // Создаем мульти-таймфрейм данные
    console.log('\nGenerating additional timeframes...');

    // 4h данные (агрегация из часовых)
    const fourHourData = aggregateCandles(hourlyData, 4);
    console.log(`4h candles: ${fourHourData.length}`);

    // 15m данные (симуляция)
    const fifteenMinData = generateIntraHour(hourlyData, 4, 15);
    console.log(`15m candles: ${fifteenMinData.length}`);

    // 5m данные (симуляция)
    const fiveMinData = generateIntraHour(hourlyData.slice(-10000), 12, 5);
    console.log(`5m candles: ${fiveMinData.length}`);

    // 1m данные (симуляция, последние 20000 часовых = ~2 года)
    const oneMinData = generateIntraHour(hourlyData.slice(-5000), 60, 1);
    console.log(`1m candles: ${oneMinData.length}`);

    // Сохраняем все таймфреймы
    const timeframes = {
        '1m': oneMinData,
        '5m': fiveMinData,
        '15m': fifteenMinData,
        '1h': hourlyData,
        '4h': fourHourData,
        '1D': dailyData
    };

    for (const [tf, data] of Object.entries(timeframes)) {
        const outputPath = path.join(__dirname, `data_btc_usdt_${tf.toLowerCase() === '1d' ? '1d' : tf.toLowerCase()}.json`);
        const output = {
            pair: 'BTC/USDT',
            exchange: 'Binance',
            timeframe: tf,
            data: data
        };
        fs.writeFileSync(outputPath, JSON.stringify(output));
        console.log(`- ${outputPath} (${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB)`);
    }

    // Создаем объединенный файл с метаданными
    const allData = {
        pair: 'BTC/USDT',
        exchange: 'Binance',
        generated: new Date().toISOString(),
        timeframes: Object.keys(timeframes),
        stats: {
            dailyCandles: dailyData.length,
            hourlyCandles: hourlyData.length,
            dateRange: {
                start: new Date(dailyData[0][0]).toISOString(),
                end: new Date(dailyData[dailyData.length-1][0]).toISOString()
            },
            priceRange: {
                min: Math.min(...dailyData.map(d => d[3])),
                max: Math.max(...dailyData.map(d => d[2]))
            }
        }
    };

    const metadataPath = path.join(__dirname, 'data_btc_metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(allData, null, 2));
    console.log(`\nMetadata saved to: ${metadataPath}`);

    return allData.stats;
}

// Агрегация свечей
function aggregateCandles(data, multiplier) {
    const result = [];

    for (let i = 0; i < data.length; i += multiplier) {
        const chunk = data.slice(i, i + multiplier);
        if (chunk.length === 0) continue;

        const t = chunk[0][0];
        const o = chunk[0][1];
        const h = Math.max(...chunk.map(c => c[2]));
        const l = Math.min(...chunk.map(c => c[3]));
        const c = chunk[chunk.length - 1][4];
        const v = chunk.reduce((sum, c) => sum + c[5], 0);

        result.push([t, o, h, l, c, v]);
    }

    return result;
}

// Генерация внутрисессионных данных
function generateIntraHour(hourlyData, divisions, minutesPerCandle) {
    const result = [];

    for (const candle of hourlyData) {
        const [t, o, h, l, c, v] = candle;
        const range = h - l;
        const volPerCandle = v / divisions;

        let currentPrice = o;
        const priceStep = (c - o) / divisions;

        for (let i = 0; i < divisions; i++) {
            const newT = t + i * (minutesPerCandle * 60000);

            // Генерируем реалистичное движение цены
            const noise = (Math.random() - 0.5) * range * 0.3;
            const trend = priceStep * (i / divisions);

            const newOpen = i === 0 ? o : currentPrice;
            const newClose = i === divisions - 1 ? c : newOpen + trend + noise;
            const newHigh = Math.max(newOpen, newClose) + Math.random() * range * 0.1;
            const newLow = Math.min(newOpen, newClose) - Math.random() * range * 0.1;

            // Ограничиваем high/low в пределах исходной свечи
            const boundedHigh = Math.min(newHigh, h);
            const boundedLow = Math.max(newLow, l);

            result.push([newT, newOpen, boundedHigh, boundedLow, newClose, volPerCandle]);
            currentPrice = newClose;
        }
    }

    return result;
}

// Запускаем
const stats = convertData();
console.log('\n=== CONVERSION COMPLETE ===');
console.log(`Data covers ${stats.dateRange.start.split('T')[0]} to ${stats.dateRange.end.split('T')[0]}`);
console.log(`Price range: $${stats.priceRange.min.toFixed(2)} - $${stats.priceRange.max.toFixed(2)}`);
