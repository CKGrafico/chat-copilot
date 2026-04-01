# Chat Copilot — MVP Backlog
**Generated:** 2026-04-01  
**Analyst:** Saul  
**Project:** Local-first PWA for WhatsApp audio transcription + contextual reply generation

---

## M1: Foundation

### [M1] Scaffold Vite + React + TypeScript project with feature-folder architecture
**Labels:** `feature` `frontend` `p0-critical`  
**Depends on:** none  
**Why:** Establish the base project structure that all other features will build on.  
**What to build:** Initialize a Vite + React + TypeScript project with the feature-folder structure: `/features/share`, `/features/transcription`, `/features/reply`, `/features/profiles`, `/shared`, `/app`. Configure TypeScript strict mode, ESLint, and basic dev tooling. Add a simple "Hello World" landing route.  
**Acceptance criteria:**
- [ ] `npm create vite` with React + TypeScript template completed
- [ ] Feature folders created: `src/features/{share,transcription,reply,profiles}`, `src/shared`, `src/app`
- [ ] TypeScript `strict: true` configured in `tsconfig.json`
- [ ] ESLint configured with React + TS rules
- [ ] Dev server runs without errors (`npm run dev`)
- [ ] Placeholder `index.tsx` renders in browser

---

### [M1] Set up Squad framework integration skeleton
**Labels:** `feature` `ai` `p0-critical`  
**Depends on:** Scaffold Vite + React + TypeScript project with feature-folder architecture  
**Why:** Squad is mandatory for the AI pipeline; lay the foundation early so transcription/reply capabilities can plug in.  
**What to build:** Create a `/shared/squad` folder with a service layer that initializes Squad, defines capability interfaces, and exports `squad.run()`. Define empty capability stubs for `transcribeAudio` and `generateReply` with input/output TypeScript types.  
**Acceptance criteria:**
- [ ] `/shared/squad/squadService.ts` exists with Squad initialization
- [ ] Capability interfaces defined: `TranscribeAudioInput`, `TranscribeAudioOutput`, `GenerateReplyInput`, `GenerateReplyOutput`
- [ ] Stub implementations for `transcribeAudio` and `generateReply` capabilities
- [ ] `squadService.run()` method callable with type safety
- [ ] Unit test confirms Squad service initializes without error

---

### [M1] Configure PWA manifest.json with share_target
**Labels:** `feature` `storage` `p1-high`  
**Depends on:** Scaffold Vite + React + TypeScript project with feature-folder architecture  
**Why:** The PWA share target is the primary entry point for users sharing WhatsApp audios.  
**What to build:** Create `public/manifest.json` with app metadata (name, short_name, icons, theme_color, background_color) and `share_target` configuration accepting `audio/*`, `text/plain`, and relevant MIME types (`.opus`, `.ogg`, `.m4a`). Configure Vite to include the manifest. Set the share target action to `/share`.  
**Acceptance criteria:**
- [ ] `public/manifest.json` exists with complete app metadata
- [ ] `share_target` configured to accept `audio/*` and `text/plain`
- [ ] Accepted file types include `.opus`, `.ogg`, `.m4a`
- [ ] Share target action URL set to `/share`
- [ ] Manifest linked in `index.html` (`<link rel="manifest">`)
- [ ] Lighthouse PWA audit shows manifest is valid

---

