from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import string
from src.features import calculate_ioc, calculate_entropy, count_double_letters, get_letter_frequencies

app = Flask(__name__)
# This allows your Vite React app (usually on port 5173) to talk to Flask (port 5000)
CORS(app) 

print("Loading AI Models into memory...")
try:
    # Load XGBoost
    xgb_assets = joblib.load('models/xgboost_model.pkl')
    xgb_model = xgb_assets['model']
    xgb_scaler = xgb_assets['scaler']
    xgb_encoder = xgb_assets['encoder']

    # Load Random Forest
    rf_pipeline = joblib.load('models/random_forest_model.pkl')
    print("✅ Models loaded successfully!")
except FileNotFoundError:
    print("❌ Error: Model files not found. Ensure models/ folder exists and is populated.")

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    text = data.get('text', '')
    model_choice = data.get('model', 'xgboost')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    # 1. Clean the text
    clean_text = "".join([c for c in text.upper() if c in string.ascii_uppercase])
    if len(clean_text) < 20:
        return jsonify({'error': 'Text too short. Provide at least 20 characters for accurate mathematical feature extraction.'}), 400

    # 2. Extract features exactly like training
    features = {
        'ioc': calculate_ioc(clean_text),
        'entropy': calculate_entropy(clean_text),
        'double_letters': count_double_letters(clean_text)
    }
    features.update(get_letter_frequencies(clean_text))
    df = pd.DataFrame([features])

    try:
        # 3. Route to the chosen AI Model
        if model_choice == 'xgboost':
            scaled_features = xgb_scaler.transform(df)
            pred_encoded = xgb_model.predict(scaled_features)
            prediction = xgb_encoder.inverse_transform(pred_encoded)[0]
            
            # Get actual math confidence score
            probabilities = xgb_model.predict_proba(scaled_features)[0]
            confidence = max(probabilities)
        else:
            prediction = rf_pipeline.predict(df)[0]
            
            # Get actual math confidence score
            probabilities = rf_pipeline.predict_proba(df)[0]
            confidence = max(probabilities)

        return jsonify({
            'cipher': str(prediction).upper(),
            'confidence': f"{confidence * 100:.2f}%"
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run the server on port 5000, but disable the file watcher
    app.run(debug=True, use_reloader=False, port=5000)