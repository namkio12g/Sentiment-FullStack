================================================================================
                    SENTIMENT ANALYSIS PROJECT
                    Setup and Installation Guide
================================================================================

PROJECT OVERVIEW
----------------
This is a full-stack sentiment analysis application with:
- Backend: FastAPI (Python) - Analyzes Vietnamese text sentiment
- Frontend: React Router v7 (TypeScript) - User interface

REQUIREMENTS
------------
1. Python 3.8+ (recommended: Python 3.11+)
2. Node.js 18+ and npm
3. Git (to clone/download the project)

================================================================================
                        BACKEND SETUP
================================================================================

STEP 1: Navigate to Backend Directory
--------------------------------------
cd backend

STEP 2: Install Python Dependencies
------------------------------------
pip install -r requirements.txt

Note: This will install:
- fastapi
- uvicorn
- transformers
- torch
- underthesea (Vietnamese text processing)
- ftfy (text fixing)

IMPORTANT: The first time you run, transformers will download the model
"wonrax/phobert-base-vietnamese-sentiment" from HuggingFace (about 500MB).
This may take a few minutes depending on your internet connection.

STEP 3: Start Backend Server
-----------------------------
cd backend
uvicorn src.main:app --reload

The backend will run on: http://localhost:8000

You can verify it's working by visiting:
- http://localhost:8000/ (should show API message)
- http://localhost:8000/docs (FastAPI documentation)

================================================================================
                        FRONTEND SETUP
================================================================================

STEP 1: Navigate to Frontend Directory
--------------------------------------
cd frontend/sentimentFE

STEP 2: Install Node Dependencies
----------------------------------
npm install

This will install all required packages including:
- React Router v7
- React 19
- TypeScript
- Tailwind CSS
- And other dependencies

STEP 3: Start Frontend Development Server
------------------------------------------
npm run dev

The frontend will run on: http://localhost:5173

================================================================================
                        RUNNING BOTH PROJECTS
================================================================================

You need to run BOTH backend and frontend simultaneously:

TERMINAL 1 - Backend:
---------------------
cd backend
uvicorn src.main:app --reload

TERMINAL 2 - Frontend:
----------------------
cd frontend/sentimentFE
npm run dev

Then open your browser and go to: http://localhost:5173

================================================================================
                        API ENDPOINTS
================================================================================

Backend API (http://localhost:8000):

1. POST /sentiment-analyze
   - Analyze sentiment of Vietnamese text
   - Body: { "text": "your text here" }
   - Returns: { "label": "POSITIVE/NEGATIVE/NEUTRAL", "score": 0.95, "normalized_text": "..." }

2. GET /sentiment-history
   - Get sentiment analysis history
   - Query params: ?search=keyword (optional)
   - Returns: { "history": [...] }

3. GET /
   - Health check endpoint
   - Returns: { "message": "Sentiment Analysis API is running" }

================================================================================
                        TROUBLESHOOTING
================================================================================

ISSUE: Backend cannot find module 'src'
----------------------------------------
SOLUTION: Make sure you run uvicorn from the 'backend' directory:
  cd backend
  uvicorn src.main:app --reload

ISSUE: Port 8000 already in use
--------------------------------
SOLUTION: Kill the process using port 8000:
  Windows:
    netstat -ano | findstr :8000
    taskkill /F /PID <PID_NUMBER>
  
  Linux/Mac:
    lsof -ti:8000 | xargs kill

ISSUE: Model download fails (SSL errors)
-----------------------------------------
SOLUTION: This is a network/SSL issue with HuggingFace. Try:
  1. Check your internet connection
  2. Wait and retry (it will retry automatically)
  3. If persistent, check firewall/proxy settings

ISSUE: Frontend cannot connect to backend
------------------------------------------
SOLUTION: 
  1. Make sure backend is running on http://localhost:8000
  2. Check CORS settings in backend/src/main.py
  3. Verify the API URL in frontend/sentimentFE/app/hooks/config.ts

ISSUE: npm install fails
--------------------------
SOLUTION:
  1. Delete node_modules folder
  2. Delete package-lock.json
  3. Run: npm install --legacy-peer-deps

================================================================================
                        PROJECT STRUCTURE
================================================================================

sentiment/
├── backend/
│   ├── src/
│   │   ├── main.py              # FastAPI application
│   │   ├── AI/
│   │   │   └── model.py         # Sentiment analysis model
│   │   └── db/
│   │       ├── db_init.py       # Database initialization
│   │       └── db_helper.py     # Database operations
│   ├── requirements.txt         # Python dependencies
│   └── sentiment.db            # SQLite database (auto-created)
│
└── frontend/
    └── sentimentFE/
        ├── app/
        │   ├── routes/
        │   │   └── sentiment.tsx    # Main sentiment page
        │   ├── components/
        │   │   ├── SentimentForm.tsx # Analysis form
        │   │   └── HistoryList.tsx   # History display
        │   └── hooks/
        │       └── sentimentPageHook.ts
        └── package.json         # Node dependencies

================================================================================
                        USAGE
================================================================================

1. Start both backend and frontend (see above)

2. Open browser: http://localhost:5173

3. Navigate to the sentiment analysis page

4. Enter Vietnamese text in the text area

5. Click "Analyze Sentiment" button

6. View the result (POSITIVE/NEGATIVE/NEUTRAL with confidence score)

7. Use the search box to filter history

8. Click "Back to Analyze" to analyze another text

================================================================================
                        NOTES
================================================================================

- The database (sentiment.db) is automatically created on first run
- All sentiment analyses are saved to the database
- The model supports Vietnamese text with slang/teencode normalization
- Text length limit: 2-10 words (configurable in backend/src/AI/model.py)

================================================================================
                        SUPPORT
================================================================================

If you encounter any issues:
1. Check that all dependencies are installed correctly
2. Verify both servers are running
3. Check console/terminal for error messages
4. Ensure ports 8000 (backend) and 5173 (frontend) are available

================================================================================

