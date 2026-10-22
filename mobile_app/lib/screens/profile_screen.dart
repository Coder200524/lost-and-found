// Profile & SVKM Identity Screen with Live Auth & Server Settings
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';
import '../services/theme_service.dart';
import 'login_screen.dart';
import 'admin_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _auth = AuthService();
  final _theme = ThemeService();
  List<Map<String, dynamic>> _myClaims = [];

  @override
  void initState() {
    super.initState();
    _auth.addListener(_onAuthChange);
    _theme.addListener(_onAuthChange);
    _loadClaims();
  }

  @override
  void dispose() {
    _auth.removeListener(_onAuthChange);
    _theme.removeListener(_onAuthChange);
    super.dispose();
  }

  void _onAuthChange() {
    if (mounted) {
      setState(() {});
      _loadClaims();
    }
  }

  Future<void> _loadClaims() async {
    final user = _auth.currentUser;
    if (user != null) {
      final claims = await ApiService.fetchMyClaims(claimantEmail: user.email, claimantId: user.id);
      if (mounted) {
        setState(() {
          _myClaims = claims;
        });
      }
    }
  }

  void _showServerSettingsDialog() {
    final hostController = TextEditingController(text: ApiService.customHost ?? '');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        backgroundColor: _theme.surfaceColor,
        title: Text(
          'Backend Server Settings ⚙️',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: _theme.textColor),
        ),
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
                color: _theme.surfaceAltColor,
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

    final isDark = _theme.isDarkMode;

    return Scaffold(
      backgroundColor: _theme.scaffoldColor,
      appBar: AppBar(
        title: Text(
          'Campus Profile',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: _theme.textColor),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode_outlined, color: _theme.textColor),
            tooltip: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
            onPressed: () => _theme.toggleTheme(),
          ),
          IconButton(
            icon: Icon(Icons.settings_outlined, color: _theme.textColor),
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

          // ADMIN SECURITY CONSOLE LAUNCH CARD
          if (isLoggedIn && user?.role == 'ADMIN')
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF3A3040), Color(0xFF4A3860)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(color: Colors.purple.withValues(alpha: 0.2), blurRadius: 12, offset: const Offset(0, 4)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text('🛡️', style: TextStyle(fontSize: 22)),
                      const SizedBox(width: 8),
                      const Expanded(
                        child: Text(
                          'SVKM Admin Security Console',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE8848F),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text('FACULTY', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Review pending ownership claims, oversee the safe handover queue, and moderate reports.',
                    style: TextStyle(color: Colors.white70, fontSize: 11, height: 1.3),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFF9C8CF),
                        foregroundColor: const Color(0xFF3A3040),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                      ),
                      icon: const Icon(Icons.admin_panel_settings_outlined, size: 18),
                      label: const Text('Open Admin Console →', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      onPressed: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminScreen()));
                      },
                    ),
                  ),
                ],
              ),
            ),

          // Sign In or Out Action Banner
          if (!isLoggedIn)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _theme.cardColor,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04), blurRadius: 10, offset: const Offset(0, 3)),
                ],
              ),
              child: Column(
                children: [
                  Text('🔑 Access Student Features', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: _theme.textColor)),
                  const SizedBox(height: 4),
                  Text('Sign in to submit claims, chat with owners, and earn rewards.', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: _theme.subtextColor)),
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
              color: _theme.cardColor,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04), blurRadius: 10, offset: const Offset(0, 3)),
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
          const SizedBox(height: 16),

          // My Submitted Claims (Requirement A.3 & F)
          if (isLoggedIn)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _theme.cardColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE8848F).withValues(alpha: 0.3)),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04), blurRadius: 10, offset: const Offset(0, 3)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '📋 My Submitted Claims (${_myClaims.length})',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: _theme.textColor),
                      ),
                      Text(
                        'Private Records',
                        style: TextStyle(fontSize: 10, color: _theme.subtextColor),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  if (_myClaims.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Text(
                        'No claims submitted yet. Browse found items to submit an ownership claim.',
                        style: TextStyle(fontSize: 12, color: _theme.subtextColor),
                      ),
                    )
                  else
                    ..._myClaims.map((claim) {
                      final status = claim['status'] ?? 'PENDING';
                      final isApproved = status == 'APPROVED';
                      final isRejected = status == 'REJECTED';
                      final item = claim['item'] as Map<String, dynamic>?;

                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: _theme.surfaceAltColor,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: isDark ? const Color(0xFF382E48) : Colors.black.withValues(alpha: 0.05)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    item?['title'] ?? 'Reported Item',
                                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: _theme.textColor),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: isApproved
                                        ? const Color(0xFFC4EAD9)
                                        : isRejected
                                            ? const Color(0xFFF9C8CF)
                                            : const Color(0xFFFDF3C0),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    status,
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: isApproved
                                          ? const Color(0xFF5BBF8E)
                                          : isRejected
                                              ? const Color(0xFFE8848F)
                                              : const Color(0xFF8A7A00),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Proof: ${claim['proofDetails'] ?? ''}',
                              style: TextStyle(fontSize: 11, color: _theme.subtextColor),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              isApproved
                                  ? '🎉 Approved! Collect item at Ground Floor Security Desk.'
                                  : isRejected
                                      ? '✕ Evidence insufficient. Contact security for assistance.'
                                      : '⏳ Pending review by campus administration.',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: isApproved
                                    ? const Color(0xFF5BBF8E)
                                    : isRejected
                                        ? const Color(0xFFE8848F)
                                        : const Color(0xFF8A7A00),
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                ],
              ),
            ),
          const SizedBox(height: 16),

          // Menu Options
          Container(
            decoration: BoxDecoration(
              color: _theme.cardColor,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04), blurRadius: 10, offset: const Offset(0, 3)),
              ],
            ),
            child: Column(
              children: [
                SwitchListTile(
                  secondary: Text(isDark ? '🌙' : '☀️', style: const TextStyle(fontSize: 20)),
                  title: Text('Dark Mode Appearance', style: TextStyle(fontWeight: FontWeight.w600, color: _theme.textColor)),
                  subtitle: Text(
                    isDark ? 'Dark theme enabled' : 'Light theme enabled',
                    style: TextStyle(fontSize: 11, color: _theme.subtextColor),
                  ),
                  value: isDark,
                  activeThumbColor: const Color(0xFFE8848F),
                  onChanged: (val) {
                    _theme.setDarkMode(val);
                  },
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Text('⚙️', style: TextStyle(fontSize: 20)),
                  title: Text('Server Connection (IP / USB)', style: TextStyle(color: _theme.textColor)),
                  subtitle: Text(ApiService.baseUrl, style: TextStyle(fontSize: 11, color: _theme.subtextColor)),
                  trailing: Icon(Icons.arrow_forward_ios, size: 14, color: _theme.subtextColor),
                  onTap: _showServerSettingsDialog,
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Text('🔒', style: TextStyle(fontSize: 20)),
                  title: Text('SVKM Privacy & Security', style: TextStyle(color: _theme.textColor)),
                  subtitle: Text('Item masking & security desk handover', style: TextStyle(fontSize: 11, color: _theme.subtextColor)),
                  trailing: Icon(Icons.arrow_forward_ios, size: 14, color: _theme.subtextColor),
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
          const SizedBox(height: 24),
          Center(
            child: Column(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.asset(
                    'assets/images/logo.png',
                    width: 44,
                    height: 44,
                    fit: BoxFit.contain,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Findora v1.0.0',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: _theme.subtextColor),
                ),
                const SizedBox(height: 2),
                Text(
                  'Smart Lost & Found for SVKM DJSCE',
                  style: TextStyle(fontSize: 11, color: _theme.subtextColor.withValues(alpha: 0.7)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color, Color bg) {
    final isDark = _theme.isDarkMode;
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF282036) : bg,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
              color: isDark ? const Color(0xFFF78DA7) : color,
            ),
          ),
        ),
        const SizedBox(height: 6),
        Text(label, style: TextStyle(fontSize: 12, color: _theme.subtextColor)),
      ],
    );
  }
}
