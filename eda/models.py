from typing import Optional
from pydantic import BaseModel


class GraphParameters(BaseModel):
    '''Model containing data for graph creation.'''

    country: str
    start_date: Optional[str] = ""
    end_date: Optional[str] = ""
    filetype: str
    bg_color: str
    bg_alpha: float
    line_connecting_color: str
    line_regression_color: str
    point_color: str
    text_color: str
    grid_color: str
    grid_alpha: float
    axes_color: str
