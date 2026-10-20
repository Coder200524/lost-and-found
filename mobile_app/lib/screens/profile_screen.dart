// Profile & SVKM Identity Screen with Live Auth & Server Settings
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';
import 'login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _auth = AuthService();

  @override
  void initState() {
    super.initState();
    _auth.addListener(_onAuthChange);
  }

  @override
  void dispose() {
    _auth.removeListener(_onAuthChange);
    super.dispose();
  }

  void _onAuthChange() {
    if (mounted) setState(() {});
  }

  void _showServerSettingsDialog() {
    final hostController = TextEditingController(text: ApiService.customHost ?? '');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        backgroundColor: Colors.white,
        title: const Text('Backend Server Settings ⚙️', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Current Base URL:',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey),
            ),
            const SizedBox(height: 2),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF4F7),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                ApiService.baseUrl,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFFE8848F)),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Custom Host IP / URL:',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            TextField(
              controller: hostController,
              decoration: InputDecoration(
                hintText: 'e.g. 192.168.1.5 or localhost',
                hintStyle: TextStyle(fontSize: 12, color: Colors.grey.shade400),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 6,
              children: [
                ActionChip(
                  label: const Text('USB (localhost)', style: TextStyle(fontSize: 11)),
                  onPressed: () {
                    hostController.text = 'localhost';
                  },
                ),
                ActionChip(
                  label: const Text('Emulator (10.0.2.2)', style: TextStyle(fontSize: 11)),
                  onPressed: () {
                    hostController.text = '10.0.2.2';
                  },
                ),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE8848F),
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              setState(() {
                final host = hostController.text.trim();
                ApiService.customHost = host.isEmpty ? null : host;
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Updated Base URL to: ${ApiService.baseUrl}')),
              );
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = _auth.currentUser;
    final isLoggedIn = _auth.isLoggedIn;

    return Scaffold(
      backgroundColor: const Color(0xFFFEF4F7),
      appBar: AppBar(
        title: const Text('Campus Profile', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            tooltip: 'Server Settings',
            onPressed: _showServerSettingsDialog,
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Student ID Card Widget
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFE8848F), Color(0xFF9B8BDB)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.pink.withValues(alpha: 0.2),
                  blurRadius: 16,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('🌸 FinDora Mobile', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.25),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        isLoggedIn ? (user?.role ?? 'STUDENT') : 'GUEST',
                        style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Text(
                      user?.avatar ?? '👤',
                      style: const TextStyle(fontSize: 36),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isLoggedIn ? (user?.name ?? 'SVKM Student') : 'Not Logged In',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18),
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 3),
                          Text(
                            isLoggedIn ? (user?.department ?? 'SVKM DJSCE') : 'Sign in to access your profile & rewards',
                            style: const TextStyle(color: Colors.white70, fontSize: 11),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('SAP ID: ${user?.sapId ?? "—"}', style: const TextStyle(color: Colors.white, fontFamily: 'monospace', fontSize: 12)),
                    Text(user?.badge ?? 'Campus Member', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Sign In or Out Action Banner
          if (!isLoggedIn)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, 3)),
                ],
              ),
              child: Column(
                children: [
                  const Text('🔑 Access Student Features', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 4),
                  const Text('Sign in to submit claims, chat with owners, and earn rewards.', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: Color(0xFF7A6E80))),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE8848F),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      minimumSize: const Size.fromHeight(40),
                    ),
                    child: const Text('Sign In with SAP ID 🚀', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 16),

          // Rewards & Points
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, 3)),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem('⭐ Reward Points', '${user?.points ?? 0}', const Color(0xFF8A7A00), const Color(0xFFFDF3C0)),
                _buildStatItem('🛡️ Badge Status', user?.badge ?? 'Newbie', const Color(0xFF5BBF8E), const Color(0xFFC4EAD9)),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Menu Options
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, 3)),
              ],
            ),
            child: Column(
              children: [
                ListTile(
                  leading: const Text('⚙️', style: TextStyle(fontSize: 20)),
                  title: const Text('Server Connection (IP / USB)'),
                  subtitle: Text(ApiService.baseUrl, style: const TextStyle(fontSize: 11)),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                  onTap: _showServerSettingsDialog,
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Text('🔒', style: TextStyle(fontSize: 20)),
                  title: const Text('SVKM Privacy & Security'),
                  subtitle: const Text('Item masking & security desk handover', style: TextStyle(fontSize: 11)),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('FinDora complies with SVKM student privacy rules.')),
                    );
                  },
                ),
                if (isLoggedIn) ...[
                  const Divider(height: 1),
                  ListTile(
                    leading: const Text('🚪', style: TextStyle(fontSize: 20)),
                    title: const Text('Sign Out', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
                    onTap: () {
                      _auth.logout();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Logged out successfully.')),
                      );
                    },
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color, Color bg) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)),
          child: Text(value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: color)),
        ),
        const SizedBox(height: 6),
        Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF7A6E80))),
      ],
    );
  }
}
