import fs from 'node:fs';

const AI_PATH = 'shared/js/rfa-ai.js';
const MARKER = 'RFA Guide conversational layer v4';

let source = fs.readFileSync(AI_PATH, 'utf8');

if (!source.includes(MARKER)) {
  const answerNeedle = '  function answer(query) {';
  if (!source.includes(answerNeedle)) throw new Error('Could not find answer(query) in rfa-ai.js');

  const helpers = `  // ${MARKER}: handle safe conversational questions without sending visitors into factual website search.\n  function conversationalAnswer(q) {\n    const words = q.split(' ').filter(Boolean);\n    const shortMessage = words.length <= 6;\n\n    if (/\\b(?:what is|what's|whats) your name\\b|\\bwhat should i call you\\b|^your name\\??$/.test(q)) {\n      return '<strong>My name is RFA Guide.</strong> I am Royal Family Academy’s automated website guide. I help visitors find verified information about Nursery &amp; Primary, High School and Sixth Form College.';\n    }\n\n    if (/^who are you\\??$|\\btell me about yourself\\b/.test(q)) {\n      return '<strong>I am RFA Guide</strong>, Royal Family Academy’s automated website assistant. I answer from verified RFA website information and, when I cannot verify something confidently, I will ask you to rephrase or connect you with RFA on WhatsApp.';\n    }\n\n    if (/\\bare you (?:an )?(?:ai|bot|robot)\\b|\\bare you human\\b|\\bare you a person\\b/.test(q)) {\n      return 'I am an <strong>automated RFA website guide</strong>, not a member of staff. I use verified RFA website information to answer questions and can direct you to the RFA team when human help is needed.';\n    }\n\n    if (/\\bwhat can you do\\b|\\bhow can you help\\b|\\bwhat do you do\\b|\\bwhat can i ask you\\b/.test(q)) {\n      return 'You can ask me about <strong>admissions, age requirements, curriculum and subjects, leadership, facilities, student life, learning support, contact information, school policies</strong> and other information published by RFA. If I cannot verify an answer confidently, I will ask you to rephrase or connect you to RFA on WhatsApp.';\n    }\n\n    if (shortMessage && /^(?:hi|hello|hey|good morning|good afternoon|good evening)(?: there)?$/.test(q)) {\n      return 'Hello! I’m <strong>RFA Guide</strong>. How can I help you with Royal Family Academy today?';\n    }\n\n    if (shortMessage && /^(?:how are you|how are you doing|how do you do)$/.test(q)) {\n      return 'I’m ready to help. You can ask me anything about Royal Family Academy that is covered by the verified RFA website information.';\n    }\n\n    if (shortMessage && /^(?:thank you|thanks|thank you very much|thanks a lot|okay thanks|ok thanks)$/.test(q)) {\n      return 'You’re welcome. If you have another RFA question, I’m here to help.';\n    }\n\n    if (shortMessage && /^(?:bye|goodbye|see you|see you later)$/.test(q)) {\n      return 'Goodbye. You can come back anytime you need information about Royal Family Academy.';\n    }\n\n    return null;\n  }\n\n`;

  source = source.replace(answerNeedle, helpers + answerNeedle);

  const emptyNeedle = '    if (!q) return fallback();';
  if (!source.includes(emptyNeedle)) throw new Error('Could not find empty-query guard in rfa-ai.js');
  source = source.replace(
    emptyNeedle,
    `${emptyNeedle}\n\n    const conversation = conversationalAnswer(q);\n    if (conversation) return conversation;`
  );

  fs.writeFileSync(AI_PATH, source, 'utf8');
  console.log('Upgraded RFA Guide with conversational self-identity and social responses.');
} else {
  console.log('RFA Guide conversational layer is already current.');
}
