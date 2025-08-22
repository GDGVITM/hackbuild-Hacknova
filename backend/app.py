from flask import Flask, request, jsonify
from transformers import pipeline
import firebase_admin
from firebase_admin import credentials, firestore
import datetime, requests, os


# Firebase Setup

# Ensure your "firebase-key.json" is in the same directory as this script
cred = credentials.Certificate("firebase-key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()


# Load Local Models

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "Models")

# Define model paths
sarcasm_model_path = os.path.join(MODEL_DIR, "sarcasm_model")
disaster_binary_model_path = os.path.join(MODEL_DIR, "disaster_model")
# --- FIX 1: Corrected typo from "multicast" to "multiclass" ---
disaster_multiclass_model_path = os.path.join(MODEL_DIR, "disaster_multiclass_model")

# Normalize paths (important for Windows)
sarcasm_model_path = sarcasm_model_path.replace("\\", "/")
disaster_binary_model_path = disaster_binary_model_path.replace("\\", "/")
disaster_multiclass_model_path = disaster_multiclass_model_path.replace("\\", "/")

print("✅ Loading models...")
print(f"   Sarcasm model: {sarcasm_model_path}")
print(f"   Disaster binary model: {disaster_binary_model_path}")
print(f"   Disaster multiclass model: {disaster_multiclass_model_path}")

# Load pipelines
sarcasm_classifier = pipeline("text-classification", model=sarcasm_model_path, tokenizer=sarcasm_model_path)
disaster_binary_classifier = pipeline("text-classification", model=disaster_binary_model_path, tokenizer=disaster_binary_model_path)
disaster_multiclass_classifier = pipeline("text-classification", model=disaster_multiclass_model_path, tokenizer=disaster_multiclass_model_path)

# NER for location
ner = pipeline("ner", grouped_entities=True, model="dslim/bert-base-NER")

print("✅ All models loaded successfully.")

# --- FIX 2: Re-added the ID2LABEL dictionary ---
ID2LABEL = {
    0: "earthquake", 1: "flood", 2: "fire", 3: "hurricane",
    4: "tornado", 5: "volcano", 6: "landslide", 7: "tsunami",
    8: "cyclone", 9: "storm", 10: "other"
}


# Helper: Geocode locations

def get_coordinates(place):
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": place, "format": "json"}
    headers = {"User-Agent": "DisasterAlertApp/1.0"}

    try:
        response = requests.get(url, params=params, headers=headers, timeout=5)
        data = response.json()
        if data:
            return {"lat": float(data[0]["lat"]), "lon": float(data[0]["lon"])}
    except Exception as e:
        print(f"⚠️ Geocoding error for {place}: {e}")
    return None


# Flask App

app = Flask(__name__)

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    text = data.get("text")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    result = {
        "text": text, "disaster": False, "disaster_type": None,
        "sarcasm": False, "confidence": None, "locations": []
    }

    try:
        # --- IMPROVEMENT 1: Run sarcasm check first as a filter ---
        sarcasm_pred = sarcasm_classifier(text)[0]
        if sarcasm_pred["label"] == "LABEL_1" and sarcasm_pred["score"] > 0.8:
            result["sarcasm"] = True
            # If it's a joke, don't treat it as a real disaster
            return jsonify(result)

        # Step 2: Disaster binary classification
        binary_pred = disaster_binary_classifier(text)[0]
        if binary_pred["label"] == "LABEL_1" and binary_pred["score"] > 0.7:
            result["disaster"] = True
            result["confidence"] = round(float(binary_pred["score"]), 4)

            # Step 3: Disaster type classification
            multiclass_pred = disaster_multiclass_classifier(text)[0]
            # --- FIX 3: Use the ID2LABEL dictionary to get a meaningful name ---
            try:
                label_index = int(multiclass_pred["label"].split("_")[1])
                result["disaster_type"] = ID2LABEL.get(label_index, "other")
            except (IndexError, ValueError):
                result["disaster_type"] = "other"

            # Step 4: Location extraction
            entities = ner(text)
            for ent in entities:
                if ent["entity_group"] == "LOC":
                    place = ent["word"]
                    coords = get_coordinates(place)
                    if coords:
                        result["locations"].append({"place": place, "coords": coords})

            # --- IMPROVEMENT 2: Re-added Firebase storage logic ---
            # Only save to database if it's a real disaster with a location
            if result["disaster"] and result["locations"]:
                doc_ref = db.collection("disasters").document()
                doc_ref.set({
                    "text": result["text"],
                    "disaster_type": result["disaster_type"],
                    "confidence": result["confidence"],
                    "locations": result["locations"],
                    "timestamp": datetime.datetime.utcnow().isoformat() + "Z" # Add Z for UTC
                })

        return jsonify(result)

    except Exception as e:
        print(f"🔥 Server Error: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

@app.route("/recent_disasters", methods=["GET"])
def recent_disasters():
    try:
        # Calculate date 30 days ago
        one_month_ago = datetime.datetime.utcnow() - datetime.timedelta(days=30)

        # Query Firestore for disasters in the last 30 days
        docs = (
            db.collection("disasters")
            .where("timestamp", ">=", one_month_ago.isoformat())
            .stream()
        )

        disasters = []
        for doc in docs:
            data = doc.to_dict()
            disasters.append({
                "text": data.get("text"),
                "disaster_type": data.get("disaster_type"),
                "confidence": data.get("confidence"),
                "locations": data.get("locations"),
                "timestamp": data.get("timestamp"),
            })

        return jsonify({"count": len(disasters), "disasters": disasters})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)