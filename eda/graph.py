from io import BytesIO
import sqlite3

from .models import GraphParameters

from matplotlib import dates
import matplotlib.pyplot as plt
from matplotlib.figure import Figure
import numpy as np
import pandas as pd


def get_countries_list(cur: sqlite3.Cursor) -> list[str]:
    '''Returns a list of all countries in the database country table.'''

    cur.execute("SELECT name FROM country ORDER BY name")
    return [country_tuple[0] for country_tuple in cur.fetchall()]


def get_country_id(cur: sqlite3.Cursor, country: str) -> int:
    '''Returns the `country_id` linked to the provided country name from the database country table.'''
    
    cur.execute("SELECT id from country WHERE name=?", (country,))
    return cur.fetchone()[0]


def get_election_df(con: sqlite3.Connection, country_id: int) -> pd.DataFrame:
    '''Returns a pandas dataframe containing the following election information for the provided country id
    from the database election table:

    (id, date, seats_total) 
    '''

    df_election = pd.read_sql_query("SELECT id, date, seats_total FROM election WHERE country_id=? AND type_id=13 ORDER BY date DESC", con, params=(country_id,))
    
    df_election["date"] = pd.to_datetime(df_election["date"], format="%Y-%m-%d")
    return df_election


def get_election_results_df(con: sqlite3.Connection, country_id: int,  election_ids: tuple) -> pd.DataFrame:
    '''Calculates and returns a pandas dataframe containing the following election result information
    for the provided country id from the database election_result, party and viewcalc_party_position tables:

    (election_id, party_id, seats, name, left_right, left_right_calc)
    '''
    
    qry= f'SELECT election_id, party_id, seats FROM election_result WHERE election_id IN ({",".join("?"*len(election_ids))})'
    df_election_results = pd.read_sql_query(qry, con, params=election_ids)
    
    qry = f'SELECT party.id, party.name, viewcalc_party_position.left_right FROM party LEFT JOIN viewcalc_party_position ON party.id=viewcalc_party_position.party_id WHERE party.country_id=?'
    df_party_left_right = pd.read_sql_query(qry, con, params=(country_id,))
    df_election_results = pd.merge(df_election_results, df_party_left_right, how="left", left_on="party_id", right_on="id")

    df_election_results["left_right_calc"] = df_election_results["seats"] * df_election_results["left_right"]
    df_election_results = df_election_results.drop("id", axis=1)
    return df_election_results


def get_final_df(df_election: pd.DataFrame, df_election_results: pd.DataFrame) -> pd.DataFrame:
    '''Calculates and returns a pandas dataframe containing the following information needed for the graph creation
    for the provided country id:

    (id, date, seats_total, left_right, previous_left_right, left_right_difference)
    '''

    df_final = pd.merge(df_election, df_election_results, left_on="id", right_on="election_id")
    df_final["left_right"] = df_final.groupby("id")["left_right_calc"].transform("sum") / df_final["seats_total"]
    df_final = df_final[["id", "date", "seats_total", "left_right"]].drop_duplicates(["id"]).sort_values(["date"], ascending=False)
    df_final["left_right"] = df_final["left_right"].round(2)
    df_final["previous_left_right"] = df_final['left_right'].shift(-1).fillna(df_final['left_right'])
    df_final["left_right_difference"] = df_final['left_right'] - df_final["previous_left_right"]

    return df_final


def get_fig(df_final: pd.DataFrame, data: GraphParameters) -> Figure:
    '''Creates and returns a `Figure` object containing the "left_right - "date" Matplotlib plot.'''

    fig, ax = plt.subplots()

    # Linear regression line: y = a * x + b 
    a, b = np.polyfit(dates.date2num(df_final["date"]), df_final["left_right"], 1)

    ax.plot(df_final["date"],
             a * dates.date2num(df_final["date"]) + b,
             color=data.line_regression_color
             )
    
    ax.plot(df_final["date"], 
            df_final["left_right"], 
            marker="o", 
            markeredgecolor=data.point_color, 
            markerfacecolor=data.point_color, 
            color=data.line_connecting_color
            )
    
    fig.patch.set_color(data.bg_color)
    fig.patch.set_alpha(data.bg_alpha)

    ax.patch.set_color(data.bg_color)
    ax.patch.set_alpha(data.bg_alpha)

    ax.set_xlabel("Election Date", color=data.text_color)
    ax.set_ylabel("Weighted Left-Right Parliament Index", color=data.text_color)
    ax.set_title(f'{data.country} - Parliament composition per election', color=data.text_color)

    ax.tick_params(colors=data.axes_color)
    for spine in ax.spines.values():
        spine.set_color(data.axes_color)

    ax.grid(color=data.grid_color, alpha=data.grid_alpha)

    return fig


def create_graph(con: sqlite3.Connection, cur: sqlite3.Cursor, data: GraphParameters) -> BytesIO:
    '''Generates the required dataframes for the graph creation, creates a `BytesIO` buffer containing 
    the graph data and returns the buffer.
    '''

    country_id = get_country_id(cur, data.country)
    df_election = get_election_df(con, country_id)

    election_ids = tuple(df_election.get("id"))

    df_election_results = get_election_results_df(con, country_id, election_ids)

    df_final = get_final_df(df_election, df_election_results)
    fig = get_fig(df_final, data)
    # plt.show()

    buf = BytesIO()
    fig.savefig(buf, format=data.filetype)
    return buf
