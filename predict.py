import joblib
import pandas as pd
from src.features import (calculate_ioc, calculate_entropy, 
                          count_double_letters, get_letter_frequencies)
import string

def load_ai_model():
    """Loads the XGBoost model, scaler, and label encoder from disk."""
    try:
        assets = joblib.load('models/xgboost_model.pkl')
        return assets['model'], assets['scaler'], assets['encoder']
    except FileNotFoundError:
        print("Error: Could not find the model file in the models/ folder.")
        return None, None, None

def predict_cipher(text):
    """Takes a raw ciphertext, extracts features, and predicts the cipher type."""
    model, scaler, encoder = load_ai_model()
    if model is None: return
    
    # 1. Clean the text (uppercase, no spaces/punctuation)
    clean_text = "".join([c for c in text.upper() if c in string.ascii_uppercase])
    
    if len(clean_text) < 20:
        print("Warning: Text is very short. Predictions might be less accurate.")

    # 2. Extract mathematical features
    features = {
        'ioc': calculate_ioc(clean_text),
        'entropy': calculate_entropy(clean_text),
        'double_letters': count_double_letters(clean_text)
    }
    
    # Add the A-Z frequencies
    freqs = get_letter_frequencies(clean_text)
    features.update(freqs)
    
    # 3. Format into a DataFrame (must match the training columns exactly)
    df = pd.DataFrame([features])
    
    # 4. Scale the features using the exact same scaler from training
    scaled_features = scaler.transform(df)
    
    # 5. Make the Prediction
    prediction_num = model.predict(scaled_features)
    predicted_cipher = encoder.inverse_transform(prediction_num)[0]
    
    # Print the result
    print("\n" + "-"*40)
    print(f"INPUT TEXT:  {clean_text[:50]}...")
    print(f"LENGTH:      {len(clean_text)} characters")
    print(f"PREDICTION:  -> ** {predicted_cipher.upper()} ** <-")
    print("-"*40 + "\n")

if __name__ == "__main__":
    print("Welcome to the Natural Language Cipher Detector!")
    
    # A few test cases for you to try immediately:
    
    # 1. Caesar Cipher (Shift +3: "HELLO WORLD" -> "KHOORZRUOG")
    print("Testing Caesar:")
    predict_cipher("KHOOR ZRUOG KHOOR ZRUOG KHOOR ZRUOG KHOOR ZRUOG KHOOR ZRUOG")
    
    # 2. Transposition (Scrambled columns of "THEQUICKBROWNFOX")
    print("Testing Transposition:")
    predict_cipher("TQKONHUCBFWERIXOX")
    
    # 3. Interactive loop for your own input
    while True:
        user_input = input("Enter a ciphertext to analyze (or type 'exit' to quit): ")
        if user_input.lower() == 'exit':
            break
        predict_cipher(user_input)