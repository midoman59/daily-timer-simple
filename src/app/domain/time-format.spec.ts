import { formatClock } from './time-format';

describe('formatClock (S9)', () => {
  it('écrit les minutes et secondes sur deux chiffres', () => {
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(9)).toBe('00:09');
    expect(formatClock(900)).toBe('15:00');
    expect(formatClock(75 * 60)).toBe('75:00');
  });
});
