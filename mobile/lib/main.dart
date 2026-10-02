import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'screens/main_navigation_shell.dart';
import 'services/bible_service.dart';
import 'services/egw_service.dart';
import 'services/hymn_repository.dart';
import 'services/pitch_synthesizer_service.dart';
import 'services/shared_data_provider.dart';
import 'services/user_storage_service.dart';
import 'theme/liturgical_themes.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final userStorage = UserStorageService();
  await userStorage.initialize();

  // Shared Data Provider: Consumes the exact JSON dataset definitions used by the PWA
  final sharedData = SharedDataProvider();
  sharedData.initialize();

  final hymnRepository = HymnRepository();
  hymnRepository.initialize();

  final bibleService = BibleService();
  bibleService.initialize();

  final egwService = EgwService();
  egwService.initialize();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider<SharedDataProvider>.value(value: sharedData),
        ChangeNotifierProvider<UserStorageService>.value(value: userStorage),
        ChangeNotifierProvider<HymnRepository>.value(value: hymnRepository),
        ChangeNotifierProvider<BibleService>.value(value: bibleService),
        ChangeNotifierProvider<EgwService>.value(value: egwService),
        ChangeNotifierProvider<PitchSynthesizerService>(
          create: (_) => PitchSynthesizerService(),
        ),
      ],
      child: const HaveOnBehalfCompanionApp(),
    ),
  );
}

class HaveOnBehalfCompanionApp extends StatelessWidget {
  const HaveOnBehalfCompanionApp({super.key});

  @override
  Widget build(BuildContext context) {
    final storage = context.watch<UserStorageService>();

    return MaterialApp(
      title: 'Have On Behalf Companion',
      debugShowCheckedModeBanner: false,
      theme: LiturgicalThemes.getTheme(
        palette: storage.activePalette,
        isDarkMode: storage.isDarkMode,
        pureOledBlack: storage.pureOledBlack,
        useSerif: storage.useSerif,
        fontScale: storage.fontScale,
      ),
      home: const MainNavigationShell(),
    );
  }
}
