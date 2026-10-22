// FinDora Flutter Mobile App (ADF Track: Complete Mobile App Architecture)
import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/browse_screen.dart';
import 'screens/swipe_screen.dart';
import 'screens/chat_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/post_item_screen.dart';
import 'screens/login_screen.dart';
import 'services/auth_service.dart';
import 'services/theme_service.dart';

void main() {
  runApp(const FinDoraApp());
}

class FinDoraApp extends StatelessWidget {
  const FinDoraApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeService = ThemeService();

    return ListenableBuilder(
      listenable: themeService,
      builder: (context, _) {
        return MaterialApp(
          title: 'Findora',
          debugShowCheckedModeBanner: false,
          themeMode: themeService.themeMode,
          theme: ThemeData(
            useMaterial3: true,
            brightness: Brightness.light,
            colorScheme: ColorScheme.fromSeed(
              seedColor: const Color(0xFFE8848F),
              brightness: Brightness.light,
              primary: const Color(0xFFE8848F),
              secondary: const Color(0xFF9B8BDB),
              surface: Colors.white,
            ),
            scaffoldBackgroundColor: const Color(0xFFFEF4F7),
            cardColor: Colors.white,
            appBarTheme: const AppBarTheme(
              backgroundColor: Colors.white,
              foregroundColor: Color(0xFF2D3748),
              elevation: 0,
            ),
          ),
          darkTheme: ThemeData(
            useMaterial3: true,
            brightness: Brightness.dark,
            colorScheme: ColorScheme.fromSeed(
              seedColor: const Color(0xFFE8848F),
              brightness: Brightness.dark,
              primary: const Color(0xFFF78DA7),
              secondary: const Color(0xFFBDA8F9),
              surface: const Color(0xFF1E1A29),
              onSurface: const Color(0xFFF5F2F7),
            ),
            scaffoldBackgroundColor: const Color(0xFF130F1A),
            cardColor: const Color(0xFF1E1A29),
            appBarTheme: const AppBarTheme(
              backgroundColor: Color(0xFF1E1A29),
              foregroundColor: Color(0xFFF5F2F7),
              elevation: 0,
            ),
          ),
          home: ListenableBuilder(
            listenable: AuthService(),
            builder: (context, _) {
              if (!AuthService().isLoggedIn) {
                return const LoginScreen();
              }
              return const MainNavigationScreen();
            },
          ),
        );
      },
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  void _switchTab(int index) {
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final themeService = ThemeService();
    final isDark = themeService.isDarkMode;

    final screens = [
      HomeScreen(onNavigateTab: _switchTab),
      const BrowseScreen(),
      SwipeScreen(onNavigateTab: _switchTab),
      const ChatScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      backgroundColor: themeService.scaffoldColor,
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFFE8848F),
        foregroundColor: Colors.white,
        elevation: 4,
        shape: const CircleBorder(),
        tooltip: 'Report Lost or Found Item',
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => PostItemScreen(onItemPosted: () => _switchTab(1))),
          );
        },
        child: const Icon(Icons.add, size: 28),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: themeService.surfaceColor,
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black.withValues(alpha: 0.3) : Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: _switchTab,
          type: BottomNavigationBarType.fixed,
          backgroundColor: themeService.surfaceColor,
          selectedItemColor: const Color(0xFFE8848F),
          unselectedItemColor: isDark ? Colors.grey.shade500 : Colors.grey.shade400,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
          unselectedLabelStyle: const TextStyle(fontSize: 10),
          elevation: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.search_outlined),
              activeIcon: Icon(Icons.search),
              label: 'Browse',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.style_outlined),
              activeIcon: Icon(Icons.style),
              label: 'Swipe',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.chat_bubble_outline),
              activeIcon: Icon(Icons.chat_bubble),
              label: 'Chat',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
