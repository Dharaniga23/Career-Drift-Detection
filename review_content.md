# Project Review Guide: Career Drift Detection System

This document provides the structured content for your four main project modules. Use this for your PPT slides, project report, or your speaking script during the review.

---

## Module 1: Smart Activity Logging
**"The Data Acquisition Layer"**

*   **Objective**: To provide a seamless, user-friendly interface for students to record their daily learning activities.
*   **How it Works**: 
    - Users input the **Name** of the task (e.g., "Studying Pandas") and an optional **Category**.
    - We implemented a **Neutral Default Category** ("Other") to reduce bias and ensure users are more deliberate in their logging.
*   **Key Technical Mention**: Built with a responsive **React Component** that communicates with the Backend via RESTful APIs.
*   **Review Highlight**: "This module ensures that we capture high-quality, granular data about the student's journey, which serves as the foundation for our AI engine."

---

## Module 2: AI Path Analysis
**"The Core Intelligence Engine"**

*   **Objective**: To evaluate the relevance of user activities against their chosen career path.
*   **How it Works**: 
    - Uses a **Multi-Tiered Scoring Algorithm**:
        - **1.0 (Direct Match)**: Skill is a core requirement (e.g., Python for Data Science).
        - **0.3 (Partial Match)**: Correct category but no specific skill keywords found.
        - **0.0 (Conflict/Drift)**: Skill belongs to a *competing* career path (e.g., React for Backend).
*   **Key Technical Mention**: Integrated with **Scikit-Learn** for probability prediction and custom **Regex-based Word Boundary Matching** to avoid over-matching short keywords (like "R").
*   **Review Highlight**: "Unlike simple trackers, this engine understands the *semantic conflict* between different career roles."

---

## Module 3: Real-time AI Insights
**"The Visual Feedback Module"**

*   **Objective**: To give the user instant, quantitative feedback on their career focus.
*   **How it Works**: 
    - Generates an **On-Track Confidence Score** as a percentage.
    - Provides a status message: **"On Track"** (Green) or **"Needs Attention"** (Amber).
*   **Key Technical Mention**: Calculations are performed on-the-fly in the FastAPI backend and pushed to the **Dashboard UI** dynamically.
*   **Review Highlight**: "This module solves the 'suboptimal decision-making' problem mentioned in our base paper (Sankalp) by providing immediate visual cues."

---

## Module 4: Intelligent Advice System
**"Explainable AI (XAI) Component"**

*   **Objective**: To provide human-readable, actionable advice rather than just numbers.
*   **How it Works**: 
    - Identifies **conflicting skills** (e.g., "Learning PowerBI is not necessary for a Frontend role") and **irrelevant activities** ("Read Comics seems irrelevant").
    - De-duplicates feedback to keep it concise.
*   **Key Technical Mention**: Uses **Predictive Logic** to correlate drift scores with specific activity names to generate targeted suggestions.
*   **Review Highlight**: "This completes the 'Explainability' requirement of the Sankalp framework, telling the user exactly *why* they are drifting and what to ignore."
