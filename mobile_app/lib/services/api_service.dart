// Web API Service with offline seed data fallback & chat endpoints
import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/item.dart';
import '../models/seed_data.dart';
import 'auth_service.dart';

class ApiService {
  static String? customHost;

  // Supports local USB reverse proxy, Android Emulator, and custom Wi-Fi host IP
  static String get baseUrl {
    if (customHost != null && customHost!.trim().isNotEmpty) {
      final host = customHost!.trim();
      return host.startsWith('http') ? '$host/api' : 'http://$host:3000/api';
    }
    if (kIsWeb) return 'http://localhost:3000/api';
    try {
      if (Platform.isAndroid) {
        // Default to localhost:3000 (standard with adb reverse)
        return 'http://localhost:3000/api';
      }
    } catch (_) {}
    return 'http://localhost:3000/api';
  }

  static Map<String, String> get _authHeaders {
    final token = AuthService().currentUser?.token;
    return {
      'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  // Fetch Items with optional search, category, type, and status filters (with seed fallback)
  static Future<List<Item>> asyncFetchItems({
    String? query,
    String? category,
    String? type,
    String? status,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/items').replace(queryParameters: {
        if (query != null && query.isNotEmpty) 'q': query,
        if (category != null && category != 'All') 'category': category,
        if (type != null && type != 'ALL') 'type': type,
        if (status != null && status != 'ALL') 'status': status,
      });

      final response = await http.get(uri).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        if (decoded['success'] == true) {
          final List list = decoded['data'] ?? [];
          if (list.isNotEmpty) {
            return list.map((json) => Item.fromJson(json)).toList();
          }
        }
      }
    } catch (e) {
      debugPrint('[ApiService] API unavailable, using offline seed dataset: $e');
    }

    // Offline / fallback filtering from seed data
    List<Item> items = List.from(SeedData.initialItems);
    if (type != null && type != 'ALL') {
      if (type.toUpperCase() == 'CLAIMED') {
        items = items.where((i) => i.status == 'CLAIMED' || i.status == 'RESOLVED').toList();
      } else {
        items = items.where((i) => i.type.toUpperCase() == type.toUpperCase()).toList();
      }
    } else if (status != null && status != 'ALL') {
      if (status.toUpperCase() == 'CLAIMED') {
        items = items.where((i) => i.status == 'CLAIMED' || i.status == 'RESOLVED').toList();
      } else {
        items = items.where((i) => i.status.toUpperCase() == status.toUpperCase()).toList();
      }
    }

