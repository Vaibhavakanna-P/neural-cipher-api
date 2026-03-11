import pandas as pd
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

def train_random_forest():
    print("Loading features for Random Forest...")
    try:
        df = pd.read_csv('data/cipher_features_50k.csv')
    except FileNotFoundError:
        print("Error: Feature file not found. Run extract_features.py first.")
        return
    
    X = df.drop(columns=['ciphertext', 'label', 'plaintext_length'])
    y = df['label']
    
    # 80/20 Stratified Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("Building and training Random Forest Pipeline...")
    # The Pipeline automatically scales data before feeding it to the trees
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('rf', RandomForestClassifier(
            n_estimators=200,          # 200 individual decision trees
            max_depth=15,              # Anti-overfitting: Stops trees from getting too specific
            min_samples_split=5,       # Anti-overfitting: Requires 5 samples to create a new branch
            min_samples_leaf=2,        # Anti-overfitting: Requires 2 samples to make a final decision
            max_features='sqrt',       # Anti-overfitting: Forces trees to look at different features
            class_weight='balanced',   # Ensures equal attention to all ciphers
            random_state=42,
            n_jobs=-1                  # Uses all CPU cores
        ))
    ])

    # Train the model
    pipeline.fit(X_train, y_train)

    # Evaluate the model
    print("\nEvaluating Random Forest...")
    predictions = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    
    print("\n" + "="*50)
    print(f"🌲 RANDOM FOREST ACCURACY: {accuracy * 100:.2f}%")
    print("="*50 + "\n")
    print(classification_report(y_test, predictions))
    
    # Save the trained model to disk
    os.makedirs('models', exist_ok=True)
    joblib.dump(pipeline, 'models/random_forest_model.pkl')
    print("Model saved to: models/random_forest_model.pkl")

if __name__ == "__main__":
    train_random_forest()