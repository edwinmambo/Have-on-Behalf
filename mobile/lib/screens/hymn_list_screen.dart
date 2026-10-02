import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/hymn.dart';
import '../services/hymn_repository.dart';
import '../services/user_storage_service.dart';
import '../theme/liturgical_themes.dart';
import '../widgets/quick_keypad_dialog.dart';
import 'hymn_detail_screen.dart';

class HymnListScreen extends StatefulWidget {
  const HymnListScreen({super.key});

  @override
  State<HymnListScreen> createState() => _HymnListScreenState();
}

class _HymnListScreenState extends State<HymnListScreen> {
  HymnalCollection _activeCollection = HymnalCollection.sdah;
  String _searchQuery = '';
  String _selectedCategory = 'All';
  final TextEditingController _searchController = TextEditingController();

  void _openKeypad(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => QuickKeypadDialog(
        onSelectNumber: (num) {
          final repo = context.read<HymnRepository>();
          final match = repo.getHymnByNumber(_activeCollection, num);
          if (match != null) {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => HymnDetailScreen(hymn: match)),
            );
          } else {
            // Check cross-collection fallback
            Hymn? crossMatch;
            for (final col in HymnalCollection.values) {
              final h = repo.getHymnByNumber(col, num);
              if (h != null) {
                crossMatch = h;
                break;
              }
            }
            if (crossMatch != null) {
              setState(() {
                _activeCollection = HymnalCollection.fromString(crossMatch!.collection);
              });
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => HymnDetailScreen(hymn: crossMatch!)),
              );
            } else {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Hymn #$num not found in ${_activeCollection.code}.'),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            }
          }
        },
      ),
    );
  }

  void _quickAddToPlan(BuildContext context, Hymn hymn) {
    final storage = context.read<UserStorageService>();
    final activePlan = storage.activePlan;
    if (activePlan == null) return;

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Add to ${activePlan.title}',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  '#${hymn.number} ${hymn.title} (${hymn.collection})',
                  style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.primary),
                ),
                const SizedBox(height: 16),
                ListTile(
                  leading: const Icon(Icons.music_note),
                  title: const Text('As Opening Hymn'),
                  onTap: () {
                    storage.addHymnToActivePlan(hymn, itemRole: 'Opening Hymn');
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Added #${hymn.number} to ${activePlan.title}')),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.queue_music),
                  title: const Text('As Song Service Hymn'),
                  onTap: () {
                    storage.addHymnToActivePlan(hymn, itemRole: 'Song Service');
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Added #${hymn.number} to ${activePlan.title}')),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.check_circle_outline),
                  title: const Text('As Closing Hymn'),
                  onTap: () {
                    storage.addHymnToActivePlan(hymn, itemRole: 'Closing Hymn');
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Added #${hymn.number} to ${activePlan.title}')),
                    );
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final repo = context.watch<HymnRepository>();
    final storage = context.watch<UserStorageService>();
    final accent = theme.colorScheme.primary;

    if (!repo.isInitialized) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(color: accent),
              const SizedBox(height: 16),
              Text(
                'Loading Offline Sanctuary Hymnals...',
                style: LiturgicalThemes.getHymnTitleStyle(
                  useSerif: storage.useSerif,
                  isDark: isDark,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      );
    }

    final hymns = repo.searchHymns(
      collection: _activeCollection,
      query: _searchQuery,
      category: _selectedCategory,
    );

    final categories = repo.getCategories(_activeCollection);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Have On Behalf',
              style: LiturgicalThemes.getHymnTitleStyle(
                useSerif: storage.useSerif,
                isDark: isDark,
                fontSize: 18,
              ),
            ),
            Text(
              '${_activeCollection.fullName} (${_activeCollection.languageName})',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
              ),
            ),
          ],
        ),
        actions: [
          // Instant Dark / Light Mode Toggle Button
          IconButton(
            icon: Icon(
              storage.isDarkMode ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
              size: 22,
            ),
            tooltip: storage.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
            onPressed: () => storage.toggleDarkMode(),
          ),
          // Instant Hymn Keypad Jump
          IconButton(
            icon: const Icon(Icons.dialpad, size: 22),
            tooltip: 'Jump to Hymn #',
            onPressed: () => _openKeypad(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // Collection Selector (Scrollable horizontally so it never overflows)
          Container(
            height: 48,
            padding: const EdgeInsets.symmetric(vertical: 6),
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              border: Border(bottom: BorderSide(color: theme.dividerColor)),
            ),
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: [
                _buildCollectionTab(HymnalCollection.sdah, 'SDAH (English)', accent),
                const SizedBox(width: 8),
                _buildCollectionTab(HymnalCollection.nzk, 'NZK (Swahili)', accent),
                const SizedBox(width: 8),
                _buildCollectionTab(HymnalCollection.wny, 'WNY (Dholuo)', accent),
                const SizedBox(width: 8),
                _buildCollectionTab(HymnalCollection.okn, 'OKN (Ekegusii)', accent),
                const SizedBox(width: 8),
                _buildCollectionTab(HymnalCollection.kin, 'KIN (Kinyarwanda)', accent),
                const SizedBox(width: 8),
                _buildCollectionTab(HymnalCollection.nca, 'NCA (Rĩerũ)', accent),
                const SizedBox(width: 8),
                _buildCollectionTab(HymnalCollection.ncaOld, 'NCA (Rĩkũrũ)', accent),
                const SizedBox(width: 8),
                _buildCollectionTab(HymnalCollection.cis, 'CIS (Christ in Song)', accent),
                const SizedBox(width: 8),
                _buildCollectionTab(HymnalCollection.sdahExt, 'SDAH EXT', accent),
                const SizedBox(width: 8),
                _buildCollectionTab(HymnalCollection.kmn, 'KMN (Chichewa)', accent),
                const SizedBox(width: 8),
                _buildCollectionTab(HymnalCollection.icb, 'ICB (Bemba)', accent),
                const SizedBox(width: 8),
                _buildCollectionTab(HymnalCollection.sho, 'SHO (Shona)', accent),
                const SizedBox(width: 8),
                _buildCollectionTab(HymnalCollection.uke, 'UKE (Ndebele)', accent),
              ],
            ),
          ),

          // Pinned Hymns Quick-Access Row
          if (storage.pinnedHymns.isNotEmpty)
            Container(
              height: 38,
              margin: const EdgeInsets.only(top: 4),
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                children: [
                  Padding(
                    padding: const EdgeInsets.only(right: 6, top: 8),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.push_pin_rounded, size: 13, color: Colors.amber),
                        const SizedBox(width: 4),
                        Text(
                          'PINNED:',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.8,
                            color: isDark ? Colors.white70 : Colors.black54,
                          ),
                        ),
                      ],
                    ),
                  ),
                  ...storage.pinnedHymns.map((id) {
                    final h = repo.getHymnById(id);
                    if (h == null) return const SizedBox.shrink();
                    return Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: ActionChip(
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        labelPadding: const EdgeInsets.only(left: 2, right: 4),
                        avatar: Icon(Icons.music_note, size: 14, color: accent),
                        label: Text(
                          '${h.collection} #${h.number}',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                        onPressed: () {
                          storage.recordHymnVisit(
                            hymnId: h.id,
                            title: h.title,
                            number: h.number,
                            collection: h.collection,
                          );
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => HymnDetailScreen(hymn: h)),
                          );
                        },
                      ),
                    );
                  }),
                ],
              ),
            ),

          // Search Field
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search hymn title, number, or lyrics...',
                hintStyle: TextStyle(
                  fontSize: 13.5,
                  color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8),
                ),
                prefixIcon: const Icon(Icons.search, size: 20),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {
                            _searchQuery = '';
                          });
                        },
                      )
                    : null,
                filled: true,
                fillColor: theme.colorScheme.surface,
                contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: theme.dividerColor),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: theme.dividerColor),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: accent, width: 1.5),
                ),
              ),
              onChanged: (val) {
                setState(() {
                  _searchQuery = val;
                });
              },
            ),
          ),

          // Categories Horizontal Chips
          if (categories.length > 1)
            SizedBox(
              height: 40,
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
                scrollDirection: Axis.horizontal,
                itemCount: categories.length,
                separatorBuilder: (_, __) => const SizedBox(width: 6),
                itemBuilder: (context, idx) {
                  final cat = categories[idx];
                  final isSelected = _selectedCategory == cat;
                  return ChoiceChip(
                    label: Text(
                      cat,
                      style: TextStyle(
                        fontSize: 11.5,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        color: isSelected
                            ? (isDark ? Colors.black : Colors.white)
                            : (isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569)),
                      ),
                    ),
                    selected: isSelected,
                    selectedColor: accent,
                    backgroundColor: theme.colorScheme.surface,
                    side: BorderSide(
                      color: isSelected ? accent : theme.dividerColor,
                    ),
                    onSelected: (selected) {
                      if (selected) {
                        setState(() {
                          _selectedCategory = cat;
                        });
                      }
                    },
                  );
                },
              ),
            ),

          // Hymns List
          Expanded(
            child: hymns.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.search_off, size: 48, color: isDark ? const Color(0xFF475569) : const Color(0xFF94A3B8)),
                        const SizedBox(height: 12),
                        Text(
                          'No hymns match "$_searchQuery"',
                          style: TextStyle(color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    itemCount: hymns.length,
                    padding: const EdgeInsets.only(bottom: 20),
                    itemBuilder: (context, index) {
                      final hymn = hymns[index];
                      final isFav = storage.isFavorited(hymn.id);

                      return InkWell(
                        onTap: () {
                          storage.recordHymnVisit(
                            hymnId: hymn.id,
                            title: hymn.title,
                            number: hymn.number,
                            collection: hymn.collection,
                          );
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => HymnDetailScreen(hymn: hymn),
                            ),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            border: Border(bottom: BorderSide(color: theme.dividerColor, width: 0.6)),
                          ),
                          child: Row(
                            children: [
                              // Number Badge
                              Container(
                                width: 46,
                                height: 40,
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
                                    fontWeight: FontWeight.w800,
                                    color: accent,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),

                              // Title & Details
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      hymn.title,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: LiturgicalThemes.getHymnTitleStyle(
                                        useSerif: storage.useSerif,
                                        isDark: isDark,
                                        fontSize: 14.5 * storage.fontScale,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      [
                                        hymn.category ?? 'Hymn',
                                        if (hymn.key != null) 'Key: ${hymn.key}',
                                        if (hymn.crossReferences.isNotEmpty)
                                          '${hymn.crossReferences.length} Translations',
                                      ].join(' · '),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              // Quick "Add to Plan" or Favorite
                              IconButton(
                                icon: const Icon(Icons.playlist_add, size: 20),
                                tooltip: 'Add to Worship Plan',
                                color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                                onPressed: () => _quickAddToPlan(context, hymn),
                              ),
                              IconButton(
                                icon: Icon(
                                  isFav ? Icons.bookmark : Icons.bookmark_border,
                                  size: 20,
                                  color: isFav ? accent : (isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8)),
                                ),
                                tooltip: isFav ? 'Remove Favorite' : 'Save Favorite',
                                onPressed: () => storage.toggleFavorite(hymn.id),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: accent,
        foregroundColor: Colors.black,
        tooltip: 'Quick Keypad Jump',
        onPressed: () => _openKeypad(context),
        child: const Icon(Icons.dialpad),
      ),
    );
  }

  Widget _buildCollectionTab(HymnalCollection col, String label, Color accent) {
    final isSelected = _activeCollection == col;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return InkWell(
      onTap: () {
        setState(() {
          _activeCollection = col;
          _selectedCategory = 'All';
        });
      },
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isSelected ? accent : (isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9)),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? accent : (isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.black : (isDark ? Colors.white : const Color(0xFF1E293B)),
          ),
        ),
      ),
    );
  }
}
