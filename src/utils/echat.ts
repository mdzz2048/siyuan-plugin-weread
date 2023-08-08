function unixToDatetime(time) {
    let unixTime = new Date(time * 1000);
    return unixTime.getFullYear() + '-' + (unixTime.getMonth() + 1 ) + '-' + unixTime.getDate();
}

// todo: 将时长转化成小时、分钟格式，有小时显示：x小时x分钟，没小时显示：x分钟
function parseReadData(data) {
    let readTimes = data.readTimes;
    let sortedReadTimes = Object.keys(readTimes).sort();
    let echatsTemple = {
        title: {
          top: 30,
          left: 'center',
          text: '每日阅读时长'
        },
        tooltip: {},
        visualMap: {
          min: 0,
          max: 10000,
          type: 'piecewise',
          orient: 'horizontal',
          left: 'center',
          top: 65, 
          pieces: [
                  {min: 0, max: 900, label: '0-900', color: '#e2e4e6'},
                  {min: 900, max: 3600, label: '900-3600', color: '#acd5f2'},
                  {min: 3600, max: 7200, label: '3600-7200', color: '#7fa8c9'},
                  {min: 1000, label: '7200+', color: '#527ba0'}
              ]
        },
        calendar: {
          top: 120,
          left: 30,
          right: 30,
          cellSize: ['auto', 13],
          range: '2023',
          itemStyle: {
            borderWidth: 0.5
          },
          yearLabel: { show: false }
        },
        series: {
          type: 'heatmap',
          coordinateSystem: 'calendar',
          data: {}
        }
    }
    let time_arr = [];
    for (let readtime of sortedReadTimes) {
        let time_str = unixToDatetime(readtime);
    
        if (time_str.startsWith('2023')) {
            time_arr.push([time_str, readTimes[readtime]])
        }
    }
    echatsTemple.series.data = time_arr;
    return echatsTemple;
}