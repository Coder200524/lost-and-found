// Gemini AI Matcher Screen (ADF Mini Project I: Gemini for Application Developers)
import 'package:flutter/material.dart';
import '../models/item.dart';
import '../services/api_service.dart';
import '../services/theme_service.dart';
import 'item_detail_screen.dart';

class GeminiMatcherScreen extends StatefulWidget {
  const GeminiMatcherScreen({super.key});

  @override
  State<GeminiMatcherScreen> createState() => _GeminiMatcherScreenState();
}

class _GeminiMatcherScreenState extends State<GeminiMatcherScreen> {
  final _theme = ThemeService();
  final _queryCtrl = TextEditingController(text: 'AirPods Pro with blue cover');
  String _selectedType = 'LOST';
  bool _searching = false;
  String _aiSummary = '';
  List<dynamic> _matches = [];

  @override
  void initState() {
    super.initState();
    _theme.addListener(_onThemeChange);
  }

  @override
  void dispose() {
    _theme.removeListener(_onThemeChange);
    _queryCtrl.dispose();
    super.dispose();
  }

  void _onThemeChange() {
    if (mounted) setState(() {});
  }

  Future<void> _performAiMatch() async {
    if (_queryCtrl.text.trim().isEmpty) return;

    setState(() {
      _searching = true;
      _aiSummary = '';
      _matches = [];
    });

    final res = await ApiService.getAiMatches(
      title: _queryCtrl.text.trim(),
      description: _queryCtrl.text.trim(),
      category: 'Electronics',
      type: _selectedType,
    );

    if (mounted) {
      setState(() {
        _searching = false;
        if (res != null && res['success'] == true) {
          _aiSummary = res['aiSummary'] ?? '';
          _matches = res['matches'] ?? [];
        } else {
          _aiSummary = 'Could not connect to Gemini backend. Ensure Next.js is running.';
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _theme.scaffoldColor,
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.auto_awesome_outlined, size: 20, color: Color(0xFF6D28D9)),
            const SizedBox(width: 8),
            Text('Gemini Matcher', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: _theme.textColor)),
          ],
        ),
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
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF6D28D9), Color(0xFF9333EA)],
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Gemini AI Campus Matcher',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16),
                ),
                SizedBox(height: 4),
                Text(
                  'Describe your lost item or something you found on campus. Gemini will compare descriptions and compute match confidence.',
                  style: TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Query Card
          Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(color: _theme.borderColor),
            ),
            elevation: 0,
            color: _theme.cardColor,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('I am looking for a:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: _theme.textColor)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      ChoiceChip(
                        label: const Text('Lost Item'),
                        selected: _selectedType == 'LOST',
                        onSelected: (_) => setState(() => _selectedType = 'LOST'),
                      ),
                      const SizedBox(width: 8),
                      ChoiceChip(
                        label: const Text('Found Item'),
                        selected: _selectedType == 'FOUND',
                        onSelected: (_) => setState(() => _selectedType = 'FOUND'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _queryCtrl,
                    maxLines: 2,
                    style: TextStyle(color: _theme.textColor),
                    decoration: InputDecoration(
                      hintText: 'e.g. Titan leather wallet with college ID card',
                      hintStyle: TextStyle(color: _theme.subtextColor.withValues(alpha: 0.7)),
                      filled: true,
                      fillColor: _theme.surfaceAltColor,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: _theme.borderColor)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: _theme.borderColor)),
                      isDense: true,
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6D28D9),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: _searching ? null : _performAiMatch,
                      icon: const Icon(Icons.auto_awesome, size: 18),
                      label: Text(_searching ? 'Gemini Analyzing...' : 'Run Gemini Semantic Match'),
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 20),

          // Results
          if (_aiSummary.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: _theme.isDarkMode ? const Color(0xFF281E3B) : const Color(0xFFEDE9FE),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: _theme.isDarkMode ? const Color(0xFF553C7B) : const Color(0xFFDDD6F3)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.lightbulb_outline,
                    size: 20,
                    color: _theme.isDarkMode ? const Color(0xFFD8C7F8) : const Color(0xFF4C1D95),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      _aiSummary,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: _theme.isDarkMode ? const Color(0xFFD8C7F8) : const Color(0xFF4C1D95),
                      ),
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 16),

          if (_matches.isNotEmpty) ...[
            Text(
              'Candidate Matches Found:',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: _theme.textColor),
            ),
            const SizedBox(height: 10),
            ..._matches.map((m) {
              final itemJson = m['item'];
              final item = Item.fromJson(itemJson);
              final score = m['similarityScore'] ?? 0;
              final analysis = m['aiAnalysis'] ?? '';

              return Card(
                elevation: 0,
                color: _theme.cardColor,
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                  side: BorderSide(color: _theme.borderColor),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(12),
                  title: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          item.title,
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: _theme.textColor),
                          maxLines: 1,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: _theme.isDarkMode ? const Color(0xFF3B2758) : const Color(0xFFEDE9FE),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '$score% Match',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: _theme.isDarkMode ? const Color(0xFFBDA8F9) : const Color(0xFF6D28D9),
                          ),
                        ),
                      ),
                    ],
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 4),
                      Text(item.description, maxLines: 2, style: TextStyle(fontSize: 12, color: _theme.subtextColor)),
                      const SizedBox(height: 6),
                      Text(
                        'AI Insight: $analysis',
                        style: TextStyle(
                          fontSize: 11,
                          fontStyle: FontStyle.italic,
                          color: _theme.isDarkMode ? const Color(0xFFC4B5FD) : const Color(0xFF5B21B6),
                        ),
                      ),
                    ],
                  ),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => ItemDetailScreen(item: item)),
                    );
                  },
                ),
              );
            }),
          ],
        ],
      ),
    );
  }
}
