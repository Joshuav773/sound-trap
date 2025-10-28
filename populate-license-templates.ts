import { db } from './server/db'
import { licenseTemplates } from './shared/schema'

const defaultTemplates = [
  {
    name: 'Basic Lease',
    type: 'lease',
    description: 'Perfect for independent artists and content creators',
    streamLimit: 100000,
    musicVideos: 1,
    radioAirplay: false,
    commercialUse: false,
    syncRights: false,
    plainLanguageSummary: 'Use for 1 music video, up to 100,000 streams. No radio airplay or commercial use.',
    legalContract: `BASIC LEASE AGREEMENT

This agreement grants you a non-exclusive license to use the instrumental track ("Beat") for the following purposes:

1. MUSIC VIDEO: You may create and distribute ONE (1) music video featuring your vocals over this beat.

2. STREAMING: You may distribute the completed song on streaming platforms with a limit of 100,000 streams.

3. RESTRICTIONS: 
   - No radio airplay
   - No commercial use
   - No synchronization rights
   - No resale or redistribution of the beat

4. CREDITS: You must credit the producer as "Prod. by [Producer Name]" in all releases.

5. TERM: This license is valid for 2 years from the date of purchase.

By purchasing this license, you agree to these terms.`,
    price: '29.00',
    includesMp3: true,
    includesWav: false,
    includesStems: false,
    includesTrackout: false,
  },
  {
    name: 'Premium Lease',
    type: 'lease',
    description: 'Enhanced rights for serious artists and labels',
    streamLimit: 500000,
    musicVideos: 2,
    radioAirplay: true,
    commercialUse: true,
    syncRights: false,
    plainLanguageSummary: 'Use for 2 music videos, up to 500,000 streams. Includes radio airplay and commercial use.',
    legalContract: `PREMIUM LEASE AGREEMENT

This agreement grants you a non-exclusive license to use the instrumental track ("Beat") for the following purposes:

1. MUSIC VIDEOS: You may create and distribute up to TWO (2) music videos featuring your vocals over this beat.

2. STREAMING: You may distribute the completed song on streaming platforms with a limit of 500,000 streams.

3. RADIO AIRPLAY: You may submit the song for radio airplay.

4. COMMERCIAL USE: You may use the song for commercial purposes including advertisements and promotional content.

5. RESTRICTIONS: 
   - No synchronization rights for TV/film
   - No resale or redistribution of the beat

6. CREDITS: You must credit the producer as "Prod. by [Producer Name]" in all releases.

7. TERM: This license is valid for 3 years from the date of purchase.

By purchasing this license, you agree to these terms.`,
    price: '99.00',
    includesMp3: true,
    includesWav: true,
    includesStems: false,
    includesTrackout: false,
  },
  {
    name: 'Exclusive Rights',
    type: 'exclusive',
    description: 'Complete ownership and unlimited usage rights',
    streamLimit: null,
    musicVideos: null,
    radioAirplay: true,
    commercialUse: true,
    syncRights: true,
    plainLanguageSummary: 'Complete ownership with unlimited streams, music videos, radio airplay, commercial use, and sync rights.',
    legalContract: `EXCLUSIVE RIGHTS AGREEMENT

This agreement grants you EXCLUSIVE ownership of the instrumental track ("Beat") with the following rights:

1. UNLIMITED USAGE: You may use this beat for unlimited music videos, streaming, radio airplay, and commercial purposes.

2. SYNCHRONIZATION RIGHTS: You may license the song for use in TV shows, films, advertisements, and other media.

3. OWNERSHIP: Upon purchase, you become the sole owner of this beat. The producer retains no rights.

4. RESALE RIGHTS: You may sell, license, or transfer ownership of this beat to third parties.

5. CREDITS: While not legally required, crediting the producer is appreciated.

6. TERM: This agreement is permanent and irrevocable.

By purchasing this license, you agree to these terms and become the exclusive owner of this beat.`,
    price: '299.00',
    includesMp3: true,
    includesWav: true,
    includesStems: true,
    includesTrackout: true,
  },
  {
    name: 'Free Download',
    type: 'free',
    description: 'Free beat for non-commercial use and promotion',
    streamLimit: 10000,
    musicVideos: 1,
    radioAirplay: false,
    commercialUse: false,
    syncRights: false,
    plainLanguageSummary: 'Free for non-commercial use. 1 music video, up to 10,000 streams. Must credit producer.',
    legalContract: `FREE LICENSE AGREEMENT

This agreement grants you a free, non-exclusive license to use the instrumental track ("Beat") for the following purposes:

1. MUSIC VIDEO: You may create and distribute ONE (1) music video featuring your vocals over this beat.

2. STREAMING: You may distribute the completed song on streaming platforms with a limit of 10,000 streams.

3. RESTRICTIONS: 
   - NON-COMMERCIAL USE ONLY
   - No radio airplay
   - No commercial use
   - No synchronization rights
   - No resale or redistribution of the beat

4. CREDITS: You MUST credit the producer as "Prod. by [Producer Name]" in all releases.

5. TERM: This license is valid for 1 year from the date of download.

By downloading this beat, you agree to these terms.`,
    price: '0.00',
    includesMp3: true,
    includesWav: false,
    includesStems: false,
    includesTrackout: false,
  }
]

async function populateLicenseTemplates() {
  try {
    console.log('Populating license templates...')
    
    // Clear existing templates
    await db.delete(licenseTemplates)
    
    // Insert default templates
    for (const template of defaultTemplates) {
      await db.insert(licenseTemplates).values(template)
    }
    
    console.log('✅ License templates populated successfully!')
    console.log(`Created ${defaultTemplates.length} license templates:`)
    defaultTemplates.forEach(template => {
      console.log(`  - ${template.name} (${template.type}): $${template.price}`)
    })
    
  } catch (error) {
    console.error('❌ Error populating license templates:', error)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  populateLicenseTemplates()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { populateLicenseTemplates }
