# Voice notes and speech-to-text: can we do it free and private?

*Research note, November 2026. Scope: a free, private, Arabic-first, mobile-first static site (GitHub Pages, no server, no paid APIs) for structured debates between friends, who today argue in WhatsApp voice messages.*

## TL;DR (the plain answer)

- **Free + private + Arabic + in-browser + on a mid-range phone: not reliably possible today.** Every option fails on at least one of these.
  - The browser's built-in speech API is free, but on mobile it is **cloud-based** (Google or Apple servers). Chrome's on-device mode is **desktop-only**, and Arabic is not on any published on-device list [VOICE-04][VOICE-06][VOICE-07].
  - In-browser Whisper is private and free. But the models small enough for a phone are **inaccurate in Arabic** (FLEURS WER 63% for tiny, 49% for base), and the usable one (small, about 31% WER) is a download of a few hundred MB that runs slowly on phones [VOICE-11][VOICE-18].
- **Sharing audio between two people without a server is the harder blocker.** Audio is far too big for a URL, and peer-to-peer only works when both people are online at once. **v1 should not store or sync audio at all.**
- **Best free and private path for v1: text only, plus the phone's own dictation.** The user taps the mic on their keyboard and talks into our text field. On iPhone, Apple lists Arabic among its **on-device** dictation languages [VOICE-10]. WhatsApp's own transcripts can also turn existing voice notes into text that users paste in. WhatsApp says these are made on the device [VOICE-23][VOICE-24].
- **Later, as an opt-in "Transcribe a file on this device" tool:** run Whisper (base or small) or Moonshine-tiny-ar locally on an audio file the user picks. Label it clearly as experimental, a large download and best on Wi-Fi. Nothing is uploaded.

---

## 1. Web Speech API (`SpeechRecognition`)

**Browser support.** caniuse rates the API as "partial support" in Chrome (desktop and Android), Safari 14.1+ / iOS Safari 14.5+ and Samsung Internet. It is disabled by default in Firefox and not supported in Firefox for Android. Oddly, caniuse also lists Edge as unsupported [VOICE-02]. MDN says the feature is "not Baseline" [VOICE-01].

**Privacy: audio leaves the device by default.** MDN states: "On some browsers, like Chrome, using Speech Recognition on a web page involves a server-based recognition engine. Your audio is sent to a web service for recognition processing, so it won't work offline" [VOICE-01].

On Safari, the feature uses Apple's speech recognition and requires Siri to be enabled. A developer asked Apple how Safari's web speech audio is transferred and stored and found only generic privacy documents [VOICE-08]. Apple's general Siri/Dictation privacy page says that when audio is not processed on device, "the things you say are sent to and processed by Apple." It adds that audio is not stored unless the user opts in to "Improve Siri & Dictation" [VOICE-09]. That page does not mention Safari's Web Speech API, so **whether a given Safari web transcription stays on the device is unverified.**

**On-device mode (`processLocally`).** The spec now has `recognition.processLocally = true`, which means recognition "must be done locally." It also adds the static methods `SpeechRecognition.available()` and `SpeechRecognition.install()` to check for and download language packs [VOICE-01][VOICE-03].

- **Chrome:** The Intent to Ship (Jan 2025) promises that "neither audio nor transcribed speech are sent to a third-party service." It covers **Windows, Mac and Linux only**, not Android [VOICE-04]. Developers report it working from Chrome 139 (Aug 2025) [VOICE-05]. In May 2026 a Chrome engineer wrote: **"Android & ChromeOS currently do not support on-device Web Speech"** [VOICE-06].
- **Edge:** Experimental on-device mode in Canary/Dev 150+ behind a flag. Its published languages are en-US, de-DE, it-IT, pt-PT, es-ES and ko-KR, so **no Arabic** [VOICE-07].
- I found **no official source listing Arabic (ar-SA) as an on-device Web Speech language in any browser** (unverified either way). So for our mobile Arabic users, `processLocally` is effectively unavailable today. The cloud mode would send their voices to Google or Apple.

