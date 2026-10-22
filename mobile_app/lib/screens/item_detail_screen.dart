// Item Details Screen (ADF Module: Widgets, Interaction and Forms, Navigation)
import 'package:flutter/material.dart';
import '../models/item.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/theme_service.dart';
import '../widgets/status_chip.dart';

class ItemDetailScreen extends StatefulWidget {
  final Item item;

  const ItemDetailScreen({super.key, required this.item});

  @override
  State<ItemDetailScreen> createState() => _ItemDetailScreenState();
}

class _ItemDetailScreenState extends State<ItemDetailScreen> {
  final _theme = ThemeService();

  @override
  void initState() {
    super.initState();
    _theme.addListener(_onThemeChange);
  }

  @override
  void dispose() {
    _theme.removeListener(_onThemeChange);
    super.dispose();
  }

  void _onThemeChange() {
    if (mounted) setState(() {});
  }

  void _openClaimDialog() {
    final user = AuthService().currentUser;
    final nameCtrl = TextEditingController(text: user?.name ?? '');
    final emailCtrl = TextEditingController(text: user?.email ?? '');
    final rollCtrl = TextEditingController();
    final sapCtrl = TextEditingController(text: user?.sapId ?? '');
    final proofCtrl = TextEditingController();
    final departments = [
      'Information Technology',
      'Computer Engineering',
      'Computer Science & Engineering (Data Science)',
      'Artificial Intelligence & Machine Learning',
      'Electronics & Telecommunication',
      'Mechanical Engineering',
      'Chemical Engineering',
      'Biomedical Engineering',
    ];

    final academicYears = [
      'First Year (FE)',
      'Second Year (SE)',
      'Third Year (TE)',
      'Final Year (BE)',
    ];

    // Safely match user's department to the valid dropdown list
    String? selectedDept;
    if (user?.department != null && user!.department.trim().isNotEmpty) {
      final userDeptLower = user.department.toLowerCase();
      for (final d in departments) {
        if (userDeptLower.contains(d.toLowerCase()) || d.toLowerCase().contains(userDeptLower)) {
          selectedDept = d;
          break;
        }
      }
    }
    if (selectedDept != null && !departments.contains(selectedDept)) {
      selectedDept = null;
    }

    String? selectedYear;
    final formKey = GlobalKey<FormState>();
    bool submitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: _theme.cardColor,
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
              child: SingleChildScrollView(
                child: Form(
                  key: formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              'Submit Verification Claim',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: _theme.textColor),
                            ),
                          ),
                          IconButton(
                            icon: Icon(Icons.close, size: 20, color: _theme.textColor),
                            onPressed: () => Navigator.pop(ctx),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),