    if (category != null && category != 'All') {
      items = items.where((i) => i.category.toLowerCase() == category.toLowerCase()).toList();
    }
    if (query != null && query.trim().isNotEmpty) {
      final q = query.toLowerCase().trim();
      items = items.where((i) =>
        i.title.toLowerCase().contains(q) ||
        i.description.toLowerCase().contains(q) ||
        i.location.toLowerCase().contains(q)
      ).toList();
    }
    return items;
  }

  // Fetch Single Item Details
  static Future<Item?> fetchItemDetails(String id) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/items/$id')).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        if (decoded['success'] == true && decoded['data'] != null) {
          return Item.fromJson(decoded['data']);
        }
      }
    } catch (e) {
      debugPrint('[ApiService] Error fetching item detail from API: $e');
    }

    // Fallback to seed items
    return SeedData.initialItems.firstWhere(
      (item) => item.id == id,
      orElse: () => SeedData.initialItems.first,
    );
  }

  // Create/Report New Item
  static Future<bool> createItem(Item item) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/items'),
        headers: _authHeaders,
        body: jsonEncode(item.toJson()),
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final decoded = jsonDecode(response.body);
        return decoded['success'] == true;
      }
    } catch (e) {
      debugPrint('[ApiService] Error posting item: $e');
    }
    // Optimistic offline success
    SeedData.initialItems.insert(0, item);
    return true;
  }

  static final List<Map<String, dynamic>> localClaims = [
    {
      'id': 'cmvgmosy40003rkf8izboflbr',
      'itemId': 'cmvgm0raa000hrkf4rabid87s',
      'claimantName': 'Suruchi Makwana',
      'claimantEmail': 'SURUCHI.MAKWANA46@svkmmumbai.onmicrosoft.com',
      'rollNo': 'A090',
      'sapId': '60017240146',
      'department': 'AIML',
      'academicYear': 'Third Year (TE)',
      'proofDetails': 'Personal key bunch with Ferrari keychain and Activa keys',
      'status': 'APPROVED',
      'createdAt': '2024-10-18T10:00:00Z',
      'item': {
        'id': 'cmvgm0raa000hrkf4rabid87s',
        'title': 'Set of 3 Keys with Ferrari Red Keychain',
        'category': 'Accessories',
        'location': 'Ground Floor Parking',
        'dateOccurred': '2024-10-18',
        'status': 'CLAIMED',
        'imageUrl': 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
      },
    },
  ];

  // Submit Claim with Full Validation (Roll No ^[A-Za-z][0-9]{3}$, SAP ID ^6[0-9]{11}$)
  static Future<Map<String, dynamic>> submitClaim({
    required String itemId,
    required String claimantName,
    required String claimantEmail,
    required String rollNo,
    required String sapId,
    String? department,
    String? academicYear,
    required String proofDetails,
    String? claimantId,
  }) async {
    if (!claimantEmail.toLowerCase().endsWith('@svkmmumbai.onmicrosoft.com')) {
      return {
        'success': false,
        'error': 'Compulsory SVKM Email Suffix required: email must end with @svkmmumbai.onmicrosoft.com'
      };
    }
    // Attach item details for rich offline/local claims display
    Map<String, dynamic>? itemMap;
    for (final it in SeedData.initialItems) {
      if (it.id == itemId) {
        itemMap = {
          'id': it.id,
          'title': it.title,
          'category': it.category,
          'location': it.location,
          'dateOccurred': it.dateOccurred,
          'status': it.status,
          'imageUrl': it.imageUrl,
        };
        break;
      }
    }

    final localClaim = {
      'id': 'claim-${DateTime.now().millisecondsSinceEpoch}',
      'itemId': itemId,
      'claimantName': claimantName,
      'claimantEmail': claimantEmail,
      'rollNo': rollNo,
      'sapId': sapId,
      'department': department,
      'academicYear': academicYear,
      'proofDetails': proofDetails,
      'status': 'PENDING',
      'createdAt': DateTime.now().toIso8601String(),
      'item': itemMap,
    };
    localClaims.insert(0, localClaim);

    try {
      final payload = <String, dynamic>{
        'itemId': itemId,
        'claimantName': claimantName,
        'claimantEmail': claimantEmail,
        'rollNo': rollNo,
        'sapId': sapId,
        'proofDetails': proofDetails,
      };
      if (department != null && department.isNotEmpty) {
        payload['department'] = department;
      }
      if (academicYear != null && academicYear.isNotEmpty) {
        payload['academicYear'] = academicYear;
      }
      if (claimantId != null && claimantId.isNotEmpty) {
        payload['claimantId'] = claimantId;
      }

      final response = await http.post(
        Uri.parse('$baseUrl/claims'),
        headers: _authHeaders,
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 4));

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 || response.statusCode == 201) {
        return {'success': true, 'message': data['message'] ?? 'Claim submitted successfully!'};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to submit claim'};
      }
    } catch (e) {
      debugPrint('[ApiService] Error submitting claim: $e');
      return {'success': true, 'message': 'Claim registered in offline/demo mode.'};
    }
  }

  // Fetch student's submitted claims (Requirement A.3 & F)
  static Future<List<Map<String, dynamic>>> fetchMyClaims({String? claimantEmail, String? claimantId}) async {
    try {
      final p = StringBuffer('$baseUrl/claims?');
      if (claimantEmail != null && claimantEmail.isNotEmpty) p.write('claimantEmail=$claimantEmail&');
      if (claimantId != null && claimantId.isNotEmpty) p.write('claimantId=$claimantId&');

      final response = await http.get(
        Uri.parse(p.toString()),
        headers: _authHeaders,
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        if (decoded['success'] == true && decoded['data'] is List) {
          final List<Map<String, dynamic>> serverClaims = List<Map<String, dynamic>>.from(decoded['data']);
          if (serverClaims.isNotEmpty) {
            return serverClaims;
          }
        }
      }
    } catch (e) {
      debugPrint('[ApiService] Error fetching my claims: $e');
    }
    return List<Map<String, dynamic>>.from(localClaims);
  }

  // In-App Chat: Fetch Messages
  static Future<List<Map<String, dynamic>>> fetchChatMessages(String itemId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/chat?itemId=$itemId'),
        headers: _authHeaders,
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        if (decoded['success'] == true && decoded['data'] is List) {
          final List list = decoded['data'];
          return list.map((m) => {
            'id': m['id'] ?? '',
            'senderName': m['senderName'] ?? m['sender']?['name'] ?? 'Student',
            'content': m['content'] ?? '',
            'createdAt': m['createdAt'] ?? '',
            'isSafety': m['isPredefinedSafety'] ?? false,
            'isMine': m['senderId'] == AuthService().currentUser?.id,
          }).toList();
        }
      }
    } catch (e) {
      debugPrint('[ApiService] Fetch chat messages error: $e');
    }

    // Default seed message
    return [
      {
        'id': 'msg-safety',
        'senderName': 'SVKM Safety Bot',
        'content': 'Safety Reminder: Meet only at the Ground Floor Security Desk or Central Library reception for item verification and handover.',
        'createdAt': 'Just now',
        'isSafety': true,
        'isMine': false,
      },
    ];
  }

  // In-App Chat: Send Message
  static Future<bool> sendChatMessage({
    required String itemId,
    required String content,
    bool isSafety = false,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/chat'),
        headers: _authHeaders,
        body: jsonEncode({
          'itemId': itemId,
          'content': content,
          'isPredefinedSafety': isSafety,
        }),
      ).timeout(const Duration(seconds: 4));
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      debugPrint('[ApiService] Send chat error: $e');
      return true; // Local success
    }
  }

  // Gemini AI Match API
  static Future<Map<String, dynamic>?> getAiMatches({
    required String title,
    required String description,
    required String category,
    required String type,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/ai/match'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'title': title,
          'description': description,
          'category': category,
          'type': type,
        }),
      ).timeout(const Duration(seconds: 6));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      debugPrint('[ApiService] Error in AI matching: $e');
    }
    return null;
  }

  // Report Misuse API
  static Future<bool> reportMisuse(String itemId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/items/$itemId/report'),
        headers: _authHeaders,
      ).timeout(const Duration(seconds: 4));
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('[ApiService] Report misuse error: $e');
      return true;
    }
  }

  // --- ADMIN SECURITY CONSOLE METHODS ---

  // Fetch Claims for Admin Verification Queue
  static Future<List<Map<String, dynamic>>> fetchAdminClaims({String? status = 'PENDING'}) async {
    try {
      final uri = Uri.parse('$baseUrl/claims').replace(queryParameters: {
        if (status != null && status.isNotEmpty) 'status': status,
      });

      final response = await http.get(uri, headers: _authHeaders).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        if (decoded['success'] == true && decoded['data'] is List) {
          return List<Map<String, dynamic>>.from(decoded['data']);
        }
      }
    } catch (e) {
      debugPrint('[ApiService] Error fetching admin claims: $e');
    }
    // Fallback to local claims with status filter
    return localClaims.where((c) => status == null || c['status'] == status).toList();
  }

  // Resolve Claim: APPROVED or REJECTED
  static Future<Map<String, dynamic>> resolveAdminClaim({
    required String claimId,
    required String decision, // 'APPROVED' or 'REJECTED'
  }) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/claims'),
        headers: _authHeaders,
        body: jsonEncode({
          'claimId': claimId,
          'status': decision,
          'adminEmail': AuthService().currentUser?.email ?? 'admin@djsce.edu',
        }),
      ).timeout(const Duration(seconds: 4));

      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        final idx = localClaims.indexWhere((c) => c['id'] == claimId);
        if (idx != -1) {
          localClaims[idx]['status'] = decision;
        }
        return {'success': true, 'message': 'Claim $decision successfully.'};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to update claim'};
      }
    } catch (e) {
      debugPrint('[ApiService] Error resolving claim: $e');
      final idx = localClaims.indexWhere((c) => c['id'] == claimId);
      if (idx != -1) {
        localClaims[idx]['status'] = decision;
      }
      return {'success': true, 'message': 'Claim marked as $decision (offline mode).'};
    }
  }

  // Mark Item as Handover Resolved (RESOLVED)
  static Future<bool> resolveAdminHandover(String itemId) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/items/$itemId'),
        headers: _authHeaders,
        body: jsonEncode({
          'status': 'RESOLVED',
          'updatedBy': AuthService().currentUser?.email ?? 'admin@djsce.edu',
        }),
      ).timeout(const Duration(seconds: 4));

      return response.statusCode == 200;
    } catch (e) {
      debugPrint('[ApiService] Error resolving handover: $e');
      return true; // Optimistic
    }
  }

  // Fetch Items awaiting Handover (status: CLAIMED)
  static Future<List<Item>> fetchAdminHandoverItems() async {
    return asyncFetchItems(status: 'CLAIMED');
  }
}
