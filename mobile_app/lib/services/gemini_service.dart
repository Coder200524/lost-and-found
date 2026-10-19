// Gemini AI Assistance Service (ADF Module: Gemini for Application Developers)
class GeminiService {
  // Suggest category based on keywords
  static String suggestCategory(String text) {
    final lower = text.toLowerCase();
    if (lower.contains('airpod') ||
        lower.contains('phone') ||
        lower.contains('laptop') ||
        lower.contains('charger') ||
        lower.contains('watch') ||
        lower.contains('earphone')) {
      return 'Electronics';
    }
    if (lower.contains('id') ||
        lower.contains('card') ||
        lower.contains('wallet') ||
        lower.contains('license') ||
        lower.contains('pan')) {
      return 'ID & Cards';
    }
    if (lower.contains('calculator') ||
        lower.contains('book') ||
        lower.contains('notes') ||
        lower.contains('pen') ||
        lower.contains('kumbhojkar')) {
      return 'Books & Stationery';
    }
    if (lower.contains('bottle') ||
        lower.contains('flask') ||
        lower.contains('umbrella') ||
        lower.contains('bag')) {
      return 'Accessories';
    }
    if (lower.contains('key') || lower.contains('chain')) {
      return 'Keys';
    }
    if (lower.contains('jacket') ||
        lower.contains('hoodie') ||
        lower.contains('shirt') ||
        lower.contains('cap')) {
      return 'Clothing';
    }
    return 'Other';
  }

  // Gemini Campus Lost & Found Advisor
  static List<String> getSearchRecommendations(String category, String location) {
    return [
      'Check with the ground floor Security Desk and Central Office.',
      'Check the Central Library 3rd floor lost collection box.',
      'Visit Lab In-charges if lost near computer labs.',
      'Broadcast a note on DJSCE departmental WhatsApp groups.',
    ];
  }
}
