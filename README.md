# AI ASSISTANCE FOR RESUME ANALYSIS AND INTERVIEW EVALUATION

Welcome to the **AI Assistance for Resume Analysis and Interview Evaluation**, an interactive, AI-driven platform for conducting automated, realistic candidate interviews. The platform leverages Google's Gemini API to evaluate candidate resumes against job descriptions, conduct conversational turn-by-turn interviews, and generate comprehensive performance reports.

<<<<<<< HEAD
🎯 **[Live Demo](Your-Live-Link-Here)**

=======

🎯 **[Live Demo](https://ec2-43-204-233-252.ap-south-1.compute.amazonaws.com/)**
>>>>>>> b50c30206136b257577cca3dce2849caee5fe0f8

---

## 📸 Screenshots


### 1. Resume and Job Description Analysis
![Resume Analysis](Implementation%20ScreenShots/Screenshot%202026-02-01%20215615.png)
![Resume Analysis](Implementation%20ScreenShots/Screenshot%202026-02-01%20215630.png)

### 2. Live Interview Interface
![Live Interview](Implementation%20ScreenShots/Screenshot%202026-02-01%20221040.png)

### 3. Final Performance Report
![Performance Report](Implementation%20ScreenShots/Screenshot%202026-02-01%20221133.png)

---

## 🚀 Features

- **Resume & JD Analysis**: Parses and compares candidate resumes against job descriptions to set up the context.
- **Dynamic Interview Generation**: Uses Gemini to ask technical, behavioral, and role-specific questions sequentially based on the candidate's previous responses.
- **Text-to-Speech (TTS)**: Incorporates Gemini's TTS model to simulate a real interviewer's voice for an immersive experience.
- **Detailed Evaluation Report**: Generates a final JSON-structured report detailing strengths, weaknesses, ratings (technical, behavioral, communication), skill gaps, and actionable suggestions.

## 🛠 Tech Stack

- **Backend**: Python, Flask, Flask-CORS
- **AI Models**: Google Gemini 2.5 Flash, Gemini TTS
- **NLP**: Sentence-Transformers / SBERT (for local resume parsing and text extraction)
- **Frontend**: (Frontend details go here)

## 📁 Project Structure

- `backend/`: Contains the Flask server (`app.py`), the resume parsing logic (`resume_analyzer_sbert.py`), and localized model dependencies.
- `frontend/`: The frontend client code used to interact with the backend API endpoints.

## ⚙️ Setup and Installation

### Prerequisites

- Python 3.8+
- Node.js (for the frontend, if applicable)
- Google Gemini API Key

### Backend Setup

1. Navigate to the project directory:
   ```bash
   cd backend
   ```

2. Install python dependencies:
   ```bash
   pip install -r ../requirements.txt
   ```

3. Ensure you have your `resume_analyzer_sbert.py` in the backend directory. Validate that your `GEMINI_API_KEY` is set correctly in `app.py` or your environment variables.

4. Start the backend server:
   ```bash
   python app.py
   ```
   *The server will run on `http://0.0.0.0:5001`.*

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend/client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the UI:
   ```bash
   npm run dev
   # or npm start
   ```

## 🔗 API Endpoints

- `POST /analyze`: Upload a resume (PDF file) and JD (text) to generate initial analysis logic.
- `POST /start-interview`: Starts the session via TTS and text-based response.
- `POST /next-question`: Handles the candidate's answer and returns the next contextually-aware question.
- `POST /end-interview`: Concludes the interview and generates the final performance report.

## 📝 License

No License.

## 🤝 Contributors

<<<<<<< HEAD
- **Avinash Kumar** - [https://github.com/Avi-thakur04]
=======
- **Avinash Kumar** - [https://github.com/Avi-thakur04]
-**[Contributors Name/ID]** - [Link to Profile/ID]
>>>>>>> b50c30206136b257577cca3dce2849caee5fe0f8
