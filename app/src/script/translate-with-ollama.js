import { spawn } from 'child_process';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { SUPPORTED_LOCALES } from '../plugins/i18n/index.js';

const ollamaModel = 'qwen3:8b';
const sourceLang = 'en';
const localesDir = './src/plugins/i18n/locales';

const targetLangs =
   process.argv[2]?.split?.(',').filter?.(Boolean) ||
   SUPPORTED_LOCALES.value.map((lang) => lang.value.trim());

if (targetLangs?.length <= 0) {
   console.error("Usage: node translate-ollama-json.js '<lang1,lang2,...>'");
   process.exit(1);
}

async function isOllamaAvailable() {
   try {
      const res = await fetch('http://localhost:11434');
      if (res.ok) console.log(`✅ ${await res.text()}\n`);
      return res.ok;
   } catch (err) {
      console.log(err);
      return false;
   }
}

async function askOllama(prompt) {
   const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
         model: ollamaModel,
         keep_alive: '2m',
         messages: [{ role: 'user', content: prompt }],
         stream: false,
         think: false,
         options: {
            temperature: 0.1
         }
      })
   });

   const data = await response.json();

   const match = data.message?.content?.match(/<think>([\s\S]*?)<\/think>/i);
   const thought = match?.[1]?.trim();
   const answer = data.message.content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

   data.message.content = answer;

   return data;
}

async function translateFile(file, targetLang) {
   const srcPath = path.join(localesDir, '', 'template.json');
   const destPath = path.join(localesDir, targetLang, file);

   const rawSource = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
   const excludedSource = JSON.parse(
      fs.readFileSync(path.join(localesDir, 'template.exclude.json'), 'utf8')
   );
   const rawTarget = fs.existsSync(destPath) ? JSON.parse(fs.readFileSync(destPath, 'utf8')) : {};

   _.merge(rawSource, excludedSource);

   const missingEntries = {};

   function findMissing(sourceNode, targetNode, path = []) {
      for (const key in sourceNode) {
         const sourceVal = sourceNode[key];
         const targetVal = targetNode?.[key];

         if (_.isPlainObject(sourceVal)) {
            findMissing(sourceVal, targetVal || {}, path.concat(key));
         } else {
            if (
               targetVal === undefined ||
               targetVal === '' ||
               targetVal === sourceVal // simple heuristic for untranslated
            ) {
               _.set(missingEntries, path.concat(key), sourceVal);
            }
         }
      }
   }

   findMissing(rawSource, rawTarget);

   const keys = Object.keys(_.flattenDeep(Object.keys(missingEntries)));
   if (keys.length === 0) {
      console.log(`🟢 No missing translations for ${targetLang}/${file}`);
      return;
   }

   console.time(`✓ Translated ${destPath} to ${targetLang}`);

   const missingKeys = _.keys(missingEntries);
   const chunkSize = 2;
   const chunks = [];

   for (let i = 0; i < missingKeys.length; i += chunkSize) {
      const chunkKeys = missingKeys.slice(i, i + chunkSize);
      const chunk = {};
      for (const key of chunkKeys) {
         chunk[key] = missingEntries[key];
      }
      chunks.push(chunk);
   }

   const translatedChunks = [];

   for (const chunk of chunks) {
      const chunkString = JSON.stringify(chunk, null, 2);
      const prompt = `
Translate the following JSON object to **${targetLang}**.
This JSON contains interface text for a Hearing Aid CRM application used by clinics, audiologists, and patients.

**Translation rules:**
- Use a **formal and professional tone** suitable for medical and clinical software interfaces.
- Keep the **JSON structure** exactly the same.
- Translate only the **values**, not the keys.
- Translate all values.
- If a value is empty, translate by **key** instead.
- “Tenant” means a branch, so you can translate 'tenant' as 'branch'.
- 'audit_log' simply means 'logs'
- Avoid using informal words or casual expressions.
- Use domain-specific medical terminology, especially for hearing aid terms.
- If a key contains or ends with "id":
  - If "id" is part of a meaningful label (e.g. "national_id", "identity_id"), **translate the full value**.
  - If "id" is just a technical suffix (e.g. "product_id", "client_id"), **translate only the prefix** ("product", "client").
- Do **not** return explanations, comments, or Markdown formatting.
- Return only **valid JSON** as output.
The JSON:
\`\`\`json
${chunkString}
\`\`\`
`;
      let response = await askOllama(prompt);
      const content = response.message.content;

      try {
         const jsonMatch = content.match(/```json\s*([\s\S]*?)```/i);
         const jsonText = jsonMatch ? jsonMatch[1] : content;
         const translatedChunk = JSON.parse(jsonText);
         translatedChunks.push(translatedChunk);
      } catch (err) {
         console.error(`❌ Failed to parse translated chunk for ${targetLang}/${file}:`, err);
         console.log('Raw output:', content);
         return;
      }
   }

   const mergedTranslations = Object.assign({}, ...translatedChunks);
   const updatedTarget = _.merge({}, rawTarget, mergedTranslations);

   fs.mkdirSync(path.dirname(destPath), { recursive: true });
   fs.writeFileSync(destPath, JSON.stringify(updatedTarget, null, 3), 'utf8');
   console.timeEnd(`✓ Translated ${destPath} to ${targetLang}`);
}

