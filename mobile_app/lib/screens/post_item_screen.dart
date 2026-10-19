// Post Item Screen (ADF Module: Interaction and Forms & Gemini Assistance)
import 'package:flutter/material.dart';
import '../models/item.dart';
import '../services/api_service.dart';
import '../services/gemini_service.dart';

class PostItemScreen extends StatefulWidget {
  final VoidCallback? onItemPosted;

  const PostItemScreen({super.key, this.onItemPosted});

  @override
  State<PostItemScreen> createState() => _PostItemScreenState();
}

class _PostItemScreenState extends State<PostItemScreen> {
  final _formKey = GlobalKey<FormState>();

  String _type = 'LOST';
  String _category = 'Electronics';
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _locCtrl = TextEditingController();
  final _dateCtrl = TextEditingController(text: DateTime.now().toString().split(' ')[0]);
  final _imageCtrl = TextEditingController();
  final _rewardCtrl = TextEditingController();
  final _nameCtrl = TextEditingController(text: 'Rahul Mehta');
  final _emailCtrl = TextEditingController(text: 'rahul@djsce.edu');
  final _phoneCtrl = TextEditingController(text: '+91 98765 43210');

  bool _submitting = false;

  final List<String> _categories = [
    'ID Cards',
    'Bottles',
    'Stationery',
    'Electronics',
    'Bags',
    'Accessories',
    'Others',
  ];

  void _triggerGeminiAutoDetect() {
    final text = '${_titleCtrl.text} ${_descCtrl.text}';
    if (text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Type some title or description first!')),
      );
      return;
    }

    final suggested = GeminiService.suggestCategory(text);
    setState(() {
      _category = suggested;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('✨ Gemini AI suggested category: "$suggested"'),
        backgroundColor: const Color(0xFF6D28D9),
      ),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    // Mindmap Rule: "Post Found Item: MANDATORY IMAGE!"
    if (_type == 'FOUND' && _imageCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('📸 A photo is MANDATORY for all Found items to enable verification!'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _submitting = true);

    final locLower = _locCtrl.text.trim().toLowerCase();
    final isHotspot = locLower.contains('canteen') ||
        locLower.contains('library') ||
        locLower.contains('402') ||
        locLower.contains('lab') ||
        locLower.contains('gymkhana');

    final newItem = Item(
      id: '',
      title: _titleCtrl.text.trim(),
      description: _descCtrl.text.trim(),
      category: _category,
      type: _type,
      location: _locCtrl.text.trim(),
      isHotspot: isHotspot,
      isMasked: _category == 'ID Cards',
      dateOccurred: _dateCtrl.text.trim(),
      status: 'OPEN',
      imageUrl: _imageCtrl.text.trim(),
      reward: _rewardCtrl.text.trim(),
      contactName: _nameCtrl.text.trim(),
      contactEmail: _emailCtrl.text.trim(),
      contactPhone: _phoneCtrl.text.trim(),
    );

    final success = await ApiService.createItem(newItem);

    if (mounted) {
      setState(() => _submitting = false);
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Report submitted successfully to DJSCE platform!'),
            backgroundColor: Colors.green,
          ),
        );
        _titleCtrl.clear();
        _descCtrl.clear();
        _locCtrl.clear();
        widget.onItemPosted?.call();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to submit. Please ensure Next.js backend is running.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Report Item', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // Type toggle
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      backgroundColor: _type == 'LOST' ? const Color(0xFFFDE8EA) : Colors.white,
                      side: BorderSide(color: _type == 'LOST' ? const Color(0xFFD9485E) : Colors.grey.shade300),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    onPressed: () => setState(() => _type = 'LOST'),
                    child: Text('🔴 I Lost Something', style: TextStyle(color: _type == 'LOST' ? const Color(0xFFD9485E) : Colors.grey.shade700, fontWeight: FontWeight.bold, fontSize: 12)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      backgroundColor: _type == 'FOUND' ? const Color(0xFFE6F7EF) : Colors.white,
                      side: BorderSide(color: _type == 'FOUND' ? const Color(0xFF2B9365) : Colors.grey.shade300),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    onPressed: () => setState(() => _type = 'FOUND'),
                    child: Text('🟢 I Found Something', style: TextStyle(color: _type == 'FOUND' ? const Color(0xFF2B9365) : Colors.grey.shade700, fontWeight: FontWeight.bold, fontSize: 12)),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Title
            TextFormField(
              controller: _titleCtrl,
              decoration: const InputDecoration(labelText: 'Item Title *', border: OutlineInputBorder(), isDense: true),
              validator: (v) => v == null || v.isEmpty ? 'Title required' : null,
            ),
            const SizedBox(height: 12),

            // Description
            TextFormField(
              controller: _descCtrl,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Detailed Description *',
                hintText: 'Color, brand, identifying marks, serial numbers...',
                border: OutlineInputBorder(),
                isDense: true,
              ),
              validator: (v) => v == null || v.isEmpty ? 'Description required' : null,
            ),
            const SizedBox(height: 8),

            // Gemini AI Button
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: _triggerGeminiAutoDetect,
                icon: const Icon(Icons.auto_awesome, size: 16, color: Color(0xFF6D28D9)),
                label: const Text('Gemini: Auto-Detect Category', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF6D28D9))),
              ),
            ),

            const SizedBox(height: 6),

            // Category & Location
            DropdownButtonFormField<String>(
              initialValue: _category,
              decoration: const InputDecoration(labelText: 'Category *', border: OutlineInputBorder(), isDense: true),
              items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
              onChanged: (val) => setState(() => _category = val ?? 'Electronics'),
            ),
            const SizedBox(height: 12),

            TextFormField(
              controller: _locCtrl,
              decoration: const InputDecoration(labelText: 'Campus Location (e.g. Room 402, Canteen) *', border: OutlineInputBorder(), isDense: true),
              validator: (v) => v == null || v.isEmpty ? 'Location required' : null,
            ),
            const SizedBox(height: 12),

            TextFormField(
              controller: _dateCtrl,
              decoration: const InputDecoration(labelText: 'Date Occurred (YYYY-MM-DD)', border: OutlineInputBorder(), isDense: true),
            ),
            const SizedBox(height: 12),

            TextFormField(
              controller: _imageCtrl,
              decoration: const InputDecoration(labelText: 'Image URL (Optional)', border: OutlineInputBorder(), isDense: true),
            ),
            const SizedBox(height: 12),

            TextFormField(
              controller: _rewardCtrl,
              decoration: const InputDecoration(labelText: 'Reward Offered (Optional)', border: OutlineInputBorder(), isDense: true),
            ),

            const SizedBox(height: 24),

            SizedBox(
              height: 48,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE8848F),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: _submitting ? null : _submit,
                child: Text(_submitting ? 'Submitting to DJSCE...' : 'Publish Campus Report', style: const TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
