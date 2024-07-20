# Election-Data-Analysis
Data Analysis on historical election data (mainly Europe), measuring left/right alignment of parliament composition over time. Using different tools for analysis and visualizations. Still a WIP.


## Data source
https://www.parlgov.org/


## Using a virtual environment with Jupyter notebooks in VS Code
https://anbasile.github.io/posts/2017-06-25-jupyter-venv/

## Files
- `parlgov-development.db`: Source SQLite3 database.
- `main.ipynb`: Jupyter notebook with analysis.
- `elections.pbix`: Power BI analysis file (Make sure to change the DB connection path if you want to refresh).

## ToDo
- More analysis/visuals + visual customization.
- Create API and frontend to select country and date period, as well as display resulting visuals.
- Optimizations and documentation.
