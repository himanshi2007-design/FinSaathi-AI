

/* FinSaathi AI — frontend (vanilla JS). Demo mode by default; Flask-ready. */
'use strict';

/* ========== 1. CONFIG ========== */
const CONFIG = {
  USE_DEMO: false,
  API_BASE: 'https://finsaathi-ai.onrender.com/',
  CHAT_ENDPOINT: '/api/chat',
  SIMPLIFY_ENDPOINT: '/api/simplify'
};
let selectedLanguage = 'English'; // sent with every future backend request

const $ = (s) => document.querySelector(s);
const esc = (t) => { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; };

/* ========== 2. DEMO DATA (sample content — NOT AI output) ========== */
const DEMO_CHAT = {
  'what is a mutual fund?': 'A mutual fund pools money from many investors and invests it in a mix of shares, bonds or other assets, managed by professionals. Each investor owns units in proportion to the amount invested.',
  'explain sip in simple language.': 'SIP (Systematic Investment Plan) means investing a fixed amount at regular intervals, such as every month, instead of one large amount. It builds a habit and spreads your purchases over time. Returns are not guaranteed.',
  'what is the difference between stocks and mutual funds?': 'A stock is a share in one company. A mutual fund holds many investments in one package. Stocks can move more sharply; funds spread risk, but both are subject to market risk.',
  'what are the risks of investing?': 'Common risks: market risk (prices fall), inflation risk (money loses buying power), liquidity risk (hard to sell quickly) and concentration risk (too much in one place). Higher potential returns usually come with higher risk.',
  'what is diversification?': 'Diversification means spreading money across different investments so that one poor performer does not hurt your whole portfolio. It reduces risk but does not remove it.'
};
const DEMO_FALLBACK = 'This is a demo reply: the AI assistant is not connected yet. Try one of the suggested questions to see sample explanations.';

const DEMO_SIMPLIFY = {
  simplified_text: 'Mutual fund prices go up and down with the market, so you can lose money. Read the scheme documents fully before you invest.',
  terms: ['Market risk: the chance that prices fall because of market movements.', 'Scheme-related documents: official papers describing the fund\'s goals, costs and risks.'],
  risks: ['Your investment value can fall as well as rise.', 'Past performance does not guarantee future results.', 'Check costs, goals and risks in the official documents first.']
};
const SAMPLE_TEXT = 'Investments in mutual funds are subject to market risks. Please read all scheme-related documents carefully before investing.';

const TOPICS = {
  basics: { icon: '🌱', title: 'Basics of Investing', desc: 'What investing is and why people do it.', body: 'Investing means putting money into assets such as shares, bonds or funds hoping it grows over time. Set a goal, know your time horizon, build an emergency fund first, and never invest money you may need soon.' },
  mf: { icon: '🧺', title: 'Mutual Funds', desc: 'A shared basket managed by professionals.', body: 'A mutual fund collects money from many investors and invests it according to a stated objective. Check the fund\'s objective, expense ratio and risk level in its official documents.' },
  sip: { icon: '📅', title: 'SIP', desc: 'Invest small amounts regularly.', body: 'A Systematic Investment Plan invests a fixed amount at regular intervals. It encourages discipline and averages your purchase price over time. It does not guarantee profit.' },
  stock: { icon: '📊', title: 'Stock Market', desc: 'How shares are bought and sold.', body: 'A share represents part-ownership of a company. Prices change with company performance and market sentiment. Research the business and understand the risks before buying.' },
  risk: { icon: '⚖️', title: 'Risk and Returns', desc: 'Why higher returns mean higher risk.', body: 'Investments with higher potential returns generally carry higher risk of loss. Your risk capacity depends on your goals, income and how long you can stay invested.' },
  rights: { icon: '🛡️', title: 'Investor Rights', desc: 'What you are entitled to as an investor.', body: 'Investors can expect clear disclosures, fair treatment and a way to raise complaints through the intermediary and the regulator. Always deal with registered entities and keep records of your transactions.' }
};

const QUIZ_BANK = [
  { q: 'What does a mutual fund do?', o: ['Lends money to one company', 'Pools money from many investors', 'Guarantees fixed returns', 'Only buys gold'], a: 1, e: 'Mutual funds pool money from many investors and invest it in a variety of assets.' },
  { q: 'What does SIP stand for?', o: ['Systematic Investment Plan', 'Simple Interest Payment', 'Stock Index Program', 'Secure Income Policy'], a: 0, e: 'A SIP invests a fixed amount at regular intervals.' },
  { q: 'What is diversification?', o: ['Putting all money in one stock', 'Spreading money across investments', 'Selling when prices fall', 'Avoiding all risk'], a: 1, e: 'Spreading money across investments reduces the impact of one poor performer.' },
  { q: 'Which statement about risk is true?', o: ['Higher returns come with no risk', 'Risk can be removed fully', 'Higher potential returns usually mean higher risk', 'Past returns guarantee future returns'], a: 2, e: 'Risk and potential return are linked. Nothing guarantees future returns.' },
  { q: 'What should you do before investing?', o: ['Read official scheme documents', 'Follow a rumour', 'Borrow to invest', 'Skip the fine print'], a: 0, e: 'Official documents explain objectives, costs and risks.' }
];

/* ========== i18n: dictionary keyed by the English source text -> [Hindi, Marathi] ========== */
/* Missing entries fall back to English. Elements are tagged automatically (data-i18n) at start-up. */
const LANG_IDX = { English: -1, Hindi: 0, Marathi: 1 };
const LANG_CODE = { English: 'en', Hindi: 'hi', Marathi: 'mr' };
const WELCOME = "Namaste! I'm FinSaathi AI. Ask me about investing basics, SIPs, mutual funds and more. I explain concepts; I don't give personal investment advice.";
let lastDoc = null; // last simplifier result shown (re-rendered on language change)

