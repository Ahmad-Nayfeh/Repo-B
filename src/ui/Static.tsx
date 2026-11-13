import { lang, t } from '../i18n';
import { TopBar } from './common';

export function Charter() {
  return (
    <>
      <ol class="charter">{[1, 2, 3, 4, 5, 6, 7].map((i) => <li key={i}>{t(`charter.${i}` as never)}</li>)}</ol>
      <p class="muted small">{t('charter.source')}</p>
    </>
  );
}

const ABOUT_AR = [
  ['ما هذا؟', 'موقع مجاني لإدارة مناظرة طويلة بين أصدقاء: كل رد مرتبط بالنقطة التي يرد عليها، وكل نقطة مفتوحة تُظهر من ينتظر ردّه. الأداة تنظّم الحوار ولا تحكم لأحد؛ لا نقاط ولا تصويت ولا «فائز».'],
  ['أين تُحفظ المناظرة؟', 'على جهازك فقط (في تخزين المتصفح). لا يوجد خادم لنا، ولا حسابات.'],
  ['ماذا يخرج من جهازك؟', 'في الوضع «اليدوي»: لا شيء إلا ما ترسله بنفسك (رابط تحديث أو ملف). في وضع «المزامنة عبر خوادم عامة»: نسخ مشفّرة من نقاطك تُرسَل إلى خوادم «نوستر» عامة يديرها آخرون. لا يستطيعون قراءة المحتوى، لكنهم يرون توقيت الإرسال وحجمه وعنوان IP، ويمكنهم ربط نشاط المناظرة الواحدة ببعضه. ولا تضمن هذه الخوادم الاحتفاظ بالبيانات مدة طويلة؛ لذلك يحتفظ كل جهاز بالمناظرة كاملة.'],
  ['الرابط هو المفتاح', 'من يملك رابط الدعوة يستطيع قراءة المناظرة والمشاركة فيها. الرابط يبقى في محادثة واتساب وفي نسخها الاحتياطية (غير المشفّرة ما لم تفعّل التشفير في واتساب)، وقد يبقى في سجل المتصفح. لا يمكن سحب الرابط بعد إرساله.'],
  ['التوقيع', 'كل نقطة موقّعة بمفتاح كاتبها المحفوظ على جهازه، فلا يستطيع حامل الرابط أن يكتب باسم مشارك موجود؛ لكنه يستطيع الانضمام باسم جديد. إن أرسلت «رابط الهوية» فمن يملكه يكتب باسمك.'],
  ['من يرى زيارتك للموقع؟', 'الموقع مستضاف على GitHub Pages، وGitHub يسجّل عناوين IP للزوار لأغراض أمنية. الجزء الذي بعد «#» في الرابط (وفيه المفتاح) لا يُرسل إلى أي خادم.'],
  ['ما لا نفعله أبداً', 'لا إحصاءات ولا متتبّعات ولا خطوط أو سكربتات من مواقع أخرى، ولا أرشفة في محركات البحث.'],
  ['فحص الجهاز', 'المناظرة محفوظة على هاتفك غير مشفّرة؛ من يفتح هاتفك يستطيع قراءتها. يمكنك إخفاء العناوين في الصفحة الرئيسية، وحذف المناظرة من الجهاز في أي وقت.'],
  ['الشفرة مفتوحة', 'شفرة الموقع منشورة على GitHub في المستودع Ahmad-Nayfeh/Repo-B.'],
];
const ABOUT_EN = [
  ['What is this?', 'A free site for long debates between friends: every reply is attached to the point it answers, and every open point shows whose reply is awaited. The tool structures the debate and judges no one: no scores, votes or "winner".'],
  ['Where is the debate stored?', 'On your device only (browser storage). There is no server of ours and no accounts.'],
  ['What leaves your device?', '"Manual" mode: nothing except what you send yourself (an update link or file). "Sync via public servers": encrypted copies of your points are sent to public Nostr relays run by others. They cannot read the content, but they see timing, size and IP address, and can link one debate\'s activity together. They do not promise to keep data long; that is why every device keeps the whole debate.'],
  ['The link is the key', 'Whoever has the invite link can read and take part. The link stays in the WhatsApp chat and its backups (unencrypted unless you turn on WhatsApp\'s encrypted backup), and may stay in browser history. A sent link cannot be revoked.'],
  ['Signatures', 'Every point is signed with its author\'s key, kept on their device, so a link holder cannot write as an existing participant — but can join under a new name. If you send your "identity link", whoever has it can write as you.'],
  ['Who sees your visit?', 'The site is hosted on GitHub Pages, and GitHub logs visitor IP addresses for security. The part of the link after "#" (which holds the key) is never sent to any server.'],
  ['What we never do', 'No analytics, trackers, or third-party fonts or scripts, and no search-engine indexing.'],
  ['Device inspection', 'The debate is stored unencrypted on your phone; anyone who can open your phone can read it. You can hide titles on the home screen and delete a debate from the device at any time.'],
  ['Open source', 'The code is public on GitHub in the repository Ahmad-Nayfeh/Repo-B.'],
];

