import 'package:flutter_test/flutter_test.dart';
import '../lib/models/worship_plan.dart';

void main() {
  group('WorshipPlan Model Tests', () {
    test('Correctly serializes and deserializes a liturgical worship plan', () {
      final item = WorshipPlanItem(
        id: 'item_1',
        title: 'Opening Hymn',
        category: 'hymn',
        hymnNumber: 100,
        hymnTitle: 'Great Is Thy Faithfulness',
        hymnCollection: 'SDAH',
        assignedTo: 'Bro. Edwin',
        notes: 'Stanzas 1, 2, 4',
      );

      final plan = WorshipPlan(
        id: 'plan_1',
        title: 'Sabbath Divine Service',
        serviceType: 'Divine Service',
        date: 'This Sabbath',
        items: [item],
      );

      final json = plan.toJson();
      final restored = WorshipPlan.fromJson(json);

      expect(restored.id, 'plan_1');
      expect(restored.title, 'Sabbath Divine Service');
      expect(restored.items.length, 1);
      expect(restored.items.first.hymnNumber, 100);
      expect(restored.items.first.assignedTo, 'Bro. Edwin');
      expect(restored.items.first.isCompleted, isFalse);

      final completedItem = restored.items.first.copyWith(isCompleted: true);
      expect(completedItem.isCompleted, isTrue);
    });
  });
}
