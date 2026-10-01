import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../models/hymn.dart';
import '../models/worship_plan.dart';
import '../services/hymn_repository.dart';
import '../services/pitch_synthesizer_service.dart';
import '../services/user_storage_service.dart';
import '../theme/liturgical_themes.dart';
import 'hymn_detail_screen.dart';

class PlanScreen extends StatefulWidget {
  const PlanScreen({super.key});

  @override
  State<PlanScreen> createState() => _PlanScreenState();
}

class _PlanScreenState extends State<PlanScreen> {
  void _openAddItemDialog(BuildContext context, WorshipPlan plan) {
    final titleController = TextEditingController();
    final assignedController = TextEditingController();
    final notesController = TextEditingController();
    final hymnNumController = TextEditingController();

    String selectedCategory = 'hymn';
    HymnalCollection selectedCollection = HymnalCollection.sdah;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) {
          final isHymn = selectedCategory == 'hymn';

          return AlertDialog(
            title: const Text('Add Service Item', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  DropdownButtonFormField<String>(
                    value: selectedCategory,
                    decoration: const InputDecoration(labelText: 'Item Type', border: OutlineInputBorder()),
                    items: const [
                      DropdownMenuItem(value: 'hymn', child: Text('Hymn / Song Service')),
                      DropdownMenuItem(value: 'scripture', child: Text('Scripture Reading')),
                      DropdownMenuItem(value: 'prayer', child: Text('Pastoral / Intercessory Prayer')),
                      DropdownMenuItem(value: 'sermon', child: Text('Sermon / Homily')),
                      DropdownMenuItem(value: 'general', child: Text('General Liturgy / Offering')),
                    ],
                    onChanged: (val) {
                      if (val != null) {
                        setDialogState(() {
                          selectedCategory = val;
                          if (val == 'hymn' && titleController.text.isEmpty) {
                            titleController.text = 'Congregational Hymn';
                          } else if (val == 'scripture' && titleController.text.isEmpty) {
                            titleController.text = 'Scripture Reading';
                          } else if (val == 'prayer' && titleController.text.isEmpty) {
                            titleController.text = 'Pastoral Prayer';
                          }
                        });
                      }
                    },
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: titleController,
                    decoration: const InputDecoration(
                      labelText: 'Item Title (e.g. Opening Hymn)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  if (isHymn) ...[
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          flex: 2,
                          child: DropdownButtonFormField<HymnalCollection>(
                            value: selectedCollection,
                            decoration: const InputDecoration(labelText: 'Hymnal', border: OutlineInputBorder()),
                            items: const [
                              DropdownMenuItem(value: HymnalCollection.sdah, child: Text('SDAH')),
                              DropdownMenuItem(value: HymnalCollection.nzk, child: Text('NZK')),
                              DropdownMenuItem(value: HymnalCollection.nca, child: Text('NCA')),
                              DropdownMenuItem(value: HymnalCollection.sdahExt, child: Text('EXT')),
                            ],
                            onChanged: (val) {
                              if (val != null) setDialogState(() => selectedCollection = val);
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          flex: 2,
                          child: TextField(
                            controller: hymnNumController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(
                              labelText: 'Hymn #',
                              border: OutlineInputBorder(),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 12),
                  TextField(
                    controller: assignedController,
                    decoration: const InputDecoration(
                      labelText: 'Assigned Leader / Chorister',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: notesController,
                    decoration: const InputDecoration(
                      labelText: 'Notes / Stanzas (e.g. Stanzas 1, 2, 4)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () {
                  final title = titleController.text.trim();
                  if (title.isEmpty) return;

                  final repo = context.read<HymnRepository>();
                  Hymn? linkedHymn;
                  final hymnNum = int.tryParse(hymnNumController.text.trim());
                  if (isHymn && hymnNum != null) {
                    linkedHymn = repo.getHymnByNumber(selectedCollection, hymnNum);
                  }

                  final newItem = WorshipPlanItem(
                    id: 'item_${DateTime.now().millisecondsSinceEpoch}',
                    title: title,
                    category: selectedCategory,
                    hymnId: linkedHymn?.id,
                    hymnNumber: hymnNum,
                    hymnCollection: selectedCollection.code,
                    hymnTitle: linkedHymn?.title,
                    assignedTo: assignedController.text.trim().isNotEmpty ? assignedController.text.trim() : null,
                    notes: notesController.text.trim().isNotEmpty ? notesController.text.trim() : null,
                  );

                  context.read<UserStorageService>().addPlanItem(plan.id, newItem);
                  Navigator.pop(ctx);
                },
                child: const Text('Add Item'),
              ),
            ],
          );
        },
      ),
    );
  }

  void _openNewPlanDialog(BuildContext context) {
    final titleController = TextEditingController(text: 'Sabbath Divine Service');
    final dateController = TextEditingController(text: 'This Sabbath');
    String serviceType = 'Divine Service';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('New Worship Plan', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: titleController,
                  decoration: const InputDecoration(labelText: 'Plan Name', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: serviceType,
                  decoration: const InputDecoration(labelText: 'Service Type', border: OutlineInputBorder()),
                  items: const [
                    DropdownMenuItem(value: 'Divine Service', child: Text('Divine Service')),
                    DropdownMenuItem(value: 'Sabbath School', child: Text('Sabbath School')),
                    DropdownMenuItem(value: 'Vespers', child: Text('Vespers / Sunset')),
                    DropdownMenuItem(value: 'Song Service', child: Text('Song Service Rally')),
                    DropdownMenuItem(value: 'Midweek Prayer', child: Text('Midweek Prayer')),
                  ],
                  onChanged: (val) {
                    if (val != null) setDialogState(() => serviceType = val);
                  },
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: dateController,
                  decoration: const InputDecoration(labelText: 'Date / Time', border: OutlineInputBorder()),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () {
                if (titleController.text.trim().isEmpty) return;
                context.read<UserStorageService>().createNewPlan(
                      title: titleController.text.trim(),
                      serviceType: serviceType,
                      date: dateController.text.trim(),
                    );
                Navigator.pop(ctx);
              },
              child: const Text('Create Plan'),
            ),
          ],
        ),
      ),
    );
  }

