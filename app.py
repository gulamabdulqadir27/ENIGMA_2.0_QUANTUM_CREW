import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
from pipeline import run_cleaning_pipeline
from model import calculate_risk_score

# Page Config
st.set_page_config(page_title="SchizoDetect AI", layout="wide")
st.title("🧠 EEG Schizophrenia Detection System")
st.markdown("---")

# Sidebar
st.sidebar.header("Dashboard Controls")
menu = st.sidebar.radio("Navigate", ["Analysis Portal", "Research Data", "About Project"])

if menu == "Analysis Portal":
    st.subheader("📊 Patient EEG Analysis")
    uploaded_file = st.file_uploader("Upload EEG CSV File", type="csv")

    if uploaded_file:
        with st.spinner('Processing Brain Signals...'):
            # 1. Run Pipeline
            cleaned_raw = run_cleaning_pipeline(uploaded_file)
            
            # 2. Get Risk Score
            risk = calculate_risk_score(cleaned_raw)
            
            # UI Layout
            col1, col2 = st.columns([2, 1])
            
            with col1:
                st.write("### Cleaned EEG Signal")
                fig, ax = plt.subplots(figsize=(10, 4))
                ax.plot(cleaned_raw.get_data()[0][:500], color='#2ecc71')
                ax.set_title("Frontal Lobe Activity (Filtered)")
                st.pyplot(fig)
                
            with col2:
                st.write("### Diagnosis Risk Score")
                st.metric(label="Schizophrenia Risk", value=f"{risk}%")
                if risk > 70:
                    st.error("HIGH RISK: Clinical correlation recommended.")
                elif risk > 40:
                    st.warning("MODERATE RISK: Monitor symptoms.")
                else:
                    st.success("LOW RISK: Signal within normal range.")
                
                st.progress(risk / 100)

elif menu == "Research Data":
    st.subheader("📚 Research Dataset Pipeline")
    st.write("Viewing current training metadata (demographic.csv)")
    try:
        df = pd.read_csv("data/demographic.csv")
        st.dataframe(df)
    except:
        st.error("demographic.csv not found in data folder.")