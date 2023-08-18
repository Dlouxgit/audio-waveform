
// 展示波形函数
// buffer - 解码后的音频数据
// 每秒绘制100个点，就是将每秒 44100 个点分成 100 份，
// 每一份算出最大值和最小值来代表每10毫秒内的波峰和波谷
function displayBuffer(draw, buff, width, perSecPx = 100) {
    // 波峰波谷增幅系数
    const height = 128;
    const halfHight = height / 2;
    const absmaxHalf = 1 / halfHight;
    // 获取所有波峰波谷
    const peaks = getPeaks(buff, perSecPx);
    // 设置svg的宽度
    const svgWidth = buff.duration * perSecPx;
    widthRate = svgWidth / 524
    draw.size(524, height * 2);
    const points = [];
    for (let i = 0; i < peaks.length; i += 2) {
        const peak1 = peaks[i] || 0;
        const peak2 = peaks[i + 1] || 0;
        // 波峰波谷乘上系数
        const h1 = Math.round(peak1 / absmaxHalf);
        const h2 = Math.round(peak2 / absmaxHalf);
        points.push([i , halfHight - h1]);
        points.push([i, halfHight - h2]);

        // 需要竖直波形图 or 略带倾斜的波形图？ 目前肉眼看来缩放后效果一致，但放大后略有区别，加上下面代码后会变成直线
        // points.push([i / widthRate, halfHight]);
        // points.push([(i+2) / widthRate, halfHight]);
    }
    // 连接所有的波峰波谷
    const polyline = draw.polyline(points);
    polyline.width(width);
    polyline.fill('none').stroke('black');
    
    // 测试缩放功能
    setTimeout(() => {
        zoom(draw, 1.5, width, polyline)
    }, 3000)
}

// 获取波峰波谷
function getPeaks(buffer, perSecPx) {
    const { numberOfChannels, sampleRate, length} = buffer;
    // 每一份的点数 = 44100 / 100 = 441
    console.log(sampleRate)
    const sampleSize = ~~(sampleRate / perSecPx);
    const first = 0;
    const last = ~~(length / sampleSize)
    const peaks = [];
    // 为方便起见只取左声道
    const chan = buffer.getChannelData(0);
    for (let i = first; i <= last; i++) {
        const start = i * sampleSize;
        const end = start + sampleSize;
        let min = 0;
        let max = 0;
        for (let j = start; j < end; j ++) {
            const value = chan[j];
            if (value > max) {
                max = value;
            }
            if (value < min) {
                min = value;
            }
        }
        // 波峰
        peaks[2 * i] = max;
        // 波谷
        peaks[2 * i + 1] = min;
    }
    return peaks;
}

// 缩放
function zoom(draw, scaleX, width, polyline) {
    draw.width(width * scaleX);
    polyline.width(width * scaleX);
}