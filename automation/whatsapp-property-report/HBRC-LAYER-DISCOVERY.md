# HBRC Layer Discovery Results

**Date:** 2026-08-16 15:45 GMT+2  
**Status:** 🟡 Partial Success - Portal Identified, Manual Discovery Needed

---

## ✅ What We Found

### HBRC Hazard Portal Details

**Portal URL:** https://gis.hbrc.govt.nz/hazards/  
**Item ID:** `9e5f7947822440dcb01b4ea2cbb1b3b5`  
**Owner:** HBRC GISAdmin  
**Last Updated:** 27 July 2023  
**View Count:** 71 views  
**Sharing:** Public (Everyone)

### Confirmed Hazard Layers Available

From the portal description, these layers are definitely available:

1. **Earthquake Fault Lines**
   - Earthquake hazards in Hawke's Bay Initial assessment
   - Active Fault Mapping and Fault Avoidance Zones (Napier City)

2. **Earthquake Liquefaction** ⭐ CRITICAL
   - Assessment of liquefaction risk in Hawke's Bay: Volume 1
   - Appendices with liquefaction hazard model

3. **Earthquake Amplification**
   - Ground shaking amplification potential

4. **Tsunami Inundation Extents**
   - Hawkes Bay Tsunami Inundation by Attenuation Rule

5. **Flooding Extents** ⭐ CRITICAL
   - Wairoa River Flood Hazard Study
   - Te Ngaru Catchment Flood Hazard Study
   - Waipatiki Catchment Flood Hazard Analysis
   - Kopuawhara Opoutama Flood Hazard Analysis

6. **Coastal Hazard** ⭐ CRITICAL
   - Clifton to Tangoio Coastal Hazards Strategy 2120
   - Coastal Risk Assessment
   - Cliff Hazard Zone Delineation

7. **Landslide Risk**
   - Earthquake-Induced Landslide Forecast (Bluff Hill, Napier)

8. **Quaternary Geology**

9. **Wairoa River Bank Stability Zones**

---

## 🔍 API Access Attempts

### Tested Endpoints

| Endpoint | Result | Notes |
|----------|--------|-------|
| `https://services.arcgis.com/9e5f.../arcgis/rest/services` | ✅ Status 200 | Base endpoint exists but returned 0 services |
| `https://gis.hbrc.govt.nz/server/rest/services` | ❌ Timeout | Server not responding |
| `https://gis.hbrc.govt.nz/arcgis/rest/services` | ❌ Timeout | Server not responding |
| `https://gis.hbrc.govt.nz/hazards/rest/services` | ❌ Failed | Not found |

### Challenges
- HBRC server appears to have strict rate limiting or bot detection
- Automated HTTP requests timing out (10+ seconds)
- May require browser-based interaction or specific headers

---

## 📋 Manual Discovery Steps (For Gerhard)

Since automated access is blocked, please follow these steps **in your browser**:

### Step 1: Open the Hazard Portal
**URL:** https://gis.hbrc.govt.nz/hazards/

### Step 2: Open Browser Developer Tools
- Press `F12` or `Ctrl+Shift+I` (Chrome/Edge/Firefox)
- Go to **Network** tab

### Step 3: Clear Network Log & Reload
- Click the 🚫 (clear) button in Network tab
- Refresh the page (`F5`)

### Step 4: Filter for Map Services
In the network filter box, type:
```
MapServer
```
or
```
FeatureServer
```

### Step 5: Look for URLs Like These

You should see requests that look like:

```
https://gis.hbrc.govt.nz/server/rest/services/Hazards/Liquefaction/MapServer/?f=json
```

or

```
https://gis.hbrc.govt.nz/arcgis/rest/services/NaturalHazards/Flood/FeatureServer/0/query?f=json
```

### Step 6: Copy the Base URLs

For each critical layer, copy the **base URL** (without the `?f=json` part):

**Example format:**
```
https://gis.hbrc.govt.nz/server/rest/services/[FOLDER]/[LAYER_NAME]/MapServer
```

or

```
https://gis.hbrc.govt.nz/arcgis/rest/services/[FOLDER]/[LAYER_NAME]/FeatureServer/0
```

### Step 7: Test the API

Once you have a URL, test it in your browser:

```
https://gis.hbrc.govt.nz/server/rest/services/Hazards/Liquefaction/MapServer/?f=pjson
```

If it returns JSON with layer metadata, you've found a working API!

---

## 🎯 What We Need From You

Please find and send me these URLs:

### Priority 1: Critical Layers

**1. Liquefaction Susceptibility**
```
URL: [paste URL here]
Example: https://gis.hbrc.govt.nz/server/rest/services/Hazards/Liquefaction/MapServer
```

**2. Flooding (Esk River / Napier)**
```
URL: [paste URL here]
```

**3. Coastal Hazards (Clifton-Tangoio)**
```
URL: [paste URL here]
```

### Priority 2: Additional Layers

**4. Tsunami Inundation**
```
URL: [paste URL here]
```

**5. Earthquake Fault Lines**
```
URL: [paste URL here]
```

**6. Landslide Risk**
```
URL: [paste URL here]
```

---

## 💡 Alternative Approach: Web Map Viewer

If the above doesn't work, try this:

### Option A: Check the Web Map

1. On the hazard portal, click **"View"** or **"Open in Map Viewer"**
2. Once the map loads, open Developer Tools (`F12`)
3. Go to **Network** tab
4. Filter by: `query` or `export`
5. Look for requests containing layer data
6. Right-click the request → **Copy** → **Copy link address**

### Option B: Check Page Source

1. On the hazard portal page, right-click → **View Page Source**
2. Search (`Ctrl+F`) for:
   - `services.arcgis.com`
   - `MapServer`
   - `FeatureServer`
   - `arcgis/rest/services`
3. Copy any URLs you find

---

## 🧪 Once You Have URLs

**Send me the URLs** and I'll immediately:

1. ✅ Test each API endpoint
2. ✅ Parse the layer structure
3. ✅ Implement in `hazard-fetcher.js`
4. ✅ Test with real coordinates
5. ✅ Integrate with report engine

**Estimated integration time:** 15-20 minutes per layer once we have working URLs

---

## 🚀 Backup Plan: Direct Data Download

If API access proves too difficult:

### Check for Download Options

Look for buttons like:
- "Download Data"
- "Export to GeoJSON"
- "Download Shapefile"
- "Open Data"

Many ArcGIS portals allow direct download even if API is restricted.

**If downloads are available:**
- Download GeoJSON files for each layer
- I'll implement local file lookup instead of API calls
- Still provides value, just not real-time updates

---

## 📞 Contact HBRC GIS (Last Resort)

If all else fails, we can contact HBRC directly:

**Email:** gis@hbrc.govt.nz (likely address)  
**Request:**

> "Kia ora, we're developing a property due diligence service for Hawke's Bay and would like to integrate your hazard mapping data via API. Could you please provide the ArcGIS REST API endpoints for your liquefaction, flood, and coastal hazard layers? Thank you!"

---

*Discovery results by Seb | AI Driven | 2026-08-16 15:45*
