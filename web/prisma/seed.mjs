// Seed script for FinDora (SVKM DJSCE Lost & Found)
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding FinDora database with SVKM Mindmap specifications...');

  // Clean existing records
  await prisma.chatMessage.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();

  const hashedAdmin = await bcrypt.hash('admin123', 10);
  const hashedStudent = await bcrypt.hash('student123', 10);
  const hashedGuest = await bcrypt.hash('guest123', 10);

  // 1. Create SVKM Users with SAP ID, Reward Points & Badges
  const admin = await prisma.user.create({
    data: {
      name: 'Prof. Sharma (Admin)',
      email: 'admin@djsce.edu',
      sapId: 'ADMIN-001',
      passwordHash: hashedAdmin,
      role: 'ADMIN',
      avatar: '🛡️',
      department: 'Faculty / Admin Affairs',
      collegeId: 'FAC-DJSCE-101',
      phone: '+91 98200 11223',
      points: 1000,
      badge: 'Master Moderator',
    },
  });

  const studentRahul = await prisma.user.create({
    data: {
      name: 'Suruchi Makwana',
      email: 'SURUCHI.MAKWANA46@svkmmumbai.onmicrosoft.com',
      sapId: '60017240146',
      passwordHash: hashedStudent,
      role: 'USER',
      avatar: '👩‍💻',
      department: 'AIML',
      collegeId: 'A090',
      phone: '+91 98765 43210',
      points: 250,
      badge: 'Campus Hero',
    },
  });

  const studentPriya = await prisma.user.create({
    data: {
      name: 'Priya Shah',
      email: 'priya@djsce.edu',
      sapId: '60004210088',
      passwordHash: hashedStudent,
      role: 'USER',
      avatar: '👩‍🎓',
      department: 'Computer Engineering (Semester 5)',
      collegeId: '60004210088',
      phone: '+91 91234 56789',
      points: 150,
      badge: 'SVKM Guardian',
    },
  });

  const guest = await prisma.user.create({
    data: {
      name: 'Campus Visitor',
      email: 'guest@djsce.edu',
      sapId: 'GUEST-999',
      passwordHash: hashedGuest,
      role: 'GUEST',
      avatar: '👤',
      department: 'Guest / Alum',
      collegeId: 'GUEST-001',
      phone: '+91 99999 00000',
      points: 10,
      badge: 'SVKM Scout',
    },
  });

  // 2. Create Items aligned with Categories & Privacy rules
  const items = [
    {
      title: 'AirPods Pro (2nd Gen) in Blue Silicone Case',
      description: 'Found under the desk row 3 in Room 402. White case inside navy blue silicone cover.',
      category: 'Electronics',
      type: 'FOUND',
      location: 'Room 402, 4th Floor',
      isHotspot: true, // Room 402 Hotspot
      isMasked: false,
      isUrgent: false,
      dateOccurred: '2024-10-18',
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
      reward: '',
      contactName: 'Rahul Mehta',
      contactEmail: 'rahul@djsce.edu',
      contactPhone: '+91 98765 43210',
      userId: studentRahul.id,
    },
    {
      title: 'Black Leather Titan Wallet with DJSCE ID Card',
      description: 'Lost somewhere near the College Canteen. Contains DJSCE College ID Card (SAP: 600042100XX - Masked for Privacy), Metro Card, and bank debit card.',
      category: 'ID Cards',
      type: 'LOST',
      location: 'College Canteen',
      isHotspot: true, // Canteen Hotspot
      isMasked: true, // Mask sensitive details!
      isUrgent: true, // Lost Alert Broadcast!
      dateOccurred: '2024-10-17',
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
      reward: '₹500 Reward & Canteen Treat',
      contactName: 'Priya Shah',
      contactEmail: 'priya@djsce.edu',
      contactPhone: '+91 91234 56789',
      userId: studentPriya.id,
    },
    {
      title: 'Casio fx-991EX ClassWiz Scientific Calculator',
      description: 'Found on table 5 after Database Systems practical. Has a sticker on the back cover.',
      category: 'Stationery',
      type: 'FOUND',
      location: 'IT Computer Lab 3',
      isHotspot: true,
      isMasked: false,
      isUrgent: false,
      dateOccurred: '2024-10-19',
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
      reward: '',
      contactName: 'Prof. Sharma',
      contactEmail: 'admin@djsce.edu',
      contactPhone: '+91 98200 11223',
      userId: admin.id,
    },
    {
      title: 'Grey Hydro Flask Stainless Steel Water Bottle',
      description: 'Lost on 3rd floor library silent study corner. Grey 1-liter bottle with small dent near bottom.',
      category: 'Bottles',
      type: 'LOST',
      location: 'Central Library, 3rd Floor',
      isHotspot: true, // Library Hotspot
      isMasked: false,
      isUrgent: false,
      dateOccurred: '2024-10-16',
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
      reward: 'Gratitude & Coffee',
      contactName: 'Rahul Mehta',
      contactEmail: 'rahul@djsce.edu',
      contactPhone: '+91 98765 43210',
      userId: studentRahul.id,
    },
    {
      title: 'Set of 3 Keys with Ferrari Red Keychain',
      description: 'Found hanging on the fence near ground floor parking. Two activa keys and one locker key.',
      category: 'Accessories',
      type: 'FOUND',
      location: 'Ground Floor Parking',
      isHotspot: false,
      isMasked: false,
      isUrgent: false,
      dateOccurred: '2024-10-18',
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
      reward: '',
      contactName: 'Prof. Sharma',
      contactEmail: 'admin@djsce.edu',
      contactPhone: '+91 98200 11223',
      userId: admin.id,
    },
    {
      title: 'Wildcraft Black College Backpack',
      description: 'Left near Gymkhana locker room after table tennis match. Contains practical lab journal and umbrella.',
      category: 'Bags',
      type: 'LOST',
      location: 'Gymkhana / Sports Complex',
      isHotspot: true,
      isMasked: false,
      isUrgent: true,
      dateOccurred: '2024-10-15',
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
      reward: '₹300 Reward',
      contactName: 'Priya Shah',
      contactEmail: 'priya@djsce.edu',
      contactPhone: '+91 91234 56789',
      userId: studentPriya.id,
    },
    {
      title: 'Brown Hair Clutcher',
      description: 'Found on the second bench in Classroom CR 46-A.',
      category: 'Accessories',
      type: 'FOUND',
      location: 'CR 46-A',
      isHotspot: false,
      isMasked: false,
      isUrgent: false,
      dateOccurred: '2024-10-20',
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80',
      reward: '',
      contactName: 'Prof. Sharma',
      contactEmail: 'admin@djsce.edu',
      contactPhone: '+91 98200 11223',
      userId: admin.id,
    },
    {
      title: 'Logitech Black Wireless Mouse',
      description: 'Lost on Wednesday afternoon. Compact optical mouse with small USB receiver.',
      category: 'Electronics',
      type: 'LOST',
      location: 'IT Lab / Classroom',
      isHotspot: true,
      isMasked: false,
      isUrgent: false,
      dateOccurred: '2024-10-16',
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
      reward: 'Treat at Canteen',
      contactName: 'Rahul Mehta',
      contactEmail: 'rahul@djsce.edu',
      contactPhone: '+91 98765 43210',
      userId: studentRahul.id,
    },
    {
      title: 'Bike Keys with Royal Enfield Keychain',
      description: 'Found two ignition keys with metallic Royal Enfield leather keychain.',
      category: 'Accessories',
      type: 'FOUND',
      location: 'Ground Floor Parking',
      isHotspot: false,
      isMasked: false,
      isUrgent: false,
      dateOccurred: '2024-10-19',
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
      reward: '',
      contactName: 'Prof. Sharma',
      contactEmail: 'admin@djsce.edu',
      contactPhone: '+91 98200 11223',
      userId: admin.id,
    },
    {
      title: 'Green Transparent Tupperware Water Bottle',
      description: 'Lost 750ml green transparent Tupperware water bottle with black flip cap.',
      category: 'Water Bottles',
      type: 'LOST',
      location: 'College Canteen',
      isHotspot: true,
      isMasked: false,
      isUrgent: false,
      dateOccurred: '2024-10-18',
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
      reward: 'Gratitude & Coffee',
      contactName: 'Priya Shah',
      contactEmail: 'priya@djsce.edu',
      contactPhone: '+91 91234 56789',
      userId: studentPriya.id,
    },
    {
      title: 'Fastrack Digital Sports Watch',
      description: 'Lost in CAMD Lab on the 4th Floor during afternoon CAD session.',
      category: 'Accessories',
      type: 'LOST',
      location: 'CAMD Lab, 4th Floor',
      isHotspot: true,
      isMasked: false,
      isUrgent: true,
      dateOccurred: '2024-10-19',
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      reward: '₹500 Reward',
      contactName: 'Rahul Mehta',
      contactEmail: 'rahul@djsce.edu',
      contactPhone: '+91 98765 43210',
      userId: studentRahul.id,
    },
    {
      title: 'Over-Ear Wireless Headphones',
      description: 'Found on the back row desk in Classroom CR 41. Black cushions with foldable headband.',
      category: 'Electronics',
      type: 'FOUND',
      location: 'CR 41',
      isHotspot: false,
      isMasked: false,
      isUrgent: false,
      dateOccurred: '2024-10-20',
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      reward: '',
      contactName: 'Prof. Sharma',
      contactEmail: 'admin@djsce.edu',
      contactPhone: '+91 98200 11223',
      userId: admin.id,
    },
  ];

  for (const itemData of items) {
    const createdItem = await prisma.item.create({ data: itemData });

    // Pre-populate chat messages demonstrating In-App Chat After Match & Safety Rules
    if (createdItem.type === 'FOUND') {
      await prisma.chatMessage.create({
        data: {
          itemId: createdItem.id,
          senderId: admin.id,
          senderName: 'SVKM Safety Bot',
          content: '🛡️ Safety Reminder: Meet only at the Ground Floor Security Desk or Central Library reception for item verification and handover.',
          isPredefinedSafety: true,
        },
      });
    }
  }

  console.log(`Seeding complete: SVKM Mindmap features seeded successfully.`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
