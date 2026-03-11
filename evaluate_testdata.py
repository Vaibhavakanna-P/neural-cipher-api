import pandas as pd
import joblib
import os
from sklearn.metrics import accuracy_score

def evaluate_and_export_predictions():
    print("Loading the 25,000 holdout samples...")
    try:
        df = pd.read_csv('data/holdout_features_25k.csv')
    except FileNotFoundError:
        print("Error: Holdout file not found. Run build_holdout_data.py first.")
        return

    # Separate features and labels
    X_new = df.drop(columns=['label'])
    y_actual = df['label']

    print(f"Dataset loaded: {len(X_new)} completely unseen samples.\n")

    # Create a master results table
    results_df = pd.DataFrame({
        'Actual_Cipher': y_actual
    })

    # ---------------------------------------------------------
    # 1. RANDOM FOREST PREDICTIONS
    # ---------------------------------------------------------
    print("🌲 RUNNING RANDOM FOREST PREDICTIONS...")
    try:
        rf_pipeline = joblib.load('models/random_forest_model.pkl')
        rf_preds = rf_pipeline.predict(X_new)
        rf_acc = accuracy_score(y_actual, rf_preds)
        
        # Add RF results to our table
        results_df['RF_Predicted'] = rf_preds
        results_df['RF_Correct'] = results_df['Actual_Cipher'] == results_df['RF_Predicted']
        
        print(f"   -> Random Forest True Accuracy: {rf_acc * 100:.2f}%")
    except FileNotFoundError:
        print("   -> Error: Random Forest model not found.")

    # ---------------------------------------------------------
    # 2. XGBOOST PREDICTIONS
    # ---------------------------------------------------------
    print("🚀 RUNNING XGBOOST PREDICTIONS...")
    try:
        xgb_assets = joblib.load('models/xgboost_model.pkl')
        xgb_model = xgb_assets['model']
        xgb_scaler = xgb_assets['scaler']
        xgb_encoder = xgb_assets['encoder']
        
        # Scale features and encode actual answers
        X_new_scaled = xgb_scaler.transform(X_new)
        y_actual_encoded = xgb_encoder.transform(y_actual)
        
        # Predict
        xgb_preds_encoded = xgb_model.predict(X_new_scaled)
        xgb_acc = accuracy_score(y_actual_encoded, xgb_preds_encoded)
        
        # Convert numeric predictions back to text (e.g., 0 -> "Caesar")
        xgb_preds_text = xgb_encoder.inverse_transform(xgb_preds_encoded)
        
        # Add XGBoost results to our table
        results_df['XGB_Predicted'] = xgb_preds_text
        results_df['XGB_Correct'] = results_df['Actual_Cipher'] == results_df['XGB_Predicted']
        
        print(f"   -> XGBoost True Accuracy: {xgb_acc * 100:.2f}%")
    except FileNotFoundError:
        print("   -> Error: XGBoost model not found.")

    # ---------------------------------------------------------
    # 3. SAVE TO CSV AND DISPLAY PREVIEW
    # ---------------------------------------------------------
    output_file = 'data/detailed_predictions_25k.csv'
    results_df.to_csv(output_file, index=False)
    
    print("\n" + "="*70)
    print(f"✅ All 25,000 predictions saved successfully to: {output_file}")
    print("="*70 + "\n")
    
    print("Preview of the first 15 rows (Actual vs Predicted):\n")
    # Print a clean, formatted preview to the terminal
    print(results_df.head(15).to_string())

if __name__ == "__main__":
    evaluate_and_export_predictions()