### [M1] Implement basic service worker for asset caching
**Labels:** `feature` `storage` `p1-high`  
**Depends on:** Scaffold Vite + React + TypeScript project with feature-folder architecture  
**Why:** Offline-first architecture requires a service worker to cache app assets and models.  
**What to build:** Create a service worker (`public/sw.js`) that caches static assets (HTML, CSS, JS) using a cache-first strategy. Register the service worker in the app entry point. For now, skip model caching (that's a separate issue). Use Workbox or plain SW API.  
**Acceptance criteria:**
- [ ] `public/sw.js` exists with install, activate, fetch event handlers
- [ ] Static assets cached on install (cache name versioned)
- [ ] Fetch handler serves cached assets when offline
- [ ] Service worker registered in `src/main.tsx`
- [ ] Browser DevTools → Application shows active service worker
- [ ] App loads offline after first visit

---

### [M1] Add TypeScript types for core domain models (Audio, Profile, Session)
**Labels:** `feature` `frontend` `p2-normal`  
**Depends on:** Scaffold Vite + React + TypeScript project with feature-folder architecture  
**Why:** Shared types prevent duplication and enforce consistency across features.  
**What to build:** Create `/shared/types` with TypeScript interfaces for `AudioFile`, `Profile`, `TranscriptionSession`, `ReplyCandidate`. Include fields per the spec (e.g., Profile: id, name, color, language, instructions).  
**Acceptance criteria:**
- [ ] `/shared/types/audio.ts` defines `AudioFile` interface
- [ ] `/shared/types/profile.ts` defines `Profile` interface (id, name, color, language, instructions)
- [ ] `/shared/types/session.ts` defines `TranscriptionSession` and `ReplyCandidate` interfaces
- [ ] All interfaces exported from `/shared/types/index.ts`
- [ ] No `any` types used

---

## M2: Ingestion

### [M2] Create /share route to receive shared files
**Labels:** `feature` `frontend` `p0-critical`  
**Depends on:** Configure PWA manifest.json with share_target  
**Why:** Users need a landing page when they share audio from WhatsApp to the PWA.  
**What to build:** Add a `/share` route in the app that reads files from URL params or FormData (depending on share target implementation). Display a loading indicator. Parse shared data (audio files + optional text). Route to the transcription flow.  
**Acceptance criteria:**
- [ ] `/share` route exists in React Router
- [ ] Route reads shared files from FormData or URL params
- [ ] Handles both audio files and text simultaneously
- [ ] Loading UI displays while parsing
- [ ] Successfully shared files logged to console (validation)
- [ ] Unsupported file types show user-friendly error

---

### [M2] Implement file validation for WhatsApp audio formats
**Labels:** `feature` `systems` `p1-high`  
**Depends on:** Create /share route to receive shared files  
**Why:** Only specific audio formats (.opus, .ogg, .m4a) are supported; validate early to prevent downstream errors.  
**What to build:** Create a utility in `/shared/utils` that validates file MIME type and extension. Support `.opus`, `.ogg`, `.m4a`, and fallback generic `audio/*`. Check file size limits (e.g., max 50MB for mobile). Return validation result with error messages.  
**Acceptance criteria:**
- [ ] `/shared/utils/validateAudio.ts` exists
- [ ] Validates MIME type against allowlist (audio/opus, audio/ogg, audio/m4a, audio/*)
- [ ] Validates file extension (.opus, .ogg, .m4a)
- [ ] Checks file size limit (configurable, default 50MB)
- [ ] Returns structured validation result (`{ valid: boolean, error?: string }`)
- [ ] Unit tests cover all supported formats + edge cases

---

### [M2] Build UI component for file upload/drop (fallback to share target)
**Labels:** `feature` `frontend` `p2-normal`  
**Depends on:** Create /share route to receive shared files  
**Why:** Not all users arrive via share target (e.g., desktop, direct URL); provide a manual upload option.  
**What to build:** Create a `FileUploadZone` component in `/features/share` that supports drag-and-drop and file input. Style mobile-first. Reuse validation logic from the previous issue. On valid upload, pass file to the same handler as share target.  
**Acceptance criteria:**
- [ ] `FileUploadZone.tsx` component created
- [ ] Supports drag-and-drop for audio files
- [ ] Supports click-to-browse file input
- [ ] Reuses `validateAudio` utility
- [ ] Shows error state for invalid files
- [ ] Mobile-optimized (large touch target)
- [ ] Accessible (keyboard navigation, ARIA labels)

---

## M3: Audio Pipeline

### [M3] Integrate ffmpeg.wasm for audio normalization
**Labels:** `feature` `systems` `p0-critical`  
**Depends on:** none (can run in parallel with M2)  
**Why:** Whisper requires mono WAV at 16kHz; ffmpeg.wasm normalizes incoming audio to this format.  
**What to build:** Install `@ffmpeg/ffmpeg` and `@ffmpeg/core`. Create `/features/transcription/audioProcessor.ts` that loads ffmpeg.wasm, converts uploaded audio to mono WAV 16kHz, and returns an ArrayBuffer. Show loading progress via callback.  
**Acceptance criteria:**
- [ ] `@ffmpeg/ffmpeg` and `@ffmpeg/core` installed
- [ ] `audioProcessor.ts` initializes ffmpeg.wasm (loaded on first use)
- [ ] `normalizeAudio(file: File, onProgress)` function converts to mono WAV 16kHz
- [ ] Returns ArrayBuffer of normalized audio
- [ ] Progress callback fires with percentage (0-100)
- [ ] Handles errors (e.g., unsupported codec) gracefully
- [ ] Works with .opus, .ogg, .m4a test files

---

### [M3] Implement audio chunking with overlap for long files
**Labels:** `feature` `systems` `p1-high`  
**Depends on:** Integrate ffmpeg.wasm for audio normalization  
**Why:** Long audio files exceed Whisper's context window; chunking prevents truncation and memory overflow.  
**What to build:** Create a `chunkAudio` utility in `/features/transcription/audioProcessor.ts` that splits normalized audio into 20-40 second chunks with 2-second overlap. Return an array of ArrayBuffers. Use Web Audio API for slicing.  
**Acceptance criteria:**
- [ ] `chunkAudio(audioBuffer: ArrayBuffer, chunkDuration = 30, overlap = 2)` function created
- [ ] Uses Web Audio API to decode and slice audio
- [ ] Returns array of ArrayBuffers (chunks)
- [ ] Each chunk is 20-40 seconds (configurable)
- [ ] Overlap applied between consecutive chunks
- [ ] Last chunk handles remainder gracefully (no padding)
- [ ] Unit test with 2-minute sample audio confirms chunks

---

### [M3] Add progress UI component for audio processing
**Labels:** `feature` `frontend` `p2-normal`  
**Depends on:** Integrate ffmpeg.wasm for audio normalization  
**Why:** Audio normalization can take 5-20 seconds on mobile; users need feedback.  
**What to build:** Create a `ProcessingProgressBar` component in `/shared/components` that shows a linear progress bar + status text (e.g., "Processing audio... 45%"). Accept `progress: number` and `status: string` props. Style mobile-first with smooth animations.  
**Acceptance criteria:**
- [ ] `ProcessingProgressBar.tsx` component created
- [ ] Accepts `progress` (0-100) and `status` (string) props
- [ ] Renders progress bar with smooth transitions
- [ ] Status text displayed above/below bar
- [ ] Mobile-optimized styling (large font, high contrast)
- [ ] Accessible (ARIA role="progressbar")
- [ ] Storybook story or dev route to demo component

---

## M4: Transcription

### [M4] Load Whisper Tiny model via Transformers.js
**Labels:** `feature` `ai` `p0-critical`  
**Depends on:** Set up Squad framework integration skeleton  
**Why:** Whisper Tiny is the transcription engine; must load it on-demand in the browser.  
**What to build:** Create `/features/transcription/whisperService.ts` that uses Transformers.js to load `openai/whisper-tiny` from Hugging Face. Cache the model in memory once loaded. Expose a `loadModel(onProgress)` function with download progress callback.  
**Acceptance criteria:**
- [ ] `@xenova/transformers` installed
- [ ] `whisperService.ts` loads `openai/whisper-tiny` model
- [ ] Model cached in memory after first load
- [ ] `loadModel(onProgress?)` function with progress callback (0-100)
- [ ] Model files cached by browser (check DevTools Network tab)
- [ ] Handles network errors (e.g., offline after first load)
- [ ] Test in Chrome DevTools throttled network (3G)

---

### [M4] Implement transcription capability in Squad pipeline
**Labels:** `feature` `ai` `p0-critical`  
**Depends on:** Load Whisper Tiny model via Transformers.js  
**Why:** Squad isolation keeps AI logic separate; transcription is the first capability.  
**What to build:** In `/shared/squad`, implement the `transcribeAudio` capability. Input: `{ audioChunks: ArrayBuffer[], language?: string }`. Output: `{ text: string, confidence?: number }`. Use `whisperService` to transcribe each chunk and concatenate results.  
**Acceptance criteria:**
- [ ] `transcribeAudio` capability defined in Squad service
- [ ] Input schema: `TranscribeAudioInput` with `audioChunks` and optional `language`
- [ ] Output schema: `TranscribeAudioOutput` with `text` and optional `confidence`
- [ ] Calls `whisperService.transcribe()` for each chunk
- [ ] Concatenates chunk transcriptions (dedupe overlap if needed)
- [ ] Returns combined text
- [ ] Test with real audio chunk confirms transcription

---

### [M4] Add UI for transcription progress (chunk-by-chunk)
**Labels:** `feature` `frontend` `p1-high`  
**Depends on:** Implement transcription capability in Squad pipeline  
**Why:** Transcription is slow on mobile (2-5s per chunk); show incremental progress.  
**What to build:** Create a `TranscriptionProgress` component in `/features/transcription` that displays which chunk is being transcribed (e.g., "Transcribing chunk 3 of 8...") and shows partial results as they arrive. Use the `ProcessingProgressBar` from M3.  
**Acceptance criteria:**
- [ ] `TranscriptionProgress.tsx` component created
- [ ] Shows current chunk number and total (e.g., "Chunk 3/8")
- [ ] Displays partial transcription text as chunks complete
- [ ] Reuses `ProcessingProgressBar` for chunk-level progress
- [ ] Mobile-friendly layout (scrollable text)
- [ ] Updates in real-time as Squad capability emits results

---

### [M4] Handle transcription errors and retries
**Labels:** `feature` `ai` `p2-normal`  
**Depends on:** Implement transcription capability in Squad pipeline  
**Why:** Transcription can fail (OOM, model error); provide user feedback and retry option.  
**What to build:** Wrap `squad.run("transcribeAudio")` in error handling. On failure, display error message to user with a "Retry" button. Log errors to console (or local storage for debugging). Limit retries to 3 attempts.  
**Acceptance criteria:**
- [ ] Transcription errors caught and logged
- [ ] Error UI shows user-friendly message (e.g., "Transcription failed. Retry?")
- [ ] "Retry" button re-invokes Squad capability
- [ ] Max 3 retry attempts, then show permanent error
- [ ] Different error messages for network vs. runtime errors
- [ ] Unit test simulates failure and confirms retry logic

---

## M5: Profiles

### [M5] Design Profile data model and IndexedDB schema
**Labels:** `feature` `storage` `p0-critical`  
**Depends on:** Add TypeScript types for core domain models (Audio, Profile, Session)  
**Why:** Profiles are stored locally and drive reply generation; schema must be defined before CRUD.  
**What to build:** Create `/shared/storage/profileStore.ts` that defines an IndexedDB schema for profiles (id, name, color, language, instructions). Use a library like `idb` for type-safe IndexedDB access. Initialize DB on app load.  
**Acceptance criteria:**
- [ ] `idb` library installed
- [ ] `profileStore.ts` defines IndexedDB schema (object store: `profiles`, key: `id`)
- [ ] Profile fields: `id` (string), `name` (string), `color` (string), `language` (string), `instructions` (string)
- [ ] `initDB()` function creates/upgrades DB on version change
- [ ] DB initialized on app mount (e.g., in `main.tsx`)
- [ ] DevTools → Application → IndexedDB shows `profiles` store

---

### [M5] Implement Profile CRUD operations in storage layer
**Labels:** `feature` `storage` `p0-critical`  
**Depends on:** Design Profile data model and IndexedDB schema  
**Why:** UI needs to create, read, update, and delete profiles.  
**What to build:** Add CRUD functions to `profileStore.ts`: `createProfile`, `getProfile`, `getAllProfiles`, `updateProfile`, `deleteProfile`. Each function should be async and return typed results. Handle errors (e.g., duplicate ID).  
**Acceptance criteria:**
- [ ] `createProfile(profile: Profile)` adds profile to IndexedDB
- [ ] `getProfile(id: string)` retrieves profile by ID
- [ ] `getAllProfiles()` returns all profiles
- [ ] `updateProfile(id: string, updates: Partial<Profile>)` updates profile
- [ ] `deleteProfile(id: string)` removes profile
- [ ] All functions return Promises with typed results
- [ ] Error handling for invalid operations (e.g., create duplicate ID)
- [ ] Unit tests for each CRUD operation

---

### [M5] Build Profile list UI with create/edit/delete actions
**Labels:** `feature` `frontend` `p1-high`  
**Depends on:** Implement Profile CRUD operations in storage layer  
**Why:** Users need to manage profiles before generating replies.  
**What to build:** Create a `ProfileList` component in `/features/profiles` that displays all profiles as cards (name, color indicator). Add buttons for "New Profile", "Edit", "Delete". Use a modal or slide-in panel for create/edit form. Persist changes via `profileStore`.  
**Acceptance criteria:**
- [ ] `ProfileList.tsx` component displays all profiles
- [ ] Each profile card shows name + color indicator
- [ ] "New Profile" button opens create form
- [ ] "Edit" button opens edit form with pre-filled data
- [ ] "Delete" button shows confirmation, then removes profile
- [ ] Changes persist to IndexedDB immediately
- [ ] Mobile-optimized (touch-friendly buttons)
- [ ] Accessible (keyboard navigation, focus management)

---

### [M5] Create Profile form with validation (name, language, color, instructions)
**Labels:** `feature` `frontend` `p1-high`  
**Depends on:** Build Profile list UI with create/edit/delete actions  
**Why:** Profile creation requires structured input; validate before saving.  
**What to build:** Create a `ProfileForm` component in `/features/profiles` with fields: name (text, required), language (dropdown: English, Spanish, etc.), color (color picker or preset swatches), instructions (textarea, required). Validate name non-empty and instructions length. Use React Hook Form or similar.  
**Acceptance criteria:**
- [ ] `ProfileForm.tsx` component with fields: name, language, color, instructions
- [ ] Name field required, max 50 characters
- [ ] Language dropdown with common options (en, es, fr, de, etc.)
- [ ] Color picker or preset swatches (6-8 colors)
- [ ] Instructions textarea required, max 500 characters
- [ ] Client-side validation with error messages
- [ ] Form submits to `createProfile` or `updateProfile`
- [ ] Mobile-friendly inputs (large text, proper input types)

---

### [M5] Add default profile seeding on first app launch
**Labels:** `feature` `storage` `p2-normal`  
**Depends on:** Implement Profile CRUD operations in storage layer  
**Why:** Empty state is confusing; seed a default profile so users can start immediately.  
**What to build:** On app initialization, check if `profiles` store is empty. If so, create a default profile (name: "Default", language: "en", color: "#4A90E2", instructions: "Generate a friendly, concise reply."). Store in IndexedDB.  
**Acceptance criteria:**
- [ ] On first launch, check if `getAllProfiles()` returns empty array
- [ ] If empty, create default profile with predefined values
- [ ] Default profile immediately available in UI
- [ ] Subsequent launches skip seeding (profile already exists)
- [ ] User can edit or delete default profile
- [ ] Unit test confirms seeding logic

---

## M6: Reply Generation

### [M6] Implement template-based reply generation (Phase 1)
**Labels:** `feature` `ai` `p0-critical`  
**Depends on:** Implement transcription capability in Squad pipeline  
**Why:** MVP doesn't require LLM inference; template engine is faster and deterministic.  
**What to build:** Create `/features/reply/templateEngine.ts` that generates reply candidates using simple templates. Input: transcription text + profile instructions. Output: 3 reply suggestions (short, medium, detailed). Use string templates with placeholders (e.g., "Thanks for the message! [reflection on content]").  
**Acceptance criteria:**
- [ ] `templateEngine.ts` exports `generateReplies(text: string, instructions: string)` function
- [ ] Returns array of 3 reply candidates (short, medium, long)
- [ ] Templates incorporate profile instructions (e.g., tone, language)
- [ ] Simple reflection logic (e.g., if text contains "question", suggest answer)
- [ ] Fallback generic replies if text is unclear
- [ ] Unit tests with sample transcriptions confirm variety

---

### [M6] Integrate reply generation into Squad capability
**Labels:** `feature` `ai` `p0-critical`  
**Depends on:** Implement template-based reply generation (Phase 1)  
**Why:** Squad isolation keeps reply logic separate and swappable (future LLM upgrade).  
**What to build:** In `/shared/squad`, implement the `generateReply` capability. Input: `{ text: string, profile: Profile }`. Output: `{ replies: ReplyCandidate[] }`. Call `templateEngine.generateReplies()` for Phase 1. Return structured reply candidates.  
**Acceptance criteria:**
- [ ] `generateReply` capability defined in Squad service
- [ ] Input schema: `GenerateReplyInput` with `text` and `profile`
- [ ] Output schema: `GenerateReplyOutput` with `replies` array
- [ ] Calls `templateEngine.generateReplies()` internally
- [ ] Returns 3 reply candidates with metadata (length, tone)
- [ ] Test with real transcription + profile confirms replies

---

### [M6] Build Reply candidates UI with copy-to-clipboard
**Labels:** `feature` `frontend` `p1-high`  
**Depends on:** Integrate reply generation into Squad capability  
**Why:** Users need to see reply options and copy the one they want.  
**What to build:** Create a `ReplyCandidates` component in `/features/reply` that displays 3 reply options as cards. Each card shows the reply text + a "Copy" button. On copy, show a toast confirmation ("Copied!"). Use Clipboard API.  
**Acceptance criteria:**
- [ ] `ReplyCandidates.tsx` component displays 3 reply cards
- [ ] Each card shows reply text (truncated if too long, expand on tap)
- [ ] "Copy" button uses Clipboard API (`navigator.clipboard.writeText`)
- [ ] Toast or inline confirmation on successful copy
- [ ] Fallback for browsers without Clipboard API (select + copy prompt)
- [ ] Mobile-optimized (large touch targets, readable text)
- [ ] Accessible (ARIA labels, keyboard navigation)

---

### [M6] Add profile selector to reply generation flow
**Labels:** `feature` `frontend` `p2-normal`  
**Depends on:** Build Reply candidates UI with copy-to-clipboard  
**Why:** Users may have multiple profiles; let them choose which one to use for reply generation.  
**What to build:** Add a profile selector component (dropdown or horizontal scroll) to the reply generation screen. Fetch all profiles from `profileStore`, display them with color indicators. Selected profile passed to `squad.run("generateReply")`.  
**Acceptance criteria:**
- [ ] `ProfileSelector.tsx` component created
- [ ] Displays all profiles with name + color indicator
- [ ] Supports dropdown (desktop) and horizontal scroll (mobile)
- [ ] Persists last-selected profile to localStorage
- [ ] Selected profile ID passed to `generateReply` capability
- [ ] Handles empty profile list (show "Create a profile first")
- [ ] Accessible (keyboard navigation, ARIA)

---

## M7: Polish

### [M7] Implement global app state machine (uploading → processing → transcribing → replying)
**Labels:** `feature` `frontend` `p1-high`  
**Depends on:** Create /share route to receive shared files, Implement transcription capability in Squad pipeline, Integrate reply generation into Squad capability  
**Why:** Complex async flows need predictable state transitions; prevent UI bugs.  
**What to build:** Create a state machine in `/shared/state` (use XState or Zustand + reducer) with states: `idle`, `uploading`, `processing`, `transcribing`, `replying`, `done`, `error`. Trigger transitions based on user actions and async results. Expose current state + transition functions.  
**Acceptance criteria:**
- [ ] State machine defined with 7 states (idle, uploading, processing, transcribing, replying, done, error)
- [ ] Transitions: `START_UPLOAD`, `UPLOAD_COMPLETE`, `PROCESSING_COMPLETE`, `TRANSCRIPTION_COMPLETE`, `REPLY_COMPLETE`, `ERROR`
- [ ] State accessible via React hook (e.g., `useAppState()`)
- [ ] State transitions logged to console for debugging
- [ ] Invalid transitions prevented (e.g., can't go from idle to replying)
- [ ] Unit tests cover all valid transitions

---

### [M7] Design and build main workflow screen (file → transcription → replies)
**Labels:** `feature` `frontend` `p1-high`  
**Depends on:** Implement global app state machine  
**Why:** Tie all features together into a cohesive user experience.  
**What to build:** Create a `WorkflowScreen` component in `/features/workflow` that orchestrates: file upload → audio processing → transcription → reply generation. Show appropriate UI for each state (progress bars, transcription text, reply cards). Mobile-first layout with clear step indicators.  
**Acceptance criteria:**
- [ ] `WorkflowScreen.tsx` component exists
- [ ] Renders different UI based on app state (uploading, processing, etc.)
- [ ] Step indicator shows current stage (1. Upload, 2. Transcribe, 3. Reply)
- [ ] Smooth transitions between states
- [ ] Error state shows retry option
- [ ] Mobile-optimized layout (single column, large buttons)
- [ ] Accessible (ARIA live regions for state changes)

---

### [M7] Add model download progress UI
**Labels:** `feature` `frontend` `p2-normal`  
**Depends on:** Load Whisper Tiny model via Transformers.js  
**Why:** Whisper model is ~50MB; first download takes time on mobile networks.  
**What to build:** Create a `ModelDownloadProgress` component that shows during first Whisper model load. Display progress bar (0-100%) and download status ("Downloading transcription model... 45%"). Reuse `ProcessingProgressBar`. Show "This is a one-time download" message.  
**Acceptance criteria:**
- [ ] `ModelDownloadProgress.tsx` component created
- [ ] Shows progress bar with percentage (0-100)
- [ ] Status text updates as model downloads
- [ ] "One-time download" message displayed
- [ ] Fullscreen overlay (blocks interaction during download)
- [ ] Mobile-optimized (large text, centered)
- [ ] Accessible (ARIA role="progressbar")

---

### [M7] Enhance service worker to cache Whisper model files
**Labels:** `feature` `storage` `p1-high`  
**Depends on:** Implement basic service worker for asset caching, Load Whisper Tiny model via Transformers.js  
**Why:** After first download, model should load instantly from cache (offline-first).  
**What to build:** Update service worker to intercept Hugging Face CDN requests for Whisper model files. Cache them with a long-lived cache strategy. On subsequent visits, serve from cache. Handle cache versioning (invalidate on model update).  
**Acceptance criteria:**
- [ ] Service worker intercepts requests to Hugging Face CDN (`huggingface.co/models`)
- [ ] Model files cached in dedicated cache (e.g., `models-v1`)
- [ ] Cache-first strategy: serve from cache if available, else fetch + cache
- [ ] Cache version bumped on app updates
- [ ] DevTools → Network confirms model loads from cache on second visit
- [ ] Offline mode: model loads from cache without network

---

### [M7] Add error boundaries and global error handling
**Labels:** `feature` `frontend` `p2-normal`  
**Depends on:** Design and build main workflow screen  
**Why:** Unhandled errors crash the app; graceful degradation improves UX.  
**What to build:** Wrap app in React Error Boundary. Catch render errors and show fallback UI ("Something went wrong. Refresh to retry."). Log errors to console. Add global error handler for unhandled promise rejections.  
**Acceptance criteria:**
- [ ] React Error Boundary wraps `<App />` in `main.tsx`
- [ ] Fallback UI shows user-friendly error message + "Refresh" button
- [ ] Errors logged to console with stack trace
- [ ] `window.addEventListener('unhandledrejection')` logs promise errors
- [ ] Unit test simulates error and confirms fallback renders
- [ ] Accessible fallback UI (keyboard, screen reader)

---

### [M7] Optimize mobile UX (touch targets, font sizes, safe areas)
**Labels:** `feature` `frontend` `p2-normal`  
**Depends on:** Design and build main workflow screen  
**Why:** Mobile-first means optimizing for thumbs, small screens, and safe areas (notches).  
**What to build:** Audit all interactive elements (buttons, inputs) for 44x44px minimum touch target. Increase base font size to 16px (prevent iOS zoom). Add `safe-area-inset` padding for notched devices. Test on iOS Safari and Android Chrome.  
**Acceptance criteria:**
- [ ] All buttons/links have min 44x44px touch target
- [ ] Base font size 16px (no iOS auto-zoom)
- [ ] Safe area insets applied (`padding: env(safe-area-inset-*)`)
- [ ] Tested on iOS Safari (iPhone with notch)
- [ ] Tested on Android Chrome (various screen sizes)
- [ ] No horizontal scroll on mobile
- [ ] No UI hidden by notch or home indicator

---

### [M7] Add simple analytics tracking (local events, no external service)
**Labels:** `feature` `frontend` `p2-normal`  
**Depends on:** none (can run in parallel)  
**Why:** Understand usage patterns for future improvements (privacy-preserving, local-only).  
**What to build:** Create an analytics utility (`/shared/analytics`) that logs events to IndexedDB (e.g., `fileUploaded`, `transcriptionCompleted`, `replyGenerated`). Store timestamps and basic metadata. No external API calls. Provide a settings toggle to disable analytics.  
**Acceptance criteria:**
- [ ] `analytics.ts` exports `trackEvent(name: string, metadata?: object)` function
- [ ] Events stored in IndexedDB (object store: `analytics`)
- [ ] Timestamp and metadata saved with each event
- [ ] Settings UI includes "Enable Analytics" toggle
- [ ] Analytics disabled by default (opt-in)
- [ ] No external network requests
- [ ] DevTools → IndexedDB shows `analytics` store

---

## Stretch Goals

### [Stretch] Support multi-audio conversation merge
**Labels:** `feature` `systems` `p2-normal`  
**Depends on:** Implement transcription capability in Squad pipeline  
**Why:** Users may share multiple audios from a conversation; merge into single context.  
**What to build:** Allow users to upload multiple audio files in sequence. Concatenate transcriptions with speaker/timestamp markers. Pass merged text to reply generation. Store conversation history in IndexedDB.  
**Acceptance criteria:**
- [ ] Share target accepts multiple audio files (or sequential uploads)
- [ ] Each audio transcribed separately
- [ ] Transcriptions merged with timestamps ("Audio 1: [text] → Audio 2: [text]")
- [ ] Merged text passed to `generateReply`
- [ ] Conversation history saved to IndexedDB
- [ ] UI shows all audios in thread
- [ ] Clear button to reset conversation

---

### [Stretch] Implement reply ranking/voting for template improvement
**Labels:** `feature` `ai` `p2-normal`  
**Depends on:** Build Reply candidates UI with copy-to-clipboard  
**Why:** Learn which replies users prefer to improve template engine over time.  
**What to build:** Add thumbs-up/down buttons to each reply candidate. Store votes in IndexedDB with reply metadata (text, profile, transcription). Build a simple analytics view showing most-liked templates.  
**Acceptance criteria:**
- [ ] Thumbs-up/down buttons on each reply card
- [ ] Votes stored in IndexedDB (object store: `reply_votes`)
- [ ] Vote metadata: reply text, profile ID, transcription, timestamp, vote (up/down)
- [ ] Analytics view shows top-rated reply patterns
- [ ] Votes do not affect template engine (passive logging only)
- [ ] Privacy: no external data sharing

---

### [Stretch] Add language auto-detection for transcription
**Labels:** `feature` `ai` `p2-normal`  
**Depends on:** Implement transcription capability in Squad pipeline  
**Why:** Users may share audios in different languages; auto-detect instead of manual selection.  
**What to build:** Use Transformers.js language detection model (e.g., `facebook/mms-lid`) to identify audio language before transcription. Pass detected language to Whisper. Show detected language in UI for user confirmation.  
**Acceptance criteria:**
- [ ] Language detection model loaded (e.g., `facebook/mms-lid`)
- [ ] Model runs on audio before transcription
- [ ] Detected language passed to Whisper `transcribeAudio` capability
- [ ] UI shows "Detected: Spanish" with option to override
- [ ] Fallback to profile language if detection fails
- [ ] Test with multi-language audio samples

---

### [Stretch] Enable WebGPU support for faster inference
**Labels:** `feature` `ai` `p2-normal`  
**Depends on:** Load Whisper Tiny model via Transformers.js  
**Why:** WebGPU can accelerate Whisper 2-5x on supported devices (Chrome/Edge).  
**What to build:** Detect WebGPU support in browser. If available, configure Transformers.js to use WebGPU backend for Whisper inference. Fallback to WASM if unsupported. Show badge in UI ("GPU accelerated").  
**Acceptance criteria:**
- [ ] Detect WebGPU support (`navigator.gpu`)
- [ ] Configure Transformers.js to use WebGPU backend if available
- [ ] Fallback to WASM on unsupported browsers
- [ ] UI shows "GPU Accelerated" badge when WebGPU active
- [ ] Performance improvement measured (log inference time)
- [ ] Test on Chrome Canary with WebGPU enabled

---

### [Stretch] Build settings screen (model selection, cache management, theme)
**Labels:** `feature` `frontend` `p2-normal`  
**Depends on:** Implement basic service worker for asset caching  
**Why:** Power users want control over model size, cache, and appearance.  
**What to build:** Create a `/settings` route with options: Whisper model size (tiny, base, small), clear model cache, clear conversation history, toggle analytics, theme (light/dark). Persist settings to localStorage.  
**Acceptance criteria:**
- [ ] `/settings` route exists
- [ ] Whisper model selector (tiny, base, small) with size info
- [ ] "Clear Model Cache" button purges service worker cache
- [ ] "Clear Conversation History" button purges IndexedDB
- [ ] Toggle analytics (enable/disable)
- [ ] Theme toggle (light/dark mode)
- [ ] Settings saved to localStorage
- [ ] Settings applied on app reload

---

### [Stretch] Add export conversation history (JSON download)
**Labels:** `feature` `frontend` `p2-normal`  
**Depends on:** Support multi-audio conversation merge  
**Why:** Users may want to backup or export their transcription history.  
**What to build:** Add "Export" button to conversation view. Downloads JSON file with all transcriptions, replies, timestamps, and profiles. Format: `{ version: "1.0", conversations: [...] }`. Privacy notice (local download, no upload).  
**Acceptance criteria:**
- [ ] "Export Conversations" button in UI
- [ ] Downloads JSON file (`chat-copilot-export-YYYY-MM-DD.json`)
- [ ] JSON includes all conversations from IndexedDB
- [ ] Schema: `{ version, exportedAt, conversations: [{ id, transcriptions, replies, profile, timestamp }] }`
- [ ] Privacy notice: "Downloaded locally, never uploaded"
- [ ] Import feature out of scope (stretch++)

---

### [Stretch] Implement Phase 2: Replace template engine with Squad LLM pipeline
**Labels:** `feature` `ai` `p2-normal`  
**Depends on:** Integrate reply generation into Squad capability  
**Why:** LLM-based replies are more contextual and personalized than templates.  
**What to build:** Replace `templateEngine` in `generateReply` capability with a Squad pipeline that calls a local LLM (e.g., Llama 3.2 1B via Transformers.js). Keep Squad interface unchanged so swap is seamless. Add settings toggle to switch between template/LLM modes.  
**Acceptance criteria:**
- [ ] Load local LLM model (e.g., `meta-llama/Llama-3.2-1B`) via Transformers.js
- [ ] Replace `templateEngine.generateReplies()` with LLM prompt in `generateReply` capability
- [ ] Prompt includes profile instructions + transcription
- [ ] Generate 3 reply variants (short, medium, long)
- [ ] Settings toggle: "Use AI Replies" (default: templates)
- [ ] Performance acceptable on mobile (< 10s for 3 replies)
- [ ] Test with real transcriptions confirms quality

---

## Summary

**Total Issues:** 43  
**P0-Critical:** 13  
**P1-High:** 13  
**P2-Normal:** 17

**Milestones:**
- **M1: Foundation** — 5 issues (scaffold, Squad, PWA, SW, types)
- **M2: Ingestion** — 3 issues (share target, validation, upload UI)
- **M3: Audio Pipeline** — 3 issues (ffmpeg, chunking, progress UI)
- **M4: Transcription** — 4 issues (Whisper, Squad capability, progress, errors)
- **M5: Profiles** — 5 issues (schema, CRUD, UI, form, seeding)
- **M6: Reply Generation** — 4 issues (template engine, Squad capability, UI, profile selector)
- **M7: Polish** — 11 issues (state machine, workflow screen, model download, SW cache, errors, mobile UX, analytics)
- **Stretch Goals** — 8 issues (multi-audio, ranking, language detection, WebGPU, settings, export, LLM)

**Routing:**
- `frontend` → Rusty (17 issues)
- `ai` → Linus (10 issues)
- `systems` → Basher (4 issues)
- `storage` → Livingston (12 issues)

**Priority breakdown:**
- **P0-Critical:** Foundation scaffold, Squad setup, PWA manifest, share route, ffmpeg, Whisper, transcription capability, Profile schema + CRUD, template engine, reply capability
- **P1-High:** Service worker, file validation, chunking, transcription UI, Profile UI + form, reply UI + profile selector, state machine, workflow screen, model caching
- **P2-Normal:** Types, upload UI fallback, progress bars, errors, default profile, settings toggles, mobile UX, analytics, all stretch goals

---
