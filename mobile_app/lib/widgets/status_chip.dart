// Reusable Chip Widgets (ADF Module: Working with Flutter - Widgets & Styling)
import 'package:flutter/material.dart';

class StatusChip extends StatelessWidget {
  final String status;

  const StatusChip({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;

    switch (status.toUpperCase()) {
      case 'RESOLVED':
        bg = const Color(0xFFEDE9FE);
        text = const Color(0xFF6D28D9);
        break;
      case 'CLAIMED':
        bg = const Color(0xFFFEF7DB);
        text = const Color(0xFFB38600);
        break;
      default:
        bg = const Color(0xFFE6F7EF);
        text = const Color(0xFF2B9365);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          color: text,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

class TypeBadge extends StatelessWidget {
  final String type;

  const TypeBadge({super.key, required this.type});

  @override
  Widget build(BuildContext context) {
    final isLost = type.toUpperCase() == 'LOST';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: isLost ? const Color(0xFFFDE8EA) : const Color(0xFFE6F7EF),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isLost ? const Color(0xFFF9C8CF) : const Color(0xFFC4EAD9),
        ),
      ),
      child: Text(
        type.toUpperCase(),
        style: TextStyle(
          color: isLost ? const Color(0xFFD9485E) : const Color(0xFF2B9365),
          fontSize: 10,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}
