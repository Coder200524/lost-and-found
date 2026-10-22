// Tinder-style Swipe to Match Screen (Matches web/src/components/SwipeClient.tsx)
import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../models/item.dart';
import '../services/api_service.dart';
import '../services/theme_service.dart';
import 'chat_screen.dart';
import 'item_detail_screen.dart';

class SwipeScreen extends StatefulWidget {
  final Function(int)? onNavigateTab;
  const SwipeScreen({super.key, this.onNavigateTab});

  @override
  State<SwipeScreen> createState() => _SwipeScreenState();
}

class _SwipeScreenState extends State<SwipeScreen> {
  final _theme = ThemeService();
  String _activeTab = 'FOUND'; // 'FOUND' or 'LOST'
  List<Item> _items = [];
  int _currentIndex = 0;
  bool _loading = true;

  // Gesture drag offset
  Offset _dragOffset = Offset.zero;

  @override
  void initState() {
    super.initState();
    _theme.addListener(_onThemeChange);
    _loadItems();
  }

  @override
  void dispose() {
    _theme.removeListener(_onThemeChange);
    super.dispose();
  }

  void _onThemeChange() {
    if (mounted) setState(() {});
  }

  Future<void> _loadItems() async {
    setState(() => _loading = true);
    final list = await ApiService.asyncFetchItems(type: _activeTab);
    if (mounted) {
      setState(() {
        _items = list;
        _currentIndex = 0;
        _loading = false;
        _dragOffset = Offset.zero;
      });
    }
  }

  void _onSwipe(bool isRight) {
    if (_currentIndex >= _items.length) return;
    final swipedItem = _items[_currentIndex];

    setState(() {
      _currentIndex++;
      _dragOffset = Offset.zero;
    });

    if (isRight) {
      _showMatchDialog(swipedItem);
    }
  }