**Arabic quality.** The cloud engines accept `ar-SA` and similar tags. I found no published WER for Arabic via the Web Speech API (unverified; would need our own testing).

**Continuous recognition limits.** `continuous` defaults to `false`, so recognition ends when the user stops talking [VOICE-01]. Developer reports describe Android Chrome stopping after silence and continuous mode being unreliable. These are community reports, not official limits (unverified). In practice it suits short dictation, not 3-minute monologues.

**Verdict:** Do not use the Web Speech API by default. If it is ever offered, it must sit behind an explicit consent screen that says "your voice is sent to Google/Apple for transcription."

## 2. In-browser Whisper (transformers.js, whisper.cpp WASM, WebGPU)

**Arabic accuracy, from the Whisper paper** [VOICE-11] (Tables 11 and 13, WER %, lower is better; cross-checked against [VOICE-12]):

| Model | Params | Common Voice 9 Arabic | FLEURS Arabic |
|---|---|---|---|
| tiny | 39M | 90.9 | 63.4 |
| base | 74M | 84.4 | 48.8 |
| small | 244M | 66.4 | 30.6 |
| medium | 769M | 60.3 | 20.4 |
| large | 1.55B | 56.0 | 18.1 |
| large-v2 | 1.55B | 53.8 | 16.0 |

