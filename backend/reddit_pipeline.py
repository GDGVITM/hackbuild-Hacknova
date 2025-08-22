import praw
import requests


# Reddit API Authentication

reddit = praw.Reddit(
    client_id="3RAOWRF3RnprUBMcd4TsnA",
    client_secret="uqfaHJwBT4hV2gkJkDHvLVTt5YdCig",
    user_agent="disaster-alert-bot/0.1 by Historical-Top5105"
)

# Flask backend API endpoint
API_URL = "http://127.0.0.1:5000/analyze"

# Subreddits to monitor
subreddits = ["news", "TropicalWeather", "Earthquakes", "hurricane", "tornado", "TornadoWatch", "Volcanoes", "Lightning","StormComing", "collapse", "stormchasing", "test_disaster_alerts"]


# Stream Reddit posts → send to backend
print("🚨 Starting Reddit disaster stream...")

for submission in reddit.subreddit("+".join(subreddits)).stream.submissions(skip_existing=True):
    # Combine title + body text
    text = submission.title + " " + submission.selftext
    payload = {"text": text}

    try:
        response = requests.post(API_URL, json=payload)
        if response.status_code == 200:
            result = response.json()
            print("\n===============================")
            print(f"[{submission.subreddit.display_name}] {submission.title}")
            print(f"URL: {submission.url}")
            print("Classification Result:", result)
        else:
            print("❌ Error from backend:", response.text)
    except Exception as e:
        print("⚠️ Error sending to API:", e)
