import pandas as pd
import random
import os
from src.generate_corpus import get_clean_sentences
from src.ciphers import (encrypt_caesar, encrypt_substitution, 
                         encrypt_vigenere, encrypt_transposition, 
                         encrypt_playfair)

def build_production_dataset(samples_per_class=10000):
    print("Fetching and cleaning NLTK corpus (this may take a moment)...")
    corpus = get_clean_sentences(min_length=50)
    random.shuffle(corpus)
    
    ciphers = {
        'Caesar': encrypt_caesar,
        'Substitution': encrypt_substitution,
        'Vigenere': encrypt_vigenere,
        'Transposition': encrypt_transposition,
        'Playfair': encrypt_playfair
    }
    
    dataset = []
    total_samples = samples_per_class * len(ciphers)
    print(f"Starting encryption of {total_samples} samples...")
    
    # Generate balanced classes
    for cipher_name, encryption_func in ciphers.items():
        print(f"Processing 10,000 samples for {cipher_name}...")
        for i in range(samples_per_class):
            # Grab a random sentence from the corpus
            plaintext = random.choice(corpus)
            
            # Encrypt
            ciphertext = encryption_func(plaintext)
            
            # Save to list
            dataset.append({
                'plaintext_length': len(plaintext),
                'ciphertext': ciphertext,
                'label': cipher_name
            })

    print("Formatting into DataFrame...")
    df = pd.DataFrame(dataset)
    
    # Shuffle the entire dataset so the classes aren't clustered together
    df = df.sample(frac=1).reset_index(drop=True)
    
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/cipher_dataset_50k.csv', index=False)
    
    print("\n--- DATASET GENERATION COMPLETE ---")
    print(f"File saved to: data/cipher_dataset_50k.csv")
    print("\nClass Distribution Check (Should be 10,000 each):")
    print(df['label'].value_counts())

if __name__ == "__main__":
    # 10,000 per class * 5 classes = 50,000 rows
    build_production_dataset(samples_per_class=10000)