  void _sharePlan(BuildContext context, WorshipPlan plan) {
    final buffer = StringBuffer();
    buffer.writeln('📋 *${plan.title}* (${plan.serviceType})');
    buffer.writeln('📅 ${plan.date}');
    buffer.writeln('---------------------------');
    for (int i = 0; i < plan.items.length; i++) {
      final item = plan.items[i];
      final check = item.isCompleted ? '✅' : '▫️';
      buffer.write('$check ${i + 1}. *${item.title}*');
      if (item.hymnNumber != null) {
        buffer.write(' - #${item.hymnNumber} ${item.hymnTitle ?? ""} (${item.hymnCollection ?? ""})');
      }
      if (item.assignedTo != null && item.assignedTo!.isNotEmpty) {
        buffer.write(' [${item.assignedTo}]');
      }
      if (item.notes != null && item.notes!.isNotEmpty) {
        buffer.write(' (${item.notes})');
      }
      buffer.writeln();
    }
    buffer.writeln('---------------------------');
    buffer.writeln('Prepared via Have On Behalf Liturgical Companion');

    Clipboard.setData(ClipboardData(text: buffer.toString()));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Worship Order copied to clipboard! Ready to paste into WhatsApp or Bulletin.'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  String _generateStructuredTextOrder(WorshipPlan plan, HymnRepository repo) {
    final buffer = StringBuffer();
    buffer.writeln('========================================================================');
    buffer.writeln('SEVENTH-DAY ADVENTIST LITURGICAL WORSHIP ORDER');
    buffer.writeln('========================================================================');
    buffer.writeln('Service Title : ${plan.title}');
    buffer.writeln('Service Type  : ${plan.serviceType}');
    buffer.writeln('Service Date  : ${plan.date}');
    buffer.writeln('Total Items   : ${plan.items.length} items');
    buffer.writeln('------------------------------------------------------------------------');
    buffer.writeln();

    for (int i = 0; i < plan.items.length; i++) {
      final item = plan.items[i];
      buffer.writeln('${i + 1}. [${item.category.toUpperCase()}] ${item.title}');
      if (item.hymnNumber != null) {
        final hymn = item.hymnId != null ? repo.getHymnById(item.hymnId!) : null;
        final origKey = hymn?.key ?? 'Standard';
        final keySig = PitchSynthesizerService.getKeySignature(origKey, 0);
        buffer.writeln('   Hymnal: ${item.hymnCollection ?? "SDAH"} #${item.hymnNumber} - ${item.hymnTitle ?? ""}');
        buffer.writeln('   Key: $origKey • Signature: ${keySig.symbol} (${keySig.summary})');
        if (hymn != null && hymn.tune != null && hymn.tune!.isNotEmpty) {
          buffer.writeln('   Tune: ${hymn.tune}');
        }
      }
      if (item.assignedTo != null && item.assignedTo!.isNotEmpty) {
        buffer.writeln('   Leader / Assigned: ${item.assignedTo}');
      }
      if (item.notes != null && item.notes!.isNotEmpty) {
        buffer.writeln('   Notes / Cues: "${item.notes}"');
      }
      buffer.writeln();
    }

    buffer.writeln('========================================================================');
    buffer.writeln('Prepared via Have On Behalf (H.O.B) Liturgical Companion');
    buffer.writeln('Collections: SDAH (English), NZK (Kiswahili), NCA (Gĩkũyũ)');
    buffer.writeln('========================================================================');
    return buffer.toString();
  }