async function translateFiles() {
   console.log('✍️   Translating ...\n');
   const sourceDir = path.join(localesDir, sourceLang);

   const files = fs.readdirSync(sourceDir).filter((f) => f.endsWith('.json'));
   for (const lang of targetLangs) {
      for (const file of files) {
         await translateFile(file, lang);
      }
   }
}

function clearLocalesFolder() {
   const entries = fs
      .readdirSync(localesDir, { withFileTypes: true })
      .filter((e) => targetLangs.includes(e.name));

   console.log(`🧹 Clearing locale folders (${entries.map((e) => e.name).join(',')})\n`);

   for (const entry of entries) {
      if (entry.isDirectory()) {
         const dirPath = path.join(localesDir, entry.name);
         fs.rmSync(dirPath, { recursive: true, force: true });
      }
   }
}

async function prepareFoldersAndFiles() {
   // clearLocalesFolder();

   const sourceDir = path.join(localesDir, sourceLang);
   const defaultFile = 'index.json';
   const defaultFilePath = path.join(sourceDir, defaultFile);

   // Ensure source language folder exists with at least one file
   if (!fs.existsSync(sourceDir)) {
      console.log(`📁 Creating missing source language folder: ${sourceDir}\n`);
      fs.mkdirSync(sourceDir, { recursive: true });
   }

   if (!fs.existsSync(defaultFilePath)) {
      console.log(`📝 Creating default file: ${defaultFilePath}\n`);
      fs.writeFileSync(defaultFilePath, '{}', 'utf8');
   }

   const sourcePath = path.join(localesDir, sourceLang);
   const files = fs.readdirSync(sourcePath).filter((f) => f.endsWith('.json'));

   for (const lang of targetLangs) {
      const langDir = path.join(localesDir, lang);
      fs.mkdirSync(langDir, { recursive: true });

      for (const file of files) {
         const targetFilePath = path.join(langDir, file);
         if (!fs.existsSync(targetFilePath)) {
            fs.writeFileSync(targetFilePath, '{}', 'utf8');
            console.log(`+ Initialized ${lang}/${file}\n`);
         }
      }
   }
}

function runVueI18nExtract() {
   return new Promise((resolve, reject) => {
      console.log('🔍 Running vue-i18n-extract report...\n');
      const extract = spawn('npx vue-i18n-extract report', {
         shell: true,
         stdio: 'inherit'
      });

      extract.on('close', (code) => {
         if (code !== 0) {
            return reject(new Error(`vue-i18n-extract exited with code ${code}`));
         }
         resolve();
      });
   });
}

async function run() {
   if (!(await isOllamaAvailable())) {
      console.warn('⚠️ Ollama is not running or not installed. Skipping translation.');
      return;
   }

   console.time('✅ All translations completed.\n');
   await prepareFoldersAndFiles();
   await runVueI18nExtract();
   await translateFiles();

   console.timeEnd('✅ All translations completed.\n');
}

run().catch(console.error);
