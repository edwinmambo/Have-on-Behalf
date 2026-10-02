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

    final pinnedHymns = storage.pinnedHymns
        .map((id) => repo.getHymnById(id))
        .where((h) => h != null)
        .cast<Hymn>()
        .toList();

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            'Saved & Worship History',
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
                icon: const Icon(Icons.bookmark_rounded, size: 18),
                text: 'Bookmarks (${favoriteHymns.length})',
              ),
              Tab(
                icon: const Icon(Icons.push_pin_rounded, size: 18),
                text: 'Pinned (${pinnedHymns.length})',
              ),
              Tab(
                icon: const Icon(Icons.history_rounded, size: 18),
                text: 'History (${storage.history.length})',
              ),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            // 1. Favorites List
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
                          title: Text(hymn.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text('${hymn.collection} · Key: ${hymn.key ?? "C"} · ${hymn.stanzas.length} stanzas'),
                          trailing: IconButton(
                            icon: const Icon(Icons.bookmark_remove_rounded, color: Colors.redAccent),
                            tooltip: 'Remove bookmark',
                            onPressed: () => storage.toggleFavorite(hymn.id),
                          ),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => HymnDetailScreen(hymn: hymn)),
                            );
                          },
                        ),
                      );
                    },
                  ),

            // 2. Pinned Hymns List
            pinnedHymns.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.push_pin_outlined, size: 48, color: Colors.amber),
                        const SizedBox(height: 12),
                        Text(
                          'No hymns pinned for Sabbath yet.\nTap the pin icon on any hymn for 1-tap quick access.',
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
                    itemCount: pinnedHymns.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final hymn = pinnedHymns[index];
                      return Card(
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                          leading: Container(
                            width: 44,
                            height: 38,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: Colors.amber.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: Colors.amber.withOpacity(0.4)),
                            ),
                            child: Text(
                              '#${hymn.number}',
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Colors.amber,
                              ),
                            ),
                          ),
                          title: Text(hymn.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text('Sabbath Selection · ${hymn.collection}'),
                          trailing: IconButton(
                            icon: const Icon(Icons.close_rounded, color: Colors.grey),
                            tooltip: 'Unpin hymn',
                            onPressed: () => storage.togglePin(hymn.id),
                          ),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => HymnDetailScreen(hymn: hymn)),
                            );
                          },
                        ),
                      );
                    },
                  ),

            // 3. History List
            storage.history.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.history_rounded, size: 48, color: Colors.grey.withOpacity(0.5)),
                        const SizedBox(height: 12),
                        Text(
                          'No hymn viewing history yet.\nOpened hymns will automatically be logged here.',
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
                    itemCount: storage.history.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final item = storage.history[index];
                      final id = item['id'] as String;
                      final hymn = repo.getHymnById(id);

                      return Card(
                        child: ListTile(
                          leading: const Icon(Icons.music_note_rounded),
                          title: Text(item['title'] as String, style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text('${item['collection']} #${item['number']}'),
                          trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14),
                          onTap: () {
                            if (hymn != null) {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => HymnDetailScreen(hymn: hymn)),
                              );
                            }
                          },
                        ),
                      );
                    },
                  ),
          ],
        ),
      ),
    );
  }
}
