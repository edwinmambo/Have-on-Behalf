import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../services/hymn_repository.dart';
import '../services/user_storage_service.dart';
import '../theme/liturgical_themes.dart';

class AccountSettingsScreen extends StatelessWidget {
  const AccountSettingsScreen({super.key});

  void _openEditProfileDialog(BuildContext context) {
    final storage = context.read<UserStorageService>();
    final nameController = TextEditingController(text: storage.userName);
    final roleController = TextEditingController(text: storage.userRole);
    final churchController = TextEditingController(text: storage.churchName);
    final emailController = TextEditingController(text: storage.userEmail);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Edit Liturgical Profile', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(labelText: 'Full Name', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: roleController,
                decoration: const InputDecoration(labelText: 'Worship Role (e.g. Chorister)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: churchController,
                decoration: const InputDecoration(labelText: 'Local Church / Fellowship', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: emailController,
                decoration: const InputDecoration(labelText: 'Email Address', border: OutlineInputBorder()),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              storage.updateUserProfile(
                name: nameController.text,
                role: roleController.text,
                church: churchController.text,
                email: emailController.text,
              );
              Navigator.pop(ctx);
            },
            child: const Text('Save Profile'),
          ),
        ],
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

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Account & Sanctuary Settings',
          style: LiturgicalThemes.getHymnTitleStyle(
            useSerif: storage.useSerif,
            isDark: isDark,
            fontSize: 18,
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        children: [
          // 1. User Profile Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: accent.withOpacity(0.2),
                    child: Text(
                      storage.userName.isNotEmpty
                          ? storage.userName.split(' ').map((n) => n.isNotEmpty ? n[0] : '').take(2).join()
                          : 'EM',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: accent,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          storage.userName,
                          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          storage.userRole,
                          style: TextStyle(
                            fontSize: 13,
                            color: accent,
                            fontWeight: FontWeight.w600,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          storage.churchName,
                          style: TextStyle(
                            fontSize: 12,
                            color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.edit_outlined, size: 20),
                    tooltip: 'Edit Profile',
                    onPressed: () => _openEditProfileDialog(context),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // 2. Co-Assistant Connection Status Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        decoration: const BoxDecoration(
                          color: Colors.green,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'Sanctuary Console Co-Assistant',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.green.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Text(
                          'CONNECTED',
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.green),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Paired as mobile companion to Have On Behalf Sanctuary Web Platform.',
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    children: [
                      _buildMiniBadge('Offline Hymns: ${repo.totalCount}'),
                      _buildMiniBadge('SDAH, NZK, NCA, EXT'),
                      _buildMiniBadge('Synced & Ready'),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // 3. Typography & Display Settings
          _buildSectionHeader('TYPOGRAPHY & READING EXPERIENCE'),
          Card(
            child: Column(
              children: [
                // Font Family: Modern Sans vs Liturgical Serif
                ListTile(
                  title: const Text('Font Style', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  subtitle: Text(
                    storage.useSerif
                        ? 'Classic Liturgical Serif (Merriweather)'
                        : 'Modern Sans-Serif (Plus Jakarta Sans)',
                    style: const TextStyle(fontSize: 12),
                  ),
                  trailing: SegmentedButton<bool>(
                    segments: const [
                      ButtonSegment(value: false, label: Text('Modern', style: TextStyle(fontSize: 11))),
                      ButtonSegment(value: true, label: Text('Serif', style: TextStyle(fontSize: 11))),
                    ],
                    selected: {storage.useSerif},
                    onSelectionChanged: (set) {
                      storage.setUseSerif(set.first);
                    },
                  ),
                ),
                const Divider(height: 1),

                // Font Size Scaling Slider
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Font Size Scale', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          Text(
                            '${(storage.fontScale * 100).toInt()}% (${_getScaleLabel(storage.fontScale)})',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: accent),
                          ),
                        ],
                      ),
                      Slider(
                        value: storage.fontScale,
                        min: 0.85,
                        max: 1.30,
                        divisions: 3,
                        activeColor: accent,
                        onChanged: (val) => storage.setFontScale(val),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 4. Lighting & Theme Palette
          _buildSectionHeader('THEME & SANCTUARY LIGHTING'),
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('Dark Mode', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  subtitle: const Text('Sleek dark theme for sanctuary & evening use', style: TextStyle(fontSize: 12)),
                  value: storage.isDarkMode,
                  activeColor: accent,
                  onChanged: (val) => storage.toggleDarkMode(val),
                ),
                if (storage.isDarkMode) ...[
                  const Divider(height: 1),
                  SwitchListTile(
                    title: const Text('Pure OLED Black (#000000)', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    subtitle: const Text('Zero ambient light in dark sanctuaries & saves battery', style: TextStyle(fontSize: 12)),
                    value: storage.pureOledBlack,
                    activeColor: accent,
                    onChanged: (val) => storage.setPureOledBlack(val),
                  ),
                ],
                const Divider(height: 1),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Liturgical Accent Palette', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      const SizedBox(height: 12),
                      ...LiturgicalPalette.values.map((pal) {
                        final isSelected = storage.activePalette == pal;
                        return InkWell(
                          onTap: () => storage.setPalette(pal),
                          borderRadius: BorderRadius.circular(10),
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            decoration: BoxDecoration(
                              color: isSelected ? pal.primaryColor.withOpacity(0.12) : null,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: isSelected ? pal.accentColor : Colors.transparent,
                                width: 1.5,
                              ),
                            ),
                            child: Row(
                              children: [
                                CircleAvatar(
                                  radius: 12,
                                  backgroundColor: pal.primaryColor,
                                  child: CircleAvatar(radius: 5, backgroundColor: pal.accentColor),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(pal.displayName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                                      Text(pal.description, style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                                    ],
                                  ),
                                ),
                                if (isSelected) Icon(Icons.check, color: pal.accentColor, size: 18),
                              ],
                            ),
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 5. Data & Backup
          _buildSectionHeader('DATA & BACKUP'),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.download_for_offline_outlined),
                  title: const Text('Export Liturgical Notes & Plans', style: TextStyle(fontSize: 14)),
                  subtitle: Text('${storage.favorites.length} saved hymns · ${storage.plans.length} worship plans', style: const TextStyle(fontSize: 12)),
                  trailing: const Icon(Icons.chevron_right, size: 18),
                  onTap: () {
                    final summary = 'Have On Behalf Backup\nUser: ${storage.userName}\nChurch: ${storage.churchName}\nFavorites: ${storage.favorites.length}\nPlans: ${storage.plans.length}';
                    Clipboard.setData(ClipboardData(text: summary));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Backup summary copied to clipboard!')),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.8,
          color: Color(0xFF94A3B8),
        ),
      ),
    );
  }

  Widget _buildMiniBadge(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xFF334155).withOpacity(0.3),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
      ),
    );
  }

  String _getScaleLabel(double scale) {
    if (scale <= 0.86) return 'Small';
    if (scale <= 1.01) return 'Regular';
    if (scale <= 1.16) return 'Large';
    return 'Pulpit / Preacher';
  }
}
