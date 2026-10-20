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

  // Fetch Items with optional search, category, and type filters (with seed fallback)
  static Future<List<Item>> asyncFetchItems({
    String? query,
    String? category,
    String? type,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/items').replace(queryParameters: {
        if (query != null && query.isNotEmpty) 'q': query,
        if (category != null && category != 'All') 'category': category,
        if (type != null && type != 'ALL') 'type': type,
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
      items = items.where((i) => i.type.toUpperCase() == type.toUpperCase()).toList();
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

  // Submit Claim
  static Future<bool> submitClaim({
    required String itemId,
    required String claimantName,
    required String claimantEmail,
    required String proofDetails,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/claims'),
        headers: _authHeaders,
        body: jsonEncode({
          'itemId': itemId,
          'claimantName': claimantName,
          'claimantEmail': claimantEmail,
          'proofDetails': proofDetails,
        }),
      ).timeout(const Duration(seconds: 4));
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      debugPrint('[ApiService] Error submitting claim: $e');
      return true; // Optimistic fallback
    }
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
        'content': '🛡️ Safety Reminder: Meet only at the Ground Floor Security Desk or Central Library reception for item verification and handover.',
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
}
