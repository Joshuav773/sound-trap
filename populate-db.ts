import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { beats, users, storeProducts } from './shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function populateDatabase() {
  console.log('🌱 Populating database with test data...');

  try {
    // Add test users
    console.log('Adding test users...');
    const adminUser = await db.insert(users).values({
      email: 'admin@soundtrap.com',
      name: 'Pending Admin',
      password: 'admin123',
      role: 'admin',
      leasingTerms: null,
      publishingTerms: null,
    }).returning();

    const artistUser = await db.insert(users).values({
      email: 'artist@soundtrap.com',
      name: 'prodbypending',
      password: 'artist123',
      role: 'artist',
      leasingTerms: 'Standard leasing terms apply. Contact for custom arrangements.',
      publishingTerms: '50/50 publishing split on exclusive purchases.',
    }).returning();

    console.log('✅ Users added:', adminUser[0].name, artistUser[0].name);

    // Add test beats
    console.log('Adding test beats...');
    const testBeats = await db.insert(beats).values([
      {
        title: "Dark Trap Anthem",
        producer: "prodbypending",
        fileName: "dark-trap-anthem.mp3",
        filePath: "/beats/dark-trap-anthem.mp3",
        duration: 180,
        bpm: 140,
        key: "C#m",
        tags: ["Trap", "Dark", "Anthem"],
        leasePrice: "29.99",
        exclusivePrice: "299.99",
        isFeatured: true,
        artistId: artistUser[0].id,
        isPendingStore: false,
      },
      {
        title: "Melodic Drill",
        producer: "prodbypending",
        fileName: "melodic-drill.mp3",
        filePath: "/beats/melodic-drill.mp3",
        duration: 165,
        bpm: 150,
        key: "F#m",
        tags: ["Drill", "Melodic", "UK"],
        leasePrice: "24.99",
        exclusivePrice: "249.99",
        isFeatured: true,
        artistId: artistUser[0].id,
        isPendingStore: false,
      },
      {
        title: "Hip Hop Banger",
        producer: "prodbypending",
        fileName: "hip-hop-banger.mp3",
        filePath: "/beats/hip-hop-banger.mp3",
        duration: 195,
        bpm: 85,
        key: "Am",
        tags: ["Hip Hop", "Banger", "Classic"],
        leasePrice: "19.99",
        exclusivePrice: "199.99",
        isFeatured: false,
        artistId: artistUser[0].id,
        isPendingStore: false,
      },
      {
        title: "Emotional Trap",
        producer: "prodbypending",
        fileName: "emotional-trap.mp3",
        filePath: "/beats/emotional-trap.mp3",
        duration: 170,
        bpm: 130,
        key: "Dm",
        tags: ["Trap", "Emotional", "Melodic"],
        leasePrice: "27.99",
        exclusivePrice: "279.99",
        isFeatured: true,
        artistId: artistUser[0].id,
        isPendingStore: false,
      },
      {
        title: "Hard Drill Beat",
        producer: "prodbypending",
        fileName: "hard-drill-beat.mp3",
        filePath: "/beats/hard-drill-beat.mp3",
        duration: 160,
        bpm: 145,
        key: "G#m",
        tags: ["Drill", "Hard", "Aggressive"],
        leasePrice: "22.99",
        exclusivePrice: "229.99",
        isFeatured: false,
        artistId: artistUser[0].id,
        isPendingStore: false,
      }
    ]).returning();

    console.log('✅ Beats added:', testBeats.length);

    // Add pending store products
    console.log('Adding pending store products...');
    const pendingProducts = await db.insert(storeProducts).values([
      {
        title: "Music Production Course",
        description: "30-minute one-on-one lesson with prodbypending... Learn how to make melodies, program drums, and basic music theory. Perfect for beginners!",
        category: "course",
        price: "50.00",
        fileCount: 1,
        fileName: "course-booking.mp4",
        filePath: "/products/course",
        isFeatured: true,
        artistId: artistUser[0].id,
        isPendingStore: true,
      },
      {
        title: "Melodic Musa Loop Pack Vol. 1",
        description: "Premium melodic trap loops from el de la musa. Beautiful melodies perfect for emotional trap and melodic rap. Includes keys and synth arrangements crafted with 15+ years of musical experience.",
        category: "loop-pack",
        price: "29.99",
        fileCount: 20,
        fileName: "melodic-musa-loops-vol1.zip",
        filePath: "/products/loops",
        coverImagePath: "/products/images/musa loops.jpg",
        isFeatured: true,
        artistId: artistUser[0].id,
        isPendingStore: true,
      },
      {
        title: "Los Musa Drums Vol. 1",
        description: "Premium drum kit from el de la musa. High-quality trap and drill drums including 808s, hi-hats, snares, and kicks. Designed for modern trap, drill, and UK drill production.",
        category: "drum-kit",
        price: "24.99",
        fileCount: 50,
        fileName: "los-musa-drums-vol1.zip",
        filePath: "/products/drums",
        coverImagePath: "/products/images/musa drums.jpg",
        isFeatured: true,
        artistId: artistUser[0].id,
        isPendingStore: true,
      }
    ]).returning();

    console.log('✅ Pending store products added:', pendingProducts.length);

    console.log('🎉 Database populated successfully!');
    console.log('\nTest accounts:');
    console.log('Admin: admin@soundtrap.com / admin123');
    console.log('Artist: artist@soundtrap.com / artist123');
    console.log('\nAdded:');
    console.log(`- ${testBeats.length} beats`);
    console.log(`- ${pendingProducts.length} pending store products`);
    console.log(`- 2 test users`);

  } catch (error) {
    console.error('❌ Error populating database:', error);
  }
}

populateDatabase();