const GUIDE_AR = [
  ['١. ابدأ', 'اكتب السؤال محل النزاع ودعواك، ثم شارك رابط الدعوة مع صاحبك على واتساب.'],
  ['٢. صفحة «الحالة»', 'أول ما تراه: «بانتظارك» — نقاط عليك الرد عليها، ونقاط «دورك» فيها بعد أن أجاب صاحبك. وكذلك ما ينتظر صاحبك، بالطريقة نفسها.'],
  ['٣. الرد', 'افتح أي نقطة واضغط «ردّ». يقترح التطبيق الحركة المناسبة (مثل «أعترض» أو «أجيب بدليل») ويمكنك اختيار غيرها: «ما دليلك؟»، «ماذا تقصد؟»، «أقبل هذا»، وفي «المزيد»: النقض بشاهد، والمعارضة، وطلب توثيق النقل، وتعريف المصطلح، والاتفاق على الاختلاف.'],
  ['٤. لا شيء يُغلق بالسكوت', 'النقطة المفتوحة تبقى مفتوحة حتى يُجاب عنها أو يُسلَّم بها أو تُسحب أو تتفقا على الاختلاف فيها.'],
  ['٥. المصطلحات', 'إذا اختلف معنى كلمة بينكما فأضف «تعريف مصطلح»؛ ويظهر في تبويب «المصطلحات» متفقاً عليه أو محل خلاف.'],
  ['٦. الإملاء الصوتي', 'لتتكلم بدل الكتابة استخدم زر الميكروفون في لوحة مفاتيح هاتفك. على آيفون يدعم الإملاء العربية على الجهاز نفسه في الطرز الحديثة. في Gboard قد يُرسل الصوت إلى خوادم Google؛ جرّب وضع الطيران لتعرف هل يعمل دون إنترنت. ويمكنك نسخ نص «التفريغ» الذي يوفّره واتساب لرسالة صوتية ولصقه هنا.'],
  ['٧. احفظ مناظرتك', 'ثبّت الموقع على الشاشة الرئيسية، واحفظ «نسخة احتياطية» بين حين وآخر. على آيفون: التطبيق المثبّت له تخزين منفصل عن سفاري، فالصق رابط الدعوة داخله بعد التثبيت.'],
];
const GUIDE_EN = [
  ['1. Start', 'Write the question in dispute and your claim, then share the invite link with your friend on WhatsApp.'],
  ['2. The "Status" page', 'The first thing you see: "Waiting on you" — points you owe a reply on, and points where it is "your move" after your friend answered. The same is shown for your friend.'],
  ['3. Replying', 'Open any point and tap "Reply". The app suggests a fitting move (e.g. "I object" or "Answer with a reason"); you can choose another: "What is your proof?", "What do you mean?", "I accept this", and under "More": refutation with a witness, counter-argument, ask for the source, define a term, agree to disagree.'],
  ['4. Silence closes nothing', 'An open point stays open until it is answered, conceded, withdrawn, or you agree to disagree on it.'],
  ['5. Terms', 'If a word means different things to you, add "Define a term"; it appears in the Terms tab as agreed or disputed.'],
  ['6. Dictation', 'To speak instead of typing, use your phone keyboard\'s microphone. On recent iPhones, dictation supports Arabic on-device. With Gboard, audio may go to Google\'s servers; try airplane mode to see whether it works offline. You can also copy WhatsApp\'s own transcript of a voice note and paste it here.'],
  ['7. Keep your debate safe', 'Install the site to your home screen and save a backup now and then. On iPhone the installed app has storage separate from Safari: paste the invite link inside it after installing.'],
];

function Sections({ items }: { items: string[][] }) {
  return <>{items.map(([h, p]) => <section key={h} class="panel"><h2 class="section-title">{h}</h2><p>{p}</p></section>)}</>;
}

export function About() {
  return (
    <div class="page"><TopBar title={t('about.title')} back="#/" />
      <main class="content"><Sections items={lang.value === 'ar' ? ABOUT_AR : ABOUT_EN} />
        <section class="panel"><h2 class="section-title">{t('join.charter')}</h2><Charter /></section>
      </main></div>
  );
}
export function Guide() {
  return <div class="page"><TopBar title={t('guide.title')} back="#/" /><main class="content"><Sections items={lang.value === 'ar' ? GUIDE_AR : GUIDE_EN} /></main></div>;
}
