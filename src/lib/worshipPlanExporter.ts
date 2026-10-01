import { jsPDF } from 'jspdf';
import { WorshipPlanSession, Hymn } from '../types';
import { getKeySignatureInfo } from './audioPiano';

/**
 * Generates a clean filename slug from session title
 */
export function getSessionFileSlug(session: WorshipPlanSession): string {
  const safeTitle = session.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const dateStr = session.date ? `_${session.date.replace(/[^a-z0-9]+/g, '-')}` : '';
  return `${safeTitle || 'worship_session'}${dateStr}`;
}

/**
 * Builds structured plain text representation of the worship session
 */
export function formatSessionAsText(
  session: WorshipPlanSession,
  hymnsCatalog: Hymn[] = []
): string {
  const lines: string[] = [];
  const divider = '========================================================================';
  const subDivider = '------------------------------------------------------------------------';

  lines.push(divider);
  lines.push(`WORSHIP SERVICE ORDER OF MUSIC & LITURGY`);
  lines.push(divider);
  lines.push(`Service Title : ${session.title}`);
  lines.push(`Service Date  : ${session.date || 'Scheduled Service'}`);
  lines.push(`Song Leader   : ${session.leaderName || 'Worship Chorister'}`);
  if (session.description) {
    lines.push(`Theme / Notes : ${session.description}`);
  }
  lines.push(`Total Songs   : ${session.items.length} items`);
  lines.push(subDivider);
  lines.push('');

  if (session.items.length === 0) {
    lines.push('  (No hymns currently scheduled in this worship session)');
  } else {
    session.items.forEach((item, idx) => {
      const hymn = hymnsCatalog.find((h) => h.id === item.hymnId);
      const effectiveKey = item.transposedKey || item.key || 'C';
      const keySig = getKeySignatureInfo(item.key, item.transposeSemiTones || 0);

      lines.push(`${idx + 1}. [${item.collection} #${item.number}] ${item.title}`);
      
      let keyLine = `   Key: ${effectiveKey}`;
      if (item.transposeSemiTones && item.transposeSemiTones !== 0) {
        keyLine += ` (${item.transposeSemiTones > 0 ? '+' : ''}${item.transposeSemiTones} semitones from original ${item.key || 'standard'})`;
      }
      keyLine += ` • Signature: ${keySig.symbol} (${keySig.accidentalsSummary})`;
      lines.push(keyLine);

      if (hymn?.tune) {
        lines.push(`   Tune: ${hymn.tune}${hymn.meter ? ` (${hymn.meter})` : ''}`);
      }
      if (hymn?.author) {
        lines.push(`   Author/Composer: ${hymn.author}`);
      }
      if (hymn?.scriptureReference) {
        lines.push(`   Scripture Anchor: ${hymn.scriptureReference}`);
      }
      if (item.stanzasToSing && item.stanzasToSing.length > 0) {
        lines.push(`   Stanzas to Sing: ${item.stanzasToSing.join(', ')}`);
      }
      if (item.notes) {
        lines.push(`   Chorister Cue: "${item.notes}"`);
      }
      lines.push('');
    });
  }

  lines.push(divider);
  lines.push(`Prepared via Have On Behalf — Multilingual Adventist Hymnal & Worship Companion`);
  lines.push(`Collections: SDAH (English), NZK (Kiswahili), NCA (Gĩkũyũ), WNY (Dholuo), OKN (Ekegusii)`);
  lines.push(divider);

  return lines.join('\n');
}

/**
 * Downloads a string content as a plain text (.txt) file
 */