(Parameter counts are as given in [VOICE-12]'s model table.)

How to read this:

- **Tiny and base are not usable for Arabic.** Roughly every second word (base) to two out of three words (tiny) are wrong, even on clean read speech (FLEURS).
- **Small is marginal**, about one word in three wrong.
- **Medium and large approach usefulness**, but they are 1.5 GB or more on disk [VOICE-17]. That is not feasible on a phone in a browser.
- These benchmarks are mostly read, fairly standard Arabic. Friends debating in dialect, with code-switching and crosstalk, will do **worse**:
  - A 2025 study of Levantine children's speech found every Whisper model degraded badly. For example, large-v3 scored 66% WER versus about 16% on FLEURS [VOICE-12].
  - The same paper reports that Whisper large-v3 averaged 36.86 WER on the Open Universal Arabic ASR Leaderboard (as of Aug 2025) [VOICE-12].

**Download sizes.**

- transformers.js ONNX, quantized (q8), as reported by a developer shipping it: **tiny ≈ 39 MB, base ≈ 73 MB, small ≈ 238 MB**. The fp16 versions used for WebGPU are 73, 139 and 463 MB [VOICE-18].
- The `onnx-community/whisper-base` repo shows the individual files: encoder 23 MB plus merged decoder 54 MB in int8 [VOICE-16].
- whisper.cpp ggml: tiny 75 MiB, base 142 MiB, small 466 MiB, medium 1.5 GiB, large-v3-turbo 1.5 GiB (547 MiB at q5_0) [VOICE-17].
- On mobile data, 240 MB for "small" is a real cost for many users. It also needs storage that Safari may evict (see section 4).

**Speed on phones: no rigorous public benchmark found.**

- A reproducible desktop measurement shows whisper-tiny.en (q8, WASM, no GPU) taking about 16 s for 60 s of audio on an Intel laptop CPU, plus about 10 s for the first download and initialisation [VOICE-19].
- A developer running transformers.js in production reports, on a 2021 laptop (WASM), about 2 min (tiny), 4 min (base) and **24.6 min (small) per 10 min of audio**. He also says that "small is slow on phones" [VOICE-18].
- That developer also reports that **Android Chrome exposes WebGPU but the worker "kept dying in the middle of a transcription"**, so they force phones onto WASM [VOICE-18].
- WebGPU itself is listed as supported in Chrome for Android, Samsung Internet 24+ and iOS Safari 26+ [VOICE-20]. Real-world stability for this workload on phones is the weak point.
- Rough inference, not measured: a mid-range phone is slower than a laptop CPU. So whisper-small on a 3-minute Arabic voice note could plausibly take **several minutes to tens of minutes**, with the tab needing to stay in the foreground. [VOICE-18] notes that switching apps freezes the tab.

**Verdict:** It is technically possible and fully private, since audio never leaves the device. But for Arabic on mid-range phones it is slow, heavy, and still inaccurate at the sizes a phone can handle. It is acceptable only as an **optional, clearly labelled, experimental** feature on files, with the output treated as a rough draft to edit.

## 3. Other on-device models

- **Moonshine tiny-ar (Moonshine AI, formerly Useful Sensors).**
  - A 27M-parameter Arabic-only model from the "Flavors of Moonshine" paper (Sep 2025). It reports **20.76 WER on FLEURS Arabic and 36.55 on Common Voice 17**, versus Whisper tiny at 66.01 / 88.89 and Whisper medium at 18.79 / 36.09 (the authors' own evaluation) [VOICE-13][VOICE-14].
  - On paper, this is the best accuracy-per-megabyte option for Arabic by a wide margin. ONNX weights exist [VOICE-14]. I found no published in-browser phone benchmark (unverified).
  - The model card warns of hallucinations and repeated output on short or clipped segments [VOICE-14].
  - **Licence caveat:** the card says "other". Moonshine's documentation (seen only in a search snippet, unverified) describes non-English models as under the **Moonshine Community License** (described in that snippet as non-commercial), with a revenue-threshold community tier [VOICE-15]. A free non-commercial site is probably fine, but this must be checked before shipping.
- **Vosk (Kaldi).**
  - Arabic models exist: `vosk-model-ar-mgb2-0.4` (**318 MB**, 16.40 WER on the MGB-2 dev set, Apache 2.0) and a 1.3 GB LINTO model (AGPL) [VOICE-21].
  - There is a 158 MB small **Tunisian** Arabic model, but **no small Modern Standard Arabic model** [VOICE-21].
  - A browser build (vosk-browser) exists in the community. Its Arabic suitability on phones is unverified.
- **Distil-Whisper: English only.** Its README states: "Distil-Whisper is only available for English speech recognition" [VOICE-22]. Not applicable.
- **Whisper large-v3-turbo:** multilingual, but 1.5 GiB (547 MiB quantized) [VOICE-17]. Too large for phones.

## 4. Recording and storing voice notes in the browser

**Recording.**

- `MediaRecorder` is supported in iOS Safari 14.5+, Chrome for Android and Samsung Internet 5+ [VOICE-27]. caniuse lists Firefox for Android as unsupported; verify on a device.
- Codecs differ by platform:
  - Chromium records `audio/webm;codecs=opus`.
  - Safari originally recorded only MP4/AAC. **Safari 18.4 added WebM/Opus recording and Ogg (Opus/Vorbis) container support** [VOICE-28].
  - Feature-detect at runtime with `MediaRecorder.isTypeSupported()`, trying WebM/Opus first and falling back to `audio/mp4`.

**File sizes.** These are arithmetic, not measured: at an Opus speech bitrate of 16 kbps, one minute is about 120 KB, and at 32 kbps about 240 KB. A 10-turn debate of 2-minute turns is therefore about 2.5–5 MB. Whether Safari respects a low `audioBitsPerSecond` for AAC is unverified.

**Storage.**

- IndexedDB can hold this comfortably. Chrome allows up to about 60% of disk per origin, and Safari on iOS 17+ also allows about 60% [VOICE-29].
- **However:** Safari "proactively evicts" script-created storage for an origin with no user interaction in the last seven days of browser use [VOICE-29].
- `navigator.storage.persist()` helps, but Safari and Chrome grant it silently based on engagement [VOICE-29].
- So **audio kept only in the browser can disappear**, and users must be told to keep their originals.

**Syncing between two people: the core problem.**

- A GitHub Pages site has no backend. Today's text-only design can pass debate state in a link or a pasted code. A 1 MB voice note is about 1.3 MB as base64, which is orders of magnitude beyond what a URL or chat-pasted code can practically carry.
- WebRTC peer-to-peer needs **both people online at the same moment**, which breaks asynchronous debating. It also still needs some signalling channel.
- Free public relays (Nostr relays, public WebRTC signalling and similar) are third parties. Sending audio through them breaks the privacy promise, and in our experience they rarely accept large blobs (unverified; not researched in depth here).
- **Conclusion: no free, private, serverless way to share audio asynchronously exists for us.**

**The workable pattern: audio stays in WhatsApp; text comes to us.**

- Users already send voice notes in WhatsApp, which handles delivery, encryption and storage. WhatsApp voice notes are Ogg/Opus files; Meta's own API documentation requires "`.ogg` files encoded with the OPUS codec" for voice messages [VOICE-31].
- A user can share or save a voice note and open it **locally** in our page for transcription. Nothing is uploaded. They then edit the text and post it as their turn.
- On Android, an installed PWA can appear as a share target and receive files via the Web Share Target API [VOICE-30]. The documentation does not mention iOS support, so iOS users would use a file picker.
- Safari's Ogg/Opus decoding has been historically unreliable. Safari 18.4 added Ogg support [VOICE-28], but a WASM Opus decoder is the safe fallback.

## 5. Workflow alternative: let the phone do the transcription

This is the most honest free and private option, because the processing happens in software the user already trusts.

**WhatsApp voice message transcripts.**

- Launched Nov 2024. WhatsApp says transcripts are "generated on your device and no one else can read them" [VOICE-24].
- At launch, Arabic was supported on **iOS 16+**, and Android had only English, Portuguese, Spanish and Russian [VOICE-24].
- By **Sept 2026**, WABetaInfo reports that Android already supported **Arabic**, Spanish, Hindi, Portuguese and Russian, using downloaded language packs that work offline [VOICE-23].
- WhatsApp's help page only says the feature "is only available on certain devices" [VOICE-25-note: see VOICE-23/24; official FAQ text not retrievable].
- **Workflow:** long-press the voice note, tap Transcribe, copy the text, and paste it into our turn field. This is zero cost, the audio stays in WhatsApp, and transcription is on-device per WhatsApp's claims.

**iOS keyboard dictation.**

- Apple's iOS feature-availability page lists **Arabic** under "Dictation: On-Device and Modeless Dictation". It also lists Arabic (Saudi Arabia) and Arabic (UAE) under Dictation generally [VOICE-10].
- Apple's privacy page says the device indicates whether speech is processed locally. Otherwise it is "sent to and processed by Apple", and audio is not stored unless the user opts into "Improve Siri & Dictation" [VOICE-09].
- So on supported iPhones, Arabic dictation into our `<textarea>` can stay on the device. Exact device and iOS-version requirements were not verified.

**Gboard voice typing (Android).**

- Gboard's help page says only that talk-to-text "doesn't work with all languages" and says nothing about where audio is processed [VOICE-26].
- Google's offline recognition launched in 2019 for US English on Pixel, with an 80 MB model [VOICE-25].
- **I could not find any official source confirming that Arabic offline or on-device voice typing is available in Gboard (unverified).** We must assume Gboard Arabic voice typing may go to Google's servers. Users can test this by turning on airplane mode and trying to dictate.
- Samsung Keyboard voice input: not researched (unverified).

**Honest privacy summary for keyboard dictation.** Our site never touches the audio. Whatever the keyboard does is between the user and Apple, Google or Samsung, under privacy terms they have already accepted. This is a real improvement over us sending audio anywhere, but we cannot promise it is on-device on every phone.

## 6. Recommendation

**v1 (ship now): text-first, with "speak instead of typing" guidance.**

1. Turns are text. Each turn field is a large RTL `<textarea dir="auto" lang="ar">` that works well with keyboard dictation, and its autosave survives the keyboard opening and closing.
2. Add a short "🎙 Prefer to speak?" help sheet:
   - **iPhone:** tap the mic on the keyboard. Arabic dictation can run on your phone.
   - **Android:** tap the mic on Gboard. This may use Google's servers; test with airplane mode to check.
   - **Already sent a voice note in WhatsApp?** Long-press it, tap Transcribe, then copy the text and paste it here.
3. **No audio recording, storage or sync in v1.** No Web Speech API in v1.
4. Add per-turn character limits and an "edited from voice" tag (optional), so debaters know a turn came from speech and may contain recognition errors.

**v2 (optional, experimental): "Transcribe a voice note on this device".**

- The user picks a local audio file, including WhatsApp `.opus`/`.ogg` files. On Android this can also arrive via the installed-PWA share target.
- Before downloading anything, a consent and cost screen says: "This downloads a speech model (about X MB) once, and it is stored in your browser. Your audio never leaves your phone. It can take several minutes and the screen must stay on. Arabic accuracy is limited, so please review the text."
- Engine choice:
  - Evaluate **Moonshine tiny-ar** first, because of its strong Arabic numbers at about 27M parameters, once the licence is confirmed [VOICE-13][VOICE-14][VOICE-15].
  - Otherwise use **Whisper base (q8, ~73 MB)** for speed or **small (q8, ~238 MB)** for quality [VOICE-18], on WASM by default with WebGPU only on desktop.
- Show a progress bar, use a Wake Lock, and put the result into the editable turn field.
- Run our own small test on real dialectal debate clips (5–10 friends' voice notes, used with their consent) before promising anything.

**v3+ (watch list).**

- Revisit the Web Speech API's `processLocally` when Chrome ships it on Android **and** lists Arabic. Then on-device live dictation in the page becomes possible, with no download managed by us [VOICE-06].
- Never auto-fall back to cloud recognition. If on-device recognition is not available, say so.
- Audio sync stays out of scope unless the product accepts a backend or a third-party store with explicit consent.

**What the product should tell users (copy guidance).**

| Option | Where the audio goes | What we say |
|---|---|---|
| Typing | Nowhere | "Your text stays in this link/your device." |
| iPhone dictation | On-device for Arabic on supported iPhones, otherwise Apple [VOICE-09][VOICE-10] | "Your keyboard turns speech into text. Apple processes it, usually on your phone. We never receive audio." |
| Gboard voice typing | Possibly Google servers (unverified for Arabic offline) | "Google may process your voice. Use airplane mode to check if it works offline." |
| WhatsApp transcript | On-device per WhatsApp [VOICE-23][VOICE-24] | "WhatsApp creates the transcript on your phone. Paste the text here." |
| v2 local Whisper/Moonshine | Never leaves the device | "Runs entirely on your phone after a one-time download of X MB. Nothing is uploaded." |
| Web Speech API (not planned) | Google/Apple servers [VOICE-01] | Only with an explicit opt-in: "Your voice will be sent to Google/Apple." |

## Sources

**[VOICE-01]** SpeechRecognition — MDN Web Docs, accessed Nov 2026 — https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition — Chrome's server-based engine sends audio to a web service; not Baseline; `continuous` defaults to false; `available()`/`install()` for on-device packs.

**[VOICE-02]** Speech Recognition API — caniuse.com, accessed Nov 2026 — https://caniuse.com/speech-recognition — Partial support in Chrome, Chrome Android, Safari 14.1+, iOS Safari 14.5+ and Samsung Internet; Firefox disabled; Firefox Android and Edge listed unsupported.

**[VOICE-03]** SpeechRecognition: processLocally property — MDN, accessed Nov 2026 — https://developer.mozilla.org/docs/Web/API/SpeechRecognition/processLocally — `true` means recognition must be local; `false` (default) lets the browser choose.

**[VOICE-04]** Intent to Ship: On-device Web Speech API — blink-dev (Google Groups), 7 Jan 2025 — https://groups.google.com/a/chromium.org/g/blink-dev/c/VNOok2dbmHM/m/cz7ZnL59AAAJ — Desktop (Win/Mac/Linux) only; promises audio and text are not sent to third parties.

**[VOICE-05]** "on-device speech recognition with the Web Speech API" — chrome-ai-dev-preview-discuss (Google Groups), Aug 2025 — https://groups.google.com/a/chromium.org/g/chrome-ai-dev-preview-discuss/c/Rlyc2uAsFCY — Developers using on-device recognition from Chrome 139; no language list given.

**[VOICE-06]** Intent to Ship: Web Speech API: On-Device Recognition Quality — blink-dev (Google Groups), 5–11 May 2026 — https://groups.google.com/a/chromium.org/g/blink-dev/c/P8P-x7AnC6I — Chrome engineer: "Android & ChromeOS currently do not support on-device Web Speech"; desktop target M150.

**[VOICE-07]** Convert speech to text with the SpeechRecognition API — Microsoft Edge docs (Microsoft Learn), updated Oct 2026 — https://learn.microsoft.com/en-us/microsoft-edge/web-platform/speech-recognition-api — Edge Canary/Dev 150+ on-device mode behind a flag; languages en-US, de-DE, it-IT, pt-PT, es-ES, ko-KR (no Arabic).

**[VOICE-08]** "How does Apple transfer/store Siri (WebSpeechAPI) voice data?" — Apple Developer Forums, date not checked — https://developer.apple.com/forums/thread/690575 — Developer unable to find specifics on Safari Web Speech data handling (seen via search summary).

**[VOICE-09]** Ask Siri, Dictation & Privacy — Apple, accessed Nov 2026 — https://www.apple.com/legal/privacy/data/en/ask-siri-dictation/ — Non-local audio is "sent to and processed by Apple"; audio not stored unless the user opts in to "Improve Siri & Dictation".

**[VOICE-10]** iOS Feature Availability — Apple, accessed Nov 2026 — https://www.apple.com/ios/feature-availability/ — "Dictation: On-Device and Modeless Dictation" list includes Arabic; Dictation list includes Arabic (Saudi Arabia, UAE).

**[VOICE-11]** Radford et al., "Robust Speech Recognition via Large-Scale Weak Supervision" (Whisper paper) — OpenAI, Dec 2022 — https://cdn.openai.com/papers/whisper.pdf (also arXiv 2212.04356) — Table 11 (Common Voice 9) and Table 13 (FLEURS) Arabic WER per model size, read directly from the PDF text.

**[VOICE-12]** Alkadri, Desouki, Al Jallad, "Arabic Little STT: Arabic Children Speech Recognition Dataset" — arXiv 2510.23319, 2025 — https://arxiv.org/pdf/2510.23319 — Table 7 reproduces Whisper Arabic WERs; Whisper parameter counts; child-speech degradation; large-v3 averages 36.86 WER on the Open Universal Arabic ASR Leaderboard (Aug 2025).

**[VOICE-13]** "Flavors of Moonshine: Tiny Specialized ASR Models for Edge Devices" — arXiv 2509.02523, 2 Sep 2025 — https://arxiv.org/html/2509.02523v1 — Table 6 Arabic WER: Moonshine tiny 20.76 (FLEURS) / 36.55 (CV17) vs Whisper tiny/base/small/medium; 27.1M params.

**[VOICE-14]** UsefulSensors/moonshine-tiny-ar model card — Hugging Face, accessed Nov 2026 — https://huggingface.co/UsefulSensors/moonshine-tiny-ar — 27M params; WER table; licence "other"; hallucination and repetition warnings.

**[VOICE-15]** Moonshine licence documentation — moonshine-voice.readthedocs.io / moonshine.ai, accessed Nov 2026 — https://moonshine-voice.readthedocs.io/en/latest/license/ — Non-English models under the Moonshine Community License (seen only in a search snippet; unverified).

**[VOICE-16]** onnx-community/whisper-base ONNX files — Hugging Face, accessed Nov 2026 — https://huggingface.co/onnx-community/whisper-base/tree/main/onnx — Per-file sizes (e.g. int8 encoder 23.2 MB, merged decoder 53.7 MB).

**[VOICE-17]** whisper.cpp models README — ggml-org/whisper.cpp on GitHub, accessed Nov 2026 — https://github.com/ggml-org/whisper.cpp/tree/master/models — Disk sizes from tiny 75 MiB to large 2.9 GiB; turbo q5_0 547 MiB.

**[VOICE-18]** "Running Whisper in the browser: what broke and how I fixed it" — DEV Community (luizpixthru), Oct 25 (year not stated) — https://dev.to/luizpixthru/running-whisper-in-the-browser-what-broke-and-how-i-fixed-it-j90 — q8 sizes 39/73/238 MB; WebGPU worker crashes on Android Chrome; phones forced to WASM; laptop timings; "small is slow on phones".

**[VOICE-19]** browser-whisper-benchmark — GitHub (nickwebt800), accessed Nov 2026 — https://github.com/nickwebt800/browser-whisper-benchmark — whisper-tiny.en q8 WASM: 60 s of audio in 16.06 s on an Intel desktop CPU; about 40 MB download; no phone results.

**[VOICE-20]** WebGPU — caniuse.com, accessed Nov 2026 — https://caniuse.com/webgpu — Supported in Chrome Android, Samsung Internet 24+ and iOS Safari 26+; Firefox Android disabled.

**[VOICE-21]** Vosk models — Alpha Cephei, accessed Nov 2026 — https://alphacephei.com/vosk/models — Arabic mgb2 318 MB (16.40 WER on MGB-2), LINTO 1.3 GB, Tunisian small 158 MB; no small MSA model.

**[VOICE-22]** distil-whisper README — Hugging Face on GitHub, accessed Nov 2026 — https://github.com/huggingface/distil-whisper — "only available for English speech recognition".

**[VOICE-23]** "WhatsApp is rolling out new languages for voice transcriptions" — WABetaInfo, 17 Sep 2026 — https://wabetainfo.com/whatsapp-is-rolling-out-new-languages-for-voice-transcriptions/ — Android already supports Arabic; language packs downloaded to the phone; works offline; private by default.

**[VOICE-24]** "WhatsApp rolls out voice message transcripts" — TechCrunch, 21 Nov 2024 — https://techcrunch.com/2024/11/21/whatsapp-rolls-out-voice-message-transcripts — "generated on your device"; Arabic on iOS 16+ at launch; Android launch languages.

**[VOICE-25]** "Google's Gboard now offers offline speech recognition" — Digital Trends, 12 Mar 2019 — https://www.digitaltrends.com/phones/google-gboard-offline-speech-recognition/ — Offline recognition launched for US English on Pixel; 80 MB model. *(Note: an inline marker in section 5 also says "VOICE-25-note"; the WhatsApp FAQ at https://faq.whatsapp.com/241617298315321 only states transcripts are "only available on certain devices"; its full text was not retrievable.)*

**[VOICE-26]** Type with your voice (Gboard Help) — Google, accessed Nov 2026 — https://support.google.com/gboard/answer/2781851?hl=en — "Talk-to-text doesn't work with all languages"; no statement on offline use or where audio is processed.

**[VOICE-27]** MediaRecorder API — caniuse.com, accessed Nov 2026 — https://caniuse.com/mediarecorder — Supported in iOS Safari 14.5+, Chrome Android and Samsung Internet 5+; Firefox Android listed unsupported.

**[VOICE-28]** "WebKit Features in Safari 18.4" — WebKit blog, 2025 — https://webkit.org/blog/16574/webkit-features-in-safari-18-4/ — MediaRecorder WebM/Opus; ALAC/PCM; Ogg container for Opus and Vorbis on iOS 18.4.

**[VOICE-29]** Storage quotas and eviction criteria — MDN, accessed Nov 2026 — https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria — Quotas of about 60% of disk; Safari's seven-day eviction of script-created data; `persist()` behaviour.

**[VOICE-30]** Receiving shared data with the Web Share Target API — Chrome for Developers, accessed Nov 2026 — https://developer.chrome.com/docs/capabilities/web-apis/web-share-target — Chrome 76+ Android / 89+ desktop; app must be installed; files accepted via POST multipart; iOS not mentioned.

**[VOICE-31]** Audio messages — WhatsApp Business Platform (Meta for Developers), accessed Nov 2026 — https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/audio-messages — Voice messages require `.ogg` files with the OPUS codec, mono; 16 MB limit.