const T = {
  "Skip to content": ["सामग्री पर जाएँ", "मजकुराकडे जा"],
  "Home": ["होम", "मुखपृष्ठ"],
  "AI Assistant": ["एआई सहायक", "एआय सहाय्यक"],
  "Simplify Documents": ["दस्तावेज़ सरल बनाएँ", "दस्तऐवज सोपे करा"],
  "Learn & Quiz": ["सीखें और क्विज़", "शिका आणि क्विझ"],
  "About": ["परिचय", "आमच्याबद्दल"],
  "Start Learning": ["सीखना शुरू करें", "शिकायला सुरुवात करा"],
  "Open menu": ["मेनू खोलें", "मेनू उघडा"],
  "Language": ["भाषा", "भाषा"],
  "Understand Money. Make Informed Decisions.": ["पैसे को समझें। समझदारी से फ़ैसले लें।", "पैसा समजून घ्या. जाणकार निर्णय घ्या."],
  "Financial knowledge in your language. Learn about investments, understand financial documents and build confidence with AI-powered learning.": ["आपकी भाषा में वित्तीय ज्ञान। निवेश के बारे में जानें, वित्तीय दस्तावेज़ समझें और एआई-आधारित सीख से आत्मविश्वास बढ़ाएँ।", "तुमच्या भाषेत आर्थिक ज्ञान. गुंतवणूक शिका, आर्थिक कागदपत्रे समजून घ्या आणि एआय-आधारित शिक्षणातून आत्मविश्वास वाढवा."],
  "Explore AI Assistant": ["एआई सहायक आज़माएँ", "एआय सहाय्यक वापरून पहा"],
  "Selected language:": ["चुनी हुई भाषा:", "निवडलेली भाषा:"],
  "Risk": ["जोखिम", "जोखीम"],
  "Diversification": ["विविधीकरण", "विविधीकरण"],
  "Illustration only — not real market data": ["केवल उदाहरण — वास्तविक बाज़ार डेटा नहीं", "फक्त उदाहरण — खरा बाजार डेटा नाही"],
  "Mutual fund? Think of it as a shared basket of investments. 🌱": ["म्यूचुअल फ़ंड? इसे निवेशों की साझा टोकरी समझें। 🌱", "म्युच्युअल फंड? निवेशांची सामायिक टोपली समजा. 🌱"],
  "Learn in Your Language": ["अपनी भाषा में सीखें", "तुमच्या भाषेत शिका"],
  "English, हिंदी and मराठी.": ["अंग्रेज़ी, हिंदी और मराठी।", "इंग्रजी, हिंदी आणि मराठी."],
  "Simplify Complex Finance": ["जटिल वित्त को सरल बनाएँ", "क्लिष्ट वित्त सोपे करा"],
  "Plain-language explanations.": ["आसान भाषा में स्पष्टीकरण।", "सोप्या भाषेत स्पष्टीकरण."],
  "Build Financial Confidence": ["वित्तीय आत्मविश्वास बढ़ाएँ", "आर्थिक आत्मविश्वास वाढवा"],
  "Understand before you invest.": ["निवेश से पहले समझें।", "गुंतवणुकीपूर्वी समजून घ्या."],
  "Meet Your Financial Learning Assistant": ["अपने वित्तीय सीखने के सहायक से मिलें", "तुमच्या आर्थिक शिक्षण सहाय्यकाला भेटा"],
  "Ask questions about financial concepts and get simple explanations.": ["वित्तीय अवधारणाओं के बारे में प्रश्न पूछें और सरल व्याख्या पाएँ।", "आर्थिक संकल्पनांबद्दल प्रश्न विचारा आणि सोपे स्पष्टीकरण मिळवा."],
  "Your question": ["आपका प्रश्न", "तुमचा प्रश्न"],
  "Type your question…": ["अपना प्रश्न लिखें…", "तुमचा प्रश्न लिहा…"],
  "Send": ["भेजें", "पाठवा"],
  "Please type a question before sending.": ["भेजने से पहले कोई प्रश्न लिखें।", "पाठवण्यापूर्वी प्रश्न लिहा."],
  "Could not get a reply. Check that the backend is running, then try again.": ["उत्तर नहीं मिल सका। जाँचें कि बैकएंड चल रहा है, फिर दोबारा प्रयास करें।", "उत्तर मिळाले नाही. बॅकएंड सुरू आहे का ते तपासा आणि पुन्हा प्रयत्न करा."],
  "Demo mode: sample response, not generated by AI.": ["डेमो मोड: यह नमूना उत्तर है, एआई द्वारा तैयार नहीं।", "डेमो मोड: हे नमुना उत्तर आहे, एआयने तयार केलेले नाही."],
  "Complex Finance? Let's Simplify It.": ["जटिल वित्त? आइए इसे सरल बनाएँ।", "क्लिष्ट वित्त? चला सोपे करूया."],
  "Turn difficult financial language into easy explanations you can understand.": ["कठिन वित्तीय भाषा को आसान व्याख्या में बदलें।", "अवघड आर्थिक भाषेला सोप्या स्पष्टीकरणात बदला."],
  "Paste financial text": ["वित्तीय पाठ चिपकाएँ", "आर्थिक मजकूर पेस्ट करा"],
  "Paste a disclosure, term or clause here…": ["यहाँ कोई घोषणा, शब्द या खंड चिपकाएँ…", "येथे एखादे प्रकटीकरण, संज्ञा किंवा कलम पेस्ट करा…"],
  "Output language": ["परिणाम की भाषा", "निकालाची भाषा"],
  "Simplify Text": ["पाठ सरल करें", "मजकूर सोपा करा"],
  "Use sample": ["नमूना डालें", "नमुना वापरा"],
  "Clear": ["साफ़ करें", "पुसून टाका"],
  "Your simplified explanation will appear here. Try the sample text.": ["आपकी सरल व्याख्या यहाँ दिखाई देगी। नमूना पाठ आज़माएँ।", "तुमचे सोपे स्पष्टीकरण येथे दिसेल. नमुना मजकूर वापरून पहा."],
  "Simple explanation": ["सरल व्याख्या", "सोपे स्पष्टीकरण"],
  "Important terms": ["महत्वपूर्ण शब्द", "महत्त्वाच्या संज्ञा"],
  "Risks and conditions": ["जोखिम और शर्तें", "जोखीम आणि अटी"],
  "Illustrative example output (demo mode, not AI-generated)": ["उदाहरण परिणाम (डेमो मोड, एआई द्वारा तैयार नहीं)", "उदाहरण निकाल (डेमो मोड, एआयने तयार केलेला नाही)"],
  "Paste some financial text first, or use the sample.": ["पहले कुछ वित्तीय पाठ चिपकाएँ या नमूना इस्तेमाल करें।", "आधी काही आर्थिक मजकूर पेस्ट करा किंवा नमुना वापरा."],
  "Simplifying…": ["सरल कर रहे हैं…", "सोपे करत आहे…"],
  "Could not simplify the text. Please try again.": ["पाठ सरल नहीं हो सका। कृपया दोबारा प्रयास करें।", "मजकूर सोपा करता आला नाही. कृपया पुन्हा प्रयत्न करा."],
  "Not provided.": ["उपलब्ध नहीं।", "उपलब्ध नाही."],
  "Learn Finance the Easy Way": ["आसान तरीके से वित्त सीखें", "सोप्या पद्धतीने वित्त शिका"],
  "Pick a topic to read a short guide, then test yourself.": ["संक्षिप्त मार्गदर्शिका पढ़ने के लिए विषय चुनें, फिर खुद को परखें।", "छोटी मार्गदर्शिका वाचण्यासाठी विषय निवडा, मग स्वतःची चाचणी घ्या."],
  "Basics of Investing": ["निवेश की बुनियादी बातें", "गुंतवणुकीची मूलतत्त्वे"],
  "Mutual Funds": ["म्यूचुअल फ़ंड", "म्युच्युअल फंड"],
  "SIP": ["एसआईपी", "एसआयपी"],
  "Stock Market": ["शेयर बाज़ार", "शेअर बाजार"],
  "Risk and Returns": ["जोखिम और रिटर्न", "जोखीम आणि परतावा"],
  "Investor Rights": ["निवेशक के अधिकार", "गुंतवणूकदारांचे हक्क"],
  "What investing is and why people do it.": ["निवेश क्या है और लोग इसे क्यों करते हैं।", "गुंतवणूक म्हणजे काय आणि लोक ती का करतात."],
  "A shared basket managed by professionals.": ["पेशेवरों द्वारा प्रबंधित साझा टोकरी।", "व्यावसायिकांनी सांभाळलेली सामायिक टोपली."],
  "Invest small amounts regularly.": ["नियमित रूप से छोटी राशि निवेश करें।", "नियमितपणे लहान रक्कम गुंतवा."],
  "How shares are bought and sold.": ["शेयर कैसे खरीदे और बेचे जाते हैं।", "शेअर्स कसे खरेदी-विक्री होतात."],
  "Why higher returns mean higher risk.": ["अधिक रिटर्न का मतलब अधिक जोखिम क्यों है।", "जास्त परताव्याचा अर्थ जास्त जोखीम का असतो."],
  "What you are entitled to as an investor.": ["निवेशक के रूप में आपके अधिकार।", "गुंतवणूकदार म्हणून तुमचे हक्क."],
  "Learn More": ["और जानें", "अधिक जाणून घ्या"],
  "Close": ["बंद करें", "बंद करा"],
  "Educational content only, not investment advice.": ["केवल शैक्षिक सामग्री, निवेश सलाह नहीं।", "फक्त शैक्षणिक मजकूर, गुंतवणूक सल्ला नाही."],
  "Question {n} of {total}": ["प्रश्न {n} / {total}", "प्रश्न {n} / {total}"],
  "Next question": ["अगला प्रश्न", "पुढील प्रश्न"],
  "See my score": ["मेरा स्कोर देखें", "माझा स्कोअर पहा"],
  "Correct!": ["सही!", "बरोबर!"],
  "Not quite.": ["बिल्कुल सही नहीं।", "अगदी बरोबर नाही."],
  "Your score: {s} / {total}": ["आपका स्कोर: {s} / {total}", "तुमचा स्कोअर: {s} / {total}"],
  "Great work! You have a solid grasp of the basics.": ["बहुत बढ़िया! आपकी बुनियादी समझ मज़बूत है।", "छान! तुमची मूलभूत समज पक्की आहे."],
  "Good start. Review the topics above and try again.": ["अच्छी शुरुआत। ऊपर के विषय दोबारा देखें और फिर प्रयास करें।", "चांगली सुरुवात. वरील विषय पुन्हा पाहा आणि पुन्हा प्रयत्न करा."],
  "Restart quiz": ["क्विज़ फिर शुरू करें", "क्विझ पुन्हा सुरू करा"],
  "Financial Education for Everyone": ["सबके लिए वित्तीय शिक्षा", "सर्वांसाठी आर्थिक शिक्षण"],
  "FinSaathi AI aims to make financial knowledge more accessible to people across India by reducing language barriers and simplifying complex financial information.": ["FinSaathi AI का लक्ष्य भाषा की बाधाएँ घटाकर और जटिल वित्तीय जानकारी को सरल बनाकर पूरे भारत के लोगों तक वित्तीय ज्ञान पहुँचाना है।", "भाषेचे अडथळे कमी करून आणि क्लिष्ट आर्थिक माहिती सोपी करून संपूर्ण भारतातील लोकांपर्यंत आर्थिक ज्ञान पोहोचवणे हे FinSaathi AI चे ध्येय आहे."],
  "Accessibility": ["सुलभता", "सुलभता"],
  "Explanations in the language you are most comfortable with.": ["उस भाषा में व्याख्या जिसमें आप सबसे सहज हों।", "तुम्हाला सर्वात सोयीस्कर भाषेत स्पष्टीकरण."],
  "Financial Awareness": ["वित्तीय जागरूकता", "आर्थिक जागरूकता"],
  "Everyday concepts, explained without jargon.": ["रोज़मर्रा की अवधारणाएँ, बिना कठिन शब्दों के।", "रोजच्या संकल्पना, कठीण शब्दांशिवाय."],
  "Understanding Before Investing": ["निवेश से पहले समझ", "गुंतवणुकीपूर्वी समज"],
  "Know what a document or product says before you decide.": ["फ़ैसले से पहले जानें कि दस्तावेज़ या उत्पाद क्या कहता है।", "निर्णयापूर्वी कागदपत्र किंवा उत्पाद काय सांगते ते जाणून घ्या."],
  "Financial learning in your language, built for first-time investors.": ["आपकी भाषा में वित्तीय शिक्षा, पहली बार निवेश करने वालों के लिए।", "तुमच्या भाषेत आर्थिक शिक्षण, पहिल्यांदा गुंतवणूक करणाऱ्यांसाठी."],
  "Navigate": ["नेविगेट करें", "नेव्हिगेट करा"],
  "Learn": ["सीखें", "शिका"],
  "Contact": ["संपर्क", "संपर्क"],
  "contact@example.com (placeholder)": ["contact@example.com (प्लेसहोल्डर)", "contact@example.com (प्लेसहोल्डर)"],
  "FinSaathi AI is an educational platform. It does not provide personalized investment advice, guarantee returns or replace professional financial guidance. Always verify important financial information with official sources.": ["FinSaathi AI एक शैक्षिक मंच है। यह व्यक्तिगत निवेश सलाह नहीं देता, रिटर्न की गारंटी नहीं देता और पेशेवर वित्तीय मार्गदर्शन का स्थान नहीं लेता। महत्वपूर्ण वित्तीय जानकारी हमेशा आधिकारिक स्रोतों से सत्यापित करें।", "FinSaathi AI हे एक शैक्षणिक व्यासपीठ आहे. ते वैयक्तिक गुंतवणूक सल्ला देत नाही, परताव्याची हमी देत नाही आणि व्यावसायिक आर्थिक मार्गदर्शनाची जागा घेत नाही. महत्त्वाची आर्थिक माहिती नेहमी अधिकृत स्रोतांकडून पडताळून घ्या."]
};
// Long constants defined above in the demo-data section
T[WELCOME] = ["नमस्ते! मैं FinSaathi AI हूँ। निवेश की बुनियादी बातों, SIP, म्यूचुअल फ़ंड आदि के बारे में पूछें। मैं अवधारणाएँ समझाता हूँ; व्यक्तिगत निवेश सलाह नहीं देता।", "नमस्कार! मी FinSaathi AI आहे. गुंतवणुकीची मूलतत्त्वे, SIP, म्युच्युअल फंड इत्यादींबद्दल विचारा. मी संकल्पना समजावतो; वैयक्तिक गुंतवणूक सल्ला देत नाही."];
T[DEMO_FALLBACK] = ["यह डेमो उत्तर है: एआई सहायक अभी जुड़ा नहीं है। नमूना व्याख्या देखने के लिए सुझाए गए प्रश्नों में से एक आज़माएँ।", "हे डेमो उत्तर आहे: एआय सहाय्यक अजून जोडलेला नाही. नमुना स्पष्टीकरण पाहण्यासाठी सुचवलेला एखादा प्रश्न वापरून पहा."];
T[SAMPLE_TEXT] = ["म्यूचुअल फ़ंड में निवेश बाज़ार जोखिमों के अधीन हैं। निवेश से पहले सभी योजना-संबंधी दस्तावेज़ ध्यान से पढ़ें।", "म्युच्युअल फंडातील गुंतवणूक बाजारातील जोखमींच्या अधीन आहे. गुंतवणूक करण्यापूर्वी योजनेशी संबंधित सर्व कागदपत्रे काळजीपूर्वक वाचा."];

