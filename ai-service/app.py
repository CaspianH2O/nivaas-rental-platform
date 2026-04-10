import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Connect to MongoDB
client = MongoClient(os.getenv("MONGO_URI"))
db = client.get_database()  # This will use the database name from the URI (e.g., 'nivaas')
properties_collection = db['properties']

def get_all_properties():
    """Fetch all properties from MongoDB and convert ObjectId to string."""
    props = list(properties_collection.find({}, {
        '_id': 1, 'title': 1, 'location': 1, 'price': 1, 'facilities': 1
    }))
    for p in props:
        p['_id'] = str(p['_id'])
    return props

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    user_location = data.get('location', '')
    user_budget = data.get('budget', 0)
    user_facilities = data.get('facilities', [])

    # Get all properties
    properties = get_all_properties()
    if not properties:
        return jsonify([])

    # Create a DataFrame
    df = pd.DataFrame(properties)
    # Build feature text for each property: location + price + facilities
    df['features'] = (
        df['location'].fillna('') + ' ' +
        df['price'].astype(str) + ' ' +
        df['facilities'].apply(lambda x: ' '.join(x) if x else '')
    )

    # Build user query string
    user_query = f"{user_location} {user_budget} {' '.join(user_facilities)}"

    # Vectorize using TF-IDF
    vectorizer = TfidfVectorizer()
    feature_matrix = vectorizer.fit_transform(df['features'])
    query_vector = vectorizer.transform([user_query])

    # Compute cosine similarity
    similarities = cosine_similarity(query_vector, feature_matrix).flatten()

    # Get indices of top 5 most similar properties
    top_indices = similarities.argsort()[-5:][::-1]
    recommended = df.iloc[top_indices].to_dict('records')

    # Convert ObjectId to string (already done, but ensure)
    for rec in recommended:
        rec['_id'] = str(rec['_id'])

    return jsonify(recommended)

if __name__ == '__main__':
    app.run(port=5001, debug=True)