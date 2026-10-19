// Profile & Identity Screen (ADF Module: Working with Flutter - Navigation & Styles)
import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFEF4F7),
      appBar: AppBar(
        title: const Text('Campus Profile', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Student ID Card Widget
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFE8848F), Color(0xFF9B8BDB)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.pink.withValues(alpha: 0.2),
                  blurRadius: 16,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('🌸 FinDora Mobile', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.25),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Text('STUDENT', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                const Text('Rahul Mehta', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20)),
                const SizedBox(height: 4),
                const Text('Information Technology • Sem 5', style: TextStyle(color: Colors.white70, fontSize: 12)),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('SAP ID: 60004210045', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.amber.shade400,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text('🏆 250 PTS', style: TextStyle(color: Colors.black87, fontSize: 10, fontWeight: FontWeight.w900)),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                const Text('Badge: 🎖️ Campus Hero (Top Contributor)', style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold)),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Evaluation credentials section
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            color: Colors.white,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('⚡ SVKM Evaluation Logins (SAP ID):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 8),
                  _buildAccountRow('Admin', 'ADMIN-001 (admin@djsce.edu)', 'admin123'),
                  _buildAccountRow('Student', '60004210045 (rahul@djsce.edu)', 'student123'),
                  _buildAccountRow('Student', '60004210088 (priya@djsce.edu)', 'student123'),
                  _buildAccountRow('Guest', 'GUEST-999 (guest@djsce.edu)', 'guest123'),
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Architecture Overview
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            color: Colors.white,
            child: const Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('📚 ADF & FST Syllabus Alignment:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  SizedBox(height: 8),
                  Text('• Full Stack Track: Next.js App Router, Prisma ORM, Mongoose, Server Actions, REST Route Handlers.', style: TextStyle(fontSize: 11, height: 1.4)),
                  SizedBox(height: 4),
                  Text('• ADF: Flutter widgets, multi-page routing, forms with validation, and Gemini AI smart assistance.', style: TextStyle(fontSize: 11, height: 1.4)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAccountRow(String role, String email, String pass) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('$role: $email', style: const TextStyle(fontSize: 11, color: Color(0xFF4A5568))),
          Text('Pass: $pass', style: TextStyle(fontSize: 11, color: Colors.grey.shade500, fontFamily: 'monospace')),
        ],
      ),
    );
  }
}
