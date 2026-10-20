// Browse Catalog Screen with Full Filters & Search (Matches web/src/app/(public)/browse/page.tsx)
import 'package:flutter/material.dart';
import '../models/item.dart';
import '../services/api_service.dart';
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
  List<Item> _items = [];
  bool _loading = true;
  final _searchController = TextEditingController();
  late String _selectedCategory;
  late String _selectedType;
  String _selectedStatus = 'ALL';

  final List<Map<String, String>> _categories = [
    {'name': 'All', 'emoji': '🔍'},
    {'name': 'ID Cards', 'emoji': '🪪'},
    {'name': 'Electronics', 'emoji': '📱'},
    {'name': 'Bags', 'emoji': '🎒'},
    {'name': 'Water Bottles', 'emoji': '🍶'},
    {'name': 'Stationery', 'emoji': '✏️'},
    {'name': 'Accessories', 'emoji': '⌚'},
    {'name': 'Others', 'emoji': '📦'},
  ];

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory ?? 'All';
    _selectedType = widget.initialType ?? 'ALL';
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    final items = await ApiService.asyncFetchItems(
      query: _searchController.text,
      category: _selectedCategory,
      type: _selectedType,
    );

    if (mounted) {
      setState(() {
        if (_selectedStatus != 'ALL') {
          _items = items.where((i) => i.status.toUpperCase() == _selectedStatus.toUpperCase()).toList();
        } else {
          _items = items;
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
    return Scaffold(
      backgroundColor: const Color(0xFFFEF4F7),
      appBar: AppBar(
        title: const Text('Browse Catalog', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_alt_off_outlined),
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
              decoration: InputDecoration(
                hintText: 'Search by title, location, description...',
                hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                prefixIcon: const Icon(Icons.search, color: Color(0xFFE8848F)),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          _fetch();
                        },
                      )
                    : null,
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide(color: Colors.black.withValues(alpha: 0.05)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide(color: Colors.black.withValues(alpha: 0.05)),
                ),
              ),
              onSubmitted: (_) => _fetch(),
            ),
          ),

          // Type Segment Toggle (ALL / LOST / FOUND)
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
            ),
            child: Row(
              children: [
                _buildTypeBtn('ALL', 'All Items'),
                _buildTypeBtn('LOST', 'Lost Only 🔴'),
                _buildTypeBtn('FOUND', 'Found Only 🟢'),
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
                    avatar: Text(cat['emoji'] ?? ''),
                    label: Text(cat['name'] ?? ''),
                    selected: isSelected,
                    selectedColor: const Color(0xFFE8848F),
                    backgroundColor: Colors.white,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : const Color(0xFF3A3040),
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      fontSize: 12,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                      side: BorderSide(
                        color: isSelected ? const Color(0xFFE8848F) : Colors.black.withValues(alpha: 0.08),
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

  Widget _buildTypeBtn(String type, String label) {
    final isSelected = _selectedType == type;
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
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: isSelected ? Colors.white : const Color(0xFF7A6E80),
              fontWeight: FontWeight.bold,
              fontSize: 11,
            ),
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
          const Text('🔍', style: TextStyle(fontSize: 48)),
          const SizedBox(height: 12),
          const Text(
            'No matching items found',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF3A3040)),
          ),
          const SizedBox(height: 4),
          const Text(
            'Try adjusting your search terms or category filters',
            style: TextStyle(fontSize: 12, color: Color(0xFF7A6E80)),
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
