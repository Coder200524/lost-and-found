// Dart Data Model: Item (ADF Module: Exploring Dart Language - SVKM Mindmap Schema)
class Item {
  final String id;
  final String title;
  final String description;
  final String category;
  final String type; // 'LOST' or 'FOUND'
  final String location;
  final bool isHotspot;
  final bool isMasked;
  final bool isUrgent;
  final int reportsCount;
  final String dateOccurred;
  final String status; // 'OPEN', 'CLAIMED', 'RESOLVED'
  final String imageUrl;
  final String reward;
  final String contactName;
  final String contactEmail;
  final String? contactPhone;
  final String? userId;

  Item({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.type,
    required this.location,
    this.isHotspot = false,
    this.isMasked = false,
    this.isUrgent = false,
    this.reportsCount = 0,
    required this.dateOccurred,
    required this.status,
    required this.imageUrl,
    required this.reward,
    required this.contactName,
    required this.contactEmail,
    this.contactPhone,
    this.userId,
  });

  factory Item.fromJson(Map<String, dynamic> json) {
    return Item(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? 'Others',
      type: (json['type'] ?? 'LOST').toString().toUpperCase(),
      location: json['location'] ?? 'Campus',
      isHotspot: json['isHotspot'] ?? false,
      isMasked: json['isMasked'] ?? false,
      isUrgent: json['isUrgent'] ?? false,
      reportsCount: json['reportsCount'] ?? 0,
      dateOccurred: json['dateOccurred'] ?? '',
      status: (json['status'] ?? 'OPEN').toString().toUpperCase(),
      imageUrl: json['imageUrl'] ?? '',
      reward: json['reward'] ?? '',
      contactName: json['contactName'] ?? 'Anonymous',
      contactEmail: json['contactEmail'] ?? '',
      contactPhone: json['contactPhone'],
      userId: json['userId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'category': category,
      'type': type,
      'location': location,
      'isHotspot': isHotspot,
      'isMasked': isMasked,
      'isUrgent': isUrgent,
      'dateOccurred': dateOccurred,
      'imageUrl': imageUrl,
      'reward': reward,
      'contactName': contactName,
      'contactEmail': contactEmail,
      'contactPhone': contactPhone ?? '',
    };
  }

  bool get isLost => type == 'LOST';
  bool get isFound => type == 'FOUND';
  bool get isResolved => status == 'RESOLVED';
}
