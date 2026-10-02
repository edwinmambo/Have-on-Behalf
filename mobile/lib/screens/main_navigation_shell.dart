import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/user_storage_service.dart';
import 'account_settings_screen.dart';
import 'beam_remote_screen.dart';
import 'bible_reader_screen.dart';
import 'egw_reader_screen.dart';
import 'favorites_notes_screen.dart';
import 'feedback_screen.dart';
import 'hymn_list_screen.dart';
import 'plan_screen.dart';

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HymnListScreen(),
    BibleReaderScreen(),
    EgwReaderScreen(),
    BeamRemoteScreen(),
    PlanScreen(),
  ];

  void _openSecondaryMenu(BuildContext context) {
    final storage = context.read<UserStorageService>();
    final theme = Theme.of(context);
    final accent = theme.colorScheme.primary;

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 36,
                height: 4,
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: Colors.grey.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                child: Row(
                  children: [
                    Text(
                      'More Sanctuary Menus',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.playlist_play_rounded),
                title: const Text('Worship Liturgy Planner'),
                subtitle: const Text('Order of Service & Vespers items', style: TextStyle(fontSize: 12)),
                onTap: () {
                  Navigator.pop(ctx);
                  setState(() => _currentIndex = 4);
                },
              ),
              ListTile(
                leading: const Icon(Icons.bookmark_rounded),
                title: const Text('Saved & Personal Notes'),
                subtitle: Text('${storage.favorites.length} bookmarked hymns', style: const TextStyle(fontSize: 12)),
                trailing: storage.pinnedHymns.isNotEmpty
                    ? Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.amber.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '${storage.pinnedHymns.length} Pinned',
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.amber),
                        ),
                      )
                    : null,
                onTap: () {
                  Navigator.pop(ctx);
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const FavoritesNotesScreen()),
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.bug_report_rounded),
                title: const Text('Chorister & Tester Feedback'),
                subtitle: const Text('Report typos or propose features', style: TextStyle(fontSize: 12)),
                onTap: () {
                  Navigator.pop(ctx);
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const FeedbackScreen()),
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.tune_rounded),
                title: const Text('Sanctuary Settings & Themes'),
                subtitle: const Text('Liturgical palettes, OLED dark mode, fonts', style: TextStyle(fontSize: 12)),
                onTap: () {
                  Navigator.pop(ctx);
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const AccountSettingsScreen()),
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
    final storage = context.watch<UserStorageService>();
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final accent = theme.colorScheme.primary;
    final isReadingMode = storage.isReadingMode;
    final isBeamActive = storage.projectedHymnTitle != null;

    final screenWidth = MediaQuery.of(context).size.width;
    final isCompact = screenWidth < 380;

    return Scaffold(
      // App Bar matching Web PWA layout
      appBar: isReadingMode
          ? null // Complete immersion in Reading Mode
          : AppBar(
              titleSpacing: 12,
              elevation: 0,
              title: Row(
                children: [
                  // App Emblem
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: accent.withOpacity(0.18),
                      shape: BoxShape.circle,
                      border: Border.all(color: accent.withOpacity(0.4)),
                    ),
                    child: Center(
                      child: Text(
                        'H',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: accent,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),

                  // Segmented Tabs Matching Web PWA (Hymnals, Bibles, EGW)
                  Expanded(
                    child: Container(
                      height: 36,
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          _buildHeaderTab(0, 'Hymns', Icons.library_music_rounded, isCompact),
                          _buildHeaderTab(1, 'Bibles', Icons.menu_book_rounded, isCompact),
                          _buildHeaderTab(2, 'EGW', Icons.auto_stories_rounded, isCompact),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              actions: [
                // 1. Reading Mode Toggle Button
                IconButton(
                  icon: Icon(
                    Icons.chrome_reader_mode_outlined,
                    color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF475569),
                    size: 20,
                  ),
                  tooltip: 'Enter Distraction-Free Reading Mode',
                  onPressed: () {
                    storage.toggleReadingMode(true);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Reading Mode enabled. Tap floating exit button to return.'),
                        duration: Duration(seconds: 2),
                      ),
                    );
                  },
                ),

                // 2. Sanctuary Beam Projector Button
                IconButton(
                  icon: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Icon(
                        _currentIndex == 3 ? Icons.cast_connected_rounded : Icons.cast_rounded,
                        color: _currentIndex == 3
                            ? accent
                            : (isBeamActive ? Colors.cyanAccent : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF475569))),
                        size: 20,
                      ),
                      if (isBeamActive)
                        Positioned(
                          right: -2,
                          top: -2,
                          child: Container(
                            width: 7,
                            height: 7,
                            decoration: const BoxDecoration(
                              color: Colors.greenAccent,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                    ],
                  ),
                  tooltip: 'Sanctuary Beam Projector Remote',
                  onPressed: () {
                    setState(() => _currentIndex = 3);
                  },
                ),

                // 3. Secondary Dropdown / Action Menu
                IconButton(
                  icon: Icon(
                    Icons.more_vert_rounded,
                    color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF475569),
                    size: 20,
                  ),
                  tooltip: 'More Liturgical Options',
                  onPressed: () => _openSecondaryMenu(context),
                ),
              ],
            ),

      // Screen Body Stack
      body: Stack(
        children: [
          IndexedStack(
            index: _currentIndex,
            children: _screens,
          ),

          // Floating Distraction-Free Reading Mode Controls Overlay
          if (isReadingMode)
            Positioned(
              left: 16,
              right: 16,
              bottom: 24,
              child: SafeArea(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF0F172A).withOpacity(0.95) : Colors.white.withOpacity(0.95),
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(color: accent.withOpacity(0.35)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.25),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Font Scale Controls
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.text_decrease_rounded, size: 18),
                            tooltip: 'Smaller Font',
                            onPressed: () {
                              if (storage.fontScale > 0.85) {
                                storage.setFontScale(storage.fontScale - 0.1);
                              }
                            },
                          ),
                          Text(
                            '${(storage.fontScale * 100).toInt()}%',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: accent,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.text_increase_rounded, size: 18),
                            tooltip: 'Larger Font',
                            onPressed: () {
                              if (storage.fontScale < 1.30) {
                                storage.setFontScale(storage.fontScale + 0.1);
                              }
                            },
                          ),
                        ],
                      ),

                      // Serif Toggle
                      TextButton(
                        onPressed: () => storage.setUseSerif(!storage.useSerif),
                        child: Text(
                          storage.useSerif ? 'Serif' : 'Sans',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: accent),
                        ),
                      ),

                      // Exit Reading Mode Button
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: accent,
                          foregroundColor: Colors.black,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        ),
                        icon: const Icon(Icons.close_rounded, size: 16),
                        label: const Text('Exit', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                        onPressed: () => storage.toggleReadingMode(false),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),

      // Responsive Bottom Navigation Bar
      bottomNavigationBar: isReadingMode
          ? null
          : BottomNavigationBar(
              currentIndex: _currentIndex,
              type: BottomNavigationBarType.fixed,
              onTap: (index) {
                setState(() {
                  _currentIndex = index;
                });
              },
              items: [
                const BottomNavigationBarItem(
                  icon: Icon(Icons.library_music_outlined),
                  activeIcon: Icon(Icons.library_music_rounded),
                  label: 'Hymnals',
                ),
                const BottomNavigationBarItem(
                  icon: Icon(Icons.menu_book_outlined),
                  activeIcon: Icon(Icons.menu_book_rounded),
                  label: 'Bibles',
                ),
                const BottomNavigationBarItem(
                  icon: Icon(Icons.auto_stories_outlined),
                  activeIcon: Icon(Icons.auto_stories_rounded),
                  label: 'E.G. White',
                ),
                BottomNavigationBarItem(
                  icon: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      const Icon(Icons.cast_rounded),
                      if (isBeamActive)
                        Positioned(
                          right: -2,
                          top: -2,
                          child: Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              color: Colors.greenAccent,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                    ],
                  ),
                  activeIcon: const Icon(Icons.cast_connected_rounded),
                  label: 'Beam',
                ),
                BottomNavigationBarItem(
                  icon: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      const Icon(Icons.playlist_play_outlined),
                      if (storage.activePlan != null && storage.activePlan!.items.isNotEmpty)
                        Positioned(
                          right: -2,
                          top: -2,
                          child: Container(
                            width: 7,
                            height: 7,
                            decoration: BoxDecoration(
                              color: accent,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                    ],
                  ),
                  activeIcon: const Icon(Icons.playlist_play_rounded),
                  label: 'Planner',
                ),
              ],
            ),
    );
  }

  Widget _buildHeaderTab(int index, String label, IconData icon, bool isCompact) {
    final isSelected = _currentIndex == index;
    final theme = Theme.of(context);
    final accent = theme.colorScheme.primary;

    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _currentIndex = index),
        borderRadius: BorderRadius.circular(8),
        child: Container(
          decoration: BoxDecoration(
            color: isSelected ? theme.colorScheme.surface : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.08),
                      blurRadius: 4,
                      offset: const Offset(0, 1),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 14,
                color: isSelected ? accent : Colors.grey,
              ),
              if (!isCompact) ...[
                const SizedBox(width: 4),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                    color: isSelected ? (theme.brightness == Brightness.dark ? Colors.white : Colors.black87) : Colors.grey,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
