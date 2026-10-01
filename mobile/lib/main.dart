import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'screens/main_navigation_shell.dart';
import 'services/hymn_repository.dart';
import 'services/pitch_synthesizer_service.dart';
import 'services/user_storage_service.dart';
import 'theme/liturgical_themes.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final userStorage = UserStorageService();
  await userStorage.initialize();

  final hymnRepository = HymnRepository();
  // Fire initialization asynchronously for cold boot under 500ms
  hymnRepository.initialize();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider<UserStorageService>.value(value: userStorage),
        ChangeNotifierProvider<HymnRepository>.value(value: hymnRepository),
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
