from pathlib import Path
import sqlite3

import matplotlib.pyplot as plt
from matplotlib.figure import Figure
import pandas as pd


def get_election_df(con: sqlite3.Connection, country_id: int) -> pd.DataFrame:

    df_election = pd.read_sql_query("SELECT id, date, seats_total FROM election WHERE country_id=? AND type_id=13 ORDER BY date DESC", con, params=(country_id,))
    
    df_election["date"] = pd.to_datetime(df_election["date"], format="%Y-%m-%d")
    return df_election

def get_election_results_df(con: sqlite3.Connection, election_ids: tuple) -> pd.DataFrame:
    
    qry= f'SELECT election_id, party_id, seats FROM election_result WHERE election_id IN ({",".join("?"*len(election_ids))})'
    df_election_results = pd.read_sql_query(qry, con, params=election_ids)
    
    qry = f'SELECT party.id, party.name, viewcalc_party_position.left_right FROM party LEFT JOIN viewcalc_party_position ON party.id=viewcalc_party_position.party_id WHERE party.country_id=?'
    df_party_left_right = pd.read_sql_query(qry, con, params=(country_id,))
    df_election_results = pd.merge(df_election_results, df_party_left_right, how="left", left_on="party_id", right_on="id")

    df_election_results["left_right_calc"] = df_election_results["seats"] * df_election_results["left_right"]
    df_election_results = df_election_results.drop("id", axis=1)
    return df_election_results


def get_final_df(df_election: pd.DataFrame, df_election_results: pd.DataFrame) -> pd.DataFrame:

    df_final = pd.merge(df_election, df_election_results, left_on="id", right_on="election_id")
    df_final["left_right"] = df_final.groupby("id")["left_right_calc"].transform("sum") / df_final["seats_total"]
    df_final = df_final[["id", "date", "seats_total", "left_right"]].drop_duplicates(["id"]).sort_values(["date"], ascending=False)
    df_final["left_right"] = df_final["left_right"].round(2)
    df_final["previous_left_right"] = df_final['left_right'].shift(-1).fillna(df_final['left_right'])
    df_final["left_right_difference"] = df_final['left_right'] - df_final["previous_left_right"]

    return df_final


def get_fig(df_final: pd.DataFrame) -> Figure:

    fig, ax = plt.subplots()
    ax.plot(df_final["date"], 
            df_final["left_right"], 
            marker="o", 
            markeredgecolor="#03fcf0", 
            markerfacecolor="#fca103", 
            color="#0b03fc"
            )
    
    fig.patch.set_color("#5e5e5e")
    fig.patch.set_alpha(0.1)

    ax.patch.set_color("#c2a8a7")
    ax.patch.set_alpha(0.1)

    ax.set_xlabel("Election Date", color="#6f03fc")
    ax.set_ylabel("Weighted Left-Righht Parliament Index", color="#6f03fc")
    ax.set_title("Parliament composition", color="#6f03fc")

    ax.tick_params(colors="#fc2003")
    for spine in ax.spines.values():
        spine.set_color("#c2fc03")

    ax.grid(color="#000000", alpha=0.2)

    return fig

if __name__ == "__main__":

    db_path = Path("parlgov-development.db")
    con = sqlite3.connect(db_path, detect_types=sqlite3.PARSE_DECLTYPES)
    '''
    Need to:
    1) Get list of countries from db.
    2) Create API endpoint to send countries to frontend.
    3) Create API endpoint to receive country as parameter and send list of election dates as response.
    4) Add logic to add linear regression line to graph.
    5) Create API endpoint to receive paramenters, produce graph, and send it as response.
    '''
    country_id = 41
    df_election = get_election_df(con, country_id)

    election_ids = tuple(df_election.get("id"))

    df_election_results = get_election_results_df(con, election_ids)

    df_final = get_final_df(df_election, df_election_results)
    fig = get_fig(df_final)
    fig.savefig("test.png")
    plt.show()
