import math
from collections import Counter
import string

def calculate_ioc(text):
    """Calculates the Index of Coincidence."""
    n = len(text)
    if n <= 1: return 0.0
    freqs = Counter(text)
    ioc = sum(f * (f - 1) for f in freqs.values()) / (n * (n - 1))
    return ioc

def calculate_entropy(text):
    """Calculates Shannon Entropy."""
    n = len(text)
    if n == 0: return 0.0
    freqs = Counter(text)
    entropy = -sum((f/n) * math.log2(f/n) for f in freqs.values())
    return entropy

def count_double_letters(text):
    """Counts occurrences of consecutive identical letters."""
    if len(text) < 2: return 0
    count = sum(1 for i in range(len(text)-1) if text[i] == text[i+1])
    return count

def get_letter_frequencies(text):
    """Returns a dictionary of normalized A-Z frequencies."""
    n = len(text)
    counts = Counter(text)
    alphabet = string.ascii_uppercase
    # Return as a dictionary so it easily translates to DataFrame columns
    return {f"freq_{char}": (counts.get(char, 0) / n if n > 0 else 0) for char in alphabet}