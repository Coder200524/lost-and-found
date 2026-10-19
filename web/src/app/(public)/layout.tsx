import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Route Group Layout (FST Unit 1 & Unit 2: Structural route-group layouts)
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
