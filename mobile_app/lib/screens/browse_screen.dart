// Browse Catalog Screen with Full Filters & Search (Matches web/src/app/(public)/browse/page.tsx)
import 'package:flutter/material.dart';
import '../models/item.dart';
import '../services/api_service.dart';
import '../services/theme_service.dart';
import '../widgets/item_card.dart';
import 'item_detail_screen.dart';

class BrowseScreen extends StatefulWidget {
  final String? initialCategory;
  final String? initialType;
  const BrowseScreen({super.key, this.initialCategory, this.initialType});

  @override
  State<BrowseScreen> createState() => _BrowseScreenState();
}

class _BrowseScreenState extends State<BrowseScreen> {
  final _theme = ThemeService();
  List<Item> _items = [];
  bool _loading = true;
  final _searchController = TextEditingController();
  late String _selectedCategory;
  late String _selectedType;
  String _selectedStatus = 'ALL';

  final List<Map<String, dynamic>> _categories = [
    {'name': 'All', 'icon': Icons.search_outlined},
    {'name': 'ID Cards', 'icon': Icons.badge_outlined},
    {'name': 'Electronics', 'icon': Icons.devices_outlined},
    {'name': 'Bags', 'icon': Icons.backpack_outlined},
    {'name': 'Water Bottles', 'icon': Icons.local_drink_outlined},
    {'name': 'Stationery', 'icon': Icons.edit_outlined},
    {'name': 'Accessories', 'icon': Icons.watch_outlined},
    {'name': 'Others', 'icon': Icons.inventory_2_outlined},
  ];

  @override
  void initState() {
    super.initState();
    _theme.addListener(_onThemeChange);
    _selectedCategory = widget.initialCategory ?? 'All';
    _selectedType = widget.initialType ?? 'ALL';
    _fetch();
  }

  @override
  void dispose() {
    _theme.removeListener(_onThemeChange);
    super.dispose();
  }

  void _onThemeChange() {
    if (mounted) setState(() {});
  }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    final items = await ApiService.asyncFetchItems(
      query: _searchController.text,
      category: _selectedCategory,
      type: _selectedType == 'CLAIMED' ? 'ALL' : _selectedType,
    );

