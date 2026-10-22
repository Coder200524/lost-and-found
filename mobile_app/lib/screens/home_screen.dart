// Home Dashboard Screen (ADF Module: Working with Flutter & Mini Project II)
import 'package:flutter/material.dart';
import '../models/item.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/theme_service.dart';
import '../widgets/item_card.dart';
import 'item_detail_screen.dart';
import 'admin_screen.dart';

class HomeScreen extends StatefulWidget {
  final Function(int) onNavigateTab;

  const HomeScreen({super.key, required this.onNavigateTab});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _theme = ThemeService();
  List<Item> _recentItems = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _theme.addListener(_onThemeChange);
    _loadRecent();
  }

  @override
  void dispose() {
    _theme.removeListener(_onThemeChange);
    super.dispose();
  }

  void _onThemeChange() {
    if (mounted) setState(() {});
  }

  Future<void> _loadRecent() async {
    setState(() => _loading = true);
    final items = await ApiService.asyncFetchItems();
    if (mounted) {
      setState(() {
        _recentItems = items;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = _theme.isDarkMode;

    return Scaffold(
      backgroundColor: _theme.scaffoldColor,
      appBar: AppBar(
        backgroundColor: _theme.surfaceColor.withValues(alpha: 0.9),
        elevation: 0,
        title: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.asset(
                'assets/images/logo.png',
                width: 28,
                height: 28,
                fit: BoxFit.contain,
              ),
            ),
            const SizedBox(width: 8),
            const Text(
              'Findora',
              style: TextStyle(
                fontWeight: FontWeight.w900,
                color: Color(0xFFE8848F),
                fontSize: 20,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF3E3514) : const Color(0xFFFDF3C0),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                'DJSCE',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: isDark ? const Color(0xFFFDE884) : const Color(0xFF8B6E00),
                ),
              ),
            ),
          ],
        ),
        actions: [
          if (AuthService().currentUser?.role == 'ADMIN')
            IconButton(
              icon: const Icon(Icons.admin_panel_settings, color: Color(0xFFE8848F)),
              tooltip: 'Admin Security Console',
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminScreen())),
            ),
          IconButton(
            icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode_outlined, color: _theme.textColor),
            tooltip: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
            onPressed: () => _theme.toggleTheme(),
          ),
          IconButton(
            icon: Icon(Icons.refresh, color: _theme.textColor),
            tooltip: 'Refresh items',
            onPressed: _loadRecent,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadRecent,
        color: const Color(0xFFE8848F),
        child: ListView(
          padding: const EdgeInsets.only(bottom: 24),
          children: [
            // Welcome Header
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Campus Lost & Found',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: _theme.textColor,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Reunite with your belongings using Gemini AI and student collaboration.',
                    style: TextStyle(fontSize: 13, color: _theme.subtextColor),
                  ),
                ],
              ),
            ),

            // Quick Stats Cards
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  _buildStatTile(
                    '${_recentItems.length}',
                    'Campus Items',
                    const Color(0xFFF9C8CF),
                    const Color(0xFFE8848F),
                  ),
                  const SizedBox(width: 12),
                  _buildStatTile(
                    '${_recentItems.where((i) => i.isLost).length}',
                    'Lost Reports',
                    const Color(0xFFFDE8EA),
                    const Color(0xFFD9485E),
                  ),
                  const SizedBox(width: 12),
                  _buildStatTile(
                    '${_recentItems.where((i) => i.isFound).length}',
                    'Found Items',
                    const Color(0xFFC4EAD9),
                    const Color(0xFF2B9365),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // AI Matcher Banner
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFDDD6F3), Color(0xFFF9C8CF)],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.purple.withValues(alpha: 0.08),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    const Text('🤖', style: TextStyle(fontSize: 36)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Gemini AI Assistant',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: Color(0xFF3A3040),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Smart matching based on natural language descriptions.',
                            style: TextStyle(fontSize: 11, color: Colors.grey.shade700),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () => widget.onNavigateTab(2), // Matcher tab
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6D28D9),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                      child: const Text('Try Matcher', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Section Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Recently Reported',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: _theme.textColor),
                  ),
                  TextButton(
                    onPressed: () => widget.onNavigateTab(1), // Browse tab
                    child: const Text('View All →', style: TextStyle(fontSize: 12, color: Color(0xFFE8848F))),
                  ),
                ],
              ),
            ),

            // Items List
            if (_loading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(40),
                  child: CircularProgressIndicator(color: Color(0xFFE8848F)),
                ),
              )
            else if (_recentItems.isEmpty)
              Padding(
                padding: const EdgeInsets.all(32),
                child: Center(
                  child: Text('No items reported yet.', style: TextStyle(color: _theme.subtextColor)),
                ),
              )
            else
              ..._recentItems.take(5).map(
                    (item) => ItemCard(
                      item: item,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => ItemDetailScreen(item: item),
                          ),
                        );
                      },
                    ),
                  ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatTile(String value, String label, Color bg, Color text) {
    final isDark = _theme.isDarkMode;
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF221A2E) : bg.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isDark ? const Color(0xFF382E48) : bg),
        ),
        child: Column(
          children: [
            Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: text)),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.grey.shade400 : Colors.grey.shade700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
