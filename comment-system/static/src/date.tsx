import { useState, useEffect } from 'react';

export default function DateTimeDisplay() {
  return (
    <div className="card">
        <Clock></Clock>
        <DateDisplay></DateDisplay>
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16" stroke-width="0" fill="currentColor" stroke="currentColor" className="moon"><path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"></path><path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z"></path></svg>
      </div>
  )
}


function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 创建时间格式化器
  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  
  // 将时间拆分为各个部分
  const parts = formatter.formatToParts(time);
  
  // 提取时间部分和AM/PM部分
  const timeParts = [];
  let period = '';
  
  for (const part of parts) {
    if (part.type === 'dayPeriod') {
      period = part.value.toUpperCase(); // 转换为大写
    } else {
      timeParts.push(part.value);
    }
  }
  
  // 合并时间部分（小时、分钟、秒）
  const timeString = timeParts.join('');

  return (
    <p className='time-text'>
      <span className='time-text'>{timeString}</span>
      <span className='time-sub-text'>{period}</span>
    </p>
  );
}

function DateDisplay() {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 获取星期名称
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  
  // 获取月份名称
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  
  // 获取日期数字
  const day = date.getDate();
  
  // 添加日期序数后缀
  interface GetDayWithSuffix {
    (day: number): string;
  }

  const getDayWithSuffix: GetDayWithSuffix = (day: number): string => {
    if (day > 3 && day < 21) return `${day}th`; // 11th-13th例外规则
    switch (day % 10) {
      case 1: return `${day}st`;
      case 2: return `${day}nd`;
      case 3: return `${day}rd`;
      default: return `${day}th`;
    }
  };

  return <p className='day-text'>{weekday}, {month} {getDayWithSuffix(day)}</p>;
}