  void _openExportDialog(BuildContext context, WorshipPlan plan) {
    final repo = context.read<HymnRepository>();
    final fullText = _generateStructuredTextOrder(plan, repo);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final accent = theme.colorScheme.primary;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.65,
        minChildSize: 0.4,
        maxChildSize: 0.9,
        expand: false,
        builder: (ctx, scrollController) => Padding(
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 24),
          child: ListView(
            controller: scrollController,
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white24 : Colors.black12,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(Icons.download_rounded, color: accent, size: 22),
                      const SizedBox(width: 8),
                      Text(
                        'Export Worship Plan',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              Text(
                '${plan.title} · ${plan.items.length} items',
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                ),
              ),
              const SizedBox(height: 16),

              // Option 1: Copy Structured Order (WhatsApp / Bulletin)
              Container(
                decoration: BoxDecoration(
                  color: accent.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: accent.withOpacity(0.25)),
                ),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: accent,
                    foregroundColor: Colors.white,
                    child: const Icon(Icons.copy, size: 18),
                  ),
                  title: const Text(
                    'Copy Structured Order',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  subtitle: const Text(
                    'Formatted for WhatsApp, messaging, or church bulletins with checkboxes and keys',
                    style: TextStyle(fontSize: 12),
                  ),
                  onTap: () {
                    _sharePlan(context, plan);
                    Navigator.pop(ctx);
                  },
                ),
              ),
              const SizedBox(height: 12),

