const fs = require('fs');
const path = require('path');

const snapshot = JSON.parse(fs.readFileSync('snapshots/latest.json', 'utf8'));
const now = new Date();
const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

console.log("=== DASHBOARD ALIGNMENT AUDIT ===");
console.log(`Snapshot timestamp: ${snapshot.timestamp}`);

// 1. Cron jobs check - compare with actual cron list
console.log("\n1. CRON JOBS CHECK:");
const snapshotCronCount = snapshot.cronJobs?.length || 0;
console.log(`Snapshot cron jobs: ${snapshotCronCount}`);
console.log("Actual cron jobs: 21");
if (snapshotCronCount !== 21) {
  console.log("❌ MISMATCH: Snapshot has different cron count");
}

// 2. BTS data consistency 
console.log("\n2. BTS DATA CONSISTENCY:");
const btsSeoplan = snapshot.btsSeoplan;
const btsSeoDash = snapshot.btsSeoDash;

if (btsSeoplan && btsSeoDash) {
  console.log(`btsSeoplan lastUpdated: ${btsSeoplan.lastUpdated || 'null'}`);
  console.log(`btsSeoDash lastUpdated: ${btsSeoDash.lastUpdated}`);
  
  // Check for conflicting numbers
  if (btsSeoplan.totalPages !== btsSeoDash.totalPages) {
    console.log(`❌ PAGE COUNT CONFLICT: plan=${btsSeoplan.totalPages}, dash=${btsSeoDash.totalPages}`);
  }
} else {
  console.log("❌ Missing BTS data sections");
}

// 3. NBHW data consistency
console.log("\n3. NBHW DATA CONSISTENCY:");
const nbhwSeo = snapshot.nbhwSeo;
const nbhwSeoAudit = snapshot.nbhwSeoAudit;

if (nbhwSeo && nbhwSeoAudit) {
  console.log(`nbhwSeo lastUpdated: ${nbhwSeo.lastUpdated || 'null'}`);
  console.log(`nbhwSeoAudit lastUpdated: ${nbhwSeoAudit.lastUpdated || 'null'}`);
  
  if (nbhwSeo.overallScore !== nbhwSeoAudit.overallScore) {
    console.log(`❌ SCORE CONFLICT: seo=${nbhwSeo.overallScore}, audit=${nbhwSeoAudit.overallScore}`);
  }
} else {
  console.log("❌ Missing NBHW data sections");
}

// 4. Check for stale data (>7 days)
console.log("\n4. STALE DATA CHECK:");
const staleData = [];

Object.keys(snapshot).forEach(key => {
  if (snapshot[key] && typeof snapshot[key] === 'object' && snapshot[key].lastUpdated) {
    const lastUpdate = new Date(snapshot[key].lastUpdated);
    if (lastUpdate < sevenDaysAgo) {
      staleData.push(`${key}: ${snapshot[key].lastUpdated}`);
    }
  }
});

if (staleData.length > 0) {
  console.log("❌ STALE DATA FOUND:");
  staleData.forEach(item => console.log(`  ${item}`));
} else {
  console.log("✅ No stale data");
}

// 5. Check publish ledgers for news limits
console.log("\n5. PUBLISH LEDGER CHECK:");
const btsPublishLedger = snapshot.btsPublishLedger;
if (btsPublishLedger && btsPublishLedger.newsBank) {
  if (btsPublishLedger.newsBank.monthlyLimit) {
    console.log(`✅ BTS news limit: ${btsPublishLedger.newsBank.monthlyLimit}`);
  } else {
    console.log("❌ BTS publish ledger missing news limits");
  }
}

// 6. Course details consistency
console.log("\n6. COURSE DETAILS CHECK:");
const btsCourseDetails = snapshot.btsCourseDetails;
if (btsCourseDetails && btsCourseDetails.courses) {
  const sources = new Set();
  const duplicateSources = [];
  
  btsCourseDetails.courses.forEach(course => {
    if (course.source) {
      if (sources.has(course.source)) {
        duplicateSources.push(course.source);
      }
      sources.add(course.source);
    }
  });
  
  if (duplicateSources.length > 0) {
    console.log(`❌ DUPLICATE SOURCES: ${duplicateSources.join(', ')}`);
  } else {
    console.log("✅ No duplicate sources");
  }
}

// 7. Client pricing check - search entire snapshot for £300
console.log("\n7. CLIENT PRICING CHECK:");
const snapshotString = JSON.stringify(snapshot);
const pricingMatches = snapshotString.match(/£300|300.*pound|300.*gbp/gi);
if (pricingMatches) {
  console.log(`🚨 ALERT: CLIENT PRICING FOUND: ${pricingMatches.join(', ')}`);
} else {
  console.log("✅ No client pricing detected");
}

console.log("\n=== AUDIT COMPLETE ===");
