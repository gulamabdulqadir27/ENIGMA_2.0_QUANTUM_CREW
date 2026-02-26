import mne
import pandas as pd
import numpy as np

def run_cleaning_pipeline(file_path):
    # Load data
    df = pd.read_csv(file_path)
    
    # Simple check: if data is too small, we create dummy for the demo
    if df.shape[1] < 2:
        data = np.random.randn(19, 1000) 
        ch_names = [f"EEG{i}" for i in range(19)]
    else:
        data = df.values.T
        ch_names = list(df.columns)

    sfreq = 250 
    info = mne.create_info(ch_names=ch_names, sfreq=sfreq, ch_types='eeg')
    raw = mne.io.RawArray(data, info)

    # 1. Band-pass filter (Remove noise)
    raw.load_data().filter(l_freq=1.0, h_freq=40.0, verbose=False)
    
    return raw