    if (mounted) {
      setState(() {
        if (_selectedType == 'CLAIMED') {
          _items = items.where((i) => i.status == 'CLAIMED' || i.status == 'RESOLVED').toList();
        } else if (_selectedStatus != 'ALL') {
          _items = items.where((i) => i.status.toUpperCase() == _selectedStatus.toUpperCase()).toList();
        } else {
          _items = items.where((i) => i.status == 'OPEN').toList();
        }
        _loading = false;
      });
    }
  }

  void _clearFilters() {
    setState(() {
      _searchController.clear();
      _selectedCategory = 'All';
      _selectedType = 'ALL';
      _selectedStatus = 'ALL';
    });
    _fetch();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = _theme.isDarkMode;

    return Scaffold(
      backgroundColor: _theme.scaffoldColor,
      appBar: AppBar(
        title: Text(
          'Browse Catalog',
          style: TextStyle(fontWeight: FontWeight.bold, color: _theme.textColor),
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
            icon: Icon(Icons.filter_alt_off_outlined, color: _theme.textColor),
            tooltip: 'Clear Filters',
            onPressed: _clearFilters,
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: TextField(
              controller: _searchController,
              style: TextStyle(color: _theme.textColor),
              decoration: InputDecoration(
                hintText: 'Search by title, location, description...',
                hintStyle: TextStyle(color: _theme.subtextColor, fontSize: 13),
                prefixIcon: const Icon(Icons.search, color: Color(0xFFE8848F)),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: Icon(Icons.clear, size: 18, color: _theme.subtextColor),
                        onPressed: () {
                          _searchController.clear();
                          _fetch();
                        },
                      )
                    : null,
                filled: true,
                fillColor: _theme.cardColor,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide(color: isDark ? const Color(0xFF382E48) : Colors.black.withValues(alpha: 0.05)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide(color: isDark ? const Color(0xFF382E48) : Colors.black.withValues(alpha: 0.05)),
                ),
              ),
              onSubmitted: (_) => _fetch(),
            ),
          ),

          // Type Segment Toggle (ALL / LOST / FOUND / CLAIMED) (Requirement A)
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              color: _theme.cardColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isDark ? const Color(0xFF382E48) : Colors.black.withValues(alpha: 0.05)),
            ),
            child: Row(
              children: [
                _buildTypeBtn('ALL', 'Active', Icons.layers_outlined),
                _buildTypeBtn('LOST', 'Lost', Icons.search_outlined),
                _buildTypeBtn('FOUND', 'Found', Icons.check_circle_outline),
                _buildTypeBtn('CLAIMED', 'Claimed', Icons.verified_outlined),
              ],
            ),
          ),

          // Horizontal Category Pills
          SizedBox(
            height: 48,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final isSelected = _selectedCategory == cat['name'];
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    avatar: Icon(
                      cat['icon'] as IconData,
                      size: 14,
                      color: isSelected ? Colors.white : _theme.textColor,
                    ),
                    label: Text(cat['name'] as String),
                    selected: isSelected,
                    selectedColor: const Color(0xFFE8848F),
                    backgroundColor: _theme.cardColor,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : _theme.textColor,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      fontSize: 12,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                      side: BorderSide(
                        color: isSelected
                            ? const Color(0xFFE8848F)
                            : (isDark ? const Color(0xFF382E48) : Colors.black.withValues(alpha: 0.08)),
                      ),
                    ),
                    onSelected: (val) {
                      setState(() => _selectedCategory = cat['name']!);
                      _fetch();
                    },
                  ),
                );
              },
            ),
          ),

          // Results summary count bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${_items.length} items found',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF7A6E80)),
                ),
                // Status Filter
                PopupMenuButton<String>(
                  initialValue: _selectedStatus,
                  child: Row(
                    children: [
                      Text(
                        'Status: $_selectedStatus',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFFE8848F)),
                      ),
                      const Icon(Icons.arrow_drop_down, size: 18, color: Color(0xFFE8848F)),
                    ],
                  ),
                  onSelected: (val) {
                    setState(() => _selectedStatus = val);
                    _fetch();
                  },
                  itemBuilder: (ctx) => [
                    const PopupMenuItem(value: 'ALL', child: Text('All Statuses')),
                    const PopupMenuItem(value: 'OPEN', child: Text('Open / Active')),
                    const PopupMenuItem(value: 'CLAIMED', child: Text('Claimed')),
                    const PopupMenuItem(value: 'RESOLVED', child: Text('Resolved')),
                  ],
                ),
              ],
            ),
          ),

          // Items Grid
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFFE8848F)))
                : _items.isEmpty
                    ? _buildNoResults()
                    : RefreshIndicator(
                        onRefresh: _fetch,
                        color: const Color(0xFFE8848F),
                        child: GridView.builder(
                          padding: const EdgeInsets.all(16),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.78,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                          ),
                          itemCount: _items.length,
                          itemBuilder: (context, index) {
                            final item = _items[index];
                            return ItemCard(
                              item: item,
                              isGrid: true,
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => ItemDetailScreen(item: item)),
                                );
                              },
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildTypeBtn(String type, String label, IconData icon) {
    final isSelected = _selectedType == type;
    final isDark = _theme.isDarkMode;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() => _selectedType = type);
          _fetch();
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFFE8848F) : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 13,
                color: isSelected ? Colors.white : (isDark ? Colors.grey.shade400 : const Color(0xFF7A6E80)),
              ),
              const SizedBox(width: 4),
              Text(
                label,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: isSelected ? Colors.white : (isDark ? Colors.grey.shade400 : const Color(0xFF7A6E80)),
                  fontWeight: FontWeight.bold,
                  fontSize: 11,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNoResults() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search_off_outlined, size: 48, color: Colors.grey.shade400),
          const SizedBox(height: 12),
          Text(
            'No matching items found',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: _theme.textColor),
          ),
          const SizedBox(height: 4),
          Text(
            'Try adjusting your search terms or category filters',
            style: TextStyle(fontSize: 12, color: _theme.subtextColor),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _clearFilters,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE8848F),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Reset All Filters'),
          ),
        ],
      ),
    );
  }
}
