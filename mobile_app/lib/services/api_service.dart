// Web API Service (ADF Mini Project II: Fetching Web API Data)
import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/item.dart';

class ApiService {
  // Use 10.0.2.2 for Android emulator, localhost for Windows/Web/iOS
  static String get baseUrl {
    if (kIsWeb) return 'http://localhost:3000/api';
    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:3000/api';
    } catch (_) {}
    return 'http://localhost:3000/api';
  }

  // Fetch Items with optional search, category, and type filters
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

      final response = await http.get(uri).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        if (decoded['success'] == true) {
          final List list = decoded['data'] ?? [];
          return list.map((json) => Item.fromJson(json)).toList();
        }
      }
      return <Item>[];
    } catch (e) {
      debugPrint('[ApiService] Error fetching items: $e');
      return <Item>[];
    }
  }

  // Fetch Single Item Details
  static Future<Item?> fetchItemDetails(String id) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/items/$id'));
      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        if (decoded['success'] == true && decoded['data'] != null) {
          return Item.fromJson(decoded['data']);
        }
      }
      return null;
    } catch (e) {
      debugPrint('[ApiService] Error fetching item detail: $e');
      return null;
    }
  }

  // Create/Report New Item
  static Future<bool> createItem(Item item) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/items'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(item.toJson()),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        final decoded = jsonDecode(response.body);
        return decoded['success'] == true;
      }
      return false;
    } catch (e) {
      debugPrint('[ApiService] Error posting item: $e');
      return false;
    }
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
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'itemId': itemId,
          'claimantName': claimantName,
          'claimantEmail': claimantEmail,
          'proofDetails': proofDetails,
        }),
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      debugPrint('[ApiService] Error submitting claim: $e');
      return false;
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
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      debugPrint('[ApiService] Error in AI matching: $e');
      return null;
    }
  }
}