              // Option 2: Copy Structured Text Document (.txt)
              Container(
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1)),
                ),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
                    foregroundColor: isDark ? Colors.white : const Color(0xFF1E293B),
                    child: const Icon(Icons.description_outlined, size: 18),
                  ),
                  title: const Text(
                    'Copy Full Text Document (.txt)',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  subtitle: const Text(
                    'Complete liturgical layout with headers, key signatures, and chorister notes',
                    style: TextStyle(fontSize: 12),
                  ),
                  onTap: () {
                    Clipboard.setData(ClipboardData(text: fullText));
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Full text document copied to clipboard! Ready to save or print.'),
                        duration: Duration(seconds: 2),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),

              // Preview Section
              Text(
                'Document Preview',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                ),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF0B1120) : const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0)),
                ),
                child: SelectableText(
                  fullText,
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 10.5,
                    height: 1.4,
                  ),
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
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final storage = context.watch<UserStorageService>();
    final repo = context.watch<HymnRepository>();
    final accent = theme.colorScheme.primary;

    final plan = storage.activePlan;

    if (plan == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Worship Plan')),
        body: Center(
          child: ElevatedButton.icon(
            onPressed: () => _openNewPlanDialog(context),
            icon: const Icon(Icons.add),
            label: const Text('Create Your First Worship Plan'),
          ),
        ),
      );
    }

    final totalItems = plan.items.length;
    final completedItems = plan.items.where((i) => i.isCompleted).length;
    final progress = totalItems > 0 ? (completedItems / totalItems) : 0.0;

    return Scaffold(
      appBar: AppBar(
        title: DropdownButtonHideUnderline(
          child: DropdownButton<String>(
            value: storage.activePlanId,
            isDense: true,
            icon: const Icon(Icons.keyboard_arrow_down, size: 20),
            items: storage.plans.map((p) {
              return DropdownMenuItem<String>(
                value: p.id,
                child: Text(
                  p.title,
                  style: LiturgicalThemes.getHymnTitleStyle(
                    useSerif: storage.useSerif,
                    isDark: isDark,
                    fontSize: 16,
                  ),
                ),
              );
            }).toList(),
            onChanged: (val) {
              if (val != null) storage.setActivePlan(val);
            },
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.download_rounded),
            tooltip: 'Export Worship Plan',
            onPressed: () => _openExportDialog(context, plan),
          ),
          IconButton(
            icon: const Icon(Icons.share_outlined),
            tooltip: 'Copy Worship Order',
            onPressed: () => _sharePlan(context, plan),
          ),
          IconButton(
            icon: const Icon(Icons.add),
            tooltip: 'New Worship Plan',
            onPressed: () => _openNewPlanDialog(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // Plan Progress & Metadata Header
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              border: Border(bottom: BorderSide(color: theme.dividerColor)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Flexible(
                      child: Text(
                        '${plan.serviceType} · ${plan.date}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        InkWell(
                          onTap: () => _openExportDialog(context, plan),
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: accent.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: accent.withOpacity(0.3)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.download_rounded, size: 12, color: accent),
                                const SizedBox(width: 3),
                                Text(
                                  'Export',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: accent,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '$completedItems / $totalItems completed',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: progress,
                    backgroundColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
                    valueColor: AlwaysStoppedAnimation<Color>(accent),
                    minHeight: 5,
                  ),
                ),
              ],
            ),
          ),

          // Reorderable Liturgy Items List
          Expanded(
            child: plan.items.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.playlist_add, size: 48, color: accent.withOpacity(0.5)),
                        const SizedBox(height: 12),
                        const Text('No items in this worship plan yet.'),
                        const SizedBox(height: 8),
                        ElevatedButton(
                          onPressed: () => _openAddItemDialog(context, plan),
                          child: const Text('Add Opening Hymn / Scripture'),
                        ),
                      ],
                    ),
                  )
                : ReorderableListView.builder(
                    padding: const EdgeInsets.fromLTRB(12, 8, 12, 80),
                    itemCount: plan.items.length,
                    onReorder: (oldIdx, newIdx) => storage.reorderPlanItems(plan.id, oldIdx, newIdx),
                    itemBuilder: (context, index) {
                      final item = plan.items[index];

                      // Check if hymn can be matched
                      Hymn? matchedHymn;
                      if (item.hymnId != null) {
                        matchedHymn = repo.getHymnById(item.hymnId!);
                      } else if (item.hymnNumber != null && item.hymnCollection != null) {
                        final col = HymnalCollection.values.firstWhere(
                          (c) => c.code == item.hymnCollection,
                          orElse: () => HymnalCollection.sdah,
                        );
                        matchedHymn = repo.getHymnByNumber(col, item.hymnNumber!);
                      }

                      return Dismissible(
                        key: ValueKey(item.id),
                        direction: DismissDirection.endToStart,
                        background: Container(
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.only(right: 20),
                          color: Colors.red.shade900,
                          child: const Icon(Icons.delete, color: Colors.white),
                        ),
                        onDismissed: (_) => storage.deletePlanItem(plan.id, item.id),
                        child: Card(
                          key: ValueKey('card_${item.id}'),
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          color: item.isCompleted
                              ? (isDark ? const Color(0xFF0F172A).withOpacity(0.5) : const Color(0xFFF1F5F9))
                              : null,
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            child: Row(
                              children: [
                                // Checkbox
                                Checkbox(
                                  value: item.isCompleted,
                                  activeColor: accent,
                                  onChanged: (_) => storage.togglePlanItemComplete(plan.id, item.id),
                                ),
                                const SizedBox(width: 4),

                                // Main Item Details
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          _buildCategoryPill(item.category, accent),
                                          const SizedBox(width: 6),
                                          Expanded(
                                            child: Text(
                                              item.title,
                                              style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.bold,
                                                decoration: item.isCompleted ? TextDecoration.lineThrough : null,
                                                color: item.isCompleted
                                                    ? (isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8))
                                                    : null,
                                              ),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                        ],
                                      ),
                                      if (item.hymnNumber != null || item.hymnTitle != null) ...[
                                        const SizedBox(height: 4),
                                        Text(
                                          '#${item.hymnNumber ?? ""} · ${item.hymnTitle ?? ""} (${item.hymnCollection ?? "SDAH"})',
                                          style: TextStyle(
                                            fontSize: 12.5,
                                            fontWeight: FontWeight.w600,
                                            color: accent,
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                      if (item.assignedTo != null || item.notes != null) ...[
                                        const SizedBox(height: 2),
                                        Text(
                                          [
                                            if (item.assignedTo != null && item.assignedTo!.isNotEmpty)
                                              'Leader: ${item.assignedTo}',
                                            if (item.notes != null && item.notes!.isNotEmpty) item.notes,
                                          ].join(' · '),
                                          style: TextStyle(
                                            fontSize: 11,
                                            color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                    ],
                                  ),
                                ),

                                // Direct "Open Hymn" reader button if linked
                                if (matchedHymn != null)
                                  IconButton(
                                    icon: const Icon(Icons.menu_book_rounded, size: 20),
                                    tooltip: 'Sing Hymn Now',
                                    color: accent,
                                    onPressed: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => HymnDetailScreen(hymn: matchedHymn!),
                                        ),
                                      );
                                    },
                                  ),

                                // Reorder Handle
                                ReorderableDragStartListener(
                                  index: index,
                                  child: const Padding(
                                    padding: EdgeInsets.symmetric(horizontal: 4),
                                    child: Icon(Icons.drag_handle, size: 20, color: Color(0xFF64748B)),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: accent,
        foregroundColor: Colors.black,
        icon: const Icon(Icons.add),
        label: const Text('Add Service Item', style: TextStyle(fontWeight: FontWeight.bold)),
        onPressed: () => _openAddItemDialog(context, plan),
      ),
    );
  }

  Widget _buildCategoryPill(String category, Color accent) {
    IconData icon;
    String label;
    Color color;

    switch (category) {
      case 'hymn':
        icon = Icons.music_note;
        label = 'HYMN';
        color = accent;
        break;
      case 'scripture':
        icon = Icons.auto_stories;
        label = 'WORD';
        color = Colors.blue;
        break;
      case 'prayer':
        icon = Icons.volunteer_activism;
        label = 'PRAYER';
        color = Colors.purpleAccent;
        break;
      case 'sermon':
        icon = Icons.mic;
        label = 'SERMON';
        color = Colors.orange;
        break;
      default:
        icon = Icons.calendar_today;
        label = 'LITURGY';
        color = Colors.teal;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withOpacity(0.3), width: 0.8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 10, color: color),
          const SizedBox(width: 3),
          Text(
            label,
            style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: color, letterSpacing: 0.5),
          ),
        ],
      ),
    );
  }
}
