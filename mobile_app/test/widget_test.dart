import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/main.dart';

void main() {
  testWidgets('FinDora App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const FinDoraApp());
    expect(find.text('FinDora'), findsOneWidget);
  });
}
