// Admin Security & Moderation Console Screen for FinDora Mobile App
import 'package:flutter/material.dart';
import '../models/item.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/theme_service.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _theme = ThemeService();

  bool _loading = true;
  List<Map<String, dynamic>> _pendingClaims = [];
  List<Item> _handoverItems = [];
  List<Item> _flaggedItems = [];
  int _totalReportsCount = 0;
  int _resolvedCount = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _theme.addListener(_onThemeChange);
    _loadAdminData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _theme.removeListener(_onThemeChange);
    super.dispose();
  }

  void _onThemeChange() {
    if (mounted) setState(() {});
  }

  Future<void> _loadAdminData() async {
    setState(() => _loading = true);
    final user = AuthService().currentUser;
    if (user == null || user.role != 'ADMIN') {
      if (mounted) setState(() => _loading = false);
      return;
    }

    try {
      final claims = await ApiService.fetchAdminClaims(status: 'PENDING');
      final handovers = await ApiService.fetchAdminHandoverItems();
      final allItems = await ApiService.asyncFetchItems(type: 'ALL');

      if (mounted) {
        setState(() {
          _pendingClaims = claims;
          _handoverItems = handovers;
          _totalReportsCount = allItems.length;
          _resolvedCount = allItems.where((i) => i.status == 'RESOLVED').length;
          _flaggedItems = allItems.where((i) => i.reportsCount > 0).toList();
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _handleClaimDecision(String claimId, String decision) async {
    final res = await ApiService.resolveAdminClaim(claimId: claimId, decision: decision);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res['message'] ?? 'Claim $decision successfully!'),
          backgroundColor: decision == 'APPROVED' ? Colors.green : Colors.red,
        ),
      );
      _loadAdminData();
    }
  }

  Future<void> _handleCompleteHandover(String itemId) async {
    final ok = await ApiService.resolveAdminHandover(itemId);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(ok ? '🎉 Handover complete! Item marked as RESOLVED.' : 'Failed to update handover.'),
          backgroundColor: ok ? Colors.green : Colors.red,
        ),
      );
      _loadAdminData();
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = AuthService().currentUser;
    final isDark = _theme.isDarkMode;

    if (user == null || user.role != 'ADMIN') {
      return Scaffold(
        backgroundColor: _theme.scaffoldColor,
        appBar: AppBar(title: const Text('Access Restricted'), backgroundColor: Colors.transparent),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('🔒', style: TextStyle(fontSize: 48)),
              const SizedBox(height: 12),
              Text(
                'Administrator Access Required',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: _theme.textColor),
              ),
              const SizedBox(height: 6),
              Text(
                'Please sign in with authorized faculty admin credentials.',
                style: TextStyle(fontSize: 13, color: _theme.subtextColor),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: _theme.scaffoldColor,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Security & Moderation Console',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: _theme.textColor),
            ),
            Text(
              'SVKM DJSCE • RBAC Active',
              style: TextStyle(fontSize: 11, color: _theme.subtextColor),
            ),
          ],
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode, color: isDark ? Colors.amber : Colors.purple.shade300),
            tooltip: 'Toggle Theme',
            onPressed: () => _theme.toggleTheme(),
          ),
          IconButton(
            icon: Icon(Icons.refresh, color: _theme.textColor),
            tooltip: 'Refresh Data',
            onPressed: _loadAdminData,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFFE8848F),
          unselectedLabelColor: _theme.subtextColor,
          indicatorColor: const Color(0xFFE8848F),
          isScrollable: true,
          tabs: [
            Tab(text: '🛡️ Claims (${_pendingClaims.length})'),
            Tab(text: '🤝 Handover (${_handoverItems.length})'),
            Tab(text: '🚩 Flagged (${_flaggedItems.length})'),
            const Tab(text: '🗺️ Heatmap'),
          ],
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadAdminData,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // KPI Stats Grid
                  _buildStatsGrid(),
                  const SizedBox(height: 16),

                  // Tab Views inside Expandable container
                  SizedBox(
                    height: MediaQuery.of(context).size.height * 0.72,
                    child: TabBarView(
                      controller: _tabController,
                      children: [
                        _buildClaimsQueueTab(),
                        _buildHandoverQueueTab(),
                        _buildFlaggedReportsTab(),
                        _buildCampusHeatmapTab(),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  // 1. STATS GRID
  Widget _buildStatsGrid() {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 2.1,
      children: [
        _buildStatCard(
          'Pending Claims',
          '${_pendingClaims.length}',
          'Requires verification',
          const Color(0xFFE8848F),
          const Color(0xFFFDE8EA),
        ),
        _buildStatCard(
          'Awaiting Handover',
          '${_handoverItems.length}',
          'Ground Floor Desk',
          const Color(0xFF5B9FD4),
          const Color(0xFFEBF4FD),
        ),
        _buildStatCard(
          'Items Reunited',
          '$_resolvedCount',
          'Handover completed',
          const Color(0xFF5BBF8E),
          const Color(0xFFE8F8F0),
        ),
        _buildStatCard(
          'Total Reports',
          '$_totalReportsCount',
          'Campus sync active',
          const Color(0xFF9B8BDB),
          const Color(0xFFF0ECFB),
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String val, String sub, Color accent, Color lightBg) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: _theme.cardColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _theme.borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            title,
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: _theme.subtextColor),
          ),
          const SizedBox(height: 2),
          Row(
            children: [
              Text(
                val,
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: accent),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: _theme.isDarkMode ? accent.withValues(alpha: 0.2) : lightBg,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Icon(Icons.trending_up, size: 14, color: accent),
              ),
            ],
          ),
          Text(
            sub,
            style: TextStyle(fontSize: 9, color: _theme.subtextColor),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // 2. CLAIMS QUEUE TAB
  Widget _buildClaimsQueueTab() {
    if (_pendingClaims.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('✅', style: TextStyle(fontSize: 40)),
            const SizedBox(height: 8),
            Text(
              'No Pending Verification Claims',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: _theme.textColor),
            ),
            const SizedBox(height: 4),
            Text(
              'All student claims have been reviewed.',
              style: TextStyle(fontSize: 12, color: _theme.subtextColor),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      itemCount: _pendingClaims.length,
      padding: const EdgeInsets.only(top: 8, bottom: 24),
      itemBuilder: (ctx, idx) {
        final c = _pendingClaims[idx];
        final item = c['item'] is Map ? c['item'] : {};
        final claimantName = c['claimantName'] ?? c['claimant']?['name'] ?? 'Student';
        final claimantEmail = c['claimantEmail'] ?? c['claimant']?['email'] ?? '';
        final rollNo = c['rollNo'] ?? '';
        final sapId = c['sapId'] ?? c['claimant']?['sapId'] ?? '';
        final dept = c['department'] ?? c['claimant']?['department'] ?? '';
        final year = c['academicYear'] ?? '';
        final proof = c['proofDetails'] ?? '';

        return Card(
          margin: const EdgeInsets.only(bottom: 14),
          color: _theme.cardColor,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: BorderSide(color: _theme.borderColor),
          ),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Item Header
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: const Color(0xFFFDF3C0),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Center(child: Text('📦', style: TextStyle(fontSize: 20))),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item['title'] ?? 'Reported Item',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: _theme.textColor),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '📍 ${item['location'] ?? 'Campus'} • 📁 ${item['category'] ?? 'Category'}',
                            style: TextStyle(fontSize: 11, color: _theme.subtextColor),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF7DB),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFFF0D870)),
                      ),
                      child: const Text(
                        'PENDING',
                        style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF8A7A00)),
                      ),
                    ),
                  ],
                ),
                const Divider(height: 20),

                // Claimant Credentials Card
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: _theme.surfaceAltColor,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text('👤 $claimantName', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: _theme.textColor)),
                          const Spacer(),
                          Text(claimantEmail, style: TextStyle(fontSize: 11, color: _theme.subtextColor)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Wrap(
                        spacing: 8,
                        runSpacing: 4,
                        children: [
                          if (rollNo.isNotEmpty)
                            _buildInfoPill('Roll: $rollNo', const Color(0xFFE8848F)),
                          if (sapId.isNotEmpty)
                            _buildInfoPill('SAP: $sapId', const Color(0xFF5B9FD4)),
                          if (dept.isNotEmpty)
                            _buildInfoPill(dept, const Color(0xFF9B8BDB)),
                          if (year.isNotEmpty)
                            _buildInfoPill(year, const Color(0xFF5BBF8E)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),

                // Ownership Proof Box
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: _theme.isDarkMode ? const Color(0xFF281E3B) : const Color(0xFFF6F0FE),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF9B8BDB).withValues(alpha: 0.3)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.lock_outline, size: 13, color: Color(0xFF9B8BDB)),
                          SizedBox(width: 4),
                          Text(
                            'CONFIDENTIAL PROOF OF OWNERSHIP',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF9B8BDB)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        proof.isNotEmpty ? proof : 'No proof text provided.',
                        style: TextStyle(fontSize: 11, color: _theme.textColor, height: 1.4),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Action Buttons
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF5BBF8E),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        icon: const Icon(Icons.check, size: 16),
                        label: const Text('Approve (+50 Pts)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        onPressed: () => _handleClaimDecision(c['id'], 'APPROVED'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFE8848F),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      icon: const Icon(Icons.close, size: 16),
                      label: const Text('Reject', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      onPressed: () => _handleClaimDecision(c['id'], 'REJECTED'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // 3. HANDOVER QUEUE TAB
  Widget _buildHandoverQueueTab() {
    if (_handoverItems.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('🤝', style: TextStyle(fontSize: 40)),
            const SizedBox(height: 8),
            Text(
              'Handover Queue Clear',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: _theme.textColor),
            ),
            const SizedBox(height: 4),
            Text(
              'No approved items currently awaiting physical collection.',
              style: TextStyle(fontSize: 12, color: _theme.subtextColor),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      itemCount: _handoverItems.length,
      padding: const EdgeInsets.only(top: 8, bottom: 24),
      itemBuilder: (ctx, idx) {
        final item = _handoverItems[idx];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          color: _theme.cardColor,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: BorderSide(color: _theme.borderColor),
          ),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: const Color(0xFFC5DFF8),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Center(child: Text('🔑', style: TextStyle(fontSize: 20))),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.title,
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: _theme.textColor),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '📍 ${item.location} • 📅 ${item.dateOccurred}',
                            style: TextStyle(fontSize: 11, color: _theme.subtextColor),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEBF4FD),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFF5B9FD4)),
                      ),
                      child: const Text(
                        'AWAITING HANDOVER',
                        style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF5B9FD4)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: _theme.surfaceAltColor,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      const Text('🏢', style: TextStyle(fontSize: 16)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Handover Desk: Ground Floor Security Office. Check student ID card before physical handover.',
                          style: TextStyle(fontSize: 11, color: _theme.textColor, height: 1.3),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF5B9FD4),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    icon: const Icon(Icons.check_circle_outline, size: 16),
                    label: const Text('Complete Handover (Mark Resolved)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    onPressed: () => _handleCompleteHandover(item.id),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // 4. FLAGGED REPORTS TAB
  Widget _buildFlaggedReportsTab() {
    if (_flaggedItems.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('🛡️', style: TextStyle(fontSize: 40)),
            const SizedBox(height: 8),
            Text(
              'No Flagged Reports',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: _theme.textColor),
            ),
            const SizedBox(height: 4),
            Text(
              'Zero suspicious posts reported by students.',
              style: TextStyle(fontSize: 12, color: _theme.subtextColor),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      itemCount: _flaggedItems.length,
      padding: const EdgeInsets.only(top: 8, bottom: 24),
      itemBuilder: (ctx, idx) {
        final item = _flaggedItems[idx];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          color: _theme.cardColor,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: BorderSide(color: Colors.orange.shade200),
          ),
          child: ListTile(
            leading: const Text('⚠️', style: TextStyle(fontSize: 24)),
            title: Text(item.title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: _theme.textColor)),
            subtitle: Text('Flagged ${item.reportsCount} times • 📍 ${item.location}', style: TextStyle(fontSize: 11, color: _theme.subtextColor)),
            trailing: Chip(
              label: Text('Under Review', style: TextStyle(fontSize: 10, color: Colors.orange.shade800)),
              backgroundColor: Colors.orange.shade50,
            ),
          ),
        );
      },
    );
  }

  // 5. CAMPUS HEATMAP TAB
  Widget _buildCampusHeatmapTab() {
    final hotspots = [
      {'zone': 'College Canteen (Ground Floor)', 'reports': 18, 'heat': 'High 🔥', 'color': Colors.red},
      {'zone': 'Central Library (1st & 3rd Floor)', 'reports': 14, 'heat': 'High 🔥', 'color': Colors.orange},
      {'zone': '4th Floor IT Computer Labs', 'reports': 9, 'heat': 'Medium ⚡', 'color': Colors.amber},
      {'zone': 'Ground Floor Foyer & Gate 1', 'reports': 6, 'heat': 'Moderate 📍', 'color': Colors.blue},
      {'zone': '6th Floor Classrooms (CR 41)', 'reports': 4, 'heat': 'Low ℹ️', 'color': Colors.green},
    ];

    return ListView(
      padding: const EdgeInsets.only(top: 8, bottom: 24),
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: _theme.surfaceAltColor,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'High-Loss Hotspot Incident Heatmap',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: _theme.textColor),
              ),
              const SizedBox(height: 4),
              Text(
                'Data synthesized across reported lost items to guide security patrols.',
                style: TextStyle(fontSize: 11, color: _theme.subtextColor),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        ...hotspots.map((h) => Card(
              margin: const EdgeInsets.only(bottom: 10),
              color: _theme.cardColor,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: _theme.borderColor),
              ),
              child: ListTile(
                title: Text(h['zone'] as String, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: _theme.textColor)),
                subtitle: Text('${h['reports']} incidents reported this semester', style: TextStyle(fontSize: 11, color: _theme.subtextColor)),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: (h['color'] as Color).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    h['heat'] as String,
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: h['color'] as Color),
                  ),
                ),
              ),
            )),
      ],
    );
  }

  Widget _buildInfoPill(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color),
      ),
    );
  }
}
