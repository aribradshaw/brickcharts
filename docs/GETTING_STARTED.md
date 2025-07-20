# 🚀 Getting Started with BrickCharts

Welcome to BrickCharts! This guide will walk you through everything you need to know to start working with Billboard chart data.

## 📋 Prerequisites

- **Node.js** 16+ (check with `node --version`)
- **npm** or **yarn** package manager
- **Internet connection** (for Billboard API access)

## ⚡ 5-Minute Quick Start

### Step 1: Clone or Download
```bash
git clone https://github.com/aribradshaw/brickcharts.git
cd brickcharts
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Test Everything Works
```bash
# Interactive testing (BEST first experience)
npm run test:interactive
```

**What you'll see:**
- Menu with 10 testing options
- Real Billboard data fetching
- Performance metrics
- All features working

### Step 4: Explore the Demo
```bash
npm run demo
```

**What you'll see:**
- ✅ Service health check
- 📊 255+ available charts
- 🔥 Current Hot 100 with real data
- 📈 Trend analysis
- 💾 Cache performance

## 🧪 Detailed Testing Guide

### 🎯 **Test 1: Interactive Menu** (Recommended First)

```bash
npm run test:interactive
```

**Try these menu options:**

**Option 1: Chart Fetching**
- Enter `1`
- Press Enter (uses default 'hot-100')
- **Expected**: Hot 100 loads in 1-3 seconds with 100 songs

**Option 4: Search Features**
- Enter `4`
- Choose `1` (Search by artist)
- Type: `taylor swift`
- Choose: `n` (no fuzzy matching)
- **Expected**: Find Taylor Swift songs if they're on current charts

**Option 5: Export Functions**
- Enter `5`
- Choose `1` (Export as CSV)
- **Expected**: Creates CSV file with chart data

**Option 9: Full Demo**
- Enter `9`
- **Expected**: Runs all features automatically

### 📊 **Test 2: Core Demo**

```bash
npm run demo
```

**What to watch for:**
1. **Health Check**: Should show `{ billboard: true }`
2. **Available Charts**: Lists 255+ chart types
3. **Hot 100**: Shows current #1 song with trend arrows
4. **Performance**: Cache stats and timing info

### 🧩 **Test 3: Unit Tests**

```bash
npm test
```

**Expected results:**
- 18+ passing tests
- Search Engine tests all pass
- Export Manager tests all pass
- Core functionality validated

### 🔨 **Test 4: Build Process**

```bash
npm run build
```

**Expected output:**
- TypeScript compilation successful
- Bundle generated: `dist/brickcharts.es.js` (~71KB)
- No build errors

## 💡 Understanding the Results

### Chart Data Structure
When you fetch a chart, you get:
```typescript
{
  chartType: "hot-100",
  date: Date,
  entries: [
    {
      rank: 1,
      title: "Song Title",
      artist: "Artist Name",
      lastWeek: 2,        // Previous position
      weeksOnChart: 15,   // How long on chart
      peakPosition: 1     // Best ever position
    }
    // ... 99 more entries
  ],
  totalEntries: 100
}
```

### Performance Expectations
- **First fetch**: 1-3 seconds (depends on internet)
- **Cached fetch**: <50ms (super fast!)
- **Search**: <50ms after data is indexed
- **Export**: <500ms for typical charts

### Common Data You'll See
- **Hot 100**: Current popular songs
- **Billboard 200**: Albums chart
- **Artist 100**: Most popular artists
- **255+ more charts**: Various genres and formats

## 🎮 Interactive Features to Try

### Search Experiments
```bash
# In interactive tester, try these searches:
# Option 4 → Search Features

1. "Taylor Swift" - exact artist match
2. "Tayler Swift" with fuzzy=yes - handles typos
3. Quick search "mor" - should suggest "Morgan Wallen"
4. Advanced search with rank 1-10 - only top 10 results
```

### Export Experiments
```bash
# In interactive tester:
# Option 5 → Export Functions

1. CSV export - creates spreadsheet-ready data
2. JSON export - complete data structure
3. SVG export - creates visual chart image
```

### Performance Experiments
```bash
# In interactive tester:
# Option 6 → Caching
# Option 7 → Performance

- First fetch: measures fresh load time
- Second fetch: shows cache speedup
- Multiple fetches: shows consistency
```

## 🔍 What's Next?

### For Developers
1. **Read the Code**: Start with `src/core/BrickCharts.ts`
2. **API Reference**: Check `docs/USAGE_GUIDE.md`
3. **Add Features**: Try implementing new chart sources
4. **React Components**: Explore `src/components/`

### For Users
1. **Integration**: Add to your project with `npm install brickcharts`
2. **Custom Apps**: Build chart visualizations
3. **Data Analysis**: Export data for research
4. **Real-time Monitoring**: Track chart changes

### Example Integration
```typescript
import { BrickCharts } from 'brickcharts';

const charts = new BrickCharts();

// Get current hit songs
const hot100 = await charts.getChart('hot-100');
console.log(`#1 song: ${hot100.entries[0].title}`);

// Find trending artists
const trends = await charts.getTrends('hot-100');
console.log('Rising artists:', trends.topMovers.climbers);
```

## 🆘 Troubleshooting

### "Command not found" or "npm: command not found"
**Solution**: Install Node.js from [nodejs.org](https://nodejs.org)

### "Billboard service unavailable"
**Solutions**:
- Wait 5-10 minutes (temporary issues)
- Check internet connection
- Try: `npm run test:interactive` → Option 8 (Health Check)

### "No search results found"
**Solution**: Chart data needs to be indexed first. The interactive tester does this automatically.

### "Export fails"
**Solutions**:
- Check file permissions
- Try different export format
- Validate options first

### "Tests failing"
**Solutions**:
- Run `npm install` again
- Clear cache: `npm cache clean --force`
- Check Node.js version: `node --version` (need 16+)

## 📚 Additional Resources

- **Full Documentation**: `docs/USAGE_GUIDE.md`
- **API Reference**: All functions and types documented
- **Examples**: Check the `demo/` folder
- **React Components**: See `src/components/`

## 🎉 You're Ready!

After completing these tests, you'll have:
- ✅ Verified BrickCharts works on your system
- ✅ Seen real Billboard data flowing
- ✅ Tested search, export, and caching
- ✅ Confirmed performance is good
- ✅ Built the library successfully

**Next Steps:**
1. Integrate into your project: `npm install brickcharts`
2. Build something amazing with music data!
3. Share your creation with the community

---

**🎵 Happy charting!** If you run into any issues, check the troubleshooting section above or open an issue on GitHub. 