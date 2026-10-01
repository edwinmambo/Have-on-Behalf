class WorshipPlanItem {
  final String id;
  String title;
  String category; // 'hymn', 'scripture', 'prayer', 'sermon', 'general'
  String? hymnId;
  int? hymnNumber;
  String? hymnCollection;
  String? hymnTitle;
  String? assignedTo;
  String? notes;
  bool isCompleted;

  WorshipPlanItem({
    required this.id,
    required this.title,
    this.category = 'general',
    this.hymnId,
    this.hymnNumber,
    this.hymnCollection,
    this.hymnTitle,
    this.assignedTo,
    this.notes,
    this.isCompleted = false,
  });

  WorshipPlanItem copyWith({
    String? id,
    String? title,
    String? category,
    String? hymnId,
    int? hymnNumber,
    String? hymnCollection,
    String? hymnTitle,
    String? assignedTo,
    String? notes,
    bool? isCompleted,
  }) =>
      WorshipPlanItem(
        id: id ?? this.id,
        title: title ?? this.title,
        category: category ?? this.category,
        hymnId: hymnId ?? this.hymnId,
        hymnNumber: hymnNumber ?? this.hymnNumber,
        hymnCollection: hymnCollection ?? this.hymnCollection,
        hymnTitle: hymnTitle ?? this.hymnTitle,
        assignedTo: assignedTo ?? this.assignedTo,
        notes: notes ?? this.notes,
        isCompleted: isCompleted ?? this.isCompleted,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'category': category,
        'hymnId': hymnId,
        'hymnNumber': hymnNumber,
        'hymnCollection': hymnCollection,
        'hymnTitle': hymnTitle,
        'assignedTo': assignedTo,
        'notes': notes,
        'isCompleted': isCompleted,
      };

  factory WorshipPlanItem.fromJson(Map<String, dynamic> json) => WorshipPlanItem(
        id: json['id'] as String,
        title: json['title'] as String,
        category: json['category'] as String? ?? 'general',
        hymnId: json['hymnId'] as String?,
        hymnNumber: json['hymnNumber'] as int?,
        hymnCollection: json['hymnCollection'] as String?,
        hymnTitle: json['hymnTitle'] as String?,
        assignedTo: json['assignedTo'] as String?,
        notes: json['notes'] as String?,
        isCompleted: json['isCompleted'] as bool? ?? false,
      );
}

class WorshipPlan {
  final String id;
  String title;
  String subtitle;
  String date;
  String serviceType;
  List<WorshipPlanItem> items;

  WorshipPlan({
    required this.id,
    required this.title,
    this.subtitle = '',
    required this.date,
    required this.serviceType,
    required this.items,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'subtitle': subtitle,
        'date': date,
        'serviceType': serviceType,
        'items': items.map((e) => e.toJson()).toList(),
      };

  factory WorshipPlan.fromJson(Map<String, dynamic> json) => WorshipPlan(
        id: json['id'] as String,
        title: json['title'] as String,
        subtitle: json['subtitle'] as String? ?? '',
        date: json['date'] as String? ?? '',
        serviceType: json['serviceType'] as String? ?? 'Divine Service',
        items: (json['items'] as List<dynamic>?)
                ?.map((e) => WorshipPlanItem.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
      );
}
