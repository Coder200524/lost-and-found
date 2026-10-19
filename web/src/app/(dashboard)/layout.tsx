import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-8 px-4 sm:px-6">{children}</main>
      <Footer />
    </div>
  );
}
