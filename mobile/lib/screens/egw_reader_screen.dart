import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../services/egw_service.dart';
import '../services/user_storage_service.dart';
import '../theme/liturgical_themes.dart';

class EgwReaderScreen extends StatelessWidget {
  const EgwReaderScreen({super.key});

  void _showBookPicker(BuildContext context) {
    final egwService = context.read<EgwService>();

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
                child: Text('Select Spirit of Prophecy Book', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
              const Divider(),
              ...egwService.books.map((b) {
                final isSelected = b.code == egwService.activeBookCode;
                return ListTile(
                  title: Text(b.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('${b.shortTitle} (${b.publicationYear}) · ${b.chapters.length} available chapters', style: const TextStyle(fontSize: 12)),
                  trailing: isSelected ? Icon(Icons.check_circle, color: Theme.of(context).colorScheme.primary) : null,
                  onTap: () {
                    egwService.selectBook(b.code);
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

  void _showChapterPicker(BuildContext context) {
    final egwService = context.read<EgwService>();
    final book = egwService.activeBook;

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
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Text('${book.shortTitle} — Chapters', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
              const Divider(),
              Expanded(
                child: ListView.builder(
                  itemCount: book.chapters.length,
                  itemBuilder: (_, cIdx) {
                    final ch = book.chapters[cIdx];
                    final isSelected = ch.number == egwService.activeChapterNumber;
                    return ListTile(
                      leading: CircleAvatar(
                        radius: 14,
                        backgroundColor: isSelected ? Theme.of(context).colorScheme.primary : Colors.grey.withOpacity(0.2),
                        child: Text('${ch.number}', style: TextStyle(fontSize: 12, color: isSelected ? Colors.white : null)),
                      ),
                      title: Text(ch.title, style: const TextStyle(fontWeight: FontWeight.w600)),
                      onTap: () {
                        egwService.selectChapter(ch.number);
                        Navigator.pop(ctx);
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final egwService = context.watch<EgwService>();
    final storage = context.watch<UserStorageService>();
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final accent = theme.colorScheme.primary;

    final book = egwService.activeBook;
    final chapter = egwService.activeChapter;
    final paragraphs = egwService.getParagraphsForActiveChapter();

    return Scaffold(
      appBar: AppBar(
        title: InkWell(
          onTap: () => _showBookPicker(context),
          borderRadius: BorderRadius.circular(8),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  book.shortTitle,
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
          TextButton.icon(
            onPressed: () => _showChapterPicker(context),
            icon: const Icon(Icons.bookmark_border_rounded, size: 16),
            label: Text('Ch. ${chapter.number}'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        children: [
          // Chapter Header Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: accent.withOpacity(0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: accent.withOpacity(0.2)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'CHAPTER ${chapter.number}',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2, color: accent),
                ),
                const SizedBox(height: 4),
                Text(
                  chapter.title,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                Text(
                  '${book.title} (${book.publicationYear})',
                  style: TextStyle(fontSize: 12, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Paragraphs
          ...List.generate(paragraphs.length, (pIdx) {
            final p = paragraphs[pIdx];
            return Padding(
              padding: const EdgeInsets.only(bottom: 18),
              child: InkWell(
                onLongPress: () {
                  final text = p.text;
                  Clipboard.setData(ClipboardData(text: '$text\n— Ellen G. White, ${book.title}, Ch. ${chapter.number} (${p.citation})'));
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Copied "${p.citation}" from ${book.shortTitle}!')),
                  );
                },
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      p.text,
                      style: LiturgicalThemes.getStanzaBodyStyle(
                        useSerif: storage.useSerif,
                        isDark: isDark,
                        scale: storage.fontScale,
                      ).copyWith(height: 1.65),
                    ),
                    if (p.citation.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        p.citation,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: accent.withOpacity(0.8),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
