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

// 2. Comprehensive Built-In Hindi & Regional Vernacular Dictionary
const BUILTIN_TRANSLATIONS = {
  hi: {
    // Top Bar & Navigation
    'OmniServey': 'ओमनीसर्वे',
    'Online': 'ऑनलाइन',
    'Offline': 'ऑफलाइन',
    'Surveys': 'सर्वेक्षण',
    'WAL Queue': 'कतार (ऑफलाइन)',
    'System': 'सिस्टम',
    'Offline Ready ✓': 'ऑफलाइन तैयार ✓',
    'Active Session': 'सक्रिय सत्र',
    'Refresh': 'रिफ्रेश',
    'Backup': 'बैकअप',
    'Exit Form': '← बाहर निकलें',
    'Step': 'चरण',
    'of': 'का',
    'Pages': 'पृष्ठ',
    'Questions': 'प्रश्न',
    'Previous': '← पिछला',
    'Next': 'अगला →',
    'Save Offline': 'ऑफलाइन सेव करें',
    'Save Survey': 'सर्वे सुरक्षित करें',
    'Submit Survey': 'सबमिट करें',
    'Capture GPS Coordinates': '📍 जीपीएस लोकेशन रिकॉर्ड करें',
    'GPS Fix Acquired ✓': 'जीपीएस लोकेशन प्राप्त हुआ ✓',
    'Re-acquire Fix': 'पुनः प्रयास करें',
    'View on Map →': 'नक्शे पर देखें →',
    'Take Photo / Choose File': '📷 फोटो लें / फाइल चुनें',
    'Compressed (<150KB) with GPS & Timestamp Watermark': 'जीपीएस और समय मोहर के साथ संपीड़ित',
    'Sign inside box with finger or stylus': 'अपनी उंगली या स्टाइलस से बॉक्स में हस्ताक्षर करें',
    'Clear Signature': '🗑 हस्ताक्षर मिटाएं',
    'Signature Recorded': 'हस्ताक्षर दर्ज हुआ',
    'Enter response here...': 'यहाँ उत्तर दर्ज करें...',
    'Row': 'पंक्ति',
    'Delete': 'हटाएं',
    '+ Add Item Row': '+ नई पंक्ति जोड़ें',
    'No Accessible Survey Templates': 'कोई सर्वेक्षण टेम्पलेट उपलब्ध नहीं है',
    'Your account': 'आपका खाता',
    'does not currently have permission to access any published templates.': 'वर्तमान में किसी भी प्रकाशित टेम्पलेट को देखने की अनुमति नहीं रखता है।',
    'Re-Check Permissions': '⟳ अनुमतियों की पुनः जाँच करें',
    'Search templates by title or category...': 'शीर्षक या श्रेणी द्वारा खोजें...',
    'Start Survey Form': 'सर्वेक्षण फॉर्म शुरू करें',
    'Start Survey Form →': 'सर्वेक्षण फॉर्म शुरू करें →',
    'Resume Survey →': 'सर्वेक्षण जारी रखें →',
    'Write-Ahead Log (WAL)': 'राइट-अहेड लॉग (WAL कतार)',
    'Atomic zero-loss local storage queue': 'शून्य डेटा हानि सुरक्षित स्थानीय भंडारण',
    'Sync Now': '⟳ अभी सिंक करें',
    'Synced ✓': 'सर्वर पर सिंक हुआ ✓',
    'Saved Offline': 'ऑफलाइन सुरक्षित',
    'Pending Sync': 'सिंक बाकी है',
    'Draft Saved Offline': 'ड्राफ्ट ऑफलाइन सुरक्षित',
    'No survey submissions recorded yet. Start a survey to capture data offline!': 'अभी तक कोई सर्वेक्षण दर्ज नहीं हुआ है। ऑफलाइन डेटा दर्ज करने के लिए सर्वे शुरू करें!',

    // Common Choices & Options
    'Yes': 'हाँ',
    'No': 'नहीं',
    'Self': 'स्वयं',
    'Husband': 'पति',
    'Son': 'बेटा',
    'Daughter': 'बेटी',
    'Any other': 'अन्य कोई',
    'Single': 'अविवाहित',
    'Married': 'विवाहित',
    'Widowed': 'विधवा',
    'Separated': 'परित्यक्ता',
    'Divorced': 'तलाकशुदा',
    'SC': 'अनुसूचित जाति (SC)',
    'ST': 'अनुसूचित जनजाति (ST)',
    'OBC': 'अन्य पिछड़ा वर्ग (OBC)',
    'General': 'सामान्य',
    'Illiterate': 'निरक्षर / अनपढ़',
    'Illiterate but able to calculate': 'निरक्षर (लेकिन सामान्य गणना में सक्षम)',
    '5th pass': '5वीं कक्षा उत्तीर्ण',
    '8th pass': '8वीं कक्षा उत्तीर्ण',
    '10th pass': '10वीं कक्षा उत्तीर्ण',
    '12th pass': '12वीं कक्षा उत्तीर्ण',
    'Graduate': 'स्नातक / ग्रेजुएट',
    'Less than Rs 1,20,000': 'रु 1,20,000 से कम',
    'Rs 1,20,000 to Rs 1,60,000': 'रु 1,20,000 से रु 1,60,000',
    'Rs 1,60,000 to Rs 2,00,000': 'रु 1,60,000 से रु 2,00,000',
    'Rs 2,00,000 to Rs 2,50,000': 'रु 2,00,000 से रु 2,50,000',
    'Rs 2,50,000 to Rs 3,00,000': 'रु 2,50,000 से रु 3,00,000',
    'Rs 3,00,000 to Rs 3,50,000': 'रु 3,00,000 से रु 3,50,000',
    'Above Rs 3,50,000': 'रु 3,50,000 से अधिक',
    'Member': 'साधारण सदस्य',
    'Leadership role': 'नेतृत्व की भूमिका (अध्यक्ष / सचिव / कोषाध्यक्ष)',
    'Grocery / Kirana': 'किराना दुकान / ग्रोसरी',
    'General store': 'जनरल स्टोर',
    'Leather & footwear': 'चमड़ा व जूते-चप्पल',
    'Flour mill': 'आटा चक्की',
    'Tailoring & Stitching': 'सिलाई व कढ़ाई केंद्र',
    'Apparel & Garments': 'रेडीमेड वस्त्र',
    'Beauty parlour': 'ब्यूटी पार्लर',
    'Handicraft': 'हस्तशिल्प / हैंडीक्राफ्ट',
    'Dairy shop': 'डेयरी व दूध केंद्र',
    'Auto-mechanic': 'ऑटो मैकेनिक',
    'E-mitra': 'ई-मित्र केंद्र',
    'Mobile repair shop': 'मोबाइल रिपेयर दुकान',
    'Transport': 'परिवहन सेवा',
    'Own shop': 'अपनी निजी दुकान',
    'Operating from own house': 'अपने घर से संचालन',
    'Rented shop': 'किराये की दुकान',
    'Operating from rented house': 'किराये के मकान से संचालन',
    'Self alone': 'स्वयं अकेले',
    'Self with occasional support from family': 'स्वयं (परिवार के कभी-कभार सहयोग से)',
    'Self with regular support from family': 'स्वयं (परिवार के नियमित सहयोग से)',
    'Only husband': 'केवल पति',
    'Husband and wife (joint management)': 'पति-पत्नी (संयुक्त प्रबंधन)',
    'Family members': 'परिवार के अन्य सदस्य',
    'Less than 4 hours': '4 घंटे से कम',
    '4-5 hours': '4 से 5 घंटे',
    '5-8 hours': '5 से 8 घंटे',
    '8-10 hours': '8 से 10 घंटे',
    'Yes, with help of family member': 'हाँ, परिवार के सदस्य की मदद से',
    'Yes, husband does': 'हाँ, पति करते हैं',
    "Don't record regularly": 'नियमित रूप से नहीं लिखते',
    'I borrow money from SHG to purchase material': 'सामग्री खरीदने के लिए एसएचजी से ऋण लेती हूँ',
    'I borrow money from moneylender/NBFIs to purchase material': 'साहूकार / एनबीएफसी से उधार लेती हूँ',
    'I borrow money from banks': 'बैंकों से ऋण लेती हूँ',
    'I buy material on credit': 'उधारी पर कच्चा माल लाती हूँ',
    'Yes, I own the space and I get clients easily': 'हाँ, जगह मेरी अपनी है और ग्राहक आसानी से आते हैं',
    'Yes, I found the space easily on rent and I get clients': 'हाँ, आसानी से किराये पर मिल गई और ग्राहक आते हैं',
    'Yes, but compared to others I was charged a higher rent': 'हाँ, लेकिन दूसरों की तुलना में अधिक किराया लगा',
    "No, but I own the space and can't move to other location": 'नहीं, लेकिन जगह अपनी है और दूसरी जगह नहीं जा सकती',
    'No, but I could afford only this space': 'नहीं, लेकिन केवल यही स्थान वहन कर सकती थी',
    'Yes, supplier is from nearby town/village and supplies on demand': 'हाँ, सप्लायर पास के शहर से है और मांग पर माल देता है',
    'Yes, supplier offers credit purchase and discounts': 'हाँ, सप्लायर उधारी और छूट देता है',
    'I buy from different suppliers as per need/season': 'आवश्यकतानुसार अलग-अलग सप्लायरों से खरीदती हूँ',
    'No, but he is our old supplier and we rely on him': 'नहीं, लेकिन वह पुराना सप्लायर है और हम उस पर भरोसा करते हैं',
    "Yes, I don't face any issues": 'हाँ, कोई परेशानी नहीं आती',
    'Yes, but I conduct only cash transactions': 'हाँ, लेकिन केवल नकद लेन-देन ही करती हूँ',
    'Yes, but I have learnt over the years how to negotiate': 'हाँ, समय के साथ बातचीत व वसूली सीख ली है',
    'No, but my husband is able to recover': 'नहीं, लेकिन मेरे पति वसूल लेते हैं',
    'No, my business has suffered losses due to debt': 'नहीं, उधारी न मिलने से व्यवसाय में नुकसान हुआ है',
    'Yes, I can visit market and buy material independently': 'हाँ, मैं खुद बाजार जाकर माल खरीद सकती हूँ',
    "No, because I don't know the sellers": 'नहीं, क्योंकि मैं विक्रेताओं को नहीं जानती',
    'No, because transporting goods is difficult for women': 'नहीं, महिलाओं के लिए सामान ढोना/लाना कठिन है',
    "No, because my husband doesn't approve": 'नहीं, क्योंकि पति अनुमति नहीं देते',
    'No, but I can if my husband is unavailable': 'नहीं, पर पति के न होने पर जा सकती हूँ',
    'Yes, I get required amount easily from SHG': 'हाँ, एसएचजी से आवश्यक राशि आसानी से मिल जाती है',
    'Yes, I get required loan easily from moneylender/NBFIs': 'हाँ, साहूकार/एनबीएफसी से आसानी से मिल जाता है',
    'No, loan amount is smaller than my demand in SHGs': 'नहीं, एसएचजी में ऋण राशि मांग से बहुत कम होती है',
    'No, installment amount is higher due to high interest from moneylender': 'नहीं, साहूकार की ब्याज दर अधिक होने से किस्त भारी पड़ती है',
    'Seed capital to buy inventory and set up shop': 'दुकान स्थापित करने व माल भरने हेतु बीज पूंजी',
    'Buy new machinery / equipment to increase production': 'उत्पादन बढ़ाने हेतु नई मशीन/उपकरण (जैसे सिलाई मशीन)',
    'Buy storage assets (e.g. refrigerator/display counter)': 'सामान रखने के साधन (फ्रिज / डिस्प्ले काउंटर आदि)',
    'Expand physical shop space (e.g. flour mill extension)': 'दुकान का विस्तार (जैसे चक्की बढ़ाना)',
    'Expand product variety and retail range': 'उत्पादों की विविधता व रेंज बढ़ाना',
    'Buy delivery vehicle or transport services': 'परिवहन वाहन खरीदना',
    'Buy smartphone to promote goods online': 'ऑनलाइन प्रचार हेतु स्मार्टफोन खरीदना',
    'Helped in accessing loans to setup the business': 'व्यवसाय शुरू करने हेतु ऋण प्राप्त करने में मदद की',
    'Helped us understand business planning & profit calculations': 'व्यापार योजना व लाभ-हानि समझना सिखाया',
    'Trained us on maintaining regular transaction records': 'लेन-देन का नियमित हिसाब-किताब रखने का प्रशिक्षण दिया',
    'Gave ideas to increase enterprise income and sales': 'बिक्री और आय बढ़ाने के नए विचार दिए',
    'Helped in banking linkages and communication skills': 'बैंकों से जुड़ाव व संवाद कौशल में सहयोग दिया',
    'No, but family owns it': 'नहीं, लेकिन परिवार के पास है',
    // Rajasthan Districts & Blocks
    'District': 'जिला',
    'Baran': 'बारां',
    'Churu': 'चूरू',
    'Dausa': 'दौसा',
    'Dungarpur': 'डूंगरपुर',
    'Jodhpur': 'जोधपुर',
    'Block / Tehsil': 'ब्लॉक / तहसील',
    'Chhipabarod': 'छीपाबड़ौद',
    'Kishanganj': 'किशनगंज',
    'Sardar Sheher': 'सरदारशहर',
    'Bidasar': 'बीदासर',
    'Secundra': 'सिकंदरा',
    'Sagwara': 'सागवाड़ा',
    'Galiakot': 'गलियाकोट',
    'Bicchiwada': 'बिछीवाड़ा',
    'Jodhpur Block': 'जोधपुर ब्लॉक',
    'Village / Gram Panchayat Name': 'गाँव / ग्राम पंचायत का नाम',
    'Cluster Level Federation (CLF) Name': 'क्लस्टर लेवल फेडरेशन (CLF) का नाम',
    'Village Organization (VO) Name': 'ग्राम संगठन (VO) का नाम',
    'Self-Help Group (SHG) Name': 'स्वयं सहायता समूह (SHG) का नाम',
    'Respondent Name': 'उत्तरदाता का नाम',
    'Enterprise / Business Name': 'उद्यम / व्यवसाय का नाम',
    'Year of Setting Up Enterprise': 'उद्यम स्थापना का वर्ष',
    'Main Business Activity of the Enterprise': 'उद्यम की मुख्य व्यावसायिक गतिविधि',
    'What is respondent\'s relation with SHG member?': 'उत्तरदाता का एसएचजी सदस्य से क्या संबंध है?',
    'What is the age of SHG member?': 'एसएचजी सदस्य की आयु क्या है?',
    'What is the marital status of the SHG member?': 'एसएचजी सदस्य की वैवाहिक स्थिति क्या है?',
    'What is the social category / caste?': 'सामाजिक श्रेणी / जाति क्या है?',
    'What is the education status of the SHG member?': 'एसएचजी सदस्य की शैक्षणिक स्थिति क्या है?',
    'How many total members are in the family?': 'परिवार में कुल कितने सदस्य हैं?',
    'What is your total annual household income?': 'आपकी कुल वार्षिक पारिवारिक आय कितनी है?',
    'What is your role in the SHG?': 'एसएचजी में आपकी भूमिका क्या है?',
    'Are you related to any of the SVEP / OSF CRP?': 'क्या आप किसी SVEP / OSF CRP से संबंधित हैं?',
    'Who started the enterprise?': 'उद्यम किसने शुरू किया था?',
    'Who operates and manages the enterprise on a daily basis?': 'दैनिक आधार पर उद्यम का संचालन और प्रबंधन कौन करता है?',
    'For how many hours in a day does the shop/enterprise remain open?': 'दिन में कितने घंटे दुकान/उद्यम खुला रहता है?',
    'What is the type of business place / premises?': 'व्यावसायिक स्थान/परिसर का प्रकार क्या है?',
    'Does SHG member maintain written records of business transactions regularly?': 'क्या एसएचजी सदस्य नियमित रूप से व्यावसायिक लेन-देन का लिखित रिकॉर्ड रखते हैं?',
    'In the first year of your enterprise, what was the amount of seed capital (Rs)?': 'आपके उद्यम के पहले वर्ष में प्रारंभिक बीज पूंजी की राशि (रु) क्या थी?',
    'How do you manage working capital during peak season?': 'पीक सीजन के दौरान आप कार्यशील पूंजी का प्रबंधन कैसे करते हैं?',
    'Is the location of your space convenient for your business?': 'क्या आपके स्थान की स्थिति आपके व्यवसाय के लिए सुविधाजनक है?',
    'Are you satisfied and happy with your wholesale supplier?': 'क्या आप अपने थोक सप्लायर से संतुष्ट और खुश हैं?',
    'Are you able to recover credit / money from your customers?': 'क्या आप अपने ग्राहकों से उधारी/पैसा वसूल पाते हैं?',
    'Do you source raw materials/goods from market independently?': 'क्या आप बाजार से स्वतंत्र रूप से कच्चा माल/सामान लाते हैं?',
    'Do you have easy access to loans from different sources?': 'क्या आपको विभिन्न स्रोतों से ऋण की आसान पहुँच प्राप्त है?',
    'How much loan amount have you availed under SVEP / OSF scheme (Rs)?': 'आपने SVEP / OSF योजना के तहत कितनी ऋण राशि प्राप्त की है (रु)?',
    'How did you utilize the enterprise loan?': 'आपने उद्यम ऋण का उपयोग किस प्रकार किया?',
    'Monthly enterprise income BEFORE availing loan changes (Rs)?': 'ऋण से बदलाव करने से पहले उद्यम की मासिक आय (रु)?',
    'Monthly enterprise income AFTER availing loan changes (Rs)?': 'ऋण से बदलाव करने के बाद उद्यम की मासिक आय (रु)?',
    'What has been the contribution of SVEP / OSF CRPs?': 'SVEP / OSF CRP का क्या योगदान रहा है?',
    'Does the woman entrepreneur own a smartphone?': 'क्या महिला उद्यमी के पास स्मार्टफोन है?',
    'Do you use QR code / UPI / mobile banking for business transactions?': 'क्या आप व्यावसायिक लेन-देन के लिए क्यूआर कोड / यूपीआई / मोबाइल बैंकिंग का उपयोग करते हैं?',
    'Daily how many transactions are done via QR code / UPI?': 'दैनिक आधार पर क्यूआर कोड/यूपीआई के माध्यम से कितने लेन-देन होते हैं?',
    'Which social media platforms do you use for your business?': 'आप अपने व्यवसाय के लिए किन सोशल मीडिया प्लेटफॉर्म का उपयोग करते हैं?',
    'Capture Enterprise GPS Location (Satellite Coordinates)': 'उद्यम जीपीएस लोकेशन कैप्चर करें (उपग्रह निर्देशांक)',
    'Field Photo of Enterprise & Beneficiary': 'उद्यम और लाभार्थी का फील्ड फोटो',
    'Respondent & Surveyor Digital Signature': 'उत्तरदाता और सर्वेक्षक के डिजिटल हस्ताक्षर',

    // Section Titles
    'Section A: Basic Details': 'भाग क: बुनियादी विवरण',
    'Section B: Respondent & Household Profile': 'भाग ख: उत्तरदाता और परिवार की प्रोफ़ाइल',
    'Section C: Enterprise Operations & Finance': 'भाग ग: उद्यम संचालन और वित्त',
    'Section D: Enterprise Challenges & Coping Mechanisms': 'भाग घ: उद्यम चुनौतियाँ और समाधान',
    'Section E: Impact of SVEP / OSF Schemes': 'भाग ङ: एसवीईपी / ओएसएफ योजनाओं का प्रभाव',
    'Section F: Digital Transactions & Social Media': 'भाग च: डिजिटल लेन-देन और सोशल मीडिया',
    'Section G: Field Verification & Sign-off': 'भाग छ: फील्ड सत्यापन और हस्ताक्षर',
    'Study on Performance of SHG-led Women Entrepreneurs': 'राजस्थान में एसएचजी-नेतृत्व वाली महिला उद्यमियों के प्रदर्शन का अध्ययन',
    'Himalayan Baseline Impact Survey': 'हिमालयन बेसलाइन इम्पैक्ट सर्वेक्षण',
    '1. Household & Demographic Profile': '1. पारिवारिक और जनसांख्यिकीय प्रोफ़ाइल',
    '2. Economic Activity & Livestock': '2. आर्थिक गतिविधि और पशुधन',
    '3. Geolocation & Digital Verification': '3. भू-स्थान एवं डिजिटल सत्यापन',

    // Sample Template Questions
    'Full Name of Household Head / Primary Respondent': 'परिवार के मुखिया / प्राथमिक उत्तरदाता का पूरा नाम',
    'Respondent Classification': 'उत्तरदाता का वर्गीकरण',
    'Primary Contact Phone Number': 'प्राथमिक संपर्क मोबाइल नंबर',
    'Do you own cattle, sheep, or goats?': 'क्या आपके पास गाय, भैंस, भेड़ या बकरियां हैं?',
    'Estimated Monthly Household Income (INR ₹)': 'अनुमानित मासिक पारिवारिक आय (रु ₹)',
    'Farm Equipment & Key Productive Assets': 'कृषि उपकरण और प्रमुख उत्पादक संपत्तियां',
    'Capture Field GPS Coordinates (Auto-verified)': 'फील्ड जीपीएस निर्देशांक कैप्चर करें (स्वतः सत्यापित)',
    'Field Photo of Site / Beneficiary': 'कार्यस्थल / लाभार्थी का फील्ड फोटो',
    'Surveyor Sign-off & Digital Signature': 'सर्वेक्षक और उत्तरदाता के डिजिटल हस्ताक्षर'
  }
};

