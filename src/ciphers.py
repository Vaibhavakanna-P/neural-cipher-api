import random
import string

def encrypt_caesar(plaintext):
    shift = random.randint(1, 25)
    ciphertext = ""
    for char in plaintext:
        shifted = ord(char) + shift
        if shifted > ord('Z'):
            shifted -= 26
        ciphertext += chr(shifted)
    return ciphertext

def encrypt_substitution(plaintext):
    alphabet = list(string.ascii_uppercase)
    shuffled = alphabet.copy()
    random.shuffle(shuffled)
    cipher_map = dict(zip(alphabet, shuffled))
    return "".join([cipher_map[char] for char in plaintext])

def encrypt_vigenere(plaintext):
    keys = ["PYTHON", "CIPHER", "SECURITY", "NETWORK", "MACHINE", "ALGORITHM"]
    key = random.choice(keys)
    key_repeated = (key * (len(plaintext) // len(key) + 1))[:len(plaintext)]
    
    ciphertext = ""
    for p, k in zip(plaintext, key_repeated):
        shift = ord(k) - ord('A')
        shifted = ord(p) + shift
        if shifted > ord('Z'):
            shifted -= 26
        ciphertext += chr(shifted)
    return ciphertext

def encrypt_transposition(plaintext):
    key_len = random.randint(4, 10)
    padding = (key_len - len(plaintext) % key_len) % key_len
    plaintext += "X" * padding
    
    columns = [""] * key_len
    for i, char in enumerate(plaintext):
        columns[i % key_len] += char
        
    random.shuffle(columns)
    return "".join(columns)

def encrypt_playfair(plaintext):
    """True Playfair implementation using a 5x5 grid."""
    # 1. Prepare text (Replace J with I, pad double letters)
    plaintext = plaintext.replace("J", "I")
    processed = ""
    i = 0
    while i < len(plaintext):
        processed += plaintext[i]
        if i + 1 < len(plaintext):
            if plaintext[i] == plaintext[i+1]:
                processed += "X"
            else:
                processed += plaintext[i+1]
                i += 1
        i += 1
    if len(processed) % 2 != 0:
        processed += "X"

    # 2. Generate 5x5 Grid
    alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ" # No J
    shuffled_alphabet = list(alphabet)
    random.shuffle(shuffled_alphabet)
    
    grid = {}
    rev_grid = {}
    for row in range(5):
        for col in range(5):
            char = shuffled_alphabet[row * 5 + col]
            grid[char] = (row, col)
            rev_grid[(row, col)] = char

    # 3. Encrypt Pairs
    ciphertext = ""
    for i in range(0, len(processed), 2):
        r1, c1 = grid[processed[i]]
        r2, c2 = grid[processed[i+1]]
        
        if r1 == r2: # Same row: shift right
            ciphertext += rev_grid[(r1, (c1 + 1) % 5)]
            ciphertext += rev_grid[(r2, (c2 + 1) % 5)]
        elif c1 == c2: # Same col: shift down
            ciphertext += rev_grid[((r1 + 1) % 5, c1)]
            ciphertext += rev_grid[((r2 + 1) % 5, c2)]
        else: # Rectangle: swap columns
            ciphertext += rev_grid[(r1, c2)]
            ciphertext += rev_grid[(r2, c1)]
            
    return ciphertext