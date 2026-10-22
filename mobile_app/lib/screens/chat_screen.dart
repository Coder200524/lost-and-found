// In-App Chat Screen (Matches web/src/components/ChatClient.tsx)
import 'package:flutter/material.dart';
import '../models/seed_data.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/theme_service.dart';

class ChatScreen extends StatefulWidget {
  final String? preselectedItemId;
  const ChatScreen({super.key, this.preselectedItemId});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _theme = ThemeService();
  Map<String, dynamic>? _selectedConversation;
  List<Map<String, dynamic>> _messages = [];
  bool _loadingMessages = false;
  final _textController = TextEditingController();
  final _scrollController = ScrollController();

  final List<Map<String, dynamic>> _conversations = List.from(SeedData.initialConversations);

  @override
  void initState() {
    super.initState();
    _theme.addListener(_onThemeChange);
    if (widget.preselectedItemId != null) {
      final found = _conversations.firstWhere(
        (c) => c['id'] == widget.preselectedItemId,
        orElse: () => {
          'id': widget.preselectedItemId,
          'title': 'Item Chat',
          'category': 'Campus',
          'emoji': '💬',
          'lastMessage': 'Chat unlocked after match.',
          'time': 'Just now',
          'matched': true,
          'location': 'DJSCE Campus',
        },
      );
      _openConversation(found);
    }
  }

