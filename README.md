# Career Drift Detection System

An AI-powered system designed to monitor student learning paths and detect deviations from their target career goals using Machine Learning.

## 🚀 Setup Instructions for Teammates

Follow these steps to get the project running on your local machine.

### 1. Prerequisites
- **Python 3.8+**
- **Node.js 18+**
- **npm** (comes with Node.js)

### 2. Clone the Repository
```bash
git clone https://github.com/Dharaniga23/Career-Drift-Detection.git
cd Career-Drift-Detection
```

---

### 3. Backend Setup (FastAPI)
Open a terminal in the root directory and run:

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```
> The API will be available at: http://127.0.0.1:8000

---

### 4. Frontend Setup (React + Vite)
Open a **new** terminal in the root directory and run:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```
> The web app will be available at: http://localhost:5173

---

## 🛠️ Tech Stack
- **Frontend**: React.js, Vite, Vanilla CSS
- **Backend**: FastAPI (Python), SQLModel, SQLite
- **ML**: Scikit-Learn (Random Forest Classifier), Joblib