// Demo chatbot content in Hindi/Marathi, keyed like DEMO_CHAT; q/a = [Hindi, Marathi]
const DEMO_I18N = {
  'what is a mutual fund?': { q: ["म्यूचुअल फ़ंड क्या है?", "म्युच्युअल फंड म्हणजे काय?"], a: ["म्यूचुअल फ़ंड कई निवेशकों का पैसा एकत्र करके उसे शेयर, बॉन्ड या अन्य संपत्तियों में लगाता है, जिसे पेशेवर प्रबंधक संभालते हैं। हर निवेशक को निवेश की गई राशि के अनुपात में यूनिट मिलती हैं।", "म्युच्युअल फंड अनेक गुंतवणूकदारांचे पैसे एकत्र करून शेअर्स, रोखे किंवा इतर मालमत्तेत गुंतवतो आणि व्यावसायिक व्यवस्थापक तो सांभाळतात. प्रत्येक गुंतवणूकदाराला गुंतवलेल्या रकमेच्या प्रमाणात युनिट्स मिळतात."] },
  'explain sip in simple language.': { q: ["SIP को सरल भाषा में समझाइए।", "SIP सोप्या भाषेत समजावून सांगा."], a: ["SIP (सिस्टमैटिक इन्वेस्टमेंट प्लान) का मतलब है एक बड़ी राशि की जगह हर महीने जैसे नियमित अंतराल पर तय राशि निवेश करना। इससे आदत बनती है और आपकी खरीद समय के साथ बँटती है। रिटर्न की गारंटी नहीं होती।", "SIP (सिस्टेमॅटिक इन्व्हेस्टमेंट प्लॅन) म्हणजे एकदम मोठी रक्कम गुंतवण्याऐवजी दर महिन्यासारख्या ठरावीक अंतराने ठरलेली रक्कम गुंतवणे. यामुळे सवय लागते आणि खरेदी कालांतराने विभागली जाते. परताव्याची हमी नसते."] },
  'what is the difference between stocks and mutual funds?': { q: ["शेयर और म्यूचुअल फ़ंड में क्या अंतर है?", "शेअर्स आणि म्युच्युअल फंडमध्ये काय फरक आहे?"], a: ["शेयर किसी एक कंपनी में हिस्सेदारी है। म्यूचुअल फ़ंड एक पैकेज में कई निवेश रखता है। शेयर ज़्यादा तेज़ी से घट-बढ़ सकते हैं; फ़ंड जोखिम बाँटते हैं, पर दोनों बाज़ार जोखिम के अधीन हैं।", "शेअर म्हणजे एका कंपनीतील हिस्सा. म्युच्युअल फंड एका पॅकेजमध्ये अनेक गुंतवणुका ठेवतो. शेअर्स जास्त वेगाने वर-खाली होऊ शकतात; फंड जोखीम विभागतात, पण दोन्ही बाजार जोखमीच्या अधीन आहेत."] },
  'what are the risks of investing?': { q: ["निवेश के जोखिम क्या हैं?", "गुंतवणुकीतील जोखमी कोणत्या?"], a: ["सामान्य जोखिम: बाज़ार जोखिम (कीमतें गिरना), महँगाई जोखिम (पैसे की क्रय-शक्ति घटना), तरलता जोखिम (जल्दी बेचना कठिन) और संकेंद्रण जोखिम (एक ही जगह बहुत ज़्यादा पैसा)। अधिक संभावित रिटर्न आमतौर पर अधिक जोखिम के साथ आता है।", "सामान्य जोखमी: बाजार जोखीम (किमती घसरणे), महागाई जोखीम (पैशाची क्रयशक्ती घटणे), तरलता जोखीम (लवकर विकणे कठीण) आणि केंद्रीकरण जोखीम (एकाच ठिकाणी खूप पैसा). जास्त संभाव्य परतावा सहसा जास्त जोखमीसह येतो."] },
  'what is diversification?': { q: ["विविधीकरण क्या है?", "विविधीकरण म्हणजे काय?"], a: ["विविधीकरण का मतलब है पैसे को अलग-अलग निवेशों में बाँटना ताकि एक खराब निवेश पूरे पोर्टफ़ोलियो को नुकसान न पहुँचाए। यह जोखिम घटाता है, पर खत्म नहीं करता।", "विविधीकरण म्हणजे पैसे वेगवेगळ्या गुंतवणुकींमध्ये विभागणे, जेणेकरून एका खराब गुंतवणुकीमुळे संपूर्ण पोर्टफोलिओचे नुकसान होणार नाही. यामुळे जोखीम कमी होते, पण पूर्णपणे संपत नाही."] }
};
// Demo simplifier output in Hindi/Marathi (same shape as DEMO_SIMPLIFY)
const DEMO_SIMPLIFY_I18N = [
  { simplified_text: "म्यूचुअल फ़ंड की कीमतें बाज़ार के साथ ऊपर-नीचे होती हैं, इसलिए आपको नुकसान हो सकता है। निवेश से पहले योजना के सभी दस्तावेज़ पूरे पढ़ें।", terms: ["बाज़ार जोखिम: बाज़ार की चाल से कीमतें गिरने की संभावना।", "योजना-संबंधी दस्तावेज़: फ़ंड के उद्देश्य, लागत और जोखिम बताने वाले आधिकारिक कागज़ात।"], risks: ["आपके निवेश का मूल्य घट भी सकता है और बढ़ भी सकता है।", "पिछला प्रदर्शन भविष्य के नतीजों की गारंटी नहीं देता।", "पहले आधिकारिक दस्तावेज़ों में लागत, उद्देश्य और जोखिम जाँचें।"] },
  { simplified_text: "म्युच्युअल फंडच्या किमती बाजाराबरोबर वर-खाली होतात, त्यामुळे तुमचे नुकसान होऊ शकते. गुंतवणुकीपूर्वी योजनेची सर्व कागदपत्रे पूर्ण वाचा.", terms: ["बाजार जोखीम: बाजाराच्या हालचालीमुळे किमती घसरण्याची शक्यता.", "योजनेशी संबंधित कागदपत्रे: फंडाचे उद्दिष्ट, खर्च आणि जोखीम सांगणारी अधिकृत कागदपत्रे."], risks: ["तुमच्या गुंतवणुकीचे मूल्य कमी किंवा जास्त होऊ शकते.", "मागील कामगिरी भविष्यातील निकालांची हमी देत नाही.", "आधी अधिकृत कागदपत्रांमध्ये खर्च, उद्दिष्ट आणि जोखीम तपासा."] }
];

