import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/hymn_repository.dart';
import '../services/user_storage_service.dart';
import '../theme/liturgical_themes.dart';

class BeamRemoteScreen extends StatefulWidget {
  const BeamRemoteScreen({super.key});

  @override
  State<BeamRemoteScreen> createState() => _BeamRemoteScreenState();
}

class _BeamRemoteScreenState extends State<BeamRemoteScreen> {
  final TextEditingController _quickHymnController = TextEditingController();

  void _projectQuickHymn(BuildContext context) {
    final query = _quickHymnController.text.trim();
    if (query.isEmpty) return;

    final repo = context.read<HymnRepository>();
    final storage = context.read<UserStorageService>();

    final num = int.tryParse(query);
    if (num != null) {
      final hymn = repo.allHymns.firstWhere(
        (h) => h.number == num,
        orElse: () => repo.allHymns.first,
      );
      storage.projectHymn(
        hymn.title,
        '${hymn.collection} #${hymn.number}',
        hymn.stanzas.length,
      );
      _quickHymnController.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Transmitted "${hymn.title}" to Sanctuary Beam!')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final storage = context.watch<UserStorageService>();
    final repo = context.watch<HymnRepository>();
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final accent = theme.colorScheme.primary;

    final hymnTitle = storage.projectedHymnTitle ?? 'Praise to the Lord';
    final hymnNumber = storage.projectedHymnNumber ?? 'SDAH #1';
    final currentSlide = storage.projectedSlideIndex;
    final totalSlides = storage.projectedTotalSlides;
    final isBlackout = storage.isBeamBlackout;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Sanctuary Beam Remote',
          style: LiturgicalThemes.getHymnTitleStyle(
            useSerif: storage.useSerif,
            isDark: isDark,
            fontSize: 18,
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(
              isBlackout ? Icons.visibility_off_rounded : Icons.visibility_rounded,
              color: isBlackout ? Colors.redAccent : Colors.greenAccent,
            ),
            tooltip: isBlackout ? 'Restore Sanctuary Screen' : 'Sanctuary Blackout Mode',
            onPressed: () => storage.toggleBeamBlackout(),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        children: [
          // 1. Live Sanctuary Projector Monitor Box
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isBlackout ? Colors.black : const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isBlackout ? Colors.red.withOpacity(0.5) : accent.withOpacity(0.4),
                width: 2,
              ),
              boxShadow: [
                BoxShadow(
                  color: (isBlackout ? Colors.red : accent).withOpacity(0.15),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: isBlackout ? Colors.red : Colors.green,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          isBlackout ? 'BLACKOUT MODE (SCREEN OFF)' : 'LIVE ON SANCTUARY BEAM',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                            color: isBlackout ? Colors.redAccent : Colors.greenAccent,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'SLIDE ${currentSlide + 1} OF $totalSlides',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white70),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Text(
                  isBlackout ? '• • •' : hymnNumber,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: accent,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  isBlackout ? '[ Sanctuary Screen Blanked for Prayer ]' : hymnTitle,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 20),

                // Slide Progress Dots
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(totalSlides, (idx) {
                    final isActive = idx == currentSlide;
                    return Container(
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      width: isActive ? 24 : 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: isActive ? accent : Colors.white24,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    );
                  }),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 2. Big Slide Navigation Buttons (Thumb-friendly for Choristers)
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 60,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      backgroundColor: theme.colorScheme.surfaceVariant,
                    ),
                    icon: const Icon(Icons.arrow_back_rounded, size: 28),
                    label: const Text('PREVIOUS', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    onPressed: currentSlide > 0 ? () => storage.prevSlide() : null,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: SizedBox(
                  height: 60,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      backgroundColor: accent,
                      foregroundColor: Colors.black,
                    ),
                    icon: const Icon(Icons.arrow_forward_rounded, size: 28),
                    label: const Text('NEXT SLIDE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    onPressed: currentSlide < totalSlides - 1 ? () => storage.nextSlide() : null,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // 3. Stanza Jump Quick Bar
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('JUMP TO STANZA', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: List.generate(totalSlides, (idx) {
                      final isSelected = idx == currentSlide;
                      return ChoiceChip(
                        label: Text('Stanza ${idx + 1}'),
                        selected: isSelected,
                        selectedColor: accent.withOpacity(0.2),
                        onSelected: (_) => storage.setSlideIndex(idx),
                      );
                    }),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // 4. Quick Beam Transmitter (Type number to beam immediately)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('QUICK BEAM HYMN', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _quickHymnController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            hintText: 'Enter Hymn # (e.g. 159)',
                            border: OutlineInputBorder(),
                            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          ),
                          onSubmitted: (_) => _projectQuickHymn(context),
                        ),
                      ),
                      const SizedBox(width: 10),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          backgroundColor: accent,
                          foregroundColor: Colors.black,
                        ),
                        onPressed: () => _projectQuickHymn(context),
                        child: const Text('BEAM', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // 5. Pinned Hymns Quick-Cast Bar
          if (storage.pinnedHymns.isNotEmpty) ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.push_pin_rounded, size: 14, color: Colors.amber),
                        SizedBox(width: 6),
                        Text('PINNED SABBATH SELECTIONS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: storage.pinnedHymns.map((id) {
                        final hymn = repo.getHymnById(id);
                        if (hymn == null) return const SizedBox.shrink();
                        return ActionChip(
                          avatar: const Icon(Icons.cast_rounded, size: 14),
                          label: Text('${hymn.collection} #${hymn.number} ${hymn.title}'),
                          onPressed: () {
                            storage.projectHymn(
                              hymn.title,
                              '${hymn.collection} #${hymn.number}',
                              hymn.stanzas.length,
                            );
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Projecting "${hymn.title}" to Sanctuary!')),
                            );
                          },
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
