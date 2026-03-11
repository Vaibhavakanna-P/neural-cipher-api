import nltk
from nltk.corpus import brown
import re

# Ensure the corpus is downloaded
try:
    nltk.data.find('corpora/brown')
except LookupError:
    nltk.download('brown')

def get_clean_sentences(min_length=50):
    """Fetches and cleans sentences from the Brown corpus."""
    raw_sentences = brown.sents()
    clean_sentences = []
    
    for sentence in raw_sentences:
        text = " ".join(sentence).upper()
        # Keep only A-Z
        clean_text = re.sub(r'[^A-Z]', '', text)
        
        if len(clean_text) >= min_length:
            clean_sentences.append(clean_text)
            
    return clean_sentences