  Future<void> _openConversation(Map<String, dynamic> convo) async {
    setState(() {
      _selectedConversation = convo;
      _loadingMessages = true;
    });

    final msgs = await ApiService.fetchChatMessages(convo['id']);
    if (mounted) {
      setState(() {
        _messages = msgs;
        _loadingMessages = false;
      });
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage(String text, {bool isSafety = false}) async {
    final clean = text.trim();
    if (clean.isEmpty || _selectedConversation == null) return;

    _textController.clear();
    final newMsg = {
      'id': 'msg-${DateTime.now().millisecondsSinceEpoch}',
      'senderName': AuthService().currentUser?.name ?? 'You',
      'content': clean,
      'createdAt': 'Just now',
      'isSafety': isSafety,
      'isMine': true,
    };

    setState(() {
      _messages.add(newMsg);
      _selectedConversation!['lastMessage'] = clean;
    });
    _scrollToBottom();

    await ApiService.sendChatMessage(
      itemId: _selectedConversation!['id'],
      content: clean,
      isSafety: isSafety,
    );
  }

  @override
  void dispose() {
    _theme.removeListener(_onThemeChange);
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onThemeChange() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    if (_selectedConversation != null) {
      return _buildChatRoomView();
    }
    return _buildConversationListView();
  }

  // View 1: List of Active Conversations
  Widget _buildConversationListView() {
    final isDark = _theme.isDarkMode;

    return Scaffold(
      backgroundColor: _theme.scaffoldColor,
      appBar: AppBar(
        title: Text(
          'Matched Chats',
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
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Banner
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF261E38) : const Color(0xFFDDD6F3).withValues(alpha: 0.6),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF9B8BDB).withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                const Text('🔒', style: TextStyle(fontSize: 22)),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Chat unlocks only after a confirmed match to keep contact info private.',
                    style: TextStyle(fontSize: 12, color: _theme.textColor, height: 1.3),
                  ),
                ),
              ],
            ),
          ),

          // Conversation List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _conversations.length,
              itemBuilder: (context, index) {
                final convo = _conversations[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: _theme.cardColor,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: isDark ? const Color(0xFF382E48) : Colors.transparent,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    leading: Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: _theme.surfaceAltColor,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Center(
                        child: Text(convo['emoji'] ?? '📦', style: const TextStyle(fontSize: 24)),
                      ),
                    ),
                    title: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Flexible(
                          child: Text(
                            convo['title'],
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: _theme.textColor),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          convo['time'],
                          style: TextStyle(fontSize: 11, color: _theme.subtextColor),
                        ),
                      ],
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(
                          convo['lastMessage'],
                          style: TextStyle(fontSize: 13, color: _theme.subtextColor),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '📍 ${convo['location']}',
                          style: const TextStyle(fontSize: 11, color: Color(0xFF9B8BDB)),
                        ),
                      ],
                    ),
                    trailing: Icon(Icons.arrow_forward_ios, size: 14, color: _theme.subtextColor),
                    onTap: () => _openConversation(convo),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // View 2: Active Chat Room
  Widget _buildChatRoomView() {
    final convo = _selectedConversation!;

    final isDark = _theme.isDarkMode;

    return Scaffold(
      backgroundColor: _theme.scaffoldColor,
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: _theme.textColor),
          onPressed: () => setState(() => _selectedConversation = null),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(convo['title'], style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: _theme.textColor)),
            Text('📍 ${convo['location']}', style: TextStyle(fontSize: 11, color: _theme.subtextColor)),
          ],
        ),
        backgroundColor: _theme.surfaceColor,
        elevation: 1,
        actions: [
          IconButton(
            icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode_outlined, color: _theme.textColor),
            tooltip: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
            onPressed: () => _theme.toggleTheme(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Safety guidelines banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: isDark ? const Color(0xFF382E14) : const Color(0xFFFDF3C0),
            child: Row(
              children: [
                const Text('🛡️', style: TextStyle(fontSize: 16)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Campus Safety: Handover items at the Ground Floor Security Desk.',
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? const Color(0xFFFDE884) : const Color(0xFF6A5A00),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Message Bubbles
          Expanded(
            child: _loadingMessages
                ? const Center(child: CircularProgressIndicator(color: Color(0xFFE8848F)))
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    itemCount: _messages.length,
                    itemBuilder: (context, index) {
                      final msg = _messages[index];
                      final isMine = msg['isMine'] == true;
                      final isSafety = msg['isSafety'] == true;

                      if (isSafety) {
                        return Container(
                          margin: const EdgeInsets.symmetric(vertical: 8),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isDark
                                ? const Color(0xFF1B3B2F).withValues(alpha: 0.8)
                                : const Color(0xFFC4EAD9).withValues(alpha: 0.7),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFF5BBF8E)),
                          ),
                          child: Text(
                            msg['content'],
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: isDark ? const Color(0xFF62DEB4) : const Color(0xFF2C6B4E),
                            ),
                          ),
                        );
                      }

                      return Align(
                        alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: isMine ? const Color(0xFFE8848F) : _theme.cardColor,
                            borderRadius: BorderRadius.only(
                              topLeft: const Radius.circular(16),
                              topRight: const Radius.circular(16),
                              bottomLeft: Radius.circular(isMine ? 16 : 4),
                              bottomRight: Radius.circular(isMine ? 4 : 16),
                            ),
                            border: Border.all(
                              color: isMine
                                  ? Colors.transparent
                                  : (isDark ? const Color(0xFF382E48) : Colors.black.withValues(alpha: 0.05)),
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: isMine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                            children: [
                              if (!isMine)
                                Text(
                                  msg['senderName'] ?? 'Owner',
                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF9B8BDB)),
                                ),
                              Text(
                                msg['content'],
                                style: TextStyle(
                                  color: isMine ? Colors.white : _theme.textColor,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                msg['createdAt'] ?? '',
                                style: TextStyle(
                                  color: isMine ? Colors.white70 : _theme.subtextColor,
                                  fontSize: 9,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),

          // Quick SVKM Safety Chips
          Container(
            height: 42,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _buildQuickReplyChip('🛡️ Security Desk Handover', () => _sendMessage('I can meet at the Ground Floor Security Desk for verification. 🛡️', isSafety: true)),
                const SizedBox(width: 8),
                _buildQuickReplyChip('🪪 Check SAP ID', () => _sendMessage('Please bring your SVKM SAP ID card so we can verify ownership. 🪪')),
                const SizedBox(width: 8),
                _buildQuickReplyChip('🔍 Unique Mark?', () => _sendMessage('Can you describe any unique sticker, scratch, or detail? 🔍')),
              ],
            ),
          ),

          // Input Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: _theme.cardColor,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.05),
                  blurRadius: 8,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      style: TextStyle(color: _theme.textColor),
                      decoration: InputDecoration(
                        hintText: 'Type message...',
                        hintStyle: TextStyle(color: _theme.subtextColor, fontSize: 14),
                        filled: true,
                        fillColor: isDark ? const Color(0xFF282036) : const Color(0xFFFBF8FA),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      onSubmitted: (val) => _sendMessage(val),
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    backgroundColor: const Color(0xFFE8848F),
                    child: IconButton(
                      icon: const Icon(Icons.send, color: Colors.white, size: 18),
                      onPressed: () => _sendMessage(_textController.text),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickReplyChip(String label, VoidCallback onTap) {
    final isDark = _theme.isDarkMode;
    return ActionChip(
      label: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: _theme.textColor)),
      backgroundColor: _theme.cardColor,
      side: BorderSide(color: isDark ? const Color(0xFF382E48) : Colors.grey.shade200),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      onPressed: onTap,
    );
  }
}
