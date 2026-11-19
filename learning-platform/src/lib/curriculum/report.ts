import { getBrokenLinks } from './links';
import { getCurriculum } from './scan';

/** Log curriculum ingestion summary during builds (does not modify docs). */
export function logCurriculumReport(): void {
  const graph = getCurriculum();
  const chapterCount = graph.domains.reduce((s, d) => s + d.chapters.length, 0);
  const docCount = graph.domains.reduce(
    (s, d) => s + d.chapters.reduce((cs, ch) => cs + ch.documents.length, 0),
    0,
  );
  console.log(
    `[curriculum] domains=${graph.domains.length} chapters=${chapterCount} teachingDocs=${docCount}`,
  );
  const broken = getBrokenLinks();
  if (broken.length) {
    console.warn(`[curriculum] unresolved markdown links: ${broken.length}`);
    for (const item of broken.slice(0, 25)) {
      console.warn(`  - ${item.source} → ${item.target} (${item.reason})`);
    }
    if (broken.length > 25) console.warn(`  … and ${broken.length - 25} more`);
  }
}
