import streamlit as st

st.set_page_config(
    page_title="Lok Setu",
    page_icon="🏛️"
)

st.title("Lok Setu")
st.subheader("Civic Issue Reporting Platform")

st.write("Report civic issues and help improve your community.")

name = st.text_input("Your Name")
issue = st.text_area("Describe your civic issue")

if st.button("Submit Report"):
    if name and issue:
        st.success("Your report has been submitted successfully!")
    else:
        st.warning("Please enter your name and describe the issue.")