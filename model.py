import numpy as np
from scipy.signal import welch

def calculate_risk_score(raw_data):
    # Get the numerical data from the MNE object
    data = raw_data.get_data()[0] # Look at the first channel
    
    # Calculate Power Spectral Density
    fs = 250
    freqs, psd = welch(data, fs, nperseg=256)
    
    # Schizophrenia Biomarker: Often shows higher Theta and lower Alpha
    theta = np.mean(psd[(freqs >= 4) & (freqs <= 8)])
    alpha = np.mean(psd[(freqs >= 8) & (freqs <= 12)])
    
    # Create a score between 0 and 100 based on the ratio
    ratio = (theta / (alpha + 1e-6)) * 10 
    risk_score = min(max(int(ratio), 10), 95) # Keep it between 10-95%
    
    return risk_score