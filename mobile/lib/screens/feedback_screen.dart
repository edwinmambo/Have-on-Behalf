import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../services/user_storage_service.dart';
import '../theme/liturgical_themes.dart';

class FeedbackScreen extends StatefulWidget {
  const FeedbackScreen({super.key});

  @override
  State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> {
  final _formKey = GlobalKey<FormState>();
  String _selectedCategory = 'Hymn Typo / Missing Stanza';
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _commentController = TextEditingController();
  final TextEditingController _hymnNumberController = TextEditingController();
  String _selectedCollection = 'SDAH';

  static const List<String> categories = [
    'Hymn Typo / Missing Stanza',
    'Audio Pitch / Key Signature Issue',
    'Translation Discrepancy',
    'Sanctuary Beam Presentation',
    'Worship Planner / Liturgy',
    'Feature Request',
  ];

  static const List<String> collections = [
    'SDAH',
    'NZK',
    'NCA',
    'WNY',
    'OKN',
    'KIN',
    'CIS',
    'KMN',
    'ICB',
    'SHO',
    'UKE',
    'General',
  ];

  void _submitReport(BuildContext context) {
    if (!_formKey.currentState!.validate()) return;

    final storage = context.read<UserStorageService>();
    final hymnNum = int.tryParse(_hymnNumberController.text.trim());

    storage.submitFeedback(
      category: _selectedCategory,
      title: _titleController.text.trim(),
      comment: _commentController.text.trim(),
      collection: _selectedCollection,
      hymnNumber: hymnNum,
    );

    _titleController.clear();
    _commentController.clear();
    _hymnNumberController.clear();

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Feedback report submitted successfully! Thank you for improving worship.'),
        backgroundColor: Colors.green,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final storage = context.watch<UserStorageService>();
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final accent = theme.colorScheme.primary;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Chorister & Tester Feedback',
          style: LiturgicalThemes.getHymnTitleStyle(
            useSerif: storage.useSerif,
            isDark: isDark,
            fontSize: 18,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => storage.toggleAdmin(),
            child: Row(
              children: [
                Icon(
                  storage.isAdmin ? Icons.admin_panel_settings_rounded : Icons.person_rounded,
                  size: 16,
                  color: storage.isAdmin ? Colors.amber : Colors.grey,
                ),
                const SizedBox(width: 4),
                Text(
                  storage.isAdmin ? 'Admin' : 'Tester',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: storage.isAdmin ? Colors.amber : Colors.grey,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        children: [
          // 1. Instructions Banner
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: accent.withOpacity(0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: accent.withOpacity(0.2)),
            ),
            child: Row(
              children: [
                Icon(Icons.info_outline_rounded, color: accent, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Help us purify Adventist datasets, report stanza errors, or suggest liturgical features for worship.',
                    style: TextStyle(fontSize: 12, color: theme.colorScheme.onSurface.withOpacity(0.85)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 2. Submission Form
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('SUBMIT NEW REPORT', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                    const SizedBox(height: 12),

                    // Category Dropdown
                    DropdownButtonFormField<String>(
                      value: _selectedCategory,
                      decoration: const InputDecoration(labelText: 'Feedback Category', border: OutlineInputBorder()),
                      items: categories.map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontSize: 13)))).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedCategory = val);
                      },
                    ),
                    const SizedBox(height: 12),

                    // Collection & Hymn Number (Optional)
                    Row(
                      children: [
                        Expanded(
                          flex: 2,
                          child: DropdownButtonFormField<String>(
                            value: _selectedCollection,
                            decoration: const InputDecoration(labelText: 'Hymnal', border: OutlineInputBorder()),
                            items: collections.map((col) => DropdownMenuItem(value: col, child: Text(col, style: const TextStyle(fontSize: 13)))).toList(),
                            onChanged: (val) {
                              if (val != null) setState(() => _selectedCollection = val);
                            },
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          flex: 2,
                          child: TextFormField(
                            controller: _hymnNumberController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'Hymn # (Optional)', border: OutlineInputBorder()),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Title
                    TextFormField(
                      controller: _titleController,
                      decoration: const InputDecoration(
                        labelText: 'Brief Summary / Title',
                        hintText: 'e.g. Typo in SDAH #159 stanza 2 line 3',
                        border: OutlineInputBorder(),
                      ),
                      validator: (val) => val == null || val.trim().isEmpty ? 'Please enter a title' : null,
                    ),
                    const SizedBox(height: 12),

                    // Comments
                    TextFormField(
                      controller: _commentController,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        labelText: 'Detailed Comments or Correction',
                        hintText: 'Provide the exact line, corrected lyrics, or feature idea...',
                        border: OutlineInputBorder(),
                      ),
                      validator: (val) => val == null || val.trim().isEmpty ? 'Please enter your comments' : null,
                    ),
                    const SizedBox(height: 16),

                    // Submit Button
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: accent,
                          foregroundColor: Colors.black,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        icon: const Icon(Icons.send_rounded, size: 18),
                        label: const Text('SUBMIT FEEDBACK', style: TextStyle(fontWeight: FontWeight.bold)),
                        onPressed: () => _submitReport(context),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // 3. Admin Reports Review Section
          if (storage.isAdmin) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'LOGGED FEEDBACK REPORTS (${storage.feedbackList.length})',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey),
                ),
                if (storage.feedbackList.isNotEmpty)
                  TextButton.icon(
                    icon: const Icon(Icons.copy_rounded, size: 14),
                    label: const Text('Export JSON', style: TextStyle(fontSize: 11)),
                    onPressed: () {
                      final jsonStr = jsonEncode(storage.feedbackList);
                      Clipboard.setData(ClipboardData(text: jsonStr));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Feedback reports copied to clipboard as JSON!')),
                      );
                    },
                  ),
              ],
            ),
            const SizedBox(height: 8),

            if (storage.feedbackList.isEmpty)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: Center(
                    child: Text('No feedback submitted yet. Test reports will appear here.', style: TextStyle(color: Colors.grey, fontSize: 13)),
                  ),
                ),
              )
            else
              ...storage.feedbackList.map((item) {
                final isResolved = item['status'] == 'resolved';
                final id = item['id'] as String;

                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: isResolved ? Colors.green.withOpacity(0.15) : Colors.amber.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                isResolved ? 'RESOLVED' : 'OPEN',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: isResolved ? Colors.green : Colors.amber,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              item['category'] as String,
                              style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.w600),
                            ),
                            const Spacer(),
                            IconButton(
                              icon: Icon(
                                isResolved ? Icons.undo_rounded : Icons.check_circle_outline_rounded,
                                size: 20,
                                color: isResolved ? Colors.grey : Colors.green,
                              ),
                              tooltip: isResolved ? 'Mark Open' : 'Mark Resolved',
                              onPressed: () => storage.resolveFeedback(id),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete_outline_rounded, size: 20, color: Colors.redAccent),
                              tooltip: 'Delete Report',
                              onPressed: () => storage.deleteFeedback(id),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          item['title'] as String,
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item['comment'] as String,
                          style: TextStyle(fontSize: 13, color: theme.colorScheme.onSurface.withOpacity(0.85)),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Reported by ${item['testerName']} · ${item['collection']} #${item['hymnNumber']}',
                          style: const TextStyle(fontSize: 11, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                );
              }),
          ],
        ],
      ),
    );
  }
}
