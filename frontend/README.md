# Disaster Alert System - Emergency Management Dashboard

A professional **AI-powered command center** designed for emergency
dispatch operators and crisis management teams.\
Currently in **active development**:\
- ✅ Frontend created with **Next.js** and **demo data**\
- ✅ Backend powered by **custom ML models** & **Gemini hybrid
verification**\
- 🔄 Integration in progress (connecting frontend with backend &
Firestore)

------------------------------------------------------------------------

## 🔬 Machine Learning & AI Models

This system uses a **hybrid AI approach** combining **custom fine-tuned
NLP models** and **Google Gemini** for enhanced accuracy.\
When the confidence score is low, Gemini performs a secondary
verification to improve reliability.

### Custom Models

1.  **Sarcasm Detection Model**
    -   Identifies sarcasm or irony in social media text to reduce false
        positives.
2.  **Binary Disaster Classifier**
    -   Determines if a post indicates a **real disaster** or **not**.
3.  **Multiclass Disaster Classifier**
    -   Identifies the **type of disaster** (11 supported categories).

### Hybrid Verification with Gemini

-   If a model returns **low confidence (\<70%)**, the text is passed to
    **Gemini** for secondary analysis.\
-   Ensures **higher accuracy** and reduces false alarms.

------------------------------------------------------------------------

## 🌐 Reddit Data Pipeline

We use the **Reddit API (PRAW)** to collect **real-time posts** from
multiple disaster-related subreddits.

### Processing Flow:

1.  Reddit post captured (`title + body`).\
2.  Text sent to **Flask API → ML Pipeline**.\
3.  Custom models applied in sequence:
    -   Sarcasm filter → Binary classifier → Disaster type classifier →
        Location NER.\
4.  Low-confidence predictions verified by **Gemini hybrid pipeline**.\
5.  Confirmed disasters stored in **Firebase Firestore**.\
6.  Frontend fetches **recent incidents (last 30 days)** via API →
    displayed on **map & dashboard**.

------------------------------------------------------------------------

## 🚨 Key Features

-   **AI-powered disaster monitoring** with custom + Gemini models\
-   **Reddit real-time pipeline** for early disaster signals\
-   **Firestore integration** for real-time syncing\
-   **Confidence scoring & hybrid verification** for improved
    reliability\
-   **Map visualization** with location extraction and geocoding

------------------------------------------------------------------------

## 📊 System Architecture

``` mermaid
flowchart TD
    R[Reddit API / Social Media] -->|New Post| B[Flask Backend]
    B -->|Sarcasm Model| S
    S -->|Binary Classifier| D
    D -->|Multiclass Disaster Model| M
    M -->|NER + Geocoding| L
    L -->|Confidence Check| C{Confidence < 70%?}
    C -->|Yes| G[Gemini Verification]
    C -->|No| F[Firebase Firestore]
    G -->|Verified| F
    F -->|Recent Incidents API| FE[Next.js Frontend Dashboard]
```

------------------------------------------------------------------------

## 🛠️ Technology Stack

-   **Frontend**: Next.js + TypeScript + Tailwind CSS\
-   **Charts**: Recharts for analytics\
-   **Maps**: OpenStreetMap + Mapbox\
-   **Backend**: Flask + Hugging Face Transformers + Gemini API\
-   **Database**: Firebase Firestore (real-time)\
-   **Data Sources**: Reddit API, Twitter/X (optional)

------------------------------------------------------------------------

## 🔧 Development Status

-   Frontend: Completed with **Next.js** \
-   Backend: Completed (API endpoints + custom models + Gemini
    integration)\
-   Integration: Ongoing (backend ↔ frontend ↔ Firestore)

------------------------------------------------------------------------

🚧 **Note**: This project is in **active development**.\
- Backend AI and Gemini verification are fully functional.\
- Next.js dashboard live with mock/demo data.\
- Next phase: Full **real-time integration**.