  void _showMatchDialog(Item item) {
    final isDark = _theme.isDarkMode;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        backgroundColor: _theme.cardColor,
        contentPadding: const EdgeInsets.all(24),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1B3B2F) : const Color(0xFFC4EAD9),
                shape: BoxShape.circle,
              ),
              child: const Center(child: Text('🎉', style: TextStyle(fontSize: 32))),
            ),
            const SizedBox(height: 16),
            Text(
              'It\'s a Potential Match!',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: _theme.textColor),
            ),
            const SizedBox(height: 8),
            Text(
              'Could "${item.title}" belong to you?',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: _theme.subtextColor),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => ChatScreen(preselectedItemId: item.id)),
                );
              },
              icon: const Icon(Icons.chat_bubble_outline),
              label: const Text('Open In-App Chat 💬'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE8848F),
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(44),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 8),
            OutlinedButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => ItemDetailScreen(item: item)),
                );
              },
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(44),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('View Full Details & Claim 📝'),
            ),
            const SizedBox(height: 4),
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Continue Swiping', style: TextStyle(color: Colors.grey)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final hasCard = _currentIndex < _items.length;
    final currentItem = hasCard ? _items[_currentIndex] : null;

    return Scaffold(
      backgroundColor: _theme.scaffoldColor,
      appBar: AppBar(
        title: Text('Swipe to Match', style: TextStyle(fontWeight: FontWeight.bold, color: _theme.textColor)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(_theme.isDarkMode ? Icons.light_mode : Icons.dark_mode,
                color: _theme.isDarkMode ? Colors.amber : Colors.purple.shade300),
            tooltip: _theme.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
            onPressed: () => _theme.toggleTheme(),
          ),
          IconButton(
            icon: Icon(Icons.refresh, color: _theme.textColor),
            onPressed: _loadItems,
            tooltip: 'Reload Cards',
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Tabs (FOUND vs LOST)
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: _theme.cardColor,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: _theme.borderColor),
            ),
            child: Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      if (_activeTab != 'FOUND') {
                        setState(() => _activeTab = 'FOUND');
                        _loadItems();
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: _activeTab == 'FOUND' ? const Color(0xFFE8848F) : Colors.transparent,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        'Found Items (Did you lose?)',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: _activeTab == 'FOUND' ? Colors.white : _theme.subtextColor,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      if (_activeTab != 'LOST') {
                        setState(() => _activeTab = 'LOST');
                        _loadItems();
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: _activeTab == 'LOST' ? const Color(0xFF9B8BDB) : Colors.transparent,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        'Lost Items (Did you find?)',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: _activeTab == 'LOST' ? Colors.white : _theme.subtextColor,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Cards Area
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFFE8848F)))
                : Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    child: hasCard && currentItem != null
                        ? GestureDetector(
                            onPanUpdate: (details) {
                              setState(() {
                                _dragOffset += details.delta;
                              });
                            },
                            onPanEnd: (details) {
                              if (_dragOffset.dx > 100) {
                                _onSwipe(true);
                              } else if (_dragOffset.dx < -100) {
                                _onSwipe(false);
                              } else {
                                setState(() => _dragOffset = Offset.zero);
                              }
                            },
                            child: Transform.translate(
                              offset: _dragOffset,
                              child: Transform.rotate(
                                angle: (_dragOffset.dx / 300) * (math.pi / 12),
                                child: _buildSwipeCard(currentItem),
                              ),
                            ),
                          )
                        : _buildEmptyState(),
                  ),
          ),

          // Bottom Action Buttons
          if (hasCard)
            Padding(
              padding: const EdgeInsets.only(bottom: 24, top: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Pass Button
                  _buildCircleBtn(
                    icon: Icons.close,
                    color: Colors.red.shade400,
                    bg: Colors.red.shade50,
                    onTap: () => _onSwipe(false),
                  ),
                  const SizedBox(width: 24),
                  // Reset Button
                  _buildCircleBtn(
                    icon: Icons.undo,
                    color: Colors.amber.shade700,
                    bg: Colors.amber.shade50,
                    size: 46,
                    onTap: () {
                      if (_currentIndex > 0) {
                        setState(() => _currentIndex--);
                      }
                    },
                  ),
                  const SizedBox(width: 24),
                  // Match Button
                  _buildCircleBtn(
                    icon: Icons.favorite,
                    color: const Color(0xFF5BBF8E),
                    bg: const Color(0xFFC4EAD9).withValues(alpha: 0.5),
                    onTap: () => _onSwipe(true),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSwipeCard(Item item) {
    return Container(
      decoration: BoxDecoration(
        color: _theme.cardColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: _theme.borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: _theme.isDarkMode ? 0.25 : 0.08),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image with Category & Hotspot Badge
            Expanded(
              flex: 5,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    item.imageUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      color: _theme.isDarkMode ? const Color(0xFF2A2438) : const Color(0xFFDDD6F3),
                      child: const Center(child: Text('📦', style: TextStyle(fontSize: 64))),
                    ),
                  ),
                  // Gradient Overlay
                  Positioned.fill(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.black.withValues(alpha: 0.2),
                            Colors.transparent,
                            Colors.black.withValues(alpha: 0.6),
                          ],
                        ),
                      ),
                    ),
                  ),
                  // Top Category Tag
                  Positioned(
                    top: 16,
                    left: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.65),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '${item.type} • ${item.category}',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                    ),
                  ),
                  // Swipe Stamp Overlay
                  if (_dragOffset.dx > 40)
                    Positioned(
                      top: 40,
                      left: 24,
                      child: Transform.rotate(
                        angle: -0.2,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            border: Border.all(color: const Color(0xFF5BBF8E), width: 3),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text('MATCH 💚', style: TextStyle(color: Color(0xFF5BBF8E), fontWeight: FontWeight.bold, fontSize: 20)),
                        ),
                      ),
                    ),
                  if (_dragOffset.dx < -40)
                    Positioned(
                      top: 40,
                      right: 24,
                      child: Transform.rotate(
                        angle: 0.2,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.redAccent, width: 3),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text('PASS ❌', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 20)),
                        ),
                      ),
                    ),
                  // Bottom Location & Date
                  Positioned(
                    bottom: 14,
                    left: 16,
                    right: 16,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Flexible(
                          child: Text(
                            '📍 ${item.location}',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          '📅 ${item.dateOccurred}',
                          style: const TextStyle(color: Colors.white70, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Item Details
            Expanded(
              flex: 4,
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.title,
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: _theme.textColor),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    Expanded(
                      child: Text(
                        item.description,
                        style: TextStyle(fontSize: 13, color: _theme.subtextColor, height: 1.4),
                        overflow: TextOverflow.fade,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Posted by ${item.contactName}',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: _theme.isDarkMode ? const Color(0xFFBDA8F9) : const Color(0xFF9B8BDB)),
                        ),
                        if (item.reward.isNotEmpty)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: _theme.isDarkMode ? const Color(0xFF383214) : const Color(0xFFFDF3C0),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '⭐ ${item.reward}',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: _theme.isDarkMode ? const Color(0xFFFFE066) : const Color(0xFF8A7A00)),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: _theme.cardColor,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 16,
                ),
              ],
            ),
            child: const Text('✨', style: TextStyle(fontSize: 48)),
          ),
          const SizedBox(height: 20),
          Text(
            'All Caught Up!',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: _theme.textColor),
          ),
          const SizedBox(height: 6),
          Text(
            'You have reviewed all current items in this category.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 13, color: _theme.subtextColor),
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: () {
              setState(() => _currentIndex = 0);
              _loadItems();
            },
            icon: const Icon(Icons.refresh),
            label: const Text('Start Over'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE8848F),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCircleBtn({
    required IconData icon,
    required Color color,
    required Color bg,
    required VoidCallback onTap,
    double size = 56,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: _theme.cardColor,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: color.withValues(alpha: 0.25),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Center(
          child: Container(
            width: size - 8,
            height: size - 8,
            decoration: BoxDecoration(
              color: bg,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: size * 0.48),
          ),
        ),
      ),
    );
  }
}
