import 'package:flutter/material.dart';
import '../models/hymn.dart';
import '../theme/liturgical_themes.dart';

class InterlinearStanzaCard extends StatelessWidget {
  final HymnStanza primaryStanza;
  final HymnStanza? parallelStanza;
  final String? parallelCollection;
  final int? parallelNumber;
  final bool showParallel;
  final Color accentColor;
  final bool useSerif;
  final double fontScale;

  const InterlinearStanzaCard({
    super.key,
    required this.primaryStanza,
    this.parallelStanza,
    this.parallelCollection,
    this.parallelNumber,
    this.showParallel = false,
    required this.accentColor,
    this.useSerif = false,
    this.fontScale = 1.0,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final isChorus = primaryStanza.isChorus;

    final containerColor = isChorus
        ? (isDark ? const Color(0xFF1E2638) : const Color(0xFFFEF9C3).withOpacity(0.35))
        : theme.cardTheme.color;

    final borderColor = isChorus
        ? accentColor.withOpacity(0.5)
        : theme.dividerColor;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 6),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: containerColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor, width: isChorus ? 1.5 : 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Tag
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: isChorus ? accentColor.withOpacity(0.15) : (isDark ? const Color(0xFF0F172A) : const Color(0xFFE2E8F0)),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              isChorus ? 'CHORUS / REFRAIN' : 'STANZA ${primaryStanza.number}',
              style: TextStyle(
                fontSize: 11 * fontScale,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.8,
                color: isChorus ? accentColor : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF475569)),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Primary Lyrics
          ...primaryStanza.lines.map((line) {
            final cleanLine = Hymn.cleanChordNotation(line);
            return Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Text(
                cleanLine,
                style: LiturgicalThemes.getHymnLyricsStyle(
                  useSerif: useSerif,
                  isDark: isDark,
                  fontSize: 16.0 * fontScale,
                  isChorus: isChorus,
                ),
              ),
            );
          }),

          // Inline Translated Interlinear Box (If Enabled)
          if (showParallel) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0F172A).withOpacity(0.7) : const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(10),
                border: Border(
                  left: BorderSide(color: accentColor, width: 3),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: accentColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '${parallelCollection ?? ""} #${parallelNumber ?? ""} Parallel Translation',
                        style: TextStyle(
                          fontSize: 11 * fontScale,
                          fontWeight: FontWeight.w700,
                          color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF475569),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (parallelStanza != null) ...[
                    ...parallelStanza!.lines.map((pLine) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Text(
                          Hymn.cleanChordNotation(pLine),
                          style: LiturgicalThemes.getHymnLyricsStyle(
                            useSerif: useSerif,
                            isDark: isDark,
                            fontSize: 14.5 * fontScale,
                            isChorus: isChorus,
                          ),
                        ),
                      );
                    }),
                  ] else ...[
                    Text(
                      'No direct parallel verse in this translation.',
                      style: TextStyle(
                        fontSize: 12 * fontScale,
                        fontStyle: FontStyle.italic,
                        color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
