import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function verifyAgeWithAudio(audioBlob: Blob): Promise<{ verified: boolean; reason: string }> {
  try {
    // Convert blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')
    
    // Transcribe audio using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBlob], 'audio.webm', { type: 'audio/webm' }),
      model: 'whisper-1',
    })
    
    // Analyze with GPT-4
    const analysis = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Analyze this transcript for age indicators: speech patterns, vocabulary, life references. Estimate if speaker is likely 65+ (yes/no with confidence score >80%). Respond JSON: {verified: boolean, reason: string (gentle, encouraging)}'
        },
        {
          role: 'user',
          content: transcription.text
        }
      ],
      temperature: 0.3,
    })
    
    const result = JSON.parse(analysis.choices[0].message.content || '{}')
    return result
  } catch (error) {
    console.error('OpenAI verification error:', error)
    return { verified: false, reason: 'Oops, let\'s try that again—technology can be tricky!' }
  }
}

export async function verifyAgeWithText(text: string): Promise<{ verified: boolean; reason: string }> {
  try {
    const analysis = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Analyze this text for age indicators: speech patterns, vocabulary, life references. Estimate if speaker is likely 65+ (yes/no with confidence score >80%). Respond JSON: {verified: boolean, reason: string (gentle, encouraging)}'
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
    })
    
    const result = JSON.parse(analysis.choices[0].message.content || '{}')
    return result
  } catch (error) {
    console.error('OpenAI verification error:', error)
    return { verified: false, reason: 'Oops, let\'s try that again—technology can be tricky!' }
  }
}