/* Translate an English source string. Falls back to English if no translation exists. */
function tr(s, lang = selectedLanguage) { const i = LANG_IDX[lang]; return (i >= 0 && T[s] && T[s][i]) || s; }
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function findDemoKey(msg) { // matches a typed/clicked question in any of the 3 languages
  const m = msg.trim().toLowerCase();
  return Object.keys(DEMO_CHAT).find(k => [k, ...DEMO_I18N[k].q].some(v => v.toLowerCase() === m));
}
function demoQuestion(k, l = selectedLanguage) { const i = LANG_IDX[l]; return i >= 0 ? DEMO_I18N[k].q[i] : cap(k); }
function demoAnswer(k, l = selectedLanguage) { const i = LANG_IDX[l]; return i >= 0 ? DEMO_I18N[k].a[i] : DEMO_CHAT[k]; }
/* ---- Demo simplifier: picks an explanation from the INPUT TEXT (replace with POST /api/simplify) ---- */
const DEMO_UNKNOWN = "Demo mode can only explain a few sample topics: inflation, SIP, mutual funds, diversification and the sample market-risk disclosure. Your text did not match any of them. Connect the AI backend (POST /api/simplify) to simplify any text.";
T[DEMO_UNKNOWN] = ["डेमो मोड में केवल कुछ नमूना विषय समझाए जा सकते हैं: महँगाई, SIP, म्यूचुअल फ़ंड, विविधीकरण और नमूना बाज़ार-जोखिम घोषणा। आपका पाठ इनसे मेल नहीं खाया। किसी भी पाठ को सरल करने के लिए एआई बैकएंड (POST /api/simplify) जोड़ें।", "डेमो मोडमध्ये फक्त काही नमुना विषय समजावता येतात: महागाई, SIP, म्युच्युअल फंड, विविधीकरण आणि नमुना बाजार-जोखीम प्रकटीकरण. तुमचा मजकूर यांपैकी कशाशीही जुळला नाही. कोणताही मजकूर सोपा करण्यासाठी एआय बॅकएंड (POST /api/simplify) जोडा."];
// Each topic: match = regex on lowercased input; content per language = [simple explanation, [terms], [risks]]
const DEMO_TOPICS = [
  { id: 'disclosure', match: /subject to market risk|scheme-related|बाज़ार जोखिमों|बाजारातील जोखमीं/ }, // uses DEMO_SIMPLIFY (+ _I18N)
  { id: 'inflation', match: /inflation|महँगाई|महंगाई|महागाई|मुद्रास्फीति|चलनवाढ/, c: [
    ["Inflation means prices rise over time, so the same money buys less than before. For example, with 6% inflation, something that cost ₹100 now costs ₹106.", ["Inflation rate: how fast prices rise, usually shown as a percentage per year.", "Purchasing power: how much you can buy with your money."], ["If your savings earn less than inflation, they lose value in real terms.", "Inflation changes from year to year and cannot be predicted exactly."]],
    ["महँगाई का मतलब है कि समय के साथ कीमतें बढ़ती हैं, इसलिए उतने ही पैसे से पहले से कम सामान मिलता है। उदाहरण: जो सामान ₹100 में आता था, वह 6% महँगाई पर ₹106 का हो जाता है।", ["महँगाई दर: कीमतें कितनी तेज़ी से बढ़ रही हैं, आमतौर पर सालाना प्रतिशत में।", "क्रय-शक्ति: आपके पैसे से कितना सामान खरीदा जा सकता है।"], ["अगर आपकी बचत पर महँगाई से कम कमाई हो, तो उसका वास्तविक मूल्य घटता है।", "महँगाई हर साल बदलती है और उसका सटीक अनुमान नहीं लगाया जा सकता।"]],
    ["महागाई म्हणजे कालांतराने किमती वाढतात, त्यामुळे तेवढ्याच पैशांत पूर्वीपेक्षा कमी वस्तू मिळतात. उदाहरण: ₹100 ला येणारी वस्तू 6% महागाईत ₹106 ची होते.", ["महागाई दर: किमती किती वेगाने वाढत आहेत, सहसा वार्षिक टक्केवारीत.", "क्रयशक्ती: तुमच्या पैशांतून किती खरेदी करता येते."], ["बचतीवरील कमाई महागाईपेक्षा कमी असेल तर तिचे खरे मूल्य घटते.", "महागाई दरवर्षी बदलते आणि तिचा नेमका अंदाज बांधता येत नाही."]]] },
  { id: 'sip', match: /\bsip\b|systematic investment|एसआईपी|एसआयपी|सिप|सिस्टमैटिक|सिस्टेमॅटिक/, c: [
    ["A Systematic Investment Plan (SIP) lets you invest a fixed amount at regular intervals, such as monthly, into a mutual fund instead of investing one large sum.", ["Instalment: the fixed amount you invest each time.", "Unit: your share of the fund; each instalment buys units at that day's price."], ["SIP does not guarantee profit or protect against loss.", "Fund value moves with the market, so your total can fall as well as rise."]],
    ["सिस्टमैटिक इन्वेस्टमेंट प्लान (SIP) में आप एक बड़ी राशि लगाने के बजाय हर महीने जैसे नियमित अंतराल पर तय राशि म्यूचुअल फ़ंड में निवेश करते हैं।", ["किस्त: हर बार निवेश की जाने वाली तय राशि।", "यूनिट: फ़ंड में आपका हिस्सा; हर किस्त उस दिन के भाव पर यूनिट खरीदती है।"], ["SIP मुनाफ़े की गारंटी नहीं देता और नुकसान से नहीं बचाता।", "फ़ंड का मूल्य बाज़ार के साथ बदलता है, इसलिए आपकी कुल राशि घट भी सकती है।"]],
    ["सिस्टेमॅटिक इन्व्हेस्टमेंट प्लॅन (SIP) मध्ये एकदम मोठी रक्कम गुंतवण्याऐवजी तुम्ही दर महिन्यासारख्या ठरावीक अंतराने ठरलेली रक्कम म्युच्युअल फंडात गुंतवता.", ["हप्ता: प्रत्येक वेळी गुंतवली जाणारी ठरलेली रक्कम.", "युनिट: फंडातील तुमचा हिस्सा; प्रत्येक हप्त्याने त्या दिवसाच्या भावाने युनिट्स मिळतात."], ["SIP नफ्याची हमी देत नाही आणि नुकसानापासून वाचवत नाही.", "फंडाचे मूल्य बाजाराबरोबर बदलते, त्यामुळे एकूण रक्कम कमी किंवा जास्त होऊ शकते."]]] },
  { id: 'diversification', match: /diversif|विविधीकरण/, c: [
    ["Diversification means spreading your money across different investments so that one poor performer does not hurt everything. It is the idea of not putting all your eggs in one basket.", ["Portfolio: all the investments you hold together.", "Asset class: a type of investment, such as shares, bonds or gold."], ["Diversification reduces risk but does not remove it.", "Spreading across too many similar investments may add little protection."]],
    ["विविधीकरण का मतलब है पैसे को अलग-अलग निवेशों में बाँटना ताकि एक खराब निवेश से सब कुछ प्रभावित न हो। यह 'सारे अंडे एक टोकरी में न रखने' का विचार है।", ["पोर्टफ़ोलियो: आपके सभी निवेश एक साथ।", "संपत्ति वर्ग: निवेश का प्रकार, जैसे शेयर, बॉन्ड या सोना।"], ["विविधीकरण जोखिम घटाता है, खत्म नहीं करता।", "बहुत सारे एक जैसे निवेशों में बाँटने से सुरक्षा ज़्यादा नहीं बढ़ती।"]],
    ["विविधीकरण म्हणजे पैसे वेगवेगळ्या गुंतवणुकींमध्ये विभागणे, जेणेकरून एका खराब गुंतवणुकीमुळे सर्व काही बिघडत नाही. 'सगळी अंडी एकाच टोपलीत न ठेवणे' ही कल्पना आहे.", ["पोर्टफोलिओ: तुमच्या सर्व गुंतवणुका एकत्र.", "मालमत्ता वर्ग: गुंतवणुकीचा प्रकार, जसे शेअर्स, रोखे किंवा सोने."], ["विविधीकरण जोखीम कमी करते, पूर्णपणे संपवत नाही.", "खूप सारख्या गुंतवणुकींमध्ये विभागल्यास फारसे संरक्षण वाढत नाही."]]] },
  { id: 'mutualfund', match: /mutual fund|म्यूचुअल|म्युच्युअल/, c: [
    ["A mutual fund collects money from many investors and invests it in a mix of shares, bonds or other assets chosen by a professional fund manager. You own units that represent your share.", ["NAV (Net Asset Value): the price of one unit of the fund.", "Expense ratio: the yearly fee charged for managing the fund."], ["Fund value can fall as well as rise with the market.", "Past performance does not guarantee future returns."]],
    ["म्यूचुअल फ़ंड कई निवेशकों का पैसा इकट्ठा करके पेशेवर फ़ंड मैनेजर द्वारा चुने गए शेयर, बॉन्ड या अन्य संपत्तियों में लगाता है। आपके पास यूनिट होती हैं जो आपका हिस्सा दर्शाती हैं।", ["NAV (नेट एसेट वैल्यू): फ़ंड की एक यूनिट की कीमत।", "व्यय अनुपात: फ़ंड के प्रबंधन के लिए लगने वाला वार्षिक शुल्क।"], ["फ़ंड का मूल्य बाज़ार के साथ घट या बढ़ सकता है।", "पिछला प्रदर्शन भविष्य के रिटर्न की गारंटी नहीं देता।"]],
    ["म्युच्युअल फंड अनेक गुंतवणूकदारांचे पैसे एकत्र करून व्यावसायिक फंड मॅनेजरने निवडलेल्या शेअर्स, रोख्यांत किंवा इतर मालमत्तेत गुंतवतो. तुमच्याकडे तुमचा हिस्सा दर्शवणारी युनिट्स असतात.", ["NAV (नेट अ‍ॅसेट व्हॅल्यू): फंडाच्या एका युनिटची किंमत.", "खर्च गुणोत्तर: फंड सांभाळण्यासाठी आकारले जाणारे वार्षिक शुल्क."], ["फंडाचे मूल्य बाजाराबरोबर कमी किंवा जास्त होऊ शकते.", "मागील कामगिरी भविष्यातील परताव्याची हमी देत नाही."]]] }
];
/* Chooses the demo result from the user's text and language. Unknown text -> limitation message. */
function demoSimplify(text, l) {
  const q = (text || '').toLowerCase(), i = LANG_IDX[l], idx = i >= 0 ? i + 1 : 0; // c[0]=English, c[1]=Hindi, c[2]=Marathi
  const topic = DEMO_TOPICS.find(t => t.match.test(q));
  if (!topic) return { simplified_text: tr(DEMO_UNKNOWN, l), terms: [], risks: [], unknown: true, text };
  if (topic.id === 'disclosure') return { ...(i >= 0 ? DEMO_SIMPLIFY_I18N[i] : DEMO_SIMPLIFY), text };
  const [simple, terms, risks] = topic.c[idx];
  return { simplified_text: simple, terms, risks, text };
}

