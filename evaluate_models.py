import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

def evaluate_both_models():
    print("Loading the full dataset to isolate the 10,000 validation samples...")
    try:
        df = pd.read_csv('data/cipher_features_50k.csv')
    except FileNotFoundError:
        print("Error: Feature file not found.")
        return

    # Separate features and labels
    X = df.drop(columns=['ciphertext', 'label', 'plaintext_length'])
    y = df['label']

    # Recreate the exact same 20% split using random_state=42
    # We use '_' to throw away the training data since we only want the test data here
    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Validation dataset successfully isolated: {len(X_test)} unseen samples.\n")

    # ---------------------------------------------------------
    # 1. EVALUATE RANDOM FOREST
    # ---------------------------------------------------------
    print("="*50)
    print("🌲 EVALUATING RANDOM FOREST MODEL")
    print("="*50)
    try:
        # Load the pipeline (which already includes the scaler)
        rf_pipeline = joblib.load('models/random_forest_model.pkl')
        
        # Predict directly on X_test
        rf_predictions = rf_pipeline.predict(X_test)
        rf_accuracy = accuracy_score(y_test, rf_predictions)
        
        print(f"-> Random Forest Validation Accuracy: {rf_accuracy * 100:.2f}%\n")
        print("Quick Report:")
        print(classification_report(y_test, rf_predictions))
        
    except FileNotFoundError:
        print("Error: Random Forest model not found in models/ folder.\n")

    # ---------------------------------------------------------
    # 2. EVALUATE XGBOOST
    # ---------------------------------------------------------
    print("="*50)
    print("🚀 EVALUATING XGBOOST MODEL")
    print("="*50)
    try:
        # Load the model, scaler, and encoder
        xgb_assets = joblib.load('models/xgboost_model.pkl')
        xgb_model = xgb_assets['model']
        xgb_scaler = xgb_assets['scaler']
        xgb_encoder = xgb_assets['encoder']
        
        # XGBoost requires the test data to be scaled manually using the saved scaler
        X_test_scaled = xgb_scaler.transform(X_test)
        
        # XGBoost also compares against numeric labels (0-4), so we encode the real answers
        y_test_encoded = xgb_encoder.transform(y_test)
        
        # Predict on the scaled features
        xgb_predictions = xgb_model.predict(X_test_scaled)
        xgb_accuracy = accuracy_score(y_test_encoded, xgb_predictions)
        
        print(f"-> XGBoost Validation Accuracy: {xgb_accuracy * 100:.2f}%\n")
        
        # Convert numeric predictions back to text for the report
        target_names = xgb_encoder.classes_
        print("Quick Report:")
        print(classification_report(y_test_encoded, xgb_predictions, target_names=target_names))
        
    except FileNotFoundError:
        print("Error: XGBoost model not found in models/ folder.\n")

if __name__ == "__main__":
    evaluate_both_models()