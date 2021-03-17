# To add a new cell, type '# %%'
# To add a new markdown cell, type '# %% [markdown]'
# %%
import pandas as pd
from datetime import datetime
import numpy as np


# %%
df = pd.read_csv("new_films.csv")
df.head()


# %%
df["rating"] = df["rating"].str.split("-", expand=True)[1]


# %%
df["date_rated"] = df["date_rated"].str[-11:].str[0:10]


# %%
df["duration"] = df["duration"].str.split(expand=True)[0]


# %%
df["genre"] = df["genre"].str.title()


# %%
df["genre"] = df["genre"].str.replace(",", ", ")


# %%
df["director"] = df["director"].str.replace(",", ", ")


# %%
df['date_rated'] = pd.to_datetime(df.date_rated, format='%Y/%m/%d')


# %%
df["decade"] = df["year"].astype(str).str[:3] + "0s"


# %%
df[["rating", "duration"]] = df[["rating", "duration"]].astype(int)


# %%
#df = df[df["director"].notnull()]
df["director"] = df["director"].fillna("Director not specified")


# %%
df["actors"] = df["actors"].fillna("Cast not specified")


# %%
df["genre"] = df["genre"].fillna("Genre not specified")


# %%
df.set_index("title", inplace=True)


# %%
# df.loc[["Teddy Bomb"], ["country"]] = "Canada"
# df.loc[["Daisies", "Loves of a Blonde", "The Shop on Main Street"], ["country"]] = "Czechia"
# df.loc[["Three Businessmen"], ["country"]] = "USA,Japan,Netherlands,UK"
# df.loc[["That Evening Sun"], ["country"]] = "USA"
# df.loc[["All Tomorrow's Parties"], ["country"]] = "UK"
# df.loc[["Stalker"], ["country"]] = "Russian Federation"
# df.loc[["The Cremator"], ["country"]] = "Czechia"
# df.loc[["The Cranes Are Flying"], ["country"]] = "Russian Federation"
# df.loc[["Letter Never Sent"], ["country"]] = "Russian Federation"
# df.loc[["Freaky Farley"], ["country"]] = "USA"


# %%
blank_country = df.country.isnull()


# %%
df[blank_country]


# %%
if len(df[blank_country]) > 0:
    print("MISSING COUNTRIES!")


# %%
df.reset_index(inplace=True)


# %%
all_letterboxd = pd.read_csv("../all_letterboxd.csv", index_col=[0])


# %%
all_letterboxd.date_rated = pd.to_datetime(all_letterboxd.date_rated, format='%Y-%m-%d')


# %%
all_letterboxd = pd.concat([all_letterboxd, df])


# %%
all_letterboxd.reset_index(drop=True, inplace=True)


# %%
all_letterboxd.sort_values(by='date_rated', inplace=True)


# %%
all_letterboxd.drop_duplicates(subset=['title', 'year', 'director'], keep='last', inplace=True)


# %%
all_letterboxd.reset_index(drop=True, inplace=True)


# %%
all_letterboxd.to_csv("../all_letterboxd.csv")


# %%
all_letterboxd.to_csv("../../../github/films/data/all_letterboxd.csv")

# %% [markdown]
# # Directors

# %%
directors = all_letterboxd["director"].str.split(",", expand=True)


# %%
directors = directors.unstack().reset_index(name="director")


# %%
directors.drop(columns=["level_0", "level_1"], inplace=True)


# %%
directors["director"] = directors["director"].str.strip()


# %%
directors.dropna(inplace=True)


# %%
directors["count"] = 1


# %%
directors = pd.DataFrame(directors.groupby("director")["count"].sum())


# %%
directors.sort_values(by="count", ascending=False, inplace=True)


# %%
directors = directors[:20]


# %%
directors.to_csv("../directors.csv")


# %%
directors.to_csv("../../../github/films/data/directors.csv")


