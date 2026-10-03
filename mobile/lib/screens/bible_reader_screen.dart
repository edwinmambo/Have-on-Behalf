import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../models/bible_model.dart';
import '../services/bible_service.dart';
import '../services/user_storage_service.dart';
import '../theme/liturgical_themes.dart';

class BibleReaderScreen extends StatelessWidget {
  const BibleReaderScreen({super.key});

  void _openVersionPicker(BuildContext context) {
    final bibleService = context.read<BibleService>();
    final theme = Theme.of(context);
    final accent = theme.colorScheme.primary;

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Text(
                  'Select Scripture Translation',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
              const Divider(),
              ...bibleService.versions.map((ver) {
                final isSelected = ver.id == bibleService.activeVersionId;
                return ListTile(
                  title: Text(ver.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text('${ver.language} · ${ver.description}', style: const TextStyle(fontSize: 12)),
                  trailing: isSelected ? Icon(Icons.check_circle, color: accent) : null,
                  onTap: () {
                    bibleService.setVersion(ver.id);
                    Navigator.pop(ctx);
                  },
                );
              }),
            ],
          ),
        ),
      ),
    );
  }

  void _openPassagePicker(BuildContext context) {
    final bibleService = context.read<BibleService>();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        expand: false,
        builder: (_, scrollController) => Column(
          children: [
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text(
                'Choose Book & Chapter',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: ListView.builder(
                controller: scrollController,
                itemCount: bibleService.books.length,
                itemBuilder: (context, idx) {
                  final book = bibleService.books[idx];
                  final isSelectedBook = book.id == bibleService.activeBookId;
                  return ExpansionTile(
                    initiallyExpanded: isSelectedBook,
                    title: Text(book.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${book.testament == "OT" ? "Old Testament" : "New Testament"} · ${book.totalChapters} Chapters'),
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: List.generate(
                            book.totalChapters > 30 ? 30 : book.totalChapters,
                            (cIdx) {
                              final chapNum = cIdx + 1;
                              final isCurrent = isSelectedBook && bibleService.activeChapter == chapNum;
                              return ActionChip(
                                label: Text('$chapNum'),
                                backgroundColor: isCurrent ? Theme.of(context).colorScheme.primary.withOpacity(0.2) : null,
                                side: BorderSide(
                                  color: isCurrent ? Theme.of(context).colorScheme.primary : Colors.grey.withOpacity(0.3),
                                ),
                                onPressed: () {
                                  bibleService.setPassage(bookId: book.id, chapter: chapNum);
                                  Navigator.pop(ctx);
                                },
                              );
                            },
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showVerseActions(BuildContext context, BibleVerse verse, String bookName, String versionId) {
    final storage = context.read<UserStorageService>();
    final theme = Theme.of(context);
    final citation = '$bookName ${verse.chapter}:${verse.verse} ($versionId)';

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                citation,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              Text(
                '"${verse.text}"',
                style: TextStyle(
                  fontSize: 13,
                  fontStyle: FontStyle.italic,
                  color: theme.colorScheme.onSurface.withOpacity(0.8),
                ),
              ),
              const Divider(height: 24),
              ListTile(
                leading: const Icon(Icons.copy_rounded),
                title: const Text('Copy Scripture Verse'),
                onTap: () {
                  Clipboard.setData(ClipboardData(text: '$citation\n"${verse.text}"'));
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Verse copied to clipboard!')),
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.cast_connected_rounded, color: Colors.amber),
                title: const Text('Project to Sanctuary Screen'),
                subtitle: const Text('Transmits verse immediately to church beam projector'),
                onTap: () {
                  storage.projectHymn(
                    citation,
                    verse.text,
                    1,
                  );
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Projected "$citation" to Sanctuary screen!')),
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.playlist_add_rounded),
                title: const Text('Add to Worship Service Plan'),
                onTap: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Added $citation to Service Agenda!')),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bibleService = context.watch<BibleService>();
    final storage = context.watch<UserStorageService>();
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final accent = theme.colorScheme.primary;

    final verses = bibleService.getVerses(bibleService.activeBookId, bibleService.activeChapter);
    final book = bibleService.activeBook;
    final version = bibleService.activeVersion;

    return Scaffold(
      appBar: AppBar(
        title: InkWell(
          onTap: () => _openPassagePicker(context),
          borderRadius: BorderRadius.circular(8),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '${book.name} ${bibleService.activeChapter}',
                  style: LiturgicalThemes.getHymnTitleStyle(
                    useSerif: storage.useSerif,
                    isDark: isDark,
                    fontSize: 18,
                  ),
                ),
                const SizedBox(width: 4),
                const Icon(Icons.arrow_drop_down, size: 20),
              ],
            ),
          ),
        ),
        actions: [
          // Version badge
          TextButton(
            onPressed: () => _openVersionPicker(context),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: accent.withOpacity(0.15),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: accent.withOpacity(0.4)),
              ),
              child: Text(
                version.id,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  color: accent,
                ),
              ),
            ),
          ),
          // Red Letter toggle
          IconButton(
            icon: Icon(
              Icons.format_color_text_rounded,
              color: bibleService.showRedLetter ? Colors.redAccent : Colors.grey,
            ),
            tooltip: 'Toggle Red-Letter Words of Christ',
            onPressed: () => bibleService.toggleRedLetter(),
          ),
          // Continuous reading toggle
          IconButton(
            icon: Icon(
              bibleService.continuousReading ? Icons.view_headline_rounded : Icons.format_list_numbered_rounded,
            ),
            tooltip: bibleService.continuousReading ? 'Numbered Verses' : 'Continuous Flow',
            onPressed: () => bibleService.toggleContinuousReading(),
          ),
        ],
      ),
      body: verses.isEmpty
          ? const Center(child: Text('Loading Holy Scripture...'))
          : ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              itemCount: verses.length,
              separatorBuilder: (_, __) => SizedBox(height: bibleService.continuousReading ? 6 : 14),
              itemBuilder: (context, idx) {
                final v = verses[idx];
                final isRed = bibleService.showRedLetter && v.isRedLetter;

                final textStyle = LiturgicalThemes.getStanzaBodyStyle(
                  useSerif: storage.useSerif,
                  isDark: isDark,
                  scale: storage.fontScale,
                ).copyWith(
                  color: isRed
                      ? (isDark ? const Color(0xFFF87171) : const Color(0xFFB91C1C))
                      : null,
                  fontWeight: isRed ? FontWeight.w500 : FontWeight.normal,
                );

                if (bibleService.continuousReading) {
                  return InkWell(
                    onTap: () => _showVerseActions(context, v, book.name, version.id),
                    child: Text.rich(
                      TextSpan(
                        children: [
                          TextSpan(
                            text: '${v.verse} ',
                            style: TextStyle(
                              fontSize: 10 * storage.fontScale,
                              fontWeight: FontWeight.bold,
                              color: accent.withOpacity(0.7),
                            ),
                          ),
                          TextSpan(text: v.text, style: textStyle),
                        ],
                      ),
                    ),
                  );
                }

                return InkWell(
                  onTap: () => _showVerseActions(context, v, book.name, version.id),
                  borderRadius: BorderRadius.circular(8),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 28,
                          margin: const EdgeInsets.only(top: 2),
                          child: Text(
                            '${v.verse}',
                            style: TextStyle(
                              fontSize: 11 * storage.fontScale,
                              fontWeight: FontWeight.bold,
                              color: accent,
                            ),
                          ),
                        ),
                        Expanded(
                          child: Text(
                            v.text,
                            style: textStyle,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
