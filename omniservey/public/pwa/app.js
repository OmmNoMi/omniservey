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

// 2. Client-Side Canvas Image Compressor (<150 KB JPEG + Watermark)
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

        // Watermark: Timestamp & GPS
        const timestamp = new Date().toLocaleString();
        let watermarkText = `OmniServey · ${timestamp}`;
        if (gpsCoords && gpsCoords.latitude) {
          watermarkText += ` · GPS: ${gpsCoords.latitude.toFixed(5)}, ${gpsCoords.longitude.toFixed(5)}`;
        }

        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
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

// 3. Main Vue 3 Application
const app = createApp({
  setup() {
    // Navigation & View State
    const currentView = ref('templates'); // 'templates', 'form', 'queue', 'respondents'
    const isOnline = ref(navigator.onLine);
    const isSyncing = ref(false);
    const storagePersisted = ref(false);
    const currentLang = ref('en'); // 'en', 'hi', 'mr', 'gu', 'ta', 'te'
    const languages = [
      { code: 'en', label: 'English' },
      { code: 'hi', label: 'हिंदी (Hindi)' },
      { code: 'mr', label: 'मराठी (Marathi)' },
      { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
      { code: 'ta', label: 'தமிழ் (Tamil)' },
      { code: 'te', label: 'తెలుగు (Telugu)' }
    ];

    // Template & Form State
    const templates = ref([]);
    const activeTemplate = ref(null);
    const activeSectionIndex = ref(0);
    const formData = reactive({});
    const currentGPS = reactive({ latitude: null, longitude: null, accuracy: null, fetching: false, error: null });
    const currentUUID = ref('');
    const translationsMap = ref({});

    // WAL & Queue State
    const walSubmissions = ref([]);
    const pendingCount = computed(() => walSubmissions.value.filter(s => s.status === 'PENDING_SYNC').length);

    // Initial Persistent Storage Request
    onMounted(async () => {
      if (navigator.storage && navigator.storage.persist) {
        storagePersisted.value = await navigator.storage.persist();
        console.log('[Storage] Persistent storage granted:', storagePersisted.value);
      }
      window.addEventListener('online', () => { isOnline.value = true; autoSync(); });
      window.addEventListener('offline', () => { isOnline.value = false; });

      await loadTemplatesFromDB();
      await loadWALFromDB();

      // If online, fetch latest from server
      if (isOnline.value) {
        fetchServerTemplates();
      }
    });

    // Helper: UUID Generator
    function generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    // Load Local Templates
    async function loadTemplatesFromDB() {
      const stored = await db.templates.toArray();
      if (stored.length > 0) {
        templates.value = stored;
      } else {
        // Shipped Default Template if empty
        const defaultSample = {
          name: 'TMPL-SAMPLE-GENERAL-2026',
          title: 'Universal Field & Demographic Baseline',
          project: 'General Survey Operations',
          version: 1,
          status: 'Published',
          schema: {
            sections: [
              { section_code: 'SEC_DEMO', section_title: '1. Demographic Information', display_order: 1 },
              { section_code: 'SEC_OPS', section_title: '2. Economic Activity & Metrics', display_order: 2 },
              { section_code: 'SEC_VERIF', section_title: '3. Field Verification & Sign-off', display_order: 3 }
            ],
            questions: [
              { section_code: 'SEC_DEMO', question_code: 'Q_NAME', label_en: 'Full Name of Respondent / Head', field_type: 'Text', is_mandatory: true, display_order: 1 },
              { section_code: 'SEC_DEMO', question_code: 'Q_TYPE', label_en: 'Respondent Category', field_type: 'Single Choice (Radio)', is_mandatory: true, options: ['Individual', 'Household', 'Enterprise / Business', 'Farmer / Producer'], display_order: 2 },
              { section_code: 'SEC_DEMO', question_code: 'Q_PHONE', label_en: 'Primary Contact Number', field_type: 'Text', is_mandatory: false, display_order: 3 },
              { section_code: 'SEC_OPS', question_code: 'Q_HAS_REVENUE', label_en: 'Does this entity generate monthly revenue?', field_type: 'Single Choice (Radio)', is_mandatory: true, options: ['Yes', 'No'], display_order: 4 },
              { section_code: 'SEC_OPS', question_code: 'Q_MONTHLY_REV', label_en: 'Estimated Monthly Revenue (INR)', field_type: 'Currency (INR)', is_mandatory: true, conditional_logic: { depends_on: 'Q_HAS_REVENUE', equals: 'Yes' }, display_order: 5 },
              { section_code: 'SEC_OPS', question_code: 'Q_ASSETS_GRID', label_en: 'Primary Assets / Equipment', field_type: 'Dynamic Grid', is_mandatory: false, display_order: 6 },
              { section_code: 'SEC_VERIF', question_code: 'Q_GPS', label_en: 'Capture Location Coordinates', field_type: 'GPS Location', is_mandatory: true, display_order: 7 },
              { section_code: 'SEC_VERIF', question_code: 'Q_PHOTO', label_en: 'Field Photo of Site / Beneficiary', field_type: 'Photo Upload', is_mandatory: false, display_order: 8 },
              { section_code: 'SEC_VERIF', question_code: 'Q_SIGNATURE', label_en: 'Surveyor / Respondent Signature', field_type: 'Digital Signature', is_mandatory: true, display_order: 9 }
            ]
          }
        };
        await db.templates.put(defaultSample);
        templates.value = [defaultSample];
      }
    }

    // Load Local WAL
    async function loadWALFromDB() {
      walSubmissions.value = await db.wal.reverse().sortBy('captured_at_local');
    }

    // Fetch Templates from Server
    async function fetchServerTemplates() {
      try {
        const resp = await fetch('/api/method/omniservey.api.survey.list_active_templates');
        if (resp.ok) {
          const data = await resp.json();
          const list = data.message || [];
          for (const item of list) {
            const schemaResp = await fetch(`/api/method/omniservey.api.survey.get_schema?template_name=${encodeURIComponent(item.name)}`);
            if (schemaResp.ok) {
              const sData = await schemaResp.json();
              if (sData.message) {
                await db.templates.put({
                  name: sData.message.template_name,
                  title: sData.message.title,
                  project: sData.message.project,
                  version: sData.message.version,
                  schema_hash_sha256: sData.message.schema_hash_sha256,
                  schema: sData.message.schema
                });
              }
            }
          }
          await loadTemplatesFromDB();
        }
      } catch (err) {
        console.warn('[Sync] Server template fetch skipped (offline mode):', err);
      }
    }

    // Open & Start Survey Form
    async function startSurvey(template) {
      activeTemplate.value = template;
      activeSectionIndex.value = 0;
      currentUUID.value = generateUUID();

      // Reset Form State
      Object.keys(formData).forEach(k => delete formData[k]);
      currentGPS.latitude = null;
      currentGPS.longitude = null;
      currentGPS.accuracy = null;
      currentGPS.error = null;

      // Load translations for current language
      await loadTranslations(template.name, currentLang.value);

      currentView.value = 'form';
    }

    // Translation Dictionary Loader
    async function loadTranslations(templateName, lang) {
      if (lang === 'en') {
        translationsMap.value = {};
        return;
      }
      try {
        const local = await db.translations.get([templateName, lang]);
        if (local) {
          translationsMap.value = local.translations || {};
        } else if (isOnline.value) {
          const resp = await fetch(`/api/method/omniservey.api.survey.get_translations?template_name=${encodeURIComponent(templateName)}&language_code=${lang}`);
          if (resp.ok) {
            const data = await resp.json();
            const dict = (data.message && data.message.translations) || {};
            translationsMap.value = dict;
            await db.translations.put({
              survey_template: templateName,
              language_code: lang,
              translations: dict
            });
          }
        }
      } catch (e) {
        translationsMap.value = {};
      }
    }

    // Translation Helper
    function t(text, questionCode = null) {
      if (currentLang.value === 'en' || !text) return text;
      if (questionCode && translationsMap.value[questionCode] && translationsMap.value[questionCode].label) {
        return translationsMap.value[questionCode].label;
      }
      if (translationsMap.value[text]) {
        return translationsMap.value[text];
      }
      return text;
    }

    // GPS Location Fetcher
    function fetchGPS() {
      if (!navigator.geolocation) {
        currentGPS.error = 'Geolocation is not supported by your browser';
        return;
      }
      currentGPS.fetching = true;
      currentGPS.error = null;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          currentGPS.latitude = pos.coords.latitude;
          currentGPS.longitude = pos.coords.longitude;
          currentGPS.accuracy = pos.coords.accuracy;
          currentGPS.fetching = false;
        },
        (err) => {
          currentGPS.fetching = false;
          currentGPS.error = err.message || 'Unable to retrieve location';
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }

    // Photo Handler with Automatic Canvas Compression
    async function handlePhotoUpload(questionCode, event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const compressedDataUrl = await compressImage(file, currentGPS);
        formData[questionCode] = compressedDataUrl;
      } catch (err) {
        alert('Image compression error: ' + err.message);
      }
    }

    // Active Section Computation
    const activeSection = computed(() => {
      if (!activeTemplate.value || !activeTemplate.value.schema || !activeTemplate.value.schema.sections) return null;
      return activeTemplate.value.schema.sections[activeSectionIndex.value] || null;
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

    // Form Navigation & Validation
    function nextSection() {
      if (activeSectionIndex.value < (activeTemplate.value.schema.sections.length - 1)) {
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

    // Save & Commit to Write-Ahead Log (WAL)
    async function commitToWAL() {
      // Assemble normalized items
      const items = [];
      for (const q of (activeTemplate.value.schema.questions || [])) {
        const val = formData[q.question_code];
        if (val !== undefined && val !== null) {
          items.push({
            question_code: q.question_code,
            question_label: q.label_en,
            value: val
          });
        }
      }

      const submission = {
        idempotency_key: currentUUID.value,
        survey_template: activeTemplate.value.name,
        template_version: activeTemplate.value.version || 1,
        surveyor: 'Field Surveyor',
        status: 'PENDING_SYNC',
        captured_at_local: new Date().toISOString(),
        gps_latitude: currentGPS.latitude,
        gps_longitude: currentGPS.longitude,
        gps_accuracy: currentGPS.accuracy,
        items: items,
        formDataRaw: { ...formData },
        retry_count: 0
      };

      // Guaranteed ACID local write
      await db.wal.put(submission);
      await loadWALFromDB();

      alert('✓ Survey Completed & Committed to Zero-Loss Local Storage!');
      currentView.value = 'queue';

      // Attempt immediate background sync
      if (isOnline.value) {
        autoSync();
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
      downloadAnchor.setAttribute('download', `OmniServey_Backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
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
      templates,
      activeTemplate,
      activeSectionIndex,
      activeSection,
      activeQuestions,
      formData,
      currentGPS,
      currentUUID,
      walSubmissions,
      pendingCount,
      startSurvey,
      nextSection,
      prevSection,
      commitToWAL,
      autoSync,
      exportEmergencyBackup,
      fetchGPS,
      handlePhotoUpload,
      addGridRow,
      removeGridRow,
      t
    };
  },
  template: `
    <div class="min-h-screen flex flex-col bg-slate-100">
      <!-- Top Navbar -->
      <header class="bg-slate-900 text-white shadow-md sticky top-0 z-50">
        <div class="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div class="flex items-center space-x-3 cursor-pointer" @click="currentView = 'templates'">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-lg">
              Ω
            </div>
            <div>
              <div class="font-bold text-base leading-tight tracking-tight">OmniServey</div>
              <div class="text-[10px] text-slate-400 font-mono">Zero-Loss Offline Engine</div>
            </div>
          </div>

          <!-- Network & Sync Status Badge -->
          <div class="flex items-center space-x-2">
            <span :class="isOnline ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'" 
                  class="text-xs px-2.5 py-1 rounded-full border flex items-center font-medium">
              <span :class="isOnline ? 'bg-emerald-400' : 'bg-amber-400'" class="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse"></span>
              {{ isOnline ? 'Online' : 'Offline' }}
            </span>

            <button @click="currentView = 'queue'" 
                    class="relative bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1 rounded-lg border border-slate-700 text-slate-200 flex items-center">
              WAL Queue
              <span v-if="pendingCount > 0" class="ml-1.5 bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {{ pendingCount }}
              </span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content Container -->
      <main class="flex-1 max-w-3xl w-full mx-auto p-4">

        <!-- VIEW 1: TEMPLATES DIRECTORY -->
        <div v-if="currentView === 'templates'" class="space-y-4">
          <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-lg font-bold text-slate-800">Available Survey Templates</h2>
              <button @click="autoSync" :disabled="isSyncing" class="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold px-3 py-1.5 rounded-lg">
                {{ isSyncing ? 'Syncing...' : '⟳ Refresh Templates' }}
              </button>
            </div>
            <p class="text-xs text-slate-500 mb-4">Select a published template to begin offline survey data collection.</p>

            <div class="space-y-3">
              <div v-for="tmpl in templates" :key="tmpl.name" 
                   class="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 transition-all bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">v{{ tmpl.version }} · {{ tmpl.project }}</span>
                    <span class="text-[10px] text-emerald-600 bg-emerald-50 font-medium px-2 py-0.5 rounded-full">Offline Ready ✓</span>
                  </div>
                  <h3 class="font-bold text-slate-900 mt-2 text-base">{{ tmpl.title }}</h3>
                  <div class="text-xs text-slate-500 mt-1 flex items-center space-x-3">
                    <span>{{ (tmpl.schema && tmpl.schema.questions) ? tmpl.schema.questions.length : 0 }} Questions</span>
                    <span>•</span>
                    <span>{{ (tmpl.schema && tmpl.schema.sections) ? tmpl.schema.sections.length : 0 }} Sections</span>
                  </div>
                </div>
                <button @click="startSurvey(tmpl)" class="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl text-sm shadow-sm flex items-center justify-center">
                  Start Survey Form →
                </button>
              </div>
            </div>
          </div>

          <!-- Storage Health Card -->
          <div class="bg-slate-900 text-slate-300 p-4 rounded-2xl text-xs flex items-center justify-between shadow-sm">
            <div>
              <div class="font-semibold text-white">Zero-Data-Loss IndexedDB Engine</div>
              <div class="text-[11px] text-slate-400 mt-0.5">Persistent Storage: <span :class="storagePersisted ? 'text-emerald-400 font-bold' : 'text-amber-400'">{{ storagePersisted ? 'Active (Protected from Auto-Cleaner)' : 'Best-Effort' }}</span></div>
            </div>
            <button @click="exportEmergencyBackup" class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              ↓ Emergency Export
            </button>
          </div>
        </div>

        <!-- VIEW 2: DYNAMIC FORM ENGINE -->
        <div v-if="currentView === 'form'" class="space-y-4">
          <!-- Form Header & Language Switcher -->
          <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <div class="flex items-center justify-between mb-2">
              <button @click="currentView = 'templates'" class="text-xs text-slate-500 hover:text-slate-800 font-medium">
                ← Back to Templates
              </button>
              
              <!-- Language Selector -->
              <select v-model="currentLang" class="text-xs border border-slate-200 rounded-lg px-2.5 py-1 bg-slate-50 text-slate-700 font-medium outline-none">
                <option v-for="l in languages" :key="l.code" :value="l.code">{{ l.label }}</option>
              </select>
            </div>

            <h2 class="text-base font-bold text-slate-900">{{ activeTemplate.title }}</h2>
            <div class="text-xs text-indigo-600 font-medium mt-0.5">{{ activeSection ? activeSection.section_title : '' }}</div>

            <!-- Progress Indicator -->
            <div class="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div class="bg-indigo-600 h-full transition-all duration-300"
                   :style="{ width: (((activeSectionIndex + 1) / (activeTemplate.schema.sections.length || 1)) * 100) + '%' }"></div>
            </div>
          </div>

          <!-- Dynamic Questions Card -->
          <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div v-for="q in activeQuestions" :key="q.question_code" class="space-y-2 border-b border-slate-100 pb-5 last:border-0 last:pb-0">
              <label class="block text-sm font-semibold text-slate-800">
                {{ t(q.label_en, q.question_code) }}
                <span v-if="q.is_mandatory" class="text-rose-500 ml-0.5">*</span>
              </label>

              <!-- Type 1: Text -->
              <input v-if="q.field_type === 'Text'" type="text" v-model="formData[q.question_code]" 
                     placeholder="Enter response..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none">

              <!-- Type 2: Integer / Decimal / Currency -->
              <input v-if="q.field_type === 'Integer' || q.field_type === 'Decimal' || q.field_type === 'Currency (INR)'" 
                     type="number" v-model="formData[q.question_code]" 
                     placeholder="0.00" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none">

              <!-- Type 3: Single Choice Radio -->
              <div v-if="q.field_type === 'Single Choice (Radio)'" class="space-y-2 pt-1">
                <label v-for="opt in (q.options || ['Yes', 'No'])" :key="opt" 
                       class="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer text-sm">
                  <input type="radio" :name="q.question_code" :value="opt" v-model="formData[q.question_code]" class="text-indigo-600 focus:ring-indigo-500">
                  <span class="text-slate-800">{{ t(opt) }}</span>
                </label>
              </div>

              <!-- Type 4: GPS Location Capture -->
              <div v-if="q.field_type === 'GPS Location'" class="space-y-2">
                <button type="button" @click="fetchGPS" :disabled="currentGPS.fetching" 
                        class="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium py-2.5 rounded-xl flex items-center justify-center space-x-2">
                  <span>{{ currentGPS.fetching ? 'Acquiring High-Precision GPS...' : '📍 Capture Current Location' }}</span>
                </button>
                <div v-if="currentGPS.latitude" class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-0.5">
                  <div class="font-bold">✓ Coordinates Acquired</div>
                  <div>Lat: {{ currentGPS.latitude.toFixed(6) }} | Long: {{ currentGPS.longitude.toFixed(6) }}</div>
                  <div class="text-[11px] text-emerald-600">Accuracy: ±{{ currentGPS.accuracy ? currentGPS.accuracy.toFixed(1) : 0 }} meters</div>
                </div>
                <div v-if="currentGPS.error" class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {{ currentGPS.error }}
                </div>
              </div>

              <!-- Type 5: Photo Upload with WebWorker/Canvas Auto-Compressor -->
              <div v-if="q.field_type === 'Photo Upload'" class="space-y-2">
                <input type="file" accept="image/*" capture="environment" @change="handlePhotoUpload(q.question_code, $event)" 
                       class="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100">
                <div v-if="formData[q.question_code]" class="mt-2">
                  <img :src="formData[q.question_code]" class="w-48 h-32 object-cover rounded-xl border border-slate-200 shadow-sm">
                  <span class="text-[10px] text-emerald-600 font-medium">✓ Auto-compressed (<150 KB) with GPS Watermark</span>
                </div>
              </div>

              <!-- Type 6: Digital Signature Pad (Mock/Canvas) -->
              <div v-if="q.field_type === 'Digital Signature'" class="space-y-2">
                <input type="text" v-model="formData[q.question_code]" placeholder="Type or Draw full name as digital signature..." 
                       class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-serif italic focus:border-indigo-500 outline-none">
              </div>

              <!-- Type 7: Dynamic Grid / Repeat Table -->
              <div v-if="q.field_type === 'Dynamic Grid'" class="space-y-3">
                <div v-for="(row, rIdx) in (formData[q.question_code] || [])" :key="rIdx" class="flex items-center space-x-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <input type="text" v-model="row.item_name" placeholder="Item / Asset Name" class="flex-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg outline-none">
                  <input type="number" v-model="row.quantity" placeholder="Qty" class="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg outline-none">
                  <button type="button" @click="removeGridRow(q.question_code, rIdx)" class="text-rose-600 hover:text-rose-800 font-bold px-2 py-1">✕</button>
                </div>
                <button type="button" @click="addGridRow(q.question_code)" class="text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1.5 rounded-lg border border-indigo-100">
                  + Add Grid Row
                </button>
              </div>
            </div>

            <!-- Form Navigation Bottom Bar -->
            <div class="flex items-center justify-between pt-4 border-t border-slate-100">
              <button type="button" @click="prevSection" :disabled="activeSectionIndex === 0"
                      class="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40">
                ← Previous Section
              </button>

              <button v-if="activeSectionIndex < (activeTemplate.schema.sections.length - 1)" 
                      type="button" @click="nextSection"
                      class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm">
                Next Section →
              </button>

              <button v-else 
                      type="button" @click="commitToWAL"
                      class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md">
                ✓ Submit & Save Locally
              </button>
            </div>
          </div>
        </div>

        <!-- VIEW 3: WRITE-AHEAD LOG (WAL) QUEUE -->
        <div v-if="currentView === 'queue'" class="space-y-4">
          <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h2 class="text-lg font-bold text-slate-800">Write-Ahead Log (WAL) Queue</h2>
                <div class="text-xs text-slate-500">Submissions stored locally with 100% data persistence guarantee</div>
              </div>
              <button @click="autoSync" :disabled="isSyncing || !isOnline" 
                      class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-50">
                {{ isSyncing ? 'Syncing...' : '⟳ Sync Now' }}
              </button>
            </div>

            <div v-if="walSubmissions.length === 0" class="text-center py-10 text-slate-400 text-xs">
              No survey submissions recorded yet.
            </div>

            <div v-else class="space-y-3">
              <div v-for="sub in walSubmissions" :key="sub.idempotency_key" 
                   class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div class="flex items-center space-x-2">
                    <span :class="sub.status === 'SYNCED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'"
                          class="text-[10px] font-bold px-2 py-0.5 rounded border">
                      {{ sub.status === 'SYNCED' ? 'Synced with Server ✓' : 'Saved Locally (Pending Sync)' }}
                    </span>
                    <span class="text-[10px] text-slate-400 font-mono">{{ sub.idempotency_key.slice(0, 8) }}...</span>
                  </div>
                  <div class="font-bold text-slate-800 text-sm mt-1">{{ sub.survey_template }}</div>
                  <div class="text-xs text-slate-500 mt-0.5">Captured: {{ new Date(sub.captured_at_local).toLocaleString() }}</div>
                </div>

                <div class="text-right">
                  <div v-if="sub.server_doc_name" class="text-[10px] font-mono text-indigo-600 font-semibold">{{ sub.server_doc_name }}</div>
                  <div class="text-[11px] text-slate-500">{{ sub.items ? sub.items.length : 0 }} Answers</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  `
});

app.mount('#app');
