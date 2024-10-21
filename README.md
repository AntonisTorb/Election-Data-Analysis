# Election-Data-Analysis
Data Analysis on historical election data (mainly Europe), measuring left/right alignment of parliament composition over time. Using different tools for analysis and visualizations. Still a WIP.


## Data source
https://www.parlgov.org/

## Files
- `parlgov-development.db`: Source SQLite3 database.
- `Jupyter/main.ipynb`: Jupyter notebook with analysis.
- `PowerBI/elections.pbix`: Power BI analysis file (Make sure to change the DB connection path if you want to refresh).
- `main.py`: FastAPI backend API to serve data and graphs.
- `index.html`: Frontend to select paramenters and display graphs.

## How to use the frontend and API
- Run the api with the terminal command: `python main.py` in the main directory.
- Open the `index.html` to select parameters and display the resulting graphs.


## Using a virtual environment with Jupyter notebooks in VS Code
https://anbasile.github.io/posts/2017-06-25-jupyter-venv/


## ToDo
- Make regression line optional via option.
- More analysis/visuals + visual customization.
- Optimizations and documentation.
