import { formatReportText } from './report-text';
import { ReportRow } from './daily-run';

describe('formatReportText (S30 : copie du bilan)', () => {
  it('écrit le titre puis une ligne par membre, avec le dépassement seulement quand il existe', () => {
    const rows: ReportRow[] = [
      { name: 'Léa', passed: false, spokenSeconds: 150, allottedSeconds: 120, overrunSeconds: 30 },
      { name: 'Tom', passed: true, spokenSeconds: null, allottedSeconds: 60, overrunSeconds: 0 },
      { name: 'Ana', passed: false, spokenSeconds: 30, allottedSeconds: 180, overrunSeconds: 0 },
    ];
    expect(formatReportText('Équipe Alpha', '09/11/2026', rows)).toBe(
      [
        'Daily : Équipe Alpha, 09/11/2026',
        'Léa : 02:30 parlé, 02:00 alloué, +00:30 de dépassement',
        'Tom : passé',
        'Ana : 00:30 parlé, 03:00 alloué',
      ].join('\n'),
    );
  });
});
