import pandas as pd
import random
import os
from src.generate_corpus import get_clean_sentences
from src.ciphers import (encrypt_caesar, encrypt_substitution, 
                         encrypt_vigenere, encrypt_transposition, encrypt_playfair)
from src.features import (calculate_ioc, calculate_entropy, 
                          count_double_letters, get_letter_frequencies)

def build_holdout_features(samples_per_class=5000):
    print("Fetching NLTK corpus for holdout data...")
    corpus = get_clean_sentences(min_length=50)
    # Shuffle heavily so we get different sentences than the training set
    random.shuffle(corpus) 
    
    ciphers = {
        'Caesar': encrypt_caesar,
        'Substitution': encrypt_substitution,
        'Vigenere': encrypt_vigenere,
        'Transposition': encrypt_transposition,
        'Playfair': encrypt_playfair
    }
    
    dataset = []
    print(f"Generating and extracting features for {samples_per_class * len(ciphers)} completely new samples...")
    
    for cipher_name, encryption_func in ciphers.items():
        print(f"Processing {samples_per_class} fresh samples for {cipher_name}...")
        for _ in range(samples_per_class):
            plaintext = random.choice(corpus)
            ciphertext = encryption_func(plaintext)
            
            # Extract features immediately in memory
            features = {
                'label': cipher_name,
                'ioc': calculate_ioc(ciphertext),
                'entropy': calculate_entropy(ciphertext),
                'double_letters': count_double_letters(ciphertext)
            }
            # Add A-Z frequencies
            features.update(get_letter_frequencies(ciphertext))
            
            dataset.append(features)

    print("\nFormatting and saving data...")
    df = pd.DataFrame(dataset)
    
    # Shuffle the final dataset
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    os.makedirs('data', exist_ok=True)
    output_path = 'data/holdout_features_25k.csv'
    df.to_csv(output_path, index=False)
    
    print(f"✅ Success! Completely new test data saved to {output_path}")

if __name__ == "__main__":
    build_holdout_features(samples_per_class=5000)