# 🚨 Disaster Alert System – HackNova

**Team Name:** HackNova  
**Team Members:**  
- Anish Bandal (Team Lead)  
- Priti Chavan  
- Swati Mane  
- Atharva Gitaye  

---

## 📌 About the Project  
The **Disaster Alert System** is an **AI-powered real-time monitoring dashboard** that detects, verifies, and tracks natural disasters from **social media (Reddit)**.  
It provides emergency teams with **credible alerts, severity levels, and geolocation mapping** for better disaster management.  

---

## 🔑 Key Features  
- 🌐 **Hybrid AI Pipeline**  
  - Custom ML models for sarcasm detection, binary disaster classification, and disaster type classification.  
  - **Gemini API fallback** to re-check low-confidence predictions.  

- 📍 **Location Extraction & Mapping**  
  - NER + OpenStreetMap geocoding to pinpoint disaster locations.  

- 🔥 **Credibility & Severity Scoring**  
  - Multiple user posts increase credibility.  
  - Auto-assigns severity levels (Low, Medium, High, Critical).  

- 📊 **Next.js Frontend Dashboard**  
  - Real-time map visualization & incident logs from **Firebase Firestore**.  

- ⚡ **Reddit Integration**  
  - Streams posts from disaster-related subreddits in real time.  

---

## 🤖 AI Models & Pipeline  

Our AI system uses a **multi-stage pipeline** for accurate disaster detection:

1. **Sarcasm Detection Model**  
   - Filters out sarcastic or ironic posts.  
   - Example: *"Wow, what an amazing earthquake 🙄"* → Marked as sarcasm → Ignored.  

2. **Binary Disaster Classifier**  
   - Determines if a post actually describes a disaster or not.  
   - Example: *"Severe flooding in Pakistan displaces thousands"* → `Disaster: True`.  

3. **Multiclass Disaster Classifier**  
   - Identifies **which disaster** it belongs to (Earthquake, Flood, Fire, Hurricane, etc. – 11 types).  

4. **Location Extraction (NER)**  
   - Uses **Named Entity Recognition (NER)** to detect locations in text.  
   - Integrated with **OpenStreetMap** for latitude/longitude mapping.  

---

## 🔄 Hybrid Structure (Models + Gemini)  
- If the confidence score from our **custom ML models** is **high**, we trust the prediction.  
- If confidence is **low or uncertain**, the text is re-verified using **Google Gemini API**.  
- The most reliable output is then stored in Firestore.  
- This ensures **high accuracy** even when custom models are unsure.  

---

## 🛠️ Tech Stack  
- **Frontend:** Next.js + Tailwind CSS  
- **Backend:** Flask (Python)  
- **AI Models:** Custom Transformers + Gemini API (hybrid)  
- **Database:** Firebase Firestore  
- **Data Source:** Reddit API (PRAW)  

---

## 🚀 How It Works  
1. Reddit posts are streamed and passed to the backend.  
2. Posts go through AI pipeline → Sarcasm filter → Binary classifier → Disaster type classifier.  
3. Low-confidence results checked with Gemini.  
4. Locations extracted and geocoded.  
5. Events stored in Firestore with:  
   - `disaster_type, severity, credibility_score, reports_count, source_link, resolved`.  
6. Frontend dashboard fetches incidents and displays them on a **map and analytics dashboard**.  

---

## 📂 Project Status  
✅ Frontend with real-time Firestore sync  
✅ Backend with hybrid AI pipeline  
✅ Reddit ingestion & Firestore storage  
✅ Severity & credibility scoring  
🚀 Fully integrated **Emergency Dashboard**  
