import { NextRequest, NextResponse } from 'next/server'

// Zapier webhook endpoints for marketing automation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, data } = body

    // Validate webhook signature (in production, verify Zapier signature)
    const zapierSignature = request.headers.get('x-zapier-signature')
    if (!zapierSignature) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 401 })
    }

    // Process different event types
    switch (event) {
      case 'cart_abandoned':
        await handleCartAbandoned(data)
        break
      case 'trial_downloaded':
        await handleTrialDownloaded(data)
        break
      case 'beat_purchased':
        await handleBeatPurchased(data)
        break
      case 'user_registered':
        await handleUserRegistered(data)
        break
      case 'producer_verified':
        await handleProducerVerified(data)
        break
      default:
        console.log(`Unknown event type: ${event}`)
    }

    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error('Zapier webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Cart abandonment automation
async function handleCartAbandoned(data: any) {
  console.log('Cart abandoned webhook:', data)
  
  // Trigger email sequence in Zapier
  // This would integrate with email marketing tools
  // Example: Send reminder email after 1 hour, 24 hours, 72 hours
  
  const emailData = {
    customer_email: data.customerEmail,
    customer_name: data.customerName,
    cart_items: data.cartItems,
    total_amount: data.totalAmount,
    abandoned_at: data.abandonedAt,
    recovery_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart?recovery=${data.sessionId}`
  }
  
  // In production, this would trigger Zapier workflow
  console.log('Would trigger cart recovery email sequence:', emailData)
}

// Trial download follow-up
async function handleTrialDownloaded(data: any) {
  console.log('Trial downloaded webhook:', data)
  
  const followUpData = {
    customer_email: data.customerEmail,
    customer_name: data.customerName,
    beat_title: data.beatTitle,
    producer_name: data.producerName,
    download_url: data.downloadUrl,
    purchase_url: `${process.env.NEXT_PUBLIC_BASE_URL}/beats/${data.beatId}`
  }
  
  // Trigger follow-up sequence: thank you email, exclusive offer, etc.
  console.log('Would trigger trial download follow-up:', followUpData)
}

// Purchase confirmation and upsell
async function handleBeatPurchased(data: any) {
  console.log('Beat purchased webhook:', data)
  
  const purchaseData = {
    customer_email: data.customerEmail,
    customer_name: data.customerName,
    beat_title: data.beatTitle,
    producer_name: data.producerName,
    purchase_type: data.purchaseType,
    amount: data.amount,
    download_url: data.downloadUrl,
    upsell_url: `${process.env.NEXT_PUBLIC_BASE_URL}/beats?producer=${data.producerName}`
  }
  
  // Trigger: confirmation email, download links, producer recommendations
  console.log('Would trigger purchase confirmation sequence:', purchaseData)
}

// New user onboarding
async function handleUserRegistered(data: any) {
  console.log('User registered webhook:', data)
  
  const onboardingData = {
    user_email: data.email,
    user_name: data.name,
    user_role: data.role,
    welcome_url: `${process.env.NEXT_PUBLIC_BASE_URL}/welcome`,
    browse_url: `${process.env.NEXT_PUBLIC_BASE_URL}/browse`
  }
  
  // Trigger welcome sequence and role-specific onboarding
  console.log('Would trigger user onboarding sequence:', onboardingData)
}

// Producer verification celebration
async function handleProducerVerified(data: any) {
  console.log('Producer verified webhook:', data)
  
  const verificationData = {
    producer_email: data.email,
    producer_name: data.name,
    verification_badge: data.verificationBadge,
    trust_score: data.trustScore,
    profile_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${data.username}`,
    upload_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upload`
  }
  
  // Trigger: verification celebration, upload encouragement, marketplace tips
  console.log('Would trigger producer verification sequence:', verificationData)
}

// Test endpoint for Zapier webhook testing
export async function GET() {
  return NextResponse.json({
    message: 'Zapier webhook endpoint is active',
    events: [
      'cart_abandoned',
      'trial_downloaded', 
      'beat_purchased',
      'user_registered',
      'producer_verified'
    ],
    webhook_url: '/api/webhooks/zapier'
  })
}
