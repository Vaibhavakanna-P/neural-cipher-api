import pandas as pd
from src.features import (calculate_ioc, calculate_entropy, 
                          count_double_letters, get_letter_frequencies)

def process_dataset(input_path, output_path):
    print(f"Loading dataset from {input_path}...")
    try:
        df = pd.read_csv(input_path)
    except FileNotFoundError:
        print(f"Error: Could not find {input_path}. Did you run generate_dataset.py first?")
        return

    print(f"Extracting features for {len(df)} rows. This might take a minute...")
    
    # Calculate single-value features
    df['ioc'] = df['ciphertext'].apply(calculate_ioc)
    df['entropy'] = df['ciphertext'].apply(calculate_entropy)
    df['double_letters'] = df['ciphertext'].apply(count_double_letters)
    
    # Calculate A-Z frequencies (returns a dictionary per row)
    print("Extracting A-Z frequencies...")
    freq_dicts = df['ciphertext'].apply(get_letter_frequencies)
    
    # Expand the dictionaries into separate columns
    freq_df = pd.DataFrame(freq_dicts.tolist())
    
    # Combine the original dataframe with the new frequency columns
    final_df = pd.concat([df, freq_df], axis=1)
    
    # Save the machine-learning-ready dataset
    final_df.to_csv(output_path, index=False)
    print(f"Success! Features extracted and saved to {output_path}")
    
    # Print a quick preview
    print("\nFeature Preview (first 3 rows):")
    cols_to_show = ['label', 'ioc', 'entropy', 'double_letters', 'freq_A', 'freq_E']
    print(final_df[cols_to_show].head(3))

if __name__ == "__main__":
    INPUT_CSV = "data/cipher_dataset_50k.csv"
    OUTPUT_CSV = "data/cipher_features_50k.csv"
    
    process_dataset(INPUT_CSV, OUTPUT_CSV)