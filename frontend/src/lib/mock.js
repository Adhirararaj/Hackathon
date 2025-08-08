export async function mockTranscribe() {
  await new Promise((r) => setTimeout(r, 800))
  return 'Balance inquiry for account ending 1234'
}

export async function mockRagAnswer(query, language) {
  await new Promise((r) => setTimeout(r, 900))
  const answer = `Here is a helpful response to: "${query}". This includes steps to check your balance and safety tips. [${language}]`
  const docs = [
    {
      id: '1',
      title: 'How to check bank balance via mobile banking',
      snippet: 'Open the app > Accounts > Select your account > View available balance.',
    },
    {
      id: '2',
      title: 'Avoiding phishing scams',
      snippet: 'Never share your OTP or password. The bank will never ask for them.',
    },
  ]
  return { answer, docs }
}

export const FAQS = [
  { q: 'How do I reset my UPI PIN?', a: 'Open your banking app > UPI settings > Reset PIN. Follow on-screen steps.' },
  { q: 'Why is KYC important?', a: 'KYC verifies identity to prevent fraud and comply with regulations.' },
  { q: 'How do I block a lost debit card?', a: 'Use the app card settings or call the bank helpline immediately.' },
]

export const MOCK_LANG_USAGE = [
  { name: 'English', value: 120 },
  { name: 'हिंदी (Hindi)', value: 95 },
  { name: 'मराठी (Marathi)', value: 60 },
  { name: 'বাংলা (Bengali)', value: 50 },
  { name: 'தமிழ் (Tamil)', value: 40 },
  { name: 'తెలుగు (Telugu)', value: 38 },
]
