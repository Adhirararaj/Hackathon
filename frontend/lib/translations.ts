export type LangOption = {
  label: string
  code: string // BCP-47 for TTS
}

export const LANGUAGES: LangOption[] = [
  { label: 'English', code: 'en-IN' },
  { label: 'हिंदी (Hindi)', code: 'hi-IN' },
  { label: 'मराठी (Marathi)', code: 'mr-IN' },
  { label: 'বাংলা (Bengali)', code: 'bn-IN' },
  { label: 'தமிழ் (Tamil)', code: 'ta-IN' },
  { label: 'తెలుగు (Telugu)', code: 'te-IN' },
]

type Dict = Record<string, Record<string, string>>

// Minimal UI strings sample; fallback to English if missing.
export const t: Dict = {
  English: {
    app_name: 'Vaantra',
    select_language: 'Select your preferred language',
    continue: 'Continue',
    login: 'Login',
    register: 'Register',
    mobile_number: 'Mobile number',
    password: 'Password',
    full_name: 'Full name',
    about: 'About',
    home: 'Home',
    activate: 'Account Activation',
    awareness: 'Awareness Hub',
    admin: 'Admin Dashboard',
    logout: 'Logout',
    voice_input: 'Voice Input',
    text_input: 'Text Input',
    doc_upload: 'Document Upload',
    ask: 'Ask',
    speak_answer: 'Speak answer',
    relevant_docs: 'Relevant Documents',
    faq: 'Frequently Asked Questions',
    subscribe_sms: 'Subscribe to daily tips via SMS',
    subscribed: 'Subscribed',
    not_subscribed: 'Not Subscribed',
    add_to_vector_db: 'Add Document to Vector DB',
    title: 'Title',
    content: 'Content',
    add: 'Add',
    analytics: 'Analytics',
    most_used_languages: 'Most used languages',
  },
  'हिंदी (Hindi)': {
    app_name: 'वांतरा',
    select_language: 'अपनी पसंदीदा भाषा चुनें',
    continue: 'जारी रखें',
    login: 'लॉगिन',
    register: 'रजिस्टर',
    mobile_number: 'मोबाइल नंबर',
    password: 'पासवर्ड',
    full_name: 'पूरा नाम',
    about: 'परिचय',
    home: 'मुखपृष्ठ',
    activate: 'खाता सक्रियण',
    awareness: 'जागरूकता केंद्र',
    admin: 'एडमिन डैशबोर्ड',
    logout: 'लॉगआउट',
    voice_input: 'आवाज़ इनपुट',
    text_input: 'टेक्स्ट इनपुट',
    doc_upload: 'दस्तावेज़ अपलोड',
    ask: 'पूछें',
    speak_answer: 'उत्तर सुनें',
    relevant_docs: 'संबंधित दस्तावेज़',
    faq: 'अक्सर पूछे जाने वाले प्रश्न',
    subscribe_sms: 'दैनिक सुझाव एसएमएस द्वारा प्राप्त करें',
    subscribed: 'सदस्यता सक्रिय',
    not_subscribed: 'सदस्यता नहीं',
    add_to_vector_db: 'वेक्टर DB में दस्तावेज़ जोड़ें',
    title: 'शीर्षक',
    content: 'सामग्री',
    add: 'जोड़ें',
    analytics: 'विश्लेषण',
    most_used_languages: 'सबसे अधिक उपयोग की जाने वाली भाषाएँ',
  },
}

export function tr(lang: string, key: string) {
  return t[lang]?.[key] ?? t['English'][key] ?? key
}

export function langToVoiceCode(langLabel: string) {
  const found = LANGUAGES.find(l => l.label === langLabel)
  return found?.code ?? 'en-IN'
}
