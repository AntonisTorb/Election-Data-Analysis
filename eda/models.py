from pydantic import BaseModel


class GraphParameters(BaseModel):
    '''Model containing data for graph creation.'''

    country: str
    filetype: str
    bg_color: str
    bg_alpha: float
    line_color: str
    point_color: str
    text_color: str
    grid_color: str
    grid_alpha: float
    axes_color: str
