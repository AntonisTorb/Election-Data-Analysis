from io import BytesIO
from pathlib import Path
import sqlite3

from eda.models import GraphParameters
from eda.graph import get_countries_list, create_graph

from fastapi import APIRouter, Response


db_path: Path = Path("parlgov-development.db")
con: sqlite3.Connection = sqlite3.connect(db_path, detect_types=sqlite3.PARSE_DECLTYPES)
cur: sqlite3.Cursor = con.cursor()

router: APIRouter = APIRouter()

@router.get("/countries")
async def get_countries():
    return get_countries_list(cur)


@router.post("/graph", response_model=GraphParameters, response_class=Response)
async def post_graph(data: GraphParameters):
    graph: BytesIO = create_graph(con, cur, data)
    return Response(content=graph.getvalue(), media_type=f'image/{data.filetype}')