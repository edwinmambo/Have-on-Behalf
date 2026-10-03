import 'package:flutter_test/flutter_test.dart';
import 'package:have_on_behalf_companion/main.dart';
import 'package:have_on_behalf_companion/models/bible_model.dart';
import 'package:have_on_behalf_companion/models/hymn.dart';
import 'package:have_on_behalf_companion/models/worship_plan.dart';
import 'package:have_on_behalf_companion/screens/account_settings_screen.dart';
import 'package:have_on_behalf_companion/screens/beam_remote_screen.dart';
import 'package:have_on_behalf_companion/screens/bible_reader_screen.dart';
import 'package:have_on_behalf_companion/screens/egw_reader_screen.dart';
import 'package:have_on_behalf_companion/screens/favorites_notes_screen.dart';
import 'package:have_on_behalf_companion/screens/feedback_screen.dart';
import 'package:have_on_behalf_companion/screens/hymn_detail_screen.dart';
import 'package:have_on_behalf_companion/screens/hymn_list_screen.dart';
import 'package:have_on_behalf_companion/screens/main_navigation_shell.dart';
import 'package:have_on_behalf_companion/screens/plan_screen.dart';
import 'package:have_on_behalf_companion/services/bible_service.dart';
import 'package:have_on_behalf_companion/services/egw_service.dart';
import 'package:have_on_behalf_companion/services/hymn_repository.dart';
import 'package:have_on_behalf_companion/services/pitch_synthesizer_service.dart';
import 'package:have_on_behalf_companion/services/shared_data_provider.dart';
import 'package:have_on_behalf_companion/services/user_storage_service.dart';
import 'package:have_on_behalf_companion/theme/liturgical_themes.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Full Application Smoke & Compilation Integrity', () {
    test('All services and models compile and instantiate correctly', () {
      final hymnRepo = HymnRepository();
      expect(hymnRepo.allHymns, isEmpty);
      expect(hymnRepo.totalCount, 0);

      final bibleService = BibleService();
      expect(bibleService.versions.length, greaterThan(0));
      expect(bibleService.books.length, greaterThan(0));
      expect(BibleService.versions.length, greaterThan(0));
      expect(BibleService.books.length, greaterThan(0));

      final egwService = EgwService();
      expect(egwService.books.length, greaterThan(0));

      final style = LiturgicalThemes.getStanzaBodyStyle(
        useSerif: true,
        isDark: true,
        scale: 1.0,
      );
      expect(style.fontSize, 16.0);
    });

    testWidgets('App root widget and screens instantiate cleanly', (tester) async {
      expect(const HaveOnBehalfCompanionApp(), isNotNull);
      expect(const MainNavigationShell(), isNotNull);
      expect(const HymnListScreen(), isNotNull);
      expect(const BibleReaderScreen(), isNotNull);
      expect(const EgwReaderScreen(), isNotNull);
      expect(const BeamRemoteScreen(), isNotNull);
      expect(const PlanScreen(), isNotNull);
      expect(const FavoritesNotesScreen(), isNotNull);
      expect(const AccountSettingsScreen(), isNotNull);
      expect(const FeedbackScreen(), isNotNull);
    });
  });
}
