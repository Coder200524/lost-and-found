// Theme Service for FinDora (ADF Track: Theme & State Management)
import 'package:flutter/material.dart';

class ThemeService extends ChangeNotifier {
  static final ThemeService _instance = ThemeService._internal();
  factory ThemeService() => _instance;
  ThemeService._internal();

  bool _isDarkMode = false;

  bool get isDarkMode => _isDarkMode;
  ThemeMode get themeMode => _isDarkMode ? ThemeMode.dark : ThemeMode.light;

  void toggleTheme() {
    _isDarkMode = !_isDarkMode;
    notifyListeners();
  }

  void setDarkMode(bool value) {
    if (_isDarkMode != value) {
      _isDarkMode = value;
      notifyListeners();
    }
  }

  // FinDora Theme Palette Tokens
  static const Color primary = Color(0xFFE8848F);
  static const Color secondary = Color(0xFF9B8BDB);

  // Light Theme Colors
  static const Color lightScaffold = Color(0xFFFEF4F7);
  static const Color lightSurface = Colors.white;
  static const Color lightText = Color(0xFF2D3748);
  static const Color lightSubtext = Color(0xFF7A6E80);
  static const Color lightBorder = Color(0xFFF9C8CF);

  // Dark Theme Colors (Deep charcoal with luminous pastel pink/lavender accents)
  static const Color darkScaffold = Color(0xFF130F1A);
  static const Color darkSurface = Color(0xFF1E1A29);
  static const Color darkSurfaceAlt = Color(0xFF282236);
  static const Color darkText = Color(0xFFF5F2F7);
  static const Color darkSubtext = Color(0xFFA699B0);
  static const Color darkBorder = Color(0xFF382E48);

  // Dynamic Getters
  Color get scaffoldColor => _isDarkMode ? darkScaffold : lightScaffold;
  Color get surfaceColor => _isDarkMode ? darkSurface : lightSurface;
  Color get surfaceAltColor => _isDarkMode ? darkSurfaceAlt : const Color(0xFFFEF4F7);
  Color get textColor => _isDarkMode ? darkText : lightText;
  Color get subtextColor => _isDarkMode ? darkSubtext : lightSubtext;
  Color get borderColor => _isDarkMode ? darkBorder : lightBorder;
  Color get cardColor => _isDarkMode ? darkSurface : Colors.white;
}