/* ========== 3. API LAYER (backend integration points) ========== */

async function postJSON(path, payload) {
  const url = CONFIG.API_BASE + path;

  console.log("Sending request:", url);
  console.log("Request data:", payload);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await res.text();
    console.log("Response status:", res.status);
    console.log("Response body:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error("Backend returned invalid JSON: " + responseText);
    }

    if (!res.ok) {
      throw new Error(
        "Server error " + res.status + ": " +
        (data.error || responseText)
      );
    }

    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

/* Chat. Request: {message, language}  Response: {reply} */
async function getChatReply(message) {
  if (CONFIG.USE_DEMO) { // DEMO MODE — replace by setting USE_DEMO=false
    await new Promise(r => setTimeout(r, 900));
    const k = findDemoKey(message);
    return { reply: k ? demoAnswer(k) : tr(DEMO_FALLBACK), demo: true };
  }
  // REAL MODE — Flask: POST /api/chat
  const data = await postJSON(CONFIG.CHAT_ENDPOINT, { message, language: selectedLanguage });
  return { reply: data.reply, demo: false };
}

/* Simplifier. Request: {text, language}  Response: {simplified_text} */
async function getSimplified(text, language) {
  if (CONFIG.USE_DEMO) { // DEMO MODE
    await new Promise(r => setTimeout(r, 700));
    return { ...demoSimplify(text, language), demo: true }; // text-based topic matching
  }
  // REAL MODE — Flask: POST /api/simplify
  const data = await postJSON(CONFIG.SIMPLIFY_ENDPOINT, { text, language });
  // Backend currently returns only simplified_text; terms/risks are optional extensions.
  return { simplified_text: data.simplified_text, terms: data.terms || [], risks: data.risks || [], demo: false };
}

/* Quiz questions. Currently local; replace with an API call for AI-generated questions. */
async function getQuizQuestions() { return QUIZ_BANK; }

/* ========== 4. NAVIGATION + LANGUAGE ========== */
const burger = $('#burger'), menu = $('#menu');
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
menu.addEventListener('click', e => { if (e.target.tagName === 'A') { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });

$('#lang-select').addEventListener('change', e => applyLanguage(e.target.value)); // single switching function: see section 9

/* ========== 5. CHAT ========== */
const log = $('#chat-log');
function addMsg(text, who, note) {
  const d = document.createElement('div');
  d.className = 'msg ' + who;
  d.innerHTML = esc(text) + (note ? '<small>' + esc(note) + '</small>' : '');
  log.appendChild(d); log.scrollTop = log.scrollHeight;
  return d;
}
const welcomeEl = addMsg(WELCOME, 'ai');

async function sendChat(text) {
  const err = $('#chat-error'); err.hidden = true;
  text = text.trim();
  if (!text) { err.textContent = tr('Please type a question before sending.'); err.hidden = false; return; }
  addMsg(text, 'user');
  const typing = document.createElement('div');
  typing.className = 'msg ai typing'; typing.setAttribute('aria-label', 'FinSaathi AI is typing');
  typing.innerHTML = '<span></span><span></span><span></span>';
  log.appendChild(typing); log.scrollTop = log.scrollHeight;
  try {
    const r = await getChatReply(text);
    typing.remove();
    addMsg(r.reply, 'ai', r.demo ? tr('Demo mode: sample response, not generated by AI.') : '');
  } catch (e) {
    typing.remove();
    err.textContent = tr('Could not get a reply. Check that the backend is running, then try again.') + ' (' + e.message + ')';
    err.hidden = false;
  }
}
$('#chat-form').addEventListener('submit', e => { e.preventDefault(); const i = $('#chat-input'); const v = i.value; i.value = ''; sendChat(v); });
function renderSuggest() { // suggested questions in the selected language
  $('#suggest').innerHTML = '';
  Object.keys(DEMO_CHAT).forEach(k => {
    const b = document.createElement('button'); b.type = 'button';
    b.textContent = demoQuestion(k);
    b.addEventListener('click', () => sendChat(b.textContent));
    $('#suggest').appendChild(b);
  });
}

/* ========== 6. DOCUMENT SIMPLIFIER ========== */
$('#sample-btn').addEventListener('click', () => { $('#doc-text').value = tr(SAMPLE_TEXT, $('#doc-lang').value); $('#doc-error').hidden = true; });
$('#clear-btn').addEventListener('click', () => { lastDoc = null; $('#doc-text').value = ''; $('#doc-out').hidden = true; $('#doc-empty').hidden = false; $('#doc-error').hidden = true; });
$('#simplify-btn').addEventListener('click', async () => {
  const text = $('#doc-text').value.trim(), err = $('#doc-error'), btn = $('#simplify-btn');
  err.hidden = true;
  lastDoc = null; $('#doc-out').hidden = true; $('#doc-empty').hidden = false; // never keep an old answer on screen
  if (!text) { err.textContent = tr('Paste some financial text first, or use the sample.'); err.hidden = false; return; }
  btn.disabled = true; btn.textContent = tr('Simplifying…');
  try {
    const r = await getSimplified(text, $('#doc-lang').value);
    lastDoc = { ...r, text }; renderDoc();
  } catch (e) {
    err.textContent = tr('Could not simplify the text. Please try again.') + ' (' + e.message + ')'; err.hidden = false;
  } finally { btn.disabled = false; btn.textContent = tr('Simplify Text'); }
});

function renderDoc() { // re-rendered whenever the language changes
  const r = lastDoc; if (!r) return;
  $('#doc-tag').textContent = r.demo ? tr('Illustrative example output (demo mode, not AI-generated)') : '';
  $('#doc-tag').hidden = !r.demo;
  $('#out-simple').textContent = r.simplified_text;
  const li = a => (a || []).map(t => '<li>' + esc(t) + '</li>').join('') || '<li>' + esc(tr('Not provided.')) + '</li>';
  $('#out-terms').innerHTML = li(r.terms); $('#out-risks').innerHTML = li(r.risks);
  [$('#out-terms'), $('#out-risks')].forEach(ul => { ul.hidden = !!r.unknown; ul.previousElementSibling.hidden = !!r.unknown; }); // unknown topic: message only
  $('#doc-empty').hidden = true; $('#doc-out').hidden = false;
}

/* ========== 7. TOPICS + MODAL ========== */
const modal = $('#modal');
function openTopic(id) {
  const t = TOPICS[id]; if (!t) return;
  $('#m-title').textContent = t.icon + ' ' + tr(t.title);
  $('#m-body').innerHTML = '<p>' + esc(tr(t.body)) + '</p><p class="small">' + esc(tr('Educational content only, not investment advice.')) + '</p>';
  modal.showModal();
}
$('#m-close').addEventListener('click', () => modal.close());
modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
function renderTopics() {
$('#topics').innerHTML = '';
Object.entries(TOPICS).forEach(([id, t]) => {
  const c = document.createElement('article'); c.className = 'card topic';
  c.innerHTML = '<div class="ic" aria-hidden="true">' + t.icon + '</div><h3>' + tr(t.title) + '</h3><p>' + tr(t.desc) + '</p>';
  const b = document.createElement('button'); b.className = 'btn btn-ghost btn-sm'; b.textContent = tr('Learn More');
  b.setAttribute('aria-label', tr('Learn More') + ': ' + tr(t.title));
  b.addEventListener('click', () => openTopic(id));
  c.appendChild(b); $('#topics').appendChild(c);
});
}
document.querySelectorAll('[data-topic]').forEach(a => a.addEventListener('click', () => openTopic(a.dataset.topic)));

/* ========== 8. QUIZ ========== */
const quizEl = $('#quiz');
let questions = [], qi = 0, score = 0, picked = null, finished = false;

async function startQuiz() { questions = await getQuizQuestions(); qi = 0; score = 0; picked = null; finished = false; renderQuiz(); }
function renderQuiz() { // safe to call again on language change; keeps progress and answer
  if (!questions.length) return;
  if (finished) return showScore();
  const q = questions[qi];
  quizEl.innerHTML = '<p class="prog">' + esc(tr('Question {n} of {total}').replace('{n}', qi + 1).replace('{total}', questions.length)) + '</p><h3>' + esc(tr(q.q)) + '</h3><div class="opts"></div><div id="fb"></div>';
  const box = quizEl.querySelector('.opts');
  q.o.forEach((text, i) => {
    const b = document.createElement('button'); b.className = 'opt'; b.textContent = tr(text);
    b.addEventListener('click', () => answer(i)); box.appendChild(b);
  });
  if (picked !== null) showResult();
}
function answer(i) {
  if (picked !== null) return;
  picked = i; if (i === questions[qi].a) score++;
  showResult(); quizEl.querySelector('#fb .btn').focus();
}
function showResult() {
  const q = questions[qi], btns = quizEl.querySelectorAll('.opt'), ok = picked === q.a, last = qi === questions.length - 1;
  btns.forEach((b, k) => { b.disabled = true; if (k === q.a) b.classList.add('right'); });
  if (!ok) btns[picked].classList.add('wrong');
  $('#fb').innerHTML = '<div class="fb"><b>' + esc(tr(ok ? 'Correct!' : 'Not quite.')) + '</b> ' + esc(tr(q.e)) + '</div>';
  const n = document.createElement('button'); n.className = 'btn btn-primary'; n.textContent = tr(last ? 'See my score' : 'Next question');
  n.addEventListener('click', () => { picked = null; if (last) { finished = true; showScore(); } else { qi++; renderQuiz(); } });
  $('#fb').appendChild(n);
}
function showScore() {
  quizEl.innerHTML = '<h3>' + esc(tr('Your score: {s} / {total}').replace('{s}', score).replace('{total}', questions.length)) + '</h3><p>' +
    esc(tr(score >= questions.length - 1 ? 'Great work! You have a solid grasp of the basics.' : 'Good start. Review the topics above and try again.')) +
    '</p><button class="btn btn-primary" id="restart">' + esc(tr('Restart quiz')) + '</button>';
  $('#restart').addEventListener('click', startQuiz);
}

/* ========== 9. LANGUAGE SWITCHING (single function) ========== */
function applyLanguage(lang) {
  if (!(lang in LANG_IDX)) lang = 'English';
  selectedLanguage = lang; // sent as "language" with future /api requests
  document.documentElement.lang = LANG_CODE[lang];
  $('#lang-select').value = lang; $('#doc-lang').value = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = tr(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = tr(el.dataset.i18nPh); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', tr(el.dataset.i18nAria)));
  const label = $('#lang-select').selectedOptions[0].textContent;
  document.querySelectorAll('[data-lang-label]').forEach(el => el.textContent = label);
  welcomeEl.textContent = tr(WELCOME);
  renderSuggest(); renderTopics(); renderQuiz();
  if (lastDoc && lastDoc.demo) lastDoc = { ...demoSimplify(lastDoc.text, lang), demo: true }; // re-pick for the same input
  renderDoc();
  try { localStorage.setItem('finsaathi-lang', lang); } catch (e) { /* storage unavailable */ }
}
// Tag static elements whose text/placeholder/aria-label exists in the dictionary
document.querySelectorAll('body *:not(script):not(option)').forEach(el => {
  if (!el.children.length) { const s = el.textContent.trim(); if (s && T[s]) el.dataset.i18n = s; }
  if (el.placeholder && T[el.placeholder]) el.dataset.i18nPh = el.placeholder;
  const a = el.getAttribute('aria-label'); if (a && T[a]) el.dataset.i18nAria = a;
});
startQuiz();
let savedLang = 'English';
try { savedLang = localStorage.getItem('finsaathi-lang') || 'English'; } catch (e) { /* ignore */ }
applyLanguage(savedLang);
