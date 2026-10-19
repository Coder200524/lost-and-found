// Item Details Screen (ADF Module: Widgets, Interaction and Forms, Navigation)
import 'package:flutter/material.dart';
import '../models/item.dart';
import '../services/api_service.dart';
import '../widgets/status_chip.dart';

class ItemDetailScreen extends StatefulWidget {
  final Item item;

  const ItemDetailScreen({super.key, required this.item});

  @override
  State<ItemDetailScreen> createState() => _ItemDetailScreenState();
}

class _ItemDetailScreenState extends State<ItemDetailScreen> {
  void _openClaimDialog() {
    final nameCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final proofCtrl = TextEditingController();
    final formKey = GlobalKey<FormState>();
    bool submitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 24,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              child: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Submit Verification Claim',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, size: 20),
                          onPressed: () => Navigator.pop(ctx),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Provide ownership proof so security/finder can verify your claim.',
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: nameCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Your Full Name',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                      validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: emailCtrl,
                      decoration: const InputDecoration(
                        labelText: 'College Email (@djsce.edu)',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                      validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: proofCtrl,
                      maxLines: 2,
                      decoration: const InputDecoration(
                        labelText: 'Proof of Ownership (marks, roll number, lock screen)',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                      validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFE8848F),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: submitting
                            ? null
                            : () async {
                                if (formKey.currentState!.validate()) {
                                  setModalState(() => submitting = true);
                                  final ok = await ApiService.submitClaim(
                                    itemId: widget.item.id,
                                    claimantName: nameCtrl.text.trim(),
                                    claimantEmail: emailCtrl.text.trim(),
                                    proofDetails: proofCtrl.text.trim(),
                                  );
                                  if (context.mounted) {
                                    Navigator.pop(ctx);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text(ok
                                            ? 'Verification claim submitted successfully!'
                                            : 'Failed to submit claim. Check network connection.'),
                                        backgroundColor: ok ? Colors.green : Colors.red,
                                      ),
                                    );
                                  }
                                }
                              },
                        child: Text(submitting ? 'Submitting...' : 'Confirm Verification Claim'),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final item = widget.item;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(item.title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: SizedBox(
            height: 48,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE8848F),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: item.isResolved ? null : _openClaimDialog,
              icon: const Icon(Icons.verified_user_outlined),
              label: Text(
                item.isResolved ? 'Item Already Resolved' : 'Claim This Item',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ),
      ),
      body: ListView(
        children: [
          // Image Banner
          if (item.imageUrl.isNotEmpty)
            Image.network(
              item.imageUrl,
              height: 240,
              width: double.infinity,
              fit: BoxFit.cover,
              errorBuilder: (_, _, _) => _buildPlaceholder(),
            )
          else
            _buildPlaceholder(),

          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    TypeBadge(type: item.type),
                    StatusChip(status: item.status),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  item.title,
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF2D3748)),
                ),
                const SizedBox(height: 12),
                Text(
                  item.description,
                  style: TextStyle(fontSize: 14, height: 1.5, color: Colors.grey.shade700),
                ),
                const SizedBox(height: 20),

                if (item.reward.isNotEmpty)
                  Container(
                    margin: const EdgeInsets.only(bottom: 20),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF7DB),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFFDF3C0)),
                    ),
                    child: Row(
                      children: [
                        const Text('🎁', style: TextStyle(fontSize: 20)),
                        const SizedBox(width: 8),
                        Text(
                          'Reward: ${item.reward}',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF8B6E00)),
                        ),
                      ],
                    ),
                  ),

                // SVKM Mindmap Hotspot & Privacy Indicators
                if (item.isHotspot || item.isMasked || item.isUrgent)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 6,
                      children: [
                        if (item.isHotspot)
                          _buildBadge('🔥 Hotspot Zone (High Loss Area)', const Color(0xFFFFEDD5), const Color(0xFFC2410C)),
                        if (item.isMasked)
                          _buildBadge('🆔 Masked Sensitive ID Details', const Color(0xFFEDE9FE), const Color(0xFF6D28D9)),
                        if (item.isUrgent)
                          _buildBadge('🚨 Urgent Campus Alert', const Color(0xFFFDE8EA), const Color(0xFFD9485E)),
                      ],
                    ),
                  ),

                // Specs list - Privacy Protected
                _buildInfoRow(Icons.category_outlined, 'Category', item.category),
                _buildInfoRow(Icons.location_on_outlined, 'Campus Location', item.location),
                _buildInfoRow(Icons.calendar_today_outlined, 'Date Occurred', item.dateOccurred),
                _buildInfoRow(Icons.person_outline, 'Reported By', item.contactName),
                _buildInfoRow(Icons.lock_outline, 'Student Contact', '🔒 Hidden for Safety (SVKM Protocol)'),

                const SizedBox(height: 16),

                // Predefined Safety Messages Box
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEDE9FE),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFDDD6F3)),
                  ),
                  child: const Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('🛡️', style: TextStyle(fontSize: 18)),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'SVKM Handover Protocol: Exchange items only at the Ground Floor Security Desk or Central Library reception. Never share OTP or payment info.',
                          style: TextStyle(fontSize: 11, height: 1.4, color: Color(0xFF5B21B6), fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // Report Misuse Button
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('⚠️ Item reported for administrative review.'),
                          backgroundColor: Colors.orange,
                        ),
                      );
                    },
                    icon: const Icon(Icons.flag_outlined, size: 14, color: Colors.grey),
                    label: const Text('Report Misuse / Fake Claim', style: TextStyle(fontSize: 11, color: Colors.grey)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      height: 180,
      width: double.infinity,
      color: const Color(0xFFFDE8EA),
      child: const Center(child: Text('📦', style: TextStyle(fontSize: 64))),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String val) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Colors.grey.shade500),
          const SizedBox(width: 10),
          Text(label, style: TextStyle(fontSize: 13, color: Colors.grey.shade500)),
          const Spacer(),
          Text(val, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF2D3748))),
        ],
      ),
    );
  }

  Widget _buildBadge(String label, Color bg, Color text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        label,
        style: TextStyle(color: text, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }
}
