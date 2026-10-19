// Browse Catalog Screen (ADF Mini Project II: Multi-page app that fetches web API data)
import 'package:flutter/material.dart';
import '../models/item.dart';
import '../services/api_service.dart';
import '../widgets/item_card.dart';
import 'item_detail_screen.dart';

class BrowseScreen extends StatefulWidget {
  const BrowseScreen({super.key});

  @override
  State<BrowseScreen> createState() => _BrowseScreenState();
}

class _BrowseScreenState extends State<BrowseScreen> {
  List<Item> _items = [];
  bool _loading = true;
  String _searchQuery = '';
  String _selectedCategory = 'All';
  String _selectedType = 'ALL';

  final List<String> _categories = [
    'All',
    'ID Cards',
    'Bottles',
    'Stationery',
    'Electronics',
    'Bags',
    'Accessories',
    'Others',
  ];

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    final items = await ApiService.asyncFetchItems(
      query: _searchQuery,
      category: _selectedCategory,
      type: _selectedType,
    );
    if (mounted) {
      setState(() {
        _items = items;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFEF4F7),
      appBar: AppBar(
        title: const Text(
          'Browse Campus Items',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: Column(
              children: [
                // Search Field
                TextField(
                  onChanged: (val) {
                    _searchQuery = val;
                    _fetch();
                  },
                  decoration: InputDecoration(
                    hintText: 'Search items, locations, keywords...',
                    hintStyle: TextStyle(fontSize: 13, color: Colors.grey.shade400),
                    prefixIcon: const Icon(Icons.search, size: 20, color: Colors.grey),
                    filled: true,
                    fillColor: const Color(0xFFF7FAFC),
                    contentPadding: const EdgeInsets.symmetric(vertical: 10),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(30),
                      borderSide: BorderSide(color: Colors.pink.shade100),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(30),
                      borderSide: BorderSide(color: Colors.pink.shade100),
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                // Type filter buttons
                Row(
                  children: ['ALL', 'LOST', 'FOUND'].map((t) {
                    final selected = _selectedType == t;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(t, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: selected ? Colors.white : Colors.black87)),
                        selected: selected,
                        selectedColor: const Color(0xFF2D3748),
                        backgroundColor: Colors.white,
                        onSelected: (_) {
                          setState(() => _selectedType = t);
                          _fetch();
                        },
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 8),

                // Category chips
                SizedBox(
                  height: 36,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _categories.length,
                    separatorBuilder: (_, _) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      final cat = _categories[index];
                      final selected = _selectedCategory == cat;
                      return ChoiceChip(
                        label: Text(cat, style: TextStyle(fontSize: 11, color: selected ? Colors.white : Colors.black87)),
                        selected: selected,
                        selectedColor: const Color(0xFFE8848F),
                        backgroundColor: Colors.white,
                        onSelected: (_) {
                          setState(() => _selectedCategory = cat);
                          _fetch();
                        },
                      );
                    },
                  ),
                ),
              ],
            ),
          ),

          // Items List
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFFE8848F)))
                : _items.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text('🔍', style: TextStyle(fontSize: 48)),
                            const SizedBox(height: 12),
                            Text(
                              'No items matching criteria',
                              style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey.shade700),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _fetch,
                        color: const Color(0xFFE8848F),
                        child: ListView.builder(
                          itemCount: _items.length,
                          itemBuilder: (context, index) {
                            final item = _items[index];
                            return ItemCard(
                              item: item,
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => ItemDetailScreen(item: item),
                                  ),
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
}
