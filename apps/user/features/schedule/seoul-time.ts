/** 서울 기준 그날 그 시각(ms). 기기 시간대와 상관없이 같은 순간을 가리킨다 */
export const at = (date: string, time: string) => new Date(`${date}T${time}:00+09:00`).getTime()