# %%
dir_bar = all_letterboxd.iloc[:,[0, 2, 5]]
dir_bar.head()


# %%
dir_bar = dir_bar.assign(director=dir_bar["director"].str.split(",")).explode("director")


# %%
dir_bar["director"] = dir_bar["director"].str.strip()


# %%
pivot = pd.pivot_table(dir_bar, index=["director"], columns=["title"], margins=True, aggfunc=[np.mean, len])


# %%
pivot = pivot.stack("title")


# %%
pivot = pivot.reset_index()


# %%
pivot = pivot.loc[pivot.director != "All"]


# %%
pivot.columns = pivot.columns.droplevel(1)


# %%
pivot


# %%
pivot.to_csv("../test.csv", index=False)


# %%
pivot.to_csv("../../../github/films/data/test.csv", index=False)


# %%
dir_bar.to_csv("../dir_bar.csv", index=False)


# %%
dir_bar.to_csv("../../../github/films/data/dir_bar.csv", index=False)

# %% [markdown]
# # Decade

# %%
decade = all_letterboxd.groupby("decade").agg({"title": "size", "rating": "mean"}).rename(columns={"title": "count", "rating": "avg_rating"})
decade


# %%
decade.to_csv("../decade_breakdown.csv")


# %%
decade.to_csv("../../../github/films/data/decade_breakdown.csv")

# %% [markdown]
# # Release Year

# %%
release_year = all_letterboxd.iloc[:, [0, 1]]


# %%
min_year = release_year["year"].min()


# %%
max_year = release_year["year"].max()


# %%
year_range = np.arange(min_year, max_year + 1)


# %%
release_year_group = release_year.groupby(["year"]).count()


# %%
release_year_group = release_year_group.reindex(year_range).fillna(0)


# %%
release_year_group.to_csv("../release_year.csv")


# %%
release_year_group.to_csv("../../../github/films/data/release_year.csv")

# %% [markdown]
# # Watch date

# %%
w_date = all_letterboxd.set_index("date_rated")


# %%
w_date = w_date.groupby("date_rated").count()


# %%
w_date = pd.DataFrame(w_date.iloc[:, 1])


# %%
first_w_date = pd.Timestamp("2015-04-25")
last_w_date = w_date.index.max()


# %%
w_date_range = pd.date_range(start=first_w_date, end=last_w_date)


# %%
w_date = w_date.reindex(w_date_range).fillna(0)


# %%
monthly = w_date.groupby(pd.Grouper(freq="MS")).sum()


# %%
monthly.rename(columns={"year": "count"}, inplace=True)


# %%
monthly.to_csv("../watch_date.csv", index_label="date")


# %%
monthly.to_csv("../../../github/films/data/watch_date.csv", index_label="date")

# %% [markdown]
# # Genres

# %%
genres = all_letterboxd.iloc[:, [0, 7]]


# %%
genres = genres.assign(genre=genres["genre"].str.split(", ")).explode("genre")


# %%
genres.drop(columns="title", inplace=True)


# %%
genres = genres.drop_duplicates().dropna()


# %%
genres = genres[genres["genre"] != "Tv Movie"]


# %%
genres = genres[genres["genre"] != "Genre not specified"]


# %%
genres = genres.sort_values("genre")


# %%
genres.to_csv("../genre_list.csv", index=False)


# %%
genres.to_csv("../../../github/films/data/genre_list.csv", index=False)

# %% [markdown]
# # Countries

# %%
countries = all_letterboxd.iloc[:, [0, 6]]


# %%
countries = countries.assign(country=countries["country"].str.split(",")).explode("country")


# %%
countries.drop(columns="title", inplace=True)


# %%
countries = countries.drop_duplicates().dropna()


# %%
countries.sort_values(by="country", inplace=True)


# %%
countries.to_csv("../countries.csv", index=False)


# %%
countries.to_csv("../../../github/films/data/countries.csv", index=False)


# %%