export function downloadSessionAsTextFile(
  session: WorshipPlanSession,
  hymnsCatalog: Hymn[] = []
): void {
  const textContent = formatSessionAsText(session, hymnsCatalog);
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${getSessionFileSlug(session)}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a structured, publication-grade PDF of the worship plan
 */
export function downloadSessionAsPdf(
  session: WorshipPlanSession,
  hymnsCatalog: Hymn[] = []
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  let y = margin;

  // Header Banner
  doc.setFillColor(245, 158, 11); // Amber 500
  doc.rect(margin, y, pageWidth - margin * 2, 2.5, 'F');
  y += 7;

  // Header Category / Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(180, 83, 9); // Amber 700
  doc.text('SEVENTH-DAY ADVENTIST LITURGICAL WORSHIP ORDER', margin, y);
  y += 6;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Slate 900
  const titleLines = doc.splitTextToSize(session.title, pageWidth - margin * 2);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 7 + 1;

  // Metadata Card
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(margin, y, pageWidth - margin * 2, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text(`Service Date: ${session.date || 'Scheduled'}`, margin + 4, y + 6);
  doc.text(`Chorister / Leader: ${session.leaderName || 'Worship Ministry'}`, margin + 4, y + 12);

  const totalSongsText = `Total Items: ${session.items.length} songs`;
  doc.text(totalSongsText, pageWidth - margin - 4 - doc.getTextWidth(totalSongsText), y + 6);
  const createdDateText = `Generated: ${new Date().toLocaleDateString()}`;
  doc.text(createdDateText, pageWidth - margin - 4 - doc.getTextWidth(createdDateText), y + 12);

  y += 24;

  // Section Header: Program Sequence
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('ORDER OF HYMNS & CONGREGATIONAL MUSIC', margin, y);
  y += 4;
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  if (session.items.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('No hymns have been added to this worship session yet.', margin, y);
  } else {
    session.items.forEach((item, index) => {
      // Check for page overflow
      if (y > pageHeight - 35) {
        doc.addPage();
        y = margin;
      }

      const hymn = hymnsCatalog.find((h) => h.id === item.hymnId);
      const effectiveKey = item.transposedKey || item.key || 'C';
      const keySig = getKeySignatureInfo(item.key, item.transposeSemiTones || 0);

      // Item Badge Container
      doc.setFillColor(index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 250);
      doc.setDrawColor(226, 232, 240);
      const startItemY = y;

      // Index number circle/box
      doc.setFillColor(245, 158, 11);
      doc.roundedRect(margin, y, 6.5, 6.5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      const numStr = (index + 1).toString();
      doc.text(numStr, margin + 3.25 - doc.getTextWidth(numStr) / 2, y + 4.6);

      // Hymn Title & Collection Number
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      const titleText = `${item.title}`;
      doc.text(titleText, margin + 9, y + 4.8);

      // Collection Tag
      const collTag = `[${item.collection} #${item.number}]`;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(180, 83, 9);
      doc.text(collTag, pageWidth - margin - doc.getTextWidth(collTag), y + 4.8);

      y += 8;

      // Key, Transpose, Key Signature row
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      
      let keyDisplay = `Musical Key: ${effectiveKey}`;
      if (item.transposeSemiTones && item.transposeSemiTones !== 0) {
        keyDisplay += ` (${item.transposeSemiTones > 0 ? '+' : ''}${item.transposeSemiTones} st from ${item.key || 'Orig'})`;
      }
      keyDisplay += `   |   Key Signature: ${keySig.symbol} (${keySig.accidentalsSummary})`;
      doc.text(keyDisplay, margin + 9, y);
      y += 4.5;

      // Musical Tune & Scripture
      const details: string[] = [];
      if (hymn?.tune) details.push(`Tune: ${hymn.tune}${hymn.meter ? ` (${hymn.meter})` : ''}`);
      if (hymn?.scriptureReference) details.push(`Scripture: ${hymn.scriptureReference}`);
      if (details.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(details.join('   •   '), margin + 9, y);
        y += 4.2;
      }

      // Notes / Stanzas to sing
      if (item.notes || (item.stanzasToSing && item.stanzasToSing.length > 0)) {
        const cueParts: string[] = [];
        if (item.stanzasToSing && item.stanzasToSing.length > 0) {
          cueParts.push(`Stanzas: ${item.stanzasToSing.join(', ')}`);
        }
        if (item.notes) {
          cueParts.push(`"${item.notes}"`);
        }
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(180, 83, 9);
        doc.text(`Leader Note: ${cueParts.join(' — ')}`, margin + 9, y);
        y += 4.2;
      }

      y += 2.5;
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y, pageWidth - margin, y);
      y += 3.5;
    });
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);

    // Left attribution
    doc.text(
      'Pan-African Adventist Hymnody Companion (SDAH, NZK, WNY, OKN, NCA, KIN, CIS, KMN, ICB, SHO, UKE)',
      margin,
      pageHeight - 8
    );

    // Right page number
    const pageNumStr = `Page ${i} of ${totalPages}`;
    doc.text(pageNumStr, pageWidth - margin - doc.getTextWidth(pageNumStr), pageHeight - 8);
  }

  // Trigger download
  doc.save(`${getSessionFileSlug(session)}_worship_order.pdf`);
}
