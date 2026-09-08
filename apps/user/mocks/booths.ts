export type Zone = 'A' | 'B' | 'C' | 'D'

export type Booth = {
  id: string
  zone: Zone
  number: number
  /** 배치 도면 좌표 (390 × 329), 좌상단 원점. 지도 이미지 좌표로는 fromSource 가 옮긴다. */
  x: number
  y: number
}

export const BOOTHS: Booth[] = [
  // A구역
  { id: 'A-1', zone: 'A', number: 1, x: 136.7, y: 46.1 },
  { id: 'A-2', zone: 'A', number: 2, x: 108.0, y: 55.0 },
  { id: 'A-3', zone: 'A', number: 3, x: 113.2, y: 69.4 },
  { id: 'A-4', zone: 'A', number: 4, x: 117.3, y: 77.5 },
  { id: 'A-5', zone: 'A', number: 5, x: 121.4, y: 85.6 },
  { id: 'A-6', zone: 'A', number: 6, x: 85.6, y: 69.4 },
  { id: 'A-7', zone: 'A', number: 7, x: 85.6, y: 77.5 },
  { id: 'A-8', zone: 'A', number: 8, x: 85.6, y: 85.6 },
  { id: 'A-9', zone: 'A', number: 9, x: 95.7, y: 93.7 },
  { id: 'A-10', zone: 'A', number: 10, x: 103.9, y: 93.7 },
  { id: 'A-11', zone: 'A', number: 11, x: 112.1, y: 93.7 },
  { id: 'A-12', zone: 'A', number: 12, x: 132.6, y: 96.7 },
  { id: 'A-13', zone: 'A', number: 13, x: 140.8, y: 96.7 },
  { id: 'A-14', zone: 'A', number: 14, x: 149.0, y: 96.7 },

  // B구역
  { id: 'B-1', zone: 'B', number: 1, x: 65.1, y: 120.0 },
  { id: 'B-2', zone: 'B', number: 2, x: 65.1, y: 127.1 },
  { id: 'B-3', zone: 'B', number: 3, x: 65.1, y: 134.2 },
  { id: 'B-4', zone: 'B', number: 4, x: 65.1, y: 141.3 },
  { id: 'B-5', zone: 'B', number: 5, x: 75.1, y: 120.0 },
  { id: 'B-6', zone: 'B', number: 6, x: 75.1, y: 127.2 },
  { id: 'B-7', zone: 'B', number: 7, x: 75.1, y: 134.4 },
  { id: 'B-8', zone: 'B', number: 8, x: 75.1, y: 141.6 },
  { id: 'B-9', zone: 'B', number: 9, x: 80.4, y: 163.8 },
  { id: 'B-10', zone: 'B', number: 10, x: 87.5, y: 163.8 },
  { id: 'B-11', zone: 'B', number: 11, x: 94.7, y: 163.8 },
  { id: 'B-12', zone: 'B', number: 12, x: 101.8, y: 163.8 },
  { id: 'B-13', zone: 'B', number: 13, x: 109.0, y: 163.8 },
  { id: 'B-14', zone: 'B', number: 14, x: 116.1, y: 163.8 },
  { id: 'B-15', zone: 'B', number: 15, x: 65.1, y: 174.9 },
  { id: 'B-16', zone: 'B', number: 16, x: 65.1, y: 181.9 },
  { id: 'B-17', zone: 'B', number: 17, x: 113.2, y: 227.6 },

  // C구역
  { id: 'C-1', zone: 'C', number: 1, x: 129.6, y: 110.0 },
  { id: 'C-2', zone: 'C', number: 2, x: 142.8, y: 110.0 },
  { id: 'C-3', zone: 'C', number: 3, x: 150.0, y: 110.0 },
  { id: 'C-4', zone: 'C', number: 4, x: 157.3, y: 110.0 },
  { id: 'C-5', zone: 'C', number: 5, x: 164.6, y: 110.0 },
  { id: 'C-6', zone: 'C', number: 6, x: 173.3, y: 97.8 },
  { id: 'C-7', zone: 'C', number: 7, x: 180.5, y: 97.8 },
  { id: 'C-8', zone: 'C', number: 8, x: 187.8, y: 97.8 },
  { id: 'C-9', zone: 'C', number: 9, x: 180.9, y: 109.4 },
  { id: 'C-10', zone: 'C', number: 10, x: 188.2, y: 109.4 },
  { id: 'C-11', zone: 'C', number: 11, x: 195.5, y: 109.4 },
  { id: 'C-12', zone: 'C', number: 12, x: 223.2, y: 109.8 },
  { id: 'C-13', zone: 'C', number: 13, x: 218.9, y: 116.9 },
  { id: 'C-14', zone: 'C', number: 14, x: 253.9, y: 110.0 },

  // D구역
  { id: 'D-1', zone: 'D', number: 1, x: 268.2, y: 59.0 },
  { id: 'D-2', zone: 'D', number: 2, x: 277.6, y: 59.4 },
  { id: 'D-3', zone: 'D', number: 3, x: 286.7, y: 59.0 },
  { id: 'D-4', zone: 'D', number: 4, x: 296.0, y: 59.2 },
  { id: 'D-5', zone: 'D', number: 5, x: 305.2, y: 59.0 },
  { id: 'D-6', zone: 'D', number: 6, x: 321.6, y: 70.5 },
  { id: 'D-7', zone: 'D', number: 7, x: 321.6, y: 78.6 },
  { id: 'D-8', zone: 'D', number: 8, x: 321.6, y: 86.7 },
  { id: 'D-9', zone: 'D', number: 9, x: 305.2, y: 100.7 },
  { id: 'D-10', zone: 'D', number: 10, x: 295.8, y: 100.7 },
  { id: 'D-11', zone: 'D', number: 11, x: 286.5, y: 100.7 },
  { id: 'D-12', zone: 'D', number: 12, x: 277.6, y: 100.7 },
  { id: 'D-13', zone: 'D', number: 13, x: 268.2, y: 100.7 },
]
