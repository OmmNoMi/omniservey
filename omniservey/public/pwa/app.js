const { createApp, ref, reactive, computed, onMounted, watch, nextTick } = Vue;

// 1. IndexedDB Initialization via Dexie.js (ACID WAL Engine)
const db = new Dexie('OmniServeyDB');
db.version(1).stores({
  templates: 'name, title, project, version, schema_hash_sha256',
  translations: '[survey_template+language_code], survey_template, language_code',
  wal: 'idempotency_key, status, survey_template, template_version, captured_at_local, synced_at, retry_count',
  media_blobs: 'id, filename, mime_type, synced',
  respondents: 'respondent_uid, primary_name, respondent_type, phone_hash, village_city, district'
});

// 2. Comprehensive 10-Language Vernacular Dictionary (100% Offline Compatible)
const BUILTIN_TRANSLATIONS = {
  "en": {
    "OmniServey": "OmniServey",
    "ओमनीसर्वे": "OmniServey",
    "Online": "Online",
    "ऑनलाइन": "Online",
    "Offline": "Offline",
    "ऑफलाइन": "Offline",
    "Surveys": "Surveys",
    "सर्वेक्षण": "Surveys",
    "WAL Queue": "WAL Queue",
    "कतार (ऑफलाइन)": "WAL Queue",
    "System": "System",
    "सिस्टम": "System",
    "Exit Form": "Exit Form",
    "← बाहर निकलें": "Exit Form",
    "Step": "Step",
    "चरण": "Step",
    "of": "of",
    "का": "of",
    "Pages": "Pages",
    "पृष्ठ": "Pages",
    "Questions": "Questions",
    "प्रश्न": "Questions",
    "Previous": "Previous",
    "← पिछला": "Previous",
    "Next": "Next",
    "अगला →": "Next",
    "Save Offline": "Save Offline",
    "ऑफलाइन सेव करें": "Save Offline",
    "Submit Survey": "Submit Survey",
    "सबमिट करें": "Submit Survey",
    "Capture GPS Coordinates": "Capture GPS Coordinates",
    "जीपीएस लोकेशन रिकॉर्ड करें": "Capture GPS Coordinates",
    "GPS Fix Acquired ✓": "GPS Fix Acquired ✓",
    "जीपीएस लोकेशन प्राप्त हुआ ✓": "GPS Fix Acquired ✓",
    "Take Photo / Choose File": "Take Photo / Choose File",
    "फोटो लें / फाइल चुनें": "Take Photo / Choose File",
    "Sign inside box with finger or stylus": "Sign inside box with finger or stylus",
    "अपनी उंगली या स्टाइलस से बॉक्स में हस्ताक्षर करें": "Sign inside box with finger or stylus",
    "Clear Signature": "Clear Signature",
    "हस्ताक्षर मिटाएं": "Clear Signature",
    "Signature Recorded": "Signature Recorded",
    "हस्ताक्षर दर्ज हुआ": "Signature Recorded",
    "Enter response here...": "Enter response here...",
    "यहाँ उत्तर दर्ज करें...": "Enter response here...",
    "Required Questions Pending": "Required Questions Pending",
    "आवश्यक प्रश्न अधूरे हैं": "Required Questions Pending",
    "Please fill in these required fields before final submission, or save as an offline draft anytime.": "Please fill in these required fields before final submission, or save as an offline draft anytime.",
    "अंतिम सबमिशन से पहले कृपया इन आवश्यक प्रश्नों को भरें, या कभी भी ऑफलाइन ड्राफ्ट के रूप में सुरक्षित करें।": "Please fill in these required fields before final submission, or save as an offline draft anytime.",
    "Go to First Pending Question": "Go to First Pending Question",
    "👉 पहले अधूरे प्रश्न पर जाएं": "Go to First Pending Question",
    "Save as Offline Draft Anyway": "Save as Offline Draft Anyway",
    "💾 ऑफलाइन ड्राफ्ट सुरक्षित करें": "Save as Offline Draft Anyway",
    "Close": "Close",
    "बंद करें": "Close",
    "Start Survey Form": "Start Survey Form",
    "सर्वेक्षण शुरू करें": "Start Survey Form",
    "Start Survey Form →": "Start Survey Form →",
    "सर्वेक्षण शुरू करें →": "Start Survey Form →",
    "Write-Ahead Log (WAL)": "Write-Ahead Log (WAL)",
    "राइट-अहेड लॉग (WAL कतार)": "Write-Ahead Log (WAL)",
    "Atomic zero-loss local storage queue": "Atomic zero-loss local storage queue",
    "शून्य डेटा हानि सुरक्षित स्थानीय भंडारण": "Atomic zero-loss local storage queue",
    "Sync Now": "Sync Now",
    "⟳ अभी सिंक करें": "Sync Now",
    "View on Map →": "View on Map →",
    "नक्शे पर देखें →": "View on Map →",
    "Re-acquire Fix": "Re-acquire Fix",
    "पुनः प्रयास करें": "Re-acquire Fix",
    "Section A: Basic Details": "Section A: Basic Details",
    "भाग क: बुनियादी विवरण": "Section A: Basic Details",
    "Section B: Respondent & Household Profile": "Section B: Respondent & Household Profile",
    "भाग ख: उत्तरदाता और परिवार की प्रोफ़ाइल": "Section B: Respondent & Household Profile",
    "Section C: Enterprise Operations & Finance": "Section C: Enterprise Operations & Finance",
    "भाग ग: उद्यम संचालन और वित्त": "Section C: Enterprise Operations & Finance",
    "Section D: Enterprise Challenges & Coping Mechanisms": "Section D: Enterprise Challenges & Coping Mechanisms",
    "भाग घ: उद्यम चुनौतियाँ और समाधान": "Section D: Enterprise Challenges & Coping Mechanisms",
    "Section E: Impact of SVEP / OSF Schemes": "Section E: Impact of SVEP / OSF Schemes",
    "भाग ङ: एसवीईपी / ओएसएफ योजनाओं का प्रभाव": "Section E: Impact of SVEP / OSF Schemes",
    "Section F: Digital Transactions & Social Media": "Section F: Digital Transactions & Social Media",
    "भाग च: डिजिटल लेन-देन और सोशल मीडिया": "Section F: Digital Transactions & Social Media",
    "Section G: Field Verification & Sign-off": "Section G: Field Verification & Sign-off",
    "भाग छ: फील्ड सत्यापन और हस्ताक्षर": "Section G: Field Verification & Sign-off",
    "District": "District",
    "जिला": "District",
    "Block / Tehsil": "Block / Tehsil",
    "ब्लॉक / तहसील": "Block / Tehsil",
    "Village / Gram Panchayat Name": "Village / Gram Panchayat Name",
    "गाँव / ग्राम पंचायत का नाम": "Village / Gram Panchayat Name",
    "Cluster Level Federation (CLF) Name": "Cluster Level Federation (CLF) Name",
    "क्लस्टर लेवल फेडरेशन (CLF) का नाम": "Cluster Level Federation (CLF) Name",
    "Village Organization (VO) Name": "Village Organization (VO) Name",
    "ग्राम संगठन (VO) का नाम": "Village Organization (VO) Name",
    "Self-Help Group (SHG) Name": "Self-Help Group (SHG) Name",
    "स्वयं सहायता समूह (SHG) का नाम": "Self-Help Group (SHG) Name",
    "Respondent Name": "Respondent Name",
    "उत्तरदाता का नाम": "Respondent Name",
    "Enterprise / Business Name": "Enterprise / Business Name",
    "उद्यम / व्यवसाय का नाम": "Enterprise / Business Name",
    "Year of Setting Up Enterprise": "Year of Setting Up Enterprise",
    "उद्यम स्थापना का वर्ष": "Year of Setting Up Enterprise",
    "Main Business Activity of the Enterprise": "Main Business Activity of the Enterprise",
    "उद्यम की मुख्य व्यावसायिक गतिविधि": "Main Business Activity of the Enterprise",
    "What is respondent's relation with SHG member?": "What is respondent's relation with SHG member?",
    "उत्तरदाता का एसएचजी सदस्य से क्या संबंध है?": "What is respondent's relation with SHG member?",
    "What is the age of SHG member?": "What is the age of SHG member?",
    "एसएचजी सदस्य की आयु क्या है?": "What is the age of SHG member?",
    "What is the marital status of the SHG member?": "What is the marital status of the SHG member?",
    "एसएचजी सदस्य की वैवाहिक स्थिति क्या है?": "What is the marital status of the SHG member?",
    "What is the social category / caste?": "What is the social category / caste?",
    "सामाजिक श्रेणी / जाति क्या है?": "What is the social category / caste?",
    "What is the education status of the SHG member?": "What is the education status of the SHG member?",
    "एसएचजी सदस्य की शैक्षणिक स्थिति क्या है?": "What is the education status of the SHG member?",
    "How many total members are in the family?": "How many total members are in the family?",
    "परिवार में कुल कितने सदस्य हैं?": "How many total members are in the family?",
    "What is your total annual household income?": "What is your total annual household income?",
    "आपकी कुल वार्षिक पारिवारिक आय कितनी है?": "What is your total annual household income?",
    "What is your role in the SHG?": "What is your role in the SHG?",
    "एसएचजी में आपकी भूमिका क्या है?": "What is your role in the SHG?",
    "Are you related to any of the SVEP / OSF CRP?": "Are you related to any of the SVEP / OSF CRP?",
    "क्या आप किसी SVEP / OSF CRP से संबंधित हैं?": "Are you related to any of the SVEP / OSF CRP?",
    "Who started the enterprise?": "Who started the enterprise?",
    "उद्यम किसने शुरू किया था?": "Who started the enterprise?",
    "Who operates and manages the enterprise on a daily basis?": "Who operates and manages the enterprise on a daily basis?",
    "दैनिक आधार पर उद्यम का संचालन और प्रबंधन कौन करता है?": "Who operates and manages the enterprise on a daily basis?",
    "For how many hours in a day does the shop/enterprise remain open?": "For how many hours in a day does the shop/enterprise remain open?",
    "दिन में कितने घंटे दुकान/उद्यम खुला रहता है?": "For how many hours in a day does the shop/enterprise remain open?",
    "What is the type of business place / premises?": "What is the type of business place / premises?",
    "व्यावसायिक स्थान/परिसर का प्रकार क्या है?": "What is the type of business place / premises?",
    "Does SHG member maintain written records of business transactions regularly?": "Does SHG member maintain written records of business transactions regularly?",
    "क्या एसएचजी सदस्य नियमित रूप से व्यावसायिक लेन-देन का लिखित रिकॉर्ड रखते हैं?": "Does SHG member maintain written records of business transactions regularly?",
    "In the first year of your enterprise, what was the amount of seed capital (Rs)?": "In the first year of your enterprise, what was the amount of seed capital (Rs)?",
    "आपके उद्यम के पहले वर्ष में प्रारंभिक बीज पूंजी की राशि (रु) क्या थी?": "In the first year of your enterprise, what was the amount of seed capital (Rs)?",
    "How do you manage working capital during peak season?": "How do you manage working capital during peak season?",
    "पीक सीजन के दौरान आप कार्यशील पूंजी का प्रबंधन कैसे करते हैं?": "How do you manage working capital during peak season?",
    "Is the location of your space convenient for your business?": "Is the location of your space convenient for your business?",
    "क्या आपके स्थान की स्थिति आपके व्यवसाय के लिए सुविधाजनक है?": "Is the location of your space convenient for your business?",
    "Are you satisfied and happy with your wholesale supplier?": "Are you satisfied and happy with your wholesale supplier?",
    "क्या आप अपने थोक सप्लायर से संतुष्ट और खुश हैं?": "Are you satisfied and happy with your wholesale supplier?",
    "Are you able to recover credit / money from your customers?": "Are you able to recover credit / money from your customers?",
    "क्या आप अपने ग्राहकों से उधारी/पैसा वसूल पाते हैं?": "Are you able to recover credit / money from your customers?",
    "Do you source raw materials/goods from market independently?": "Do you source raw materials/goods from market independently?",
    "क्या आप बाजार से स्वतंत्र रूप से कच्चा माल/सामान लाते हैं?": "Do you source raw materials/goods from market independently?",
    "Do you have easy access to loans from different sources?": "Do you have easy access to loans from different sources?",
    "क्या आपको विभिन्न स्रोतों से ऋण की आसान पहुँच प्राप्त है?": "Do you have easy access to loans from different sources?",
    "How much loan amount have you availed under SVEP / OSF scheme (Rs)?": "How much loan amount have you availed under SVEP / OSF scheme (Rs)?",
    "आपने SVEP / OSF योजना के तहत कितनी ऋण राशि प्राप्त की है (रु)?": "How much loan amount have you availed under SVEP / OSF scheme (Rs)?",
    "How did you utilize the enterprise loan?": "How did you utilize the enterprise loan?",
    "आपने उद्यम ऋण का उपयोग किस प्रकार किया?": "How did you utilize the enterprise loan?",
    "Monthly enterprise income BEFORE availing loan changes (Rs)?": "Monthly enterprise income BEFORE availing loan changes (Rs)?",
    "ऋण से बदलाव करने से पहले उद्यम की मासिक आय (रु)?": "Monthly enterprise income BEFORE availing loan changes (Rs)?",
    "Monthly enterprise income AFTER availing loan changes (Rs)?": "Monthly enterprise income AFTER availing loan changes (Rs)?",
    "ऋण से बदलाव करने के बाद उद्यम की मासिक आय (रु)?": "Monthly enterprise income AFTER availing loan changes (Rs)?",
    "What has been the contribution of SVEP / OSF CRPs?": "What has been the contribution of SVEP / OSF CRPs?",
    "SVEP / OSF CRP का क्या योगदान रहा है?": "What has been the contribution of SVEP / OSF CRPs?",
    "Does the woman entrepreneur own a smartphone?": "Does the woman entrepreneur own a smartphone?",
    "क्या महिला उद्यमी के पास स्मार्टफोन है?": "Does the woman entrepreneur own a smartphone?",
    "Do you use QR code / UPI / mobile banking for business transactions?": "Do you use QR code / UPI / mobile banking for business transactions?",
    "क्या आप व्यावसायिक लेन-देन के लिए क्यूआर कोड / यूपीआई / मोबाइल बैंकिंग का उपयोग करते हैं?": "Do you use QR code / UPI / mobile banking for business transactions?",
    "Daily how many transactions are done via QR code / UPI?": "Daily how many transactions are done via QR code / UPI?",
    "प्रतिदिन क्यूआर कोड / यूपीआई द्वारा कितने लेन-देन होते हैं?": "Daily how many transactions are done via QR code / UPI?",
    "Which social media platforms do you use for your business?": "Which social media platforms do you use for your business?",
    "आप अपने व्यवसाय के लिए किन सोशल मीडिया प्लेटफॉर्म का उपयोग करते हैं?": "Which social media platforms do you use for your business?",
    "Capture Enterprise GPS Location (Satellite Coordinates)": "Capture Enterprise GPS Location (Satellite Coordinates)",
    "उद्यम जीपीएस लोकेशन कैप्चर करें (उपग्रह निर्देशांक)": "Capture Enterprise GPS Location (Satellite Coordinates)",
    "Field Photo of Enterprise & Beneficiary": "Field Photo of Enterprise & Beneficiary",
    "उद्यम और लाभार्थी का फील्ड फोटो": "Field Photo of Enterprise & Beneficiary",
    "Respondent & Surveyor Digital Signature": "Respondent & Surveyor Digital Signature",
    "उत्तरदाता और सर्वेक्षक के डिजिटल हस्ताक्षर": "Respondent & Surveyor Digital Signature",
    "Yes": "Yes",
    "हाँ": "Yes",
    "No": "No",
    "नहीं": "No",
    "Baran": "Baran",
    "बारां": "Baran",
    "Churu": "Churu",
    "चूरू": "Churu",
    "Dausa": "Dausa",
    "दौसा": "Dausa",
    "Dungarpur": "Dungarpur",
    "डूंगरपुर": "Dungarpur",
    "Jodhpur": "Jodhpur",
    "जोधपुर": "Jodhpur",
    "Chhipabarod": "Chhipabarod",
    "छीपाबड़ौद": "Chhipabarod",
    "Kishanganj": "Kishanganj",
    "किशनगंज": "Kishanganj",
    "Sardar Sheher": "Sardar Sheher",
    "सरदारशहर": "Sardar Sheher",
    "Bidasar": "Bidasar",
    "बीदासर": "Bidasar",
    "Secundra": "Secundra",
    "सिकंदरा": "Secundra",
    "Sagwara": "Sagwara",
    "सागवाड़ा": "Sagwara",
    "Galiakot": "Galiakot",
    "गलियाकोट": "Galiakot",
    "Bicchiwada": "Bicchiwada",
    "बिछीवाड़ा": "Bicchiwada",
    "Jodhpur Block": "Jodhpur Block",
    "जोधपुर ब्लॉक": "Jodhpur Block",
    "Married": "Married",
    "विवाहित": "Married",
    "Single": "Single",
    "अविवाहित": "Single",
    "Widowed": "Widowed",
    "विधवा": "Widowed",
    "Divorced": "Divorced",
    "तलाकशुदा": "Divorced",
    "Separated": "Separated",
    "अलग रह रहे": "Separated",
    "General": "General",
    "सामान्य": "General",
    "OBC": "OBC",
    "अन्य पिछड़ा वर्ग (OBC)": "OBC",
    "SC": "SC",
    "अनुसूचित जाति (SC)": "SC",
    "ST": "ST",
    "अनुसूचित जनजाति (ST)": "ST",
    "Illiterate": "Illiterate",
    "निरक्षर / अनपढ़": "Illiterate",
    "Illiterate but able to calculate": "Illiterate but able to calculate",
    "अनपढ़ लेकिन हिसाब-किताब में सक्षम": "Illiterate but able to calculate",
    "5th pass": "5th pass",
    "5वीं पास": "5th pass",
    "8th pass": "8th pass",
    "8वीं पास": "8th pass",
    "10th pass": "10th pass",
    "10वीं पास": "10th pass",
    "12th pass": "12th pass",
    "12वीं पास": "12th pass",
    "Graduate": "Graduate",
    "स्नातक (Graduate)": "Graduate",
    "Self": "Self",
    "स्वयं": "Self",
    "Husband": "Husband",
    "पति": "Husband",
    "Son": "Son",
    "पुत्र / बेटा": "Son",
    "Daughter": "Daughter",
    "पुत्री / बेटी": "Daughter",
    "Member": "Member",
    "सामान्य सदस्य": "Member",
    "Leadership role": "Leadership role",
    "पदाधिकारी / नेतृत्व पद (अध्यक्ष/सचिव/कोषाध्यक्ष)": "Leadership role",
    "Grocery / Kirana": "Grocery / Kirana",
    "किराना दुकान": "Grocery / Kirana",
    "General store": "General store",
    "जनरल स्टोर": "General store",
    "Leather & footwear": "Leather & footwear",
    "चमड़ा व जूते-चप्पल": "Leather & footwear",
    "Flour mill": "Flour mill",
    "आटा चक्की": "Flour mill",
    "Tailoring & Stitching": "Tailoring & Stitching",
    "सिलाई व कढ़ाई केंद्र": "Tailoring & Stitching",
    "Apparel & Garments": "Apparel & Garments",
    "रेडीमेड वस्त्र": "Apparel & Garments",
    "Beauty parlour": "Beauty parlour",
    "ब्यूटी पार्लर": "Beauty parlour",
    "Handicraft": "Handicraft",
    "हस्तशिल्प / हैंडीक्राफ्ट": "Handicraft",
    "Dairy shop": "Dairy shop",
    "डेयरी व दूध केंद्र": "Dairy shop",
    "Auto-mechanic": "Auto-mechanic",
    "ऑटो मैकेनिक": "Auto-mechanic",
    "E-mitra": "E-mitra",
    "ई-मित्र केंद्र / ग्राहक सेवा केंद्र": "E-mitra",
    "Mobile repair shop": "Mobile repair shop",
    "मोबाइल रिपेयर दुकान": "Mobile repair shop",
    "Transport": "Transport",
    "परिवहन सेवा": "Transport",
    "Any other": "Any other",
    "अन्य कोई": "Any other",
    "Whatsapp": "Whatsapp",
    "व्हाट्सएप (WhatsApp)": "Whatsapp",
    "Facebook": "Facebook",
    "फेसबुक (Facebook)": "Facebook",
    "Instagram": "Instagram",
    "इंस्टाग्राम (Instagram)": "Instagram",
    "Don't use social media": "Don't use social media",
    "सोशल मीडिया का उपयोग नहीं करते": "Don't use social media",
    "Draft": "Draft",
    "Save Draft": "Save Draft",
    "ड्राफ्ट": "Draft",
    "मसुदा": "Draft",
    "ડ્રાફ્ટ": "Draft",
    "ਡਰਾਫਟ": "Draft",
    "খসড়া": "Draft",
    "வரைவு": "Draft",
    "చిత్తుప్రతి": "Draft",
    "ಕರಡು": "Draft",
    "ഡ്രാഫ്റ്റ്": "Draft",
    "ڈرافٹ": "Draft",
    "ड्राफ्ट सेव करें": "Save Draft",
    "मसुदा जतन करा": "Save Draft",
    "ડ્રાફ્ટ સાચવો": "Save Draft",
    "ਡਰਾਫਟ ਸੰਭਾਲੋ": "Save Draft",
    "খসড়া সংরক্ষণ": "Save Draft",
    "வரைவு சேமி": "Save Draft",
    "చిత్తుప్రతి భద్రపరచు": "Save Draft",
    "ಕರಡು ಉಳಿಸಿ": "Save Draft",
    "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക": "Save Draft",
    "ڈرافٹ محفوظ کریں": "Save Draft"
  },
  "hi": {
    "OmniServey": "ओमनीसर्वे",
    "ओमनीसर्वे": "ओमनीसर्वे",
    "Online": "ऑनलाइन",
    "ऑनलाइन": "ऑनलाइन",
    "Offline": "ऑफलाइन",
    "ऑफलाइन": "ऑफलाइन",
    "Surveys": "सर्वेक्षण",
    "सर्वेक्षण": "सर्वेक्षण",
    "WAL Queue": "कतार (ऑफलाइन)",
    "कतार (ऑफलाइन)": "कतार (ऑफलाइन)",
    "System": "सिस्टम",
    "सिस्टम": "सिस्टम",
    "Exit Form": "← बाहर निकलें",
    "← बाहर निकलें": "← बाहर निकलें",
    "Step": "चरण",
    "चरण": "चरण",
    "of": "का",
    "का": "का",
    "Pages": "पृष्ठ",
    "पृष्ठ": "पृष्ठ",
    "Questions": "प्रश्न",
    "प्रश्न": "प्रश्न",
    "Previous": "← पिछला",
    "← पिछला": "← पिछला",
    "Next": "अगला →",
    "अगला →": "अगला →",
    "Save Offline": "ऑफलाइन सेव करें",
    "ऑफलाइन सेव करें": "ऑफलाइन सेव करें",
    "Submit Survey": "सबमिट करें",
    "सबमिट करें": "सबमिट करें",
    "Capture GPS Coordinates": "जीपीएस लोकेशन रिकॉर्ड करें",
    "जीपीएस लोकेशन रिकॉर्ड करें": "जीपीएस लोकेशन रिकॉर्ड करें",
    "GPS Fix Acquired ✓": "जीपीएस लोकेशन प्राप्त हुआ ✓",
    "जीपीएस लोकेशन प्राप्त हुआ ✓": "जीपीएस लोकेशन प्राप्त हुआ ✓",
    "Take Photo / Choose File": "फोटो लें / फाइल चुनें",
    "फोटो लें / फाइल चुनें": "फोटो लें / फाइल चुनें",
    "Sign inside box with finger or stylus": "अपनी उंगली या स्टाइलस से बॉक्स में हस्ताक्षर करें",
    "अपनी उंगली या स्टाइलस से बॉक्स में हस्ताक्षर करें": "अपनी उंगली या स्टाइलस से बॉक्स में हस्ताक्षर करें",
    "Clear Signature": "हस्ताक्षर मिटाएं",
    "हस्ताक्षर मिटाएं": "हस्ताक्षर मिटाएं",
    "Signature Recorded": "हस्ताक्षर दर्ज हुआ",
    "हस्ताक्षर दर्ज हुआ": "हस्ताक्षर दर्ज हुआ",
    "Enter response here...": "यहाँ उत्तर दर्ज करें...",
    "यहाँ उत्तर दर्ज करें...": "यहाँ उत्तर दर्ज करें...",
    "Required Questions Pending": "आवश्यक प्रश्न अधूरे हैं",
    "आवश्यक प्रश्न अधूरे हैं": "आवश्यक प्रश्न अधूरे हैं",
    "Please fill in these required fields before final submission, or save as an offline draft anytime.": "अंतिम सबमिशन से पहले कृपया इन आवश्यक प्रश्नों को भरें, या कभी भी ऑफलाइन ड्राफ्ट के रूप में सुरक्षित करें।",
    "अंतिम सबमिशन से पहले कृपया इन आवश्यक प्रश्नों को भरें, या कभी भी ऑफलाइन ड्राफ्ट के रूप में सुरक्षित करें।": "अंतिम सबमिशन से पहले कृपया इन आवश्यक प्रश्नों को भरें, या कभी भी ऑफलाइन ड्राफ्ट के रूप में सुरक्षित करें।",
    "Go to First Pending Question": "👉 पहले अधूरे प्रश्न पर जाएं",
    "👉 पहले अधूरे प्रश्न पर जाएं": "👉 पहले अधूरे प्रश्न पर जाएं",
    "Save as Offline Draft Anyway": "ऑफलाइन ड्राफ्ट सुरक्षित करें",
    "💾 ऑफलाइन ड्राफ्ट सुरक्षित करें": "ऑफलाइन ड्राफ्ट सुरक्षित करें",
    "Close": "बंद करें",
    "बंद करें": "बंद करें",
    "Start Survey Form": "सर्वेक्षण शुरू करें",
    "सर्वेक्षण शुरू करें": "सर्वेक्षण शुरू करें",
    "Start Survey Form →": "सर्वेक्षण शुरू करें →",
    "सर्वेक्षण शुरू करें →": "सर्वेक्षण शुरू करें →",
    "Write-Ahead Log (WAL)": "राइट-अहेड लॉग (WAL कतार)",
    "राइट-अहेड लॉग (WAL कतार)": "राइट-अहेड लॉग (WAL कतार)",
    "Atomic zero-loss local storage queue": "शून्य डेटा हानि सुरक्षित स्थानीय भंडारण",
    "शून्य डेटा हानि सुरक्षित स्थानीय भंडारण": "शून्य डेटा हानि सुरक्षित स्थानीय भंडारण",
    "Sync Now": "⟳ अभी सिंक करें",
    "⟳ अभी सिंक करें": "⟳ अभी सिंक करें",
    "View on Map →": "नक्शे पर देखें →",
    "नक्शे पर देखें →": "नक्शे पर देखें →",
    "Re-acquire Fix": "पुनः प्रयास करें",
    "पुनः प्रयास करें": "पुनः प्रयास करें",
    "Section A: Basic Details": "भाग क: बुनियादी विवरण",
    "भाग क: बुनियादी विवरण": "भाग क: बुनियादी विवरण",
    "Section B: Respondent & Household Profile": "भाग ख: उत्तरदाता और परिवार की प्रोफ़ाइल",
    "भाग ख: उत्तरदाता और परिवार की प्रोफ़ाइल": "भाग ख: उत्तरदाता और परिवार की प्रोफ़ाइल",
    "Section C: Enterprise Operations & Finance": "भाग ग: उद्यम संचालन और वित्त",
    "भाग ग: उद्यम संचालन और वित्त": "भाग ग: उद्यम संचालन और वित्त",
    "Section D: Enterprise Challenges & Coping Mechanisms": "भाग घ: उद्यम चुनौतियाँ और समाधान",
    "भाग घ: उद्यम चुनौतियाँ और समाधान": "भाग घ: उद्यम चुनौतियाँ और समाधान",
    "Section E: Impact of SVEP / OSF Schemes": "भाग ङ: एसवीईपी / ओएसएफ योजनाओं का प्रभाव",
    "भाग ङ: एसवीईपी / ओएसएफ योजनाओं का प्रभाव": "भाग ङ: एसवीईपी / ओएसएफ योजनाओं का प्रभाव",
    "Section F: Digital Transactions & Social Media": "भाग च: डिजिटल लेन-देन और सोशल मीडिया",
    "भाग च: डिजिटल लेन-देन और सोशल मीडिया": "भाग च: डिजिटल लेन-देन और सोशल मीडिया",
    "Section G: Field Verification & Sign-off": "भाग छ: फील्ड सत्यापन और हस्ताक्षर",
    "भाग छ: फील्ड सत्यापन और हस्ताक्षर": "भाग छ: फील्ड सत्यापन और हस्ताक्षर",
    "District": "जिला",
    "जिला": "जिला",
    "Block / Tehsil": "ब्लॉक / तहसील",
    "ब्लॉक / तहसील": "ब्लॉक / तहसील",
    "Village / Gram Panchayat Name": "गाँव / ग्राम पंचायत का नाम",
    "गाँव / ग्राम पंचायत का नाम": "गाँव / ग्राम पंचायत का नाम",
    "Cluster Level Federation (CLF) Name": "क्लस्टर लेवल फेडरेशन (CLF) का नाम",
    "क्लस्टर लेवल फेडरेशन (CLF) का नाम": "क्लस्टर लेवल फेडरेशन (CLF) का नाम",
    "Village Organization (VO) Name": "ग्राम संगठन (VO) का नाम",
    "ग्राम संगठन (VO) का नाम": "ग्राम संगठन (VO) का नाम",
    "Self-Help Group (SHG) Name": "स्वयं सहायता समूह (SHG) का नाम",
    "स्वयं सहायता समूह (SHG) का नाम": "स्वयं सहायता समूह (SHG) का नाम",
    "Respondent Name": "उत्तरदाता का नाम",
    "उत्तरदाता का नाम": "उत्तरदाता का नाम",
    "Enterprise / Business Name": "उद्यम / व्यवसाय का नाम",
    "उद्यम / व्यवसाय का नाम": "उद्यम / व्यवसाय का नाम",
    "Year of Setting Up Enterprise": "उद्यम स्थापना का वर्ष",
    "उद्यम स्थापना का वर्ष": "उद्यम स्थापना का वर्ष",
    "Main Business Activity of the Enterprise": "उद्यम की मुख्य व्यावसायिक गतिविधि",
    "उद्यम की मुख्य व्यावसायिक गतिविधि": "उद्यम की मुख्य व्यावसायिक गतिविधि",
    "What is respondent's relation with SHG member?": "उत्तरदाता का एसएचजी सदस्य से क्या संबंध है?",
    "उत्तरदाता का एसएचजी सदस्य से क्या संबंध है?": "उत्तरदाता का एसएचजी सदस्य से क्या संबंध है?",
    "What is the age of SHG member?": "एसएचजी सदस्य की आयु क्या है?",
    "एसएचजी सदस्य की आयु क्या है?": "एसएचजी सदस्य की आयु क्या है?",
    "What is the marital status of the SHG member?": "एसएचजी सदस्य की वैवाहिक स्थिति क्या है?",
    "एसएचजी सदस्य की वैवाहिक स्थिति क्या है?": "एसएचजी सदस्य की वैवाहिक स्थिति क्या है?",
    "What is the social category / caste?": "सामाजिक श्रेणी / जाति क्या है?",
    "सामाजिक श्रेणी / जाति क्या है?": "सामाजिक श्रेणी / जाति क्या है?",
    "What is the education status of the SHG member?": "एसएचजी सदस्य की शैक्षणिक स्थिति क्या है?",
    "एसएचजी सदस्य की शैक्षणिक स्थिति क्या है?": "एसएचजी सदस्य की शैक्षणिक स्थिति क्या है?",
    "How many total members are in the family?": "परिवार में कुल कितने सदस्य हैं?",
    "परिवार में कुल कितने सदस्य हैं?": "परिवार में कुल कितने सदस्य हैं?",
    "What is your total annual household income?": "आपकी कुल वार्षिक पारिवारिक आय कितनी है?",
    "आपकी कुल वार्षिक पारिवारिक आय कितनी है?": "आपकी कुल वार्षिक पारिवारिक आय कितनी है?",
    "What is your role in the SHG?": "एसएचजी में आपकी भूमिका क्या है?",
    "एसएचजी में आपकी भूमिका क्या है?": "एसएचजी में आपकी भूमिका क्या है?",
    "Are you related to any of the SVEP / OSF CRP?": "क्या आप किसी SVEP / OSF CRP से संबंधित हैं?",
    "क्या आप किसी SVEP / OSF CRP से संबंधित हैं?": "क्या आप किसी SVEP / OSF CRP से संबंधित हैं?",
    "Who started the enterprise?": "उद्यम किसने शुरू किया था?",
    "उद्यम किसने शुरू किया था?": "उद्यम किसने शुरू किया था?",
    "Who operates and manages the enterprise on a daily basis?": "दैनिक आधार पर उद्यम का संचालन और प्रबंधन कौन करता है?",
    "दैनिक आधार पर उद्यम का संचालन और प्रबंधन कौन करता है?": "दैनिक आधार पर उद्यम का संचालन और प्रबंधन कौन करता है?",
    "For how many hours in a day does the shop/enterprise remain open?": "दिन में कितने घंटे दुकान/उद्यम खुला रहता है?",
    "दिन में कितने घंटे दुकान/उद्यम खुला रहता है?": "दिन में कितने घंटे दुकान/उद्यम खुला रहता है?",
    "What is the type of business place / premises?": "व्यावसायिक स्थान/परिसर का प्रकार क्या है?",
    "व्यावसायिक स्थान/परिसर का प्रकार क्या है?": "व्यावसायिक स्थान/परिसर का प्रकार क्या है?",
    "Does SHG member maintain written records of business transactions regularly?": "क्या एसएचजी सदस्य नियमित रूप से व्यावसायिक लेन-देन का लिखित रिकॉर्ड रखते हैं?",
    "क्या एसएचजी सदस्य नियमित रूप से व्यावसायिक लेन-देन का लिखित रिकॉर्ड रखते हैं?": "क्या एसएचजी सदस्य नियमित रूप से व्यावसायिक लेन-देन का लिखित रिकॉर्ड रखते हैं?",
    "In the first year of your enterprise, what was the amount of seed capital (Rs)?": "आपके उद्यम के पहले वर्ष में प्रारंभिक बीज पूंजी की राशि (रु) क्या थी?",
    "आपके उद्यम के पहले वर्ष में प्रारंभिक बीज पूंजी की राशि (रु) क्या थी?": "आपके उद्यम के पहले वर्ष में प्रारंभिक बीज पूंजी की राशि (रु) क्या थी?",
    "How do you manage working capital during peak season?": "पीक सीजन के दौरान आप कार्यशील पूंजी का प्रबंधन कैसे करते हैं?",
    "पीक सीजन के दौरान आप कार्यशील पूंजी का प्रबंधन कैसे करते हैं?": "पीक सीजन के दौरान आप कार्यशील पूंजी का प्रबंधन कैसे करते हैं?",
    "Is the location of your space convenient for your business?": "क्या आपके स्थान की स्थिति आपके व्यवसाय के लिए सुविधाजनक है?",
    "क्या आपके स्थान की स्थिति आपके व्यवसाय के लिए सुविधाजनक है?": "क्या आपके स्थान की स्थिति आपके व्यवसाय के लिए सुविधाजनक है?",
    "Are you satisfied and happy with your wholesale supplier?": "क्या आप अपने थोक सप्लायर से संतुष्ट और खुश हैं?",
    "क्या आप अपने थोक सप्लायर से संतुष्ट और खुश हैं?": "क्या आप अपने थोक सप्लायर से संतुष्ट और खुश हैं?",
    "Are you able to recover credit / money from your customers?": "क्या आप अपने ग्राहकों से उधारी/पैसा वसूल पाते हैं?",
    "क्या आप अपने ग्राहकों से उधारी/पैसा वसूल पाते हैं?": "क्या आप अपने ग्राहकों से उधारी/पैसा वसूल पाते हैं?",
    "Do you source raw materials/goods from market independently?": "क्या आप बाजार से स्वतंत्र रूप से कच्चा माल/सामान लाते हैं?",
    "क्या आप बाजार से स्वतंत्र रूप से कच्चा माल/सामान लाते हैं?": "क्या आप बाजार से स्वतंत्र रूप से कच्चा माल/सामान लाते हैं?",
    "Do you have easy access to loans from different sources?": "क्या आपको विभिन्न स्रोतों से ऋण की आसान पहुँच प्राप्त है?",
    "क्या आपको विभिन्न स्रोतों से ऋण की आसान पहुँच प्राप्त है?": "क्या आपको विभिन्न स्रोतों से ऋण की आसान पहुँच प्राप्त है?",
    "How much loan amount have you availed under SVEP / OSF scheme (Rs)?": "आपने SVEP / OSF योजना के तहत कितनी ऋण राशि प्राप्त की है (रु)?",
    "आपने SVEP / OSF योजना के तहत कितनी ऋण राशि प्राप्त की है (रु)?": "आपने SVEP / OSF योजना के तहत कितनी ऋण राशि प्राप्त की है (रु)?",
    "How did you utilize the enterprise loan?": "आपने उद्यम ऋण का उपयोग किस प्रकार किया?",
    "आपने उद्यम ऋण का उपयोग किस प्रकार किया?": "आपने उद्यम ऋण का उपयोग किस प्रकार किया?",
    "Monthly enterprise income BEFORE availing loan changes (Rs)?": "ऋण से बदलाव करने से पहले उद्यम की मासिक आय (रु)?",
    "ऋण से बदलाव करने से पहले उद्यम की मासिक आय (रु)?": "ऋण से बदलाव करने से पहले उद्यम की मासिक आय (रु)?",
    "Monthly enterprise income AFTER availing loan changes (Rs)?": "ऋण से बदलाव करने के बाद उद्यम की मासिक आय (रु)?",
    "ऋण से बदलाव करने के बाद उद्यम की मासिक आय (रु)?": "ऋण से बदलाव करने के बाद उद्यम की मासिक आय (रु)?",
    "What has been the contribution of SVEP / OSF CRPs?": "SVEP / OSF CRP का क्या योगदान रहा है?",
    "SVEP / OSF CRP का क्या योगदान रहा है?": "SVEP / OSF CRP का क्या योगदान रहा है?",
    "Does the woman entrepreneur own a smartphone?": "क्या महिला उद्यमी के पास स्मार्टफोन है?",
    "क्या महिला उद्यमी के पास स्मार्टफोन है?": "क्या महिला उद्यमी के पास स्मार्टफोन है?",
    "Do you use QR code / UPI / mobile banking for business transactions?": "क्या आप व्यावसायिक लेन-देन के लिए क्यूआर कोड / यूपीआई / मोबाइल बैंकिंग का उपयोग करते हैं?",
    "क्या आप व्यावसायिक लेन-देन के लिए क्यूआर कोड / यूपीआई / मोबाइल बैंकिंग का उपयोग करते हैं?": "क्या आप व्यावसायिक लेन-देन के लिए क्यूआर कोड / यूपीआई / मोबाइल बैंकिंग का उपयोग करते हैं?",
    "Daily how many transactions are done via QR code / UPI?": "प्रतिदिन क्यूआर कोड / यूपीआई द्वारा कितने लेन-देन होते हैं?",
    "प्रतिदिन क्यूआर कोड / यूपीआई द्वारा कितने लेन-देन होते हैं?": "प्रतिदिन क्यूआर कोड / यूपीआई द्वारा कितने लेन-देन होते हैं?",
    "Which social media platforms do you use for your business?": "आप अपने व्यवसाय के लिए किन सोशल मीडिया प्लेटफॉर्म का उपयोग करते हैं?",
    "आप अपने व्यवसाय के लिए किन सोशल मीडिया प्लेटफॉर्म का उपयोग करते हैं?": "आप अपने व्यवसाय के लिए किन सोशल मीडिया प्लेटफॉर्म का उपयोग करते हैं?",
    "Capture Enterprise GPS Location (Satellite Coordinates)": "उद्यम जीपीएस लोकेशन कैप्चर करें (उपग्रह निर्देशांक)",
    "उद्यम जीपीएस लोकेशन कैप्चर करें (उपग्रह निर्देशांक)": "उद्यम जीपीएस लोकेशन कैप्चर करें (उपग्रह निर्देशांक)",
    "Field Photo of Enterprise & Beneficiary": "उद्यम और लाभार्थी का फील्ड फोटो",
    "उद्यम और लाभार्थी का फील्ड फोटो": "उद्यम और लाभार्थी का फील्ड फोटो",
    "Respondent & Surveyor Digital Signature": "उत्तरदाता और सर्वेक्षक के डिजिटल हस्ताक्षर",
    "उत्तरदाता और सर्वेक्षक के डिजिटल हस्ताक्षर": "उत्तरदाता और सर्वेक्षक के डिजिटल हस्ताक्षर",
    "Yes": "हाँ",
    "हाँ": "हाँ",
    "No": "नहीं",
    "नहीं": "नहीं",
    "Baran": "बारां",
    "बारां": "बारां",
    "Churu": "चूरू",
    "चूरू": "चूरू",
    "Dausa": "दौसा",
    "दौसा": "दौसा",
    "Dungarpur": "डूंगरपुर",
    "डूंगरपुर": "डूंगरपुर",
    "Jodhpur": "जोधपुर",
    "जोधपुर": "जोधपुर",
    "Chhipabarod": "छीपाबड़ौद",
    "छीपाबड़ौद": "छीपाबड़ौद",
    "Kishanganj": "किशनगंज",
    "किशनगंज": "किशनगंज",
    "Sardar Sheher": "सरदारशहर",
    "सरदारशहर": "सरदारशहर",
    "Bidasar": "बीदासर",
    "बीदासर": "बीदासर",
    "Secundra": "सिकंदरा",
    "सिकंदरा": "सिकंदरा",
    "Sagwara": "सागवाड़ा",
    "सागवाड़ा": "सागवाड़ा",
    "Galiakot": "गलियाकोट",
    "गलियाकोट": "गलियाकोट",
    "Bicchiwada": "बिछीवाड़ा",
    "बिछीवाड़ा": "बिछीवाड़ा",
    "Jodhpur Block": "जोधपुर ब्लॉक",
    "जोधपुर ब्लॉक": "जोधपुर ब्लॉक",
    "Married": "विवाहित",
    "विवाहित": "विवाहित",
    "Single": "अविवाहित",
    "अविवाहित": "अविवाहित",
    "Widowed": "विधवा",
    "विधवा": "विधवा",
    "Divorced": "तलाकशुदा",
    "तलाकशुदा": "तलाकशुदा",
    "Separated": "अलग रह रहे",
    "अलग रह रहे": "अलग रह रहे",
    "General": "सामान्य",
    "सामान्य": "सामान्य",
    "OBC": "अन्य पिछड़ा वर्ग (OBC)",
    "अन्य पिछड़ा वर्ग (OBC)": "अन्य पिछड़ा वर्ग (OBC)",
    "SC": "अनुसूचित जाति (SC)",
    "अनुसूचित जाति (SC)": "अनुसूचित जाति (SC)",
    "ST": "अनुसूचित जनजाति (ST)",
    "अनुसूचित जनजाति (ST)": "अनुसूचित जनजाति (ST)",
    "Illiterate": "निरक्षर / अनपढ़",
    "निरक्षर / अनपढ़": "निरक्षर / अनपढ़",
    "Illiterate but able to calculate": "अनपढ़ लेकिन हिसाब-किताब में सक्षम",
    "अनपढ़ लेकिन हिसाब-किताब में सक्षम": "अनपढ़ लेकिन हिसाब-किताब में सक्षम",
    "5th pass": "5वीं पास",
    "5वीं पास": "5वीं पास",
    "8th pass": "8वीं पास",
    "8वीं पास": "8वीं पास",
    "10th pass": "10वीं पास",
    "10वीं पास": "10वीं पास",
    "12th pass": "12वीं पास",
    "12वीं पास": "12वीं पास",
    "Graduate": "स्नातक (Graduate)",
    "स्नातक (Graduate)": "स्नातक (Graduate)",
    "Self": "स्वयं",
    "स्वयं": "स्वयं",
    "Husband": "पति",
    "पति": "पति",
    "Son": "पुत्र / बेटा",
    "पुत्र / बेटा": "पुत्र / बेटा",
    "Daughter": "पुत्री / बेटी",
    "पुत्री / बेटी": "पुत्री / बेटी",
    "Member": "सामान्य सदस्य",
    "सामान्य सदस्य": "सामान्य सदस्य",
    "Leadership role": "पदाधिकारी / नेतृत्व पद (अध्यक्ष/सचिव/कोषाध्यक्ष)",
    "पदाधिकारी / नेतृत्व पद (अध्यक्ष/सचिव/कोषाध्यक्ष)": "पदाधिकारी / नेतृत्व पद (अध्यक्ष/सचिव/कोषाध्यक्ष)",
    "Grocery / Kirana": "किराना दुकान",
    "किराना दुकान": "किराना दुकान",
    "General store": "जनरल स्टोर",
    "जनरल स्टोर": "जनरल स्टोर",
    "Leather & footwear": "चमड़ा व जूते-चप्पल",
    "चमड़ा व जूते-चप्पल": "चमड़ा व जूते-चप्पल",
    "Flour mill": "आटा चक्की",
    "आटा चक्की": "आटा चक्की",
    "Tailoring & Stitching": "सिलाई व कढ़ाई केंद्र",
    "सिलाई व कढ़ाई केंद्र": "सिलाई व कढ़ाई केंद्र",
    "Apparel & Garments": "रेडीमेड वस्त्र",
    "रेडीमेड वस्त्र": "रेडीमेड वस्त्र",
    "Beauty parlour": "ब्यूटी पार्लर",
    "ब्यूटी पार्लर": "ब्यूटी पार्लर",
    "Handicraft": "हस्तशिल्प / हैंडीक्राफ्ट",
    "हस्तशिल्प / हैंडीक्राफ्ट": "हस्तशिल्प / हैंडीक्राफ्ट",
    "Dairy shop": "डेयरी व दूध केंद्र",
    "डेयरी व दूध केंद्र": "डेयरी व दूध केंद्र",
    "Auto-mechanic": "ऑटो मैकेनिक",
    "ऑटो मैकेनिक": "ऑटो मैकेनिक",
    "E-mitra": "ई-मित्र केंद्र / ग्राहक सेवा केंद्र",
    "ई-मित्र केंद्र / ग्राहक सेवा केंद्र": "ई-मित्र केंद्र / ग्राहक सेवा केंद्र",
    "Mobile repair shop": "मोबाइल रिपेयर दुकान",
    "मोबाइल रिपेयर दुकान": "मोबाइल रिपेयर दुकान",
    "Transport": "परिवहन सेवा",
    "परिवहन सेवा": "परिवहन सेवा",
    "Any other": "अन्य कोई",
    "अन्य कोई": "अन्य कोई",
    "Whatsapp": "व्हाट्सएप (WhatsApp)",
    "व्हाट्सएप (WhatsApp)": "व्हाट्सएप (WhatsApp)",
    "Facebook": "फेसबुक (Facebook)",
    "फेसबुक (Facebook)": "फेसबुक (Facebook)",
    "Instagram": "इंस्टाग्राम (Instagram)",
    "इंस्टाग्राम (Instagram)": "इंस्टाग्राम (Instagram)",
    "Don't use social media": "सोशल मीडिया का उपयोग नहीं करते",
    "सोशल मीडिया का उपयोग नहीं करते": "सोशल मीडिया का उपयोग नहीं करते",
    "Draft": "ड्राफ्ट",
    "Save Draft": "ड्राफ्ट सेव करें",
    "ड्राफ्ट": "ड्राफ्ट",
    "मसुदा": "ड्राफ्ट",
    "ડ્રાફ્ટ": "ड्राफ्ट",
    "ਡਰਾਫਟ": "ड्राफ्ट",
    "খসড়া": "ड्राफ्ट",
    "வரைவு": "ड्राफ्ट",
    "చిత్తుప్రతి": "ड्राफ्ट",
    "ಕರಡು": "ड्राफ्ट",
    "ഡ്രാഫ്റ്റ്": "ड्राफ्ट",
    "ڈرافٹ": "ड्राफ्ट",
    "ड्राफ्ट सेव करें": "ड्राफ्ट सेव करें",
    "मसुदा जतन करा": "ड्राफ्ट सेव करें",
    "ડ્રાફ્ટ સાચવો": "ड्राफ्ट सेव करें",
    "ਡਰਾਫਟ ਸੰਭਾਲੋ": "ड्राफ्ट सेव करें",
    "খসড়া সংরক্ষণ": "ड्राफ्ट सेव करें",
    "வரைவு சேமி": "ड्राफ्ट सेव करें",
    "చిత్తుప్రతి భద్రపరచు": "ड्राफ्ट सेव करें",
    "ಕರಡು ಉಳಿಸಿ": "ड्राफ्ट सेव करें",
    "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക": "ड्राफ्ट सेव करें",
    "ڈرافٹ محفوظ کریں": "ड्राफ्ट सेव करें"
  },
  "mr": {
    "OmniServey": "ओम्नीसर्व्हे",
    "ओमनीसर्वे": "ओम्नीसर्व्हे",
    "Online": "ऑनलाइन",
    "ऑनलाइन": "ऑनलाइन",
    "Offline": "ऑफलाइन",
    "ऑफलाइन": "ऑफलाइन",
    "Surveys": "सर्वेक्षण",
    "सर्वेक्षण": "सर्वेक्षण",
    "WAL Queue": "रांग (ऑफलाइन)",
    "कतार (ऑफलाइन)": "रांग (ऑफलाइन)",
    "System": "प्रणाली",
    "सिस्टम": "प्रणाली",
    "Exit Form": "← बाहेर पडा",
    "← बाहर निकलें": "← बाहेर पडा",
    "Step": "टप्पा",
    "चरण": "टप्पा",
    "of": "पैकी",
    "का": "पैकी",
    "Pages": "पृष्ठे",
    "पृष्ठ": "पृष्ठे",
    "Questions": "प्रश्न",
    "प्रश्न": "प्रश्न",
    "Previous": "← मागील",
    "← पिछला": "← मागील",
    "Next": "पुढील →",
    "अगला →": "पुढील →",
    "Save Offline": "ऑफलाइन जतन करा",
    "ऑफलाइन सेव करें": "ऑफलाइन जतन करा",
    "Submit Survey": "सबमिट करा",
    "सबमिट करें": "सबमिट करा",
    "Capture GPS Coordinates": "जीपीएस स्थान नोंदवा",
    "जीपीएस लोकेशन रिकॉर्ड करें": "जीपीएस स्थान नोंदवा",
    "GPS Fix Acquired ✓": "जीपीएस स्थान प्राप्त झाले ✓",
    "जीपीएस लोकेशन प्राप्त हुआ ✓": "जीपीएस स्थान प्राप्त झाले ✓",
    "Take Photo / Choose File": "फोटो घ्या / फाईल निवडा",
    "फोटो लें / फाइल चुनें": "फोटो घ्या / फाईल निवडा",
    "Sign inside box with finger or stylus": "आपल्या बोटाने किंवा स्टायलसने बॉक्समध्ये स्वाक्षरी करा",
    "अपनी उंगली या स्टाइलस से बॉक्स में हस्ताक्षर करें": "आपल्या बोटाने किंवा स्टायलसने बॉक्समध्ये स्वाक्षरी करा",
    "Clear Signature": "स्वाक्षरी पुसा",
    "हस्ताक्षर मिटाएं": "स्वाक्षरी पुसा",
    "Signature Recorded": "स्वाक्षरी नोंदवली",
    "हस्ताक्षर दर्ज हुआ": "स्वाक्षरी नोंदवली",
    "Enter response here...": "येथे उत्तर प्रविष्ट करा...",
    "यहाँ उत्तर दर्ज करें...": "येथे उत्तर प्रविष्ट करा...",
    "Required Questions Pending": "आवश्यक प्रश्न अपूर्ण आहेत",
    "आवश्यक प्रश्न अधूरे हैं": "आवश्यक प्रश्न अपूर्ण आहेत",
    "Please fill in these required fields before final submission, or save as an offline draft anytime.": "अंतिम सबमिशनपूर्वी कृपया हे आवश्यक प्रश्न भरा, किंवा कधीही ऑफलाइन मसुदा म्हणून जतन करा.",
    "अंतिम सबमिशन से पहले कृपया इन आवश्यक प्रश्नों को भरें, या कभी भी ऑफलाइन ड्राफ्ट के रूप में सुरक्षित करें।": "अंतिम सबमिशनपूर्वी कृपया हे आवश्यक प्रश्न भरा, किंवा कधीही ऑफलाइन मसुदा म्हणून जतन करा.",
    "Go to First Pending Question": "👉 पहिल्या अपूर्ण प्रश्नावर जा",
    "👉 पहले अधूरे प्रश्न पर जाएं": "👉 पहिल्या अपूर्ण प्रश्नावर जा",
    "Save as Offline Draft Anyway": "ऑफलाइन मसुदा जतन करा",
    "💾 ऑफलाइन ड्राफ्ट सुरक्षित करें": "ऑफलाइन मसुदा जतन करा",
    "Close": "बंद करा",
    "बंद करें": "बंद करा",
    "Start Survey Form": "सर्वेक्षण सुरू करा",
    "सर्वेक्षण शुरू करें": "सर्वेक्षण सुरू करा",
    "Start Survey Form →": "सर्वेक्षण सुरू करा →",
    "सर्वेक्षण शुरू करें →": "सर्वेक्षण सुरू करा →",
    "Write-Ahead Log (WAL)": "राइट-अहेड लॉग (WAL रांग)",
    "राइट-अहेड लॉग (WAL कतार)": "राइट-अहेड लॉग (WAL रांग)",
    "Atomic zero-loss local storage queue": "शून्य डेटा हानी सुरक्षित स्थानिक साठवण",
    "शून्य डेटा हानि सुरक्षित स्थानीय भंडारण": "शून्य डेटा हानी सुरक्षित स्थानिक साठवण",
    "Sync Now": "⟳ आता सिंक करा",
    "⟳ अभी सिंक करें": "⟳ आता सिंक करा",
    "View on Map →": "नక्शावर पहा →",
    "नक्शे पर देखें →": "नక्शावर पहा →",
    "Re-acquire Fix": "पुन्हा प्रयत्न करा",
    "पुनः प्रयास करें": "पुन्हा प्रयत्न करा",
    "Section A: Basic Details": "विभाग अ: मूलभूत तपशील",
    "भाग क: बुनियादी विवरण": "विभाग अ: मूलभूत तपशील",
    "Section B: Respondent & Household Profile": "विभाग ब: उत्तरदाता आणि कुटुंब प्रोफाइल",
    "भाग ख: उत्तरदाता और परिवार की प्रोफ़ाइल": "विभाग ब: उत्तरदाता आणि कुटुंब प्रोफाइल",
    "Section C: Enterprise Operations & Finance": "विभाग क: व्यवसाय संचालन आणि वित्त",
    "भाग ग: उद्यम संचालन और वित्त": "विभाग क: व्यवसाय संचालन आणि वित्त",
    "Section D: Enterprise Challenges & Coping Mechanisms": "विभाग ड: व्यवसाय आव्हाने आणि उपाय",
    "भाग घ: उद्यम चुनौतियाँ और समाधान": "विभाग ड: व्यवसाय आव्हाने आणि उपाय",
    "Section E: Impact of SVEP / OSF Schemes": "विभाग इ: एसव्हीईपी / ओएसएफ योजनांचा प्रभाव",
    "भाग ङ: एसवीईपी / ओएसएफ योजनाओं का प्रभाव": "विभाग इ: एसव्हीईपी / ओएसएफ योजनांचा प्रभाव",
    "Section F: Digital Transactions & Social Media": "विभाग फ: डिजिटल व्यवहार आणि सोशल मीडिया",
    "भाग च: डिजिटल लेन-देन और सोशल मीडिया": "विभाग फ: डिजिटल व्यवहार आणि सोशल मीडिया",
    "Section G: Field Verification & Sign-off": "विभाग ग: फील्ड पडताळणी आणि स्वाक्षरी",
    "भाग छ: फील्ड सत्यापन और हस्ताक्षर": "विभाग ग: फील्ड पडताळणी आणि स्वाक्षरी",
    "District": "जिल्हा",
    "जिला": "जिल्हा",
    "Block / Tehsil": "तालुका / ब्लॉक",
    "ब्लॉक / तहसील": "तालुका / ब्लॉक",
    "Village / Gram Panchayat Name": "गाव / ग्रामपंचायतीचे नाव",
    "गाँव / ग्राम पंचायत का नाम": "गाव / ग्रामपंचायतीचे नाव",
    "Cluster Level Federation (CLF) Name": "क्लस्टर लेव्हल फेडरेशन (CLF) चे नाव",
    "क्लस्टर लेवल फेडरेशन (CLF) का नाम": "क्लस्टर लेव्हल फेडरेशन (CLF) चे नाव",
    "Village Organization (VO) Name": "ग्राम संघटना (VO) चे नाव",
    "ग्राम संगठन (VO) का नाम": "ग्राम संघटना (VO) चे नाव",
    "Self-Help Group (SHG) Name": "स्वयंसहाय्यता गट (SHG) चे नाव",
    "स्वयं सहायता समूह (SHG) का नाम": "स्वयंसहाय्यता गट (SHG) चे नाव",
    "Respondent Name": "उत्तरदात्याचे नाव",
    "उत्तरदाता का नाम": "उत्तरदात्याचे नाव",
    "Enterprise / Business Name": "उद्योग / व्यवसायाचे नाव",
    "उद्यम / व्यवसाय का नाम": "उद्योग / व्यवसायाचे नाव",
    "Year of Setting Up Enterprise": "उद्योग स्थापनेचे वर्ष",
    "उद्यम स्थापना का वर्ष": "उद्योग स्थापनेचे वर्ष",
    "Main Business Activity of the Enterprise": "उद्योगाची मुख्य व्यावसायिक क्रियाकलाप",
    "उद्यम की मुख्य व्यावसायिक गतिविधि": "उद्योगाची मुख्य व्यावसायिक क्रियाकलाप",
    "What is respondent's relation with SHG member?": "उत्तरदात्याचे बचत गट सदस्याशी काय नाते आहे?",
    "उत्तरदाता का एसएचजी सदस्य से क्या संबंध है?": "उत्तरदात्याचे बचत गट सदस्याशी काय नाते आहे?",
    "What is the age of SHG member?": "बचत गट सदस्याचे वय काय आहे?",
    "एसएचजी सदस्य की आयु क्या है?": "बचत गट सदस्याचे वय काय आहे?",
    "What is the marital status of the SHG member?": "बचत गट सदस्याची वैवाहिक स्थिती काय आहे?",
    "एसएचजी सदस्य की वैवाहिक स्थिति क्या है?": "बचत गट सदस्याची वैवाहिक स्थिती काय आहे?",
    "What is the social category / caste?": "सामाजिक प्रवर्ग / जात कोणती?",
    "सामाजिक श्रेणी / जाति क्या है?": "सामाजिक प्रवर्ग / जात कोणती?",
    "What is the education status of the SHG member?": "बचत गट सदस्याची शैक्षणिक पात्रता काय आहे?",
    "एसएचजी सदस्य की शैक्षणिक स्थिति क्या है?": "बचत गट सदस्याची शैक्षणिक पात्रता काय आहे?",
    "How many total members are in the family?": "कुटुंबात एकूण किती सदस्य आहेत?",
    "परिवार में कुल कितने सदस्य हैं?": "कुटुंबात एकूण किती सदस्य आहेत?",
    "What is your total annual household income?": "तुमचे एकूण वार्षिक कौटुंबिक उत्पन्न किती आहे?",
    "आपकी कुल वार्षिक पारिवारिक आय कितनी है?": "तुमचे एकूण वार्षिक कौटुंबिक उत्पन्न किती आहे?",
    "What is your role in the SHG?": "बचत गटात तुमची भूमिका काय आहे?",
    "एसएचजी में आपकी भूमिका क्या है?": "बचत गटात तुमची भूमिका काय आहे?",
    "Are you related to any of the SVEP / OSF CRP?": "तुम्ही कोणत्याही SVEP / OSF CRP शी संबंधित आहात का?",
    "क्या आप किसी SVEP / OSF CRP से संबंधित हैं?": "तुम्ही कोणत्याही SVEP / OSF CRP शी संबंधित आहात का?",
    "Who started the enterprise?": "व्यवसाय कोणी सुरू केला?",
    "उद्यम किसने शुरू किया था?": "व्यवसाय कोणी सुरू केला?",
    "Who operates and manages the enterprise on a daily basis?": "दररोज व्यवसायाचे व्यवस्थापन कोण करते?",
    "दैनिक आधार पर उद्यम का संचालन और प्रबंधन कौन करता है?": "दररोज व्यवसायाचे व्यवस्थापन कोण करते?",
    "For how many hours in a day does the shop/enterprise remain open?": "दिवसात दुकान/व्यवसाय किती तास चालू असतो?",
    "दिन में कितने घंटे दुकान/उद्यम खुला रहता है?": "दिवसात दुकान/व्यवसाय किती तास चालू असतो?",
    "What is the type of business place / premises?": "व्यवसाय जागेचा प्रकार कोणता आहे?",
    "व्यावसायिक स्थान/परिसर का प्रकार क्या है?": "व्यवसाय जागेचा प्रकार कोणता आहे?",
    "Does SHG member maintain written records of business transactions regularly?": "बचत गट सदस्य नियमितपणे व्यावसायिक व्यवहारांची लेखी नोंद ठेवतात का?",
    "क्या एसएचजी सदस्य नियमित रूप से व्यावसायिक लेन-देन का लिखित रिकॉर्ड रखते हैं?": "बचत गट सदस्य नियमितपणे व्यावसायिक व्यवहारांची लेखी नोंद ठेवतात का?",
    "In the first year of your enterprise, what was the amount of seed capital (Rs)?": "तुमच्या व्यवसायाच्या पहिल्या वर्षी प्राथमिक भांडवल (रु) किती होते?",
    "आपके उद्यम के पहले वर्ष में प्रारंभिक बीज पूंजी की राशि (रु) क्या थी?": "तुमच्या व्यवसायाच्या पहिल्या वर्षी प्राथमिक भांडवल (रु) किती होते?",
    "How do you manage working capital during peak season?": "पीक सीझनमध्ये तुम्ही खेळत्या भांडवलाचे व्यवस्थापन कसे करता?",
    "पीक सीजन के दौरान आप कार्यशील पूंजी का प्रबंधन कैसे करते हैं?": "पीक सीझनमध्ये तुम्ही खेळत्या भांडवलाचे व्यवस्थापन कसे करता?",
    "Is the location of your space convenient for your business?": "तुमच्या जागेचे स्थान व्यवसायासाठी सोयीचे आहे का?",
    "क्या आपके स्थान की स्थिति आपके व्यवसाय के लिए सुविधाजनक है?": "तुमच्या जागेचे स्थान व्यवसायासाठी सोयीचे आहे का?",
    "Are you satisfied and happy with your wholesale supplier?": "तुम्ही तुमच्या घाऊक पुरवठादारावर समाधानी आहात का?",
    "क्या आप अपने थोक सप्लायर से संतुष्ट और खुश हैं?": "तुम्ही तुमच्या घाऊक पुरवठादारावर समाधानी आहात का?",
    "Are you able to recover credit / money from your customers?": "तुम्ही ग्राहकांकडून उधारी/पैसे वसूल करू शकता का?",
    "क्या आप अपने ग्राहकों से उधारी/पैसा वसूल पाते हैं?": "तुम्ही ग्राहकांकडून उधारी/पैसे वसूल करू शकता का?",
    "Do you source raw materials/goods from market independently?": "तुम्ही बाजारातून स्वतंत्रपणे कच्चा माल आणता का?",
    "क्या आप बाजार से स्वतंत्र रूप से कच्चा माल/सामान लाते हैं?": "तुम्ही बाजारातून स्वतंत्रपणे कच्चा माल आणता का?",
    "Do you have easy access to loans from different sources?": "तुम्हाला विविध स्त्रोतांकडून सुलभ कर्ज उपलब्ध आहे का?",
    "क्या आपको विभिन्न स्रोतों से ऋण की आसान पहुँच प्राप्त है?": "तुम्हाला विविध स्त्रोतांकडून सुलभ कर्ज उपलब्ध आहे का?",
    "How much loan amount have you availed under SVEP / OSF scheme (Rs)?": "तुम्ही SVEP / OSF योजनेअंतर्गत किती कर्ज रक्कम घेतली आहे (रु)?",
    "आपने SVEP / OSF योजना के तहत कितनी ऋण राशि प्राप्त की है (रु)?": "तुम्ही SVEP / OSF योजनेअंतर्गत किती कर्ज रक्कम घेतली आहे (रु)?",
    "How did you utilize the enterprise loan?": "तुम्ही व्यवसाय कर्जाचा वापर कसा केला?",
    "आपने उद्यम ऋण का उपयोग किस प्रकार किया?": "तुम्ही व्यवसाय कर्जाचा वापर कसा केला?",
    "Monthly enterprise income BEFORE availing loan changes (Rs)?": "कर्ज घेण्यापूर्वी व्यवसायाचे मासिक उत्पन्न (रु)?",
    "ऋण से बदलाव करने से पहले उद्यम की मासिक आय (रु)?": "कर्ज घेण्यापूर्वी व्यवसायाचे मासिक उत्पन्न (रु)?",
    "Monthly enterprise income AFTER availing loan changes (Rs)?": "कर्ज घेतल्यानंतर व्यवसायाचे मासिक उत्पन्न (रु)?",
    "ऋण से बदलाव करने के बाद उद्यम की मासिक आय (रु)?": "कर्ज घेतल्यानंतर व्यवसायाचे मासिक उत्पन्न (रु)?",
    "What has been the contribution of SVEP / OSF CRPs?": "SVEP / OSF CRP चे काय योगदान राहिले आहे?",
    "SVEP / OSF CRP का क्या योगदान रहा है?": "SVEP / OSF CRP चे काय योगदान राहिले आहे?",
    "Does the woman entrepreneur own a smartphone?": "महिला उद्योजिकेकडे स्मार्टफोन आहे का?",
    "क्या महिला उद्यमी के पास स्मार्टफोन है?": "महिला उद्योजिकेकडे स्मार्टफोन आहे का?",
    "Do you use QR code / UPI / mobile banking for business transactions?": "तुम्ही व्यावसायिक व्यवहारांसाठी QR कोड / UPI / मोबाइल बँकिंग वापरता का?",
    "क्या आप व्यावसायिक लेन-देन के लिए क्यूआर कोड / यूपीआई / मोबाइल बैंकिंग का उपयोग करते हैं?": "तुम्ही व्यावसायिक व्यवहारांसाठी QR कोड / UPI / मोबाइल बँकिंग वापरता का?",
    "Daily how many transactions are done via QR code / UPI?": "दररोज QR कोड / UPI द्वारे किती व्यवहार होतात?",
    "प्रतिदिन क्यूआर कोड / यूपीआई द्वारा कितने लेन-देन होते हैं?": "दररोज QR कोड / UPI द्वारे किती व्यवहार होतात?",
    "Which social media platforms do you use for your business?": "तुम्ही व्यवसायासाठी कोणते सोशल मीडिया प्लॅटफॉर्म वापरता?",
    "आप अपने व्यवसाय के लिए किन सोशल मीडिया प्लेटफॉर्म का उपयोग करते हैं?": "तुम्ही व्यवसायासाठी कोणते सोशल मीडिया प्लॅटफॉर्म वापरता?",
    "Capture Enterprise GPS Location (Satellite Coordinates)": "उद्योग जीपीएस स्थान कॅप्चर करा (उपग्रह निर्देशांक)",
    "उद्यम जीपीएस लोकेशन कैप्चर करें (उपग्रह निर्देशांक)": "उद्योग जीपीएस स्थान कॅप्चर करा (उपग्रह निर्देशांक)",
    "Field Photo of Enterprise & Beneficiary": "उद्योग आणि लाभार्थीचा फील्ड फोटो",
    "उद्यम और लाभार्थी का फील्ड फोटो": "उद्योग आणि लाभार्थीचा फील्ड फोटो",
    "Respondent & Surveyor Digital Signature": "उत्तरदाता आणि सर्वेक्षकाची डिजिटल स्वाक्षरी",
    "उत्तरदाता और सर्वेक्षक के डिजिटल हस्ताक्षर": "उत्तरदाता आणि सर्वेक्षकाची डिजिटल स्वाक्षरी",
    "Yes": "होय",
    "हाँ": "होय",
    "No": "नाही",
    "नहीं": "नाही",
    "Baran": "बारां",
    "बारां": "बारां",
    "Churu": "चुरू",
    "चूरू": "चुरू",
    "Dausa": "दौसा",
    "दौसा": "दौसा",
    "Dungarpur": "डुंगरपूर",
    "डूंगरपुर": "डुंगरपूर",
    "Jodhpur": "जोधपूर",
    "जोधपुर": "जोधपूर",
    "Chhipabarod": "छीपाबडौद",
    "छीपाबड़ौद": "छीपाबडौद",
    "Kishanganj": "किशनगंज",
    "किशनगंज": "किशनगंज",
    "Sardar Sheher": "सरदारशहर",
    "सरदारशहर": "सरदारशहर",
    "Bidasar": "बिदासर",
    "बीदासर": "बिदासर",
    "Secundra": "सिकंदरा",
    "सिकंदरा": "सिकंदरा",
    "Sagwara": "सागवाडा",
    "सागवाड़ा": "सागवाडा",
    "Galiakot": "गलियाकोट",
    "गलियाकोट": "गलियाकोट",
    "Bicchiwada": "बिछीवाडा",
    "बिछीवाड़ा": "बिछीवाडा",
    "Jodhpur Block": "जोधपूर ब्लॉक",
    "जोधपुर ब्लॉक": "जोधपूर ब्लॉक",
    "Married": "विवाहित",
    "विवाहित": "विवाहित",
    "Single": "अविवाहित",
    "अविवाहित": "अविवाहित",
    "Widowed": "विधवा",
    "विधवा": "विधवा",
    "Divorced": "घटस्फोटित",
    "तलाकशुदा": "घटस्फोटित",
    "Separated": "विभक्त",
    "अलग रह रहे": "विभक्त",
    "General": "सामान्य (General)",
    "सामान्य": "सामान्य (General)",
    "OBC": "इतर मागासवर्गीय (OBC)",
    "अन्य पिछड़ा वर्ग (OBC)": "इतर मागासवर्गीय (OBC)",
    "SC": "अनुसूचित जाती (SC)",
    "अनुसूचित जाति (SC)": "अनुसूचित जाती (SC)",
    "ST": "अनुसूचित जमाती (ST)",
    "अनुसूचित जनजाति (ST)": "अनुसूचित जमाती (ST)",
    "Illiterate": "निरक्षर",
    "निरक्षर / अनपढ़": "निरक्षर",
    "Illiterate but able to calculate": "निरक्षर पण हिशोब करू शकणारे",
    "अनपढ़ लेकिन हिसाब-किताब में सक्षम": "निरक्षर पण हिशोब करू शकणारे",
    "5th pass": "५ वी पास",
    "5वीं पास": "५ वी पास",
    "8th pass": "८ वी पास",
    "8वीं पास": "८ वी पास",
    "10th pass": "१० वी पास",
    "10वीं पास": "१० वी पास",
    "12th pass": "१२ वी पास",
    "12वीं पास": "१२ वी पास",
    "Graduate": "पदवीधर (Graduate)",
    "स्नातक (Graduate)": "पदवीधर (Graduate)",
    "Self": "स्वतः",
    "स्वयं": "स्वतः",
    "Husband": "पती",
    "पति": "पती",
    "Son": "मुलगा",
    "पुत्र / बेटा": "मुलगा",
    "Daughter": "मुलगी",
    "पुत्री / बेटी": "मुलगी",
    "Member": "सदस्य",
    "सामान्य सदस्य": "सदस्य",
    "Leadership role": "पदाधिकारी (अध्यक्ष/सचिव/खजिनदार)",
    "पदाधिकारी / नेतृत्व पद (अध्यक्ष/सचिव/कोषाध्यक्ष)": "पदाधिकारी (अध्यक्ष/सचिव/खजिनदार)",
    "Grocery / Kirana": "किराणा दुकान",
    "किराना दुकान": "किराणा दुकान",
    "General store": "जनरल स्टोअर",
    "जनरल स्टोर": "जनरल स्टोअर",
    "Leather & footwear": "चामडे व पादत्राणे",
    "चमड़ा व जूते-चप्पल": "चामडे व पादत्राणे",
    "Flour mill": "पिठाची गिरणी",
    "आटा चक्की": "पिठाची गिरणी",
    "Tailoring & Stitching": "शिलाई व भरतकाम",
    "सिलाई व कढ़ाई केंद्र": "शिलाई व भरतकाम",
    "Apparel & Garments": "तयार कपडे",
    "रेडीमेड वस्त्र": "तयार कपडे",
    "Beauty parlour": "ब्युटी पार्लर",
    "ब्यूटी पार्लर": "ब्युटी पार्लर",
    "Handicraft": "हस्तकला / हँडीक्राफ्ट",
    "हस्तशिल्प / हैंडीक्राफ्ट": "हस्तकला / हँडीक्राफ्ट",
    "Dairy shop": "डेअरी व दूध केंद्र",
    "डेयरी व दूध केंद्र": "डेअरी व दूध केंद्र",
    "Auto-mechanic": "ऑटो मेकॅनिक",
    "ऑटो मैकेनिक": "ऑटो मेकॅनिक",
    "E-mitra": "ई-सेवा केंद्र / सीएससी",
    "ई-मित्र केंद्र / ग्राहक सेवा केंद्र": "ई-सेवा केंद्र / सीएससी",
    "Mobile repair shop": "मोबाइल दुरुस्ती दुकान",
    "मोबाइल रिपेयर दुकान": "मोबाइल दुरुस्ती दुकान",
    "Transport": "वाहतूक सेवा",
    "परिवहन सेवा": "वाहतूक सेवा",
    "Any other": "इतर कोणतेही",
    "अन्य कोई": "इतर कोणतेही",
    "Whatsapp": "व्हॉट्सअ‍ॅप",
    "व्हाट्सएप (WhatsApp)": "व्हॉट्सअ‍ॅप",
    "Facebook": "फेसबुक",
    "फेसबुक (Facebook)": "फेसबुक",
    "Instagram": "इन्स्टाग्राम",
    "इंस्टाग्राम (Instagram)": "इन्स्टाग्राम",
    "Don't use social media": "सोशल मीडिया वापरत नाही",
    "सोशल मीडिया का उपयोग नहीं करते": "सोशल मीडिया वापरत नाही",
    "Draft": "मसुदा",
    "Save Draft": "मसुदा जतन करा",
    "ड्राफ्ट": "मसुदा",
    "मसुदा": "मसुदा",
    "ડ્રાફ્ટ": "मसुदा",
    "ਡਰਾਫਟ": "मसुदा",
    "খসড়া": "मसुदा",
    "வரைவு": "मसुदा",
    "చిత్తుప్రతి": "मसुदा",
    "ಕರಡು": "मसुदा",
    "ഡ്രാഫ്റ്റ്": "मसुदा",
    "ڈرافٹ": "मसुदा",
    "ड्राफ्ट सेव करें": "मसुदा जतन करा",
    "मसुदा जतन करा": "मसुदा जतन करा",
    "ડ્રાફ્ટ સાચવો": "मसुदा जतन करा",
    "ਡਰਾਫਟ ਸੰਭਾਲੋ": "मसुदा जतन करा",
    "খসড়া সংরক্ষণ": "मसुदा जतन करा",
    "வரைவு சேமி": "मसुदा जतन करा",
    "చిత్తుప్రతి భద్రపరచు": "मसुदा जतन करा",
    "ಕರಡು ಉಳಿಸಿ": "मसुदा जतन करा",
    "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക": "मसुदा जतन करा",
    "ڈرافٹ محفوظ کریں": "मसुदा जतन करा"
  },
  "gu": {
    "OmniServey": "ઓમ્નીસર્વે",
    "ओमनीसर्वे": "ઓમ્નીસર્વે",
    "Online": "ઓનલાઇન",
    "ऑनलाइन": "ઓનલાઇન",
    "Offline": "ઓફલાઇન",
    "ऑफलाइन": "ઓફલાઇન",
    "Surveys": "સર્વેક્ષણ",
    "सर्वेक्षण": "સર્વેક્ષણ",
    "WAL Queue": "કતાર (ઓફલાઇન)",
    "कतार (ऑफलाइन)": "કતાર (ઓફલાઇન)",
    "System": "સિસ્ટમ",
    "सिस्टम": "સિસ્ટમ",
    "Exit Form": "← બહાર નીકળો",
    "← बाहर निकलें": "← બહાર નીકળો",
    "Step": "પગલું",
    "चरण": "પગલું",
    "of": "માંથી",
    "का": "માંથી",
    "Pages": "પૃષ્ઠો",
    "पृष्ठ": "પૃષ્ઠો",
    "Questions": "પ્રશ્નો",
    "प्रश्न": "પ્રશ્નો",
    "Previous": "← પાછળ",
    "← पिछला": "← પાછળ",
    "Next": "આગળ →",
    "अगला →": "આગળ →",
    "Save Offline": "ઓફલાઇન સાચવો",
    "ऑफलाइन सेव करें": "ઓફલાઇન સાચવો",
    "Submit Survey": "સબમિટ કરો",
    "सबमिट करें": "સબમિટ કરો",
    "Capture GPS Coordinates": "જીપીએસ સ્થાન મેળવો",
    "जीपीएस लोकेशन रिकॉर्ड करें": "જીપીએસ સ્થાન મેળવો",
    "GPS Fix Acquired ✓": "જીપીએસ સ્થાન પ્રાપ્ત થયું ✓",
    "जीपीएस लोकेशन प्राप्त हुआ ✓": "જીપીએસ સ્થાન પ્રાપ્ત થયું ✓",
    "Take Photo / Choose File": "ફોટો લો / ફાઇલ પસંદ કરો",
    "फोटो लें / फाइल चुनें": "ફોટો લો / ફાઇલ પસંદ કરો",
    "Sign inside box with finger or stylus": "તમારી આંગળી અથવા સ્ટાઇલસથી બૉક્સમાં સહી કરો",
    "अपनी उंगली या स्टाइलस से बॉक्स में हस्ताक्षर करें": "તમારી આંગળી અથવા સ્ટાઇલસથી બૉક્સમાં સહી કરો",
    "Clear Signature": "સહી સાફ કરો",
    "हस्ताक्षर मिटाएं": "સહી સાફ કરો",
    "Signature Recorded": "સહી નોંધાઈ",
    "हस्ताक्षर दर्ज हुआ": "સહી નોંધાઈ",
    "Enter response here...": "અહીં જવાબ દાખલ કરો...",
    "यहाँ उत्तर दर्ज करें...": "અહીં જવાબ દાખલ કરો...",
    "Required Questions Pending": "જરૂરી પ્રશ્નો બાકી છે",
    "आवश्यक प्रश्न अधूरे हैं": "જરૂરી પ્રશ્નો બાકી છે",
    "Please fill in these required fields before final submission, or save as an offline draft anytime.": "અંતિમ સબમિશન પહેલાં કૃપા કરીને આ જરૂરી પ્રશ્નો ભરો, અથવા કોઈપણ સમયે ઑફલાઇન ડ્રાફ્ટ તરીકે સાચવો.",
    "अंतिम सबमिशन से पहले कृपया इन आवश्यक प्रश्नों को भरें, या कभी भी ऑफलाइन ड्राफ्ट के रूप में सुरक्षित करें।": "અંતિમ સબમિશન પહેલાં કૃપા કરીને આ જરૂરી પ્રશ્નો ભરો, અથવા કોઈપણ સમયે ઑફલાઇન ડ્રાફ્ટ તરીકે સાચવો.",
    "Go to First Pending Question": "👉 પ્રથમ બાકી પ્રશ્ન પર જાઓ",
    "👉 पहले अधूरे प्रश्न पर जाएं": "👉 પ્રથમ બાકી પ્રશ્ન પર જાઓ",
    "Save as Offline Draft Anyway": "ઑફલાઇન ડ્રાફ્ટ સાચવો",
    "💾 ऑफलाइन ड्राफ्ट सुरक्षित करें": "ઑફલાઇન ડ્રાફ્ટ સાચવો",
    "Close": "બંધ કરો",
    "बंद करें": "બંધ કરો",
    "Start Survey Form": "સર્વેક્ષણ શરૂ કરો",
    "सर्वेक्षण शुरू करें": "સર્વેક્ષણ શરૂ કરો",
    "Start Survey Form →": "સર્વેક્ષણ શરૂ કરો →",
    "सर्वेक्षण शुरू करें →": "સર્વેક્ષણ શરૂ કરો →",
    "Write-Ahead Log (WAL)": "રાઇટ-અહેડ લૉગ (WAL કતાર)",
    "राइट-अहेड लॉग (WAL कतार)": "રાઇટ-અહેડ લૉગ (WAL કતાર)",
    "Atomic zero-loss local storage queue": "શૂન્ય ડેટા નુકશાન સુરક્ષિત સ્થાનિક સ્ટોરેજ",
    "शून्य डेटा हानि सुरक्षित स्थानीय भंडारण": "શૂન્ય ડેટા નુકશાન સુરક્ષિત સ્થાનિક સ્ટોરેજ",
    "Sync Now": "⟳ હમણાં સિંક કરો",
    "⟳ अभी सिंक करें": "⟳ હમણાં સિંક કરો",
    "View on Map →": "નકશા પર જુઓ →",
    "नक्शे पर देखें →": "નકશા પર જુઓ →",
    "Re-acquire Fix": "ફરીથી પ્રયાસ કરો",
    "पुनः प्रयास करें": "ફરીથી પ્રયાસ કરો",
    "Section A: Basic Details": "વિભાગ અ: મૂળભૂત વિગતો",
    "भाग क: बुनियादी विवरण": "વિભાગ અ: મૂળભૂત વિગતો",
    "Section B: Respondent & Household Profile": "વિભાગ બ: ઉત્તરદાતા અને કુટુંબ પ્રોફાઇલ",
    "भाग ख: उत्तरदाता और परिवार की प्रोफ़ाइल": "વિભાગ બ: ઉત્તરદાતા અને કુટુંબ પ્રોફાઇલ",
    "Section C: Enterprise Operations & Finance": "વિભાગ ક: સાહસ કામગીરી અને નાણાં",
    "भाग ग: उद्यम संचालन और वित्त": "વિભાગ ક: સાહસ કામગીરી અને નાણાં",
    "Section D: Enterprise Challenges & Coping Mechanisms": "વિભાગ ડ: સાહસિક પડકારો અને ઉકેલો",
    "भाग घ: उद्यम चुनौतियाँ और समाधान": "વિભાગ ડ: સાહસિક પડકારો અને ઉકેલો",
    "Section E: Impact of SVEP / OSF Schemes": "વિભાગ ઇ: એસવીઇપી / ઓએસએફ યોજનાઓની અસર",
    "भाग ङ: एसवीईपी / ओएसएफ योजनाओं का प्रभाव": "વિભાગ ઇ: એસવીઇપી / ઓએસએફ યોજનાઓની અસર",
    "Section F: Digital Transactions & Social Media": "વિભાગ એફ: ડિજિટલ વ્યવહારો અને સોશિયલ મીડિયા",
    "भाग च: डिजिटल लेन-देन और सोशल मीडिया": "વિભાગ એફ: ડિજિટલ વ્યવહારો અને સોશિયલ મીડિયા",
    "Section G: Field Verification & Sign-off": "વિભાગ જી: ફીલ્ડ ચકાસણી અને સહી",
    "भाग छ: फील्ड सत्यापन और हस्ताक्षर": "વિભાગ જી: ફીલ્ડ ચકાસણી અને સહી",
    "District": "જિલ્લો",
    "जिला": "જિલ્લો",
    "Block / Tehsil": "તાલુકો / બ્લોક",
    "ब्लॉक / तहसील": "તાલુકો / બ્લોક",
    "Village / Gram Panchayat Name": "ગામ / ગ્રામ પંચાયતનું નામ",
    "गाँव / ग्राम पंचायत का नाम": "ગામ / ગ્રામ પંચાયતનું નામ",
    "Cluster Level Federation (CLF) Name": "ક્લસ્ટર લેવલ ફેડરેશન (CLF) નું નામ",
    "क्लस्टर लेवल फेडरेशन (CLF) का नाम": "ક્લસ્ટર લેવલ ફેડરેશન (CLF) નું નામ",
    "Village Organization (VO) Name": "ગ્રામ સંસ્થા (VO) નું નામ",
    "ग्राम संगठन (VO) का नाम": "ગ્રામ સંસ્થા (VO) નું નામ",
    "Self-Help Group (SHG) Name": "સ્વસહાય જૂથ (SHG) નું નામ",
    "स्वयं सहायता समूह (SHG) का नाम": "સ્વસહાય જૂથ (SHG) નું નામ",
    "Respondent Name": "ઉત્તરદાતાનું નામ",
    "उत्तरदाता का नाम": "ઉત્તરદાતાનું નામ",
    "Enterprise / Business Name": "સાહસ / વ્યવસાયનું નામ",
    "उद्यम / व्यवसाय का नाम": "સાહસ / વ્યવસાયનું નામ",
    "Year of Setting Up Enterprise": "સાહસ સ્થાપનાનું વર્ષ",
    "उद्यम स्थापना का वर्ष": "સાહસ સ્થાપનાનું વર્ષ",
    "Main Business Activity of the Enterprise": "સાહસની મુખ્ય વ્યવસાયિક પ્રવૃત્તિ",
    "उद्यम की मुख्य व्यावसायिक गतिविधि": "સાહસની મુખ્ય વ્યવસાયિક પ્રવૃત્તિ",
    "What is respondent's relation with SHG member?": "ઉત્તરદાતાનો એસએચજી સભ્ય સાથે શું સંબંધ છે?",
    "उत्तरदाता का एसएचजी सदस्य से क्या संबंध है?": "ઉત્તરદાતાનો એસએચજી સભ્ય સાથે શું સંબંધ છે?",
    "What is the age of SHG member?": "એસએચજી સભ્યની ઉંમર કેટલી છે?",
    "एसएचजी सदस्य की आयु क्या है?": "એસએચજી સભ્યની ઉંમર કેટલી છે?",
    "What is the marital status of the SHG member?": "એસએચજી સભ્યની વૈવાહિક સ્થિતિ શું છે?",
    "एसएचजी सदस्य की वैवाहिक स्थिति क्या है?": "એસએચજી સભ્યની વૈવાહિક સ્થિતિ શું છે?",
    "What is the social category / caste?": "સામાજિક કેટેગરી / જ્ઞાતિ શું છે?",
    "सामाजिक श्रेणी / जाति क्या है?": "સામાજિક કેટેગરી / જ્ઞાતિ શું છે?",
    "What is the education status of the SHG member?": "એસએચજી સભ્યની શૈક્ષણિક લાયકાત શું છે?",
    "एसएचजी सदस्य की शैक्षणिक स्थिति क्या है?": "એસએચજી સભ્યની શૈક્ષણિક લાયકાત શું છે?",
    "How many total members are in the family?": "પરિવારમાં કુલ કેટલા સભ્યો છે?",
    "परिवार में कुल कितने सदस्य हैं?": "પરિવારમાં કુલ કેટલા સભ્યો છે?",
    "What is your total annual household income?": "તમારી કુલ વાર્ષિક પારિવારિક આવક કેટલી છે?",
    "आपकी कुल वार्षिक पारिवारिक आय कितनी है?": "તમારી કુલ વાર્ષિક પારિવારિક આવક કેટલી છે?",
    "What is your role in the SHG?": "એસએચજીમાં તમારી ભૂમિકા શું છે?",
    "एसएचजी में आपकी भूमिका क्या है?": "એસએચજીમાં તમારી ભૂમિકા શું છે?",
    "Are you related to any of the SVEP / OSF CRP?": "શું તમે કોઈપણ SVEP / OSF CRP સાથે સંબંધિત છો?",
    "क्या आप किसी SVEP / OSF CRP से संबंधित हैं?": "શું તમે કોઈપણ SVEP / OSF CRP સાથે સંબંધિત છો?",
    "Who started the enterprise?": "સાહસ કોણે શરૂ કર્યું?",
    "उद्यम किसने शुरू किया था?": "સાહસ કોણે શરૂ કર્યું?",
    "Who operates and manages the enterprise on a daily basis?": "દૈનિક ધોરણે સાહસનું સંચાલન કોણ કરે છે?",
    "दैनिक आधार पर उद्यम का संचालन और प्रबंधन कौन करता है?": "દૈનિક ધોરણે સાહસનું સંચાલન કોણ કરે છે?",
    "For how many hours in a day does the shop/enterprise remain open?": "દિવસમાં કેટલા કલાક દુકાન/સાહસ ખુલ્લું રહે છે?",
    "दिन में कितने घंटे दुकान/उद्यम खुला रहता है?": "દિવસમાં કેટલા કલાક દુકાન/સાહસ ખુલ્લું રહે છે?",
    "What is the type of business place / premises?": "વ્યવસાય સ્થળનો પ્રકાર કયો છે?",
    "व्यावसायिक स्थान/परिसर का प्रकार क्या है?": "વ્યવસાય સ્થળનો પ્રકાર કયો છે?",
    "Does SHG member maintain written records of business transactions regularly?": "શું એસએચજી સભ્ય નિયમિતપણે વ્યવસાયિક વ્યવહારોનો લેખિત રેકોર્ડ રાખે છે?",
    "क्या एसएचजी सदस्य नियमित रूप से व्यावसायिक लेन-देन का लिखित रिकॉर्ड रखते हैं?": "શું એસએચજી સભ્ય નિયમિતપણે વ્યવસાયિક વ્યવહારોનો લેખિત રેકોર્ડ રાખે છે?",
    "In the first year of your enterprise, what was the amount of seed capital (Rs)?": "તમારા સાહસના પ્રથમ વર્ષમાં પ્રારંભિક મૂડી (રૂ) કેટલી હતી?",
    "आपके उद्यम के पहले वर्ष में प्रारंभिक बीज पूंजी की राशि (रु) क्या थी?": "તમારા સાહસના પ્રથમ વર્ષમાં પ્રારંભિક મૂડી (રૂ) કેટલી હતી?",
    "How do you manage working capital during peak season?": "પીક સીઝન દરમિયાન તમે કાર્યકારી મૂડીનું સંચાલન કેવી રીતે કરો છો?",
    "पीक सीजन के दौरान आप कार्यशील पूंजी का प्रबंधन कैसे करते हैं?": "પીક સીઝન દરમિયાન તમે કાર્યકારી મૂડીનું સંચાલન કેવી રીતે કરો છો?",
    "Is the location of your space convenient for your business?": "શું તમારા સ્થાનની સ્થિતિ તમારા વ્યવસાય માટે અનુકૂળ છે?",
    "क्या आपके स्थान की स्थिति आपके व्यवसाय के लिए सुविधाजनक है?": "શું તમારા સ્થાનની સ્થિતિ તમારા વ્યવસાય માટે અનુકૂળ છે?",
    "Are you satisfied and happy with your wholesale supplier?": "શું તમે તમારા જથ્થાબંધ સપ્લાયરથી સંતુષ્ટ છો?",
    "क्या आप अपने थोक सप्लायर से संतुष्ट और खुश हैं?": "શું તમે તમારા જથ્થાબંધ સપ્લાયરથી સંતુષ્ટ છો?",
    "Are you able to recover credit / money from your customers?": "શું તમે તમારા ગ્રાહકો પાસેથી ઉધારી/નાણાં વસૂલ કરી શકો છો?",
    "क्या आप अपने ग्राहकों से उधारी/पैसा वसूल पाते हैं?": "શું તમે તમારા ગ્રાહકો પાસેથી ઉધારી/નાણાં વસૂલ કરી શકો છો?",
    "Do you source raw materials/goods from market independently?": "શું તમે બજારમાંથી સ્વતંત્ર રીતે કાચો માલ લાવો છો?",
    "क्या आप बाजार से स्वतंत्र रूप से कच्चा माल/सामान लाते हैं?": "શું તમે બજારમાંથી સ્વતંત્ર રીતે કાચો માલ લાવો છો?",
    "Do you have easy access to loans from different sources?": "શું તમને વિવિધ સ્ત્રોતોમાંથી લોનની સરળ પહોંચ છે?",
    "क्या आपको विभिन्न स्रोतों से ऋण की आसान पहुँच प्राप्त है?": "શું તમને વિવિધ સ્ત્રોતોમાંથી લોનની સરળ પહોંચ છે?",
    "How much loan amount have you availed under SVEP / OSF scheme (Rs)?": "તમે SVEP / OSF યોજના હેઠળ કેટલી લોન રકમ મેળવી છે (રૂ)?",
    "आपने SVEP / OSF योजना के तहत कितनी ऋण राशि प्राप्त की है (रु)?": "તમે SVEP / OSF યોજના હેઠળ કેટલી લોન રકમ મેળવી છે (રૂ)?",
    "How did you utilize the enterprise loan?": "તમે સાહસ લોનનો ઉપયોગ કેવી રીતે કર્યો?",
    "आपने उद्यम ऋण का उपयोग किस प्रकार किया?": "તમે સાહસ લોનનો ઉપયોગ કેવી રીતે કર્યો?",
    "Monthly enterprise income BEFORE availing loan changes (Rs)?": "લોન લેતા પહેલા સાહસની માસિક આવક (રૂ)?",
    "ऋण से बदलाव करने से पहले उद्यम की मासिक आय (रु)?": "લોન લેતા પહેલા સાહસની માસિક આવક (રૂ)?",
    "Monthly enterprise income AFTER availing loan changes (Rs)?": "લોન લીધા પછી સાહસની માસિક આવક (રૂ)?",
    "ऋण से बदलाव करने के बाद उद्यम की मासिक आय (रु)?": "લોન લીધા પછી સાહસની માસિક આવક (રૂ)?",
    "What has been the contribution of SVEP / OSF CRPs?": "SVEP / OSF CRP નું શું યોગદાન રહ્યું છે?",
    "SVEP / OSF CRP का क्या योगदान रहा है?": "SVEP / OSF CRP નું શું યોગદાન રહ્યું છે?",
    "Does the woman entrepreneur own a smartphone?": "શું મહિલા ઉદ્યોગસાહસિક પાસે સ્માર્ટફોન છે?",
    "क्या महिला उद्यमी के पास स्मार्टफोन है?": "શું મહિલા ઉદ્યોગસાહસિક પાસે સ્માર્ટફોન છે?",
    "Do you use QR code / UPI / mobile banking for business transactions?": "શું તમે વ્યવસાયિક વ્યવહારો માટે QR કોડ / UPI / મોબાઇલ બેંકિંગનો ઉપયોગ કરો છો?",
    "क्या आप व्यावसायिक लेन-देन के लिए क्यूआर कोड / यूपीआई / मोबाइल बैंकिंग का उपयोग करते हैं?": "શું તમે વ્યવસાયિક વ્યવહારો માટે QR કોડ / UPI / મોબાઇલ બેંકિંગનો ઉપયોગ કરો છો?",
    "Daily how many transactions are done via QR code / UPI?": "દરરોજ QR કોડ / UPI દ્વારા કેટલા વ્યવહારો થાય છે?",
    "प्रतिदिन क्यूआर कोड / यूपीआई द्वारा कितने लेन-देन होते हैं?": "દરરોજ QR કોડ / UPI દ્વારા કેટલા વ્યવહારો થાય છે?",
    "Which social media platforms do you use for your business?": "તમે તમારા વ્યવસાય માટે કયા સોશિયલ મીડિયા પ્લેટફોર્મનો ઉપયોગ કરો છો?",
    "आप अपने व्यवसाय के लिए किन सोशल मीडिया प्लेटफॉर्म का उपयोग करते हैं?": "તમે તમારા વ્યવસાય માટે કયા સોશિયલ મીડિયા પ્લેટફોર્મનો ઉપયોગ કરો છો?",
    "Capture Enterprise GPS Location (Satellite Coordinates)": "સાહસ જીપીએસ સ્થાન મેળવો (ઉપગ્રહ કોઓર્ડિનેટ્સ)",
    "उद्यम जीपीएस लोकेशन कैप्चर करें (उपग्रह निर्देशांक)": "સાહસ જીપીએસ સ્થાન મેળવો (ઉપગ્રહ કોઓર્ડિનેટ્સ)",
    "Field Photo of Enterprise & Beneficiary": "સાહસ અને લાભાર્થીનો ફીલ્ડ ફોટો",
    "उद्यम और लाभार्थी का फील्ड फोटो": "સાહસ અને લાભાર્થીનો ફીલ્ડ ફોટો",
    "Respondent & Surveyor Digital Signature": "ઉત્તરદાતા અને સર્વેક્ષકની ડિજિટલ સહી",
    "उत्तरदाता और सर्वेक्षक के डिजिटल हस्ताक्षर": "ઉત્તરદાતા અને સર્વેક્ષકની ડિજિટલ સહી",
    "Yes": "હા",
    "हाँ": "હા",
    "No": "ના",
    "नहीं": "ના",
    "Baran": "બારાં",
    "बारां": "બારાં",
    "Churu": "ચૂરુ",
    "चूरू": "ચૂરુ",
    "Dausa": "દૌસા",
    "दौसा": "દૌસા",
    "Dungarpur": "ડુંગરપુર",
    "डूंगरपुर": "ડુંગરપુર",
    "Jodhpur": "જોધપુર",
    "जोधपुर": "જોધપુર",
    "Chhipabarod": "છીપાબડોદ",
    "छीपाबड़ौद": "છીપાબડોદ",
    "Kishanganj": "કિશનગંજ",
    "किशनगंज": "કિશનગંજ",
    "Sardar Sheher": "સરદારશહર",
    "सरदारशहर": "સરદારશહર",
    "Bidasar": "બીદાસર",
    "बीदासर": "બીદાસર",
    "Secundra": "સિકંદરા",
    "सिकंदरा": "સિકંદરા",
    "Sagwara": "સાગવાડા",
    "सागवाड़ा": "સાગવાડા",
    "Galiakot": "ગલિયાકોટ",
    "गलियाकोट": "ગલિયાકોટ",
    "Bicchiwada": "બિછીવાડા",
    "बिछीवाड़ा": "બિછીવાડા",
    "Jodhpur Block": "જોધપુર બ્લોક",
    "जोधपुर ब्लॉक": "જોધપુર બ્લોક",
    "Married": "પરિણીત",
    "विवाहित": "પરિણીત",
    "Single": "અપરિણીત",
    "अविवाहित": "અપરિણીત",
    "Widowed": "વિધવા",
    "विधवा": "વિધવા",
    "Divorced": "છૂટાછેડા લીધેલ",
    "तलाकशुदा": "છૂટાછેડા લીધેલ",
    "Separated": "અલગ રહેતા",
    "अलग रह रहे": "અલગ રહેતા",
    "General": "સામાન્ય (General)",
    "सामान्य": "સામાન્ય (General)",
    "OBC": "અન્ય પછાત વર્ગ (OBC)",
    "अन्य पिछड़ा वर्ग (OBC)": "અન્ય પછાત વર્ગ (OBC)",
    "SC": "અનુસૂચિત જાતિ (SC)",
    "अनुसूचित जाति (SC)": "અનુસૂચિત જાતિ (SC)",
    "ST": "અનુસૂચિત જનજાતિ (ST)",
    "अनुसूचित जनजाति (ST)": "અનુસૂચિત જનજાતિ (ST)",
    "Illiterate": "અભણ / નિરક્ષર",
    "निरक्षर / अनपढ़": "અભણ / નિરક્ષર",
    "Illiterate but able to calculate": "અભણ પરંતુ ગણતરીમાં સક્ષમ",
    "अनपढ़ लेकिन हिसाब-किताब में सक्षम": "અભણ પરંતુ ગણતરીમાં સક્ષમ",
    "5th pass": "૫ પાસ",
    "5वीं पास": "૫ પાસ",
    "8th pass": "૮ પાસ",
    "8वीं पास": "૮ પાસ",
    "10th pass": "૧૦ પાસ",
    "10वीं पास": "૧૦ પાસ",
    "12th pass": "૧૨ પાસ",
    "12वीं पास": "૧૨ પાસ",
    "Graduate": "સ્નાતક (Graduate)",
    "स्नातक (Graduate)": "સ્નાતક (Graduate)",
    "Self": "પોતે",
    "स्वयं": "પોતે",
    "Husband": "પતિ",
    "पति": "પતિ",
    "Son": "પુત્ર / દીકરો",
    "पुत्र / बेटा": "પુત્ર / દીકરો",
    "Daughter": "પુત્રી / દીકરી",
    "पुत्री / बेटी": "પુત્રી / દીકરી",
    "Member": "સામાન્ય સભ્ય",
    "सामान्य सदस्य": "સામાન્ય સભ્ય",
    "Leadership role": "નેતૃત્વ પદ (પ્રમુખ/મંત્રી/ખજાનચી)",
    "पदाधिकारी / नेतृत्व पद (अध्यक्ष/सचिव/कोषाध्यक्ष)": "નેતૃત્વ પદ (પ્રમુખ/મંત્રી/ખજાનચી)",
    "Grocery / Kirana": "કરિયાણાની દુકાન",
    "किराना दुकान": "કરિયાણાની દુકાન",
    "General store": "જનરલ સ્ટોર",
    "जनरल स्टोर": "જનરલ સ્ટોર",
    "Leather & footwear": "ચામડું અને ફૂટવેર",
    "चमड़ा व जूते-चप्पल": "ચામડું અને ફૂટવેર",
    "Flour mill": "લોટ દળવાની ઘંટી (ચક્કી)",
    "आटा चक्की": "લોટ દળવાની ઘંટી (ચક્કી)",
    "Tailoring & Stitching": "સિલાઈ અને ભરતકામ કેન્દ્ર",
    "सिलाई व कढ़ाई केंद्र": "સિલાઈ અને ભરતકામ કેન્દ્ર",
    "Apparel & Garments": "રેડીમેડ કપડાં",
    "रेडीमेड वस्त्र": "રેડીમેડ કપડાં",
    "Beauty parlour": "બ્યુટી પાર્લર",
    "ब्यूटी पार्लर": "બ્યુટી પાર્લર",
    "Handicraft": "હસ્તકલા / હેન્ડીક્રાફ્ટ",
    "हस्तशिल्प / हैंडीक्राफ्ट": "હસ્તકલા / હેન્ડીક્રાફ્ટ",
    "Dairy shop": "ડેરી અને દૂધ કેન્દ્ર",
    "डेयरी व दूध केंद्र": "ડેરી અને દૂધ કેન્દ્ર",
    "Auto-mechanic": "ઓટો મિકેનિક",
    "ऑटो मैकेनिक": "ઓટો મિકેનિક",
    "E-mitra": "ઇ-મિત્ર કેન્દ્ર / સીએસસી",
    "ई-मित्र केंद्र / ग्राहक सेवा केंद्र": "ઇ-મિત્ર કેન્દ્ર / સીએસસી",
    "Mobile repair shop": "મોબાઇલ રિપેરિંગ દુકાન",
    "मोबाइल रिपेयर दुकान": "મોબાઇલ રિપેરિંગ દુકાન",
    "Transport": "પરિવહન સેવા",
    "परिवहन सेवा": "પરિવહન સેવા",
    "Any other": "અન્ય કોઈ",
    "अन्य कोई": "અન્ય કોઈ",
    "Whatsapp": "વોટ્સએપ",
    "व्हाट्सएप (WhatsApp)": "વોટ્સએપ",
    "Facebook": "ફેસબુક",
    "फेसबुक (Facebook)": "ફેસબુક",
    "Instagram": "ઇન્સ્ટાગ્રામ",
    "इंस्टाग्राम (Instagram)": "ઇન્સ્ટાગ્રામ",
    "Don't use social media": "સોશિયલ મીડિયાનો ઉપયોગ કરતા નથી",
    "सोशल मीडिया का उपयोग नहीं करते": "સોશિયલ મીડિયાનો ઉપયોગ કરતા નથી",
    "Draft": "ડ્રાફ્ટ",
    "Save Draft": "ડ્રાફ્ટ સાચવો",
    "ड्राफ्ट": "ડ્રાફ્ટ",
    "मसुदा": "ડ્રાફ્ટ",
    "ડ્રાફ્ટ": "ડ્રાફ્ટ",
    "ਡਰਾਫਟ": "ડ્રાફ્ટ",
    "খসড়া": "ડ્રાફ્ટ",
    "வரைவு": "ડ્રાફ્ટ",
    "చిత్తుప్రతి": "ડ્રાફ્ટ",
    "ಕರಡು": "ડ્રાફ્ટ",
    "ഡ്രാഫ്റ്റ്": "ડ્રાફ્ટ",
    "ڈرافٹ": "ડ્રાફ્ટ",
    "ड्राफ्ट सेव करें": "ડ્રાફ્ટ સાચવો",
    "मसुदा जतन करा": "ડ્રાફ્ટ સાચવો",
    "ડ્રાફ્ટ સાચવો": "ડ્રાફ્ટ સાચવો",
    "ਡਰਾਫਟ ਸੰਭਾਲੋ": "ડ્રાફ્ટ સાચવો",
    "খসড়া সংরক্ষণ": "ડ્રાફ્ટ સાચવો",
    "வரைவு சேமி": "ડ્રાફ્ટ સાચવો",
    "చిత్తుప్రతి భద్రపరచు": "ડ્રાફ્ટ સાચવો",
    "ಕರಡು ಉಳಿಸಿ": "ડ્રાફ્ટ સાચવો",
    "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക": "ડ્રાફ્ટ સાચવો",
    "ڈرافٹ محفوظ کریں": "ડ્રાફ્ટ સાચવો"
  },
  "pa": {
    "OmniServey": "ਓਮਨੀਸਰਵੇ",
    "ओमनीसर्वे": "ਓਮਨੀਸਰਵੇ",
    "Online": "ਆਨਲਾਈਨ",
    "ऑनलाइन": "ਆਨਲਾਈਨ",
    "Offline": "ਔਫਲਾਈਨ",
    "ऑफलाइन": "ਔਫਲਾਈਨ",
    "Surveys": "ਸਰਵੇਖਣ",
    "सर्वेक्षण": "ਸਰਵੇਖਣ",
    "WAL Queue": "ਕਤਾਰ (ਔਫਲਾਈਨ)",
    "कतार (ऑफलाइन)": "ਕਤਾਰ (ਔਫਲਾਈਨ)",
    "System": "ਸਿਸਟਮ",
    "सिस्टम": "ਸਿਸਟਮ",
    "Exit Form": "← ਬਾਹਰ ਜਾਓ",
    "← बाहर निकलें": "← ਬਾਹਰ ਜਾਓ",
    "Step": "ਕਦਮ",
    "चरण": "ਕਦਮ",
    "of": "ਦਾ",
    "का": "ਦਾ",
    "Pages": "ਪੰਨੇ",
    "पृष्ठ": "ਪੰਨੇ",
    "Questions": "ਸਵਾਲ",
    "प्रश्न": "ਸਵਾਲ",
    "Previous": "← ਪਿਛਲਾ",
    "← पिछला": "← ਪਿਛਲਾ",
    "Next": "ਅਗਲਾ →",
    "अगला →": "ਅਗਲਾ →",
    "Save Offline": "ਔਫਲਾਈਨ ਸੇਵ ਕਰੋ",
    "ऑफलाइन सेव करें": "ਔਫਲਾਈਨ ਸੇਵ ਕਰੋ",
    "Submit Survey": "ਸਬਮਿਟ ਕਰੋ",
    "सबमिट करें": "ਸਬਮਿਟ ਕਰੋ",
    "Capture GPS Coordinates": "ਜੀਪੀਐਸ ਸਥਾਨ ਰਿਕਾਰਡ ਕਰੋ",
    "जीपीएस लोकेशन रिकॉर्ड करें": "ਜੀਪੀਐਸ ਸਥਾਨ ਰਿਕਾਰਡ ਕਰੋ",
    "GPS Fix Acquired ✓": "ਜੀਪੀਐਸ ਸਥਾਨ ਪ੍ਰਾਪਤ ਹੋਇਆ ✓",
    "जीपीएस लोकेशन प्राप्त हुआ ✓": "ਜੀਪੀਐਸ ਸਥਾਨ ਪ੍ਰਾਪਤ ਹੋਇਆ ✓",
    "Take Photo / Choose File": "ਫੋਟੋ ਲਓ / ਫਾਈਲ ਚੁਣੋ",
    "फोटो लें / फाइल चुनें": "ਫੋਟੋ ਲਓ / ਫਾਈਲ ਚੁਣੋ",
    "Sign inside box with finger or stylus": "ਆਪਣੀ ਉਂਗਲ ਜਾਂ ਸਟਾਈਲਸ ਨਾਲ ਬਾਕਸ ਵਿੱਚ ਦਸਤਖਤ ਕਰੋ",
    "अपनी उंगली या स्टाइलस से बॉक्स में हस्ताक्षर करें": "ਆਪਣੀ ਉਂਗਲ ਜਾਂ ਸਟਾਈਲਸ ਨਾਲ ਬਾਕਸ ਵਿੱਚ ਦਸਤਖਤ ਕਰੋ",
    "Clear Signature": "ਦਸਤਖਤ ਮਿਟਾਓ",
    "हस्ताक्षर मिटाएं": "ਦਸਤਖਤ ਮਿਟਾਓ",
    "Signature Recorded": "ਦਸਤਖਤ ਦਰਜ ਹੋਏ",
    "हस्ताक्षर दर्ज हुआ": "ਦਸਤਖਤ ਦਰਜ ਹੋਏ",
    "Enter response here...": "ਇੱਥੇ ਜਵਾਬ ਦਰਜ ਕਰੋ...",
    "यहाँ उत्तर दर्ज करें...": "ਇੱਥੇ ਜਵਾਬ ਦਰਜ ਕਰੋ...",
    "Required Questions Pending": "ਲੋੜੀਂਦੇ ਸਵਾਲ ਬਾਕੀ ਹਨ",
    "आवश्यक प्रश्न अधूरे हैं": "ਲੋੜੀਂਦੇ ਸਵਾਲ ਬਾਕੀ ਹਨ",
    "Please fill in these required fields before final submission, or save as an offline draft anytime.": "ਅੰਤਿਮ ਸਬਮਿਸ਼ਨ ਤੋਂ ਪਹਿਲਾਂ ਕਿਰਪਾ ਕਰਕੇ ਇਹ ਲੋੜੀਂਦੇ ਸਵਾਲ ਭਰੋ, ਜਾਂ ਕਦੇ ਵੀ ਔਫਲਾਈਨ ਡਰਾਫਟ ਵਜੋਂ ਸੇਵ ਕਰੋ।",
    "अंतिम सबमिशन से पहले कृपया इन आवश्यक प्रश्नों को भरें, या कभी भी ऑफलाइन ड्राफ्ट के रूप में सुरक्षित करें।": "ਅੰਤਿਮ ਸਬਮਿਸ਼ਨ ਤੋਂ ਪਹਿਲਾਂ ਕਿਰਪਾ ਕਰਕੇ ਇਹ ਲੋੜੀਂਦੇ ਸਵਾਲ ਭਰੋ, ਜਾਂ ਕਦੇ ਵੀ ਔਫਲਾਈਨ ਡਰਾਫਟ ਵਜੋਂ ਸੇਵ ਕਰੋ।",
    "Go to First Pending Question": "👉 ਪਹਿਲੇ ਬਾਕੀ ਸਵਾਲ ਤੇ ਜਾਓ",
    "👉 पहले अधूरे प्रश्न पर जाएं": "👉 ਪਹਿਲੇ ਬਾਕੀ ਸਵਾਲ ਤੇ ਜਾਓ",
    "Save as Offline Draft Anyway": "ਔਫਲਾਈਨ ਡਰਾਫਟ ਸੇਵ ਕਰੋ",
    "💾 ऑफलाइन ड्राफ्ट सुरक्षित करें": "ਔਫਲਾਈਨ ਡਰਾਫਟ ਸੇਵ ਕਰੋ",
    "Close": "ਬੰਦ ਕਰੋ",
    "बंद करें": "ਬੰਦ ਕਰੋ",
    "Start Survey Form": "ਸਰਵੇਖਣ ਸ਼ੁਰੂ ਕਰੋ",
    "सर्वेक्षण शुरू करें": "ਸਰਵੇਖਣ ਸ਼ੁਰੂ ਕਰੋ",
    "Start Survey Form →": "ਸਰਵੇਖਣ ਸ਼ੁਰੂ ਕਰੋ →",
    "सर्वेक्षण शुरू करें →": "ਸਰਵੇਖਣ ਸ਼ੁਰੂ ਕਰੋ →",
    "Write-Ahead Log (WAL)": "ਰਾਈਟ-ਅਹੈੱਡ ਲੌਗ (WAL ਕਤਾਰ)",
    "राइट-अहेड लॉग (WAL कतार)": "ਰਾਈਟ-ਅਹੈੱਡ ਲੌਗ (WAL ਕਤਾਰ)",
    "Atomic zero-loss local storage queue": "ਜ਼ੀਰੋ ਡੇਟਾ ਨੁਕਸਾਨ ਸੁਰੱਖਿਅਤ ਸਥਾਨਕ ਸਟੋਰੇਜ",
    "शून्य डेटा हानि सुरक्षित स्थानीय भंडारण": "ਜ਼ੀਰੋ ਡੇਟਾ ਨੁਕਸਾਨ ਸੁਰੱਖਿਅਤ ਸਥਾਨਕ ਸਟੋਰੇਜ",
    "Sync Now": "⟳ ਹੁਣੇ ਸਿੰਕ ਕਰੋ",
    "⟳ अभी सिंक करें": "⟳ ਹੁਣੇ ਸਿੰਕ ਕਰੋ",
    "View on Map →": "ਨਕਸ਼ੇ ਤੇ ਦੇਖੋ →",
    "नक्शे पर देखें →": "ਨਕਸ਼ੇ ਤੇ ਦੇਖੋ →",
    "Re-acquire Fix": "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
    "पुनः प्रयास करें": "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
    "Section A: Basic Details": "ਭਾਗ ੳ: ਮੁੱਢਲੇ ਵੇਰਵੇ",
    "भाग क: बुनियादी विवरण": "ਭਾਗ ੳ: ਮੁੱਢਲੇ ਵੇਰਵੇ",
    "Section B: Respondent & Household Profile": "ਭਾਗ ਅ: ਉੱਤਰਦਾਤਾ ਅਤੇ ਪਰਿਵਾਰ ਪ੍ਰੋਫਾਈਲ",
    "भाग ख: उत्तरदाता और परिवार की प्रोफ़ाइल": "ਭਾਗ ਅ: ਉੱਤਰਦਾਤਾ ਅਤੇ ਪਰਿਵਾਰ ਪ੍ਰੋਫਾਈਲ",
    "Section C: Enterprise Operations & Finance": "ਭਾਗ ੲ: ਉੱਦਮ ਸੰਚਾਲਨ ਅਤੇ ਵਿੱਤ",
    "भाग ग: उद्यम संचालन और वित्त": "ਭਾਗ ੲ: ਉੱਦਮ ਸੰਚਾਲਨ ਅਤੇ ਵਿੱਤ",
    "Section D: Enterprise Challenges & Coping Mechanisms": "ਭਾਗ ਸ: ਉੱਦਮ ਚੁਣੌਤੀਆਂ ਅਤੇ ਹੱਲ",
    "भाग घ: उद्यम चुनौतियाँ और समाधान": "ਭਾਗ ਸ: ਉੱਦਮ ਚੁਣੌਤੀਆਂ ਅਤੇ ਹੱਲ",
    "Section E: Impact of SVEP / OSF Schemes": "ਭਾਗ ਹ: ਐੱਸ.ਵੀ.ਈ.ਪੀ / ਓ.ਐੱਸ.ਐੱਫ ਸਕੀਮਾਂ ਦਾ ਪ੍ਰਭਾਵ",
    "भाग ङ: एसवीईपी / ओएसएफ योजनाओं का प्रभाव": "ਭਾਗ ਹ: ਐੱਸ.ਵੀ.ਈ.ਪੀ / ਓ.ਐੱਸ.ਐੱਫ ਸਕੀਮਾਂ ਦਾ ਪ੍ਰਭਾਵ",
    "Section F: Digital Transactions & Social Media": "ਭਾਗ ਕ: ਡਿਜੀਟਲ ਲੈਣ-ਦੇਣ ਅਤੇ ਸੋਸ਼ਲ ਮੀਡੀਆ",
    "भाग च: डिजिटल लेन-देन और सोशल मीडिया": "ਭਾਗ ਕ: ਡਿਜੀਟਲ ਲੈਣ-ਦੇਣ ਅਤੇ ਸੋਸ਼ਲ ਮੀਡੀਆ",
    "Section G: Field Verification & Sign-off": "ਭਾਗ ਖ: ਫੀਲਡ ਤਸਦੀਕ ਅਤੇ ਦਸਤਖਤ",
    "भाग छ: फील्ड सत्यापन और हस्ताक्षर": "ਭਾਗ ਖ: ਫੀਲਡ ਤਸਦੀਕ ਅਤੇ ਦਸਤਖਤ",
    "District": "ਜ਼ਿਲ੍ਹਾ",
    "जिला": "ਜ਼ਿਲ੍ਹਾ",
    "Block / Tehsil": "ਬਲਾਕ / ਤਹਿਸੀਲ",
    "ब्लॉक / तहसील": "ਬਲਾਕ / ਤਹਿਸੀਲ",
    "Village / Gram Panchayat Name": "ਪਿੰਡ / ਗ੍ਰਾਮ ਪੰਚਾਇਤ ਦਾ ਨਾਮ",
    "गाँव / ग्राम पंचायत का नाम": "ਪਿੰਡ / ਗ੍ਰਾਮ ਪੰਚਾਇਤ ਦਾ ਨਾਮ",
    "Cluster Level Federation (CLF) Name": "ਕਲੱਸਟਰ ਲੈਵਲ ਫੈਡਰੇਸ਼ਨ (CLF) ਦਾ ਨਾਮ",
    "क्लस्टर लेवल फेडरेशन (CLF) का नाम": "ਕਲੱਸਟਰ ਲੈਵਲ ਫੈਡਰੇਸ਼ਨ (CLF) ਦਾ ਨਾਮ",
    "Village Organization (VO) Name": "ਗ੍ਰਾਮ ਸੰਗਠਨ (VO) ਦਾ ਨਾਮ",
    "ग्राम संगठन (VO) का नाम": "ਗ੍ਰਾਮ ਸੰਗਠਨ (VO) ਦਾ ਨਾਮ",
    "Self-Help Group (SHG) Name": "ਸਵੈ-ਸਹਾਇਤਾ ਸਮੂਹ (SHG) ਦਾ ਨਾਮ",
    "स्वयं सहायता समूह (SHG) का नाम": "ਸਵੈ-ਸਹਾਇਤਾ ਸਮੂਹ (SHG) ਦਾ ਨਾਮ",
    "Respondent Name": "ਉੱਤਰਦਾਤਾ ਦਾ ਨਾਮ",
    "उत्तरदाता का नाम": "ਉੱਤਰਦਾਤਾ ਦਾ ਨਾਮ",
    "Enterprise / Business Name": "ਉੱਦਮ / ਕਾਰੋਬਾਰ ਦਾ ਨਾਮ",
    "उद्यम / व्यवसाय का नाम": "ਉੱਦਮ / ਕਾਰੋਬਾਰ ਦਾ ਨਾਮ",
    "Year of Setting Up Enterprise": "ਉੱਦਮ ਸਥਾਪਨਾ ਦਾ ਸਾਲ",
    "उद्यम स्थापना का वर्ष": "ਉੱਦਮ ਸਥਾਪਨਾ ਦਾ ਸਾਲ",
    "Main Business Activity of the Enterprise": "ਉੱਦਮ ਦੀ ਮੁੱਖ ਕਾਰੋਬਾਰੀ ਗਤੀਵਿਧੀ",
    "उद्यम की मुख्य व्यावसायिक गतिविधि": "ਉੱਦਮ ਦੀ ਮੁੱਖ ਕਾਰੋਬਾਰੀ ਗਤੀਵਿਧੀ",
    "What is respondent's relation with SHG member?": "ਉੱਤਰਦਾਤਾ ਦਾ SHG ਮੈਂਬਰ ਨਾਲ ਕੀ ਸਬੰਧ ਹੈ?",
    "उत्तरदाता का एसएचजी सदस्य से क्या संबंध है?": "ਉੱਤਰਦਾਤਾ ਦਾ SHG ਮੈਂਬਰ ਨਾਲ ਕੀ ਸਬੰਧ ਹੈ?",
    "What is the age of SHG member?": "SHG ਮੈਂਬਰ ਦੀ ਉਮਰ ਕਿੰਨੀ ਹੈ?",
    "एसएचजी सदस्य की आयु क्या है?": "SHG ਮੈਂਬਰ ਦੀ ਉਮਰ ਕਿੰਨੀ ਹੈ?",
    "What is the marital status of the SHG member?": "SHG ਮੈਂਬਰ ਦੀ ਵਿਆਹੁਤਾ ਸਥਿਤੀ ਕੀ ਹੈ?",
    "एसएचजी सदस्य की वैवाहिक स्थिति क्या है?": "SHG ਮੈਂਬਰ ਦੀ ਵਿਆਹੁਤਾ ਸਥਿਤੀ ਕੀ ਹੈ?",
    "What is the social category / caste?": "ਸਮਾਜਿਕ ਸ਼੍ਰੇਣੀ / ਜਾਤੀ ਕੀ ਹੈ?",
    "सामाजिक श्रेणी / जाति क्या है?": "ਸਮਾਜਿਕ ਸ਼੍ਰੇਣੀ / ਜਾਤੀ ਕੀ ਹੈ?",
    "What is the education status of the SHG member?": "SHG ਮੈਂਬਰ ਦੀ ਵਿੱਦਿਅਕ ਯੋਗਤਾ ਕੀ ਹੈ?",
    "एसएचजी सदस्य की शैक्षणिक स्थिति क्या है?": "SHG ਮੈਂਬਰ ਦੀ ਵਿੱਦਿਅਕ ਯੋਗਤਾ ਕੀ ਹੈ?",
    "How many total members are in the family?": "ਪਰਿਵਾਰ ਵਿੱਚ ਕੁੱਲ ਕਿੰਨੇ ਮੈਂਬਰ ਹਨ?",
    "परिवार में कुल कितने सदस्य हैं?": "ਪਰਿਵਾਰ ਵਿੱਚ ਕੁੱਲ ਕਿੰਨੇ ਮੈਂਬਰ ਹਨ?",
    "What is your total annual household income?": "ਤੁਹਾਡੀ ਕੁੱਲ ਸਾਲਾਨਾ ਪਰਿਵਾਰਕ ਆਮਦਨ ਕਿੰਨੀ ਹੈ?",
    "आपकी कुल वार्षिक पारिवारिक आय कितनी है?": "ਤੁਹਾਡੀ ਕੁੱਲ ਸਾਲਾਨਾ ਪਰਿਵਾਰਕ ਆਮਦਨ ਕਿੰਨੀ ਹੈ?",
    "What is your role in the SHG?": "SHG ਵਿੱਚ ਤੁਹਾਡੀ ਭੂਮਿਕਾ ਕੀ ਹੈ?",
    "एसएचजी में आपकी भूमिका क्या है?": "SHG ਵਿੱਚ ਤੁਹਾਡੀ ਭੂਮਿਕਾ ਕੀ ਹੈ?",
    "Are you related to any of the SVEP / OSF CRP?": "ਕੀ ਤੁਸੀਂ ਕਿਸੇ SVEP / OSF CRP ਨਾਲ ਸੰਬੰਧਿਤ ਹੋ?",
    "क्या आप किसी SVEP / OSF CRP से संबंधित हैं?": "ਕੀ ਤੁਸੀਂ ਕਿਸੇ SVEP / OSF CRP ਨਾਲ ਸੰਬੰਧਿਤ ਹੋ?",
    "Who started the enterprise?": "ਉੱਦਮ ਕਿਸਨੇ ਸ਼ੁਰੂ ਕੀਤਾ ਸੀ?",
    "उद्यम किसने शुरू किया था?": "ਉੱਦਮ ਕਿਸਨੇ ਸ਼ੁਰੂ ਕੀਤਾ ਸੀ?",
    "Who operates and manages the enterprise on a daily basis?": "ਰੋਜ਼ਾਨਾ ਅਧਾਰ ਤੇ ਉੱਦਮ ਦਾ ਸੰਚਾਲਨ ਅਤੇ ਪ੍ਰਬੰਧਨ ਕੌਣ ਕਰਦਾ ਹੈ?",
    "दैनिक आधार पर उद्यम का संचालन और प्रबंधन कौन करता है?": "ਰੋਜ਼ਾਨਾ ਅਧਾਰ ਤੇ ਉੱਦਮ ਦਾ ਸੰਚਾਲਨ ਅਤੇ ਪ੍ਰਬੰਧਨ ਕੌਣ ਕਰਦਾ ਹੈ?",
    "For how many hours in a day does the shop/enterprise remain open?": "ਦਿਨ ਵਿੱਚ ਕਿੰਨੇ ਘੰਟੇ ਦੁਕਾਨ/ਉੱਦਮ ਖੁੱਲ੍ਹਾ ਰਹਿੰਦਾ ਹੈ?",
    "दिन में कितने घंटे दुकान/उद्यम खुला रहता है?": "ਦਿਨ ਵਿੱਚ ਕਿੰਨੇ ਘੰਟੇ ਦੁਕਾਨ/ਉੱਦਮ ਖੁੱਲ੍ਹਾ ਰਹਿੰਦਾ ਹੈ?",
    "What is the type of business place / premises?": "ਕਾਰੋਬਾਰੀ ਥਾਂ/ਇਮਾਰਤ ਦੀ ਕਿਸਮ ਕੀ ਹੈ?",
    "व्यावसायिक स्थान/परिसर का प्रकार क्या है?": "ਕਾਰੋਬਾਰੀ ਥਾਂ/ਇਮਾਰਤ ਦੀ ਕਿਸਮ ਕੀ ਹੈ?",
    "Does SHG member maintain written records of business transactions regularly?": "ਕੀ SHG ਮੈਂਬਰ ਨਿਯਮਿਤ ਤੌਰ ਤੇ ਵਪਾਰਕ ਲੈਣ-ਦੇਣ ਦਾ ਲਿਖਤੀ ਰਿਕਾਰਡ ਰੱਖਦੇ ਹਨ?",
    "क्या एसएचजी सदस्य नियमित रूप से व्यावसायिक लेन-देन का लिखित रिकॉर्ड रखते हैं?": "ਕੀ SHG ਮੈਂਬਰ ਨਿਯਮਿਤ ਤੌਰ ਤੇ ਵਪਾਰਕ ਲੈਣ-ਦੇਣ ਦਾ ਲਿਖਤੀ ਰਿਕਾਰਡ ਰੱਖਦੇ ਹਨ?",
    "In the first year of your enterprise, what was the amount of seed capital (Rs)?": "ਤੁਹਾਡੇ ਉੱਦਮ ਦੇ ਪਹਿਲੇ ਸਾਲ ਵਿੱਚ ਸ਼ੁਰੂਆਤੀ ਪੂੰਜੀ (ਰੁਪਏ) ਕਿੰਨੀ ਸੀ?",
    "आपके उद्यम के पहले वर्ष में प्रारंभिक बीज पूंजी की राशि (रु) क्या थी?": "ਤੁਹਾਡੇ ਉੱਦਮ ਦੇ ਪਹਿਲੇ ਸਾਲ ਵਿੱਚ ਸ਼ੁਰੂਆਤੀ ਪੂੰਜੀ (ਰੁਪਏ) ਕਿੰਨੀ ਸੀ?",
    "How do you manage working capital during peak season?": "ਪੀਕ ਸੀਜ਼ਨ ਦੌਰਾਨ ਤੁਸੀਂ ਵਰਕਿੰਗ ਕੈਪੀਟਲ ਦਾ ਪ੍ਰਬੰਧ ਕਿਵੇਂ ਕਰਦੇ ਹੋ?",
    "पीक सीजन के दौरान आप कार्यशील पूंजी का प्रबंधन कैसे करते हैं?": "ਪੀਕ ਸੀਜ਼ਨ ਦੌਰਾਨ ਤੁਸੀਂ ਵਰਕਿੰਗ ਕੈਪੀਟਲ ਦਾ ਪ੍ਰਬੰਧ ਕਿਵੇਂ ਕਰਦੇ ਹੋ?",
    "Is the location of your space convenient for your business?": "ਕੀ ਤੁਹਾਡੀ ਥਾਂ ਤੁਹਾਡੇ ਕਾਰੋਬਾਰ ਲਈ ਸੁਵਿਧਾਜਨਕ ਹੈ?",
    "क्या आपके स्थान की स्थिति आपके व्यवसाय के लिए सुविधाजनक है?": "ਕੀ ਤੁਹਾਡੀ ਥਾਂ ਤੁਹਾਡੇ ਕਾਰੋਬਾਰ ਲਈ ਸੁਵਿਧਾਜਨਕ ਹੈ?",
    "Are you satisfied and happy with your wholesale supplier?": "ਕੀ ਤੁਸੀਂ ਆਪਣੇ ਥੋਕ ਸਪਲਾਇਰ ਤੋਂ ਸੰਤੁਸ਼ਟ ਹੋ?",
    "क्या आप अपने थोक सप्लायर से संतुष्ट और खुश हैं?": "ਕੀ ਤੁਸੀਂ ਆਪਣੇ ਥੋਕ ਸਪਲਾਇਰ ਤੋਂ ਸੰਤੁਸ਼ਟ ਹੋ?",
    "Are you able to recover credit / money from your customers?": "ਕੀ ਤੁਸੀਂ ਗਾਹਕਾਂ ਤੋਂ ਉਧਾਰ/ਪੈਸੇ ਵਾਪਸ ਲੈਣ ਦੇ ਯੋਗ ਹੋ?",
    "क्या आप अपने ग्राहकों से उधारी/पैसा वसूल पाते हैं?": "ਕੀ ਤੁਸੀਂ ਗਾਹਕਾਂ ਤੋਂ ਉਧਾਰ/ਪੈਸੇ ਵਾਪਸ ਲੈਣ ਦੇ ਯੋਗ ਹੋ?",
    "Do you source raw materials/goods from market independently?": "ਕੀ ਤੁਸੀਂ ਬਜ਼ਾਰ ਤੋਂ ਸੁਤੰਤਰ ਤੌਰ ਤੇ ਕੱਚਾ ਮਾਲ ਲਿਆਉਂਦੇ ਹੋ?",
    "क्या आप बाजार से स्वतंत्र रूप से कच्चा माल/सामान लाते हैं?": "ਕੀ ਤੁਸੀਂ ਬਜ਼ਾਰ ਤੋਂ ਸੁਤੰਤਰ ਤੌਰ ਤੇ ਕੱਚਾ ਮਾਲ ਲਿਆਉਂਦੇ ਹੋ?",
    "Do you have easy access to loans from different sources?": "ਕੀ ਤੁਹਾਨੂੰ ਵੱਖ-ਵੱਖ ਸਰੋਤਾਂ ਤੋਂ ਆਸਾਨੀ ਨਾਲ ਕਰਜ਼ਾ ਮਿਲਦਾ ਹੈ?",
    "क्या आपको विभिन्न स्रोतों से ऋण की आसान पहुँच प्राप्त है?": "ਕੀ ਤੁਹਾਨੂੰ ਵੱਖ-ਵੱਖ ਸਰੋਤਾਂ ਤੋਂ ਆਸਾਨੀ ਨਾਲ ਕਰਜ਼ਾ ਮਿਲਦਾ ਹੈ?",
    "How much loan amount have you availed under SVEP / OSF scheme (Rs)?": "ਤੁਸੀਂ SVEP / OSF ਸਕੀਮ ਅਧੀਨ ਕਿੰਨਾ ਕਰਜ਼ਾ ਲਿਆ ਹੈ (ਰੁਪਏ)?",
    "आपने SVEP / OSF योजना के तहत कितनी ऋण राशि प्राप्त की है (रु)?": "ਤੁਸੀਂ SVEP / OSF ਸਕੀਮ ਅਧੀਨ ਕਿੰਨਾ ਕਰਜ਼ਾ ਲਿਆ ਹੈ (ਰੁਪਏ)?",
    "How did you utilize the enterprise loan?": "ਤੁਸੀਂ ਉੱਦਮ ਕਰਜ਼ੇ ਦੀ ਵਰਤੋਂ ਕਿਵੇਂ ਕੀਤੀ?",
    "आपने उद्यम ऋण का उपयोग किस प्रकार किया?": "ਤੁਸੀਂ ਉੱਦਮ ਕਰਜ਼ੇ ਦੀ ਵਰਤੋਂ ਕਿਵੇਂ ਕੀਤੀ?",
    "Monthly enterprise income BEFORE availing loan changes (Rs)?": "ਕਰਜ਼ਾ ਲੈਣ ਤੋਂ ਪਹਿਲਾਂ ਉੱਦਮ ਦੀ ਮਹੀਨਾਵਾਰ ਆਮਦਨ (ਰੁਪਏ)?",
    "ऋण से बदलाव करने से पहले उद्यम की मासिक आय (रु)?": "ਕਰਜ਼ਾ ਲੈਣ ਤੋਂ ਪਹਿਲਾਂ ਉੱਦਮ ਦੀ ਮਹੀਨਾਵਾਰ ਆਮਦਨ (ਰੁਪਏ)?",
    "Monthly enterprise income AFTER availing loan changes (Rs)?": "ਕਰਜ਼ਾ ਲੈਣ ਤੋਂ ਬਾਅਦ ਉੱਦਮ ਦੀ ਮਹੀਨਾਵਾਰ ਆਮਦਨ (ਰੁਪਏ)?",
    "ऋण से बदलाव करने के बाद उद्यम की मासिक आय (रु)?": "ਕਰਜ਼ਾ ਲੈਣ ਤੋਂ ਬਾਅਦ ਉੱਦਮ ਦੀ ਮਹੀਨਾਵਾਰ ਆਮਦਨ (ਰੁਪਏ)?",
    "What has been the contribution of SVEP / OSF CRPs?": "SVEP / OSF CRP ਦਾ ਕੀ ਯੋਗਦਾਨ ਰਿਹਾ ਹੈ?",
    "SVEP / OSF CRP का क्या योगदान रहा है?": "SVEP / OSF CRP ਦਾ ਕੀ ਯੋਗਦਾਨ ਰਿਹਾ ਹੈ?",
    "Does the woman entrepreneur own a smartphone?": "ਕੀ ਮਹਿਲਾ ਉੱਦਮੀ ਕੋਲ ਸਮਾਰਟਫੋਨ ਹੈ?",
    "क्या महिला उद्यमी के पास स्मार्टफोन है?": "ਕੀ ਮਹਿਲਾ ਉੱਦਮੀ ਕੋਲ ਸਮਾਰਟਫੋਨ ਹੈ?",
    "Do you use QR code / UPI / mobile banking for business transactions?": "ਕੀ ਤੁਸੀਂ ਵਪਾਰਕ ਲੈਣ-ਦੇਣ ਲਈ QR ਕੋਡ / UPI / ਮੋਬਾਈਲ ਬੈਂਕਿੰਗ ਦੀ ਵਰਤੋਂ ਕਰਦੇ ਹੋ?",
    "क्या आप व्यावसायिक लेन-देन के लिए क्यूआर कोड / यूपीआई / मोबाइल बैंकिंग का उपयोग करते हैं?": "ਕੀ ਤੁਸੀਂ ਵਪਾਰਕ ਲੈਣ-ਦੇਣ ਲਈ QR ਕੋਡ / UPI / ਮੋਬਾਈਲ ਬੈਂਕਿੰਗ ਦੀ ਵਰਤੋਂ ਕਰਦੇ ਹੋ?",
    "Daily how many transactions are done via QR code / UPI?": "ਰੋਜ਼ਾਨਾ QR ਕੋਡ / UPI ਦੁਆਰਾ ਕਿੰਨੇ ਲੈਣ-ਦੇਣ ਕੀਤੇ ਜਾਂਦੇ ਹਨ?",
    "प्रतिदिन क्यूआर कोड / यूपीआई द्वारा कितने लेन-देन होते हैं?": "ਰੋਜ਼ਾਨਾ QR ਕੋਡ / UPI ਦੁਆਰਾ ਕਿੰਨੇ ਲੈਣ-ਦੇਣ ਕੀਤੇ ਜਾਂਦੇ ਹਨ?",
    "Which social media platforms do you use for your business?": "ਤੁਸੀਂ ਆਪਣੇ ਕਾਰੋਬਾਰ ਲਈ ਕਿਹੜੇ ਸੋਸ਼ਲ ਮੀਡੀਆ ਪਲੇਟਫਾਰਮ ਵਰਤਦੇ ਹੋ?",
    "आप अपने व्यवसाय के लिए किन सोशल मीडिया प्लेटफॉर्म का उपयोग करते हैं?": "ਤੁਸੀਂ ਆਪਣੇ ਕਾਰੋਬਾਰ ਲਈ ਕਿਹੜੇ ਸੋਸ਼ਲ ਮੀਡੀਆ ਪਲੇਟਫਾਰਮ ਵਰਤਦੇ ਹੋ?",
    "Capture Enterprise GPS Location (Satellite Coordinates)": "ਉੱਦਮ ਜੀਪੀਐਸ ਸਥਾਨ ਕੈਪਚਰ ਕਰੋ (ਉਪਗ੍ਰਹਿ ਨਿਰਦੇਸ਼ਾਂਕ)",
    "उद्यम जीपीएस लोकेशन कैप्चर करें (उपग्रह निर्देशांक)": "ਉੱਦਮ ਜੀਪੀਐਸ ਸਥਾਨ ਕੈਪਚਰ ਕਰੋ (ਉਪਗ੍ਰਹਿ ਨਿਰਦੇਸ਼ਾਂਕ)",
    "Field Photo of Enterprise & Beneficiary": "ਉੱਦਮ ਅਤੇ ਲਾਭਪਾਤਰੀ ਦੀ ਫੀਲਡ ਫੋਟੋ",
    "उद्यम और लाभार्थी का फील्ड फोटो": "ਉੱਦਮ ਅਤੇ ਲਾਭਪਾਤਰੀ ਦੀ ਫੀਲਡ ਫੋਟੋ",
    "Respondent & Surveyor Digital Signature": "ਉੱਤਰਦਾਤਾ ਅਤੇ ਸਰਵੇਖਕ ਦੇ ਡਿਜੀਟਲ ਦਸਤਖਤ",
    "उत्तरदाता और सर्वेक्षक के डिजिटल हस्ताक्षर": "ਉੱਤਰਦਾਤਾ ਅਤੇ ਸਰਵੇਖਕ ਦੇ ਡਿਜੀਟਲ ਦਸਤਖਤ",
    "Yes": "ਹਾਂ",
    "हाँ": "ਹਾਂ",
    "No": "ਨਹੀਂ",
    "नहीं": "ਨਹੀਂ",
    "Baran": "ਬਾਰਾਂ",
    "बारां": "ਬਾਰਾਂ",
    "Churu": "ਚੁਰੂ",
    "चूरू": "ਚੁਰੂ",
    "Dausa": "ਦੌਸਾ",
    "दौसा": "ਦੌਸਾ",
    "Dungarpur": "ਡੂੰਗਰਪੁਰ",
    "डूंगरपुर": "ਡੂੰਗਰਪੁਰ",
    "Jodhpur": "ਜੋਧਪੁਰ",
    "जोधपुर": "ਜੋਧਪੁਰ",
    "Chhipabarod": "ਛੀਪਾਬੜੌਦ",
    "छीपाबड़ौद": "ਛੀਪਾਬੜੌਦ",
    "Kishanganj": "ਕਿਸ਼ਨਗੰਜ",
    "किशनगंज": "ਕਿਸ਼ਨਗੰਜ",
    "Sardar Sheher": "ਸਰਦਾਰਸ਼ਹਿਰ",
    "सरदारशहर": "ਸਰਦਾਰਸ਼ਹਿਰ",
    "Bidasar": "ਬੀਦਾਸਰ",
    "बीदासर": "ਬੀਦਾਸਰ",
    "Secundra": "ਸਿਕੰਦਰਾ",
    "सिकंदरा": "ਸਿਕੰਦਰਾ",
    "Sagwara": "ਸਾਗਵਾੜਾ",
    "सागवाड़ा": "ਸਾਗਵਾੜਾ",
    "Galiakot": "ਗਲਿਆਕੋਟ",
    "गलियाकोट": "ਗਲਿਆਕੋਟ",
    "Bicchiwada": "ਬਿਛੀਵਾੜਾ",
    "बिछीवाड़ा": "ਬਿਛੀਵਾੜਾ",
    "Jodhpur Block": "ਜੋਧਪੁਰ ਬਲਾਕ",
    "जोधपुर ब्लॉक": "ਜੋਧਪੁਰ ਬਲਾਕ",
    "Married": "ਵਿਆਹੁਤਾ",
    "विवाहित": "ਵਿਆਹੁਤਾ",
    "Single": "ਕੁਆਰਾ/ਕੁਆਰੀ",
    "अविवाहित": "ਕੁਆਰਾ/ਕੁਆਰੀ",
    "Widowed": "ਵਿਧਵਾ",
    "विधवा": "ਵਿਧਵਾ",
    "Divorced": "ਤਲਾਕਸ਼ੁਦਾ",
    "तलाकशुदा": "ਤਲਾਕਸ਼ੁਦਾ",
    "Separated": "ਵੱਖ ਰਹਿ ਰਹੇ",
    "अलग रह रहे": "ਵੱਖ ਰਹਿ ਰਹੇ",
    "General": "ਜਨਰਲ (General)",
    "सामान्य": "ਜਨਰਲ (General)",
    "OBC": "ਹੋਰ ਪੱਛੜੀਆਂ ਸ਼੍ਰੇਣੀਆਂ (OBC)",
    "अन्य पिछड़ा वर्ग (OBC)": "ਹੋਰ ਪੱਛੜੀਆਂ ਸ਼੍ਰੇਣੀਆਂ (OBC)",
    "SC": "ਅਨੁਸੂਚਿਤ ਜਾਤੀ (SC)",
    "अनुसूचित जाति (SC)": "ਅਨੁਸੂਚਿਤ ਜਾਤੀ (SC)",
    "ST": "ਅਨੁਸੂਚਿਤ ਜਨਜਾਤੀ (ST)",
    "अनुसूचित जनजाति (ST)": "ਅਨੁਸੂਚਿਤ ਜਨਜਾਤੀ (ST)",
    "Illiterate": "ਅਨਪੜ੍ਹ",
    "निरक्षर / अनपढ़": "ਅਨਪੜ੍ਹ",
    "Illiterate but able to calculate": "ਅਨਪੜ੍ਹ ਪਰ ਹਿਸਾਬ-ਕਿਤਾਬ ਕਰ ਸਕਦੇ ਹਨ",
    "अनपढ़ लेकिन हिसाब-किताब में सक्षम": "ਅਨਪੜ੍ਹ ਪਰ ਹਿਸਾਬ-ਕਿਤਾਬ ਕਰ ਸਕਦੇ ਹਨ",
    "5th pass": "੫ਵੀਂ ਪਾਸ",
    "5वीं पास": "੫ਵੀਂ ਪਾਸ",
    "8th pass": "੮ਵੀਂ ਪਾਸ",
    "8वीं पास": "੮ਵੀਂ ਪਾਸ",
    "10th pass": "੧੦ਵੀਂ ਪਾਸ",
    "10वीं पास": "੧੦ਵੀਂ ਪਾਸ",
    "12th pass": "੧੨ਵੀਂ ਪਾਸ",
    "12वीं पास": "੧੨ਵੀਂ ਪਾਸ",
    "Graduate": "ਗ੍ਰੈਜੂਏਟ (Graduate)",
    "स्नातक (Graduate)": "ਗ੍ਰੈਜੂਏਟ (Graduate)",
    "Self": "ਖੁਦ",
    "स्वयं": "ਖੁਦ",
    "Husband": "ਪਤੀ",
    "पति": "ਪਤੀ",
    "Son": "ਪੁੱਤਰ",
    "पुत्र / बेटा": "ਪੁੱਤਰ",
    "Daughter": "ਧੀ",
    "पुत्री / बेटी": "ਧੀ",
    "Member": "ਆਮ ਮੈਂਬਰ",
    "सामान्य सदस्य": "ਆਮ ਮੈਂਬਰ",
    "Leadership role": "ਅਹੁਦੇਦਾਰ / ਲੀਡਰਸ਼ਿਪ (ਪ੍ਰਧਾਨ/ਸਕੱਤਰ/ਖਜ਼ਾਨਚੀ)",
    "पदाधिकारी / नेतृत्व पद (अध्यक्ष/सचिव/कोषाध्यक्ष)": "ਅਹੁਦੇਦਾਰ / ਲੀਡਰਸ਼ਿਪ (ਪ੍ਰਧਾਨ/ਸਕੱਤਰ/ਖਜ਼ਾਨਚੀ)",
    "Grocery / Kirana": "ਕਰਿਆਨੇ ਦੀ ਦੁਕਾਨ",
    "किराना दुकान": "ਕਰਿਆਨੇ ਦੀ ਦੁਕਾਨ",
    "General store": "ਜਨਰਲ ਸਟੋਰ",
    "जनरल स्टोर": "ਜਨਰਲ ਸਟੋਰ",
    "Leather & footwear": "ਚਮੜਾ ਅਤੇ ਜੁੱਤੀਆਂ",
    "चमड़ा व जूते-चप्पल": "ਚਮੜਾ ਅਤੇ ਜੁੱਤੀਆਂ",
    "Flour mill": "ਆਟਾ ਚੱਕੀ",
    "आटा चक्की": "ਆਟਾ ਚੱਕੀ",
    "Tailoring & Stitching": "ਸਿਲਾਈ ਅਤੇ ਕਢਾਈ ਕੇਂਦਰ",
    "सिलाई व कढ़ाई केंद्र": "ਸਿਲਾਈ ਅਤੇ ਕਢਾਈ ਕੇਂਦਰ",
    "Apparel & Garments": "ਰੈਡੀਮੇਡ ਕੱਪੜੇ",
    "रेडीमेड वस्त्र": "ਰੈਡੀਮੇਡ ਕੱਪੜੇ",
    "Beauty parlour": "ਬਿਊਟੀ ਪਾਰਲਰ",
    "ब्यूटी पार्लर": "ਬਿਊਟੀ ਪਾਰਲਰ",
    "Handicraft": "ਹਸਤਕਲਾ / ਹੈਂਡੀਕਰਾਫਟ",
    "हस्तशिल्प / हैंडीक्राफ्ट": "ਹਸਤਕਲਾ / ਹੈਂਡੀਕਰਾਫਟ",
    "Dairy shop": "ਡੇਅਰੀ ਅਤੇ ਦੁੱਧ ਕੇਂਦਰ",
    "डेयरी व दूध केंद्र": "ਡੇਅਰੀ ਅਤੇ ਦੁੱਧ ਕੇਂਦਰ",
    "Auto-mechanic": "ਆਟੋ ਮਕੈਨਿਕ",
    "ऑटो मैकेनिक": "ਆਟੋ ਮਕੈਨਿਕ",
    "E-mitra": "ਈ-ਮਿੱਤਰ / ਸੀ.ਐੱਸ.ਸੀ ਕੇਂਦਰ",
    "ई-मित्र केंद्र / ग्राहक सेवा केंद्र": "ਈ-ਮਿੱਤਰ / ਸੀ.ਐੱਸ.ਸੀ ਕੇਂਦਰ",
    "Mobile repair shop": "ਮੋਬਾਈਲ ਰਿਪੇਅਰ ਦੁਕਾਨ",
    "मोबाइल रिपेयर दुकान": "ਮੋਬਾਈਲ ਰਿਪੇਅਰ ਦੁਕਾਨ",
    "Transport": "ਟਰਾਂਸਪੋਰਟ ਸੇਵਾ",
    "परिवहन सेवा": "ਟਰਾਂਸਪੋਰਟ ਸੇਵਾ",
    "Any other": "ਕੋਈ ਹੋਰ",
    "अन्य कोई": "ਕੋਈ ਹੋਰ",
    "Whatsapp": "ਵਟਸਐਪ",
    "व्हाट्सएप (WhatsApp)": "ਵਟਸਐਪ",
    "Facebook": "ਫੇਸਬੁੱਕ",
    "फेसबुक (Facebook)": "ਫੇਸਬੁੱਕ",
    "Instagram": "ਇੰਸਟਾਗ੍ਰਾਮ",
    "इंस्टाग्राम (Instagram)": "ਇੰਸਟਾਗ੍ਰਾਮ",
    "Don't use social media": "ਸੋਸ਼ਲ ਮੀਡੀਆ ਦੀ ਵਰਤੋਂ ਨਹੀਂ ਕਰਦੇ",
    "सोशल मीडिया का उपयोग नहीं करते": "ਸੋਸ਼ਲ ਮੀਡੀਆ ਦੀ ਵਰਤੋਂ ਨਹੀਂ ਕਰਦੇ",
    "Draft": "ਡਰਾਫਟ",
    "Save Draft": "ਡਰਾਫਟ ਸੰਭਾਲੋ",
    "ड्राफ्ट": "ਡਰਾਫਟ",
    "मसुदा": "ਡਰਾਫਟ",
    "ડ્રાફ્ટ": "ਡਰਾਫਟ",
    "ਡਰਾਫਟ": "ਡਰਾਫਟ",
    "খসড়া": "ਡਰਾਫਟ",
    "வரைவு": "ਡਰਾਫਟ",
    "చిత్తుప్రతి": "ਡਰਾਫਟ",
    "ಕರಡು": "ਡਰਾਫਟ",
    "ഡ്രാഫ്റ്റ്": "ਡਰਾਫਟ",
    "ڈرافٹ": "ਡਰਾਫਟ",
    "ड्राफ्ट सेव करें": "ਡਰਾਫਟ ਸੰਭਾਲੋ",
    "मसुदा जतन करा": "ਡਰਾਫਟ ਸੰਭਾਲੋ",
    "ડ્રાફ્ટ સાચવો": "ਡਰਾਫਟ ਸੰਭਾਲੋ",
    "ਡਰਾਫਟ ਸੰਭਾਲੋ": "ਡਰਾਫਟ ਸੰਭਾਲੋ",
    "খসড়া সংরক্ষণ": "ਡਰਾਫਟ ਸੰਭਾਲੋ",
    "வரைவு சேமி": "ਡਰਾਫਟ ਸੰਭਾਲੋ",
    "చిత్తుప్రతి భద్రపరచు": "ਡਰਾਫਟ ਸੰਭਾਲੋ",
    "ಕರಡು ಉಳಿಸಿ": "ਡਰਾਫਟ ਸੰਭਾਲੋ",
    "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക": "ਡਰਾਫਟ ਸੰਭਾਲੋ",
    "ڈرافٹ محفوظ کریں": "ਡਰਾਫਟ ਸੰਭਾਲੋ"
  },
  "bn": {
    "OmniServey": "অমনিসার্ভে",
    "ओमनीसर्वे": "অমনিসার্ভে",
    "Online": "অনলাইন",
    "ऑनलाइन": "অনলাইন",
    "Offline": "অফলাইন",
    "ऑफलाइन": "অফলাইন",
    "Surveys": "জরিপ",
    "सर्वेक्षण": "জরিপ",
    "WAL Queue": "সারি (অফলাইন)",
    "कतार (ऑफलाइन)": "সারি (অফলাইন)",
    "System": "সিস্টেম",
    "सिस्टम": "সিস্টেম",
    "Exit Form": "← প্রস্থান",
    "← बाहर निकलें": "← প্রস্থান",
    "Step": "ধাপ",
    "चरण": "ধাপ",
    "of": "এর",
    "का": "এর",
    "Pages": "পৃষ্ঠা",
    "पृष्ठ": "পৃষ্ঠা",
    "Questions": "প্রশ্ন",
    "प्रश्न": "প্রশ্ন",
    "Previous": "← পূর্ববর্তী",
    "← पिछला": "← পূর্ববর্তী",
    "Next": "পরবর্তী →",
    "अगला →": "পরবর্তী →",
    "Save Offline": "অফলাইনে সংরক্ষণ করুন",
    "ऑफलाइन सेव करें": "অফলাইনে সংরক্ষণ করুন",
    "Submit Survey": "জমা দিন",
    "सबमिट करें": "জমা দিন",
    "Capture GPS Coordinates": "জিপিএস লোকেশন সংরক্ষণ করুন",
    "जीपीएस लोकेशन रिकॉर्ड करें": "জিপিএস লোকেশন সংরক্ষণ করুন",
    "GPS Fix Acquired ✓": "জিপিএস লোকেশন পাওয়া গেছে ✓",
    "जीपीएस लोकेशन प्राप्त हुआ ✓": "জিপিএস লোকেশন পাওয়া গেছে ✓",
    "Take Photo / Choose File": "ছবি তুলুন / ফাইল বাছাই করুন",
    "फोटो लें / फाइल चुनें": "ছবি তুলুন / ফাইল বাছাই করুন",
    "Sign inside box with finger or stylus": "আপনার আঙুল বা স্টাইলাস দিয়ে বাক্সে স্বাক্ষর করুন",
    "अपनी उंगली या स्टाइलस से बॉक्स में हस्ताक्षर करें": "আপনার আঙুল বা স্টাইলাস দিয়ে বাক্সে স্বাক্ষর করুন",
    "Clear Signature": "স্বাক্ষর মুছুন",
    "हस्ताक्षर मिटाएं": "স্বাক্ষর মুছুন",
    "Signature Recorded": "স্বাক্ষর রেকর্ড করা হয়েছে",
    "हस्ताक्षर दर्ज हुआ": "স্বাক্ষর রেকর্ড করা হয়েছে",
    "Enter response here...": "এখানে উত্তর লিখুন...",
    "यहाँ उत्तर दर्ज करें...": "এখানে উত্তর লিখুন...",
    "Required Questions Pending": "প্রয়োজনীয় প্রশ্ন বাকি আছে",
    "आवश्यक प्रश्न अधूरे हैं": "প্রয়োজনীয় প্রশ্ন বাকি আছে",
    "Please fill in these required fields before final submission, or save as an offline draft anytime.": "চূড়ান্ত জমা দেওয়ার আগে অনুগ্রহ করে এই প্রয়োজনীয় প্রশ্নগুলি পূরণ করুন, অথবা যে কোনো সময় অফলাইন খসড়া হিসেবে সংরক্ষণ করুন।",
    "अंतिम सबमिशन से पहले कृपया इन आवश्यक प्रश्नों को भरें, या कभी भी ऑफलाइन ड्राफ्ट के रूप में सुरक्षित करें।": "চূড়ান্ত জমা দেওয়ার আগে অনুগ্রহ করে এই প্রয়োজনীয় প্রশ্নগুলি পূরণ করুন, অথবা যে কোনো সময় অফলাইন খসড়া হিসেবে সংরক্ষণ করুন।",
    "Go to First Pending Question": "👉 প্রথম অসম্পূর্ণ প্রশ্নে যান",
    "👉 पहले अधूरे प्रश्न पर जाएं": "👉 প্রথম অসম্পূর্ণ প্রশ্নে যান",
    "Save as Offline Draft Anyway": "অফলাইন খসড়া সংরক্ষণ করুন",
    "💾 ऑफलाइन ड्राफ्ट सुरक्षित करें": "অফলাইন খসড়া সংরক্ষণ করুন",
    "Close": "বন্ধ করুন",
    "बंद करें": "বন্ধ করুন",
    "Start Survey Form": "জরিপ শুরু করুন",
    "सर्वेक्षण शुरू करें": "জরিপ শুরু করুন",
    "Start Survey Form →": "জরিপ শুরু করুন →",
    "सर्वेक्षण शुरू करें →": "জরিপ শুরু করুন →",
    "Write-Ahead Log (WAL)": "রাইট-অ্যাহেড লগ (WAL সারি)",
    "राइट-अहेड लॉग (WAL कतार)": "রাইট-অ্যাহেড লগ (WAL সারি)",
    "Atomic zero-loss local storage queue": "শূন্য ডেটা ক্ষতি নিরাপদ স্থানীয় সঞ্চয়স্থান",
    "शून्य डेटा हानि सुरक्षित स्थानीय भंडारण": "শূন্য ডেটা ক্ষতি নিরাপদ স্থানীয় সঞ্চয়স্থান",
    "Sync Now": "⟳ এখনই সিঙ্ক করুন",
    "⟳ अभी सिंक करें": "⟳ এখনই সিঙ্ক করুন",
    "View on Map →": "মানচিত্রে দেখুন →",
    "नक्शे पर देखें →": "মানচিত্রে দেখুন →",
    "Re-acquire Fix": "পুনরায় চেষ্টা করুন",
    "पुनः प्रयास करें": "পুনরায় চেষ্টা করুন",
    "Section A: Basic Details": "বিভাগ ক: মৌলিক বিবরণ",
    "भाग क: बुनियादी विवरण": "বিভাগ ক: মৌলিক বিবরণ",
    "Section B: Respondent & Household Profile": "বিভাগ খ: উত্তরদাতা ও পরিবারের প্রোফাইল",
    "भाग ख: उत्तरदाता और परिवार की प्रोफ़ाइल": "বিভাগ খ: উত্তরদাতা ও পরিবারের প্রোফাইল",
    "Section C: Enterprise Operations & Finance": "বিভাগ গ: উদ্যোগ পরিচালনা ও অর্থায়ন",
    "भाग ग: उद्यम संचालन और वित्त": "বিভাগ গ: উদ্যোগ পরিচালনা ও অর্থায়ন",
    "Section D: Enterprise Challenges & Coping Mechanisms": "বিভাগ ঘ: ব্যবসায়িক চ্যালেঞ্জ ও সমাধান",
    "भाग घ: उद्यम चुनौतियाँ और समाधान": "বিভাগ ঘ: ব্যবসায়িক চ্যালেঞ্জ ও সমাধান",
    "Section E: Impact of SVEP / OSF Schemes": "বিভাগ ঙ: এসভিইপি / ওএসএফ স্কিমের প্রভাব",
    "भाग ङ: एसवीईपी / ओएसएफ योजनाओं का प्रभाव": "বিভাগ ঙ: এসভিইপি / ওএসএফ স্কিমের প্রভাব",
    "Section F: Digital Transactions & Social Media": "বিভাগ চ: ডিজিটাল লেনদেন ও সোশ্যাল মিডিয়া",
    "भाग च: डिजिटल लेन-देन और सोशल मीडिया": "বিভাগ চ: ডিজিটাল লেনদেন ও সোশ্যাল মিডিয়া",
    "Section G: Field Verification & Sign-off": "বিভাগ ছ: মাঠ পর্যায়ের যাচাইকরণ ও স্বাক্ষর",
    "भाग छ: फील्ड सत्यापन और हस्ताक्षर": "বিভাগ ছ: মাঠ পর্যায়ের যাচাইকরণ ও স্বাক্ষর",
    "District": "জেলা",
    "जिला": "জেলা",
    "Block / Tehsil": "ব্লক / তহশিল",
    "ब्लॉक / तहसील": "ব্লক / তহশিল",
    "Village / Gram Panchayat Name": "গ্রাম / গ্রাম পঞ্চায়েতের নাম",
    "गाँव / ग्राम पंचायत का नाम": "গ্রাম / গ্রাম পঞ্চায়েতের নাম",
    "Cluster Level Federation (CLF) Name": "ক্লাস্টার লেভেল ফেডারেশন (CLF) এর নাম",
    "क्लस्टर लेवल फेडरेशन (CLF) का नाम": "ক্লাস্টার লেভেল ফেডারেশন (CLF) এর নাম",
    "Village Organization (VO) Name": "গ্রাম সংগঠন (VO) এর নাম",
    "ग्राम संगठन (VO) का नाम": "গ্রাম সংগঠন (VO) এর নাম",
    "Self-Help Group (SHG) Name": "স্বনির্ভর দল (SHG) এর নাম",
    "स्वयं सहायता समूह (SHG) का नाम": "স্বনির্ভর দল (SHG) এর নাম",
    "Respondent Name": "উত্তরদাতার নাম",
    "उत्तरदाता का नाम": "উত্তরদাতার নাম",
    "Enterprise / Business Name": "উদ্যোগ / ব্যবসার নাম",
    "उद्यम / व्यवसाय का नाम": "উদ্যোগ / ব্যবসার নাম",
    "Year of Setting Up Enterprise": "উদ্যোগ প্রতিষ্ঠার বছর",
    "उद्यम स्थापना का वर्ष": "উদ্যোগ প্রতিষ্ঠার বছর",
    "Main Business Activity of the Enterprise": "উদ্যোগের প্রধান ব্যবসায়িক কার্যকলাপ",
    "उद्यम की मुख्य व्यावसायिक गतिविधि": "উদ্যোগের প্রধান ব্যবসায়িক কার্যকলাপ",
    "What is respondent's relation with SHG member?": "এসএইচজি সদস্যের সাথে উত্তরদাতার সম্পর্ক কী?",
    "उत्तरदाता का एसएचजी सदस्य से क्या संबंध है?": "এসএইচজি সদস্যের সাথে উত্তরদাতার সম্পর্ক কী?",
    "What is the age of SHG member?": "এসএইচজি সদস্যের বয়স কত?",
    "एसएचजी सदस्य की आयु क्या है?": "এসএইচজি সদস্যের বয়স কত?",
    "What is the marital status of the SHG member?": "এসএইচজি সদস্যের বৈবাহিক অবস্থা কী?",
    "एसएचजी सदस्य की वैवाहिक स्थिति क्या है?": "এসএইচজি সদস্যের বৈবাহিক অবস্থা কী?",
    "What is the social category / caste?": "সামাজিক বিভাগ / জাতি কী?",
    "सामाजिक श्रेणी / जाति क्या है?": "সামাজিক বিভাগ / জাতি কী?",
    "What is the education status of the SHG member?": "এসএইচজি সদস্যের শিক্ষাগত যোগ্যতা কী?",
    "एसएचजी सदस्य की शैक्षणिक स्थिति क्या है?": "এসএইচজি সদস্যের শিক্ষাগত যোগ্যতা কী?",
    "How many total members are in the family?": "পরিবারে মোট কতজন সদস্য আছেন?",
    "परिवार में कुल कितने सदस्य हैं?": "পরিবারে মোট কতজন সদস্য আছেন?",
    "What is your total annual household income?": "আপনার মোট বার্ষিক পারিবারিক আয় কত?",
    "आपकी कुल वार्षिक पारिवारिक आय कितनी है?": "আপনার মোট বার্ষিক পারিবারিক আয় কত?",
    "What is your role in the SHG?": "এসএইচজিতে আপনার ভূমিকা কী?",
    "एसएचजी में आपकी भूमिका क्या है?": "এসএইচজিতে আপনার ভূমিকা কী?",
    "Are you related to any of the SVEP / OSF CRP?": "আপনি কি কোনো SVEP / OSF CRP-এর সাথে সম্পর্কিত?",
    "क्या आप किसी SVEP / OSF CRP से संबंधित हैं?": "আপনি কি কোনো SVEP / OSF CRP-এর সাথে সম্পর্কিত?",
    "Who started the enterprise?": "উদ্যোগটি কে শুরু করেছিলেন?",
    "उद्यम किसने शुरू किया था?": "উদ্যোগটি কে শুরু করেছিলেন?",
    "Who operates and manages the enterprise on a daily basis?": "দৈনিক ভিত্তিতে উদ্যোগটি কে পরিচালনা করেন?",
    "दैनिक आधार पर उद्यम का संचालन और प्रबंधन कौन करता है?": "দৈনিক ভিত্তিতে উদ্যোগটি কে পরিচালনা করেন?",
    "For how many hours in a day does the shop/enterprise remain open?": "দিনে কত ঘণ্টা দোকান/উদ্যোগ খোলা থাকে?",
    "दिन में कितने घंटे दुकान/उद्यम खुला रहता है?": "দিনে কত ঘণ্টা দোকান/উদ্যোগ খোলা থাকে?",
    "What is the type of business place / premises?": "ব্যবসায়িক স্থান/জায়গার ধরন কী?",
    "व्यावसायिक स्थान/परिसर का प्रकार क्या है?": "ব্যবসায়িক স্থান/জায়গার ধরন কী?",
    "Does SHG member maintain written records of business transactions regularly?": "এসএইচজি সদস্য কি নিয়মিত ব্যবসায়িক লেনদেনের লিখিত রেকর্ড রাখেন?",
    "क्या एसएचजी सदस्य नियमित रूप से व्यावसायिक लेन-देन का लिखित रिकॉर्ड रखते हैं?": "এসএইচজি সদস্য কি নিয়মিত ব্যবসায়িক লেনদেনের লিখিত রেকর্ড রাখেন?",
    "In the first year of your enterprise, what was the amount of seed capital (Rs)?": "আপনার উদ্যোগের প্রথম বছরে প্রাথমিক মূলধন (টাকা) কত ছিল?",
    "आपके उद्यम के पहले वर्ष में प्रारंभिक बीज पूंजी की राशि (रु) क्या थी?": "আপনার উদ্যোগের প্রথম বছরে প্রাথমিক মূলধন (টাকা) কত ছিল?",
    "How do you manage working capital during peak season?": "পিক সিজনে আপনি কীভাবে চলতি মূলধন পরিচালনা করেন?",
    "पीक सीजन के दौरान आप कार्यशील पूंजी का प्रबंधन कैसे करते हैं?": "পিক সিজনে আপনি কীভাবে চলতি মূলধন পরিচালনা করেন?",
    "Is the location of your space convenient for your business?": "আপনার ব্যবসার জন্য জায়গাটির অবস্থান কি সুবিধাজনক?",
    "क्या आपके स्थान की स्थिति आपके व्यवसाय के लिए सुविधाजनक है?": "আপনার ব্যবসার জন্য জায়গাটির অবস্থান কি সুবিধাজনক?",
    "Are you satisfied and happy with your wholesale supplier?": "আপনি কি পাইকারি সরবরাহকারীর সাথে সন্তুষ্ট?",
    "क्या आप अपने थोक सप्लायर से संतुष्ट और खुश हैं?": "আপনি কি পাইকারি সরবরাহকারীর সাথে সন্তুষ্ট?",
    "Are you able to recover credit / money from your customers?": "আপনি কি গ্রাহকদের কাছ থেকে বাকি টাকা আদায় করতে পারেন?",
    "क्या आप अपने ग्राहकों से उधारी/पैसा वसूल पाते हैं?": "আপনি কি গ্রাহকদের কাছ থেকে বাকি টাকা আদায় করতে পারেন?",
    "Do you source raw materials/goods from market independently?": "আপনি কি বাজার থেকে স্বাধীনভাবে কাঁচামাল কেনেন?",
    "क्या आप बाजार से स्वतंत्र रूप से कच्चा माल/सामान लाते हैं?": "আপনি কি বাজার থেকে স্বাধীনভাবে কাঁচামাল কেনেন?",
    "Do you have easy access to loans from different sources?": "বিভিন্ন উৎস থেকে কি সহজে ঋণ পাওয়া যায়?",
    "क्या आपको विभिन्न स्रोतों से ऋण की आसान पहुँच प्राप्त है?": "বিভিন্ন উৎস থেকে কি সহজে ঋণ পাওয়া যায়?",
    "How much loan amount have you availed under SVEP / OSF scheme (Rs)?": "আপনি SVEP / OSF স্কিমের অধীনে কত ঋণের পরিমাণ নিয়েছেন (টাকা)?",
    "आपने SVEP / OSF योजना के तहत कितनी ऋण राशि प्राप्त की है (रु)?": "আপনি SVEP / OSF স্কিমের অধীনে কত ঋণের পরিমাণ নিয়েছেন (টাকা)?",
    "How did you utilize the enterprise loan?": "আপনি কীভাবে উদ্যোগের ঋণ ব্যবহার করেছেন?",
    "आपने उद्यम ऋण का उपयोग किस प्रकार किया?": "আপনি কীভাবে উদ্যোগের ঋণ ব্যবহার করেছেন?",
    "Monthly enterprise income BEFORE availing loan changes (Rs)?": "ঋণ নেওয়ার আগে উদ্যোগের মাসিক আয় (টাকা)?",
    "ऋण से बदलाव करने से पहले उद्यम की मासिक आय (रु)?": "ঋণ নেওয়ার আগে উদ্যোগের মাসিক আয় (টাকা)?",
    "Monthly enterprise income AFTER availing loan changes (Rs)?": "ঋণ নেওয়ার পরে উদ্যোগের মাসিক আয় (টাকা)?",
    "ऋण से बदलाव करने के बाद उद्यम की मासिक आय (रु)?": "ঋণ নেওয়ার পরে উদ্যোগের মাসিক আয় (টাকা)?",
    "What has been the contribution of SVEP / OSF CRPs?": "SVEP / OSF CRP-এর অবদান কী ছিল?",
    "SVEP / OSF CRP का क्या योगदान रहा है?": "SVEP / OSF CRP-এর অবদান কী ছিল?",
    "Does the woman entrepreneur own a smartphone?": "নারী উদ্যোক্তার কি স্মার্টফোন আছে?",
    "क्या महिला उद्यमी के पास स्मार्टफोन है?": "নারী উদ্যোক্তার কি স্মার্টফোন আছে?",
    "Do you use QR code / UPI / mobile banking for business transactions?": "আপনি কি ব্যবসায়িক লেনদেনের জন্য QR কোড / UPI / মোবাইল ব্যাঙ্কিং ব্যবহার করেন?",
    "क्या आप व्यावसायिक लेन-देन के लिए क्यूआर कोड / यूपीआई / मोबाइल बैंकिंग का उपयोग करते हैं?": "আপনি কি ব্যবসায়িক লেনদেনের জন্য QR কোড / UPI / মোবাইল ব্যাঙ্কিং ব্যবহার করেন?",
    "Daily how many transactions are done via QR code / UPI?": "প্রতিদিন QR কোড / UPI-এর মাধ্যমে কতগুলি লেনদেন হয়?",
    "प्रतिदिन क्यूआर कोड / यूपीआई द्वारा कितने लेन-देन होते हैं?": "প্রতিদিন QR কোড / UPI-এর মাধ্যমে কতগুলি লেনদেন হয়?",
    "Which social media platforms do you use for your business?": "আপনি আপনার ব্যবসার জন্য কোন সোশ্যাল মিডিয়া প্ল্যাটফর্ম ব্যবহার করেন?",
    "आप अपने व्यवसाय के लिए किन सोशल मीडिया प्लेटफॉर्म का उपयोग करते हैं?": "আপনি আপনার ব্যবসার জন্য কোন সোশ্যাল মিডিয়া প্ল্যাটফর্ম ব্যবহার করেন?",
    "Capture Enterprise GPS Location (Satellite Coordinates)": "উদ্যোগের জিপিএস অবস্থান ক্যাপচার করুন (স্যাটেলাইট স্থানাঙ্ক)",
    "उद्यम जीपीएस लोकेशन कैप्चर करें (उपग्रह निर्देशांक)": "উদ্যোগের জিপিএস অবস্থান ক্যাপচার করুন (স্যাটেলাইট স্থানাঙ্ক)",
    "Field Photo of Enterprise & Beneficiary": "উদ্যোগ ও সুবিধাভোগীর মাঠের ছবি",
    "उद्यम और लाभार्थी का फील्ड फोटो": "উদ্যোগ ও সুবিধাভোগীর মাঠের ছবি",
    "Respondent & Surveyor Digital Signature": "উত্তরদাতা ও সমীক্ষকের ডিজিটাল স্বাক্ষর",
    "उत्तरदाता और सर्वेक्षक के डिजिटल हस्ताक्षर": "উত্তরদাতা ও সমীক্ষকের ডিজিটাল স্বাক্ষর",
    "Yes": "হ্যাঁ",
    "हाँ": "হ্যাঁ",
    "No": "না",
    "नहीं": "না",
    "Baran": "বারান",
    "बारां": "বারান",
    "Churu": "চুরু",
    "चूरू": "চুরু",
    "Dausa": "দৌসা",
    "दौसा": "দৌসা",
    "Dungarpur": "ডুঙ্গারপুর",
    "डूंगरपुर": "ডুঙ্গারপুর",
    "Jodhpur": "যোধপুর",
    "जोधपुर": "যোধপুর",
    "Chhipabarod": "ছিপাবড়োদ",
    "छीपाबड़ौद": "ছিপাবড়োদ",
    "Kishanganj": "কিষাণগঞ্জ",
    "किशनगंज": "কিষাণগঞ্জ",
    "Sardar Sheher": "সরদারশহর",
    "सरदारशहर": "সরদারশহর",
    "Bidasar": "বিদাসর",
    "बीदासर": "বিদাসর",
    "Secundra": "সিকান্দরা",
    "सिकंदरा": "সিকান্দরা",
    "Sagwara": "সাগওয়ারা",
    "सागवाड़ा": "সাগওয়ারা",
    "Galiakot": "গালিয়াকোট",
    "गलियाकोट": "গালিয়াকোট",
    "Bicchiwada": "বিছিওয়ারা",
    "बिछीवाड़ा": "বিছিওয়ারা",
    "Jodhpur Block": "যোধপুর ব্লক",
    "जोधपुर ब्लॉक": "যোধপুর ব্লক",
    "Married": "বিবাহিত",
    "विवाहित": "বিবাহিত",
    "Single": "অবিবাহিত",
    "अविवाहित": "অবিবাহিত",
    "Widowed": "বিধবা",
    "विधवा": "বিধবা",
    "Divorced": "তালাকপ্রাপ্ত",
    "तलाकशुदा": "তালাকপ্রাপ্ত",
    "Separated": "পৃথক বসবাসকারী",
    "अलग रह रहे": "পৃথক বসবাসকারী",
    "General": "সাধারণ (General)",
    "सामान्य": "সাধারণ (General)",
    "OBC": "অন্যান্য অনগ্রসর শ্রেণী (OBC)",
    "अन्य पिछड़ा वर्ग (OBC)": "অন্যান্য অনগ্রসর শ্রেণী (OBC)",
    "SC": "তপশিলী জাতি (SC)",
    "अनुसूचित जाति (SC)": "তপশিলী জাতি (SC)",
    "ST": "তপশিলী উপজাতি (ST)",
    "अनुसूचित जनजाति (ST)": "তপশিলী উপজাতি (ST)",
    "Illiterate": "নিরক্ষর",
    "निरक्षर / अनपढ़": "নিরক্ষর",
    "Illiterate but able to calculate": "নিরক্ষর কিন্তু হিসাব করতে সক্ষম",
    "अनपढ़ लेकिन हिसाब-किताब में सक्षम": "নিরক্ষর কিন্তু হিসাব করতে সক্ষম",
    "5th pass": "৫ম শ্রেণী উত্তীর্ণ",
    "5वीं पास": "৫ম শ্রেণী উত্তীর্ণ",
    "8th pass": "৮ম শ্রেণী উত্তীর্ণ",
    "8वीं पास": "৮ম শ্রেণী উত্তীর্ণ",
    "10th pass": "১০ম শ্রেণী উত্তীর্ণ",
    "10वीं पास": "১০ম শ্রেণী উত্তীর্ণ",
    "12th pass": "১২ম শ্রেণী উত্তীর্ণ",
    "12वीं पास": "১২ম শ্রেণী উত্তীর্ণ",
    "Graduate": "স্নাতক (Graduate)",
    "स्नातक (Graduate)": "স্নাতক (Graduate)",
    "Self": "নিজে",
    "स्वयं": "নিজে",
    "Husband": "স্বামী",
    "पति": "স্বামী",
    "Son": "পুত্র / ছেলে",
    "पुत्र / बेटा": "পুত্র / ছেলে",
    "Daughter": "কন্যা / মেয়ে",
    "पुत्री / बेटी": "কন্যা / মেয়ে",
    "Member": "সাধারণ সদস্য",
    "सामान्य सदस्य": "সাধারণ সদস্য",
    "Leadership role": "নেতৃত্বের পদ (সভাপতি/সম্পাদক/কোষাধ্যক্ষ)",
    "पदाधिकारी / नेतृत्व पद (अध्यक्ष/सचिव/कोषाध्यक्ष)": "নেতৃত্বের পদ (সভাপতি/সম্পাদক/কোষাধ্যক্ষ)",
    "Grocery / Kirana": "মুদি দোকান",
    "किराना दुकान": "মুদি দোকান",
    "General store": "জেনারেল স্টোর",
    "जनरल स्टोर": "জেনারেল স্টোর",
    "Leather & footwear": "চামড়া ও জুতো",
    "चमड़ा व जूते-चप्पल": "চামড়া ও জুতো",
    "Flour mill": "ময়দার কল / আটা চাকি",
    "आटा चक्की": "ময়দার কল / আটা চাকি",
    "Tailoring & Stitching": "দর্জি ও সেলাই কেন্দ্র",
    "सिलाई व कढ़ाई केंद्र": "দর্জি ও সেলাই কেন্দ্র",
    "Apparel & Garments": "তৈরি পোশাক",
    "रेडीमेड वस्त्र": "তৈরি পোশাক",
    "Beauty parlour": "বিউটি পার্লার",
    "ब्यूटी पार्लर": "বিউটি পার্লার",
    "Handicraft": "হস্তশিল্প",
    "हस्तशिल्प / हैंडीक्राफ्ट": "হস্তশিল্প",
    "Dairy shop": "দুগ্ধজাত পণ্য ও দুধের কেন্দ্র",
    "डेयरी व दूध केंद्र": "দুগ্ধজাত পণ্য ও দুধের কেন্দ্র",
    "Auto-mechanic": "অটো মেকানিক",
    "ऑटो मैकेनिक": "অটো মেকানিক",
    "E-mitra": "ই-মিত্র / গ্রাহক সেবা কেন্দ্র",
    "ई-मित्र केंद्र / ग्राहक सेवा केंद्र": "ই-মিত্র / গ্রাহক সেবা কেন্দ্র",
    "Mobile repair shop": "মোবাইল মেরামত দোকান",
    "मोबाइल रिपेयर दुकान": "মোবাইল মেরামত দোকান",
    "Transport": "পরিবহন সেবা",
    "परिवहन सेवा": "পরিবহন সেবা",
    "Any other": "অন্যান্য",
    "अन्य कोई": "অন্যান্য",
    "Whatsapp": "হোয়াটসঅ্যাপ",
    "व्हाट्सएप (WhatsApp)": "হোয়াটসঅ্যাপ",
    "Facebook": "ফেসবুক",
    "फेसबुक (Facebook)": "ফেসবুক",
    "Instagram": "ইনস্টাগ্রাম",
    "इंस्टाग्राम (Instagram)": "ইনস্টাগ্রাম",
    "Don't use social media": "সোশ্যাল মিডিয়া ব্যবহার করি না",
    "सोशल मीडिया का उपयोग नहीं करते": "সোশ্যাল মিডিয়া ব্যবহার করি না",
    "Draft": "খসড়া",
    "Save Draft": "খসড়া সংরক্ষণ",
    "ड्राफ्ट": "খসড়া",
    "मसुदा": "খসড়া",
    "ડ્રાફ્ટ": "খসড়া",
    "ਡਰਾਫਟ": "খসড়া",
    "খসড়া": "খসড়া",
    "வரைவு": "খসড়া",
    "చిత్తుప్రతి": "খসড়া",
    "ಕರಡು": "খসড়া",
    "ഡ്രാഫ്റ്റ്": "খসড়া",
    "ڈرافٹ": "খসড়া",
    "ड्राफ्ट सेव करें": "খসড়া সংরক্ষণ",
    "मसुदा जतन करा": "খসড়া সংরক্ষণ",
    "ડ્રાફ્ટ સાચવો": "খসড়া সংরক্ষণ",
    "ਡਰਾਫਟ ਸੰਭਾਲੋ": "খসড়া সংরক্ষণ",
    "খসড়া সংরক্ষণ": "খসড়া সংরক্ষণ",
    "வரைவு சேமி": "খসড়া সংরক্ষণ",
    "చిత్తుప్రతి భద్రపరచు": "খসড়া সংরক্ষণ",
    "ಕರಡು ಉಳಿಸಿ": "খসড়া সংরক্ষণ",
    "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക": "খসড়া সংরক্ষণ",
    "ڈرافٹ محفوظ کریں": "খসড়া সংরক্ষণ"
  },
  "ta": {
    "OmniServey": "ஓம்னிசர்வே",
    "ओमनीसर्वे": "ஓம்னிசர்வே",
    "Online": "ஆன்லைன்",
    "ऑनलाइन": "ஆன்லைன்",
    "Offline": "ஆஃப்லைன்",
    "ऑफलाइन": "ஆஃப்லைன்",
    "Surveys": "கணிப்புகள்",
    "सर्वेक्षण": "கணிப்புகள்",
    "WAL Queue": "வரிசை (ஆஃப்லைன்)",
    "कतार (ऑफलाइन)": "வரிசை (ஆஃப்லைன்)",
    "System": "கணினி",
    "सिस्टम": "கணினி",
    "Exit Form": "← வெளியேறு",
    "← बाहर निकलें": "← வெளியேறு",
    "Step": "படி",
    "चरण": "படி",
    "of": "இல்",
    "का": "இல்",
    "Pages": "பக்கங்கள்",
    "पृष्ठ": "பக்கங்கள்",
    "Questions": "கேள்விகள்",
    "प्रश्न": "கேள்விகள்",
    "Previous": "← முந்தையது",
    "← पिछला": "← முந்தையது",
    "Next": "அடுத்தது →",
    "अगला →": "அடுத்தது →",
    "Save Offline": "ஆஃப்லைனில் சேமிக்கவும்",
    "ऑफलाइन सेव करें": "ஆஃப்லைனில் சேமிக்கவும்",
    "Submit Survey": "சமர்ப்பிக்கவும்",
    "सबमिट करें": "சமர்ப்பிக்கவும்",
    "Capture GPS Coordinates": "ஜிபிஎஸ் இருப்பிடத்தை பதிவு செய்",
    "जीपीएस लोकेशन रिकॉर्ड करें": "ஜிபிஎஸ் இருப்பிடத்தை பதிவு செய்",
    "GPS Fix Acquired ✓": "ஜிபிஎஸ் நிலை பெறப்பட்டது ✓",
    "जीपीएस लोकेशन प्राप्त हुआ ✓": "ஜிபிஎஸ் நிலை பெறப்பட்டது ✓",
    "Take Photo / Choose File": "படம் எடுக்கவும் / கோப்பை தேர்ந்தெடுக்கவும்",
    "फोटो लें / फाइल चुनें": "படம் எடுக்கவும் / கோப்பை தேர்ந்தெடுக்கவும்",
    "Sign inside box with finger or stylus": "விரல் அல்லது ஸ்டைலஸால் பெட்டியில் கையொப்பமிடுங்கள்",
    "अपनी उंगली या स्टाइलस से बॉक्स में हस्ताक्षर करें": "விரல் அல்லது ஸ்டைலஸால் பெட்டியில் கையொப்பமிடுங்கள்",
    "Clear Signature": "கையொப்பத்தை அழிக்கவும்",
    "हस्ताक्षर मिटाएं": "கையொப்பத்தை அழிக்கவும்",
    "Signature Recorded": "கையொப்பம் பதிவு செய்யப்பட்டது",
    "हस्ताक्षर दर्ज हुआ": "கையொப்பம் பதிவு செய்யப்பட்டது",
    "Enter response here...": "இங்கே பதில் உள்ளிடவும்...",
    "यहाँ उत्तर दर्ज करें...": "இங்கே பதில் உள்ளிடவும்...",
    "Required Questions Pending": "கட்டாய கேள்விகள் நிலுவையில் உள்ளன",
    "आवश्यक प्रश्न अधूरे हैं": "கட்டாய கேள்விகள் நிலுவையில் உள்ளன",
    "Please fill in these required fields before final submission, or save as an offline draft anytime.": "இறுதி சமர்ப்பிப்பிற்கு முன் இந்த கட்டாய புலங்களை நிரப்பவும், அல்லது ஆஃப்லைன் வரைவாக சேமிக்கவும்.",
    "अंतिम सबमिशन से पहले कृपया इन आवश्यक प्रश्नों को भरें, या कभी भी ऑफलाइन ड्राफ्ट के रूप में सुरक्षित करें।": "இறுதி சமர்ப்பிப்பிற்கு முன் இந்த கட்டாய புலங்களை நிரப்பவும், அல்லது ஆஃப்லைன் வரைவாக சேமிக்கவும்.",
    "Go to First Pending Question": "👉 முதல் நிலுவை கேள்விக்குச் செல்லவும்",
    "👉 पहले अधूरे प्रश्न पर जाएं": "👉 முதல் நிலுவை கேள்விக்குச் செல்லவும்",
    "Save as Offline Draft Anyway": "ஆஃப்லைன் வரைவாக சேமிக்கவும்",
    "💾 ऑफलाइन ड्राफ्ट सुरक्षित करें": "ஆஃப்லைன் வரைவாக சேமிக்கவும்",
    "Close": "மூடு",
    "बंद करें": "மூடு",
    "Start Survey Form": "கணிப்பைத் தொடங்குங்கள்",
    "सर्वेक्षण शुरू करें": "கணிப்பைத் தொடங்குங்கள்",
    "Start Survey Form →": "கணிப்பைத் தொடங்குங்கள் →",
    "सर्वेक्षण शुरू करें →": "கணிப்பைத் தொடங்குங்கள் →",
    "Write-Ahead Log (WAL)": "ரைட்-அஹெட் லாக் (WAL வரிசை)",
    "राइट-अहेड लॉग (WAL कतार)": "ரைட்-அஹெட் லாக் (WAL வரிசை)",
    "Atomic zero-loss local storage queue": "பூஜ்ஜிய தரவு இழப்பு பாதுகாப்பான உள்ளூர் சேமிப்பு",
    "शून्य डेटा हानि सुरक्षित स्थानीय भंडारण": "பூஜ்ஜிய தரவு இழப்பு பாதுகாப்பான உள்ளூர் சேமிப்பு",
    "Sync Now": "⟳ இப்போது ஒத்திசைக்கவும்",
    "⟳ अभी सिंक करें": "⟳ இப்போது ஒத்திசைக்கவும்",
    "View on Map →": "வரைபடத்தில் பார்க்கவும் →",
    "नक्शे पर देखें →": "வரைபடத்தில் பார்க்கவும் →",
    "Re-acquire Fix": "மீண்டும் முயற்சிக்கவும்",
    "पुनः प्रयास करें": "மீண்டும் முயற்சிக்கவும்",
    "Section A: Basic Details": "பிரிவு அ: அடிப்படை விவரங்கள்",
    "भाग क: बुनियादी विवरण": "பிரிவு அ: அடிப்படை விவரங்கள்",
    "Section B: Respondent & Household Profile": "பிரிவு ஆ: பதிலளிப்பவர் மற்றும் குடும்ப விவரம்",
    "भाग ख: उत्तरदाता और परिवार की प्रोफ़ाइल": "பிரிவு ஆ: பதிலளிப்பவர் மற்றும் குடும்ப விவரம்",
    "Section C: Enterprise Operations & Finance": "பிரிவு இ: நிறுவன செயல்பாடுகள் மற்றும் நிதி",
    "भाग ग: उद्यम संचालन और वित्त": "பிரிவு இ: நிறுவன செயல்பாடுகள் மற்றும் நிதி",
    "Section D: Enterprise Challenges & Coping Mechanisms": "பிரிவு ஈ: வணிக சவால்கள் மற்றும் தீர்வுகள்",
    "भाग घ: उद्यम चुनौतियाँ और समाधान": "பிரிவு ஈ: வணிக சவால்கள் மற்றும் தீர்வுகள்",
    "Section E: Impact of SVEP / OSF Schemes": "பிரிவு உ: எஸ்விஇபி / ஓஎஸ்எஃப் திட்டங்களின் தாக்கம்",
    "भाग ङ: एसवीईपी / ओएसएफ योजनाओं का प्रभाव": "பிரிவு உ: எஸ்விஇபி / ஓஎஸ்எஃப் திட்டங்களின் தாக்கம்",
    "Section F: Digital Transactions & Social Media": "பிரிவு ஊ: டிஜிட்டல் பரிவர்த்தனைகள் & சமூக ஊடகம்",
    "भाग च: डिजिटल लेन-देन और सोशल मीडिया": "பிரிவு ஊ: டிஜிட்டல் பரிவர்த்தனைகள் & சமூக ஊடகம்",
    "Section G: Field Verification & Sign-off": "பிரிவு எ: கள சரிபார்ப்பு மற்றும் கையொப்பம்",
    "भाग छ: फील्ड सत्यापन और हस्ताक्षर": "பிரிவு எ: கள சரிபார்ப்பு மற்றும் கையொப்பம்",
    "District": "மாவட்டம்",
    "जिला": "மாவட்டம்",
    "Block / Tehsil": "வட்டம் / தாலுகா",
    "ब्लॉक / तहसील": "வட்டம் / தாலுகா",
    "Village / Gram Panchayat Name": "கிராமம் / கிராம பஞ்சாயத்து பெயர்",
    "गाँव / ग्राम पंचायत का नाम": "கிராமம் / கிராம பஞ்சாயத்து பெயர்",
    "Cluster Level Federation (CLF) Name": "கிளஸ்டர் லெவல் கூட்டமைப்பு (CLF) பெயர்",
    "क्लस्टर लेवल फेडरेशन (CLF) का नाम": "கிளஸ்டர் லெவல் கூட்டமைப்பு (CLF) பெயர்",
    "Village Organization (VO) Name": "கிராம அமைப்பு (VO) பெயர்",
    "ग्राम संगठन (VO) का नाम": "கிராம அமைப்பு (VO) பெயர்",
    "Self-Help Group (SHG) Name": "சுயஉதவி குழு (SHG) பெயர்",
    "स्वयं सहायता समूह (SHG) का नाम": "சுயஉதவி குழு (SHG) பெயர்",
    "Respondent Name": "பதிலளிப்பவர் பெயர்",
    "उत्तरदाता का नाम": "பதிலளிப்பவர் பெயர்",
    "Enterprise / Business Name": "தொழில் / வணிகப் பெயர்",
    "उद्यम / व्यवसाय का नाम": "தொழில் / வணிகப் பெயர்",
    "Year of Setting Up Enterprise": "தொழில் தொடங்கிய ஆண்டு",
    "उद्यम स्थापना का वर्ष": "தொழில் தொடங்கிய ஆண்டு",
    "Main Business Activity of the Enterprise": "நிறுவனத்தின் முதன்மை வணிக செயல்பாடு",
    "उद्यम की मुख्य व्यावसायिक गतिविधि": "நிறுவனத்தின் முதன்மை வணிக செயல்பாடு",
    "What is respondent's relation with SHG member?": "சுயஉதவிக்குழு உறுப்பினருடன் பதிலளிப்பவரின் உறவு என்ன?",
    "उत्तरदाता का एसएचजी सदस्य से क्या संबंध है?": "சுயஉதவிக்குழு உறுப்பினருடன் பதிலளிப்பவரின் உறவு என்ன?",
    "What is the age of SHG member?": "சுயஉதவிக்குழு உறுப்பினரின் வயது என்ன?",
    "एसएचजी सदस्य की आयु क्या है?": "சுயஉதவிக்குழு உறுப்பினரின் வயது என்ன?",
    "What is the marital status of the SHG member?": "சுயஉதவிக்குழு உறுப்பினரின் திருமண நிலை என்ன?",
    "एसएचजी सदस्य की वैवाहिक स्थिति क्या है?": "சுயஉதவிக்குழு உறுப்பினரின் திருமண நிலை என்ன?",
    "What is the social category / caste?": "சமூகப் பிரிவு / சாதி என்ன?",
    "सामाजिक श्रेणी / जाति क्या है?": "சமூகப் பிரிவு / சாதி என்ன?",
    "What is the education status of the SHG member?": "சுயஉதவிக்குழு உறுப்பினரின் கல்வி நிலை என்ன?",
    "एसएचजी सदस्य की शैक्षणिक स्थिति क्या है?": "சுயஉதவிக்குழு உறுப்பினரின் கல்வி நிலை என்ன?",
    "How many total members are in the family?": "குடும்பத்தில் மொத்தம் எத்தனை உறுப்பினர்கள் உள்ளனர்?",
    "परिवार में कुल कितने सदस्य हैं?": "குடும்பத்தில் மொத்தம் எத்தனை உறுப்பினர்கள் உள்ளனர்?",
    "What is your total annual household income?": "உங்கள் மொத்த வருடாந்திர குடும்ப வருமானம் எவ்வளவு?",
    "आपकी कुल वार्षिक पारिवारिक आय कितनी है?": "உங்கள் மொத்த வருடாந்திர குடும்ப வருமானம் எவ்வளவு?",
    "What is your role in the SHG?": "சுயஉதவிக்குழுவில் உங்கள் பங்கு என்ன?",
    "एसएचजी में आपकी भूमिका क्या है?": "சுயஉதவிக்குழுவில் உங்கள் பங்கு என்ன?",
    "Are you related to any of the SVEP / OSF CRP?": "நீங்கள் ஏதேனும் SVEP / OSF CRP உடன் தொடர்புடையவரா?",
    "क्या आप किसी SVEP / OSF CRP से संबंधित हैं?": "நீங்கள் ஏதேனும் SVEP / OSF CRP உடன் தொடர்புடையவரா?",
    "Who started the enterprise?": "தொழிலை யார் தொடங்கினார்கள்?",
    "उद्यम किसने शुरू किया था?": "தொழிலை யார் தொடங்கினார்கள்?",
    "Who operates and manages the enterprise on a daily basis?": "தினசரி அடிப்படையில் நிறுவனத்தை யார் நிர்வகிக்கிறார்கள்?",
    "दैनिक आधार पर उद्यम का संचालन और प्रबंधन कौन करता है?": "தினசரி அடிப்படையில் நிறுவனத்தை யார் நிர்வகிக்கிறார்கள்?",
    "For how many hours in a day does the shop/enterprise remain open?": "ஒரு நாளில் எத்தனை மணி நேரம் கடை/நிறுவனம் திறந்திருக்கும்?",
    "दिन में कितने घंटे दुकान/उद्यम खुला रहता है?": "ஒரு நாளில் எத்தனை மணி நேரம் கடை/நிறுவனம் திறந்திருக்கும்?",
    "What is the type of business place / premises?": "வணிக இடத்தின் வகை என்ன?",
    "व्यावसायिक स्थान/परिसर का प्रकार क्या है?": "வணிக இடத்தின் வகை என்ன?",
    "Does SHG member maintain written records of business transactions regularly?": "சுயஉதவிக்குழு உறுப்பினர் வழக்கமாக வணிகப் பதிவேடுகளைப் பராமரிக்கிறாரா?",
    "क्या एसएचजी सदस्य नियमित रूप से व्यावसायिक लेन-देन का लिखित रिकॉर्ड रखते हैं?": "சுயஉதவிக்குழு உறுப்பினர் வழக்கமாக வணிகப் பதிவேடுகளைப் பராமரிக்கிறாரா?",
    "In the first year of your enterprise, what was the amount of seed capital (Rs)?": "உங்கள் நிறுவனத்தின் முதல் ஆண்டில் ஆரம்ப மூலதனம் (ரூ) எவ்வளவு?",
    "आपके उद्यम के पहले वर्ष में प्रारंभिक बीज पूंजी की राशि (रु) क्या थी?": "உங்கள் நிறுவனத்தின் முதல் ஆண்டில் ஆரம்ப மூலதனம் (ரூ) எவ்வளவு?",
    "How do you manage working capital during peak season?": "பீக் சீசனில் பணி மூலதனத்தை எவ்வாறு நிர்வகிக்கிறீர்கள்?",
    "पीक सीजन के दौरान आप कार्यशील पूंजी का प्रबंधन कैसे करते हैं?": "பீக் சீசனில் பணி மூலதனத்தை எவ்வாறு நிர்வகிக்கிறீர்கள்?",
    "Is the location of your space convenient for your business?": "உங்கள் வணிகத்திற்கான இடம் வசதியாக உள்ளதா?",
    "क्या आपके स्थान की स्थिति आपके व्यवसाय के लिए सुविधाजनक है?": "உங்கள் வணிகத்திற்கான இடம் வசதியாக உள்ளதா?",
    "Are you satisfied and happy with your wholesale supplier?": "மொத்த சப்ளையருடன் நீங்கள் திருப்தியாக உள்ளீர்களா?",
    "क्या आप अपने थोक सप्लायर से संतुष्ट और खुश हैं?": "மொத்த சப்ளையருடன் நீங்கள் திருப்தியாக உள்ளீர்களா?",
    "Are you able to recover credit / money from your customers?": "வாடிக்கையாளர்களிடமிருந்து கடனை வசூலிக்க முடிகிறதா?",
    "क्या आप अपने ग्राहकों से उधारी/पैसा वसूल पाते हैं?": "வாடிக்கையாளர்களிடமிருந்து கடனை வசூலிக்க முடிகிறதா?",
    "Do you source raw materials/goods from market independently?": "சந்தையிலிருந்து மூலப்பொருட்களை சுயமாக வாங்குகிறீர்களா?",
    "क्या आप बाजार से स्वतंत्र रूप से कच्चा माल/सामान लाते हैं?": "சந்தையிலிருந்து மூலப்பொருட்களை சுயமாக வாங்குகிறீர்களா?",
    "Do you have easy access to loans from different sources?": "பல்வேறு ஆதாரங்களில் இருந்து கடன் எளிதாக கிடைக்கிறதா?",
    "क्या आपको विभिन्न स्रोतों से ऋण की आसान पहुँच प्राप्त है?": "பல்வேறு ஆதாரங்களில் இருந்து கடன் எளிதாக கிடைக்கிறதா?",
    "How much loan amount have you availed under SVEP / OSF scheme (Rs)?": "SVEP / OSF திட்டத்தின் கீழ் எவ்வளவு கடன் பெற்றுள்ளீர்கள் (ரூ)?",
    "आपने SVEP / OSF योजना के तहत कितनी ऋण राशि प्राप्त की है (रु)?": "SVEP / OSF திட்டத்தின் கீழ் எவ்வளவு கடன் பெற்றுள்ளீர்கள் (ரூ)?",
    "How did you utilize the enterprise loan?": "வணிகக் கடனை எவ்வாறு பயன்படுத்தினீர்கள்?",
    "आपने उद्यम ऋण का उपयोग किस प्रकार किया?": "வணிகக் கடனை எவ்வாறு பயன்படுத்தினீர்கள்?",
    "Monthly enterprise income BEFORE availing loan changes (Rs)?": "கடன் பெறுவதற்கு முன் நிறுவனத்தின் மாதாந்திர வருமானம் (ரூ)?",
    "ऋण से बदलाव करने से पहले उद्यम की मासिक आय (रु)?": "கடன் பெறுவதற்கு முன் நிறுவனத்தின் மாதாந்திர வருமானம் (ரூ)?",
    "Monthly enterprise income AFTER availing loan changes (Rs)?": "கடன் பெற்ற பிறகு நிறுவனத்தின் மாதாந்திர வருமானம் (ரூ)?",
    "ऋण से बदलाव करने के बाद उद्यम की मासिक आय (रु)?": "கடன் பெற்ற பிறகு நிறுவனத்தின் மாதாந்திர வருமானம் (ரூ)?",
    "What has been the contribution of SVEP / OSF CRPs?": "SVEP / OSF CRP-களின் பங்களிப்பு என்ன?",
    "SVEP / OSF CRP का क्या योगदान रहा है?": "SVEP / OSF CRP-களின் பங்களிப்பு என்ன?",
    "Does the woman entrepreneur own a smartphone?": "பெண் தொழில்முனைவோரிடம் ஸ்மார்ட்போன் உள்ளதா?",
    "क्या महिला उद्यमी के पास स्मार्टफोन है?": "பெண் தொழில்முனைவோரிடம் ஸ்மார்ட்போன் உள்ளதா?",
    "Do you use QR code / UPI / mobile banking for business transactions?": "வணிகப் பரிவர்த்தனைகளுக்கு QR குறியீடு / UPI / மொபைல் பேங்கிங் பயன்படுத்துகிறீர்களா?",
    "क्या आप व्यावसायिक लेन-देन के लिए क्यूआर कोड / यूपीआई / मोबाइल बैंकिंग का उपयोग करते हैं?": "வணிகப் பரிவர்த்தனைகளுக்கு QR குறியீடு / UPI / மொபைல் பேங்கிங் பயன்படுத்துகிறீர்களா?",
    "Daily how many transactions are done via QR code / UPI?": "தினசரி QR குறியீடு / UPI மூலம் எத்தனை பரிவர்த்தனைகள் செய்யப்படுகின்றன?",
    "प्रतिदिन क्यूआर कोड / यूपीआई द्वारा कितने लेन-देन होते हैं?": "தினசரி QR குறியீடு / UPI மூலம் எத்தனை பரிவர்த்தனைகள் செய்யப்படுகின்றன?",
    "Which social media platforms do you use for your business?": "உங்கள் வணிகத்திற்காக எந்த சமூக ஊடக தளங்களைப் பயன்படுத்துகிறீர்கள்?",
    "आप अपने व्यवसाय के लिए किन सोशल मीडिया प्लेटफॉर्म का उपयोग करते हैं?": "உங்கள் வணிகத்திற்காக எந்த சமூக ஊடக தளங்களைப் பயன்படுத்துகிறீர்கள்?",
    "Capture Enterprise GPS Location (Satellite Coordinates)": "நிறுவன ஜிபிஎஸ் இருப்பிடத்தைப் பிடிக்கவும் (செயற்கைக்கோள் ஆயத்தொலைவுகள்)",
    "उद्यम जीपीएस लोकेशन कैप्चर करें (उपग्रह निर्देशांक)": "நிறுவன ஜிபிஎஸ் இருப்பிடத்தைப் பிடிக்கவும் (செயற்கைக்கோள் ஆயத்தொலைவுகள்)",
    "Field Photo of Enterprise & Beneficiary": "நிறுவனம் மற்றும் பயனாளியின் களப் புகைப்படம்",
    "उद्यम और लाभार्थी का फील्ड फोटो": "நிறுவனம் மற்றும் பயனாளியின் களப் புகைப்படம்",
    "Respondent & Surveyor Digital Signature": "பதிலளிப்பவர் மற்றும் கணக்கெடுப்பாளரின் டிஜிட்டல் கையொப்பம்",
    "उत्तरदाता और सर्वेक्षक के डिजिटल हस्ताक्षर": "பதிலளிப்பவர் மற்றும் கணக்கெடுப்பாளரின் டிஜிட்டல் கையொப்பம்",
    "Yes": "ஆம்",
    "हाँ": "ஆம்",
    "No": "இல்லை",
    "नहीं": "இல்லை",
    "Baran": "பாரான்",
    "बारां": "பாரான்",
    "Churu": "சுரு",
    "चूरू": "சுரு",
    "Dausa": "தௌசா",
    "दौसा": "தௌசா",
    "Dungarpur": "டுங்கர்பூர்",
    "डूंगरपुर": "டுங்கர்பூர்",
    "Jodhpur": "ஜோத்பூர்",
    "जोधपुर": "ஜோத்பூர்",
    "Chhipabarod": "சிபாபரோட்",
    "छीपाबड़ौद": "சிபாபரோட்",
    "Kishanganj": "கிஷன்கஞ்ச்",
    "किशनगंज": "கிஷன்கஞ்ச்",
    "Sardar Sheher": "சர்தார்ஷஹர்",
    "सरदारशहर": "சர்தார்ஷஹர்",
    "Bidasar": "பிதாசர்",
    "बीदासर": "பிதாசர்",
    "Secundra": "சிகந்திரா",
    "सिकंदरा": "சிகந்திரா",
    "Sagwara": "சாக்வாரா",
    "सागवाड़ा": "சாக்வாரா",
    "Galiakot": "கலியாகோட்",
    "गलियाकोट": "கலியாகோட்",
    "Bicchiwada": "பிச்சிவாடா",
    "बिछीवाड़ा": "பிச்சிவாடா",
    "Jodhpur Block": "ஜோத்பூர் வட்டம்",
    "जोधपुर ब्लॉक": "ஜோத்பூர் வட்டம்",
    "Married": "திருமணமானவர்",
    "विवाहित": "திருமணமானவர்",
    "Single": "திருமணமாகாதவர்",
    "अविवाहित": "திருமணமாகாதவர்",
    "Widowed": "விதவை",
    "विधवा": "விதவை",
    "Divorced": "விவாகரத்து பெற்றவர்",
    "तलाकशुदा": "விவாகரத்து பெற்றவர்",
    "Separated": "பிரிந்து வாழ்பவர்",
    "अलग रह रहे": "பிரிந்து வாழ்பவர்",
    "General": "பொதுப் பிரிவு (General)",
    "सामान्य": "பொதுப் பிரிவு (General)",
    "OBC": "இதர பிற்படுத்தப்பட்டோர் (OBC)",
    "अन्य पिछड़ा वर्ग (OBC)": "இதர பிற்படுத்தப்பட்டோர் (OBC)",
    "SC": "பட்டியலின சாதி (SC)",
    "अनुसूचित जाति (SC)": "பட்டியலின சாதி (SC)",
    "ST": "பட்டியலின பழங்குடி (ST)",
    "अनुसूचित जनजाति (ST)": "பட்டியலின பழங்குடி (ST)",
    "Illiterate": "படிப்பறிவில்லாதவர்",
    "निरक्षर / अनपढ़": "படிப்பறிவில்லாதவர்",
    "Illiterate but able to calculate": "படிப்பறிவில்லை ஆனால் கணக்கிடக்கூடியவர்",
    "अनपढ़ लेकिन हिसाब-किताब में सक्षम": "படிப்பறிவில்லை ஆனால் கணக்கிடக்கூடியவர்",
    "5th pass": "5 ஆம் வகுப்பு தேர்ச்சி",
    "5वीं पास": "5 ஆம் வகுப்பு தேர்ச்சி",
    "8th pass": "8 ஆம் வகுப்பு தேர்ச்சி",
    "8वीं पास": "8 ஆம் வகுப்பு தேர்ச்சி",
    "10th pass": "10 ஆம் வகுப்பு தேர்ச்சி",
    "10वीं पास": "10 ஆம் வகுப்பு தேர்ச்சி",
    "12th pass": "12 ஆம் வகுப்பு தேர்ச்சி",
    "12वीं पास": "12 ஆம் வகுப்பு தேர்ச்சி",
    "Graduate": "பட்டதாரி (Graduate)",
    "स्नातक (Graduate)": "பட்டதாரி (Graduate)",
    "Self": "சுயமாக",
    "स्वयं": "சுயமாக",
    "Husband": "கணவர்",
    "पति": "கணவர்",
    "Son": "மகன்",
    "पुत्र / बेटा": "மகன்",
    "Daughter": "மகள்",
    "पुत्री / बेटी": "மகள்",
    "Member": "உறுப்பினர்",
    "सामान्य सदस्य": "உறுப்பினர்",
    "Leadership role": "தலைமைப் பொறுப்பு (தலைவர்/செயலாளர்/பொருளாளர்)",
    "पदाधिकारी / नेतृत्व पद (अध्यक्ष/सचिव/कोषाध्यक्ष)": "தலைமைப் பொறுப்பு (தலைவர்/செயலாளர்/பொருளாளர்)",
    "Grocery / Kirana": "மளிகைக் கடை",
    "किराना दुकान": "மளிகைக் கடை",
    "General store": "பொது அங்காடி",
    "जनरल स्टोर": "பொது அங்காடி",
    "Leather & footwear": "தோல் மற்றும் காலணிகள்",
    "चमड़ा व जूते-चप्पल": "தோல் மற்றும் காலணிகள்",
    "Flour mill": "மாவு ஆலை",
    "आटा चक्की": "மாவு ஆலை",
    "Tailoring & Stitching": "தையல் மற்றும் பூவேலை மையம்",
    "सिलाई व कढ़ाई केंद्र": "தையல் மற்றும் பூவேலை மையம்",
    "Apparel & Garments": "ஆடைகள் மற்றும் உடைகள்",
    "रेडीमेड वस्त्र": "ஆடைகள் மற்றும் உடைகள்",
    "Beauty parlour": "பியூட்டி பார்லர்",
    "ब्यूटी पार्लर": "பியூட்டி பார்லர்",
    "Handicraft": "கைவினைப் பொருட்கள்",
    "हस्तशिल्प / हैंडीक्राफ्ट": "கைவினைப் பொருட்கள்",
    "Dairy shop": "பால் பண்ணை & பால் கடை",
    "डेयरी व दूध केंद्र": "பால் பண்ணை & பால் கடை",
    "Auto-mechanic": "ஆட்டோ மெக்கானிக்",
    "ऑटो मैकेनिक": "ஆட்டோ மெக்கானிக்",
    "E-mitra": "இ-சேவை மையம் / சிஎஸ்சி",
    "ई-मित्र केंद्र / ग्राहक सेवा केंद्र": "இ-சேவை மையம் / சிஎஸ்சி",
    "Mobile repair shop": "மொபைல் பழுதுபார்க்கும் கடை",
    "मोबाइल रिपेयर दुकान": "மொபைல் பழுதுபார்க்கும் கடை",
    "Transport": "போக்குவரத்து சேவை",
    "परिवहन सेवा": "போக்குவரத்து சேவை",
    "Any other": "மற்றவை",
    "अन्य कोई": "மற்றவை",
    "Whatsapp": "வாட்ஸ்அப்",
    "व्हाट्सएप (WhatsApp)": "வாட்ஸ்அப்",
    "Facebook": "பேஸ்புக்",
    "फेसबुक (Facebook)": "பேஸ்புக்",
    "Instagram": "இன்ஸ்டாகிராம்",
    "इंस्टाग्राम (Instagram)": "இன்ஸ்டாகிராம்",
    "Don't use social media": "சமூக ஊடகங்களைப் பயன்படுத்துவதில்லை",
    "सोशल मीडिया का उपयोग नहीं करते": "சமூக ஊடகங்களைப் பயன்படுத்துவதில்லை",
    "Draft": "வரைவு",
    "Save Draft": "வரைவு சேமி",
    "ड्राफ्ट": "வரைவு",
    "मसुदा": "வரைவு",
    "ડ્રાફ્ટ": "வரைவு",
    "ਡਰਾਫਟ": "வரைவு",
    "খসড়া": "வரைவு",
    "வரைவு": "வரைவு",
    "చిత్తుప్రతి": "வரைவு",
    "ಕರಡು": "வரைவு",
    "ഡ്രാഫ്റ്റ്": "வரைவு",
    "ڈرافٹ": "வரைவு",
    "ड्राफ्ट सेव करें": "வரைவு சேமி",
    "मसुदा जतन करा": "வரைவு சேமி",
    "ડ્રાફ્ટ સાચવો": "வரைவு சேமி",
    "ਡਰਾਫਟ ਸੰਭਾਲੋ": "வரைவு சேமி",
    "খসড়া সংরক্ষণ": "வரைவு சேமி",
    "வரைவு சேமி": "வரைவு சேமி",
    "చిత్తుప్రతి భద్రపరచు": "வரைவு சேமி",
    "ಕರಡು ಉಳಿಸಿ": "வரைவு சேமி",
    "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക": "வரைவு சேமி",
    "ڈرافٹ محفوظ کریں": "வரைவு சேமி"
  },
  "te": {
    "OmniServey": "ఓమ్నీసర్వే",
    "ओमनीसर्वे": "ఓమ్నీసర్వే",
    "Online": "ఆన్‌లైన్",
    "ऑनलाइन": "ఆన్‌లైన్",
    "Offline": "ఆఫ్‌లైన్",
    "ऑफलाइन": "ఆఫ్‌లైన్",
    "Surveys": "సర్వేలు",
    "सर्वेक्षण": "సర్వేలు",
    "WAL Queue": "క్యూ (ఆఫ్‌లైన్)",
    "कतार (ऑफलाइन)": "క్యూ (ఆఫ్‌లైన్)",
    "System": "సిస్టమ్",
    "सिस्टम": "సిస్టమ్",
    "Exit Form": "← నిష్క్రమించు",
    "← बाहर निकलें": "← నిష్క్రమించు",
    "Step": "దశ",
    "चरण": "దశ",
    "of": "యొక్క",
    "का": "యొక్క",
    "Pages": "పేజీలు",
    "पृष्ठ": "పేజీలు",
    "Questions": "ప్రశ్నలు",
    "प्रश्न": "ప్రశ్నలు",
    "Previous": "← మునుపటి",
    "← पिछला": "← మునుపటి",
    "Next": "తదుపరి →",
    "अगला →": "తదుపరి →",
    "Save Offline": "ఆఫ్‌లైన్‌లో భద్రపరచండి",
    "ऑफलाइन सेव करें": "ఆఫ్‌లైన్‌లో భద్రపరచండి",
    "Submit Survey": "సమర్పించండి",
    "सबमिट करें": "సమర్పించండి",
    "Capture GPS Coordinates": "జీపీఎస్ స్థానాన్ని రికార్డ్ చేయండి",
    "जीपीएस लोकेशन रिकॉर्ड करें": "జీపీఎస్ స్థానాన్ని రికార్డ్ చేయండి",
    "GPS Fix Acquired ✓": "జీపీఎస్ స్థానం పొందబడింది ✓",
    "जीपीएस लोकेशन प्राप्त हुआ ✓": "జీపీఎస్ స్థానం పొందబడింది ✓",
    "Take Photo / Choose File": "ఫోటో తీయండి / ఫైల్ ఎంచుకోండి",
    "फोटो लें / फाइल चुनें": "ఫోటో తీయండి / ఫైల్ ఎంచుకోండి",
    "Sign inside box with finger or stylus": "మీ వేలితో లేదా స్టైలస్‌తో పెట్టెలో సంతకం చేయండి",
    "अपनी उंगली या स्टाइलस से बॉक्स में हस्ताक्षर करें": "మీ వేలితో లేదా స్టైలస్‌తో పెట్టెలో సంతకం చేయండి",
    "Clear Signature": "సంతకాన్ని క్లియర్ చేయండి",
    "हस्ताक्षर मिटाएं": "సంతకాన్ని క్లియర్ చేయండి",
    "Signature Recorded": "సంతకం నమోదైంది",
    "हस्ताक्षर दर्ज हुआ": "సంతకం నమోదైంది",
    "Enter response here...": "ఇక్కడ సమాధానం నమోదు చేయండి...",
    "यहाँ उत्तर दर्ज करें...": "ఇక్కడ సమాధానం నమోదు చేయండి...",
    "Required Questions Pending": "తప్పనిసరి ప్రశ్నలు పెండింగ్‌లో ఉన్నాయి",
    "आवश्यक प्रश्न अधूरे हैं": "తప్పనిసరి ప్రశ్నలు పెండింగ్‌లో ఉన్నాయి",
    "Please fill in these required fields before final submission, or save as an offline draft anytime.": "తుది సమర్పణకు ముందు దయచేసి ఈ అవసరమైన ప్రశ్నలను పూరించండి లేదా ఎప్పుడైనా ఆఫ్‌లైన్ డ్రాఫ్ట్‌గా భద్రపరచండి.",
    "अंतिम सबमिशन से पहले कृपया इन आवश्यक प्रश्नों को भरें, या कभी भी ऑफलाइन ड्राफ्ट के रूप में सुरक्षित करें।": "తుది సమర్పణకు ముందు దయచేసి ఈ అవసరమైన ప్రశ్నలను పూరించండి లేదా ఎప్పుడైనా ఆఫ్‌లైన్ డ్రాఫ్ట్‌గా భద్రపరచండి.",
    "Go to First Pending Question": "👉 మొదటి పెండింగ్ ప్రశ్నకు వెళ్లండి",
    "👉 पहले अधूरे प्रश्न पर जाएं": "👉 మొదటి పెండింగ్ ప్రశ్నకు వెళ్లండి",
    "Save as Offline Draft Anyway": "ఆఫ్‌లైన్ డ్రాఫ్ట్‌గా భద్రపరచండి",
    "💾 ऑफलाइन ड्राफ्ट सुरक्षित करें": "ఆఫ్‌లైన్ డ్రాఫ్ట్‌గా భద్రపరచండి",
    "Close": "మూసివేయి",
    "बंद करें": "మూసివేయి",
    "Start Survey Form": "సర్వేను ప్రారంభించండి",
    "सर्वेक्षण शुरू करें": "సర్వేను ప్రారంభించండి",
    "Start Survey Form →": "సర్వేను ప్రారంభించండి →",
    "सर्वेक्षण शुरू करें →": "సర్వేను ప్రారంభించండి →",
    "Write-Ahead Log (WAL)": "రైట్-అహెడ్ లాగ్ (WAL క్యూ)",
    "राइट-अहेड लॉग (WAL कतार)": "రైట్-అహెడ్ లాగ్ (WAL క్యూ)",
    "Atomic zero-loss local storage queue": "సున్నా డేటా నష్టం సురక్షిత స్థానిక నిల్వ",
    "शून्य डेटा हानि सुरक्षित स्थानीय भंडारण": "సున్నా డేటా నష్టం సురక్షిత స్థానిక నిల్వ",
    "Sync Now": "⟳ ఇప్పుడే సమకాలీకరించండి",
    "⟳ अभी सिंक करें": "⟳ ఇప్పుడే సమకాలీకరించండి",
    "View on Map →": "మ్యాప్‌లో చూడండి →",
    "नक्शे पर देखें →": "మ్యాప్‌లో చూడండి →",
    "Re-acquire Fix": "మళ్లీ ప్రయత్నించండి",
    "पुनः प्रयास करें": "మళ్లీ ప్రయత్నించండి",
    "Section A: Basic Details": "విభాగం ఎ: ప్రాథమిక వివరాలు",
    "भाग क: बुनियादी विवरण": "విభాగం ఎ: ప్రాథమిక వివరాలు",
    "Section B: Respondent & Household Profile": "విభాగం బి: ప్రతివాది & కుటుంబ ప్రొఫైల్",
    "भाग ख: उत्तरदाता और परिवार की प्रोफ़ाइल": "విభాగం బి: ప్రతివాది & కుటుంబ ప్రొఫైల్",
    "Section C: Enterprise Operations & Finance": "విభాగం సి: సంస్థ కార్యకలాపాలు & ఫైనాన్స్",
    "भाग ग: उद्यम संचालन और वित्त": "విభాగం సి: సంస్థ కార్యకలాపాలు & ఫైనాన్స్",
    "Section D: Enterprise Challenges & Coping Mechanisms": "విభాగం డి: వ్యాపార సవాళ్లు & పరిష్కారాలు",
    "भाग घ: उद्यम चुनौतियाँ और समाधान": "విభాగం డి: వ్యాపార సవాళ్లు & పరిష్కారాలు",
    "Section E: Impact of SVEP / OSF Schemes": "విభాగం ఇ: SVEP / OSF పథకాల ప్రభావం",
    "भाग ङ: एसवीईपी / ओएसएफ योजनाओं का प्रभाव": "విభాగం ఇ: SVEP / OSF పథకాల ప్రభావం",
    "Section F: Digital Transactions & Social Media": "విభాగం ఎఫ్: డిజిటల్ లావాదేవీలు & సోషల్ మీడియా",
    "भाग च: डिजिटल लेन-देन और सोशल मीडिया": "విభాగం ఎఫ్: డిజిటల్ లావాదేవీలు & సోషల్ మీడియా",
    "Section G: Field Verification & Sign-off": "విభాగం జి: ఫీల్డ్ ధృవీకరణ & సంతకం",
    "भाग छ: फील्ड सत्यापन और हस्ताक्षर": "విభాగం జి: ఫీల్డ్ ధృవీకరణ & సంతకం",
    "District": "జిల్లా",
    "जिला": "జిల్లా",
    "Block / Tehsil": "బ్లాక్ / తహసీల్",
    "ब्लॉक / तहसील": "బ్లాక్ / తహసీల్",
    "Village / Gram Panchayat Name": "గ్రామం / గ్రామ పంచాయతీ పేరు",
    "गाँव / ग्राम पंचायत का नाम": "గ్రామం / గ్రామ పంచాయతీ పేరు",
    "Cluster Level Federation (CLF) Name": "క్లస్టర్ లెవల్ ఫెడరేషన్ (CLF) పేరు",
    "क्लस्टर लेवल फेडरेशन (CLF) का नाम": "క్లస్టర్ లెవల్ ఫెడరేషన్ (CLF) పేరు",
    "Village Organization (VO) Name": "గ్రామ సంస్థ (VO) పేరు",
    "ग्राम संगठन (VO) का नाम": "గ్రామ సంస్థ (VO) పేరు",
    "Self-Help Group (SHG) Name": "స్వయం సహాయక బృందం (SHG) పేరు",
    "स्वयं सहायता समूह (SHG) का नाम": "స్వయం సహాయక బృందం (SHG) పేరు",
    "Respondent Name": "ప్రతివాది పేరు",
    "उत्तरदाता का नाम": "ప్రతివాది పేరు",
    "Enterprise / Business Name": "సంస్థ / వ్యాపారం పేరు",
    "उद्यम / व्यवसाय का नाम": "సంస్థ / వ్యాపారం పేరు",
    "Year of Setting Up Enterprise": "సంస్థ స్థాపించిన సంవత్సరం",
    "उद्यम स्थापना का वर्ष": "సంస్థ స్థాపించిన సంవత్సరం",
    "Main Business Activity of the Enterprise": "సంస్థ యొక్క ప్రధాన వ్యాపార కార్యకలాపం",
    "उद्यम की मुख्य व्यावसायिक गतिविधि": "సంస్థ యొక్క ప్రధాన వ్యాపార కార్యకలాపం",
    "What is respondent's relation with SHG member?": "SHG సభ్యునితో ప్రతివాది సంబంధం ఏమిటి?",
    "उत्तरदाता का एसएचजी सदस्य से क्या संबंध है?": "SHG సభ్యునితో ప్రతివాది సంబంధం ఏమిటి?",
    "What is the age of SHG member?": "SHG సభ్యుని వయస్సు ఎంత?",
    "एसएचजी सदस्य की आयु क्या है?": "SHG సభ్యుని వయస్సు ఎంత?",
    "What is the marital status of the SHG member?": "SHG సభ్యుని వైవాహಿಕ స్థితి ఏమిటి?",
    "एसएचजी सदस्य की वैवाहिक स्थिति क्या है?": "SHG సభ్యుని వైవాహಿಕ స్థితి ఏమిటి?",
    "What is the social category / caste?": "సామాజిక వర్గం / కులం ఏమిటి?",
    "सामाजिक श्रेणी / जाति क्या है?": "సామాజిక వర్గం / కులం ఏమిటి?",
    "What is the education status of the SHG member?": "SHG సభ్యుని విద్యా స్థాయి ఏమిటి?",
    "एसएचजी सदस्य की शैक्षणिक स्थिति क्या है?": "SHG సభ్యుని విద్యా స్థాయి ఏమిటి?",
    "How many total members are in the family?": "కుటుంబంలో మొత్తం ఎంతమంది సభ్యులు ఉన్నారు?",
    "परिवार में कुल कितने सदस्य हैं?": "కుటుంబంలో మొత్తం ఎంతమంది సభ్యులు ఉన్నారు?",
    "What is your total annual household income?": "మీ మొత్తం వార్షిక కుటుంబ ఆదాయం ఎంత?",
    "आपकी कुल वार्षिक पारिवारिक आय कितनी है?": "మీ మొత్తం వార్షిక కుటుంబ ఆదాయం ఎంత?",
    "What is your role in the SHG?": "SHG లో మీ పాత్ర ఏమిటి?",
    "एसएचजी में आपकी भूमिका क्या है?": "SHG లో మీ పాత్ర ఏమిటి?",
    "Are you related to any of the SVEP / OSF CRP?": "మీరు ఏదైనా SVEP / OSF CRP కి సంబంధించినవారా?",
    "क्या आप किसी SVEP / OSF CRP से संबंधित हैं?": "మీరు ఏదైనా SVEP / OSF CRP కి సంబంధించినవారా?",
    "Who started the enterprise?": "సంస్థను ఎవరు ప్రారంభించారు?",
    "उद्यम किसने शुरू किया था?": "సంస్థను ఎవరు ప్రారంభించారు?",
    "Who operates and manages the enterprise on a daily basis?": "రోజువారీ ప్రాతిపదికన సంస్థను ఎవరు నిర్వహిస్తారు?",
    "दैनिक आधार पर उद्यम का संचालन और प्रबंधन कौन करता है?": "రోజువారీ ప్రాతిపదికన సంస్థను ఎవరు నిర్వహిస్తారు?",
    "For how many hours in a day does the shop/enterprise remain open?": "రోజులో ఎన్ని గంటలు దుకాణం/సంస్థ తెరిచి ఉంటుంది?",
    "दिन में कितने घंटे दुकान/उद्यम खुला रहता है?": "రోజులో ఎన్ని గంటలు దుకాణం/సంస్థ తెరిచి ఉంటుంది?",
    "What is the type of business place / premises?": "వ్యాపార స్థలం రకం ఏమిటి?",
    "व्यावसायिक स्थान/परिसर का प्रकार क्या है?": "వ్యాపార స్థలం రకం ఏమిటి?",
    "Does SHG member maintain written records of business transactions regularly?": "SHG సభ్యుడు క్రమం తప్పకుండా వ్యాపార లావాదేవీల లిఖిత రికార్డులను నిర్వహిస్తున్నారా?",
    "क्या एसएचजी सदस्य नियमित रूप से व्यावसायिक लेन-देन का लिखित रिकॉर्ड रखते हैं?": "SHG సభ్యుడు క్రమం తప్పకుండా వ్యాపార లావాదేవీల లిఖిత రికార్డులను నిర్వహిస్తున్నారా?",
    "In the first year of your enterprise, what was the amount of seed capital (Rs)?": "మీ సంస్థ మొదటి సంవత్సరంలో ప్రారంభ మూలధనం (రూ) ఎంత?",
    "आपके उद्यम के पहले वर्ष में प्रारंभिक बीज पूंजी की राशि (रु) क्या थी?": "మీ సంస్థ మొదటి సంవత్సరంలో ప్రారంభ మూలధనం (రూ) ఎంత?",
    "How do you manage working capital during peak season?": "పీక్ సీజన్‌లో వర్కింగ్ క్యాపిటల్‌ను ఎలా నిర్వహిస్తారు?",
    "पीक सीजन के दौरान आप कार्यशील पूंजी का प्रबंधन कैसे करते हैं?": "పీక్ సీజన్‌లో వర్కింగ్ క్యాపిటల్‌ను ఎలా నిర్వహిస్తారు?",
    "Is the location of your space convenient for your business?": "మీ వ్యాపారానికి స్థానం సౌకర్యవంతంగా ఉందా?",
    "क्या आपके स्थान की स्थिति आपके व्यवसाय के लिए सुविधाजनक है?": "మీ వ్యాపారానికి స్థానం సౌకర్యవంతంగా ఉందా?",
    "Are you satisfied and happy with your wholesale supplier?": "మీరు హోల్‌సేల్ సరఫరాదారుతో సంతృప్తిగా ఉన్నారా?",
    "क्या आप अपने थोक सप्लायर से संतुष्ट और खुश हैं?": "మీరు హోల్‌సేల్ సరఫరాదారుతో సంతృప్తిగా ఉన్నారా?",
    "Are you able to recover credit / money from your customers?": "మీరు కస్టమర్ల నుండి అప్పులను వసూలు చేయగలుగుతున్నారా?",
    "क्या आप अपने ग्राहकों से उधारी/पैसा वसूल पाते हैं?": "మీరు కస్టమర్ల నుండి అప్పులను వసూలు చేయగలుగుతున్నారా?",
    "Do you source raw materials/goods from market independently?": "మీరు మార్కెట్ నుండి స్వతంత్రంగా ముడి సరుకును కొనుగోలు చేస్తారా?",
    "क्या आप बाजार से स्वतंत्र रूप से कच्चा माल/सामान लाते हैं?": "మీరు మార్కెట్ నుండి స్వతంత్రంగా ముడి సరుకును కొనుగోలు చేస్తారా?",
    "Do you have easy access to loans from different sources?": "వివిధ వనరుల నుండి సులభంగా రుణాలు లభిస్తున్నాయా?",
    "क्या आपको विभिन्न स्रोतों से ऋण की आसान पहुँच प्राप्त है?": "వివిధ వనరుల నుండి సులభంగా రుణాలు లభిస్తున్నాయా?",
    "How much loan amount have you availed under SVEP / OSF scheme (Rs)?": "SVEP / OSF పథకం కింద మీరు ఎంత రుణం తీసుకున్నారు (రూ)?",
    "आपने SVEP / OSF योजना के तहत कितनी ऋण राशि प्राप्त की है (रु)?": "SVEP / OSF పథకం కింద మీరు ఎంత రుణం తీసుకున్నారు (రూ)?",
    "How did you utilize the enterprise loan?": "మీరు వ్యాపార రుణాన్ని ఎలా ఉపయోగించారు?",
    "आपने उद्यम ऋण का उपयोग किस प्रकार किया?": "మీరు వ్యాపార రుణాన్ని ఎలా ఉపయోగించారు?",
    "Monthly enterprise income BEFORE availing loan changes (Rs)?": "రుణం తీసుకోవడానికి ముందు సంస్థ నెలవారీ ఆదాయం (రూ)?",
    "ऋण से बदलाव करने से पहले उद्यम की मासिक आय (रु)?": "రుణం తీసుకోవడానికి ముందు సంస్థ నెలవారీ ఆదాయం (రూ)?",
    "Monthly enterprise income AFTER availing loan changes (Rs)?": "రుణం తీసుకున్న తర్వాత సంస్థ నెలవారీ ఆదాయం (రూ)?",
    "ऋण से बदलाव करने के बाद उद्यम की मासिक आय (रु)?": "రుణం తీసుకున్న తర్వాత సంస్థ నెలవారీ ఆదాయం (రూ)?",
    "What has been the contribution of SVEP / OSF CRPs?": "SVEP / OSF CRP ల సహకారం ఏమిటి?",
    "SVEP / OSF CRP का क्या योगदान रहा है?": "SVEP / OSF CRP ల సహకారం ఏమిటి?",
    "Does the woman entrepreneur own a smartphone?": "మహిళా పారిశ్రామికవేత్త వద్ద స్మార్ట్‌ఫోన్ ఉందా?",
    "क्या महिला उद्यमी के पास स्मार्टफोन है?": "మహిళా పారిశ్రామికవేత్త వద్ద స్మార్ట్‌ఫోన్ ఉందా?",
    "Do you use QR code / UPI / mobile banking for business transactions?": "వ్యాపార లావాదేవీల కోసం QR కోడ్ / UPI / మొబైల్ బ్యాంకింగ్ ఉపయోగిస్తున్నారా?",
    "क्या आप व्यावसायिक लेन-देन के लिए क्यूआर कोड / यूपीआई / मोबाइल बैंकिंग का उपयोग करते हैं?": "వ్యాపార లావాదేవీల కోసం QR కోడ్ / UPI / మొబైల్ బ్యాంకింగ్ ఉపయోగిస్తున్నారా?",
    "Daily how many transactions are done via QR code / UPI?": "రోజువారీ QR కోడ్ / UPI ద్వారా ఎన్ని లావాదేవీలు జరుగుతాయి?",
    "प्रतिदिन क्यूआर कोड / यूपीआई द्वारा कितने लेन-देन होते हैं?": "రోజువారీ QR కోడ్ / UPI ద్వారా ఎన్ని లావాదేవీలు జరుగుతాయి?",
    "Which social media platforms do you use for your business?": "మీ వ్యాపారం కోసం ఏ సోషల్ మీడియా ప్లాట్‌ఫారమ్‌లను ఉపయోగిస్తున్నారు?",
    "आप अपने व्यवसाय के लिए किन सोशल मीडिया प्लेटफॉर्म का उपयोग करते हैं?": "మీ వ్యాపారం కోసం ఏ సోషల్ మీడియా ప్లాట్‌ఫారమ్‌లను ఉపయోగిస్తున్నారు?",
    "Capture Enterprise GPS Location (Satellite Coordinates)": "సంస్థ జీపీఎస్ స్థానాన్ని క్యాప్చర్ చేయండి (ఉపగ్రహ కోఆర్డినేట్లు)",
    "उद्यम जीपीएस लोकेशन कैप्चर करें (उपग्रह निर्देशांक)": "సంస్థ జీపీఎస్ స్థానాన్ని క్యాప్చర్ చేయండి (ఉపగ్రహ కోఆర్డినేట్లు)",
    "Field Photo of Enterprise & Beneficiary": "సంస్థ మరియు లబ్ధిదారుని ఫీల్డ్ ఫోటో",
    "उद्यम और लाभार्थी का फील्ड फोटो": "సంస్థ మరియు లబ్ధిదారుని ఫీల్డ్ ఫోటో",
    "Respondent & Surveyor Digital Signature": "ప్రతివాది & సర్వేయర్ డిజిటల్ సంతకం",
    "उत्तरदाता और सर्वेक्षक के डिजिटल हस्ताक्षर": "ప్రతివాది & సర్వేయర్ డిజిటల్ సంతకం",
    "Yes": "అవును",
    "हाँ": "అవును",
    "No": "కాదు",
    "नहीं": "కాదు",
    "Baran": "బారన్",
    "बारां": "బారన్",
    "Churu": "చురు",
    "चूरू": "చురు",
    "Dausa": "దౌసా",
    "दौसा": "దౌసా",
    "Dungarpur": "డుంగర్‌పూర్",
    "डूंगरपुर": "డుంగర్‌పూర్",
    "Jodhpur": "జోధ్‌పూర్",
    "जोधपुर": "జోధ్‌పూర్",
    "Chhipabarod": "ఛీపాబరోద్",
    "छीपाबड़ौद": "ఛీపాబరోద్",
    "Kishanganj": "కిషన్‌గంజ్",
    "किशनगंज": "కిషన్‌గంజ్",
    "Sardar Sheher": "సర్దార్‌షహర్",
    "सरदारशहर": "సర్దార్‌షహర్",
    "Bidasar": "బిదాసర్",
    "बीदासर": "బిదాసర్",
    "Secundra": "సికంద్రా",
    "सिकंदरा": "సికంద్రా",
    "Sagwara": "సాగ్వారా",
    "सागवाड़ा": "సాగ్వారా",
    "Galiakot": "గలియాకోట్",
    "गलियाकोट": "గలియాకోట్",
    "Bicchiwada": "బిచ్చివాడా",
    "बिछीवाड़ा": "బిచ్చివాడా",
    "Jodhpur Block": "జోధ్‌పూర్ బ్లాక్",
    "जोधपुर ब्लॉक": "జోధ్‌పూర్ బ్లాక్",
    "Married": "వివాహితుడు/వివాహిత",
    "विवाहित": "వివాహితుడు/వివాహిత",
    "Single": "అవివాహితుడు/అవివాహిత",
    "अविवाहित": "అవివాహితుడు/అవివాహిత",
    "Widowed": "వితంతువు",
    "विधवा": "వితంతువు",
    "Divorced": "విడాకులు తీసుకున్నవారు",
    "तलाकशुदा": "విడాకులు తీసుకున్నవారు",
    "Separated": "విడిగా ఉంటున్నవారు",
    "अलग रह रहे": "విడిగా ఉంటున్నవారు",
    "General": "జనరల్ (General)",
    "सामान्य": "జనరల్ (General)",
    "OBC": "ఇతర వెనుకబడిన తరగతులు (OBC)",
    "अन्य पिछड़ा वर्ग (OBC)": "ఇతర వెనుకబడిన తరగతులు (OBC)",
    "SC": "షెడ్యూల్డ్ కులాలు (SC)",
    "अनुसूचित जाति (SC)": "షెడ్యూల్డ్ కులాలు (SC)",
    "ST": "షెడ్యూల్డ్ తెగలు (ST)",
    "अनुसूचित जनजाति (ST)": "షెడ్యూల్డ్ తెగలు (ST)",
    "Illiterate": "నిరక్షరాస్యులు",
    "निरक्षर / अनपढ़": "నిరక్షరాస్యులు",
    "Illiterate but able to calculate": "నిరక్షరాస్యులు కానీ లెక్కలు చేయగలరు",
    "अनपढ़ लेकिन हिसाब-किताब में सक्षम": "నిరక్షరాస్యులు కానీ లెక్కలు చేయగలరు",
    "5th pass": "5 వ తరగతి ఉత్తీర్ణత",
    "5वीं पास": "5 వ తరగతి ఉత్తీర్ణత",
    "8th pass": "8 వ తరగతి ఉత్తీర్ణత",
    "8वीं पास": "8 వ తరగతి ఉత్తీర్ణత",
    "10th pass": "10 వ తరగతి ఉత్తీర్ణత",
    "10वीं पास": "10 వ తరగతి ఉత్తీర్ణత",
    "12th pass": "12 వ తరగతి ఉత్తీర్ణత",
    "12वीं पास": "12 వ తరగతి ఉత్తీర్ణత",
    "Graduate": "గ్రాడ్యుయేట్ (Graduate)",
    "स्नातक (Graduate)": "గ్రాడ్యుయేట్ (Graduate)",
    "Self": "తానే",
    "स्वयं": "తానే",
    "Husband": "భర్త",
    "पति": "భర్త",
    "Son": "కుమారుడు",
    "पुत्र / बेटा": "కుమారుడు",
    "Daughter": "కుమార్తె",
    "पुत्री / बेटी": "కుమార్తె",
    "Member": "సభ్యుడు/సభ్యురాలు",
    "सामान्य सदस्य": "సభ్యుడు/సభ్యురాలు",
    "Leadership role": "నాయకత్వ పాత్ర (అధ్యక్షుడు/కార్యదర్శి/కోశాధికారి)",
    "पदाधिकारी / नेतृत्व पद (अध्यक्ष/सचिव/कोषाध्यक्ष)": "నాయకత్వ పాత్ర (అధ్యక్షుడు/కార్యదర్శి/కోశాధికారి)",
    "Grocery / Kirana": "కిరాణా దుకాణం",
    "किराना दुकान": "కిరాణా దుకాణం",
    "General store": "జనరల్ స్టోర్",
    "जनरल स्टोर": "జనరల్ స్టోర్",
    "Leather & footwear": "తోలు & పాదరక్షలు",
    "चमड़ा व जूते-चप्पल": "తోలు & పాదరక్షలు",
    "Flour mill": "పిండి గిర్ని",
    "आटा चक्की": "పిండి గిర్ని",
    "Tailoring & Stitching": "టైలరింగ్ & కుట్టు కేంద్రం",
    "सिलाई व कढ़ाई केंद्र": "టైలరింగ్ & కుట్టు కేంద్రం",
    "Apparel & Garments": "రెడీమేడ్ దుస్తులు",
    "रेडीमेड वस्त्र": "రెడీమేడ్ దుస్తులు",
    "Beauty parlour": "బ్యూటీ పార్లర్",
    "ब्यूटी पार्लर": "బ్యూటీ పార్లర్",
    "Handicraft": "హస్తకళలు",
    "हस्तशिल्प / हैंडीक्राफ्ट": "హస్తకళలు",
    "Dairy shop": "డైరీ & పాల కేంద్రం",
    "डेयरी व दूध केंद्र": "డైరీ & పాల కేంద్రం",
    "Auto-mechanic": "ఆటో మెకానిక్",
    "ऑटो मैकेनिक": "ఆటో మెకానిక్",
    "E-mitra": "ఈ-సేవ కేంద్రం / సీఎస్‌సీ",
    "ई-मित्र केंद्र / ग्राहक सेवा केंद्र": "ఈ-సేవ కేంద్రం / సీఎస్‌సీ",
    "Mobile repair shop": "మొబైల్ మరమ్మతు దుకాణం",
    "मोबाइल रिपेयर दुकान": "మొబైల్ మరమ్మతు దుకాణం",
    "Transport": "రవాణా సేవ",
    "परिवहन सेवा": "రవాణా సేవ",
    "Any other": "ఇతర ఏదైనా",
    "अन्य कोई": "ఇతర ఏదైనా",
    "Whatsapp": "వాట్సాప్",
    "व्हाट्सएप (WhatsApp)": "వాట్సాప్",
    "Facebook": "ఫేస్‌బుక్",
    "फेसबुक (Facebook)": "ఫేస్‌బుక్",
    "Instagram": "ఇన్‌స్టాగ్రామ్",
    "इंस्टाग्राम (Instagram)": "ఇన్‌స్టాగ్రామ్",
    "Don't use social media": "సోషల్ మీడియా ఉపయోగించరు",
    "सोशल मीडिया का उपयोग नहीं करते": "సోషల్ మీడియా ఉపయోగించరు",
    "Draft": "చిత్తుప్రతి",
    "Save Draft": "చిత్తుప్రతి భద్రపరచు",
    "ड्राफ्ट": "చిత్తుప్రతి",
    "मसुदा": "చిత్తుప్రతి",
    "ડ્રાફ્ટ": "చిత్తుప్రతి",
    "ਡਰਾਫਟ": "చిత్తుప్రతి",
    "খসড়া": "చిత్తుప్రతి",
    "வரைவு": "చిత్తుప్రతి",
    "చిత్తుప్రతి": "చిత్తుప్రతి",
    "ಕರಡು": "చిత్తుప్రతి",
    "ഡ്രാഫ്റ്റ്": "చిత్తుప్రతి",
    "ڈرافٹ": "చిత్తుప్రతి",
    "ड्राफ्ट सेव करें": "చిత్తుప్రతి భద్రపరచు",
    "मसुदा जतन करा": "చిత్తుప్రతి భద్రపరచు",
    "ડ્રાફ્ટ સાચવો": "చిత్తుప్రతి భద్రపరచు",
    "ਡਰਾਫਟ ਸੰਭਾਲੋ": "చిత్తుప్రతి భద్రపరచు",
    "খসড়া সংরক্ষণ": "చిత్తుప్రతి భద్రపరచు",
    "வரைவு சேமி": "చిత్తుప్రతి భద్రపరచు",
    "చిత్తుప్రతి భద్రపరచు": "చిత్తుప్రతి భద్రపరచు",
    "ಕರಡು ಉಳಿಸಿ": "చిత్తుప్రతి భద్రపరచు",
    "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക": "చిత్తుప్రతి భద్రపరచు",
    "ڈرافٹ محفوظ کریں": "చిత్తుప్రతి భద్రపరచు"
  },
  "kn": {
    "OmniServey": "ಓಮ್ನಿಸರ್ವೆ",
    "ओमनीसर्वे": "ಓಮ್ನಿಸರ್ವೆ",
    "Online": "ಆನ್‌ಲೈನ್",
    "ऑनलाइन": "ಆನ್‌ಲೈನ್",
    "Offline": "ಆಫ್‌ಲೈನ್",
    "ऑफलाइन": "ಆಫ್‌ಲೈನ್",
    "Surveys": "ಸಮೀಕ್ಷೆಗಳು",
    "सर्वेक्षण": "ಸಮೀಕ್ಷೆಗಳು",
    "WAL Queue": "ಕ್ಯೂ (ಆಫ್‌ಲೈನ್)",
    "कतार (ऑफलाइन)": "ಕ್ಯೂ (ಆಫ್‌ಲೈನ್)",
    "System": "ವ್ಯವಸ್ಥೆ",
    "सिस्टम": "ವ್ಯವಸ್ಥೆ",
    "Exit Form": "← ನಿರ್ಗಮಿಸಿ",
    "← बाहर निकलें": "← ನಿರ್ಗಮಿಸಿ",
    "Step": "ಹಂತ",
    "चरण": "ಹಂತ",
    "of": "ರ",
    "का": "ರ",
    "Pages": "ಪುಟಗಳು",
    "पृष्ठ": "ಪುಟಗಳು",
    "Questions": "ಪ್ರಶ್ನೆಗಳು",
    "प्रश्न": "ಪ್ರಶ್ನೆಗಳು",
    "Previous": "← ಹಿಂದಿನ",
    "← पिछला": "← ಹಿಂದಿನ",
    "Next": "ಮುಂದೆ →",
    "अगला →": "ಮುಂದೆ →",
    "Save Offline": "ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಉಳಿಸಿ",
    "ऑफलाइन सेव करें": "ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಉಳಿಸಿ",
    "Submit Survey": "ಸಲ್ಲಿಸಿ",
    "सबमिट करें": "ಸಲ್ಲಿಸಿ",
    "Capture GPS Coordinates": "ಜಿಪಿಎಸ್ ಸ್ಥಳವನ್ನು ದಾಖಲಿಸಿ",
    "जीपीएस लोकेशन रिकॉर्ड करें": "ಜಿಪಿಎಸ್ ಸ್ಥಳವನ್ನು ದಾಖಲಿಸಿ",
    "GPS Fix Acquired ✓": "ಜಿಪಿಎಸ್ ಸ್ಥಳ ಪಡೆಯಲಾಗಿದೆ ✓",
    "जीपीएस लोकेशन प्राप्त हुआ ✓": "ಜಿಪಿಎಸ್ ಸ್ಥಳ ಪಡೆಯಲಾಗಿದೆ ✓",
    "Take Photo / Choose File": "ಫೋಟೋ ತೆಗೆಯಿರಿ / ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ",
    "फोटो लें / फाइल चुनें": "ಫೋಟೋ ತೆಗೆಯಿರಿ / ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ",
    "Sign inside box with finger or stylus": "ನಿಮ್ಮ ಬೆರಳು ಅಥವಾ ಸ್ಟೈಲಸ್ ಬಳಸಿ ಸಹಿ ಮಾಡಿ",
    "अपनी उंगली या स्टाइलस से बॉक्स में हस्ताक्षर करें": "ನಿಮ್ಮ ಬೆರಳು ಅಥವಾ ಸ್ಟೈಲಸ್ ಬಳಸಿ ಸಹಿ ಮಾಡಿ",
    "Clear Signature": "ಸಹಿಯನ್ನು ಅಳಿಸಿ",
    "हस्ताक्षर मिटाएं": "ಸಹಿಯನ್ನು ಅಳಿಸಿ",
    "Signature Recorded": "ಸಹಿ ದಾಖಲಾಗಿದೆ",
    "हस्ताक्षर दर्ज हुआ": "ಸಹಿ ದಾಖಲಾಗಿದೆ",
    "Enter response here...": "ಇಲ್ಲಿ ಉತ್ತರಿಸಿ...",
    "यहाँ उत्तर दर्ज करें...": "ಇಲ್ಲಿ ಉತ್ತರಿಸಿ...",
    "Required Questions Pending": "ಅಗತ್ಯ ಪ್ರಶ್ನೆಗಳು ಬಾಕಿ ಇವೆ",
    "आवश्यक प्रश्न अधूरे हैं": "ಅಗತ್ಯ ಪ್ರಶ್ನೆಗಳು ಬಾಕಿ ಇವೆ",
    "Please fill in these required fields before final submission, or save as an offline draft anytime.": "ಅಂತಿಮ ಸಲ್ಲಿಕೆಗೆ ಮುನ್ನ ದಯವಿಟ್ಟು ಈ ಅಗತ್ಯ ಪ್ರಶ್ನೆಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ, ಅಥವಾ ಆಫ್‌ಲೈನ್ ಕರಡಾಗಿ ಉಳಿಸಿ.",
    "अंतिम सबमिशन से पहले कृपया इन आवश्यक प्रश्नों को भरें, या कभी भी ऑफलाइन ड्राफ्ट के रूप में सुरक्षित करें।": "ಅಂತಿಮ ಸಲ್ಲಿಕೆಗೆ ಮುನ್ನ ದಯವಿಟ್ಟು ಈ ಅಗತ್ಯ ಪ್ರಶ್ನೆಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ, ಅಥವಾ ಆಫ್‌ಲೈನ್ ಕರಡಾಗಿ ಉಳಿಸಿ.",
    "Go to First Pending Question": "👉 ಮೊದಲ ಬಾಕಿ ಪ್ರಶ್ನೆಗೆ ಹೋಗಿ",
    "👉 पहले अधूरे प्रश्न पर जाएं": "👉 ಮೊದಲ ಬಾಕಿ ಪ್ರಶ್ನೆಗೆ ಹೋಗಿ",
    "Save as Offline Draft Anyway": "ಆಫ್‌ಲೈನ್ ಕರಡಾಗಿ ಉಳಿಸಿ",
    "💾 ऑफलाइन ड्राफ्ट सुरक्षित करें": "ಆಫ್‌ಲೈನ್ ಕರಡಾಗಿ ಉಳಿಸಿ",
    "Close": "ಮುಚ್ಚಿ",
    "बंद करें": "ಮುಚ್ಚಿ",
    "Start Survey Form": "ಸಮೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ",
    "सर्वेक्षण शुरू करें": "ಸಮೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ",
    "Start Survey Form →": "ಸಮೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ →",
    "सर्वेक्षण शुरू करें →": "ಸಮೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ →",
    "Write-Ahead Log (WAL)": "ರೈಟ್-ಅಹೆಡ್ ಲಾಗ್ (WAL ಕ್ಯೂ)",
    "राइट-अहेड लॉग (WAL कतार)": "ರೈಟ್-ಅಹೆಡ್ ಲಾಗ್ (WAL ಕ್ಯೂ)",
    "Atomic zero-loss local storage queue": "ಶೂನ್ಯ ಡೇಟಾ ನಷ್ಟ ಸುರಕ್ಷಿತ ಸ್ಥಳೀಯ ಸಂಗ್ರಹಣೆ",
    "शून्य डेटा हानि सुरक्षित स्थानीय भंडारण": "ಶೂನ್ಯ ಡೇಟಾ ನಷ್ಟ ಸುರಕ್ಷಿತ ಸ್ಥಳೀಯ ಸಂಗ್ರಹಣೆ",
    "Sync Now": "⟳ ಈಗ ಸಿಂಕ್ ಮಾಡಿ",
    "⟳ अभी सिंक करें": "⟳ ಈಗ ಸಿಂಕ್ ಮಾಡಿ",
    "View on Map →": "ನಕ್ಷೆಯಲ್ಲಿ ನೋಡಿ →",
    "नक्शे पर देखें →": "ನಕ್ಷೆಯಲ್ಲಿ ನೋಡಿ →",
    "Re-acquire Fix": "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    "पुनः प्रयास करें": "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    "Section A: Basic Details": "ವಿಭಾಗ ಎ: ಮೂಲಭೂತ ವಿವರಗಳು",
    "भाग क: बुनियादी विवरण": "ವಿಭಾಗ ಎ: ಮೂಲಭೂತ ವಿವರಗಳು",
    "Section B: Respondent & Household Profile": "ವಿಭಾಗ ಬಿ: ಉತ್ತರಿಸುವವರು & ಕುಟುಂಬ ವಿವರ",
    "भाग ख: उत्तरदाता और परिवार की प्रोफ़ाइल": "ವಿಭಾಗ ಬಿ: ಉತ್ತರಿಸುವವರು & ಕುಟುಂಬ ವಿವರ",
    "Section C: Enterprise Operations & Finance": "ವಿಭಾಗ ಸಿ: ಉದ್ಯಮ ಕಾರ್ಯಾಚರಣೆಗಳು ಮತ್ತು ಹಣಕಾಸು",
    "भाग ग: उद्यम संचालन और वित्त": "ವಿಭಾಗ ಸಿ: ಉದ್ಯಮ ಕಾರ್ಯಾಚರಣೆಗಳು ಮತ್ತು ಹಣಕಾಸು",
    "Section D: Enterprise Challenges & Coping Mechanisms": "ವಿಭಾಗ ಡಿ: ಉದ್ಯಮ ಸವಾಲುಗಳು ಮತ್ತು ಪರಿಹಾರಗಳು",
    "भाग घ: उद्यम चुनौतियाँ और समाधान": "ವಿಭಾಗ ಡಿ: ಉದ್ಯಮ ಸವಾಲುಗಳು ಮತ್ತು ಪರಿಹಾರಗಳು",
    "Section E: Impact of SVEP / OSF Schemes": "ವಿಭಾಗ ಇ: ಎಸ್‍ವಿಇಪಿ / ಒಎಸ್‍ಎಫ್ ಯೋಜನೆಗಳ ಪ್ರಭಾವ",
    "भाग ङ: एसवीईपी / ओएसएफ योजनाओं का प्रभाव": "ವಿಭಾಗ ಇ: ಎಸ್‍ವಿಇಪಿ / ಒಎಸ್‍ಎಫ್ ಯೋಜನೆಗಳ ಪ್ರಭಾವ",
    "Section F: Digital Transactions & Social Media": "ವಿಭಾಗ ಎಫ್: ಡಿಜಿಟಲ್ ವಹಿವಾಟುಗಳು ಮತ್ತು ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ",
    "भाग च: डिजिटल लेन-देन और सोशल मीडिया": "ವಿಭಾಗ ಎಫ್: ಡಿಜಿಟಲ್ ವಹಿವಾಟುಗಳು ಮತ್ತು ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ",
    "Section G: Field Verification & Sign-off": "ವಿಭಾಗ ಜಿ: ಕ್ಷೇತ್ರ ಪರಿಶೀಲನೆ ಮತ್ತು ಸಹಿ",
    "भाग छ: फील्ड सत्यापन और हस्ताक्षर": "ವಿಭಾಗ ಜಿ: ಕ್ಷೇತ್ರ ಪರಿಶೀಲನೆ ಮತ್ತು ಸಹಿ",
    "District": "ಜಿಲ್ಲೆ",
    "जिला": "ಜಿಲ್ಲೆ",
    "Block / Tehsil": "ತಾಲೂಕು / ಬ್ಲಾಕ್",
    "ब्लॉक / तहसील": "ತಾಲೂಕು / ಬ್ಲಾಕ್",
    "Village / Gram Panchayat Name": "ಗ್ರಾಮ / ಗ್ರಾಮ ಪಂಚಾಯತಿ ಹೆಸರು",
    "गाँव / ग्राम पंचायत का नाम": "ಗ್ರಾಮ / ಗ್ರಾಮ ಪಂಚಾಯತಿ ಹೆಸರು",
    "Cluster Level Federation (CLF) Name": "ಕ್ಲಸ್ಟರ್ ಮಟ್ಟದ ಒಕ್ಕೂಟ (CLF) ಹೆಸರು",
    "क्लस्टर लेवल फेडरेशन (CLF) का नाम": "ಕ್ಲಸ್ಟರ್ ಮಟ್ಟದ ಒಕ್ಕೂಟ (CLF) ಹೆಸರು",
    "Village Organization (VO) Name": "ಗ್ರಾಮ ಸಂಸ್ಥೆ (VO) ಹೆಸರು",
    "ग्राम संगठन (VO) का नाम": "ಗ್ರಾಮ ಸಂಸ್ಥೆ (VO) ಹೆಸರು",
    "Self-Help Group (SHG) Name": "ಸ್ವಸಹಾಯ ಗುಂಪು (SHG) ಹೆಸರು",
    "स्वयं सहायता समूह (SHG) का नाम": "ಸ್ವಸಹಾಯ ಗುಂಪು (SHG) ಹೆಸರು",
    "Respondent Name": "ಉತ್ತರಿಸುವವರ ಹೆಸರು",
    "उत्तरदाता का नाम": "ಉತ್ತರಿಸುವವರ ಹೆಸರು",
    "Enterprise / Business Name": "ಉದ್ಯಮ / ವ್ಯಾಪಾರದ ಹೆಸರು",
    "उद्यम / व्यवसाय का नाम": "ಉದ್ಯಮ / ವ್ಯಾಪಾರದ ಹೆಸರು",
    "Year of Setting Up Enterprise": "ಉದ್ಯಮ ಸ್ಥಾಪನೆಯ ವರ್ಷ",
    "उद्यम स्थापना का वर्ष": "ಉದ್ಯಮ ಸ್ಥಾಪನೆಯ ವರ್ಷ",
    "Main Business Activity of the Enterprise": "ಉದ್ಯಮದ ಮುಖ್ಯ ವ್ಯಾಪಾರ ಚಟುವಟಿಕೆ",
    "उद्यम की मुख्य व्यावसायिक गतिविधि": "ಉದ್ಯಮದ ಮುಖ್ಯ ವ್ಯಾಪಾರ ಚಟುವಟಿಕೆ",
    "What is respondent's relation with SHG member?": "ಎಸ್‌ಎಚ್‌ಜಿ ಸದಸ್ಯರೊಂದಿಗೆ ಉತ್ತರಿಸುವವರ ಸಂಬಂಧವೇನು?",
    "उत्तरदाता का एसएचजी सदस्य से क्या संबंध है?": "ಎಸ್‌ಎಚ್‌ಜಿ ಸದಸ್ಯರೊಂದಿಗೆ ಉತ್ತರಿಸುವವರ ಸಂಬಂಧವೇನು?",
    "What is the age of SHG member?": "ಎಸ್‌ಎಚ್‌ಜಿ ಸದಸ್ಯರ ವಯಸ್ಸು ಎಷ್ಟು?",
    "एसएचजी सदस्य की आयु क्या है?": "ಎಸ್‌ಎಚ್‌ಜಿ ಸದಸ್ಯರ ವಯಸ್ಸು ಎಷ್ಟು?",
    "What is the marital status of the SHG member?": "ಎಸ್‌ಎಚ್‌ಜಿ ಸದಸ್ಯರ ವೈವಾಹಿಕ ಸ್ಥಿತಿ ಏನು?",
    "एसएचजी सदस्य की वैवाहिक स्थिति क्या है?": "ಎಸ್‌ಎಚ್‌ಜಿ ಸದಸ್ಯರ ವೈವಾಹಿಕ ಸ್ಥಿತಿ ಏನು?",
    "What is the social category / caste?": "ಸಾಮಾಜಿಕ ವರ್ಗ / ಜಾತಿ ಯಾವುದು?",
    "सामाजिक श्रेणी / जाति क्या है?": "ಸಾಮಾಜಿಕ ವರ್ಗ / ಜಾತಿ ಯಾವುದು?",
    "What is the education status of the SHG member?": "ಎಸ್‌ಎಚ್‌ಜಿ ಸದಸ್ಯರ ಶೈಕ್ಷಣಿಕ ಮಟ್ಟವೇನು?",
    "एसएचजी सदस्य की शैक्षणिक स्थिति क्या है?": "ಎಸ್‌ಎಚ್‌ಜಿ ಸದಸ್ಯರ ಶೈಕ್ಷಣಿಕ ಮಟ್ಟವೇನು?",
    "How many total members are in the family?": "ಕುಟುಂಬದಲ್ಲಿ ಒಟ್ಟು ಎಷ್ಟು ಸದಸ್ಯರಿದ್ದಾರೆ?",
    "परिवार में कुल कितने सदस्य हैं?": "ಕುಟುಂಬದಲ್ಲಿ ಒಟ್ಟು ಎಷ್ಟು ಸದಸ್ಯರಿದ್ದಾರೆ?",
    "What is your total annual household income?": "ನಿಮ್ಮ ಒಟ್ಟು ವಾರ್ಷಿಕ ಕುಟುಂಬದ ಆದಾಯ ಎಷ್ಟು?",
    "आपकी कुल वार्षिक पारिवारिक आय कितनी है?": "ನಿಮ್ಮ ಒಟ್ಟು ವಾರ್ಷಿಕ ಕುಟುಂಬದ ಆದಾಯ ಎಷ್ಟು?",
    "What is your role in the SHG?": "ಎಸ್‌ಎಚ್‌ಜಿಯಲ್ಲಿ ನಿಮ್ಮ ಪಾತ್ರವೇನು?",
    "एसएचजी में आपकी भूमिका क्या है?": "ಎಸ್‌ಎಚ್‌ಜಿಯಲ್ಲಿ ನಿಮ್ಮ ಪಾತ್ರವೇನು?",
    "Are you related to any of the SVEP / OSF CRP?": "ನೀವು ಯಾವುದೇ SVEP / OSF CRP ಗೆ ಸಂಬಂಧಿಸಿದ್ದೀರಾ?",
    "क्या आप किसी SVEP / OSF CRP से संबंधित हैं?": "ನೀವು ಯಾವುದೇ SVEP / OSF CRP ಗೆ ಸಂಬಂಧಿಸಿದ್ದೀರಾ?",
    "Who started the enterprise?": "ಉದ್ಯಮವನ್ನು ಯಾರು ಪ್ರಾರಂಭಿಸಿದರು?",
    "उद्यम किसने शुरू किया था?": "ಉದ್ಯಮವನ್ನು ಯಾರು ಪ್ರಾರಂಭಿಸಿದರು?",
    "Who operates and manages the enterprise on a daily basis?": "ದೈನಂದಿನ ಆಧಾರದ ಮೇಲೆ ಉದ್ಯಮವನ್ನು ಯಾರು ನಿರ್ವಹಿಸುತ್ತಾರೆ?",
    "दैनिक आधार पर उद्यम का संचालन और प्रबंधन कौन करता है?": "ದೈನಂದಿನ ಆಧಾರದ ಮೇಲೆ ಉದ್ಯಮವನ್ನು ಯಾರು ನಿರ್ವಹಿಸುತ್ತಾರೆ?",
    "For how many hours in a day does the shop/enterprise remain open?": "ದಿನದಲ್ಲಿ ಎಷ್ಟು ಗಂಟೆ ಅಂಗಡಿ/ಉದ್ಯಮ ತೆರೆದಿರುತ್ತದೆ?",
    "दिन में कितने घंटे दुकान/उद्यम खुला रहता है?": "ದಿನದಲ್ಲಿ ಎಷ್ಟು ಗಂಟೆ ಅಂಗಡಿ/ಉದ್ಯಮ ತೆರೆದಿರುತ್ತದೆ?",
    "What is the type of business place / premises?": "ವ್ಯಾಪಾರ ಸ್ಥಳದ ಪ್ರಕಾರ ಯಾವುದು?",
    "व्यावसायिक स्थान/परिसर का प्रकार क्या है?": "ವ್ಯಾಪಾರ ಸ್ಥಳದ ಪ್ರಕಾರ ಯಾವುದು?",
    "Does SHG member maintain written records of business transactions regularly?": "ಎಸ್‌ಎಚ್‌ಜಿ ಸದಸ್ಯರು ವ್ಯಾಪಾರ ವಹಿವಾಟುಗಳ ಲಿಖಿತ ದಾಖಲೆಗಳನ್ನು ನಿಯಮಿತವಾಗಿ ಇಟ್ಟುಕೊಳ್ಳುತ್ತಾರೆಯೇ?",
    "क्या एसएचजी सदस्य नियमित रूप से व्यावसायिक लेन-देन का लिखित रिकॉर्ड रखते हैं?": "ಎಸ್‌ಎಚ್‌ಜಿ ಸದಸ್ಯರು ವ್ಯಾಪಾರ ವಹಿವಾಟುಗಳ ಲಿಖಿತ ದಾಖಲೆಗಳನ್ನು ನಿಯಮಿತವಾಗಿ ಇಟ್ಟುಕೊಳ್ಳುತ್ತಾರೆಯೇ?",
    "In the first year of your enterprise, what was the amount of seed capital (Rs)?": "ನಿಮ್ಮ ಉದ್ಯಮದ ಮೊದಲ ವರ್ಷದಲ್ಲಿ ಆರಂಭಿಕ ಬಂಡವಾಳ (ರೂ) ಎಷ್ಟಿತ್ತು?",
    "आपके उद्यम के पहले वर्ष में प्रारंभिक बीज पूंजी की राशि (रु) क्या थी?": "ನಿಮ್ಮ ಉದ್ಯಮದ ಮೊದಲ ವರ್ಷದಲ್ಲಿ ಆರಂಭಿಕ ಬಂಡವಾಳ (ರೂ) ಎಷ್ಟಿತ್ತು?",
    "How do you manage working capital during peak season?": "ಗರಿಷ್ಠ ಋತುವಿನಲ್ಲಿ ನೀವು ಕಾರ್ಯನಿರತ ಬಂಡವಾಳವನ್ನು ಹೇಗೆ ನಿರ್ವಹಿಸುತ್ತೀರಿ?",
    "पीक सीजन के दौरान आप कार्यशील पूंजी का प्रबंधन कैसे करते हैं?": "ಗರಿಷ್ಠ ಋತುವಿನಲ್ಲಿ ನೀವು ಕಾರ್ಯನಿರತ ಬಂಡವಾಳವನ್ನು ಹೇಗೆ ನಿರ್ವಹಿಸುತ್ತೀರಿ?",
    "Is the location of your space convenient for your business?": "ನಿಮ್ಮ ವ್ಯಾಪಾರಕ್ಕೆ ಸ್ಥಳವು ಅನುಕೂಲಕರವಾಗಿದೆಯೇ?",
    "क्या आपके स्थान की स्थिति आपके व्यवसाय के लिए सुविधाजनक है?": "ನಿಮ್ಮ ವ್ಯಾಪಾರಕ್ಕೆ ಸ್ಥಳವು ಅನುಕೂಲಕರವಾಗಿದೆಯೇ?",
    "Are you satisfied and happy with your wholesale supplier?": "ನಿಮ್ಮ ಸಗಟು ಪೂರೈಕೆದಾರರೊಂದಿಗೆ ನೀವು ತೃಪ್ತರಾಗಿದ್ದೀರಾ?",
    "क्या आप अपने थोक सप्लायर से संतुष्ट और खुश हैं?": "ನಿಮ್ಮ ಸಗಟು ಪೂರೈಕೆದಾರರೊಂದಿಗೆ ನೀವು ತೃಪ್ತರಾಗಿದ್ದೀರಾ?",
    "Are you able to recover credit / money from your customers?": "ಗ್ರಾಹಕರಿಂದ ಸಾಲ/ಹಣವನ್ನು ವಸೂಲಿ ಮಾಡಲು ನಿಮಗೆ ಸಾಧ್ಯವಾಗುತ್ತಿದೆಯೇ?",
    "क्या आप अपने ग्राहकों से उधारी/पैसा वसूल पाते हैं?": "ಗ್ರಾಹಕರಿಂದ ಸಾಲ/ಹಣವನ್ನು ವಸೂಲಿ ಮಾಡಲು ನಿಮಗೆ ಸಾಧ್ಯವಾಗುತ್ತಿದೆಯೇ?",
    "Do you source raw materials/goods from market independently?": "ಮಾರುಕಟ್ಟೆಯಿಂದ ಕಚ್ಚಾ ವಸ್ತುಗಳನ್ನು ಸ್ವತಂತ್ರವಾಗಿ ಖರೀದಿಸುತ್ತೀರಾ?",
    "क्या आप बाजार से स्वतंत्र रूप से कच्चा माल/सामान लाते हैं?": "ಮಾರುಕಟ್ಟೆಯಿಂದ ಕಚ್ಚಾ ವಸ್ತುಗಳನ್ನು ಸ್ವತಂತ್ರವಾಗಿ ಖರೀದಿಸುತ್ತೀರಾ?",
    "Do you have easy access to loans from different sources?": "ವಿವಿಧ ಮೂಲಗಳಿಂದ ಸುಲಭವಾಗಿ ಸಾಲ ಸಿಗುತ್ತದೆಯೇ?",
    "क्या आपको विभिन्न स्रोतों से ऋण की आसान पहुँच प्राप्त है?": "ವಿವಿಧ ಮೂಲಗಳಿಂದ ಸುಲಭವಾಗಿ ಸಾಲ ಸಿಗುತ್ತದೆಯೇ?",
    "How much loan amount have you availed under SVEP / OSF scheme (Rs)?": "SVEP / OSF ಯೋಜನೆಯಡಿ ಎಷ್ಟು ಸಾಲ ಪಡೆದಿದ್ದೀರಿ (ರೂ)?",
    "आपने SVEP / OSF योजना के तहत कितनी ऋण राशि प्राप्त की है (रु)?": "SVEP / OSF ಯೋಜನೆಯಡಿ ಎಷ್ಟು ಸಾಲ ಪಡೆದಿದ್ದೀರಿ (ರೂ)?",
    "How did you utilize the enterprise loan?": "ಉದ್ಯಮ ಸಾಲವನ್ನು ನೀವು ಹೇಗೆ ಬಳಸಿದ್ದೀರಿ?",
    "आपने उद्यम ऋण का उपयोग किस प्रकार किया?": "ಉದ್ಯಮ ಸಾಲವನ್ನು ನೀವು ಹೇಗೆ ಬಳಸಿದ್ದೀರಿ?",
    "Monthly enterprise income BEFORE availing loan changes (Rs)?": "ಸಾಲ ಪಡೆಯುವ ಮೊದಲು ಉದ್ಯಮದ ಮಾಸಿಕ ಆದಾಯ (ರೂ)?",
    "ऋण से बदलाव करने से पहले उद्यम की मासिक आय (रु)?": "ಸಾಲ ಪಡೆಯುವ ಮೊದಲು ಉದ್ಯಮದ ಮಾಸಿಕ ಆದಾಯ (ರೂ)?",
    "Monthly enterprise income AFTER availing loan changes (Rs)?": "ಸಾಲ ಪಡೆದ ನಂತರ ಉದ್ಯಮದ ಮಾಸಿಕ ಆದಾಯ (ರೂ)?",
    "ऋण से बदलाव करने के बाद उद्यम की मासिक आय (रु)?": "ಸಾಲ ಪಡೆದ ನಂತರ ಉದ್ಯಮದ ಮಾಸಿಕ ಆದಾಯ (ರೂ)?",
    "What has been the contribution of SVEP / OSF CRPs?": "SVEP / OSF CRP ಗಳ ಕೊಡುಗೆ ಏನು?",
    "SVEP / OSF CRP का क्या योगदान रहा है?": "SVEP / OSF CRP ಗಳ ಕೊಡುಗೆ ಏನು?",
    "Does the woman entrepreneur own a smartphone?": "ಮಹಿಳಾ ಉದ್ಯಮಿಯ ಬಳಿ ಸ್ಮಾರ್ಟ್‌ಫೋನ್ ಇದೆಯೇ?",
    "क्या महिला उद्यमी के पास स्मार्टफोन है?": "ಮಹಿಳಾ ಉದ್ಯಮಿಯ ಬಳಿ ಸ್ಮಾರ್ಟ್‌ಫೋನ್ ಇದೆಯೇ?",
    "Do you use QR code / UPI / mobile banking for business transactions?": "ವ್ಯಾಪಾರ ವಹಿವಾಟುಗಳಿಗೆ ನೀವು QR ಕೋಡ್ / UPI / ಮೊಬೈಲ್ ಬ್ಯಾಂಕಿಂಗ್ ಬಳಸುತ್ತೀರಾ?",
    "क्या आप व्यावसायिक लेन-देन के लिए क्यूआर कोड / यूपीआई / मोबाइल बैंकिंग का उपयोग करते हैं?": "ವ್ಯಾಪಾರ ವಹಿವಾಟುಗಳಿಗೆ ನೀವು QR ಕೋಡ್ / UPI / ಮೊಬೈಲ್ ಬ್ಯಾಂಕಿಂಗ್ ಬಳಸುತ್ತೀರಾ?",
    "Daily how many transactions are done via QR code / UPI?": "ಪ್ರತಿದಿನ QR ಕೋಡ್ / UPI ಮೂಲಕ ಎಷ್ಟು ವಹಿವಾಟುಗಳು ನಡೆಯುತ್ತವೆ?",
    "प्रतिदिन क्यूआर कोड / यूपीआई द्वारा कितने लेन-देन होते हैं?": "ಪ್ರತಿದಿನ QR ಕೋಡ್ / UPI ಮೂಲಕ ಎಷ್ಟು ವಹಿವಾಟುಗಳು ನಡೆಯುತ್ತವೆ?",
    "Which social media platforms do you use for your business?": "ನಿಮ್ಮ ವ್ಯಾಪಾರಕ್ಕಾಗಿ ನೀವು ಯಾವ ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ ವೇದಿಕೆಗಳನ್ನು ಬಳಸುತ್ತೀರಿ?",
    "आप अपने व्यवसाय के लिए किन सोशल मीडिया प्लेटफॉर्म का उपयोग करते हैं?": "ನಿಮ್ಮ ವ್ಯಾಪಾರಕ್ಕಾಗಿ ನೀವು ಯಾವ ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ ವೇದಿಕೆಗಳನ್ನು ಬಳಸುತ್ತೀರಿ?",
    "Capture Enterprise GPS Location (Satellite Coordinates)": "ಉದ್ಯಮ ಜಿಪಿಎಸ್ ಸ್ಥಳವನ್ನು ಸೆರೆಹಿಡಿಯಿರಿ (ಉಪಗ್ರಹ ನಿರ್ದೇಶಾಂಕಗಳು)",
    "उद्यम जीपीएस लोकेशन कैप्चर करें (उपग्रह निर्देशांक)": "ಉದ್ಯಮ ಜಿಪಿಎಸ್ ಸ್ಥಳವನ್ನು ಸೆರೆಹಿಡಿಯಿರಿ (ಉಪಗ್ರಹ ನಿರ್ದೇಶಾಂಕಗಳು)",
    "Field Photo of Enterprise & Beneficiary": "ಉದ್ಯಮ ಮತ್ತು ಫಲಾನುಭವಿಯ ಕ್ಷೇತ್ರ ಫೋಟೋ",
    "उद्यम और लाभार्थी का फील्ड फोटो": "ಉದ್ಯಮ ಮತ್ತು ಫಲಾನುಭವಿಯ ಕ್ಷೇತ್ರ ಫೋಟೋ",
    "Respondent & Surveyor Digital Signature": "ಉತ್ತರಿಸುವವರು ಮತ್ತು ಸಮೀಕ್ಷಕರ ಡಿಜಿಟಲ್ ಸಹಿ",
    "उत्तरदाता और सर्वेक्षक के डिजिटल हस्ताक्षर": "ಉತ್ತರಿಸುವವರು ಮತ್ತು ಸಮೀಕ್ಷಕರ ಡಿಜಿಟಲ್ ಸಹಿ",
    "Yes": "ಹೌದು",
    "हाँ": "ಹೌದು",
    "No": "ಇಲ್ಲ",
    "नहीं": "ಇಲ್ಲ",
    "Baran": "ಬಾರಾನ್",
    "बारां": "ಬಾರಾನ್",
    "Churu": "ಚುರು",
    "चूरू": "ಚುರು",
    "Dausa": "ದೌಸಾ",
    "दौसा": "ದೌಸಾ",
    "Dungarpur": "ಡುಂಗರ್‌ಪುರ",
    "डूंगरपुर": "ಡುಂಗರ್‌ಪುರ",
    "Jodhpur": "ಜೋಧ್‌ಪುರ",
    "जोधपुर": "ಜೋಧ್‌ಪುರ",
    "Chhipabarod": "ಛೀಪಾಬರೋದ್",
    "छीपाबड़ौद": "ಛೀಪಾಬರೋದ್",
    "Kishanganj": "ಕಿಶನ್‌ಗಂಜ್",
    "किशनगंज": "ಕಿಶನ್‌ಗಂಜ್",
    "Sardar Sheher": "ಸರ್ದಾರ್ ಶಹರ್",
    "सरदारशहर": "ಸರ್ದಾರ್ ಶಹರ್",
    "Bidasar": "ಬಿದಾಸರ್",
    "बीदासर": "ಬಿದಾಸರ್",
    "Secundra": "ಸಿಕಂದ್ರಾ",
    "सिकंदरा": "ಸಿಕಂದ್ರಾ",
    "Sagwara": "ಸಾಗ್ವಾರಾ",
    "सागवाड़ा": "ಸಾಗ್ವಾರಾ",
    "Galiakot": "ಗಲಿಯಾಕೋಟ್",
    "गलियाकोट": "ಗಲಿಯಾಕೋಟ್",
    "Bicchiwada": "ಬಿಚ್ಚಿವಾಡಾ",
    "बिछीवाड़ा": "ಬಿಚ್ಚಿವಾಡಾ",
    "Jodhpur Block": "ಜೋಧ್‌ಪುರ ಬ್ಲಾಕ್",
    "जोधपुर ब्लॉक": "ಜೋಧ್‌ಪುರ ಬ್ಲಾಕ್",
    "Married": "ವಿವಾಹಿತ",
    "विवाहित": "ವಿವಾಹಿತ",
    "Single": "ಅವಿವಾಹಿತ",
    "अविवाहित": "ಅವಿವಾಹಿತ",
    "Widowed": "ವಿಧವೆ",
    "विधवा": "ವಿಧವೆ",
    "Divorced": "ವಿಚ್ಛೇದಿತ",
    "तलाकशुदा": "ವಿಚ್ಛೇದಿತ",
    "Separated": "ಬೇರೆಯಾಗಿರುವವರು",
    "अलग रह रहे": "ಬೇರೆಯಾಗಿರುವವರು",
    "General": "ಸಾಮಾನ್ಯ (General)",
    "सामान्य": "ಸಾಮಾನ್ಯ (General)",
    "OBC": "ಇತರ ಹಿಂದುಳಿದ ವರ್ಗ (OBC)",
    "अन्य पिछड़ा वर्ग (OBC)": "ಇತರ ಹಿಂದುಳಿದ ವರ್ಗ (OBC)",
    "SC": "ಪರಿಶಿಷ್ಟ ಜಾತಿ (SC)",
    "अनुसूचित जाति (SC)": "ಪರಿಶಿಷ್ಟ ಜಾತಿ (SC)",
    "ST": "ಪರಿಶಿಷ್ಟ ಪಂಗಡ (ST)",
    "अनुसूचित जनजाति (ST)": "ಪರಿಶಿಷ್ಟ ಪಂಗಡ (ST)",
    "Illiterate": "ಅನಕ್ಷರಸ್ಥ",
    "निरक्षर / अनपढ़": "ಅನಕ್ಷರಸ್ಥ",
    "Illiterate but able to calculate": "ಅನಕ್ಷರಸ್ಥ ಆದರೆ ಲೆಕ್ಕಾಚಾರ ಮಾಡಬಲ್ಲವರು",
    "अनपढ़ लेकिन हिसाब-किताब में सक्षम": "ಅನಕ್ಷರಸ್ಥ ಆದರೆ ಲೆಕ್ಕಾಚಾರ ಮಾಡಬಲ್ಲವರು",
    "5th pass": "5 ನೇ ತರಗತಿ ಉತ್ತೀರ್ಣ",
    "5वीं पास": "5 ನೇ ತರಗತಿ ಉತ್ತೀರ್ಣ",
    "8th pass": "8 ನೇ ತರಗತಿ ಉತ್ತೀರ್ಣ",
    "8वीं पास": "8 ನೇ ತರಗತಿ ಉತ್ತೀರ್ಣ",
    "10th pass": "10 ನೇ ತರಗತಿ ಉತ್ತೀರ್ಣ",
    "10वीं पास": "10 ನೇ ತರಗತಿ ಉತ್ತೀರ್ಣ",
    "12th pass": "12 ನೇ ತರಗತಿ ಉತ್ತೀರ್ಣ",
    "12वीं पास": "12 ನೇ ತರಗತಿ ಉತ್ತೀರ್ಣ",
    "Graduate": "ಪದವೀಧರ (Graduate)",
    "स्नातक (Graduate)": "ಪದವೀಧರ (Graduate)",
    "Self": "ಸ್ವತಃ",
    "स्वयं": "ಸ್ವತಃ",
    "Husband": "ಪತಿ",
    "पति": "ಪತಿ",
    "Son": "ಮಗ",
    "पुत्र / बेटा": "ಮಗ",
    "Daughter": "ಮಗಳು",
    "पुत्री / बेटी": "ಮಗಳು",
    "Member": "ಸದಸ್ಯ",
    "सामान्य सदस्य": "ಸದಸ್ಯ",
    "Leadership role": "ನಾಯಕತ್ವದ ಪಾತ್ರ (ಅಧ್ಯಕ್ಷ/ಕಾರ್ಯದರ್ಶಿ/ಖಜಾಂಚಿ)",
    "पदाधिकारी / नेतृत्व पद (अध्यक्ष/सचिव/कोषाध्यक्ष)": "ನಾಯಕತ್ವದ ಪಾತ್ರ (ಅಧ್ಯಕ್ಷ/ಕಾರ್ಯದರ್ಶಿ/ಖಜಾಂಚಿ)",
    "Grocery / Kirana": "ಕಿರಾಣಿ ಅಂಗಡಿ",
    "किराना दुकान": "ಕಿರಾಣಿ ಅಂಗಡಿ",
    "General store": "ಜನರಲ್ ಸ್ಟೋರ್",
    "जनरल स्टोर": "ಜನರಲ್ ಸ್ಟೋರ್",
    "Leather & footwear": "ಚರ್ಮ ಮತ್ತು ಪಾದರಕ್ಷೆಗಳು",
    "चमड़ा व जूते-चप्पल": "ಚರ್ಮ ಮತ್ತು ಪಾದರಕ್ಷೆಗಳು",
    "Flour mill": "ಹಿಟ್ಟಿನ ಗಿರಣಿ",
    "आटा चक्की": "ಹಿಟ್ಟಿನ ಗಿರಣಿ",
    "Tailoring & Stitching": "ಹೊಲಿಗೆ ಮತ್ತು ಕಸೂತಿ ಕೇಂದ್ರ",
    "सिलाई व कढ़ाई केंद्र": "ಹೊಲಿಗೆ ಮತ್ತು ಕಸೂತಿ ಕೇಂದ್ರ",
    "Apparel & Garments": "ರೆಡಿಮೇಡ್ ಉಡುಪುಗಳು",
    "रेडीमेड वस्त्र": "ರೆಡಿಮೇಡ್ ಉಡುಪುಗಳು",
    "Beauty parlour": "ಬ್ಯೂಟಿ ಪಾರ್ಲರ್",
    "ब्यूटी पार्लर": "ಬ್ಯೂಟಿ ಪಾರ್ಲರ್",
    "Handicraft": "ಕರಕುಶಲ ವಸ್ತುಗಳು",
    "हस्तशिल्प / हैंडीक्राफ्ट": "ಕರಕುಶಲ ವಸ್ತುಗಳು",
    "Dairy shop": "ಡೈರಿ ಮತ್ತು ಹಾಲಿನ ಕೇಂದ್ರ",
    "डेयरी व दूध केंद्र": "ಡೈರಿ ಮತ್ತು ಹಾಲಿನ ಕೇಂದ್ರ",
    "Auto-mechanic": "ಆಟೋ ಮೆಕ್ಯಾನಿಕ್",
    "ऑटो मैकेनिक": "ಆಟೋ ಮೆಕ್ಯಾನಿಕ್",
    "E-mitra": "ಇ-ಮಿತ್ರ / ಸಿಎಸ್‌ಸಿ ಕೇಂದ್ರ",
    "ई-मित्र केंद्र / ग्राहक सेवा केंद्र": "ಇ-ಮಿತ್ರ / ಸಿಎಸ್‌ಸಿ ಕೇಂದ್ರ",
    "Mobile repair shop": "ಮೊಬೈಲ್ ರಿಪೇರಿ ಅಂಗಡಿ",
    "मोबाइल रिपेयर दुकान": "ಮೊಬೈಲ್ ರಿಪೇರಿ ಅಂಗಡಿ",
    "Transport": "ಸಾರಿಗೆ ಸೇವೆ",
    "परिवहन सेवा": "ಸಾರಿಗೆ ಸೇವೆ",
    "Any other": "ಇತರ ಯಾವುದೇ",
    "अन्य कोई": "ಇತರ ಯಾವುದೇ",
    "Whatsapp": "ವಾಟ್ಸಾಪ್",
    "व्हाट्सएप (WhatsApp)": "ವಾಟ್ಸಾಪ್",
    "Facebook": "ಫೇಸ್‌ಬುಕ್",
    "फेसबुक (Facebook)": "ಫೇಸ್‌ಬುಕ್",
    "Instagram": "ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್",
    "इंस्टाग्राम (Instagram)": "ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್",
    "Don't use social media": "ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ ಬಳಸುವುದಿಲ್ಲ",
    "सोशल मीडिया का उपयोग नहीं करते": "ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ ಬಳಸುವುದಿಲ್ಲ",
    "Draft": "ಕರಡು",
    "Save Draft": "ಕರಡು ಉಳಿಸಿ",
    "ड्राफ्ट": "ಕರಡು",
    "मसुदा": "ಕರಡು",
    "ડ્રાફ્ટ": "ಕರಡು",
    "ਡਰਾਫਟ": "ಕರಡು",
    "খসড়া": "ಕರಡು",
    "வரைவு": "ಕರಡು",
    "చిత్తుప్రతి": "ಕರಡು",
    "ಕರಡು": "ಕರಡು",
    "ഡ്രാഫ്റ്റ്": "ಕರಡು",
    "ڈرافٹ": "ಕರಡು",
    "ड्राफ्ट सेव करें": "ಕರಡು ಉಳಿಸಿ",
    "मसुदा जतन करा": "ಕರಡು ಉಳಿಸಿ",
    "ડ્રાફ્ટ સાચવો": "ಕರಡು ಉಳಿಸಿ",
    "ਡਰਾਫਟ ਸੰਭਾਲੋ": "ಕರಡು ಉಳಿಸಿ",
    "খসড়া সংরক্ষণ": "ಕರಡು ಉಳಿಸಿ",
    "வரைவு சேமி": "ಕರಡು ಉಳಿಸಿ",
    "చిత్తుప్రతి భద్రపరచు": "ಕರಡು ಉಳಿಸಿ",
    "ಕರಡು ಉಳಿಸಿ": "ಕರಡು ಉಳಿಸಿ",
    "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക": "ಕರಡು ಉಳಿಸಿ",
    "ڈرافٹ محفوظ کریں": "ಕರಡು ಉಳಿಸಿ"
  },
  "ml": {
    "OmniServey": "ഓമ്നിസർവെ",
    "ओमनीसर्वे": "ഓമ്നിസർവെ",
    "Online": "ഓൺ‌ലൈൻ",
    "ऑनलाइन": "ഓൺ‌ലൈൻ",
    "Offline": "ഓഫ്‌ലൈൻ",
    "ऑफलाइन": "ഓഫ്‌ലൈൻ",
    "Surveys": "സർവേകൾ",
    "सर्वेक्षण": "സർവേകൾ",
    "WAL Queue": "ക്യൂ (ഓഫ്‌ലൈൻ)",
    "कतार (ऑफलाइन)": "ക്യൂ (ഓഫ്‌ലൈൻ)",
    "System": "സിസ്റ്റം",
    "सिस्टम": "സിസ്റ്റം",
    "Exit Form": "← പുറത്തുകടക്കുക",
    "← बाहर निकलें": "← പുറത്തുകടക്കുക",
    "Step": "ഘട്ടം",
    "चरण": "ഘട്ടം",
    "of": "ന്റെ",
    "का": "ന്റെ",
    "Pages": "പേജുകൾ",
    "पृष्ठ": "പേജുകൾ",
    "Questions": "ചോദ്യങ്ങൾ",
    "प्रश्न": "ചോദ്യങ്ങൾ",
    "Previous": "← മുമ്പത്തെ",
    "← पिछला": "← മുമ്പത്തെ",
    "Next": "അടുത്തത് →",
    "अगला →": "അടുത്തത് →",
    "Save Offline": "ഓഫ്‌ലൈനിൽ സംരക്ഷിക്കുക",
    "ऑफलाइन सेव करें": "ഓഫ്‌ലൈനിൽ സംരക്ഷിക്കുക",
    "Submit Survey": "സമർപ്പിക്കുക",
    "सबमिट करें": "സമർപ്പിക്കുക",
    "Capture GPS Coordinates": "ജിപിഎസ് ലൊക്കേഷൻ രേഖപ്പെടുത്തുക",
    "जीपीएस लोकेशन रिकॉर्ड करें": "ജിപിഎസ് ലൊക്കേഷൻ രേഖപ്പെടുത്തുക",
    "GPS Fix Acquired ✓": "ജിപിഎസ് ലഭിച്ചു ✓",
    "जीपीएस लोकेशन प्राप्त हुआ ✓": "ജിപിഎസ് ലഭിച്ചു ✓",
    "Take Photo / Choose File": "ഫോട്ടോ എടുക്കുക / ഫയൽ തിരഞ്ഞെടുക്കുക",
    "फोटो लें / फाइल चुनें": "ഫോട്ടോ എടുക്കുക / ഫയൽ തിരഞ്ഞെടുക്കുക",
    "Sign inside box with finger or stylus": "വിരലോ സ്റ്റൈലസോ ഉപയോഗിച്ച് പെട്ടിയിൽ ഒപ്പിടുക",
    "अपनी उंगली या स्टाइलस से बॉक्स में हस्ताक्षर करें": "വിരലോ സ്റ്റൈലസോ ഉപയോഗിച്ച് പെട്ടിയിൽ ഒപ്പിടുക",
    "Clear Signature": "ഒപ്പ് മായ്ക്കുക",
    "हस्ताक्षर मिटाएं": "ഒപ്പ് മായ്ക്കുക",
    "Signature Recorded": "ഒപ്പ് രേഖപ്പെടുത്തി",
    "हस्ताक्षर दर्ज हुआ": "ഒപ്പ് രേഖപ്പെടുത്തി",
    "Enter response here...": "ഉത്തരം ഇവിടെ നൽകുക...",
    "यहाँ उत्तर दर्ज करें...": "ഉത്തരം ഇവിടെ നൽകുക...",
    "Required Questions Pending": "നിർബന്ധിത ചോദ്യങ്ങൾ ബാക്കിയുണ്ട്",
    "आवश्यक प्रश्न अधूरे हैं": "നിർബന്ധിത ചോദ്യങ്ങൾ ബാക്കിയുണ്ട്",
    "Please fill in these required fields before final submission, or save as an offline draft anytime.": "അന്തിമ സമർപ്പണത്തിന് മുമ്പ് ഈ നിർബന്ധിത ചോദ്യങ്ങൾ പൂരിപ്പിക്കുക, അല്ലെങ്കിൽ ഓഫ്‌ലൈൻ ഡ്രാഫ്റ്റായി സംരക്ഷിക്കുക.",
    "अंतिम सबमिशन से पहले कृपया इन आवश्यक प्रश्नों को भरें, या कभी भी ऑफलाइन ड्राफ्ट के रूप में सुरक्षित करें।": "അന്തിമ സമർപ്പണത്തിന് മുമ്പ് ഈ നിർബന്ധിത ചോദ്യങ്ങൾ പൂരിപ്പിക്കുക, അല്ലെങ്കിൽ ഓഫ്‌ലൈൻ ഡ്രാഫ്റ്റായി സംരക്ഷിക്കുക.",
    "Go to First Pending Question": "👉 ആദ്യത്തെ അപൂർണ്ണ ചോദ്യത്തിലേക്ക് പോകുക",
    "👉 पहले अधूरे प्रश्न पर जाएं": "👉 ആദ്യത്തെ അപൂർണ്ണ ചോദ്യത്തിലേക്ക് പോകുക",
    "Save as Offline Draft Anyway": "ഓഫ്‌ലൈൻ ഡ്രാഫ്റ്റായി സംരക്ഷിക്കുക",
    "💾 ऑफलाइन ड्राफ्ट सुरक्षित करें": "ഓഫ്‌ലൈൻ ഡ്രാഫ്റ്റായി സംരക്ഷിക്കുക",
    "Close": "അടയ്ക്കുക",
    "बंद करें": "അടയ്ക്കുക",
    "Start Survey Form": "സർവേ ആരംഭിക്കുക",
    "सर्वेक्षण शुरू करें": "സർവേ ആരംഭിക്കുക",
    "Start Survey Form →": "സർവേ ആരംഭിക്കുക →",
    "सर्वेक्षण शुरू करें →": "സർവേ ആരംഭിക്കുക →",
    "Write-Ahead Log (WAL)": "റൈറ്റ്-എഹെഡ് ലോഗ് (WAL ക്യൂ)",
    "राइट-अहेड लॉग (WAL कतार)": "റൈറ്റ്-എഹെഡ് ലോഗ് (WAL ക്യൂ)",
    "Atomic zero-loss local storage queue": "പൂർണ്ണ ഡാറ്റാ സുരക്ഷിത പ്രാദേശിക സംഭരണം",
    "शून्य डेटा हानि सुरक्षित स्थानीय भंडारण": "പൂർണ്ണ ഡാറ്റാ സുരക്ഷിത പ്രാദേശിക സംഭരണം",
    "Sync Now": "⟳ ഇപ്പോൾ സമന്വയിപ്പിക്കുക",
    "⟳ अभी सिंक करें": "⟳ ഇപ്പോൾ സമന്വയിപ്പിക്കുക",
    "View on Map →": "മാപ്പിൽ കാണുക →",
    "नक्शे पर देखें →": "മാപ്പിൽ കാണുക →",
    "Re-acquire Fix": "വീണ്ടും ശ്രമിക്കുക",
    "पुनः प्रयास करें": "വീണ്ടും ശ്രമിക്കുക",
    "Section A: Basic Details": "വിഭാഗം എ: അടിസ്ഥാന വിവരങ്ങൾ",
    "भाग क: बुनियादी विवरण": "വിഭാഗം എ: അടിസ്ഥാന വിവരങ്ങൾ",
    "Section B: Respondent & Household Profile": "വിഭാഗം ബി: പ്രതികരണക്കാരന്റെയും കുടുംബത്തിന്റെയും പ്രൊഫൈൽ",
    "भाग ख: उत्तरदाता और परिवार की प्रोफ़ाइल": "വിഭാഗം ബി: പ്രതികരണക്കാരന്റെയും കുടുംബത്തിന്റെയും പ്രൊഫൈൽ",
    "Section C: Enterprise Operations & Finance": "വിഭാഗം സി: സംരംഭ പ്രവർത്തനങ്ങളും ധനകാര്യവും",
    "भाग ग: उद्यम संचालन और वित्त": "വിഭാഗം സി: സംരംഭ പ്രവർത്തനങ്ങളും ധനകാര്യവും",
    "Section D: Enterprise Challenges & Coping Mechanisms": "വിഭാഗം ഡി: സംരംഭ വെല്ലുവിളികളും പരിഹാരങ്ങളും",
    "भाग घ: उद्यम चुनौतियाँ और समाधान": "വിഭാഗം ഡി: സംരംഭ വെല്ലുവിളികളും പരിഹാരങ്ങളും",
    "Section E: Impact of SVEP / OSF Schemes": "വിഭാഗം ഇ: എസ്.വി.ഇ.പി / ഒ.എസ്.എഫ് പദ്ധതികളുടെ സ്വാധീനം",
    "भाग ङ: एसवीईपी / ओएसएफ योजनाओं का प्रभाव": "വിഭാഗം ഇ: എസ്.വി.ഇ.പി / ഒ.എസ്.എഫ് പദ്ധതികളുടെ സ്വാധീനം",
    "Section F: Digital Transactions & Social Media": "വിഭാഗം എഫ്: ഡിജിറ്റൽ ഇടപാടുകളും സോഷ്യൽ മീഡിയയും",
    "भाग च: डिजिटल लेन-देन और सोशल मीडिया": "വിഭാഗം എഫ്: ഡിജിറ്റൽ ഇടപാടുകളും സോഷ്യൽ മീഡിയയും",
    "Section G: Field Verification & Sign-off": "വിഭാഗം ജി: ഫീൽഡ് പരിശോധനയും ഒപ്പും",
    "भाग छ: फील्ड सत्यापन और हस्ताक्षर": "വിഭാഗം ജി: ഫീൽഡ് പരിശോധനയും ഒപ്പും",
    "District": "ജില്ല",
    "जिला": "ജില്ല",
    "Block / Tehsil": "ബ്ലോക്ക് / താലൂക്ക്",
    "ब्लॉक / तहसील": "ബ്ലോക്ക് / താലൂക്ക്",
    "Village / Gram Panchayat Name": "ഗ്രാമം / ഗ്രാമപഞ്ചായത്തിന്റെ പേര്",
    "गाँव / ग्राम पंचायत का नाम": "ഗ്രാമം / ഗ്രാമപഞ്ചായത്തിന്റെ പേര്",
    "Cluster Level Federation (CLF) Name": "ക്ലസ്റ്റർ ലെവൽ ഫെഡറേഷൻ (CLF) പേര്",
    "क्लस्टर लेवल फेडरेशन (CLF) का नाम": "ക്ലസ്റ്റർ ലെവൽ ഫെഡറേഷൻ (CLF) പേര്",
    "Village Organization (VO) Name": "ഗ്രാമ സംഘടന (VO) പേര്",
    "ग्राम संगठन (VO) का नाम": "ഗ്രാമ സംഘടന (VO) പേര്",
    "Self-Help Group (SHG) Name": "സ്വയം സഹായ സംഘം (SHG) പേര്",
    "स्वयं सहायता समूह (SHG) का नाम": "സ്വയം സഹായ സംഘം (SHG) പേര്",
    "Respondent Name": "പ്രതികരണക്കാരന്റെ പേര്",
    "उत्तरदाता का नाम": "പ്രതികരണക്കാരന്റെ പേര്",
    "Enterprise / Business Name": "സംരംഭം / ബിസിനസ്സ് പേര്",
    "उद्यम / व्यवसाय का नाम": "സംരംഭം / ബിസിനസ്സ് പേര്",
    "Year of Setting Up Enterprise": "സംരംഭം ആരംഭിച്ച വർഷം",
    "उद्यम स्थापना का वर्ष": "സംരംഭം ആരംഭിച്ച വർഷം",
    "Main Business Activity of the Enterprise": "സംരംഭത്തിന്റെ പ്രധാന ബിസിനസ്സ് പ്രവർത്തനം",
    "उद्यम की मुख्य व्यावसायिक गतिविधि": "സംരംഭത്തിന്റെ പ്രധാന ബിസിനസ്സ് പ്രവർത്തനം",
    "What is respondent's relation with SHG member?": "എസ്എച്ച്ജി അംഗവുമായുള്ള പ്രതികരണക്കാരന്റെ ബന്ധം എന്താണ്?",
    "उत्तरदाता का एसएचजी सदस्य से क्या संबंध है?": "എസ്എച്ച്ജി അംഗവുമായുള്ള പ്രതികരണക്കാരന്റെ ബന്ധം എന്താണ്?",
    "What is the age of SHG member?": "എസ്എച്ച്ജി അംഗത്തിന്റെ പ്രായം എത്രയാണ്?",
    "एसएचजी सदस्य की आयु क्या है?": "എസ്എച്ച്ജി അംഗത്തിന്റെ പ്രായം എത്രയാണ്?",
    "What is the marital status of the SHG member?": "എസ്എച്ച്ജി അംഗത്തിന്റെ വൈവാഹിക നില എന്താണ്?",
    "एसएचजी सदस्य की वैवाहिक स्थिति क्या है?": "എസ്എച്ച്ജി അംഗത്തിന്റെ വൈവാഹിക നില എന്താണ്?",
    "What is the social category / caste?": "സാമൂഹിക വിഭാഗം / ജാതി ഏതാണ്?",
    "सामाजिक श्रेणी / जाति क्या है?": "സാമൂഹിക വിഭാഗം / ജാതി ഏതാണ്?",
    "What is the education status of the SHG member?": "എസ്എച്ച്ജി അംഗത്തിന്റെ വിദ്യാഭ്യാസ നിലവാരം എന്താണ്?",
    "एसएचजी सदस्य की शैक्षणिक स्थिति क्या है?": "എസ്എച്ച്ജി അംഗത്തിന്റെ വിദ്യാഭ്യാസ നിലവാരം എന്താണ്?",
    "How many total members are in the family?": "കുടുംബത്തിൽ ആകെ എത്ര അംഗങ്ങളുണ്ട്?",
    "परिवार में कुल कितने सदस्य हैं?": "കുടുംബത്തിൽ ആകെ എത്ര അംഗങ്ങളുണ്ട്?",
    "What is your total annual household income?": "നിങ്ങളുടെ ആകെ വാർഷിക കുടുംബ വരുമാനം എത്രയാണ്?",
    "आपकी कुल वार्षिक पारिवारिक आय कितनी है?": "നിങ്ങളുടെ ആകെ വാർഷിക കുടുംബ വരുമാനം എത്രയാണ്?",
    "What is your role in the SHG?": "എസ്എച്ച്ജിയിൽ നിങ്ങളുടെ പങ്ക് എന്താണ്?",
    "एसएचजी में आपकी भूमिका क्या है?": "എസ്എച്ച്ജിയിൽ നിങ്ങളുടെ പങ്ക് എന്താണ്?",
    "Are you related to any of the SVEP / OSF CRP?": "നിങ്ങൾ ഏതെങ്കിലും SVEP / OSF CRP യുമായി ബന്ധപ്പെട്ട ആളാണോ?",
    "क्या आप किसी SVEP / OSF CRP से संबंधित हैं?": "നിങ്ങൾ ഏതെങ്കിലും SVEP / OSF CRP യുമായി ബന്ധപ്പെട്ട ആളാണോ?",
    "Who started the enterprise?": "സംരംഭം ആരാണ് ആരംഭിച്ചത്?",
    "उद्यम किसने शुरू किया था?": "സംരംഭം ആരാണ് ആരംഭിച്ചത്?",
    "Who operates and manages the enterprise on a daily basis?": "ദൈനംദിന അടിസ്ഥാനത്തിൽ സംരംഭം ആര് കൈകാര്യം ചെയ്യുന്നു?",
    "दैनिक आधार पर उद्यम का संचालन और प्रबंधन कौन करता है?": "ദൈനംദിന അടിസ്ഥാനത്തിൽ സംരംഭം ആര് കൈകാര്യം ചെയ്യുന്നു?",
    "For how many hours in a day does the shop/enterprise remain open?": "ഒരു ദിവസം എത്ര മണിക്കൂർ കട/സംരംഭം തുറന്നിരിക്കുന്നു?",
    "दिन में कितने घंटे दुकान/उद्यम खुला रहता है?": "ഒരു ദിവസം എത്ര മണിക്കൂർ കട/സംരംഭം തുറന്നിരിക്കുന്നു?",
    "What is the type of business place / premises?": "ബിസിനസ്സ് സ്ഥലത്തിന്റെ തരം എന്താണ്?",
    "व्यावसायिक स्थान/परिसर का प्रकार क्या है?": "ബിസിനസ്സ് സ്ഥലത്തിന്റെ തരം എന്താണ്?",
    "Does SHG member maintain written records of business transactions regularly?": "എസ്എച്ച്ജി അംഗം പതിവായി ബിസിനസ്സ് രേഖകൾ സൂക്ഷിക്കുന്നുണ്ടോ?",
    "क्या एसएचजी सदस्य नियमित रूप से व्यावसायिक लेन-देन का लिखित रिकॉर्ड रखते हैं?": "എസ്എച്ച്ജി അംഗം പതിവായി ബിസിനസ്സ് രേഖകൾ സൂക്ഷിക്കുന്നുണ്ടോ?",
    "In the first year of your enterprise, what was the amount of seed capital (Rs)?": "നിങ്ങളുടെ സംരംഭത്തിന്റെ ആദ്യ വർഷത്തിൽ പ്രാരംഭ മൂലധനം (രൂപ) എത്രയായിരുന്നു?",
    "आपके उद्यम के पहले वर्ष में प्रारंभिक बीज पूंजी की राशि (रु) क्या थी?": "നിങ്ങളുടെ സംരംഭത്തിന്റെ ആദ്യ വർഷത്തിൽ പ്രാരംഭ മൂലധനം (രൂപ) എത്രയായിരുന്നു?",
    "How do you manage working capital during peak season?": "തിരക്കുള്ള സീസണിൽ പ്രവർത്തന മൂലധനം എങ്ങനെ കൈകാര്യം ചെയ്യുന്നു?",
    "पीक सीजन के दौरान आप कार्यशील पूंजी का प्रबंधन कैसे करते हैं?": "തിരക്കുള്ള സീസണിൽ പ്രവർത്തന മൂലധനം എങ്ങനെ കൈകാര്യം ചെയ്യുന്നു?",
    "Is the location of your space convenient for your business?": "നിങ്ങളുടെ ബിസിനസ്സിന് സ്ഥലം സൗകര്യപ്രദമാണോ?",
    "क्या आपके स्थान की स्थिति आपके व्यवसाय के लिए सुविधाजनक है?": "നിങ്ങളുടെ ബിസിനസ്സിന് സ്ഥലം സൗകര്യപ്രദമാണോ?",
    "Are you satisfied and happy with your wholesale supplier?": "മൊത്തക്കച്ചവടക്കാരനിൽ നിങ്ങൾ തൃപ്തനാണോ?",
    "क्या आप अपने थोक सप्लायर से संतुष्ट और खुश हैं?": "മൊത്തക്കച്ചവടക്കാരനിൽ നിങ്ങൾ തൃപ്തനാണോ?",
    "Are you able to recover credit / money from your customers?": "ഉപഭോക്താക്കളിൽ നിന്ന് പണം തിരികെ ഈടാക്കാൻ കഴിയുന്നുണ്ടോ?",
    "क्या आप अपने ग्राहकों से उधारी/पैसा वसूल पाते हैं?": "ഉപഭോക്താക്കളിൽ നിന്ന് പണം തിരികെ ഈടാക്കാൻ കഴിയുന്നുണ്ടോ?",
    "Do you source raw materials/goods from market independently?": "മാർക്കറ്റിൽ നിന്ന് സ്വന്തമായി അസംസ്കൃത വസ്തുക്കൾ വാങ്ങാറുണ്ടോ?",
    "क्या आप बाजार से स्वतंत्र रूप से कच्चा माल/सामान लाते हैं?": "മാർക്കറ്റിൽ നിന്ന് സ്വന്തമായി അസംസ്കൃത വസ്തുക്കൾ വാങ്ങാറുണ്ടോ?",
    "Do you have easy access to loans from different sources?": "വിവിധ സ്രോതസ്സുകളിൽ നിന്ന് വായ്പ എളുപ്പത്തിൽ ലഭ്യമാണോ?",
    "क्या आपको विभिन्न स्रोतों से ऋण की आसान पहुँच प्राप्त है?": "വിവിധ സ്രോതസ്സുകളിൽ നിന്ന് വായ്പ എളുപ്പത്തിൽ ലഭ്യമാണോ?",
    "How much loan amount have you availed under SVEP / OSF scheme (Rs)?": "SVEP / OSF പദ്ധതി പ്രകാരം എത്ര വായ്പ എടുത്തിട്ടുണ്ട് (രൂപ)?",
    "आपने SVEP / OSF योजना के तहत कितनी ऋण राशि प्राप्त की है (रु)?": "SVEP / OSF പദ്ധതി പ്രകാരം എത്ര വായ്പ എടുത്തിട്ടുണ്ട് (രൂപ)?",
    "How did you utilize the enterprise loan?": "സംരംഭ വായ്പ എങ്ങനെയാണ് ഉപയോഗിച്ചത്?",
    "आपने उद्यम ऋण का उपयोग किस प्रकार किया?": "സംരംഭ വായ്പ എങ്ങനെയാണ് ഉപയോഗിച്ചത്?",
    "Monthly enterprise income BEFORE availing loan changes (Rs)?": "വായ്പ എടുക്കുന്നതിന് മുമ്പ് പ്രതിമാസ സംരംഭ വരുമാനം (രൂപ)?",
    "ऋण से बदलाव करने से पहले उद्यम की मासिक आय (रु)?": "വായ്പ എടുക്കുന്നതിന് മുമ്പ് പ്രതിമാസ സംരംഭ വരുമാനം (രൂപ)?",
    "Monthly enterprise income AFTER availing loan changes (Rs)?": "വായ്പ എടുത്തതിന് ശേഷം പ്രതിമാസ സംരംഭ വരുമാനം (രൂപ)?",
    "ऋण से बदलाव करने के बाद उद्यम की मासिक आय (रु)?": "വായ്പ എടുത്തതിന് ശേഷം പ്രതിമാസ സംരംഭ വരുമാനം (രൂപ)?",
    "What has been the contribution of SVEP / OSF CRPs?": "SVEP / OSF CRP-കളുടെ സംഭാവന എന്താണ്?",
    "SVEP / OSF CRP का क्या योगदान रहा है?": "SVEP / OSF CRP-കളുടെ സംഭാവന എന്താണ്?",
    "Does the woman entrepreneur own a smartphone?": "വനിതാ സംരംഭകയ്ക്ക് സ്മാർട്ട്ഫോൺ ഉണ്ടോ?",
    "क्या महिला उद्यमी के पास स्मार्टफोन है?": "വനിതാ സംരംഭകയ്ക്ക് സ്മാർട്ട്ഫോൺ ഉണ്ടോ?",
    "Do you use QR code / UPI / mobile banking for business transactions?": "ബിസിനസ്സ് ഇടപാടുകൾക്കായി QR കോഡ് / UPI / മൊബൈൽ ബാങ്കിംഗ് ഉപയോഗിക്കാറുണ്ടോ?",
    "क्या आप व्यावसायिक लेन-देन के लिए क्यूआर कोड / यूपीआई / मोबाइल बैंकिंग का उपयोग करते हैं?": "ബിസിനസ്സ് ഇടപാടുകൾക്കായി QR കോഡ് / UPI / മൊബൈൽ ബാങ്കിംഗ് ഉപയോഗിക്കാറുണ്ടോ?",
    "Daily how many transactions are done via QR code / UPI?": "പ്രതിദിനം QR കോഡ് / UPI വഴി എത്ര ഇടപാടുകൾ നടക്കുന്നു?",
    "प्रतिदिन क्यूआर कोड / यूपीआई द्वारा कितने लेन-देन होते हैं?": "പ്രതിദിനം QR കോഡ് / UPI വഴി എത്ര ഇടപാടുകൾ നടക്കുന്നു?",
    "Which social media platforms do you use for your business?": "ബിസിനസ്സിനായി ഏത് സോഷ്യൽ മീഡിയ പ്ലാറ്റ്‌ഫോമുകളാണ് ഉപയോഗിക്കുന്നത്?",
    "आप अपने व्यवसाय के लिए किन सोशल मीडिया प्लेटफॉर्म का उपयोग करते हैं?": "ബിസിനസ്സിനായി ഏത് സോഷ്യൽ മീഡിയ പ്ലാറ്റ്‌ഫോമുകളാണ് ഉപയോഗിക്കുന്നത്?",
    "Capture Enterprise GPS Location (Satellite Coordinates)": "സംരംഭ ജിപിഎസ് ലൊക്കേഷൻ എടുക്കുക (ഉപഗ്രഹ കോർഡിനേറ്റുകൾ)",
    "उद्यम जीपीएस लोकेशन कैप्चर करें (उपग्रह निर्देशांक)": "സംരംഭ ജിപിഎസ് ലൊക്കേഷൻ എടുക്കുക (ഉപഗ്രഹ കോർഡിനേറ്റുകൾ)",
    "Field Photo of Enterprise & Beneficiary": "സംരംഭത്തിന്റെയും ഗുണഭോക്താവിന്റെയും ഫീൽഡ് ഫോട്ടോ",
    "उद्यम और लाभार्थी का फील्ड फोटो": "സംരംഭത്തിന്റെയും ഗുണഭോക്താവിന്റെയും ഫീൽഡ് ഫോട്ടോ",
    "Respondent & Surveyor Digital Signature": "പ്രതികരണക്കാരന്റെയും സർവേയറുടെയും ഡിജിറ്റൽ ഒപ്പ്",
    "उत्तरदाता और सर्वेक्षक के डिजिटल हस्ताक्षर": "പ്രതികരണക്കാരന്റെയും സർവേയറുടെയും ഡിജിറ്റൽ ഒപ്പ്",
    "Yes": "അതെ",
    "हाँ": "അതെ",
    "No": "അല്ല",
    "नहीं": "അല്ല",
    "Baran": "ബാരൻ",
    "बारां": "ബാരൻ",
    "Churu": "ചുരു",
    "चूरू": "ചുരു",
    "Dausa": "ദൗസ",
    "दौसा": "ദൗസ",
    "Dungarpur": "ഡുംഗർപൂർ",
    "डूंगरपुर": "ഡുംഗർപൂർ",
    "Jodhpur": "ജോധ്പൂർ",
    "जोधपुर": "ജോധ്പൂർ",
    "Chhipabarod": "ഛിപബറോദ്",
    "छीपाबड़ौद": "ഛിപബറോദ്",
    "Kishanganj": "കിഷൻഗഞ്ച്",
    "किशनगंज": "കിഷൻഗഞ്ച്",
    "Sardar Sheher": "സർദാർഷഹർ",
    "सरदारशहर": "സർദാർഷഹർ",
    "Bidasar": "ബിദാസർ",
    "बीदासर": "ബിദാസർ",
    "Secundra": "സിക്കന്ദ്ര",
    "सिकंदरा": "സിക്കന്ദ്ര",
    "Sagwara": "സാഗ്വാര",
    "सागवाड़ा": "സാഗ്വാര",
    "Galiakot": "ഗലിയാകോട്ട്",
    "गलियाकोट": "ഗലിയാകോട്ട്",
    "Bicchiwada": "ബിച്ചിവാഡ",
    "बिछीवाड़ा": "ബിച്ചിവാഡ",
    "Jodhpur Block": "ജോധ്പൂർ ബ്ലോക്ക്",
    "जोधपुर ब्लॉक": "ജോധ്പൂർ ബ്ലോക്ക്",
    "Married": "വിവാഹിതൻ/വിവാഹിത",
    "विवाहित": "വിവാഹിതൻ/വിവാഹിത",
    "Single": "അവിവാഹിതൻ/അവിവാഹിത",
    "अविवाहित": "അവിവാഹിതൻ/അവിവാഹിത",
    "Widowed": "വിധവ",
    "विधवा": "വിധവ",
    "Divorced": "വിവാഹമോചിതൻ/വിവാഹമോചിത",
    "तलाकशुदा": "വിവാഹമോചിതൻ/വിവാഹമോചിത",
    "Separated": "വേർപിരിഞ്ഞു കഴിയുന്നവർ",
    "अलग रह रहे": "വേർപിരിഞ്ഞു കഴിയുന്നവർ",
    "General": "ജനറൽ (General)",
    "सामान्य": "ജനറൽ (General)",
    "OBC": "മറ്റ് പിന്നാക്ക വിഭാഗം (OBC)",
    "अन्य पिछड़ा वर्ग (OBC)": "മറ്റ് പിന്നാക്ക വിഭാഗം (OBC)",
    "SC": "പട്ടികജാതി (SC)",
    "अनुसूचित जाति (SC)": "പട്ടികജാതി (SC)",
    "ST": "പട്ടികവർഗ്ഗം (ST)",
    "अनुसूचित जनजाति (ST)": "പട്ടികവർഗ്ഗം (ST)",
    "Illiterate": "നിരക്ഷരൻ/നിരക്ഷര",
    "निरक्षर / अनपढ़": "നിരക്ഷരൻ/നിരക്ഷര",
    "Illiterate but able to calculate": "നിരക്ഷരൻ എന്നാൽ കണക്കുകൂട്ടാൻ കഴിവുള്ളവർ",
    "अनपढ़ लेकिन हिसाब-किताब में सक्षम": "നിരക്ഷരൻ എന്നാൽ കണക്കുകൂട്ടാൻ കഴിവുള്ളവർ",
    "5th pass": "5-ാം ക്ലാസ് പാസ്സായി",
    "5वीं पास": "5-ാം ക്ലാസ് പാസ്സായി",
    "8th pass": "8-ാം ക്ലാസ് പാസ്സായി",
    "8वीं पास": "8-ാം ക്ലാസ് പാസ്സായി",
    "10th pass": "10-ാം ക്ലാസ് പാസ്സായി",
    "10वीं पास": "10-ാം ക്ലാസ് പാസ്സായി",
    "12th pass": "12-ാം ക്ലാസ് പാസ്സായി",
    "12वीं पास": "12-ാം ക്ലാസ് പാസ്സായി",
    "Graduate": "ബിരുദധാരി (Graduate)",
    "स्नातक (Graduate)": "ബിരുദധാരി (Graduate)",
    "Self": "സ്വയം",
    "स्वयं": "സ്വയം",
    "Husband": "ഭർത്താവ്",
    "पति": "ഭർത്താവ്",
    "Son": "മകൻ",
    "पुत्र / बेटा": "മകൻ",
    "Daughter": "മകൾ",
    "पुत्री / बेटी": "മകൾ",
    "Member": "അംഗം",
    "सामान्य सदस्य": "അംഗം",
    "Leadership role": "നേതൃത്വ സ്ഥാനം (പ്രസിഡന്റ്/സെക്രട്ടറി/ട്രഷറർ)",
    "पदाधिकारी / नेतृत्व पद (अध्यक्ष/सचिव/कोषाध्यक्ष)": "നേതൃത്വ സ്ഥാനം (പ്രസിഡന്റ്/സെക്രട്ടറി/ട്രഷറർ)",
    "Grocery / Kirana": "പലചരക്ക് കട",
    "किराना दुकान": "പലചരക്ക് കട",
    "General store": "ജനറൽ സ്റ്റോർ",
    "जनरल स्टोर": "ജനറൽ സ്റ്റോർ",
    "Leather & footwear": "തുകലും പാദരക്ഷകളും",
    "चमड़ा व जूते-चप्पल": "തുകലും പാദരക്ഷകളും",
    "Flour mill": "മാവ് മിൽ",
    "आटा चक्की": "മാവ് മിൽ",
    "Tailoring & Stitching": "തയ്യൽ കേന്ദ്രം",
    "सिलाई व कढ़ाई केंद्र": "തയ്യൽ കേന്ദ്രം",
    "Apparel & Garments": "വസ്ത്രങ്ങൾ",
    "रेडीमेड वस्त्र": "വസ്ത്രങ്ങൾ",
    "Beauty parlour": "ബ്യൂട്ടി പാർലർ",
    "ब्यूटी पार्लर": "ബ്യൂട്ടി പാർലർ",
    "Handicraft": "കരകൗശല വസ്തുക്കൾ",
    "हस्तशिल्प / हैंडीक्राफ्ट": "കരകൗശല വസ്തുക്കൾ",
    "Dairy shop": "ഡയറി & പാൽ കട",
    "डेयरी व दूध केंद्र": "ഡയറി & പാൽ കട",
    "Auto-mechanic": "ഓട്ടോ മെക്കാനിക്",
    "ऑटो मैकेनिक": "ഓട്ടോ മെക്കാനിക്",
    "E-mitra": "ഇ-സേവന കേന്ദ്രം / സി‌എസ്‌സി",
    "ई-मित्र केंद्र / ग्राहक सेवा केंद्र": "ഇ-സേവന കേന്ദ്രം / സി‌എസ്‌സി",
    "Mobile repair shop": "മൊബൈൽ റിപ്പയർ കട",
    "मोबाइल रिपेयर दुकान": "മൊബൈൽ റിപ്പയർ കട",
    "Transport": "ഗതാഗത സേവനം",
    "परिवहन सेवा": "ഗതാഗത സേവനം",
    "Any other": "മറ്റേതെങ്കിലും",
    "अन्य कोई": "മറ്റേതെങ്കിലും",
    "Whatsapp": "വാട്ട്‌സ്ആപ്പ്",
    "व्हाट्सएप (WhatsApp)": "വാട്ട്‌സ്ആപ്പ്",
    "Facebook": "ഫേസ്ബുക്ക്",
    "फेसबुक (Facebook)": "ഫേസ്ബുക്ക്",
    "Instagram": "ഇൻസ്റ്റാഗ്രാം",
    "इंस्टाग्राम (Instagram)": "ഇൻസ്റ്റാഗ്രാം",
    "Don't use social media": "സോഷ്യൽ മീഡിയ ഉപയോഗിക്കാറില്ല",
    "सोशल मीडिया का उपयोग नहीं करते": "സോഷ്യൽ മീഡിയ ഉപയോഗിക്കാറില്ല",
    "Draft": "ഡ്രാഫ്റ്റ്",
    "Save Draft": "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക",
    "ड्राफ्ट": "ഡ്രാഫ്റ്റ്",
    "मसुदा": "ഡ്രാഫ്റ്റ്",
    "ડ્રાફ્ટ": "ഡ്രാഫ്റ്റ്",
    "ਡਰਾਫਟ": "ഡ്രാഫ്റ്റ്",
    "খসড়া": "ഡ്രാഫ്റ്റ്",
    "வரைவு": "ഡ്രാഫ്റ്റ്",
    "చిత్తుప్రతి": "ഡ്രാഫ്റ്റ്",
    "ಕರಡು": "ഡ്രാഫ്റ്റ്",
    "ഡ്രാഫ്റ്റ്": "ഡ്രാഫ്റ്റ്",
    "ڈرافٹ": "ഡ്രാഫ്റ്റ്",
    "ड्राफ्ट सेव करें": "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക",
    "मसुदा जतन करा": "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക",
    "ડ્રાફ્ટ સાચવો": "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക",
    "ਡਰਾਫਟ ਸੰਭਾਲੋ": "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക",
    "খসড়া সংরক্ষণ": "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക",
    "வரைவு சேமி": "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക",
    "చిత్తుప్రతి భద్రపరచు": "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക",
    "ಕರಡು ಉಳಿಸಿ": "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക",
    "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക": "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക",
    "ڈرافٹ محفوظ کریں": "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക"
  },
  "ur": {
    "OmniServey": "اومنی سروے",
    "ओमनीसर्वे": "اومنی سروے",
    "Online": "آن لائن",
    "ऑनलाइन": "آن لائن",
    "Offline": "آف لائن",
    "ऑफलाइन": "آف لائن",
    "Surveys": "سروے",
    "सर्वेक्षण": "سروے",
    "WAL Queue": "قطار (آف لائن)",
    "कतार (ऑफलाइन)": "قطار (آف لائن)",
    "System": "سسٹم",
    "सिस्टम": "سسٹم",
    "Exit Form": "← باہر نکلیں",
    "← बाहर निकलें": "← باہر نکلیں",
    "Step": "مرحلہ",
    "चरण": "مرحلہ",
    "of": "کا",
    "का": "کا",
    "Pages": "صفحات",
    "पृष्ठ": "صفحات",
    "Questions": "سوالات",
    "प्रश्न": "سوالات",
    "Previous": "← پچھلا",
    "← पिछला": "← پچھلا",
    "Next": "اگلا →",
    "अगला →": "اگلا →",
    "Save Offline": "آف لائن محفوظ کریں",
    "ऑफलाइन सेव करें": "آف لائن محفوظ کریں",
    "Submit Survey": "جمع کرائیں",
    "सबमिट करें": "جمع کرائیں",
    "Capture GPS Coordinates": "جی پی ایس مقام ریکارڈ کریں",
    "जीपीएस लोकेशन रिकॉर्ड करें": "جی پی ایس مقام ریکارڈ کریں",
    "GPS Fix Acquired ✓": "جی پی ایس حاصل ہو گیا ✓",
    "जीपीएस लोकेशन प्राप्त हुआ ✓": "جی پی ایس حاصل ہو گیا ✓",
    "Take Photo / Choose File": "تصویر لیں / فائل منتخب کریں",
    "फोटो लें / फाइल चुनें": "تصویر لیں / فائل منتخب کریں",
    "Sign inside box with finger or stylus": "اپنی انگلی یا اسٹائلس سے باکس میں دستخط کریں",
    "अपनी उंगली या स्टाइलस से बॉक्स में हस्ताक्षर करें": "اپنی انگلی یا اسٹائلس سے باکس میں دستخط کریں",
    "Clear Signature": "دستخط صاف کریں",
    "हस्ताक्षर मिटाएं": "دستخط صاف کریں",
    "Signature Recorded": "دستخط درج ہو گئے",
    "हस्ताक्षर दर्ज हुआ": "دستخط درج ہو گئے",
    "Enter response here...": "یہاں جواب درج کریں...",
    "यहाँ उत्तर दर्ज करें...": "یہاں جواب درج کریں...",
    "Required Questions Pending": "لازمی سوالات باقی ہیں",
    "आवश्यक प्रश्न अधूरे हैं": "لازمی سوالات باقی ہیں",
    "Please fill in these required fields before final submission, or save as an offline draft anytime.": "حتمی جمع کرانے سے پہلے براہ کرم یہ لازمی سوالات پر کریں، یا کسی بھی وقت آف لائن ڈرافٹ کے طور پر محفوظ کریں۔",
    "अंतिम सबमिशन से पहले कृपया इन आवश्यक प्रश्नों को भरें, या कभी भी ऑफलाइन ड्राफ्ट के रूप में सुरक्षित करें।": "حتمی جمع کرانے سے پہلے براہ کرم یہ لازمی سوالات پر کریں، یا کسی بھی وقت آف لائن ڈرافٹ کے طور پر محفوظ کریں۔",
    "Go to First Pending Question": "👉 پہلے باقی سوال پر جائیں",
    "👉 पहले अधूरे प्रश्न पर जाएं": "👉 پہلے باقی سوال پر جائیں",
    "Save as Offline Draft Anyway": "آف لائن ڈرافٹ محفوظ کریں",
    "💾 ऑफलाइन ड्राफ्ट सुरक्षित करें": "آف لائن ڈرافٹ محفوظ کریں",
    "Close": "بند کریں",
    "बंद करें": "بند کریں",
    "Start Survey Form": "سروے شروع کریں",
    "सर्वेक्षण शुरू करें": "سروے شروع کریں",
    "Start Survey Form →": "سروے شروع کریں →",
    "सर्वेक्षण शुरू करें →": "سروے شروع کریں →",
    "Write-Ahead Log (WAL)": "رائٹ-اہیڈ لاگ (WAL قطار)",
    "राइट-अहेड लॉग (WAL कतार)": "رائٹ-اہیڈ لاگ (WAL قطار)",
    "Atomic zero-loss local storage queue": "زیرو ڈیٹا نقصان محفوظ مقامی اسٹوریج",
    "शून्य डेटा हानि सुरक्षित स्थानीय भंडारण": "زیرو ڈیٹا نقصان محفوظ مقامی اسٹوریج",
    "Sync Now": "⟳ ابھی سنک کریں",
    "⟳ अभी सिंक करें": "⟳ ابھی سنک کریں",
    "View on Map →": "نقشے پر دیکھیں →",
    "नक्शे पर देखें →": "نقشے پر دیکھیں →",
    "Re-acquire Fix": "دوبارہ کوشش کریں",
    "पुनः प्रयास करें": "دوبارہ کوشش کریں",
    "Section A: Basic Details": "حصہ اول: بنیادی تفصیلات",
    "भाग क: बुनियादी विवरण": "حصہ اول: بنیادی تفصیلات",
    "Section B: Respondent & Household Profile": "حصہ دوم: جواب دہندہ اور خاندانی پروفائل",
    "भाग ख: उत्तरदाता और परिवार की प्रोफ़ाइल": "حصہ دوم: جواب دہندہ اور خاندانی پروفائل",
    "Section C: Enterprise Operations & Finance": "حصہ سوم: کاروباری کارروائیاں اور مالیات",
    "भाग ग: उद्यम संचालन और वित्त": "حصہ سوم: کاروباری کارروائیاں اور مالیات",
    "Section D: Enterprise Challenges & Coping Mechanisms": "حصہ چہارم: کاروباری چیلنجز اور حل",
    "भाग घ: उद्यम चुनौतियाँ और समाधान": "حصہ چہارم: کاروباری چیلنجز اور حل",
    "Section E: Impact of SVEP / OSF Schemes": "حصہ پنجم: ایس وی ای پی / او ایس ایف اسکیموں کا اثر",
    "भाग ङ: एसवीईपी / ओएसएफ योजनाओं का प्रभाव": "حصہ پنجم: ایس وی ای پی / او ایس ایف اسکیموں کا اثر",
    "Section F: Digital Transactions & Social Media": "حصہ ششم: ڈیجیٹل لین دین اور سوشل میڈیا",
    "भाग च: डिजिटल लेन-देन और सोशल मीडिया": "حصہ ششم: ڈیجیٹل لین دین اور سوشل میڈیا",
    "Section G: Field Verification & Sign-off": "حصہ ہفتم: فیلڈ تصدیق اور دستخط",
    "भाग छ: फील्ड सत्यापन और हस्ताक्षर": "حصہ ہفتم: فیلڈ تصدیق اور دستخط",
    "District": "ضلع",
    "जिला": "ضلع",
    "Block / Tehsil": "بلاک / تحصیل",
    "ब्लॉक / तहसील": "بلاک / تحصیل",
    "Village / Gram Panchayat Name": "گاؤں / گرام پنچایت کا نام",
    "गाँव / ग्राम पंचायत का नाम": "گاؤں / گرام پنچایت کا نام",
    "Cluster Level Federation (CLF) Name": "کلسٹر لیول فیڈریشن (CLF) کا نام",
    "क्लस्टर लेवल फेडरेशन (CLF) का नाम": "کلسٹر لیول فیڈریشن (CLF) کا نام",
    "Village Organization (VO) Name": "گرام سنستھا (VO) کا نام",
    "ग्राम संगठन (VO) का नाम": "گرام سنستھا (VO) کا نام",
    "Self-Help Group (SHG) Name": "سیلف ہیلپ گروپ (SHG) کا نام",
    "स्वयं सहायता समूह (SHG) का नाम": "سیلف ہیلپ گروپ (SHG) کا نام",
    "Respondent Name": "جواب دہندہ کا نام",
    "उत्तरदाता का नाम": "جواب دہندہ کا نام",
    "Enterprise / Business Name": "کاروبار / انٹرپرائز کا نام",
    "उद्यम / व्यवसाय का नाम": "کاروبار / انٹرپرائز کا نام",
    "Year of Setting Up Enterprise": "کاروبار قائم کرنے کا سال",
    "उद्यम स्थापना का वर्ष": "کاروبار قائم کرنے کا سال",
    "Main Business Activity of the Enterprise": "کاروبار کی بنیادی سرگرمی",
    "उद्यम की मुख्य व्यावसायिक गतिविधि": "کاروبار کی بنیادی سرگرمی",
    "What is respondent's relation with SHG member?": "جواب دہندہ کا ایس ایچ جی ممبر سے کیا تعلق ہے؟",
    "उत्तरदाता का एसएचजी सदस्य से क्या संबंध है?": "جواب دہندہ کا ایس ایچ جی ممبر سے کیا تعلق ہے؟",
    "What is the age of SHG member?": "ایس ایچ جی ممبر کی عمر کیا ہے؟",
    "एसएचजी सदस्य की आयु क्या है?": "ایس ایچ جی ممبر کی عمر کیا ہے؟",
    "What is the marital status of the SHG member?": "ایس ایچ جی ممبر کی ازدواجی حیثیت کیا ہے؟",
    "एसएचजी सदस्य की वैवाहिक स्थिति क्या है?": "ایس ایچ جی ممبر کی ازدواجی حیثیت کیا ہے؟",
    "What is the social category / caste?": "سماجی زمرہ / ذات کیا ہے؟",
    "सामाजिक श्रेणी / जाति क्या है?": "سماجی زمرہ / ذات کیا ہے؟",
    "What is the education status of the SHG member?": "ایس ایچ جی ممبر کی تعلیمی قابلیت کیا ہے؟",
    "एसएचजी सदस्य की शैक्षणिक स्थिति क्या है?": "ایس ایچ جی ممبر کی تعلیمی قابلیت کیا ہے؟",
    "How many total members are in the family?": "خاندان میں کل کتنے افراد ہیں؟",
    "परिवार में कुल कितने सदस्य हैं?": "خاندان میں کل کتنے افراد ہیں؟",
    "What is your total annual household income?": "آپ کی کل سالانہ خاندانی آمدنی کتنی ہے؟",
    "आपकी कुल वार्षिक पारिवारिक आय कितनी है?": "آپ کی کل سالانہ خاندانی آمدنی کتنی ہے؟",
    "What is your role in the SHG?": "ایس ایچ جی میں آپ کا کیا کردار ہے؟",
    "एसएचजी में आपकी भूमिका क्या है?": "ایس ایچ جی میں آپ کا کیا کردار ہے؟",
    "Are you related to any of the SVEP / OSF CRP?": "کیا آپ کسی SVEP / OSF CRP سے رشتہ دار ہیں؟",
    "क्या आप किसी SVEP / OSF CRP से संबंधित हैं?": "کیا آپ کسی SVEP / OSF CRP سے رشتہ دار ہیں؟",
    "Who started the enterprise?": "کاروبار کس نے شروع کیا تھا؟",
    "उद्यम किसने शुरू किया था?": "کاروبار کس نے شروع کیا تھا؟",
    "Who operates and manages the enterprise on a daily basis?": "روزانہ کی بنیاد پر کاروبار کا انتظام کون کرتا ہے؟",
    "दैनिक आधार पर उद्यम का संचालन और प्रबंधन कौन करता है?": "روزانہ کی بنیاد پر کاروبار کا انتظام کون کرتا ہے؟",
    "For how many hours in a day does the shop/enterprise remain open?": "دن میں کتنے گھنٹے دکان/کاروبار کھلا رہتا ہے؟",
    "दिन में कितने घंटे दुकान/उद्यम खुला रहता है?": "دن میں کتنے گھنٹے دکان/کاروبار کھلا رہتا ہے؟",
    "What is the type of business place / premises?": "کاروباری جگہ کی نوعیت کیا ہے؟",
    "व्यावसायिक स्थान/परिसर का प्रकार क्या है?": "کاروباری جگہ کی نوعیت کیا ہے؟",
    "Does SHG member maintain written records of business transactions regularly?": "کیا ایس ایچ جی ممبر باقاعدگی سے کاروباری لین دین کا تحریری ریکارڈ رکھتے ہیں؟",
    "क्या एसएचजी सदस्य नियमित रूप से व्यावसायिक लेन-देन का लिखित रिकॉर्ड रखते हैं?": "کیا ایس ایچ جی ممبر باقاعدگی سے کاروباری لین دین کا تحریری ریکارڈ رکھتے ہیں؟",
    "In the first year of your enterprise, what was the amount of seed capital (Rs)?": "آپ کے کاروبار کے پہلے سال میں ابتدائی بیج پونجی کی رقم (روپے) کیا تھی؟",
    "आपके उद्यम के पहले वर्ष में प्रारंभिक बीज पूंजी की राशि (रु) क्या थी?": "آپ کے کاروبار کے پہلے سال میں ابتدائی بیج پونجی کی رقم (روپے) کیا تھی؟",
    "How do you manage working capital during peak season?": "سیزن کے دوران آپ ورکنگ کیپیٹل کا انتظام کیسے کرتے ہیں؟",
    "पीक सीजन के दौरान आप कार्यशील पूंजी का प्रबंधन कैसे करते हैं?": "سیزن کے دوران آپ ورکنگ کیپیٹل کا انتظام کیسے کرتے ہیں؟",
    "Is the location of your space convenient for your business?": "کیا آپ کی جگہ کا مقام آپ کے کاروبار کے لیے موزوں ہے؟",
    "क्या आपके स्थान की स्थिति आपके व्यवसाय के लिए सुविधाजनक है?": "کیا آپ کی جگہ کا مقام آپ کے کاروبار کے لیے موزوں ہے؟",
    "Are you satisfied and happy with your wholesale supplier?": "کیا آپ اپنے ہول سیل سپلائر سے مطمئن ہیں؟",
    "क्या आप अपने थोक सप्लायर से संतुष्ट और खुश हैं?": "کیا آپ اپنے ہول سیل سپلائر سے مطمئن ہیں؟",
    "Are you able to recover credit / money from your customers?": "کیا آپ گاہکوں سے ادھار رقم وصول کر پاتے ہیں؟",
    "क्या आप अपने ग्राहकों से उधारी/पैसा वसूल पाते हैं?": "کیا آپ گاہکوں سے ادھار رقم وصول کر پاتے ہیں؟",
    "Do you source raw materials/goods from market independently?": "کیا آپ مارکیٹ سے آزادانہ طور پر خام مال خریدتے ہیں؟",
    "क्या आप बाजार से स्वतंत्र रूप से कच्चा माल/सामान लाते हैं?": "کیا آپ مارکیٹ سے آزادانہ طور پر خام مال خریدتے ہیں؟",
    "Do you have easy access to loans from different sources?": "کیا آپ کو مختلف ذرائع سے قرض کی آسان رسائی حاصل ہے؟",
    "क्या आपको विभिन्न स्रोतों से ऋण की आसान पहुँच प्राप्त है?": "کیا آپ کو مختلف ذرائع سے قرض کی آسان رسائی حاصل ہے؟",
    "How much loan amount have you availed under SVEP / OSF scheme (Rs)?": "آپ نے SVEP / OSF اسکیم کے تحت کتنا قرض لیا ہے (روپے)؟",
    "आपने SVEP / OSF योजना के तहत कितनी ऋण राशि प्राप्त की है (रु)?": "آپ نے SVEP / OSF اسکیم کے تحت کتنا قرض لیا ہے (روپے)؟",
    "How did you utilize the enterprise loan?": "آپ نے کاروباری قرض کا استعمال کیسے کیا؟",
    "आपने उद्यम ऋण का उपयोग किस प्रकार किया?": "آپ نے کاروباری قرض کا استعمال کیسے کیا؟",
    "Monthly enterprise income BEFORE availing loan changes (Rs)?": "قرض لینے سے پہلے کاروبار کی ماہانہ آمدنی (روپے)؟",
    "ऋण से बदलाव करने से पहले उद्यम की मासिक आय (रु)?": "قرض لینے سے پہلے کاروبار کی ماہانہ آمدنی (روپے)؟",
    "Monthly enterprise income AFTER availing loan changes (Rs)?": "قرض لینے کے بعد کاروبار کی ماہانہ آمدنی (روپے)؟",
    "ऋण से बदलाव करने के बाद उद्यम की मासिक आय (रु)?": "قرض لینے کے بعد کاروبار کی ماہانہ آمدنی (روپے)؟",
    "What has been the contribution of SVEP / OSF CRPs?": "SVEP / OSF CRP کا کیا کردار رہا ہے؟",
    "SVEP / OSF CRP का क्या योगदान रहा है?": "SVEP / OSF CRP کا کیا کردار رہا ہے؟",
    "Does the woman entrepreneur own a smartphone?": "کیا خاتون کاروباری کے پاس اسمارٹ فون ہے؟",
    "क्या महिला उद्यमी के पास स्मार्टफोन है?": "کیا خاتون کاروباری کے پاس اسمارٹ فون ہے؟",
    "Do you use QR code / UPI / mobile banking for business transactions?": "کیا آپ کاروباری لین دین کے لیے کیو آر کوڈ / یو پی آئی / موبائل بینکنگ استعمال کرتے ہیں؟",
    "क्या आप व्यावसायिक लेन-देन के लिए क्यूआर कोड / यूपीआई / मोबाइल बैंकिंग का उपयोग करते हैं?": "کیا آپ کاروباری لین دین کے لیے کیو آر کوڈ / یو پی آئی / موبائل بینکنگ استعمال کرتے ہیں؟",
    "Daily how many transactions are done via QR code / UPI?": "روزانہ کیو آر کوڈ / یو پی آئی کے ذریعے کتنے لین دین ہوتے ہیں؟",
    "प्रतिदिन क्यूआर कोड / यूपीआई द्वारा कितने लेन-देन होते हैं?": "روزانہ کیو آر کوڈ / یو پی آئی کے ذریعے کتنے لین دین ہوتے ہیں؟",
    "Which social media platforms do you use for your business?": "آپ اپنے کاروبار کے لیے کون سے سوشل میڈیا پلیٹ فارم استعمال کرتے ہیں؟",
    "आप अपने व्यवसाय के लिए किन सोशल मीडिया प्लेटफॉर्म का उपयोग करते हैं?": "آپ اپنے کاروبار کے لیے کون سے سوشل میڈیا پلیٹ فارم استعمال کرتے ہیں؟",
    "Capture Enterprise GPS Location (Satellite Coordinates)": "کاروبار کا جی پی ایس مقام کیپچر کریں (سیٹلائٹ کوآرڈینیٹس)",
    "उद्यम जीपीएस लोकेशन कैप्चर करें (उपग्रह निर्देशांक)": "کاروبار کا جی پی ایس مقام کیپچر کریں (سیٹلائٹ کوآرڈینیٹس)",
    "Field Photo of Enterprise & Beneficiary": "کاروبار اور مستفید کی فیلڈ تصویر",
    "उद्यम और लाभार्थी का फील्ड फोटो": "کاروبار اور مستفید کی فیلڈ تصویر",
    "Respondent & Surveyor Digital Signature": "جواب دہندہ اور سروے کرنے والے کے ڈیجیٹل دستخط",
    "उत्तरदाता और सर्वेक्षक के डिजिटल हस्ताक्षर": "جواب دہندہ اور سروے کرنے والے کے ڈیجیٹل دستخط",
    "Yes": "ہاں",
    "हाँ": "ہاں",
    "No": "نہیں",
    "नहीं": "نہیں",
    "Baran": "باراں",
    "बारां": "باراں",
    "Churu": "چورو",
    "चूरू": "چورو",
    "Dausa": "دौسا",
    "दौसा": "دौسا",
    "Dungarpur": "ڈونگر پور",
    "डूंगरपुर": "ڈونگر پور",
    "Jodhpur": "جودھ پور",
    "जोधपुर": "جودھ پور",
    "Chhipabarod": "چھیپابڑود",
    "छीपाबड़ौद": "چھیپابڑود",
    "Kishanganj": "کشن گنج",
    "किशनगंज": "کشن گنج",
    "Sardar Sheher": "سردار شہر",
    "सरदारशहर": "سردار شہر",
    "Bidasar": "بیداسر",
    "बीदासर": "بیداسر",
    "Secundra": "سکندرا",
    "सिकंदरा": "سکندرا",
    "Sagwara": "ساگواڑا",
    "सागवाड़ा": "ساگواڑا",
    "Galiakot": "گلیاکوٹ",
    "गलियाकोट": "گلیاکوٹ",
    "Bicchiwada": "بچھی واڑا",
    "बिछीवाड़ा": "بچھی واڑا",
    "Jodhpur Block": "جودھ پور بلاک",
    "जोधपुर ब्लॉक": "جودھ پور بلاک",
    "Married": "شادی شدہ",
    "विवाहित": "شادی شدہ",
    "Single": "غیر شادی شدہ",
    "अविवाहित": "غیر شادی شدہ",
    "Widowed": "بیوہ",
    "विधवा": "بیوہ",
    "Divorced": "طلاق یافتہ",
    "तलाकशुदा": "طلاق یافتہ",
    "Separated": "علیحدہ",
    "अलग रह रहे": "علیحدہ",
    "General": "عام (General)",
    "सामान्य": "عام (General)",
    "OBC": "دیگر پسماندہ طبقات (OBC)",
    "अन्य पिछड़ा वर्ग (OBC)": "دیگر پسماندہ طبقات (OBC)",
    "SC": "شیڈولڈ کاسٹ (SC)",
    "अनुसूचित जाति (SC)": "شیڈولڈ کاسٹ (SC)",
    "ST": "شیڈولڈ ٹرائب (ST)",
    "अनुसूचित जनजाति (ST)": "شیڈولڈ ٹرائب (ST)",
    "Illiterate": "ان پڑھ / ناخواندہ",
    "निरक्षर / अनपढ़": "ان پڑھ / ناخواندہ",
    "Illiterate but able to calculate": "ناخواندہ لیکن حساب کتاب کر سکتے ہیں",
    "अनपढ़ लेकिन हिसाब-किताब में सक्षम": "ناخواندہ لیکن حساب کتاب کر سکتے ہیں",
    "5th pass": "پانچویں پاس",
    "5वीं पास": "پانچویں پاس",
    "8th pass": "آٹھویں پاس",
    "8वीं पास": "آٹھویں پاس",
    "10th pass": "دسویں پاس",
    "10वीं पास": "دسویں پاس",
    "12th pass": "بارہویں پاس",
    "12वीं पास": "بارہویں پاس",
    "Graduate": "گریجویٹ",
    "स्नातक (Graduate)": "گریجویٹ",
    "Self": "خود",
    "स्वयं": "خود",
    "Husband": "شوہر",
    "पति": "شوہر",
    "Son": "بیٹا",
    "पुत्र / बेटा": "بیٹا",
    "Daughter": "بیٹی",
    "पुत्री / बेटी": "بیٹی",
    "Member": "رکن",
    "सामान्य सदस्य": "رکن",
    "Leadership role": "قیادت کا کردار (صدر/سیکرٹری/خزانچی)",
    "पदाधिकारी / नेतृत्व पद (अध्यक्ष/सचिव/कोषाध्यक्ष)": "قیادت کا کردار (صدر/سیکرٹری/خزانچی)",
    "Grocery / Kirana": "کرانہ دکان",
    "किराना दुकान": "کرانہ دکان",
    "General store": "جنرل اسٹور",
    "जनरल स्टोर": "جنرل اسٹور",
    "Leather & footwear": "چمڑا اور جوتے",
    "चमड़ा व जूते-चप्पल": "چمڑا اور جوتے",
    "Flour mill": "آٹا چکی",
    "आटा चक्की": "آٹا چکی",
    "Tailoring & Stitching": "سلائی کڑھائی مرکز",
    "सिलाई व कढ़ाई केंद्र": "سلائی کڑھائی مرکز",
    "Apparel & Garments": "ریڈی میڈ کپڑے",
    "रेडीमेड वस्त्र": "ریڈی میڈ کپڑے",
    "Beauty parlour": "بیوٹی پارلر",
    "ब्यूटी पार्लर": "بیوٹی پارلر",
    "Handicraft": "دستکاری",
    "हस्तशिल्प / हैंडीक्राफ्ट": "دستکاری",
    "Dairy shop": "ڈیری اور دودھ کی دکان",
    "डेयरी व दूध केंद्र": "ڈیری اور دودھ کی دکان",
    "Auto-mechanic": "آٹو مکینک",
    "ऑटो मैकेनिक": "آٹو مکینک",
    "E-mitra": "ای-متر / کسٹمر سروس سنٹر",
    "ई-मित्र केंद्र / ग्राहक सेवा केंद्र": "ای-متر / کسٹمر سروس سنٹر",
    "Mobile repair shop": "موبائل ریپئرنگ دکان",
    "मोबाइल रिपेयर दुकान": "موبائل ریپئرنگ دکان",
    "Transport": "ٹرانسپورٹ سروس",
    "परिवहन सेवा": "ٹرانسپورٹ سروس",
    "Any other": "کوئی دوسرا",
    "अन्य कोई": "کوئی دوسرا",
    "Whatsapp": "واٹس ایپ",
    "व्हाट्सएप (WhatsApp)": "واٹس ایپ",
    "Facebook": "فیس بک",
    "फेसबुक (Facebook)": "فیس بک",
    "Instagram": "انسٹاگرام",
    "इंस्टाग्राम (Instagram)": "انسٹاگرام",
    "Don't use social media": "سوشل میڈیا استعمال نہیں کرتے",
    "सोशल मीडिया का उपयोग नहीं करते": "سوشل میڈیا استعمال نہیں کرتے",
    "Draft": "ڈرافٹ",
    "Save Draft": "ڈرافٹ محفوظ کریں",
    "ड्राफ्ट": "ڈرافٹ",
    "मसुदा": "ڈرافٹ",
    "ડ્રાફ્ટ": "ڈرافٹ",
    "ਡਰਾਫਟ": "ڈرافٹ",
    "খসড়া": "ڈرافٹ",
    "வரைவு": "ڈرافٹ",
    "చిత్తుప్రతి": "ڈرافٹ",
    "ಕರಡು": "ڈرافٹ",
    "ഡ്രാഫ്റ്റ്": "ڈرافٹ",
    "ڈرافٹ": "ڈرافٹ",
    "ड्राफ्ट सेव करें": "ڈرافٹ محفوظ کریں",
    "मसुदा जतन करा": "ڈرافٹ محفوظ کریں",
    "ડ્રાફ્ટ સાચવો": "ڈرافٹ محفوظ کریں",
    "ਡਰਾਫਟ ਸੰਭਾਲੋ": "ڈرافٹ محفوظ کریں",
    "খসড়া সংরক্ষণ": "ڈرافٹ محفوظ کریں",
    "வரைவு சேமி": "ڈرافٹ محفوظ کریں",
    "చిత్తుప్రతి భద్రపరచు": "ڈرافٹ محفوظ کریں",
    "ಕರಡು ಉಳಿಸಿ": "ڈرافٹ محفوظ کریں",
    "ഡ്രാഫ്റ്റ് സംരക്ഷിക്കുക": "ڈرافٹ محفوظ کریں",
    "ڈرافٹ محفوظ کریں": "ڈرافٹ محفوظ کریں"
  }
};

// 3. Client-Side Canvas Image Compressor (<150 KB JPEG + GPS Watermark)
async function compressImage(file, gpsCoords = null) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const maxWidth = 1280;
        const maxHeight = 960;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Stamp GPS & Timestamp Watermark
        const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
        let watermarkText = `OmniServey | ${nowStr}`;
        if (gpsCoords && gpsCoords.latitude) {
          watermarkText += ` | Lat:${gpsCoords.latitude.toFixed(5)} Lng:${gpsCoords.longitude.toFixed(5)} (±${gpsCoords.accuracy ? gpsCoords.accuracy.toFixed(0) : 0}m)`;
        }

        const bannerHeight = 28;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#f8fafc';
        ctx.textBaseline = 'middle';
        ctx.fillText(watermarkText, 10, height - (bannerHeight / 2));

        let quality = 0.75;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        while (dataUrl.length > 200 * 1024 && quality > 0.3) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

// 4. Main Vue 3 Application Controller
const app = createApp({
  setup() {
    // Core Reactive State
    const currentView = ref('templates'); // 'templates' | 'form' | 'queue'
    const isOnline = ref(navigator.onLine);
    const isSyncing = ref(false);
    const storagePersisted = ref(false);
    const permissionStatus = ref('loading'); // 'loading' | 'authorized' | 'restricted'

    // Multi-Language Management (Exclusively Indian Regional Languages + English)
    const INDIAN_LANG_CODES = new Set(['en', 'hi', 'mr', 'gu', 'pa', 'bn', 'ta', 'te', 'kn', 'ml', 'ur']);
    const currentLang = ref(localStorage.getItem('omniservey_lang') || 'hi');
    const languages = ref([
      { code: 'en', label: 'English' },
      { code: 'hi', label: 'हिन्दी (Hindi)' },
      { code: 'mr', label: 'मराठी (Marathi)' },
      { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
      { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
      { code: 'bn', label: 'বাংলা (Bengali)' },
      { code: 'ta', label: 'தமிழ் (Tamil)' },
      { code: 'te', label: 'తెలుగు (Telugu)' },
      { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
      { code: 'ml', label: 'മലയാളം (Malayalam)' },
      { code: 'ur', label: 'اردو (Urdu)' }
    ]);

    // Active Templates & Form State
    const templates = ref([]);
    const searchQuery = ref('');
    const selectedCategory = ref('All');
    const activeTemplate = ref(null);
    const activeSectionIndex = ref(0);
    const currentUUID = ref(generateUUID());
    const formData = reactive({});
    const translationsMap = ref({});

    // High-Precision Hardware GPS
    const currentGPS = reactive({
      latitude: null,
      longitude: null,
      accuracy: null,
      altitude: null,
      fetching: false,
      error: null
    });

    // Signature Canvas Registry
    const signaturePads = {};

    // Form Submission & Validation State
    const toastMessage = ref('');
    const toastType = ref('success'); // 'success' | 'error' | 'info'
    const validationModalOpen = ref(false);
    const validationErrors = ref([]);
    const highlightedQuestion = ref('');

    function showToast(msg, type = 'success') {
      toastMessage.value = msg;
      toastType.value = type;
      setTimeout(() => {
        if (toastMessage.value === msg) {
          toastMessage.value = '';
        }
      }, 3500);
    }

    // Current User Profile
    const currentUser = reactive({
      user: 'Guest',
      is_guest: true,
      roles: [],
      full_name: 'Guest Surveyor'
    });

    // WAL Submissions Queue
    const walSubmissions = ref([]);
    const pendingCount = computed(() => walSubmissions.value.filter(s => s.status === 'PENDING_SYNC').length);

    // Multi-Language Translation Helper
    function t(text, questionCode = null) {
      if (!text) return '';
      const lang = currentLang.value;
      if (lang === 'en') return text;

      // 1. Check Built-in Complete Vernacular Dictionary for Target Language
      if (BUILTIN_TRANSLATIONS[lang] && BUILTIN_TRANSLATIONS[lang][text]) {
        return BUILTIN_TRANSLATIONS[lang][text];
      }

      // 2. Check Server-Synced Dynamic Template Translation Map
      if (translationsMap.value && translationsMap.value[text]) {
        return translationsMap.value[text];
      }

      // 3. Fallback to Hindi if regional translation missing
      if (lang !== 'hi' && BUILTIN_TRANSLATIONS.hi && BUILTIN_TRANSLATIONS.hi[text]) {
        return BUILTIN_TRANSLATIONS.hi[text];
      }

      // 4. Default to Original English Text
      return text;
    }

    // Reactive Language Switcher Watcher
    watch(currentLang, async (newLang) => {
      localStorage.setItem('omniservey_lang', newLang);
      translationsMap.value = {};
      await loadTranslations(activeTemplate.value ? activeTemplate.value.name : null, newLang);
      const langObj = languages.value.find(l => l.code === newLang);
      const name = langObj ? langObj.label : newLang;
      showToast(`Language: ${name}`, 'info');
    });

    // Initial Bootstrap
    onMounted(async () => {
      if (navigator.storage && navigator.storage.persist) {
        storagePersisted.value = await navigator.storage.persist();
      }
      window.addEventListener('online', () => { isOnline.value = true; autoSync(); });
      window.addEventListener('offline', () => { isOnline.value = false; });

      await fetchCurrentUserInfo();
      await loadTemplatesFromDB();
      await loadWALFromDB();

      if (currentLang.value !== 'en') {
        await loadTranslations(null, currentLang.value);
      }

      if (isOnline.value) {
        await fetchServerTemplates();
        await fetchAvailableLanguages();
      }
    });

    // Fetch Enabled Indian Languages from Server
    async function fetchAvailableLanguages() {
      try {
        const resp = await fetch('/api/method/omniservey.api.survey.get_available_languages');
        if (resp.ok) {
          const data = await resp.json();
          if (data.message && data.message.length > 0) {
            const filtered = data.message
              .map(l => ({ code: l.code || l.language_code, label: l.label || l.language_name || l.name }))
              .filter(l => INDIAN_LANG_CODES.has(l.code));
            if (filtered.length > 0) {
              languages.value = filtered;
            }
          }
        }
      } catch (err) {
        console.warn('[Languages] Using pre-configured Indian language list');
      }
    }

    function generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    async function fetchCurrentUserInfo() {
      try {
        const res = await fetch('/api/method/omniservey.api.survey.get_current_user_info');
        if (res.ok) {
          const data = await res.json();
          if (data.message) {
            currentUser.user = data.message.user;
            currentUser.is_guest = data.message.is_guest;
            currentUser.roles = data.message.roles || [];
            currentUser.full_name = data.message.full_name;
          }
        }
      } catch (err) {
        console.warn('[Auth] Offline: local profile active');
      }
    }

    async function loadTemplatesFromDB() {
      const stored = await db.templates.toArray();
      templates.value = stored;
      permissionStatus.value = stored.length > 0 ? 'authorized' : (isOnline.value ? 'loading' : 'restricted');
    }

    async function loadWALFromDB() {
      walSubmissions.value = await db.wal.reverse().sortBy('captured_at_local');
    }

    async function fetchServerTemplates() {
      permissionStatus.value = 'loading';
      try {
        const resp = await fetch('/api/method/omniservey.api.survey.list_active_templates');
        if (resp.ok) {
          const data = await resp.json();
          const authorizedList = data.message || [];

          if (authorizedList.length === 0) {
            permissionStatus.value = 'restricted';
            await db.templates.clear();
            templates.value = [];
            return;
          }

          const authorizedNames = new Set(authorizedList.map(t => t.name));

          for (const item of authorizedList) {
            try {
              const schemaResp = await fetch(`/api/method/omniservey.api.survey.get_schema?template_name=${encodeURIComponent(item.name)}`);
              if (schemaResp.ok) {
                const sData = await schemaResp.json();
                if (sData.message) {
                  await db.templates.put(JSON.parse(JSON.stringify({
                    name: sData.message.template_name,
                    title: sData.message.title,
                    project: sData.message.project,
                    version: sData.message.version,
                    status: sData.message.status,
                    target_category: item.target_category || 'General',
                    schema_hash_sha256: sData.message.schema_hash_sha256,
                    schema: sData.message.schema
                  })));
                }
              }
            } catch (schemaErr) {
              console.warn('[Schema] Schema fetch error:', schemaErr);
            }
          }

          const cachedTemplates = await db.templates.toArray();
          for (const cached of cachedTemplates) {
            if (!authorizedNames.has(cached.name)) {
              await db.templates.delete(cached.name);
            }
          }

          await loadTemplatesFromDB();
          permissionStatus.value = templates.value.length > 0 ? 'authorized' : 'restricted';
        } else {
          permissionStatus.value = templates.value.length > 0 ? 'authorized' : 'restricted';
        }
      } catch (err) {
        console.warn('[Sync] Offline mode: loaded cached templates');
        permissionStatus.value = templates.value.length > 0 ? 'authorized' : 'restricted';
      }
    }

    async function startSurvey(template, existingSubmission = null) {
      activeTemplate.value = template;
      activeSectionIndex.value = 0;

      Object.keys(formData).forEach(k => delete formData[k]);
      currentGPS.latitude = null;
      currentGPS.longitude = null;
      currentGPS.accuracy = null;
      currentGPS.altitude = null;
      currentGPS.error = null;

      if (existingSubmission) {
        currentUUID.value = existingSubmission.idempotency_key || generateUUID();
        if (existingSubmission.formDataRaw) {
          Object.assign(formData, existingSubmission.formDataRaw);
        }
        if (existingSubmission.gps_latitude) {
          currentGPS.latitude = existingSubmission.gps_latitude;
          currentGPS.longitude = existingSubmission.gps_longitude;
          currentGPS.accuracy = existingSubmission.gps_accuracy;
        }
      } else {
        currentUUID.value = generateUUID();
      }

      await loadTranslations(template.name, currentLang.value);
      currentView.value = 'form';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function loadTranslations(templateName, lang) {
      if (lang === 'en') {
        translationsMap.value = {};
        return;
      }
      try {
        const local = await db.translations.get([templateName || 'GLOBAL', lang]);
        if (local && local.dictionary) {
          translationsMap.value = local.dictionary;
        }

        if (isOnline.value) {
          const url = templateName 
            ? `/api/method/omniservey.api.survey.get_translations?template_name=${encodeURIComponent(templateName)}&language_code=${lang}`
            : `/api/method/omniservey.api.survey.get_translations?language_code=${lang}`;
          const resp = await fetch(url);
          if (resp.ok) {
            const data = await resp.json();
            if (data.message) {
              translationsMap.value = { ...translationsMap.value, ...data.message };
              await db.translations.put(JSON.parse(JSON.stringify({
                survey_template: templateName || 'GLOBAL',
                language_code: lang,
                dictionary: translationsMap.value
              })));
            }
          }
        }
      } catch (err) {
        console.warn('[Translation] Using local/fallback translation dictionaries');
      }
    }

    async function fetchGPS() {
      currentGPS.fetching = true;
      currentGPS.error = null;

      if (!('geolocation' in navigator)) {
        currentGPS.error = 'Hardware Geolocation is not supported by your device browser.';
        currentGPS.fetching = false;
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          currentGPS.latitude = pos.coords.latitude;
          currentGPS.longitude = pos.coords.longitude;
          currentGPS.accuracy = pos.coords.accuracy;
          currentGPS.altitude = pos.coords.altitude;
          currentGPS.fetching = false;
          showToast(`✓ GPS Fix Acquired (±${pos.coords.accuracy.toFixed(1)}m)`, 'success');
        },
        (err) => {
          currentGPS.fetching = false;
          currentGPS.error = `GPS Signal Error: ${err.message} (Code ${err.code})`;
          showToast(currentGPS.error, 'error');
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 5000
        }
      );
    }

    function initSignaturePad(canvasEl, questionCode) {
      if (!canvasEl) return;
      
      const rect = canvasEl.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvasEl.width = rect.width * dpr;
      canvasEl.height = (rect.height || 140) * dpr;
      
      const ctx = canvasEl.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      let isDrawing = false;
      let lastX = 0;
      let lastY = 0;

      function getPos(e) {
        const r = canvasEl.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return [clientX - r.left, clientY - r.top];
      }

      function startDraw(e) {
        isDrawing = true;
        [lastX, lastY] = getPos(e);
      }

      function draw(e) {
        if (!isDrawing) return;
        if (e.cancelable) e.preventDefault();
        const [x, y] = getPos(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        [lastX, lastY] = [x, y];
      }

      function stopDraw() {
        if (isDrawing) {
          isDrawing = false;
          formData[questionCode] = canvasEl.toDataURL('image/png');
        }
      }

      canvasEl.onmousedown = startDraw;
      canvasEl.onmousemove = draw;
      window.addEventListener('mouseup', stopDraw);

      canvasEl.ontouchstart = startDraw;
      canvasEl.ontouchmove = draw;
      window.addEventListener('touchend', stopDraw);

      signaturePads[questionCode] = { canvasEl, ctx };

      if (formData[questionCode]) {
        const img = new Image();
        img.src = formData[questionCode];
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, (rect.height || 140));
        };
      }
    }

    function clearSignature(questionCode) {
      const pad = signaturePads[questionCode];
      if (pad) {
        const { canvasEl, ctx } = pad;
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      }
      delete formData[questionCode];
      showToast('Signature cleared', 'info');
    }

    async function handlePhotoUpload(questionCode, event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const compressedDataUrl = await compressImage(file, currentGPS);
        formData[questionCode] = compressedDataUrl;
        showToast('✓ Photo compressed with GPS watermark', 'success');
      } catch (err) {
        showToast('Image error: ' + err.message, 'error');
      }
    }

    function removePhoto(questionCode) {
      delete formData[questionCode];
    }

    const sections = computed(() => {
      if (!activeTemplate.value || !activeTemplate.value.schema || !activeTemplate.value.schema.sections) return [];
      return activeTemplate.value.schema.sections;
    });

    const activeSection = computed(() => {
      if (!sections.value || sections.value.length === 0) return null;
      return sections.value[activeSectionIndex.value] || null;
    });

    const activeQuestions = computed(() => {
      if (!activeTemplate.value || !activeSection.value) return [];
      const secCode = activeSection.value.section_code;
      return (activeTemplate.value.schema.questions || []).filter(q => {
        if (q.section_code !== secCode) return false;
        if (q.conditional_logic) {
          const depField = q.conditional_logic.depends_on;
          const targetVal = q.conditional_logic.equals;
          if (depField && targetVal !== undefined && formData[depField] !== targetVal) {
            return false;
          }
        }
        return true;
      });
    });

    function isSectionComplete(section) {
      if (!activeTemplate.value || !activeTemplate.value.schema || !activeTemplate.value.schema.questions) return false;
      const questions = activeTemplate.value.schema.questions.filter(q => q.section_code === section.section_code);
      if (questions.length === 0) return true;

      for (const q of questions) {
        if (q.conditional_logic) {
          const depField = q.conditional_logic.depends_on;
          const targetVal = q.conditional_logic.equals;
          if (depField && targetVal !== undefined && formData[depField] !== targetVal) {
            continue;
          }
        }
        if (q.is_mandatory) {
          const val = formData[q.question_code];
          if (q.field_type === 'GPS Location') {
            if (!currentGPS.latitude) return false;
          } else if (val === undefined || val === null || val === '') {
            return false;
          }
        }
      }
      return true;
    }

    const categories = computed(() => {
      const set = new Set(['All']);
      for (const t of templates.value) {
        if (t.target_category) set.add(t.target_category);
      }
      return Array.from(set);
    });

    const filteredTemplates = computed(() => {
      return templates.value.filter(t => {
        const matchesCategory = selectedCategory.value === 'All' || t.target_category === selectedCategory.value;
        const q = searchQuery.value.toLowerCase().trim();
        const matchesQuery = !q || t.title.toLowerCase().includes(q) || (t.project && t.project.toLowerCase().includes(q));
        return matchesCategory && matchesQuery;
      });
    });

    function nextSection() {
      if (activeSectionIndex.value < sections.value.length - 1) {
        activeSectionIndex.value++;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    function prevSection() {
      if (activeSectionIndex.value > 0) {
        activeSectionIndex.value--;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    function jumpToQuestion(errItem) {
      validationModalOpen.value = false;
      activeSectionIndex.value = errItem.section_idx;
      highlightedQuestion.value = errItem.question_code;
      nextTick(() => {
        const el = document.getElementById('q_card_' + errItem.question_code);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      setTimeout(() => {
        if (highlightedQuestion.value === errItem.question_code) {
          highlightedQuestion.value = '';
        }
      }, 4000);
    }

    // Auto-scroll active tab into view whenever section changes
    watch(activeSectionIndex, (newIdx) => {
      nextTick(() => {
        const el = document.getElementById('sec_tab_' + newIdx);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    });

    function scrollTabs(direction) {
      const container = document.getElementById('section_tabs_container');
      if (container) {
        const offset = direction === 'left' ? -180 : 180;
        container.scrollBy({ left: offset, behavior: 'smooth' });
      }
    }

    // ==========================================================
    // ZERO-LOSS WRITE-AHEAD LOG (WAL) PERSISTENCE ENGINE
    // ==========================================================
    async function saveOffline(isFinalSubmission = false) {
      try {
        if (!currentUUID.value) {
          currentUUID.value = generateUUID();
        }

        const items = [];
        for (const q of (activeTemplate.value.schema.questions || [])) {
          const val = formData[q.question_code];
          if (val !== undefined && val !== null && val !== '') {
            items.push({
              question_code: q.question_code,
              question_label: q.label_en,
              value: val
            });
          }
        }

        const status = isFinalSubmission ? 'PENDING_SYNC' : 'DRAFT_OFFLINE';

        let cleanFormData = {};
        try {
          cleanFormData = JSON.parse(JSON.stringify(formData));
        } catch (e) {
          cleanFormData = { ...formData };
        }

        const submission = {
          idempotency_key: currentUUID.value,
          survey_template: activeTemplate.value.name,
          template_version: activeTemplate.value.version || 1,
          surveyor: currentUser.full_name || 'Field Surveyor',
          status: status,
          captured_at_local: new Date().toISOString(),
          gps_latitude: currentGPS.latitude,
          gps_longitude: currentGPS.longitude,
          gps_accuracy: currentGPS.accuracy,
          items: items,
          formDataRaw: cleanFormData,
          retry_count: 0
        };

        await db.wal.put(JSON.parse(JSON.stringify(submission)));
        await loadWALFromDB();

        if (isFinalSubmission) {
          validationModalOpen.value = false;
          showToast(t('✓ Survey Submitted & Stored Locally in WAL!'), 'success');
          currentView.value = 'queue';
          if (isOnline.value) {
            autoSync().catch(e => console.warn('[AutoSync] Network sync err:', e));
          }
        } else {
          validationModalOpen.value = false;
          showToast(t('💾 Draft Saved to Offline Device Storage!'), 'success');
        }
      } catch (err) {
        console.error('[SaveOffline Error]', err);
        showToast('Storage error: ' + (err.message || err), 'error');
      }
    }

    // Submit Survey with Interactive Multi-Section Validation Sheet
    async function commitToWAL() {
      try {
        const missingMandatory = [];
        for (const q of (activeTemplate.value.schema.questions || [])) {
          if (q.conditional_logic) {
            const depField = q.conditional_logic.depends_on;
            const targetVal = q.conditional_logic.equals;
            if (depField && targetVal !== undefined && formData[depField] !== targetVal) {
              continue;
            }
          }
          if (q.is_mandatory) {
            const val = formData[q.question_code];
            let isMissing = false;
            if (q.field_type === 'GPS Location') {
              if (!currentGPS.latitude) isMissing = true;
            } else if (val === undefined || val === null || val === '') {
              isMissing = true;
            }

            if (isMissing) {
              const secIdx = sections.value.findIndex(s => s.section_code === q.section_code);
              const secObj = sections.value[secIdx];
              missingMandatory.push({
                question_code: q.question_code,
                label: t(q.label_en),
                section_idx: secIdx >= 0 ? secIdx : 0,
                section_title: secObj ? t(secObj.section_title) : '',
                field_type: q.field_type
              });
            }
          }
        }

        if (missingMandatory.length > 0) {
          validationErrors.value = missingMandatory;
          validationModalOpen.value = true;
          return;
        }

        await saveOffline(true);
      } catch (err) {
        console.error('[commitToWAL Error]', err);
        showToast('Submission error: ' + (err.message || err), 'error');
      }
    }

    async function resumeDraft(sub) {
      const tmpl = templates.value.find(t => t.name === sub.survey_template);
      if (!tmpl) {
        showToast('Associated template not found in offline storage', 'error');
        return;
      }
      await startSurvey(tmpl, sub);
    }

    async function deleteWALItem(idempotency_key) {
      if (confirm('Delete this record from local storage?')) {
        await db.wal.delete(idempotency_key);
        await loadWALFromDB();
        showToast('Item removed from local storage', 'info');
      }
    }

    async function autoSync() {
      if (isSyncing.value || !isOnline.value) return;
      isSyncing.value = true;

      try {
        const pending = await db.wal.where('status').equals('PENDING_SYNC').toArray();
        if (pending.length === 0) {
          isSyncing.value = false;
          return;
        }

        for (const sub of pending) {
          const payload = {
            idempotency_key: sub.idempotency_key,
            survey_template: sub.survey_template,
            template_version: sub.template_version,
            gps_latitude: sub.gps_latitude,
            gps_longitude: sub.gps_longitude,
            gps_accuracy: sub.gps_accuracy,
            captured_at_local: sub.captured_at_local,
            items: sub.items
          };

          const csrfToken = (window.frappe && window.frappe.csrf_token) || '';
          const headers = { 'Content-Type': 'application/json' };
          if (csrfToken) headers['X-Frappe-CSRF-Token'] = csrfToken;

          const resp = await fetch('/api/method/omniservey.api.sync.batch_push', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ submissions: [payload] })
          });

          if (resp.ok) {
            const data = await resp.json();
            const res = (data.message && data.message.results && data.message.results[0]) || {};
            if (res.status === 'SUCCESS' || res.status === 'DUPLICATE_SKIPPED') {
              sub.status = 'SYNCED';
              sub.synced_at = new Date().toISOString();
              sub.server_doc_name = res.doc_name;
              await db.wal.put(JSON.parse(JSON.stringify(sub)));
            } else {
              sub.retry_count = (sub.retry_count || 0) + 1;
              sub.last_error = res.error || 'Sync rejected';
              await db.wal.put(JSON.parse(JSON.stringify(sub)));
            }
          } else {
            sub.retry_count = (sub.retry_count || 0) + 1;
            await db.wal.put(JSON.parse(JSON.stringify(sub)));
          }
        }
        await loadWALFromDB();
      } catch (err) {
        console.warn('[Sync] Background sync paused (offline/network error)', err);
      } finally {
        isSyncing.value = false;
      }
    }

    function exportWALBackup() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(walSubmissions.value, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `OmniServey_WAL_Backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Offline WAL backup exported', 'success');
    }

    return {
      currentView,
      isOnline,
      isSyncing,
      currentLang,
      languages,
      templates,
      searchQuery,
      selectedCategory,
      categories,
      filteredTemplates,
      activeTemplate,
      activeSectionIndex,
      activeSection,
      activeQuestions,
      sections,
      formData,
      currentGPS,
      toastMessage,
      toastType,
      validationModalOpen,
      validationErrors,
      highlightedQuestion,
      currentUser,
      walSubmissions,
      pendingCount,
      permissionStatus,
      currentUUID,
      isSectionComplete,
      startSurvey,
      nextSection,
      prevSection,
      jumpToQuestion,
      saveOffline,
      commitToWAL,
      resumeDraft,
      deleteWALItem,
      autoSync,
      exportWALBackup,
      fetchGPS,
      handlePhotoUpload,
      removePhoto,
      initSignaturePad,
      clearSignature,
      fetchServerTemplates,
      scrollTabs,
      t
    };
  },
  template: `
    <div class="min-h-screen flex flex-col bg-slate-100 text-slate-900 pb-20 sm:pb-0">

      <!-- FLOATING TOAST NOTIFICATION -->
      <div v-if="toastMessage" 
           class="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto p-3.5 rounded-2xl shadow-xl border flex items-center justify-between text-xs font-bold transition-all duration-300 animate-bounce"
           :class="toastType === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : (toastType === 'error' ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-900 text-white border-slate-700')">
        <div class="flex items-center space-x-2">
          <span>{{ toastType === 'success' ? '✓' : (toastType === 'error' ? '⚠️' : 'ℹ️') }}</span>
          <span>{{ toastMessage }}</span>
        </div>
        <button @click="toastMessage = ''" class="ml-2 text-white/80 hover:text-white font-bold text-sm">✕</button>
      </div>

      <!-- 1. STICKY TOP HEADER (Phone & Desktop) -->
      <header class="bg-slate-900 text-white shadow-md sticky top-0 z-40 border-b border-slate-800 pt-safe">
        <div class="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
          
          <!-- Logo & Brand -->
          <div class="flex items-center space-x-2.5 cursor-pointer touch-press" @click="currentView = 'templates'">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-black text-white text-base shadow-sm">
              Ω
            </div>
            <div>
              <div class="font-bold text-sm leading-tight tracking-tight flex items-center space-x-1.5">
                <span>{{ t('OmniServey') }}</span>
                <span class="text-[10px] bg-slate-800 text-indigo-300 px-1.5 py-0.2 rounded font-mono">v16</span>
              </div>
              <div class="text-[10px] text-slate-400 font-medium truncate max-w-[130px]">
                {{ currentUser.full_name }}
              </div>
            </div>
          </div>

          <!-- Top Action Controls -->
          <div class="flex items-center space-x-2 shrink-0">

            <!-- Network Status Pill -->
            <div :class="isOnline ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300' : 'bg-rose-950/80 border-rose-700 text-rose-300'"
                 class="flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold border">
              <span :class="isOnline ? 'bg-emerald-400' : 'bg-rose-400'" class="w-2 h-2 rounded-full animate-pulse"></span>
              <span>{{ isOnline ? t('Online') : t('Offline') }}</span>
            </div>

            <!-- Vernacular Language Switcher (10 Vernacular Languages) -->
            <select v-model="currentLang" 
                    class="bg-slate-800 text-white text-xs font-semibold py-1.5 px-2.5 rounded-xl border border-slate-700 outline-none cursor-pointer max-w-[130px] truncate">
              <option v-for="lang in languages" :key="lang.code" :value="lang.code">
                {{ lang.label }}
              </option>
            </select>

          </div>

        </div>
      </header>

      <!-- 2. MAIN CONTENT BODY -->
      <main class="flex-1 max-w-3xl w-full mx-auto p-3.5 sm:p-5">

        <!-- ========================================== -->
        <!-- VIEW 1: TEMPLATE DISCOVERY & RBAC CATALOG  -->
        <!-- ========================================== -->
        <div v-if="currentView === 'templates'" class="space-y-4">
          
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-black text-slate-900 tracking-tight">{{ t('Surveys') }}</h1>
            <button @click="currentView = 'queue'" 
                    class="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm touch-press">
              <span>{{ t('WAL Queue') }}</span>
              <span v-if="pendingCount > 0" class="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black animate-pulse">
                {{ pendingCount }}
              </span>
            </button>
          </div>

          <!-- Template Cards List -->
          <div v-if="filteredTemplates.length > 0" class="space-y-3">
            <div v-for="tmpl in filteredTemplates" :key="tmpl.name" 
                 class="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-400 transition-all space-y-3">
              
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-bold text-slate-900 text-base leading-snug">{{ tmpl.title }}</h3>
                  <div class="text-xs text-slate-500 font-medium mt-0.5">{{ tmpl.project }}</div>
                </div>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  v{{ tmpl.version }}
                </span>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                <div class="text-xs text-slate-500">
                  <span>{{ tmpl.schema ? (tmpl.schema.sections ? tmpl.schema.sections.length : 0) : 0 }} {{ t('Pages') }}</span> · 
                  <span>{{ tmpl.schema ? (tmpl.schema.questions ? tmpl.schema.questions.length : 0) : 0 }} {{ t('Questions') }}</span>
                </div>

                <button @click="startSurvey(tmpl)" 
                        class="min-h-[42px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow touch-press flex items-center space-x-1.5">
                  <span>{{ t('Start Survey Form') }}</span>
                  <span>→</span>
                </button>
              </div>

            </div>
          </div>

          <div v-else class="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <div class="text-3xl">📋</div>
            <div class="text-sm font-bold text-slate-800">No Survey Templates Found</div>
            <button @click="fetchServerTemplates" class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold border border-indigo-100">
              ⟳ Refresh Templates
            </button>
          </div>

        </div>

        <!-- ========================================== -->
        <!-- VIEW 2: DYNAMIC ACTIVE SURVEY FORM         -->
        <!-- ========================================== -->
        <div v-if="currentView === 'form' && activeTemplate" class="space-y-4 pb-24">
          
          <!-- Top Breadcrumb & Title Bar -->
          <div class="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
            <div class="flex items-center justify-between">
              <button @click="currentView = 'templates'" class="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center space-x-1 touch-press">
                <span>{{ t('Exit Form') }}</span>
              </button>
              
              <div class="text-xs font-bold text-slate-500 font-mono">
                {{ t('Step') }} {{ activeSectionIndex + 1 }} {{ t('of') }} {{ sections.length }}
              </div>
            </div>

            <div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {{ activeTemplate.title }}
              </h2>
            </div>

            <!-- Horizontal Section Progress Tabs with Smooth Touch & Scroll Chevrons -->
            <div class="relative w-full max-w-full flex items-center">
              <button type="button" @click="scrollTabs('left')" 
                      class="shrink-0 w-6 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black flex items-center justify-center mr-1 touch-press">
                ◀
              </button>
              
              <div id="section_tabs_container" 
                   class="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none w-full scroll-smooth">
                <button v-for="(sec, sIdx) in sections" :key="sec.section_code"
                        :id="'sec_tab_' + sIdx"
                        @click="activeSectionIndex = sIdx"
                        :class="activeSectionIndex === sIdx ? 'bg-indigo-600 text-white shadow-sm font-bold scale-[1.02]' : (isSectionComplete(sec) ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600')"
                        class="px-3 py-1.5 rounded-xl text-xs whitespace-nowrap touch-press transition-all flex items-center space-x-1 shrink-0">
                  <span v-if="isSectionComplete(sec)" class="text-[10px]">✓</span>
                  <span>{{ t(sec.section_title) }}</span>
                </button>
              </div>

              <button type="button" @click="scrollTabs('right')" 
                      class="shrink-0 w-6 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black flex items-center justify-center ml-1 touch-press">
                ▶
              </button>
            </div>
          </div>

          <!-- Section Heading -->
          <div class="bg-indigo-50/70 border border-indigo-100 p-3 rounded-xl flex items-center justify-between">
            <div class="text-xs font-bold text-indigo-900">
              {{ activeSection ? t(activeSection.section_title) : '' }}
            </div>
            <div class="text-[11px] text-indigo-600 font-medium">
              {{ activeQuestions.length }} {{ t('Questions') }}
            </div>
          </div>

          <!-- Dynamic Questions Card Container -->
          <div class="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            
            <div v-for="(q, qIndex) in activeQuestions" :key="q.question_code" :id="'q_card_' + q.question_code"
                 class="space-y-2 border-b border-slate-100 pb-5 last:border-0 last:pb-0 p-3 rounded-2xl transition-all duration-300"
                 :class="highlightedQuestion === q.question_code ? 'ring-4 ring-rose-500/60 bg-rose-50/50 shadow-md animate-pulse' : ''">
              
              <!-- Question Label & Mandatory Asterisk -->
              <label class="block text-sm sm:text-base font-bold text-slate-900 leading-snug">
                <span class="text-indigo-600 font-mono text-xs mr-1">Q{{ qIndex + 1 }}.</span>
                {{ t(q.label_en) }}
                <span v-if="q.is_mandatory" class="text-rose-500 font-bold ml-0.5">*</span>
              </label>

              <!-- TYPE 1: TEXT / STRING -->
              <div v-if="q.field_type === 'Text'">
                <input type="text" v-model="formData[q.question_code]" 
                       :placeholder="t('Enter response here...')" 
                       class="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all">
              </div>

              <!-- TYPE 2: NUMERIC / CURRENCY -->
              <div v-if="q.field_type === 'Integer' || q.field_type === 'Decimal' || q.field_type === 'Currency (INR)'" class="relative">
                <span v-if="q.field_type === 'Currency (INR)'" class="absolute left-3.5 top-3 text-slate-400 font-bold">₹</span>
                <input type="number" v-model="formData[q.question_code]" 
                       :class="q.field_type === 'Currency (INR)' ? 'pl-8' : 'pl-3.5'"
                       placeholder="0.00" 
                       class="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all">
              </div>

              <!-- TYPE 3: SINGLE CHOICE RADIO CARDS -->
              <div v-if="q.field_type === 'Single Choice (Radio)'" class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div v-for="opt in (q.options || ['Yes', 'No'])" :key="opt"
                     @click="formData[q.question_code] = opt"
                     :class="formData[q.question_code] === opt ? 'bg-indigo-50/80 border-indigo-600 text-indigo-950 font-bold shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'"
                     class="flex items-center justify-between p-3.5 rounded-xl border cursor-pointer touch-press transition-all min-h-[48px]">
                  <span class="text-sm">{{ t(opt) }}</span>
                  <div :class="formData[q.question_code] === opt ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white'"
                       class="w-5 h-5 rounded-full border flex items-center justify-center transition-all">
                    <span v-if="formData[q.question_code] === opt" class="w-2 h-2 rounded-full bg-white"></span>
                  </div>
                </div>
              </div>

              <!-- TYPE 4: GPS LOCATION -->
              <div v-if="q.field_type === 'GPS Location'" class="space-y-2.5">
                <button type="button" @click="fetchGPS" :disabled="currentGPS.fetching" 
                        class="w-full min-h-[48px] bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center space-x-2 touch-press shadow-sm">
                  <span v-if="currentGPS.fetching" class="animate-spin text-sm">⟳</span>
                  <span v-else class="text-sm">📍</span>
                  <span>{{ currentGPS.fetching ? 'Locking Satellite GPS...' : t('Capture GPS Coordinates') }}</span>
                </button>

                <div v-if="currentGPS.latitude" class="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-emerald-900 flex items-center">
                      <span class="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                      {{ t('GPS Fix Acquired ✓') }}
                    </span>
                    <span :class="currentGPS.accuracy <= 15 ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'"
                          class="text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ±{{ currentGPS.accuracy ? currentGPS.accuracy.toFixed(1) : 0 }}m
                    </span>
                  </div>
                  
                  <div class="text-xs font-mono text-emerald-800">
                    Lat: {{ currentGPS.latitude.toFixed(6) }}° · Lng: {{ currentGPS.longitude.toFixed(6) }}°
                  </div>

                  <div class="pt-1 flex items-center space-x-3 text-[11px]">
                    <a :href="'https://maps.google.com/?q=' + currentGPS.latitude + ',' + currentGPS.longitude" target="_blank"
                       class="text-indigo-600 font-bold underline">
                      {{ t('View on Map →') }}
                    </a>
                    <button type="button" @click="fetchGPS" class="text-slate-500 hover:text-slate-800 underline">
                      {{ t('Re-acquire Fix') }}
                    </button>
                  </div>
                </div>

                <div v-if="currentGPS.error" class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  ⚠️ {{ currentGPS.error }}
                </div>
              </div>

              <!-- TYPE 5: PHOTO CAPTURE WITH WATERMARK -->
              <div v-if="q.field_type === 'Photo Upload'" class="space-y-2">
                <div v-if="!formData[q.question_code]">
                  <label class="w-full min-h-[48px] border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl flex items-center justify-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer p-4 bg-slate-50/50 touch-press">
                    <span class="text-lg">📷</span>
                    <span>{{ t('Take Photo / Choose File') }}</span>
                    <input type="file" accept="image/*" capture="environment" @change="handlePhotoUpload(q.question_code, $event)" class="hidden">
                  </label>
                </div>
                
                <div v-else class="relative inline-block mt-2">
                  <img :src="formData[q.question_code]" class="w-full max-w-xs h-44 object-cover rounded-xl border border-slate-200 shadow-sm">
                  <button type="button" @click="removePhoto(q.question_code)" 
                          class="absolute top-2 right-2 bg-rose-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-md">
                    ✕
                  </button>
                  <div class="text-[10px] text-emerald-600 font-medium mt-1">
                    ✓ Compressed with GPS & Timestamp Watermark
                  </div>
                </div>
              </div>

              <!-- TYPE 6: TOUCH SIGNATURE PAD -->
              <div v-if="q.field_type === 'Digital Signature'" class="space-y-2">
                <div class="relative bg-white rounded-xl border-2 border-dashed border-slate-300 overflow-hidden">
                  <canvas :ref="el => initSignaturePad(el, q.question_code)" 
                          class="signature-canvas w-full h-36 block"></canvas>
                  
                  <div class="absolute bottom-2 left-3 text-[10px] text-slate-400 pointer-events-none select-none">
                    {{ t('Sign inside box with finger or stylus') }}
                  </div>
                </div>

                <div class="flex items-center justify-between text-xs">
                  <button type="button" @click="clearSignature(q.question_code)" 
                          class="text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 touch-press">
                    {{ t('Clear Signature') }}
                  </button>
                  <span v-if="formData[q.question_code]" class="text-emerald-600 font-bold text-[11px]">
                    ✓ {{ t('Signature Recorded') }}
                  </span>
                </div>
              </div>

            </div>

          </div>

          <!-- FIXED BOTTOM ACTION BAR -->
          <div class="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-safe">
            <div class="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between space-x-2.5">
              
              <!-- CASE 1: NORMAL FORM FILLING (Sections 1 to N-1) -> Exactly TWO balanced buttons: Back and Next -->
              <template v-if="activeSectionIndex < (sections.length - 1)">
                <!-- Back Button -->
                <button type="button" @click="prevSection" :disabled="activeSectionIndex === 0"
                        class="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-30 disabled:pointer-events-none touch-press flex items-center justify-center space-x-1 shadow-sm transition-all">
                  <span>{{ t('Previous') }}</span>
                </button>

                <!-- Next Button -->
                <button type="button" @click="nextSection"
                        class="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md touch-press flex items-center justify-center space-x-1 transition-all">
                  <span>{{ t('Next') }}</span>
                </button>
              </template>

              <!-- CASE 2: FINAL SECTION (Section N) -> THREE buttons: Visible Back, Compact Save Draft, and Prominent Submit -->
              <template v-else>
                <!-- Back Button -->
                <button type="button" @click="prevSection"
                        class="min-h-[48px] px-3.5 sm:px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 touch-press flex items-center justify-center space-x-1 shadow-sm shrink-0 transition-all">
                  <span>{{ t('Previous') }}</span>
                </button>

                <!-- Short / Compact Save Draft Button -->
                <button type="button" @click="saveOffline(false)" 
                        class="min-h-[48px] px-3 sm:px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm touch-press flex items-center justify-center space-x-1 shrink-0 transition-all">
                  <span>💾</span>
                  <span>{{ t('Draft') }}</span>
                </button>

                <!-- Prominent Submit Survey Button -->
                <button type="button" @click="commitToWAL"
                        class="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md touch-press flex items-center justify-center space-x-1.5 transition-all">
                  <span>{{ t('Submit Survey') }}</span>
                  <span>✓</span>
                </button>
              </template>

            </div>
          </div>

        </div>

        <!-- ========================================== -->
        <!-- VIEW 3: WRITE-AHEAD LOG (WAL) QUEUE       -->
        <!-- ========================================== -->
        <div v-if="currentView === 'queue'" class="space-y-4">
          <div class="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h2 class="text-base sm:text-lg font-bold text-slate-900">{{ t('Write-Ahead Log (WAL)') }}</h2>
                <div class="text-xs text-slate-500">{{ t('Atomic zero-loss local storage queue') }}</div>
              </div>
              <button @click="autoSync" :disabled="isSyncing || !isOnline" 
                      class="min-h-[40px] px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50 touch-press shadow-sm">
                {{ isSyncing ? '...' : t('Sync Now') }}
              </button>
            </div>

            <div v-if="walSubmissions.length === 0" class="text-center py-12 text-slate-400 text-xs">
              No local survey records stored yet.
            </div>

            <div v-else class="space-y-3">
              <div v-for="sub in walSubmissions" :key="sub.idempotency_key" 
                   class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div class="flex items-center space-x-2">
                    <span :class="sub.status === 'SYNCED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : (sub.status === 'DRAFT_OFFLINE' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-amber-50 text-amber-600 border-amber-200')"
                          class="text-[10px] font-bold px-2 py-0.5 rounded border">
                      {{ sub.status === 'SYNCED' ? 'Synced with Server ✓' : (sub.status === 'DRAFT_OFFLINE' ? 'Offline Draft 💾' : 'Pending Server Sync ⟳') }}
                    </span>
                    <span class="text-[10px] text-slate-400 font-mono">{{ sub.idempotency_key ? sub.idempotency_key.slice(0, 8) : '' }}...</span>
                  </div>
                  <div class="font-bold text-slate-800 text-sm mt-1">{{ sub.survey_template }}</div>
                  <div class="text-xs text-slate-500 mt-0.5">Captured: {{ new Date(sub.captured_at_local).toLocaleString() }}</div>
                </div>

                <div class="text-right space-y-1">
                  <div class="text-[11px] text-slate-500">{{ sub.items ? sub.items.length : 0 }} Answers</div>
                  <div class="flex items-center space-x-1.5 justify-end">
                    <button v-if="sub.status !== 'SYNCED'" @click="resumeDraft(sub)"
                            class="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100 touch-press">
                      Resume →
                    </button>
                    <button @click="deleteWALItem(sub.idempotency_key)"
                            class="px-2 py-1 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-lg">
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <button @click="exportWALBackup" class="text-xs text-slate-600 hover:text-slate-900 font-bold underline">
                Export Local JSON Backup
              </button>
              <button @click="currentView = 'templates'" class="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
                ← Back to Surveys
              </button>
            </div>
          </div>
        </div>

      </main>

      <!-- ========================================== -->
      <!-- SLIDE-UP INTERACTIVE VALIDATION MODAL      -->
      <!-- ========================================== -->
      <div v-if="validationModalOpen" 
           class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4">
        <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">
          
          <!-- Header -->
          <div class="p-4 bg-rose-50 border-b border-rose-100 flex items-start justify-between">
            <div class="flex items-center space-x-2.5">
              <span class="text-2xl">⚠️</span>
              <div>
                <h3 class="font-bold text-sm sm:text-base text-rose-950">
                  {{ t('Required Questions Pending') }} ({{ validationErrors.length }})
                </h3>
                <p class="text-[11px] text-rose-700 leading-tight mt-0.5">
                  {{ t('Please fill in these required fields before final submission, or save as an offline draft anytime.') }}
                </p>
              </div>
            </div>
            <button @click="validationModalOpen = false" class="text-rose-400 hover:text-rose-700 font-black text-base p-1">✕</button>
          </div>

          <!-- Pending Questions List -->
          <div class="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100">
            <div v-for="(err, idx) in validationErrors" :key="err.question_code"
                 @click="jumpToQuestion(err)"
                 class="pt-2 first:pt-0 flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer touch-press group transition-all">
              <div>
                <div class="text-[10px] font-bold text-indigo-600">{{ err.section_title }}</div>
                <div class="text-xs font-semibold text-slate-800">{{ err.label }}</div>
              </div>
              <span class="text-indigo-600 font-bold text-xs group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
            <button @click="jumpToQuestion(validationErrors[0])"
                    class="w-full min-h-[46px] bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow touch-press flex items-center justify-center space-x-1.5">
              <span>{{ t('Go to First Pending Question') }}</span>
            </button>
            <div class="flex items-center space-x-2">
              <button @click="saveOffline(false)" 
                      class="flex-1 min-h-[42px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm touch-press flex items-center justify-center space-x-1">
                <span>{{ t('Save as Offline Draft Anyway') }}</span>
              </button>
              <button @click="validationModalOpen = false"
                      class="px-4 min-h-[42px] bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl touch-press">
                {{ t('Close') }}
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  `
});

app.mount('#app');
