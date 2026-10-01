import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/hymn.dart';
import '../services/hymn_repository.dart';
import '../services/user_storage_service.dart';
import '../theme/liturgical_themes.dart';
import 'hymn_detail_screen.dart';

class FavoritesNotesScreen extends StatelessWidget {
  const FavoritesNotesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final storage = context.watch<UserStorageService>();
    final repo = context.watch<HymnRepository>();
    final accent = theme.colorScheme.primary;

    final favoriteHymns = storage.favorites
        .map((id) => repo.getHymnById(id))
        .where((h) => h != null)
        .cast<Hymn>()
        .toList();

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            'Saved Hymns & Liturgy Notes',
            style: LiturgicalThemes.getHymnTitleStyle(
              useSerif: storage.useSerif,
              isDark: isDark,
              fontSize: 18,
            ),
          ),
          bottom: TabBar(
            indicatorColor: accent,
            labelColor: accent,
            unselectedLabelColor: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
            tabs: [
              Tab(
                icon: const Icon(Icons.bookmark_rounded, size: 20),
                text: 'Bookmarks (${favoriteHymns.length})',
              ),
              const Tab(
                icon: Icon(Icons.edit_note_rounded, size: 20),
                text: 'Pastoral Notes',
              ),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            // Favorites List
            favoriteHymns.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.bookmark_border, size: 48, color: accent.withOpacity(0.5)),
                        const SizedBox(height: 12),
                        Text(
                          'No saved favorite hymns yet.\nTap the bookmark icon on any hymn to save.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 14,
                            color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: favoriteHymns.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final hymn = favoriteHymns[index];
                      return Card(
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                          leading: Container(
                            width: 44,
                            height: 38,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: accent.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: accent.withOpacity(0.35)),
                            ),
                            child: Text(
                              '#${hymn.number}',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: accent,
                              ),
                            ),
                          ),
                          title: Text(
                            hymn.title,
                            style: LiturgicalThemes.getHymnTitleStyle(
                              useSerif: storage.useSerif,
                              isDark: isDark,
                              fontSize: 14.5 * storage.fontScale,
                            ),
                          ),
                          subtitle: Text(
                            '${hymn.collection} · ${hymn.category ?? "General Liturgy"}',
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                            ),
                          ),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.delete_outline, size: 18),
                                tooltip: 'Remove Bookmark',
                                onPressed: () => storage.toggleFavorite(hymn.id),
                              ),
                              const Icon(Icons.chevron_right, size: 18),
                            ],
                          ),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => HymnDetailScreen(hymn: hymn),
                              ),
                            );
                          },
                        ),
                      );
                    },
                  ),

            // Notes List
            ListView(
              padding: const EdgeInsets.all(16),
              children: [
                ...storage.favorites.map((hymnId) {
                  final note = storage.getNote(hymnId);
                  final hymn = repo.getHymnById(hymnId);
                  if (note == null || hymn == null) return const SizedBox.shrink();

                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  '${hymn.collection} #${hymn.number} · ${hymn.title}',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.open_in_new, size: 18),
                                tooltip: 'Open Hymn Reader',
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => HymnDetailScreen(hymn: hymn),
                                    ),
                                  );
                                },
                              ),
                            ],
                          ),
                          const Divider(height: 12),
                          Text(
                            note,
                            style: TextStyle(
                              fontSize: 13.5 * storage.fontScale,
                              height: 1.5,
                              color: isDark ? const Color(0xFFE2E8F0) : const Color(0xFF1E293B),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
