import pandas as pd
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from xgboost import XGBClassifier

def train_xgboost():
    print("Loading features for XGBoost...")
    try:
        df = pd.read_csv('data/cipher_features_50k.csv')
    except FileNotFoundError:
        print("Error: Feature file not found. Run extract_features.py first.")
        return
    
    X = df.drop(columns=['ciphertext', 'label', 'plaintext_length'])
    y_raw = df['label']
    
    # XGBoost needs numeric labels (0-4) instead of text. LabelEncoder handles this.
    encoder = LabelEncoder()
    y = encoder.fit_transform(y_raw)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print("Building and training XGBoost (GPU Accelerated)...")
    model = XGBClassifier(
        n_estimators=300,          # 300 boosting rounds
        max_depth=6,               # Anti-overfitting: Shallower trees than RF
        learning_rate=0.05,        # Anti-overfitting: Slower learning rate for higher precision
        subsample=0.8,             # Anti-overfitting: Uses 80% of data per tree
        colsample_bytree=0.8,      # Anti-overfitting: Uses 80% of features per tree
        tree_method='hist',        # Required for GPU
        device='cuda',             # Executes on NVIDIA GPU
        random_state=42
    )

    # Train the model
    model.fit(X_train_scaled, y_train)

    # Evaluate the model
    print("\nEvaluating XGBoost...")
    predictions = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, predictions)
    
    print("\n" + "="*50)
    print(f"🚀 XGBOOST ACCURACY: {accuracy * 100:.2f}%")
    print("="*50 + "\n")
    
    # Get the original text names back for the report
    target_names = encoder.classes_
    print(classification_report(y_test, predictions, target_names=target_names))
    
    # Save the trained model, the scaler, and the encoder to disk
    # (We need all three to make predictions on new data later)
    os.makedirs('models', exist_ok=True)
    joblib.dump({'model': model, 'scaler': scaler, 'encoder': encoder}, 'models/xgboost_model.pkl')
    print("Model and preprocessors saved to: models/xgboost_model.pkl")

if __name__ == "__main__":
    train_xgboost()