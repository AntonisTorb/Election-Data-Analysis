from pathlib import Path
import sqlite3

from eda.routes import router

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn


db_path = Path("parlgov-development.db")
con: sqlite3.Connection = sqlite3.connect(db_path, detect_types=sqlite3.PARSE_DECLTYPES)
cur: sqlite3.Cursor = con.cursor()

app = FastAPI()
app.include_router(router)
app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000)#, reload=True)
