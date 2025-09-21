// Simple text-based age verification without OpenAI
export async function verifyAgeWithText(text: string): Promise<{ verified: boolean; reason: string }> {
  try {
    // Simple keyword-based verification for demo purposes
    const ageKeywords = [
      'retired', 'retirement', 'grandchildren', 'grandkids', 'pension', 'social security',
      'senior', 'elderly', '65', '70', '80', '90', 'years old', 'decades', 'generation',
      'wisdom', 'experience', 'life lessons', 'back in my day', 'when I was young',
      'nursing home', 'assisted living', 'medicare', 'medicaid', 'aarp'
    ]
    
    const textLower = text.toLowerCase()
    const keywordMatches = ageKeywords.filter(keyword => textLower.includes(keyword))
    
    // Simple scoring system
    let score = 0
    if (textLower.includes('retired') || textLower.includes('retirement')) score += 3
    if (textLower.includes('grandchildren') || textLower.includes('grandkids')) score += 2
    if (/\b(6[5-9]|[7-9][0-9])\b/.test(textLower)) score += 4 // Age numbers 65-99
    if (textLower.includes('years old')) score += 2
    if (keywordMatches.length > 0) score += keywordMatches.length
    
    // Also check for length and maturity indicators
    if (text.length > 50) score += 1
    if (textLower.includes('wisdom') || textLower.includes('experience')) score += 2
    
    const verified = score >= 3
    
    if (verified) {
      return {
        verified: true,
        reason: 'Thank you for sharing your experience! Welcome to Silver Sparks! ✨'
      }
    } else {
      return {
        verified: false,
        reason: 'Please share more about your life experience to help us verify your age. Tell us about retirement, grandchildren, or your years of wisdom!'
      }
    }
  } catch (error) {
    console.error('Verification error:', error)
    return { verified: false, reason: 'Oops, let\'s try that again—technology can be tricky!' }
  }
}
