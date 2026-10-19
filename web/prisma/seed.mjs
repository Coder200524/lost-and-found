// Seed script for FinDora (DJSCE Lost & Found)
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding FinDora database...');

  // Clean existing records
  await prisma.claim.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();

  const hashedAdmin = await bcrypt.hash('admin123', 10);
  const hashedStudent = await bcrypt.hash('student123', 10);
  const hashedGuest = await bcrypt.hash('guest123', 10);

  // 1. Create Users (RBAC: ADMIN, USER, GUEST)
  const admin = await prisma.user.create({
    data: {
      name: 'Prof. Sharma',
      email: 'admin@djsce.edu',
      passwordHash: hashedAdmin,
      role: 'ADMIN',
      avatar: '🛡️',
      department: 'Faculty / Admin Affairs',
      collegeId: 'FAC-DJSCE-101',
      phone: '+91 98200 11223'
    }
  });

  const studentRahul = await prisma.user.create({
    data: {
      name: 'Rahul Mehta',
      email: 'rahul@djsce.edu',
      passwordHash: hashedStudent,
      role: 'USER',
      avatar: '👨‍🎓',
      department: 'Information Technology (Semester 5)',
      collegeId: '60004210045',
      phone: '+91 98765 43210'
    }
  });

  const studentPriya = await prisma.user.create({
    data: {
      name: 'Priya Shah',
      email: 'priya@djsce.edu',
      passwordHash: hashedStudent,
      role: 'USER',
      avatar: '👩‍🎓',
      department: 'Computer Engineering (Semester 5)',
      collegeId: '60004210088',
      phone: '+91 91234 56789'
    }
  });

  const guest = await prisma.user.create({
    data: {
      name: 'Campus Visitor',
      email: 'guest@djsce.edu',
      passwordHash: hashedGuest,
      role: 'GUEST',
      avatar: '👤',
      department: 'Guest / Alum',
      collegeId: 'GUEST-001',
      phone: '+91 99999 00000'
    }
  });

  // 2. Create Items
  const items = [
    {
      title: 'AirPods Pro (2nd Gen) in Blue Silicone Case',
      description: 'Found under the desk row 3 in Room 402. White case with subtle scratch on the back, inside navy blue silicone cover.',
      category: 'Electronics',
      type: 'FOUND',
      location: 'Room 402, 4th Floor',
      dateOccurred: '2024-10-18',
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
      reward: '',
      contactName: 'Rahul Mehta',
      contactEmail: 'rahul@djsce.edu',
      contactPhone: '+91 98765 43210',
      userId: studentRahul.id
    },
    {
      title: 'Black Leather Titan Wallet with DJSCE ID Card',
      description: 'Lost somewhere near the College Canteen or ground floor lawn. Contains DJSCE College ID Card (60004210088), Metro Card, and bank debit card. Urgent!',
      category: 'ID & Cards',
      type: 'LOST',
      location: 'College Canteen',
      dateOccurred: '2024-10-17',
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
      reward: '₹500 Reward & Canteen Treat',
      contactName: 'Priya Shah',
      contactEmail: 'priya@djsce.edu',
      contactPhone: '+91 91234 56789',
      userId: studentPriya.id
    },
    {
      title: 'Casio fx-991EX ClassWiz Scientific Calculator',
      description: 'Found on table 5 after Database Systems practical. Has a sticker of Naruto on the back cover.',
      category: 'Books & Stationery',
      type: 'FOUND',
      location: 'IT Computer Lab 3',
      dateOccurred: '2024-10-19',
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
      reward: '',
      contactName: 'Prof. Sharma',
      contactEmail: 'admin@djsce.edu',
      contactPhone: '+91 98200 11223',
      userId: admin.id
    },
    {
      title: 'Grey Hydro Flask Stainless Steel Water Bottle',
      description: 'Lost on 3rd floor library silent study corner. Grey 1-liter bottle with small dent near bottom and SVKM tech sticker.',
      category: 'Accessories',
      type: 'LOST',
      location: 'Central Library, 3rd Floor',
      dateOccurred: '2024-10-16',
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
      reward: 'Gratitude & Coffee',
      contactName: 'Rahul Mehta',
      contactEmail: 'rahul@djsce.edu',
      contactPhone: '+91 98765 43210',
      userId: studentRahul.id
    },
    {
      title: 'Set of 3 Keys with Ferrari Red Keychain',
      description: 'Found hanging on the fence near ground floor two-wheeler parking. Two Honda activa keys and one locker key.',
      category: 'Keys',
      type: 'FOUND',
      location: 'Ground Floor Parking',
      dateOccurred: '2024-10-18',
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
      reward: '',
      contactName: 'Prof. Sharma',
      contactEmail: 'admin@djsce.edu',
      contactPhone: '+91 98200 11223',
      userId: admin.id
    },
    {
      title: "Navy Blue Levi's Denim Jacket",
      description: 'Forgot in the 6th floor auditorium during the orientation seminar. Size M, has silver button details.',
      category: 'Clothing',
      type: 'LOST',
      location: '6th Floor Auditorium',
      dateOccurred: '2024-10-15',
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80',
      reward: '₹200 Reward',
      contactName: 'Priya Shah',
      contactEmail: 'priya@djsce.edu',
      contactPhone: '+91 91234 56789',
      userId: studentPriya.id
    },
    {
      title: 'Engineering Mathematics III Textbook (Kumbhojkar)',
      description: 'Left on circular table near reference section. Has yellow highlighter on chapter 4 (Laplace Transforms).',
      category: 'Books & Stationery',
      type: 'FOUND',
      location: 'Library Reference Section',
      dateOccurred: '2024-10-19',
      status: 'CLAIMED',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      reward: '',
      contactName: 'Rahul Mehta',
      contactEmail: 'rahul@djsce.edu',
      contactPhone: '+91 98765 43210',
      userId: studentRahul.id
    },
    {
      title: 'Fastrack Reflex Beat Smartwatch',
      description: 'Lost while playing badminton during sports hour. Black strap, digital display, battery was around 40%.',
      category: 'Electronics',
      type: 'LOST',
      location: 'Gymkhana / Sports Court',
      dateOccurred: '2024-10-14',
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      reward: '₹1000 Reward',
      contactName: 'Rahul Mehta',
      contactEmail: 'rahul@djsce.edu',
      contactPhone: '+91 98765 43210',
      userId: studentRahul.id
    }
  ];

  for (const itemData of items) {
    const createdItem = await prisma.item.create({ data: itemData });

    // Add a sample claim for the claimed item
    if (createdItem.status === 'CLAIMED') {
      await prisma.claim.create({
        data: {
          itemId: createdItem.id,
          claimantId: studentPriya.id,
          claimantName: 'Priya Shah',
          claimantEmail: 'priya@djsce.edu',
          proofDetails: 'My name is written on page 1 in pencil, and I can show matching notes from yesterday lecture.',
          status: 'APPROVED'
        }
      });
    }
  }

  console.log(`Seeding complete: 4 users and ${items.length} items created.`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