                      // Selected Item Basic Details (Requirement B.2)
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: _theme.surfaceAltColor,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFE8848F).withValues(alpha: 0.3)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.item.title,
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: _theme.textColor),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '📁 ${widget.item.category}  •  📍 ${widget.item.location}  •  📅 ${widget.item.dateOccurred}',
                              style: TextStyle(fontSize: 11, color: _theme.subtextColor),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),

                      TextFormField(
                        controller: nameCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Your Full Name *',
                          border: OutlineInputBorder(),
                          isDense: true,
                        ),
                        validator: (v) => v == null || v.trim().isEmpty ? 'Full Name is required' : null,
                      ),
                      const SizedBox(height: 10),

                      TextFormField(
                        controller: emailCtrl,
                        decoration: const InputDecoration(
                          labelText: 'College Email (@svkmmumbai.onmicrosoft.com) *',
                          border: OutlineInputBorder(),
                          isDense: true,
                        ),
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) return 'College Email is required';
                          if (!v.trim().toLowerCase().endsWith('@svkmmumbai.onmicrosoft.com')) {
                            return 'Compulsory suffix: must end with @svkmmumbai.onmicrosoft.com';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 10),

                      // Roll Number with regex ^[A-Za-z][0-9]{3}$ (Requirement C)
                      TextFormField(
                        controller: rollCtrl,
                        textCapitalization: TextCapitalization.characters,
                        decoration: const InputDecoration(
                          labelText: 'College Roll Number * (e.g. A090, B007)',
                          border: OutlineInputBorder(),
                          isDense: true,
                        ),
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) return 'Roll Number is required';
                          final reg = RegExp(r'^[A-Za-z][0-9]{3}$');
                          if (!reg.hasMatch(v.trim())) {
                            return 'Format: 1 letter followed by 3 digits (e.g. A090, B007)';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 10),

                      // SAP ID with regex ^6[0-9]{10,11}$ (Requirement C)
                      TextFormField(
                        controller: sapCtrl,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'SVKM SAP ID * (11 or 12 digits starting with 6)',
                          border: OutlineInputBorder(),
                          isDense: true,
                        ),
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) return 'SAP ID is required';
                          final reg = RegExp(r'^6[0-9]{10,11}$');
                          if (!reg.hasMatch(v.trim())) {
                            return 'Must be 11 or 12 numeric digits starting with 6 (e.g. 60017240146)';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 10),

                      // Department Dropdown (Optional)
                      DropdownButtonFormField<String>(
                        initialValue: selectedDept,
                        decoration: const InputDecoration(
                          labelText: 'Department (Optional)',
                          border: OutlineInputBorder(),
                          isDense: true,
                        ),
                        isExpanded: true,
                        items: departments
                            .map((d) => DropdownMenuItem(
                                  value: d,
                                  child: Text(d, style: const TextStyle(fontSize: 12), overflow: TextOverflow.ellipsis),
                                ))
                            .toList(),
                        onChanged: (val) => setModalState(() => selectedDept = val),
                      ),
                      const SizedBox(height: 10),

                      // Academic Year Dropdown (Optional)
                      DropdownButtonFormField<String>(
                        initialValue: selectedYear,
                        decoration: const InputDecoration(
                          labelText: 'Academic Year (Optional)',
                          border: OutlineInputBorder(),
                          isDense: true,
                        ),
                        isExpanded: true,
                        items: academicYears
                            .map((y) => DropdownMenuItem(
                                  value: y,
                                  child: Text(y, style: const TextStyle(fontSize: 12), overflow: TextOverflow.ellipsis),
                                ))
                            .toList(),
                        onChanged: (val) => setModalState(() => selectedYear = val),
                      ),
                      const SizedBox(height: 10),

                      // Proof of Ownership (Required)
                      TextFormField(
                        controller: proofCtrl,
                        maxLines: 2,
                        decoration: const InputDecoration(
                          labelText: 'Proof of Ownership * (serial number, distinctive marks, lock screen)',
                          border: OutlineInputBorder(),
                          isDense: true,
                        ),
                        validator: (v) => v == null || v.trim().length < 5
                            ? 'Please provide substantive proof (min 5 characters)'
                            : null,
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
                                    final res = await ApiService.submitClaim(
                                      itemId: widget.item.id,
                                      claimantName: nameCtrl.text.trim(),
                                      claimantEmail: emailCtrl.text.trim(),
                                      rollNo: rollCtrl.text.trim().toUpperCase(),
                                      sapId: sapCtrl.text.trim(),
                                      department: selectedDept,
                                      academicYear: selectedYear,
                                      proofDetails: proofCtrl.text.trim(),
                                      claimantId: user?.id,
                                    );
                                    if (context.mounted) {
                                      Navigator.pop(ctx);
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(
                                          content: Text(res['success'] == true
                                              ? (res['message'] ?? 'Verification claim submitted successfully!')
                                              : (res['error'] ?? 'Failed to submit claim.')),
                                          backgroundColor: res['success'] == true ? Colors.green : Colors.red,
                                        ),
                                      );
                                    }
                                  }
                                },
                          child: Text(submitting ? 'Submitting...' : 'Confirm Ownership Claim 📝'),
                        ),
                      ),
                    ],
                  ),
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
      backgroundColor: _theme.scaffoldColor,
      appBar: AppBar(
        title: Text(item.title, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: _theme.textColor)),
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
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: _theme.textColor),
                ),
                const SizedBox(height: 12),
                Text(
                  item.description,
                  style: TextStyle(fontSize: 14, height: 1.5, color: _theme.subtextColor),
                ),
                const SizedBox(height: 20),

                if (item.reward.isNotEmpty)
                  Container(
                    margin: const EdgeInsets.only(bottom: 20),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _theme.isDarkMode ? const Color(0xFF383214) : const Color(0xFFFEF7DB),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: _theme.isDarkMode ? const Color(0xFF594F20) : const Color(0xFFFDF3C0)),
                    ),
                    child: Row(
                      children: [
                        const Text('🎁', style: TextStyle(fontSize: 20)),
                        const SizedBox(width: 8),
                        Text(
                          'Reward: ${item.reward}',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: _theme.isDarkMode ? const Color(0xFFFFE066) : const Color(0xFF8B6E00),
                          ),
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
                          _buildBadge(
                            '🔥 Hotspot Zone (High Loss Area)',
                            _theme.isDarkMode ? const Color(0xFF3D2111) : const Color(0xFFFFEDD5),
                            _theme.isDarkMode ? const Color(0xFFFF9E66) : const Color(0xFFC2410C),
                          ),
                        if (item.isMasked)
                          _buildBadge(
                            '🆔 Masked Sensitive ID Details',
                            _theme.isDarkMode ? const Color(0xFF281E3B) : const Color(0xFFEDE9FE),
                            _theme.isDarkMode ? const Color(0xFFC4B5FD) : const Color(0xFF6D28D9),
                          ),
                        if (item.isUrgent)
                          _buildBadge(
                            '🚨 Urgent Campus Alert',
                            _theme.isDarkMode ? const Color(0xFF38151B) : const Color(0xFFFDE8EA),
                            _theme.isDarkMode ? const Color(0xFFFFA1AE) : const Color(0xFFD9485E),
                          ),
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
                    color: _theme.isDarkMode ? const Color(0xFF251F33) : const Color(0xFFEDE9FE),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: _theme.isDarkMode ? const Color(0xFF453660) : const Color(0xFFDDD6F3)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('🛡️', style: TextStyle(fontSize: 18)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'SVKM Handover Protocol: Exchange items only at the Ground Floor Security Desk or Central Library reception. Never share OTP or payment info.',
                          style: TextStyle(
                            fontSize: 11,
                            height: 1.4,
                            color: _theme.isDarkMode ? const Color(0xFFD8C7F8) : const Color(0xFF5B21B6),
                            fontWeight: FontWeight.w600,
                          ),
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
                    onPressed: () async {
                      await ApiService.reportMisuse(widget.item.id);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('⚠️ Item reported for administrative review. Thank you for keeping SVKM safe.'),
                            backgroundColor: Colors.orange,
                          ),
                        );
                      }
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
      color: _theme.isDarkMode ? const Color(0xFF261F2E) : const Color(0xFFFDE8EA),
      child: const Center(child: Text('📦', style: TextStyle(fontSize: 64))),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String val) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: _theme.subtextColor),
          const SizedBox(width: 10),
          Text(label, style: TextStyle(fontSize: 13, color: _theme.subtextColor)),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              val,
              textAlign: TextAlign.end,
              overflow: TextOverflow.ellipsis,
              maxLines: 2,
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: _theme.textColor),
            ),
          ),
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