// 3. Client-Side Canvas Image Compressor (<150 KB JPEG + Watermark)
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

        const timestamp = new Date().toLocaleString();
        let watermarkText = `OmniServey · ${timestamp}`;
        if (gpsCoords && gpsCoords.latitude) {
          watermarkText += ` · GPS: ${gpsCoords.latitude.toFixed(5)}, ${gpsCoords.longitude.toFixed(5)}`;
        }

        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(10, height - 36, ctx.measureText(watermarkText).width + 20, 26);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(watermarkText, 20, height - 18);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

// 4. Main Vue 3 Application
const app = createApp({
  setup() {
    // Navigation & View State
    const currentView = ref('templates'); // 'templates', 'form', 'queue', 'diagnostics'
    const isOnline = ref(navigator.onLine);
    const isSyncing = ref(false);
    const storagePersisted = ref(false);
    const currentLang = ref(localStorage.getItem('omniservey_lang') || 'en');
    const toastMessage = ref('');
    const toastType = ref('success');

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
      { code: 'ur', label: 'اردو (Urdu)' },
      { code: 'ar', label: 'العربية (Arabic)' },
      { code: 'es', label: 'Español (Spanish)' },
      { code: 'fr', label: 'Français (French)' },
      { code: 'de', label: 'Deutsch (German)' },
      { code: 'ru', label: 'Русский (Russian)' },
      { code: 'zh', label: '中文 (Chinese)' },
      { code: 'ja', label: '日本語 (Japanese)' }
    ]);

    // User & Permission State
    const currentUser = reactive({
      user: 'Guest',
      is_guest: true,
      roles: [],
      full_name: 'Guest Surveyor'
    });
    const permissionStatus = ref('loading');

    // Template & Form State
    const templates = ref([]);
    const templateSearchQuery = ref('');
    const activeTemplate = ref(null);
    const activeSectionIndex = ref(0);
    const formData = reactive({});
    const currentGPS = reactive({
      latitude: null,
      longitude: null,
      accuracy: null,
      altitude: null,
      fetching: false,
      error: null
    });
    const currentUUID = ref('');
    const translationsMap = ref({});

    // Signature Canvas Registry
    const signaturePads = reactive({});

    // WAL & Queue State
    const walSubmissions = ref([]);
    const pendingCount = computed(() => walSubmissions.value.filter(s => s.status === 'PENDING_SYNC').length);
    const offlineDraftCount = computed(() => walSubmissions.value.filter(s => s.status === 'DRAFT_OFFLINE').length);

    // Filtered Templates according to search
    const filteredTemplates = computed(() => {
      const q = templateSearchQuery.value.trim().toLowerCase();
      if (!q) return templates.value;
      return templates.value.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.project && t.project.toLowerCase().includes(q)) ||
        (t.target_category && t.target_category.toLowerCase().includes(q))
      );
    });

    // Toast Alert Helper
    function showToast(msg, type = 'success') {
      toastMessage.value = msg;
      toastType.value = type;
      setTimeout(() => {
        if (toastMessage.value === msg) {
          toastMessage.value = '';
        }
      }, 3500);
    }

    // Reactive Language Switcher Watcher
    watch(currentLang, async (newLang) => {
      localStorage.setItem('omniservey_lang', newLang);
      await loadTranslations(activeTemplate.value ? activeTemplate.value.name : null, newLang);
      showToast(newLang === 'hi' ? 'भाषा बदलकर हिंदी कर दी गई है' : 'Language switched to English', 'info');
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

      // Load initial translations (e.g. if starting in Hindi)
      if (currentLang.value !== 'en') {
        await loadTranslations(null, currentLang.value);
      }

      if (isOnline.value) {
        await fetchServerTemplates();
        await fetchAvailableLanguages();
      }
    });

    // Fetch All Enabled Languages from Frappe System
    async function fetchAvailableLanguages() {
      try {
        const resp = await fetch('/api/method/omniservey.api.survey.get_available_languages');
        if (resp.ok) {
          const data = await resp.json();
          if (data.message && data.message.length > 0) {
            languages.value = data.message;
          }
        }
      } catch (err) {
        console.warn('[Languages] Offline: using default pre-configured language list');
      }
    }

    // Helper: UUID Generator
    function generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    // Fetch Authenticated Session User & Roles
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
        console.warn('[Auth] Offline: using guest/local surveyor profile');
      }
    }

    // Load Local Templates from Dexie
    async function loadTemplatesFromDB() {
      const stored = await db.templates.toArray();
      templates.value = stored;
      permissionStatus.value = stored.length > 0 ? 'authorized' : (isOnline.value ? 'loading' : 'restricted');
    }

    // Load Local WAL Submissions
    async function loadWALFromDB() {
      walSubmissions.value = await db.wal.reverse().sortBy('captured_at_local');
    }

    // Fetch Authorized Templates from Server with RBAC Enforcement
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
                  await db.templates.put({
                    name: sData.message.template_name,
                    title: sData.message.title,
                    project: sData.message.project,
                    version: sData.message.version,
                    status: sData.message.status,
                    target_category: item.target_category || 'General',
                    schema_hash_sha256: sData.message.schema_hash_sha256,
                    schema: sData.message.schema
                  });
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
        console.warn('[Sync] Offline: Loaded existing authorized templates from Dexie cache', err);
        permissionStatus.value = templates.value.length > 0 ? 'authorized' : 'restricted';
      }
    }

    // Open & Start Survey Form
    async function startSurvey(template, existingSubmission = null) {
      activeTemplate.value = template;
      activeSectionIndex.value = 0;

      // Reset or restore Form State
      Object.keys(formData).forEach(k => delete formData[k]);
      currentGPS.latitude = null;
      currentGPS.longitude = null;
      currentGPS.accuracy = null;
      currentGPS.altitude = null;
      currentGPS.error = null;

      if (existingSubmission) {
        currentUUID.value = existingSubmission.idempotency_key;
        if (existingSubmission.formDataRaw) {
          Object.assign(formData, existingSubmission.formDataRaw);
        }
        if (existingSubmission.gps_latitude) {
          currentGPS.latitude = existingSubmission.gps_latitude;
          currentGPS.longitude = existingSubmission.gps_longitude;
          currentGPS.accuracy = existingSubmission.gps_accuracy;
        }
        showToast('Resumed offline draft survey', 'info');
      } else {
        currentUUID.value = generateUUID();
      }

      await loadTranslations(template.name, currentLang.value);

      currentView.value = 'form';
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Translation Dictionary Loader
    async function loadTranslations(templateName = null, lang = currentLang.value) {
      if (lang === 'en') {
        translationsMap.value = {};
        return;
      }

      // 1. Start with built-in dictionary
      const builtin = BUILTIN_TRANSLATIONS[lang] || {};
      translationsMap.value = { ...builtin };

      // 2. Check Dexie cached translations (both general and template-specific)
      try {
        const cacheKey = templateName || '__global__';
        const local = await db.translations.get([cacheKey, lang]);
        if (local && local.translations) {
          translationsMap.value = { ...builtin, ...local.translations };
        }

        // 3. If online, fetch from Frappe Translation DocType and cache locally
        if (isOnline.value) {
          const url = templateName 
            ? `/api/method/omniservey.api.survey.get_translations?template_name=${encodeURIComponent(templateName)}&language_code=${lang}`
            : `/api/method/omniservey.api.survey.get_translations?language_code=${lang}`;
          const resp = await fetch(url);
          if (resp.ok) {
            const data = await resp.json();
            const dict = (data.message && data.message.translations) || {};
            translationsMap.value = { ...builtin, ...dict };
            await db.translations.put({
              survey_template: cacheKey,
              language_code: lang,
              translations: dict
            });
          }
        }
      } catch (e) {
        console.warn('[Translation] Fallback to builtin translations:', e);
        translationsMap.value = { ...builtin };
      }
    }

    // Robust Translation Helper
    function t(text, questionCode = null) {
      if (!text) return '';
      if (currentLang.value === 'en') return text;

      const trimmed = text.trim();

      // Check specific questionCode translation first
      if (questionCode && translationsMap.value[questionCode] && translationsMap.value[questionCode].label) {
        return translationsMap.value[questionCode].label;
      }
      // Check translationsMap
      if (translationsMap.value[trimmed]) {
        return translationsMap.value[trimmed];
      }
      if (translationsMap.value[text]) {
        return translationsMap.value[text];
      }

      // Check Builtin Hindi Dictionary
      const hiDict = BUILTIN_TRANSLATIONS.hi || {};
      if (hiDict[trimmed]) {
        return hiDict[trimmed];
      }
      if (hiDict[text]) {
        return hiDict[text];
      }

      return text;
    }

    // GPS Precision Location Fetcher
    function fetchGPS() {
      if (!navigator.geolocation) {
        currentGPS.error = t('Geolocation is not supported on this device.');
        return;
      }
      currentGPS.fetching = true;
      currentGPS.error = null;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          currentGPS.latitude = pos.coords.latitude;
          currentGPS.longitude = pos.coords.longitude;
          currentGPS.accuracy = pos.coords.accuracy;
          currentGPS.altitude = pos.coords.altitude;
          currentGPS.fetching = false;
          showToast('✓ GPS fix acquired (±' + (pos.coords.accuracy ? pos.coords.accuracy.toFixed(1) : '0') + 'm)', 'success');
        },
        (err) => {
          currentGPS.fetching = false;
          currentGPS.error = err.message || 'Unable to acquire GPS fix. Please ensure location permissions are enabled.';
          showToast('GPS Error: ' + currentGPS.error, 'error');
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    }

    // Photo Handler with Automatic Canvas Compression
    async function handlePhotoUpload(questionCode, event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const compressedDataUrl = await compressImage(file, currentGPS);
        formData[questionCode] = compressedDataUrl;
        showToast('✓ Photo compressed with GPS watermark', 'success');
      } catch (err) {
        alert('Image compression error: ' + err.message);
      }
    }

    function removePhoto(questionCode) {
      delete formData[questionCode];
    }

    // Section Computation & Navigation
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
        // Conditional Skip Logic
        if (q.conditional_logic) {
          const depField = q.conditional_logic.depends_on;
          const targetVal = q.conditional_logic.equals;
          if (depField && targetVal !== undefined) {
            if (formData[depField] !== targetVal) return false;
          }
        }
        return true;
      });
    });

    // Section Completion Calculator
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
          if (val === undefined || val === null || val === '') {
            if (q.field_type === 'GPS Location' && !currentGPS.latitude) return false;
            return false;
          }
        }
      }
      return true;
    }

    function goToSection(idx) {
      if (idx >= 0 && idx < sections.value.length) {
        activeSectionIndex.value = idx;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    function nextSection() {
      if (activeSectionIndex.value < (sections.value.length - 1)) {
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

    // Touch Signature Pad Implementation
    function initSignaturePad(canvasEl, questionCode) {
      if (!canvasEl) return;
      const ctx = canvasEl.getContext('2d');
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      
      const rect = canvasEl.getBoundingClientRect();
      canvasEl.width = rect.width * ratio;
      canvasEl.height = rect.height * ratio;
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#1e1b4b';

      let drawing = false;

      function getPos(e) {
        const r = canvasEl.getBoundingClientRect();
        if (e.touches && e.touches[0]) {
          return {
            x: e.touches[0].clientX - r.left,
            y: e.touches[0].clientY - r.top
          };
        }
        return {
          x: e.clientX - r.left,
          y: e.clientY - r.top
        };
      }

      function startDraw(e) {
        e.preventDefault();
        drawing = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      }

      function moveDraw(e) {
        if (!drawing) return;
        e.preventDefault();
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }

      function endDraw(e) {
        if (!drawing) return;
        e.preventDefault();
        drawing = false;
        formData[questionCode] = canvasEl.toDataURL('image/png');
        showToast('✓ Signature recorded', 'success');
      }

      canvasEl.addEventListener('touchstart', startDraw, { passive: false });
      canvasEl.addEventListener('touchmove', moveDraw, { passive: false });
      canvasEl.addEventListener('touchend', endDraw, { passive: false });
      canvasEl.addEventListener('touchcancel', endDraw, { passive: false });

      // Desktop mouse fallback
      canvasEl.addEventListener('mousedown', startDraw);
      canvasEl.addEventListener('mousemove', moveDraw);
      canvasEl.addEventListener('mouseup', endDraw);
      canvasEl.addEventListener('mouseleave', endDraw);

      signaturePads[questionCode] = { canvas: canvasEl, ctx: ctx, ratio: ratio };
    }

    function clearSignature(questionCode) {
      const pad = signaturePads[questionCode];
      if (pad && pad.canvas) {
        pad.ctx.clearRect(0, 0, pad.canvas.width, pad.canvas.height);
      }
      delete formData[questionCode];
      showToast('Signature cleared', 'info');
    }

    // ==========================================================
    // CORE REQUIREMENT: DEDICATED UNBLOCKED "SAVE OFFLINE" ACTION
    // ==========================================================
    async function saveOffline(isFinalSubmission = false) {
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
        formDataRaw: { ...formData },
        retry_count: 0
      };

      // Guaranteed ACID local write to Dexie WAL
      await db.wal.put(submission);
      await loadWALFromDB();

      const timeStr = new Date().toLocaleTimeString();
      if (isFinalSubmission) {
        showToast(`✓ Survey Completed & Saved to Offline Storage at ${timeStr}`, 'success');
        currentView.value = 'queue';
        if (isOnline.value) {
          autoSync();
        }
      } else {
        showToast(`💾 Draft Saved to Offline Device Storage at ${timeStr}`, 'success');
      }
    }

    // Submit & Commit to Write-Ahead Log (WAL) with validation
    async function commitToWAL() {
      // Validate mandatory fields across all sections
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
          if (q.field_type === 'GPS Location') {
            if (!currentGPS.latitude) missingMandatory.push(t(q.label_en) + ' (GPS Location)');
          } else if (val === undefined || val === null || val === '') {
            missingMandatory.push(t(q.label_en));
          }
        }
      }

      if (missingMandatory.length > 0) {
        const msg = currentLang.value === 'hi' 
          ? 'कृपया इन आवश्यक प्रश्नों को पूरा करें:\n• ' + missingMandatory.join('\n• ') + '\n\n(आप "💾 ऑफलाइन सेव करें" बटन दबाकर ड्राफ्ट के रूप में भी सुरक्षित कर सकते हैं)'
          : 'Please complete the following required questions:\n• ' + missingMandatory.join('\n• ') + '\n\n(Tip: You can use "💾 Save Offline" to save as a draft anytime)';
        alert(msg);
        return;
      }

      await saveOffline(true);
    }

    // Resume an offline draft from Queue
    async function resumeDraft(sub) {
      const tmpl = templates.value.find(t => t.name === sub.survey_template);
      if (!tmpl) {
        alert('Associated survey template not found in local storage.');
        return;
      }
      await startSurvey(tmpl, sub);
    }

    // Delete WAL item
    async function deleteWALItem(idempotency_key) {
      if (confirm('Delete this record from local device storage?')) {
        await db.wal.delete(idempotency_key);
        await loadWALFromDB();
        showToast('Item removed from local storage', 'info');
      }
    }

    // Idempotent Sync Handler
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

          const resp = await fetch('/api/method/omniservey.api.sync.batch_push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ submissions: [payload] })
          });

          if (resp.ok) {
            const data = await resp.json();
            const res = (data.message && data.message.results && data.message.results[0]) || {};
            if (res.status === 'SUCCESS' || res.status === 'DUPLICATE_SKIPPED') {
              sub.status = 'SYNCED';
              sub.synced_at = new Date().toISOString();
              sub.server_doc_name = res.doc_name;
              await db.wal.put(sub);
            } else {
              sub.retry_count = (sub.retry_count || 0) + 1;
              sub.last_error = res.error || 'Sync rejected';
              await db.wal.put(sub);
            }
          }
        }
        await loadWALFromDB();
      } catch (err) {
        console.warn('[Sync] Background sync retry scheduled:', err);
      } finally {
        isSyncing.value = false;
      }
    }

    // Emergency JSON Export
    function exportEmergencyBackup() {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(walSubmissions.value, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `OmniServey_WAL_Backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Downloaded emergency JSON backup', 'success');
    }

    // Grid Question Row Manager
    function addGridRow(qCode) {
      if (!formData[qCode]) formData[qCode] = [];
      formData[qCode].push({ item_name: '', quantity: 1, unit_value: 0 });
    }

    function removeGridRow(qCode, idx) {
      if (formData[qCode]) formData[qCode].splice(idx, 1);
    }

    return {
      currentView,
      isOnline,
      isSyncing,
      storagePersisted,
      currentLang,
      languages,
      currentUser,
      permissionStatus,
      templates,
      filteredTemplates,
      templateSearchQuery,
      activeTemplate,
      activeSectionIndex,
      sections,
      activeSection,
      activeQuestions,
      formData,
      currentGPS,
      currentUUID,
      walSubmissions,
      pendingCount,
      offlineDraftCount,
      toastMessage,
      toastType,
      startSurvey,
      resumeDraft,
      deleteWALItem,
      goToSection,
      nextSection,
      prevSection,
      isSectionComplete,
      saveOffline,
      commitToWAL,
      autoSync,
      exportEmergencyBackup,
      fetchGPS,
      handlePhotoUpload,
      removePhoto,
      initSignaturePad,
      clearSignature,
      addGridRow,
      removeGridRow,
      fetchServerTemplates,
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
                <span class="text-[10px] font-normal px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">v16</span>
              </div>
              <div class="text-[10px] text-slate-400 font-mono truncate max-w-[120px] sm:max-w-none">
                {{ currentUser.full_name }}
              </div>
            </div>
          </div>

          <!-- Network & Sync Status Header Pills -->
          <div class="flex items-center space-x-2">
            
            <!-- Dedicated Save Offline Quick Button in Header when in Form -->
            <button v-if="currentView === 'form'" @click="saveOffline(false)" 
                    class="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-500 flex items-center space-x-1 touch-press shadow-sm">
              <span>💾</span>
              <span class="hidden sm:inline">{{ t('Save Offline') }}</span>
            </button>

            <!-- Online / Offline Chip -->
            <div :class="isOnline ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' : 'bg-amber-950/80 text-amber-400 border-amber-800'"
                 class="text-[11px] px-2.5 py-1 rounded-full border flex items-center font-medium">
              <span :class="isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'" class="w-1.5 h-1.5 rounded-full mr-1.5"></span>
              {{ isOnline ? t('Online') : t('Offline') }}
            </div>

            <!-- Language Switcher Dropdown (English / हिंदी) -->
            <select v-model="currentLang" 
                    class="text-xs font-bold bg-indigo-950 border border-indigo-700 text-indigo-200 rounded-lg px-2.5 py-1 outline-none shadow-sm focus:ring-2 focus:ring-indigo-400">
              <option v-for="l in languages" :key="l.code" :value="l.code">{{ l.label }}</option>
            </select>
          </div>
        </div>
      </header>

      <!-- 2. MAIN CONTAINER -->
      <main class="flex-1 max-w-3xl w-full mx-auto p-3 sm:p-5">

        <!-- ========================================== -->
        <!-- VIEW 1: TEMPLATES DIRECTORY (With RBAC)   -->
        <!-- ========================================== -->
        <div v-if="currentView === 'templates'" class="space-y-3.5">
          
          <!-- Welcome & User Role Card -->
          <div class="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-4 text-white shadow-sm border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-xs text-indigo-300 font-medium">{{ t('Active Session') }}</div>
              <div class="font-bold text-sm text-white mt-0.5">{{ currentUser.full_name }}</div>
              <div class="flex flex-wrap gap-1 mt-1.5">
                <span v-for="r in currentUser.roles.slice(0, 3)" :key="r" class="text-[10px] bg-indigo-900/60 text-indigo-200 px-2 py-0.5 rounded-md border border-indigo-700/50">
                  {{ r }}
                </span>
                <span v-if="currentUser.roles.length > 3" class="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                  +{{ currentUser.roles.length - 3 }}
                </span>
              </div>
            </div>
            
            <button @click="fetchServerTemplates" :disabled="isSyncing" 
                    class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-xl touch-press shadow flex items-center space-x-1">
              <span>{{ isSyncing ? '...' : ('⟳ ' + t('Refresh')) }}</span>
            </button>
          </div>

          <!-- Template Search & Filter -->
          <div v-if="templates.length > 0" class="relative">
            <input type="text" v-model="templateSearchQuery" :placeholder="t('Search templates by title or category...')" 
                   class="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-200 bg-white text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none">
            <span class="absolute left-3 top-3 text-slate-400 text-xs">🔍</span>
          </div>

          <!-- Case A: No Templates Due to Permission (Strict RBAC Guard) -->
          <div v-if="templates.length === 0 && permissionStatus === 'restricted'" 
               class="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center text-2xl">
              🔒
            </div>
            <div>
              <h3 class="font-bold text-slate-800 text-base">{{ t('No Accessible Survey Templates') }}</h3>
              <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {{ t('Your account') }} <span class="font-semibold text-slate-700">({{ currentUser.user }})</span> {{ t('does not currently have permission to access any published templates.') }}
              </p>
            </div>
            <div class="pt-2">
              <button @click="fetchServerTemplates" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow touch-press">
                {{ t('Re-Check Permissions') }}
              </button>
            </div>
          </div>

          <!-- Case B: Templates List (Permitted & Offline-Ready) -->
          <div v-else-if="filteredTemplates.length > 0" class="space-y-3">
            <div v-for="tmpl in filteredTemplates" :key="tmpl.name" 
                 class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    v{{ tmpl.version }} · {{ tmpl.project || 'OmniServey' }}
                  </span>
                  <span class="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {{ t('Offline Ready ✓') }}
                  </span>
                </div>

                <h3 class="font-bold text-slate-900 mt-2.5 text-base sm:text-lg leading-snug">
                  {{ t(tmpl.title) }}
                </h3>

                <div class="flex items-center space-x-3 text-xs text-slate-500 mt-2">
                  <span>{{ (tmpl.schema && tmpl.schema.sections) ? tmpl.schema.sections.length : 0 }} {{ t('Sections') }}</span>
                  <span>•</span>
                  <span>{{ (tmpl.schema && tmpl.schema.questions) ? tmpl.schema.questions.length : 0 }} {{ t('Questions') }}</span>
                  <span v-if="tmpl.target_category">•</span>
                  <span v-if="tmpl.target_category" class="text-slate-600 font-medium">{{ t(tmpl.target_category) }}</span>
                </div>
              </div>

              <!-- Start Button (Finger-friendly >=48px) -->
              <button @click="startSurvey(tmpl)" 
                      class="mt-4 w-full min-h-[48px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-sm touch-press flex items-center justify-center space-x-2">
                <span>{{ t('Start Survey Form') }}</span>
                <span>→</span>
              </button>
            </div>
          </div>

          <!-- Zero-Loss Storage Footer Card -->
          <div class="bg-slate-900 text-slate-300 p-4 rounded-2xl text-xs flex items-center justify-between shadow-sm border border-slate-800">
            <div>
              <div class="font-bold text-white flex items-center space-x-1.5">
                <span>{{ t('Write-Ahead Log (WAL)') }}</span>
              </div>
              <div class="text-[11px] text-slate-400 mt-0.5">
                <span>{{ walSubmissions.length }} submissions ({{ pendingCount }} pending sync)</span>
              </div>
            </div>
            <button @click="exportEmergencyBackup" class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 text-xs touch-press">
              ↓ {{ t('Backup') }}
            </button>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- VIEW 2: DYNAMIC FORM ENGINE (Phone-First) -->
        <!-- ========================================== -->
        <div v-if="currentView === 'form'" class="space-y-3 pb-28">

          <!-- A. Survey Progress Header -->
          <div class="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-slate-200">
            <div class="flex items-center justify-between mb-2">
              <button @click="currentView = 'templates'" class="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center space-x-1 touch-press">
                <span>{{ t('Exit Form') }}</span>
              </button>
              
              <div class="flex items-center space-x-2">
                <!-- Direct Save Offline Button at top -->
                <button type="button" @click="saveOffline(false)" 
                        class="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold px-2.5 py-1 rounded-lg touch-press flex items-center space-x-1">
                  <span>💾</span>
                  <span>{{ t('Save Offline') }}</span>
                </button>
                <div class="text-xs font-bold text-indigo-600">
                  {{ t('Step') }} {{ activeSectionIndex + 1 }} {{ t('of') }} {{ sections.length }}
                </div>
              </div>
            </div>

            <h2 class="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {{ t(activeTemplate.title) }}
            </h2>

            <!-- Micro Progress Line -->
            <div class="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div class="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                   :style="{ width: (((activeSectionIndex + 1) / (sections.length || 1)) * 100) + '%' }"></div>
            </div>
          </div>

          <!-- B. Horizontal Section Pill Carousel (Top Sticky Navigation) -->
          <div class="overflow-x-auto no-scrollbar py-1 -mx-1 px-1 flex space-x-2">
            <button v-for="(sec, idx) in sections" :key="sec.section_code"
                    @click="goToSection(idx)"
                    :class="activeSectionIndex === idx 
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/30' 
                      : (isSectionComplete(sec) ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-white text-slate-700 border border-slate-200')"
                    class="flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 touch-press">
              <span v-if="isSectionComplete(sec)" class="text-emerald-500">✓</span>
              <span>{{ t(sec.section_title) }}</span>
            </button>
          </div>

          <!-- C. Current Section Heading Card -->
          <div class="bg-indigo-50/70 border border-indigo-100 p-3 rounded-xl flex items-center justify-between">
            <div class="text-xs font-bold text-indigo-900">
              {{ activeSection ? t(activeSection.section_title) : '' }}
            </div>
            <div class="text-[11px] text-indigo-600 font-medium">
              {{ activeQuestions.length }} {{ t('Questions') }}
            </div>
          </div>

          <!-- D. Dynamic Questions Container -->
          <div class="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            
            <div v-for="(q, qIndex) in activeQuestions" :key="q.question_code" 
                 class="space-y-2 border-b border-slate-100 pb-5 last:border-0 last:pb-0">
              
              <!-- Question Label & Mandatory Asterisk -->
              <label class="block text-sm sm:text-base font-bold text-slate-900 leading-snug">
                <span class="text-indigo-600 font-mono text-xs mr-1">Q{{ qIndex + 1 }}.</span>
                {{ t(q.label_en, q.question_code) }}
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

              <!-- TYPE 3: SINGLE CHOICE (Touch Cards >=48px) -->
              <div v-if="q.field_type === 'Single Choice (Radio)'" class="space-y-2 pt-1">
                <div v-for="opt in (q.options || ['Yes', 'No'])" :key="opt"
                     @click="formData[q.question_code] = opt"
                     :class="formData[q.question_code] === opt 
                       ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/20 font-semibold' 
                       : 'border-slate-200 bg-slate-50/40 text-slate-800 hover:bg-slate-100/60'"
                     class="min-h-[50px] flex items-center justify-between p-3.5 rounded-xl border cursor-pointer touch-press transition-all">
                  <span class="text-sm">{{ t(opt) }}</span>
                  <div :class="formData[q.question_code] === opt ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white'"
                       class="w-5 h-5 rounded-full border flex items-center justify-center transition-all">
                    <span v-if="formData[q.question_code] === opt" class="w-2 h-2 rounded-full bg-white"></span>
                  </div>
                </div>
              </div>

              <!-- TYPE 4: GPS LOCATION WITH PRECISION RADAR METER -->
              <div v-if="q.field_type === 'GPS Location'" class="space-y-2.5">
                <button type="button" @click="fetchGPS" :disabled="currentGPS.fetching" 
                        class="w-full min-h-[48px] bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center space-x-2 touch-press shadow-sm">
                  <span v-if="currentGPS.fetching" class="animate-spin text-sm">⟳</span>
                  <span v-else class="text-sm">📍</span>
                  <span>{{ currentGPS.fetching ? 'Locking Satellite GPS...' : t('Capture GPS Coordinates') }}</span>
                </button>

                <!-- GPS Acquired Card -->
                <div v-if="currentGPS.latitude" class="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-emerald-900 flex items-center">
                      <span class="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                      {{ t('GPS Fix Acquired ✓') }}
                    </span>
                    <span :class="currentGPS.accuracy <= 15 ? 'bg-emerald-200 text-emerald-900' : (currentGPS.accuracy <= 30 ? 'bg-sky-200 text-sky-900' : 'bg-amber-200 text-amber-900')"
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

              <!-- TYPE 5: PHOTO CAPTURE WITH AUTO-COMPRESSOR & WATERMARK -->
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
                    ✓ {{ t('Compressed (<150KB) with GPS & Timestamp Watermark') }}
                  </div>
                </div>
              </div>

              <!-- TYPE 6: TOUCH SIGNATURE PAD (HTML5 Canvas) -->
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

              <!-- TYPE 7: DYNAMIC GRID (Repeatable Row Table) -->
              <div v-if="q.field_type === 'Dynamic Grid'" class="space-y-3">
                <div v-for="(row, rIdx) in (formData[q.question_code] || [])" :key="rIdx" 
                     class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-700">{{ t('Row') }} #{{ rIdx + 1 }}</span>
                    <button type="button" @click="removeGridRow(q.question_code, rIdx)" class="text-rose-600 text-xs font-bold">
                      ✕ {{ t('Delete') }}
                    </button>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <input type="text" v-model="row.item_name" placeholder="Item Name" 
                           class="col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none">
                    <input type="number" v-model="row.quantity" placeholder="Qty" 
                           class="col-span-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none">
                  </div>
                </div>

                <button type="button" @click="addGridRow(q.question_code)" 
                        class="w-full min-h-[44px] bg-indigo-50 text-indigo-600 font-bold text-xs py-2 rounded-xl border border-indigo-100 touch-press">
                  {{ t('+ Add Item Row') }}
                </button>
              </div>

            </div>

          </div>

          <!-- FIXED BOTTOM ACTION BAR WITH DEDICATED UNBLOCKED "SAVE OFFLINE" BUTTON -->
          <div class="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-safe">
            <div class="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between space-x-2">
              
              <!-- 1. Previous Button -->
              <button type="button" @click="prevSection" :disabled="activeSectionIndex === 0"
                      class="px-3 py-2.5 min-h-[48px] rounded-xl border border-slate-300 text-xs font-bold text-slate-700 disabled:opacity-30 touch-press">
                {{ t('Previous') }}
              </button>

              <!-- 2. DEDICATED "SAVE OFFLINE" BUTTON (Always Active & Clickable on ANY page) -->
              <button type="button" @click="saveOffline(false)" 
                      class="flex-1 min-h-[48px] px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow touch-press flex items-center justify-center space-x-1">
                <span>💾</span>
                <span>{{ t('Save Offline') }}</span>
              </button>

              <!-- 3. Next or Submit Button -->
              <button v-if="activeSectionIndex < (sections.length - 1)" 
                      type="button" @click="nextSection"
                      class="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow touch-press flex items-center justify-center space-x-1">
                <span>{{ t('Next') }}</span>
              </button>

              <button v-else 
                      type="button" @click="commitToWAL"
                      class="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md touch-press flex items-center justify-center space-x-1">
                <span>{{ t('Submit Survey') }}</span>
              </button>
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
              {{ t('No survey submissions recorded yet. Start a survey to capture data offline!') }}
            </div>

            <div v-else class="space-y-2.5">
              <div v-for="sub in walSubmissions" :key="sub.idempotency_key" 
                   class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div class="flex items-center space-x-2">
                    <span :class="sub.status === 'SYNCED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : (sub.status === 'DRAFT_OFFLINE' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-700 border-amber-200')"
                          class="text-[10px] font-bold px-2 py-0.5 rounded-full border">
                      {{ sub.status === 'SYNCED' ? t('Synced ✓') : (sub.status === 'DRAFT_OFFLINE' ? t('Draft Saved Offline') : t('Pending Sync')) }}
                    </span>
                    <span class="text-[10px] text-slate-400 font-mono">{{ sub.idempotency_key.slice(0, 8) }}...</span>
                  </div>
                  <div class="font-bold text-slate-900 text-sm mt-1">{{ t(sub.survey_template) }}</div>
                  <div class="text-[11px] text-slate-500 mt-0.5">{{ new Date(sub.captured_at_local).toLocaleString() }}</div>
                </div>

                <div class="text-right space-y-1">
                  <div v-if="sub.server_doc_name" class="text-[10px] font-mono text-indigo-600 font-bold">{{ sub.server_doc_name }}</div>
                  <div class="text-xs text-slate-500">{{ sub.items ? sub.items.length : 0 }} Answers</div>
                  
                  <!-- Resume Button for offline drafts -->
                  <div class="pt-1 flex items-center justify-end space-x-2">
                    <button @click="resumeDraft(sub)" 
                            class="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-lg border border-indigo-200 touch-press">
                      {{ t('Resume Survey →') }}
                    </button>
                    <button @click="deleteWALItem(sub.idempotency_key)" 
                            class="text-xs text-rose-500 hover:text-rose-700 px-1 font-bold">
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- VIEW 4: DIAGNOSTICS & SYSTEM STATUS       -->
        <!-- ========================================== -->
        <div v-if="currentView === 'diagnostics'" class="space-y-4">
          <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h2 class="text-base font-bold text-slate-900">{{ t('System') }}</h2>
            
            <div class="divide-y divide-slate-100 text-xs">
              <div class="py-2.5 flex items-center justify-between">
                <span class="text-slate-500">IndexedDB Persistent Storage</span>
                <span :class="storagePersisted ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'">
                  {{ storagePersisted ? 'Active (Protected)' : 'Best Effort' }}
                </span>
              </div>
              <div class="py-2.5 flex items-center justify-between">
                <span class="text-slate-500">Active User</span>
                <span class="font-bold text-slate-900">{{ currentUser.user }}</span>
              </div>
              <div class="py-2.5 flex items-center justify-between">
                <span class="text-slate-500">Cached Templates Count</span>
                <span class="font-bold text-slate-900">{{ templates.length }}</span>
              </div>
              <div class="py-2.5 flex items-center justify-between">
                <span class="text-slate-500">Pending Sync Items</span>
                <span class="font-bold text-amber-600">{{ pendingCount }}</span>
              </div>
              <div class="py-2.5 flex items-center justify-between">
                <span class="text-slate-500">Offline Drafts</span>
                <span class="font-bold text-indigo-600">{{ offlineDraftCount }}</span>
              </div>
            </div>

            <div class="pt-2">
              <button @click="exportEmergencyBackup" class="w-full min-h-[48px] bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl shadow-sm touch-press">
                ↓ Download Emergency JSON Backup
              </button>
            </div>
          </div>
        </div>

      </main>

      <!-- 3. MOBILE BOTTOM NAVIGATION DOCK (Hidden when filling Form) -->
      <nav v-if="currentView !== 'form'" class="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-safe">
        <div class="grid grid-cols-3 py-1 text-center">
          
          <button @click="currentView = 'templates'" 
                  :class="currentView === 'templates' ? 'text-indigo-600 font-bold' : 'text-slate-500'"
                  class="flex flex-col items-center py-2 text-[10px] touch-press">
            <span class="text-lg leading-none mb-1">📋</span>
            <span>{{ t('Surveys') }}</span>
          </button>

          <button @click="currentView = 'queue'" 
                  :class="currentView === 'queue' ? 'text-indigo-600 font-bold' : 'text-slate-500'"
                  class="flex flex-col items-center py-2 text-[10px] relative touch-press">
            <span class="text-lg leading-none mb-1">⚡</span>
            <span>{{ t('WAL Queue') }}</span>
            <span v-if="pendingCount > 0 || offlineDraftCount > 0" class="absolute top-1 right-6 bg-amber-500 text-slate-950 font-bold text-[9px] px-1.5 rounded-full">
              {{ pendingCount + offlineDraftCount }}
            </span>
          </button>

          <button @click="currentView = 'diagnostics'" 
                  :class="currentView === 'diagnostics' ? 'text-indigo-600 font-bold' : 'text-slate-500'"
                  class="flex flex-col items-center py-2 text-[10px] touch-press">
            <span class="text-lg leading-none mb-1">⚙️</span>
            <span>{{ t('System') }}</span>
          </button>

        </div>
      </nav>

    </div>
  `
});

app.mount('#app');
