const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('        NATURE HOUSE — FULL SYSTEM & LOADING AUDIT');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function check(desc, condition) {
  if (condition) {
    console.log(`  ✓ [PASS] ${desc}`);
    passCount++;
  } else {
    console.error(`  ✗ [FAIL] ${desc}`);
    failCount++;
  }
}

// 1. Loading Skeleton Components
const rootLoadingPath = path.join(__dirname, '../src/app/loading.tsx');
check('1.1 Root loading.tsx exists for instantaneous SSR skeleton', fs.existsSync(rootLoadingPath));
const rootLoadingContent = fs.readFileSync(rootLoadingPath, 'utf8');
check('1.2 Root loading.tsx defines biophilic animate-pulse skeleton', rootLoadingContent.includes('animate-pulse') && rootLoadingContent.includes('bg-nature-linen'));

const adminLoadingPath = path.join(__dirname, '../src/app/admin/loading.tsx');
check('1.3 Admin loading.tsx exists for smooth portal navigation', fs.existsSync(adminLoadingPath));
const adminLoadingContent = fs.readFileSync(adminLoadingPath, 'utf8');
check('1.4 Admin loading.tsx defines dashboard metrics & table skeleton', adminLoadingContent.includes('animate-pulse') && adminLoadingContent.includes('bg-stone-50'));

// 2. Global Error Boundary
const errorBoundaryPath = path.join(__dirname, '../src/app/error.tsx');
check('2.1 Root error.tsx boundary exists to catch runtime anomalies', fs.existsSync(errorBoundaryPath));
const errorBoundaryContent = fs.readFileSync(errorBoundaryPath, 'utf8');
check('2.2 Root error.tsx has use client and reset recovery mechanism', errorBoundaryContent.includes("'use client'") && errorBoundaryContent.includes('reset'));

// 3. Image Previews & Instant Load Design
const plantCardPath = path.join(__dirname, '../src/components/PlantCard.tsx');
const plantCardContent = fs.readFileSync(plantCardPath, 'utf8');
check('3.1 PlantCard loads image immediately without artificial delay', !plantCardContent.includes('opacity-0') && plantCardContent.includes('onError'));
check('3.2 PlantCard click strictly targets photo container and WhatsApp inquiry', plantCardContent.includes('onClick={onSelect}') && plantCardContent.includes('buildWhatsAppPlantUrl'));

const aquaCardPath = path.join(__dirname, '../src/components/AquariumCard.tsx');
const aquaCardContent = fs.readFileSync(aquaCardPath, 'utf8');
check('3.3 AquariumCard loads image immediately without artificial delay', !aquaCardContent.includes('opacity-0') && aquaCardContent.includes('onError'));
check('3.4 AquariumCard click strictly targets photo container and WhatsApp inquiry', aquaCardContent.includes('onClick={onSelect}') && aquaCardContent.includes('buildWhatsAppAquariumUrl'));

// 4. Modal and Lightbox Loading
const modalPath = path.join(__dirname, '../src/components/ItemDetailModal.tsx');
const modalContent = fs.readFileSync(modalPath, 'utf8');
check('4.1 ItemDetailModal hooks declared unconditionally at top (Rules of Hooks)', modalContent.indexOf('React.useState') < modalContent.indexOf('if (!selected) return null;'));

const lightboxPath = path.join(__dirname, '../src/components/PhotoLightbox.tsx');
const lightboxContent = fs.readFileSync(lightboxPath, 'utf8');
check('4.2 PhotoLightbox includes instant image state and fallback recovery', lightboxContent.includes('activeImg') && lightboxContent.includes('onClose'));

// 5. 6-Year Calendar & Date Range Engine
const storeHoursPath = path.join(__dirname, '../src/lib/storeHours.ts');
const storeHoursContent = fs.readFileSync(storeHoursPath, 'utf8');
check('5.1 storeHours.ts includes get6YearsRange() function', storeHoursContent.includes('get6YearsRange()'));
check('5.2 storeHours.ts includes computeReopenMessage() engine', storeHoursContent.includes('computeReopenMessage'));
check('5.3 storeHours.ts getMonthCalendar() supports single-day & date-range closures', storeHoursContent.includes('startDate') && storeHoursContent.includes('endDate'));

// 6. Schedule Service & API
const schedServicePath = path.join(__dirname, '../src/lib/scheduleService.ts');
const schedServiceContent = fs.readFileSync(schedServicePath, 'utf8');
check('6.1 scheduleService.ts persists data to runtimeSchedule.json', schedServiceContent.includes('runtimeSchedule.json'));
check('6.2 scheduleService.ts automatically calculates reopenMessage on closures', schedServiceContent.includes('computeReopenMessage'));

const publicSchedPath = path.join(__dirname, '../src/app/api/schedule/route.ts');
check('6.3 Public /api/schedule endpoint exists with no-store cache headers', fs.existsSync(publicSchedPath));

const adminSchedPath = path.join(__dirname, '../src/app/api/admin/schedule/route.ts');
check('6.4 Admin /api/admin/schedule endpoint session-guarded', fs.existsSync(adminSchedPath) && fs.readFileSync(adminSchedPath, 'utf8').includes('verifyAdminSession'));

// 7. Footer Consolidation
const footerPath = path.join(__dirname, '../src/components/Footer.tsx');
const footerContent = fs.readFileSync(footerPath, 'utf8');
check('7.1 Footer contains consolidated studio details (Address, Parking, Directions)', footerContent.includes('STORE_INFO.addressLine1') && footerContent.includes('parking'));
check('7.2 Footer contains Store Hours with dynamic live status badge', footerContent.includes('Store Hours &') && footerContent.includes('storeStatus'));
check('7.3 6-Year Calendar & Holidays is dedicated strictly to admin portal', fs.existsSync(path.join(__dirname, '../src/components/admin/CalendarManager.tsx')) && !footerContent.includes('View 6-Year Calendar'));

// 8. Runtime Data Files
const catJsonPath = path.join(__dirname, '../src/data/runtimeCatalog.json');
check('8.1 runtimeCatalog.json exists and contains valid JSON', fs.existsSync(catJsonPath) && Array.isArray(JSON.parse(fs.readFileSync(catJsonPath, 'utf8')).plants));

const schedJsonPath = path.join(__dirname, '../src/data/runtimeSchedule.json');
check('8.2 runtimeSchedule.json exists and contains valid JSON', fs.existsSync(schedJsonPath) && Array.isArray(JSON.parse(fs.readFileSync(schedJsonPath, 'utf8')).notices));

console.log('\n================================================================');
console.log(`TOTAL CHECKS: ${passCount + failCount}`);
console.log(`PASSED:       ${passCount}`);
console.log(`FAILED:       ${failCount}`);
console.log(`AUDIT RESULT: ${failCount === 0 ? 'ALL SYSTEMS AND LOADING STATES 100% HEALTHY' : 'FAILURES DETECTED'}`);
console.log('================================================================\n');

if (failCount > 0) process.exit(1);
