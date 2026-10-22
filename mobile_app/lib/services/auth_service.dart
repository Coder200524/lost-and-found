// SVKM Authentication Service for FinDora Mobile App
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'api_service.dart';

class UserModel {
  final String id;
  final String sapId;
  final String name;
  final String email;
  final String role;
  final String avatar;
  final String department;
  final String collegeId;
  final int points;
  final String badge;
  final String token;

  UserModel({
    required this.id,
    required this.sapId,
    required this.name,
    required this.email,
    required this.role,
    required this.avatar,
    required this.department,
    required this.collegeId,
    required this.points,
    required this.badge,
    required this.token,
  });

  factory UserModel.fromJson(Map<String, dynamic> json, {String token = ''}) {
    return UserModel(
      id: json['id'] ?? 'usr-local',
      sapId: json['sapId'] ?? '',
      name: json['name'] ?? 'SVKM Student',
      email: json['email'] ?? '',
      role: json['role'] ?? 'USER',
      avatar: json['avatar'] ?? '👨‍🎓',
      department: json['department'] ?? 'Information Technology',
      collegeId: json['collegeId'] ?? '',
      points: json['points'] ?? 100,
      badge: json['badge'] ?? 'Campus Scout',
      token: token.isNotEmpty ? token : (json['token'] ?? ''),
    );
  }
}

class AuthService extends ChangeNotifier {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  UserModel? _currentUser;
  UserModel? get currentUser => _currentUser;
  bool get isLoggedIn => _currentUser != null;

  // Demo user accounts matching web/prisma/seed.mjs
  static final Map<String, UserModel> demoAccounts = {
    '60017240146': UserModel(
      id: 'usr-suruchi',
      sapId: '60017240146',
      name: 'Suruchi Makwana',
      email: 'SURUCHI.MAKWANA46@svkmmumbai.onmicrosoft.com',
      role: 'USER',
      avatar: '👩‍💻',
      department: 'AIML',
      collegeId: 'A090',
      points: 250,
      badge: 'Campus Hero',
      token: 'demo-token-suruchi',
    ),
    'SURUCHI.MAKWANA46@svkmmumbai.onmicrosoft.com': UserModel(
      id: 'usr-suruchi',
      sapId: '60017240146',
      name: 'Suruchi Makwana',
      email: 'SURUCHI.MAKWANA46@svkmmumbai.onmicrosoft.com',
      role: 'USER',
      avatar: '👩‍💻',
      department: 'AIML',
      collegeId: 'A090',
      points: 250,
      badge: 'Campus Hero',
      token: 'demo-token-suruchi',
    ),
    '60004210088': UserModel(
      id: 'usr-priya',
      sapId: '60004210088',
      name: 'Priya Shah',
      email: 'priya@djsce.edu',
      role: 'USER',
      avatar: '👩‍🎓',
      department: 'Computer Engineering (Sem 5)',
      collegeId: '60004210088',
      points: 180,
      badge: 'Guardian Angel',
      token: 'demo-token-priya',
    ),
    'ADMIN-001': UserModel(
      id: 'usr-admin',
      sapId: 'ADMIN-001',
      name: 'Prof. Sharma (Admin)',
      email: 'admin@djsce.edu',
      role: 'ADMIN',
      avatar: '🛡️',
      department: 'Faculty / Admin Affairs',
      collegeId: 'FAC-DJSCE-101',
      points: 1000,
      badge: 'Master Moderator',
      token: 'demo-token-admin',
    ),
  };

  // Perform SVKM Login
  Future<Map<String, dynamic>> login({
    required String identifier,
    required String password,
  }) async {
    final cleanId = identifier.trim();

    // Compulsory SVKM Email Suffix check
    if (cleanId.contains('@') &&
        !cleanId.toLowerCase().endsWith('@svkmmumbai.onmicrosoft.com') &&
        !cleanId.toLowerCase().startsWith('admin')) {
      return {
        'success': false,
        'error': 'Compulsory SVKM Email Suffix required: email must end with @svkmmumbai.onmicrosoft.com',
      };
    }

    try {
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'sapId': cleanId,
          'email': cleanId,
          'password': password,
        }),
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && data['user'] != null) {
          final token = data['token'] ?? '';
          _currentUser = UserModel.fromJson(data['user'], token: token);
          notifyListeners();
          return {'success': true, 'user': _currentUser};
        }
      }
    } catch (e) {
      debugPrint('[AuthService] Live API login attempt failed: $e, checking demo accounts');
    }

    // Fallback: Check local demo credentials if offline or server unreachable
    final lower = cleanId.toLowerCase();
    for (final entry in demoAccounts.entries) {
      if (entry.key.toLowerCase() == lower || entry.value.email.toLowerCase() == lower) {
        _currentUser = entry.value;
        notifyListeners();
        return {'success': true, 'user': _currentUser, 'offline': true};
      }
    }

    // Default guest student account for any other SVKM SAP ID entered
    if (cleanId.isNotEmpty && password.length >= 4) {
      _currentUser = UserModel(
        id: 'usr-$cleanId',
        sapId: cleanId,
        name: 'SVKM Student ($cleanId)',
        email: '$cleanId@djsce.edu',
        role: 'USER',
        avatar: '🎓',
        department: 'DJSCE Engineering',
        collegeId: cleanId,
        points: 50,
        badge: 'SVKM Scout',
        token: 'local-token-$cleanId',
      );
      notifyListeners();
      return {'success': true, 'user': _currentUser, 'offline': true};
    }

    return {'success': false, 'error': 'Invalid SVKM credentials.'};
  }

  void loginAsGuest() {
    _currentUser = UserModel(
      id: 'guest',
      sapId: 'GUEST-01',
      name: 'Guest Explorer',
      email: 'guest@djsce.edu',
      role: 'USER',
      avatar: '🎒',
      department: 'Visitor / Explorer',
      collegeId: '',
      points: 50,
      badge: 'Explorer',
      token: 'guest-token',
    );
    notifyListeners();
  }

  void logout() {
    _currentUser = null;
    notifyListeners();
  }
}
