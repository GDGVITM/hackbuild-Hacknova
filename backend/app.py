from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta, UTC
import requests, os, asyncio
from dotenv import load_dotenv
from collections import Counter

# --- Load environment variables ---
load_dotenv()

# --- Firebase Setup ---
cred = credentials.Certificate("firebase-key.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

# --- Load Local Models ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "Models")

sarcasm_model_path = os.path.join(MODEL_DIR, "sarcasm_model").replace("\\", "/")
disaster_binary_model_path = os.path.join(MODEL_DIR, "disaster_model").replace("\\", "/")
# NOTE: The local multiclass model is no longer loaded or used.

print("✅ Loading essential models...")
sarcasm_classifier = pipeline("text-classification", model=sarcasm_model_path, tokenizer=sarcasm_model_path)
disaster_binary_classifier = pipeline("text-classification", model=disaster_binary_model_path, tokenizer=disaster_binary_model_path)
ner = pipeline("ner", model="dslim/bert-base-NER", grouped_entities=True, aggregation_strategy="simple")
print("✅ Essential models loaded successfully.")

# --- Configuration & Helpers ---
ID2LABEL = {
    0: "earthquake", 1: "flood", 2: "fire", 3: "hurricane",
    4: "tornado", 5: "volcano", 6: "landslide", 7: "tsunami",
    8: "cyclone", 9: "storm", 10: "other"
}
VALID_CATEGORIES = list(ID2LABEL.values())

SEVERITY_MAPPING = {
    "earthquake": "Critical", "tsunami": "Critical", "volcano": "Critical",
    "hurricane": "High", "tornado": "High", "cyclone": "High",
    "fire": "Medium", "flood": "Medium", "landslide": "Medium",
    "storm": "Low", "other": "Low"
}

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def get_coordinates(place):
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": place, "format": "json"}
    headers = {"User-Agent": "DisasterAlertApp/1.0"}
    try:
        response = requests.get(url, params=params, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()
        if data:
            return {"lat": float(data[0]["lat"]), "lon": float(data[0]["lon"])}
    except Exception as e:
        print(f"⚠️ Geocoding error for {place}: {e}")
    return None

async def get_disaster_type_from_gemini(text):
    if not GEMINI_API_KEY:
        print("🔴 CRITICAL: Gemini API Key is missing. Cannot classify disaster type.")
        return None

    prompt = f"""
    Analyze the following text and classify it into ONE of the following disaster categories: {VALID_CATEGORIES}.
    
    The text is: "{text}"
    
    Respond with only a single word from the provided list. If the text does not clearly match any category, respond with 'other'.
    """
    
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}"
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    
    print("🧠 Asking Gemini for disaster type...")
    try:
        response = requests.post(api_url, json=payload, headers={'Content-Type': 'application/json'}, timeout=10)
        response.raise_for_status()
        result = response.json()
        verified_type = result['candidates'][0]['content']['parts'][0]['text'].strip().lower()
        
        if verified_type in VALID_CATEGORIES:
            print(f"✅ Gemini classification successful: Type = '{verified_type}'")
            return verified_type
        else:
            print(f"⚠️ Gemini gave an unexpected response ('{verified_type}'). Defaulting to 'other'.")
            return "other"
    except Exception as e:
        print(f"🔥 CRITICAL: Gemini API Error: {e}. Cannot classify disaster type.")
        return None

# -----------------------------
# Flask App
# -----------------------------
app = Flask(__name__)
CORS(app)

@app.route("/analyze", methods=["POST"])
async def analyze():
    data = request.json
    text = data.get("text")
    source_link = data.get("source_link", "Source Not Provided")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    # 1. Sarcasm & Binary Disaster Checks
    sarcasm_pred = sarcasm_classifier(text)[0]
    if sarcasm_pred["label"] == "LABEL_1":
        return jsonify({"sarcasm": True, "message": "Post identified as sarcastic."})
    
    binary_pred = disaster_binary_classifier(text)[0]
    if binary_pred["label"] != "LABEL_1" or binary_pred["score"] < 0.7:
        return jsonify({"disaster": False, "message": "Post not classified as a disaster."})

    # 2. Disaster Type Classification (Gemini Only)
    disaster_type = await get_disaster_type_from_gemini(text)

    if disaster_type is None:
        return jsonify({"error": "Failed to classify disaster type with AI provider."}), 500
    if disaster_type == "other":
        return jsonify({"disaster": True, "disaster_type": "other", "message": "Verified as a general disaster, but not a specific type."})

    # 3. Location Extraction
    locations = []
    entities = ner(text)
    for ent in entities:
        if ent["entity_group"] == "LOC":
            place = ent["word"]
            coords = get_coordinates(place)
            if coords:
                locations.append({"place": place, "coords": coords})
    
    if not locations:
        return jsonify({"disaster": True, "message": "Disaster detected but no location found."})

    # 4. Check for Existing Disaster & Update
    primary_location = locations[0]['place']
    twenty_four_hours_ago = datetime.now(UTC) - timedelta(hours=24)
    
    query = db.collection("disasters").where(field_path="primary_location", op_string="==", value=primary_location) \
                                      .where(field_path="disaster_type", op_string="==", value=disaster_type) \
                                      .where(field_path="resolved", op_string="==", value=False) \
                                      .where(field_path="timestamp", op_string=">=", value=twenty_four_hours_ago.isoformat())
    
    existing_docs = list(query.stream())

    if existing_docs:
        doc_to_update = existing_docs[0]
        doc_ref = doc_to_update.reference
        
        @firestore.transactional
        def update_in_transaction(transaction, doc_ref):
            snapshot = doc_ref.get(transaction=transaction)
            current_reports = snapshot.get("report_count")
            new_reports = current_reports + 1
            credibility = min(0.50 + (new_reports * 0.05), 0.99)
            
            transaction.update(doc_ref, {
                "report_count": new_reports,
                "credibility_score": round(credibility, 2),
                "last_reported_at": datetime.now(UTC).isoformat()
            })
            return new_reports, credibility

        report_count, credibility_score = update_in_transaction(db.transaction(), doc_ref)
        return jsonify({ "status": "updated", "disaster_id": doc_ref.id, "report_count": report_count })
    else:
        doc_ref = db.collection("disasters").document()
        new_disaster_data = {
            "id": doc_ref.id, "text": text, "source_link": source_link,
            "disaster_type": disaster_type, "primary_location": primary_location,
            "all_locations": locations, "report_count": 1, "credibility_score": 0.50,
            "severity": SEVERITY_MAPPING.get(disaster_type, "Low"),
            "resolved": False, "timestamp": datetime.now(UTC).isoformat(),
            "last_reported_at": datetime.now(UTC).isoformat(), "resolved_at": None
        }
        doc_ref.set(new_disaster_data)
        return jsonify({ "status": "created", "data": new_disaster_data })
    
@app.route("/api/dashboard", methods=["GET"])
def get_dashboard_data():
    try:
        today_start = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
        docs = db.collection("disasters").where(field_path="timestamp", op_string=">=", value=today_start.isoformat()).stream()
        
        todays_incidents = [doc.to_dict() for doc in docs]
        
        total_incidents = len(todays_incidents)
        resolved_incidents = [d for d in todays_incidents if d.get("resolved")]
        resolved_count = len(resolved_incidents)
        active_alerts = total_incidents - resolved_count
        
        total_response_time = timedelta(0)
        if resolved_count > 0:
            for incident in resolved_incidents:
                if incident.get('timestamp') and incident.get('resolved_at'):
                    created_time = datetime.fromisoformat(incident['timestamp'])
                    resolved_time = datetime.fromisoformat(incident['resolved_at'])
                    total_response_time += (resolved_time - created_time)
            avg_response_delta = total_response_time / resolved_count
            avg_response_hours = avg_response_delta.total_seconds() / 3600
        else:
            avg_response_hours = 0
        
        overview_stats = {
            "totalIncidents": total_incidents,
            "resolved": resolved_count,
            "activeAlerts": active_alerts,
            "avgResponse": round(avg_response_hours, 2)
        }

        return jsonify({
            "overview": overview_stats,
            "todays_incidents": todays_incidents
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/stats", methods=["GET"])
def get_stats_data():
    try:
        now = datetime.now(UTC)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        twenty_four_hours_ago = now - timedelta(hours=24)

        today_docs = db.collection("disasters").where(field_path="timestamp", op_string=">=", value=today_start.isoformat()).stream()
        timeline_docs = db.collection("disasters").where(field_path="timestamp", op_string=">=", value=twenty_four_hours_ago.isoformat()).stream()
        
        todays_incidents = [doc.to_dict() for doc in today_docs]

        type_counts = Counter(d['disaster_type'] for d in todays_incidents)
        by_type_stats = [{"type": name.title(), "count": count} for name, count in type_counts.most_common()]
        
        location_counts = Counter(d['primary_location'] for d in todays_incidents)
        trending_locations_stats = [{"location": name, "count": count} for name, count in location_counts.most_common(5)]

        buckets = {i: 0 for i in range(0, 24, 3)}
        for doc in timeline_docs:
            incident = doc.to_dict()
            timestamp = datetime.fromisoformat(incident['timestamp'])
            bucket_hour = (timestamp.hour // 3) * 3
            buckets[bucket_hour] += 1
        
        timeline_data = []
        for hour, count in sorted(buckets.items()):
            if hour == 0: time_str = "12AM"
            elif hour == 12: time_str = "12PM"
            elif hour > 12: time_str = f"{hour-12}PM"
            else: time_str = f"{hour}AM"
            timeline_data.append({"time": time_str, "incidents": count})

        health_data = {
            "system_performance": { "posts_processed_today": 127543, "current_rate_ppm": 2341, "response_time_avg_ms": 1200, "classification_accuracy": 89.2 },
            "data_sources": [ {"name": "Twitter/X API", "status": "Operational"}, {"name": "Reddit API", "status": "Operational"}, {"name": "Instagram Basic", "status": "Operational"}, {"name": "Facebook", "status": "Limited"}, {"name": "Telegram Channels", "status": "Operational"}, {"name": "TikTok", "status": "Down"} ],
            "network_status": {"uptime_percent": 99.8, "latency_ms": 847, "bandwidth_gb": 4.26}
        }

        return jsonify({
            "by_type": by_type_stats,
            "trending_locations": trending_locations_stats,
            "timeline": timeline_data,
            "system_health": health_data
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500




@app.route("/api/alerts", methods=["GET"])
def get_recent_alerts():
    """Returns the full details of all unresolved alerts from the last 30 days."""
    try:
        thirty_days_ago = datetime.now(UTC) - timedelta(days=30)
        
        docs = db.collection("disasters") \
                 .where(field_path="resolved", op_string="==", value=False) \
                 .where(field_path="timestamp", op_string=">=", value=thirty_days_ago.isoformat()) \
                 .order_by("timestamp", direction=firestore.Query.DESCENDING) \
                 .stream()
        
        alerts = [doc.to_dict() for doc in docs]
        return jsonify(alerts)
    except Exception as e:
        print(f"🔥 Server Error in /api/alerts: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

# --- NEW: Resolve Endpoint ---
@app.route("/api/alerts/<alert_id>/resolve", methods=["POST"])
def resolve_alert(alert_id):
    """Marks a specific alert as resolved."""
    try:
        doc_ref = db.collection("disasters").document(alert_id)
        doc_ref.update({
            "resolved": True,
            "resolved_at": datetime.now(UTC).isoformat()
        })
        return jsonify({"status": "success", "message": f"Alert {alert_id} marked as resolved."})
    except Exception as e:
        print(f"🔥 Server Error in /resolve: {e}")
        return jsonify({"error": "Failed to resolve alert"}), 500
    


# --- NEW: Restored format_alert function ---
def format_alert(doc_data):
    """Helper function to format Firestore data into the desired alert structure."""
    
    # Extract coordinates safely with a default value
    coordinates = [0, 0] 
    if doc_data.get("all_locations") and doc_data["all_locations"][0].get("coords"):
        coords = doc_data["all_locations"][0]["coords"]
        coordinates = [coords.get("lat", 0), coords.get("lon", 0)]

    return {
        "id": doc_data.get("id", ""),
        "severity": doc_data.get("severity", "low").lower(),
        "title": doc_data.get("disaster_type", "Unknown").title(),
        "location": doc_data.get("primary_location", "Unknown Location"),
        "time": doc_data.get("timestamp", ""),
        "reports": doc_data.get("report_count", 0),
        "credibility": doc_data.get("credibility_score", 0.0) * 10, # Scale to 0-10
        "description": doc_data.get("text", "No description available."),
        "coordinates": coordinates
    }

@app.route("/api/map", methods=["GET"])
def get_map_data():
    """Returns all unresolved alerts from the last 30 days, formatted for the map."""
    try:
        thirty_days_ago = datetime.now(UTC) - timedelta(days=30)
        
        # Query for active (unresolved) incidents in the last 30 days
        docs = db.collection("disasters") \
                 .where(field_path="resolved", op_string="==", value=False) \
                 .where(field_path="timestamp", op_string=">=", value=thirty_days_ago.isoformat()) \
                 .order_by("timestamp", direction=firestore.Query.DESCENDING) \
                 .stream()
        
        alerts_list = [format_alert(doc.to_dict()) for doc in docs]
        
        # Wrap the list in an "alerts" key for the frontend
        return jsonify({"alerts": alerts_list})
        
    except Exception as e:
        # This will catch errors, including missing Firebase indexes
        print(f"🔥 Server Error in /api/map: {e}")
        # Look in your terminal for a link to create the required Firestore index if this fails
        return jsonify({"error": "An internal error occurred"}), 500

if __name__ == "__main__":
    app.run(debug=True)