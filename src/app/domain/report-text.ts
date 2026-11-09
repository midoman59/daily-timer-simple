import { ReportRow } from './daily-run';
import { formatClock } from './time-format';

/** Texte copié par « Copier le bilan » (S30) : un titre, puis une ligne par membre, dans l'ordre de passage. */
export function formatReportText(teamName: string, dateLabel: string, rows: readonly ReportRow[]): string {
  const lines = [`Daily : ${teamName}, ${dateLabel}`];
  for (const row of rows) {
    if (row.passed || row.spokenSeconds === null) {
      lines.push(`${row.name} : passé`);
      continue;
    }
    let line = `${row.name} : ${formatClock(row.spokenSeconds)} parlé, ${formatClock(row.allottedSeconds)} alloué`;
    if (row.overrunSeconds > 0) {
      line += `, +${formatClock(row.overrunSeconds)} de dépassement`;
    }
    lines.push(line);
  }
  return lines.join('\n');
}
