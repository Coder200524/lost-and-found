// SVKM Student Login Screen for FinDora Mobile App
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/theme_service.dart';

class LoginScreen extends StatefulWidget {
  final VoidCallback? onLoginSuccess;
  const LoginScreen({super.key, this.onLoginSuccess});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _theme = ThemeService();
  final _idController = TextEditingController(text: '60017240146');
  final _passwordController = TextEditingController(text: 'student123');
  bool _obscurePassword = true;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _theme.addListener(_onThemeChange);
  }

  @override
  void dispose() {
    _theme.removeListener(_onThemeChange);
    _idController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _onThemeChange() {
    if (mounted) setState(() {});
  }

  Future<void> _handleLogin() async {
    final id = _idController.text.trim();
    final pwd = _passwordController.text;

    if (id.isEmpty || pwd.isEmpty) {
      setState(() => _errorMessage = 'Please enter SAP ID / Email and password.');
      return;
    }

    if (id.contains('@') &&
        !id.toLowerCase().endsWith('@svkmmumbai.onmicrosoft.com') &&
        !id.toLowerCase().startsWith('admin')) {
      setState(() => _errorMessage = 'Compulsory SVKM Email Suffix required: email must end with @svkmmumbai.onmicrosoft.com');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final res = await AuthService().login(identifier: id, password: pwd);

    if (mounted) {
      setState(() => _isLoading = false);
      if (res['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF5BBF8E),
            content: Text('Welcome, ${AuthService().currentUser?.name ?? "Student"}! 🎓'),
          ),
        );
        widget.onLoginSuccess?.call();
        if (Navigator.canPop(context)) {
          Navigator.pop(context);
        }
      } else {
        setState(() => _errorMessage = res['error'] ?? 'Authentication failed.');
      }
    }
  }

  void _quickFill(String sapId, String password) {
    _idController.text = sapId;
    _passwordController.text = password;
    _handleLogin();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _theme.scaffoldColor,
      appBar: AppBar(
        title: Text('SVKM Student Login', style: TextStyle(fontWeight: FontWeight.bold, color: _theme.textColor)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: _theme.textColor),
        actions: [
          IconButton(
            icon: Icon(_theme.isDarkMode ? Icons.light_mode : Icons.dark_mode,
                color: _theme.isDarkMode ? Colors.amber : Colors.purple.shade300),
            tooltip: _theme.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
            onPressed: () => _theme.toggleTheme(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Logo & Header
            Center(
              child: Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFE8848F).withValues(alpha: 0.25),
                      blurRadius: 18,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Image.asset(
                    'assets/images/logo.png',
                    width: 100,
                    height: 100,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Welcome to Findora',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: _theme.textColor),
            ),
            const SizedBox(height: 6),
            Text(
              'Sign in using your SVKM SAP ID or College credentials',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: _theme.subtextColor),
            ),
            const SizedBox(height: 28),

            // Form Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: _theme.cardColor,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: _theme.borderColor),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: _theme.isDarkMode ? 0.25 : 0.05),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (_errorMessage != null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: _theme.isDarkMode ? const Color(0xFF38151B) : Colors.red.shade50,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.red.shade400),
                      ),
                      child: Text(
                        _errorMessage!,
                        style: TextStyle(color: Colors.red.shade300, fontSize: 13),
                      ),
                    ),

                  // SAP ID / Email Input
                  Text('SVKM SAP ID or College Email', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: _theme.textColor)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _idController,
                    style: TextStyle(color: _theme.textColor),
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.badge_outlined, color: Color(0xFFE8848F)),
                      hintText: 'e.g. 60017240146 or SURUCHI.MAKWANA46@svkmmumbai.onmicrosoft.com',
                      hintStyle: TextStyle(color: _theme.subtextColor.withValues(alpha: 0.7)),
                      filled: true,
                      fillColor: _theme.surfaceAltColor,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: _theme.borderColor),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: _theme.borderColor),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Password Input
                  Text('Password', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: _theme.textColor)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    style: TextStyle(color: _theme.textColor),
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFFE8848F)),
                      suffixIcon: IconButton(
                        icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility, color: _theme.subtextColor),
                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                      ),
                      hintText: 'Enter password',
                      hintStyle: TextStyle(color: _theme.subtextColor.withValues(alpha: 0.7)),
                      filled: true,
                      fillColor: _theme.surfaceAltColor,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: _theme.borderColor),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: _theme.borderColor),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Login Button
                  ElevatedButton(
                    onPressed: _isLoading ? null : _handleLogin,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE8848F),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: _isLoading
                        ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Text('Sign In 🚀', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Demo Accounts Chips
            Text(
              '⚡ Quick Demo Sign In (1-Tap):',
              textAlign: TextAlign.center,
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: _theme.subtextColor),
            ),
            const SizedBox(height: 12),
            Wrap(
              alignment: WrapAlignment.center,
              spacing: 8,
              runSpacing: 8,
              children: [
                ActionChip(
                  avatar: const Text('👩‍💻'),
                  label: Text('Suruchi (Student)', style: TextStyle(color: _theme.textColor)),
                  backgroundColor: _theme.cardColor,
                  side: BorderSide(color: _theme.borderColor),
                  onPressed: () => _quickFill('60017240146', 'student123'),
                ),
                ActionChip(
                  avatar: const Text('👩‍🎓'),
                  label: Text('Priya (Student)', style: TextStyle(color: _theme.textColor)),
                  backgroundColor: _theme.cardColor,
                  side: BorderSide(color: _theme.borderColor),
                  onPressed: () => _quickFill('60004210088', 'student123'),
                ),
                ActionChip(
                  avatar: const Text('🛡️'),
                  label: Text('Admin Sharma', style: TextStyle(color: _theme.textColor)),
                  backgroundColor: _theme.cardColor,
                  side: BorderSide(color: _theme.borderColor),
                  onPressed: () => _quickFill('ADMIN-001', 'admin123'),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Center(
              child: TextButton.icon(
                onPressed: () {
                  AuthService().loginAsGuest();
                  widget.onLoginSuccess?.call();
                  if (Navigator.canPop(context)) {
                    Navigator.pop(context);
                  }
                },
                icon: Icon(Icons.arrow_forward_rounded, size: 16, color: _theme.subtextColor),
                label: Text(
                  'Continue as Guest Explorer →',
                  style: TextStyle(
                    color: _theme.subtextColor,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }
}
