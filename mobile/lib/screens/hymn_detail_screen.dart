import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/hymn.dart';
import '../services/hymn_repository.dart';
import '../services/pitch_synthesizer_service.dart';
import '../services/user_storage_service.dart';
import '../theme/liturgical_themes.dart';
import '../widgets/interlinear_stanza_card.dart';
import '../widgets/quick_keypad_dialog.dart';

class HymnDetailScreen extends StatefulWidget {
  final Hymn hymn;

  const HymnDetailScreen({super.key, required this.hymn});

  @override
  State<HymnDetailScreen> createState() => _HymnDetailScreenState();
}

class _HymnDetailScreenState extends State<HymnDetailScreen> {
  late Hymn _currentHymn;
  bool _showInterlinear = false;
  HymnalCollection _interlinearTarget = HymnalCollection.nzk;
  int _transposition = 0;

  @override
  void initState() {
    super.initState();
    _currentHymn = widget.hymn;
    if (_currentHymn.collectionEnum == HymnalCollection.sdah || _currentHymn.collectionEnum == HymnalCollection.sdahExt) {
      _interlinearTarget = HymnalCollection.nzk;
    } else {
      _interlinearTarget = HymnalCollection.sdah;
    }
  }

  void _openKeypad(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => QuickKeypadDialog(
        onSelectNumber: (num) {
          final repo = context.read<HymnRepository>();
          final match = repo.getHymnByNumber(_currentHymn.collectionEnum, num);
          if (match != null) {
            setState(() {
              _currentHymn = match;
              _transposition = 0;
            });
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Hymn #$num not found in ${_currentHymn.collection}.'),
                behavior: SnackBarBehavior.floating,
              ),
            );
          }
        },
      ),
    );
  }

  void _navigateToAdjacentHymn(int delta) {
    final repo = context.read<HymnRepository>();
    final collectionHymns = repo.getHymns(_currentHymn.collectionEnum);
    final currentIndex = collectionHymns.indexWhere((h) => h.id == _currentHymn.id);
    final targetIndex = currentIndex + delta;
    if (targetIndex >= 0 && targetIndex < collectionHymns.length) {
      setState(() {
        _currentHymn = collectionHymns[targetIndex];
        _transposition = 0;
      });
    }
  }

  void _switchLanguage(HymnalCollection targetCollection) {
    if (_currentHymn.collectionEnum == targetCollection) return;

    final repo = context.read<HymnRepository>();
    final match = repo.findCrossReference(_currentHymn, targetCollection);
    if (match != null) {
      setState(() {
        _currentHymn = match;
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('No parallel hymn found in ${targetCollection.fullName}.'),
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  void _addToPlan(BuildContext context) {
    final storage = context.read<UserStorageService>();
    final activePlan = storage.activePlan;
    if (activePlan == null) return;

    storage.addHymnToActivePlan(_currentHymn);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Added #${_currentHymn.number} to ${activePlan.title}'),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _resetTransposition() {
    if (_transposition == 0) return;
    final originalKey = _currentHymn.key ?? 'C';
    setState(() {
      _transposition = 0;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Transposition reset to original key ($originalKey)'),
        duration: const Duration(seconds: 1),
      ),
    );
  }

  void _openTransposeDialog(BuildContext context) {
    final originalKey = _currentHymn.key ?? 'C';
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final accent = theme.colorScheme.primary;

    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) {
          final effectiveKey = PitchSynthesizerService.transposeKey(originalKey, _transposition);
          final keySig = PitchSynthesizerService.getKeySignature(originalKey, _transposition);
          final freq = PitchSynthesizerService.getFrequency(originalKey, _transposition);
          return Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white24 : Colors.black12,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Transpose Key',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : const Color(0xFF0F172A),
                      ),
                    ),
                    if (_transposition != 0)
                      TextButton.icon(
                        icon: const Icon(Icons.restart_alt, size: 16),
                        label: const Text('Reset'),
                        style: TextButton.styleFrom(
                          foregroundColor: accent,
                          visualDensity: VisualDensity.compact,
                        ),
                        onPressed: () {
                          setState(() => _transposition = 0);
                          setModalState(() {});
                          Navigator.pop(ctx);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Reset to original key ($originalKey)'),
                              duration: const Duration(seconds: 1),
                            ),
                          );
                        },
                      ),
                  ],
                ),
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                  decoration: BoxDecoration(
                    color: accent.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: accent.withOpacity(0.25)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          Column(
                            children: [
                              Text(
                                'Original Key',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                originalKey,
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                          Icon(Icons.arrow_forward, size: 18, color: accent.withOpacity(0.6)),
                          Column(
                            children: [
                              Text(
                                'Transposed Key',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    effectiveKey,
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w900,
                                      color: accent,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                    decoration: BoxDecoration(
                                      color: accent.withOpacity(0.2),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      keySig.symbol,
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: accent,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Column(
                            children: [
                              Text(
                                'Semitones',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                _transposition == 0
                                    ? '0 st'
                                    : (_transposition > 0 ? '+$_transposition st' : '$_transposition st'),
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  color: _transposition == 0 ? Colors.grey : accent,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Key Signature: ${keySig.summary}',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                // Stepper Buttons & Pitch Trigger
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    OutlinedButton.icon(
                      icon: const Icon(Icons.remove, size: 16),
                      label: const Text('Flat (-1)'),
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: () {
                        setState(() => _transposition--);
                        setModalState(() {});
                      },
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton.icon(
                      icon: const Icon(Icons.volume_up, size: 16),
                      label: Text('Sound ($effectiveKey)'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: accent,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: () {
                        context.read<PitchSynthesizerService>().soundPitch(originalKey, _transposition);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Sounding pitch ($effectiveKey · ${freq.toStringAsFixed(1)} Hz)...'),
                            duration: const Duration(seconds: 1),
                          ),
                        );
                      },
                    ),
                    const SizedBox(width: 12),
                    OutlinedButton.icon(
                      icon: const Icon(Icons.add, size: 16),
                      label: const Text('Sharp (+1)'),
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: () {
                        setState(() => _transposition++);
                        setModalState(() {});
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                if (_transposition != 0)
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.restart_alt),
                      label: Text('Reset to Original Key ($originalKey)'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: isDark ? Colors.white : Colors.black87,
                        side: BorderSide(color: isDark ? Colors.white24 : Colors.black12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      onPressed: () {
                        setState(() => _transposition = 0);
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Reset to original key ($originalKey)'),
                            duration: const Duration(seconds: 1),
                          ),
                        );
                      },
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _openNotesDialog(BuildContext context) {
    final storage = context.read<UserStorageService>();
    final controller = TextEditingController(text: storage.getNote(_currentHymn.id) ?? '');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(
          'Personal Notes · #${_currentHymn.number}',
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        content: TextField(
          controller: controller,
          maxLines: 5,
          decoration: const InputDecoration(
            hintText: 'Add reflections, choir vocal parts, or liturgical context...',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              storage.saveNote(_currentHymn.id, controller.text);
              Navigator.pop(ctx);
            },
            child: const Text('Save Note'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final repo = context.watch<HymnRepository>();
    final storage = context.watch<UserStorageService>();
    final pitch = context.watch<PitchSynthesizerService>();

    final accent = theme.colorScheme.primary;
    final isFavorited = storage.isFavorited(_currentHymn.id);
    final parallelCompanion = _showInterlinear ? repo.findCrossReference(_currentHymn, _interlinearTarget) : null;

    final originalKey = _currentHymn.key ?? 'C';
    final effectiveKey = PitchSynthesizerService.transposeKey(originalKey, _transposition);
    final keySig = PitchSynthesizerService.getKeySignature(originalKey, _transposition);

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          tooltip: 'Back to Hymn List',
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
              decoration: BoxDecoration(
                color: accent.withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: accent.withOpacity(0.35)),
              ),
              child: Text(
                '#${_currentHymn.number}',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: accent,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _currentHymn.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: LiturgicalThemes.getHymnTitleStyle(
                      useSerif: storage.useSerif,
                      isDark: isDark,
                      fontSize: 15,
                    ),
                  ),
                  Text(
                    '${_currentHymn.collection}'
                    '${_currentHymn.oldBookNumber != null ? " · Rikũrũ: #${_currentHymn.oldBookNumber}" : ""}'
                    '${_currentHymn.newBookNumber != null ? " · Rĩerũ: #${_currentHymn.newBookNumber}" : ""}'
                    ' · Key: $effectiveKey (${keySig.symbol})',
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          // Pin / Unpin Button
          IconButton(
            icon: Icon(
              storage.isPinned(_currentHymn.id) ? Icons.push_pin_rounded : Icons.push_pin_outlined,
              color: storage.isPinned(_currentHymn.id) ? Colors.amber : null,
            ),
            tooltip: storage.isPinned(_currentHymn.id) ? 'Unpin Hymn' : 'Pin Hymn for Sabbath',
            onPressed: () {
              storage.togglePin(_currentHymn.id);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(storage.isPinned(_currentHymn.id)
                      ? 'Pinned #${_currentHymn.number} to Sabbath Quick Access'
                      : 'Unpinned #${_currentHymn.number}'),
                  duration: const Duration(seconds: 1),
                ),
              );
            },
          ),
          // Project to Sanctuary Beam Screen
          IconButton(
            icon: const Icon(Icons.cast_connected_rounded),
            tooltip: 'Project Hymn to Sanctuary Screen',
            onPressed: () {
              storage.projectHymn(
                _currentHymn.title,
                '${_currentHymn.collection} #${_currentHymn.number}',
                _currentHymn.stanzas.length,
              );
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Projecting "${_currentHymn.title}" to Sanctuary Screen!'),
                  duration: const Duration(seconds: 2),
                ),
              );
            },
          ),
          // Add to Worship Plan Button
          IconButton(
            icon: const Icon(Icons.playlist_add),
            tooltip: 'Add to Plan',
            onPressed: () => _addToPlan(context),
          ),
          // Pitch Pipe Sounder Button
          IconButton(
            icon: Icon(
              pitch.isPlaying ? Icons.volume_up : Icons.music_note,
              color: pitch.isPlaying ? accent : null,
            ),
            tooltip: pitch.isPlaying ? 'Stop pitch tone' : 'Sound pitch: $effectiveKey',
            onPressed: () {
              if (pitch.isPlaying) {
                pitch.stopPitch();
              } else {
                pitch.soundPitch(originalKey, _transposition);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Sounding pitch ($effectiveKey · ${PitchSynthesizerService.getFrequency(originalKey, _transposition).toStringAsFixed(1)} Hz)...'),
                    duration: const Duration(seconds: 1),
                  ),
                );
              }
            },
          ),
          // Reset Transposition Button in AppBar (shown when transposed)
          if (_transposition != 0)
            IconButton(
              icon: Icon(Icons.restart_alt, color: accent),
              tooltip: 'Reset transposition to original key ($originalKey)',
              onPressed: _resetTransposition,
            ),
          // Notes Button
          IconButton(
            icon: Icon(
              storage.getNote(_currentHymn.id) != null ? Icons.edit_note : Icons.note_add_outlined,
              color: storage.getNote(_currentHymn.id) != null ? accent : null,
            ),
            tooltip: 'Personal Notes',
            onPressed: () => _openNotesDialog(context),
          ),
          // Instant Keypad Jump
          IconButton(
            icon: const Icon(Icons.dialpad),
            tooltip: 'Jump to Hymn #',
            onPressed: () => _openKeypad(context),
          ),
          // Favorite Toggle Button
          IconButton(
            icon: Icon(
              isFavorited ? Icons.bookmark : Icons.bookmark_border,
              color: isFavorited ? accent : null,
            ),
            tooltip: isFavorited ? 'Remove Favorite' : 'Save Favorite',
            onPressed: () => storage.toggleFavorite(_currentHymn.id),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          border: Border(top: BorderSide(color: theme.dividerColor)),
        ),
        child: SafeArea(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              TextButton.icon(
                onPressed: () => _navigateToAdjacentHymn(-1),
                icon: const Icon(Icons.arrow_back_ios, size: 14),
                label: const Text('Before'),
                style: TextButton.styleFrom(
                  foregroundColor: accent,
                  textStyle: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
              InkWell(
                onTap: () => _openKeypad(context),
                borderRadius: BorderRadius.circular(8),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.dialpad, size: 14, color: accent),
                      const SizedBox(width: 4),
                      Text(
                        '#${_currentHymn.number}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: accent,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              TextButton.icon(
                onPressed: () => _navigateToAdjacentHymn(1),
                icon: const Icon(Icons.arrow_forward_ios, size: 14),
                label: const Text('Next'),
                style: TextButton.styleFrom(
                  foregroundColor: accent,
                  textStyle: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
      ),
      body: Column(
        children: [
          // Horizontal Toolbar (Scrollable horizontally to completely eliminate any RenderFlex overflow!)
          Container(
            height: 48,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              border: Border(bottom: BorderSide(color: theme.dividerColor)),
            ),
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                // Language Switcher Tabs
                Container(
                  padding: const EdgeInsets.all(2),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF0F172A) : const Color(0xFFE2E8F0),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _buildLangTab(HymnalCollection.sdah, 'EN', accent),
                      _buildLangTab(HymnalCollection.nzk, 'SW', accent),
                      _buildLangTab(HymnalCollection.nca, 'Rĩerũ', accent),
                      _buildLangTab(HymnalCollection.ncaOld, 'Rĩkũrũ', accent),
                    ],
                  ),
                ),
                const SizedBox(width: 8),

                // Interactive Transposition Stepper with Dedicated Reset
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF0F172A) : Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Semitone Down (-)
                      InkWell(
                        onTap: () {
                          setState(() {
                            _transposition--;
                          });
                        },
                        borderRadius: BorderRadius.circular(6),
                        child: const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                          child: Icon(Icons.remove, size: 14),
                        ),
                      ),
                      // Key Name & Offset (Tap for Modal, Long-press to Reset)
                      InkWell(
                        onTap: () => _openTransposeDialog(context),
                        onLongPress: _resetTransposition,
                        borderRadius: BorderRadius.circular(6),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.music_note, size: 14, color: accent),
                              const SizedBox(width: 4),
                              Text(
                                _transposition == 0
                                    ? 'Key: $effectiveKey (${keySig.symbol})'
                                    : '$effectiveKey (${keySig.symbol} · ${_transposition > 0 ? "+$_transposition" : _transposition})',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: accent,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      // Semitone Up (+)
                      InkWell(
                        onTap: () {
                          setState(() {
                            _transposition++;
                          });
                        },
                        borderRadius: BorderRadius.circular(6),
                        child: const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                          child: Icon(Icons.add, size: 14),
                        ),
                      ),
                      // Dedicated Reset Action Button (when transposed)
                      if (_transposition != 0) ...[
                        const SizedBox(width: 2),
                        InkWell(
                          onTap: _resetTransposition,
                          borderRadius: BorderRadius.circular(6),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                            decoration: BoxDecoration(
                              color: accent.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.restart_alt, size: 13, color: accent),
                                const SizedBox(width: 2),
                                Text(
                                  'Reset',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                    color: accent,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(width: 8),

                // Quick Pitch Sounder Button in Toolbar
                InkWell(
                  onTap: () {
                    if (pitch.isPlaying) {
                      pitch.stopPitch();
                    } else {
                      pitch.soundPitch(originalKey, _transposition);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Sounding pitch ($effectiveKey · ${PitchSynthesizerService.getFrequency(originalKey, _transposition).toStringAsFixed(1)} Hz)...'),
                          duration: const Duration(seconds: 1),
                        ),
                      );
                    }
                  },
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                    decoration: BoxDecoration(
                      color: pitch.isPlaying ? accent : (isDark ? const Color(0xFF0F172A) : Colors.white),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: pitch.isPlaying ? accent : (isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          pitch.isPlaying ? Icons.volume_up : Icons.volume_up_outlined,
                          size: 14,
                          color: pitch.isPlaying ? Colors.white : accent,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Pitch',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: pitch.isPlaying ? Colors.white : (isDark ? Colors.white : const Color(0xFF334155)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 8),

                // Parallel Translation Toggle Button
                InkWell(
                  onTap: () {
                    setState(() {
                      _showInterlinear = !_showInterlinear;
                    });
                  },
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: _showInterlinear ? accent : (isDark ? const Color(0xFF0F172A) : Colors.white),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: _showInterlinear ? accent : (isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.translate,
                          size: 14,
                          color: _showInterlinear ? Colors.black : (isDark ? Colors.white : const Color(0xFF334155)),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Parallel Translation',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: _showInterlinear ? Colors.black : (isDark ? Colors.white : const Color(0xFF334155)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Hymn Stanzas Reading Surface
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              itemCount: _currentHymn.stanzas.length,
              itemBuilder: (context, index) {
                final stanza = _currentHymn.stanzas[index];

                // Match companion parallel stanza by chorus/verse index
                HymnStanza? matchingParallelStanza;
                if (parallelCompanion != null) {
                  if (stanza.isChorus) {
                    try {
                      matchingParallelStanza = parallelCompanion.stanzas.firstWhere((s) => s.isChorus);
                    } catch (_) {}
                  } else {
                    try {
                      matchingParallelStanza = parallelCompanion.stanzas.firstWhere(
                        (s) => s.number == stanza.number && !s.isChorus,
                      );
                    } catch (_) {
                      if (index < parallelCompanion.stanzas.length) {
                        matchingParallelStanza = parallelCompanion.stanzas[index];
                      }
                    }
                  }
                }

                return InterlinearStanzaCard(
                  primaryStanza: stanza,
                  parallelStanza: matchingParallelStanza,
                  parallelCollection: parallelCompanion?.collection,
                  parallelNumber: parallelCompanion?.number,
                  showParallel: _showInterlinear,
                  accentColor: accent,
                  useSerif: storage.useSerif,
                  fontScale: storage.fontScale,
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLangTab(HymnalCollection col, String label, Color accent) {
    final isSelected = _currentHymn.collectionEnum == col;
    return InkWell(
      onTap: () => _switchLanguage(col),
      borderRadius: BorderRadius.circular(6),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? accent : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.black : null,
          ),
        ),
      ),
    );
  }
}
