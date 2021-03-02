#!/usr/bin/env python
# coding: utf-8

# In[1]:


import pandas as pd
from datetime import datetime
import numpy as np
# import scrapy
# from scrapy.crawler import CrawlerProcess


# In[2]:


# class CareerhubSpider(scrapy.Spider):
#     name = 'letterboxd'
#     allowed_domains = ['letterboxd.com']
#     start_urls = ['https://letterboxd.com/iainm/films/diary/']

#     def parse(self, response):
#         links = response.css('#diary-table > tbody > tr > td.td-film-details > h3 > a::attr(href)').extract()
#         ratings = response.css('#diary-table > tbody > tr > td.td-rating.rating-green > div > span::attr(class)').extract()
#         rating_dates = response.css('#diary-table > tbody > tr > td.td-day.diary-day.center > a::attr(href)').extract()

#         for link, rating, rating_date in zip(links, ratings, rating_dates):
#             link = response.urljoin(link)
#             yield scrapy.Request(url=link, callback=self.parse_review, meta={'rating': rating, 'date_rated': rating_date})

#         next_page = response.css(
#             'a.next::attr(href)').extract_first()
#         if next_page:
#             next_page = response.urljoin(next_page)
#             yield scrapy.Request(next_page, callback=self.parse)

#     def parse_review(self, response):
#         title_links = response.css('#content > div > div > section > section > section > h2 > span.film-title-wrapper > a::attr(href)').extract()
        
#         for title_link in title_links:
#             title_link = response.urljoin(title_link)
#             yield scrapy.Request(url=title_link, callback=self.parse_details, meta={'rating': response.meta['rating'], 'date_rated': response.meta['date_rated']})

#     def parse_details(self, response):
#         yield {
#             'title': response.css('#featured-film-header > h1::text').extract_first(),
#             'year': response.css('#featured-film-header > p > small > a::text').extract_first(),
#             'rating': response.meta['rating'],
#             'date_rated': response.meta['date_rated'],
#             'duration': response.css('#film-page-wrapper > div.col-17 > section.section.col-10.col-main > p::text').extract_first().strip(),
#             'director': response.xpath('//a[contains(@class, "text-slug") and contains(@href, "director")]/text()').extract(),
#             'country': response.xpath('//a[contains(@class, "text-slug") and contains(@href, "films/country")]/text()').extract(),
#             'genre': response.xpath('//a[contains(@class, "text-slug") and contains(@href, "/films/genre")]/text()').extract(),
#             'actors': response.css('#tab-cast > div > p > a::text').extract(),
#             'image': response.css('#js-poster-col img::attr(src)').extract_first(),
#             'backdrop': response.css("#backdrop::attr(data-backdrop)").extract_first(),
#             'summary': response.css('div.truncate > p::text').extract_first()
#         }


# In[3]:


df = pd.read_csv("letterboxd.csv")
df.head()


# In[4]:


df["rating"] = df["rating"].str.split("-", expand=True)[1]


# In[5]:


df["date_rated"] = df["date_rated"].str[-11:].str[0:10]


# In[6]:


df["duration"] = df["duration"].str.split(expand=True)[0]


# In[7]:


df["genre"] = df["genre"].str.title()


# In[8]:


df["genre"] = df["genre"].str.replace(",", ", ")


# In[9]:


df["director"] = df["director"].str.replace(",", ", ")


# In[10]:


df['date_rated'] = pd.to_datetime(df.date_rated, format='%Y/%m/%d')


# In[11]:


df["decade"] = df["year"].astype(str).str[:3] + "0s"


# In[12]:


df[["rating", "duration"]] = df[["rating", "duration"]].astype(int)


# In[13]:


#df = df[df["director"].notnull()]
df["director"] = df["director"].fillna("Director not specified")


# In[14]:


df["actors"] = df["actors"].fillna("Cast not specified")


# In[15]:


df["genre"] = df["genre"].fillna("Genre not specified")


# In[16]:


df.set_index("title", inplace=True)


# In[17]:


df.loc[["Teddy Bomb"], ["country"]] = "Canada"
df.loc[["Daisies", "Loves of a Blonde", "The Shop on Main Street"], ["country"]] = "Czechia"
df.loc[["Three Businessmen"], ["country"]] = "USA,Japan,Netherlands,UK"
df.loc[["That Evening Sun"], ["country"]] = "USA"
df.loc[["All Tomorrow's Parties"], ["country"]] = "UK"
df.loc[["Stalker"], ["country"]] = "Russian Federation"
df.loc[["The Cremator"], ["country"]] = "Czechia"
df.loc[["The Cranes Are Flying"], ["country"]] = "Russian Federation"
df.loc[["Letter Never Sent"], ["country"]] = "Russian Federation"
df.loc[["Freaky Farley"], ["country"]] = "USA"


# In[18]:


blank_country = df.country.isnull()


# In[19]:


df[blank_country]


# In[22]:


if len(df[blank_country]) > 0:
    print("MISSING COUNTRIES!")


# In[20]:


df.reset_index(inplace=True)


# In[21]:


df.to_csv("../all_letterboxd.csv")


# In[21]:


df.to_csv("../../../github/films/data/all_letterboxd.csv")


# # Directors

# In[22]:


directors = df["director"].str.split(",", expand=True)


# In[23]:


directors = directors.unstack().reset_index(name="director")


# In[24]:


directors.drop(columns=["level_0", "level_1"], inplace=True)


# In[25]:


directors["director"] = directors["director"].str.strip()


# In[26]:


directors.dropna(inplace=True)


# In[27]:


directors["count"] = 1


# In[28]:


directors = pd.DataFrame(directors.groupby("director")["count"].sum())


# In[29]:


directors.sort_values(by="count", ascending=False, inplace=True)


# In[30]:


directors = directors[:20]


# In[31]:


directors.to_csv("../directors.csv")


# In[31]:


directors.to_csv("../../../github/films/data/directors.csv")


# In[32]:


dir_bar = df.iloc[:,[0, 2, 5]]
dir_bar.head()


# In[33]:


dir_bar = dir_bar.assign(director=dir_bar["director"].str.split(",")).explode("director")


# In[34]:


dir_bar["director"] = dir_bar["director"].str.strip()


# In[35]:


pivot = pd.pivot_table(dir_bar, index=["director"], columns=["title"], margins=True, aggfunc=[np.mean, len])


# In[36]:


pivot = pivot.stack("title")


# In[37]:


pivot = pivot.reset_index()


# In[38]:


pivot = pivot.loc[pivot.director != "All"]


# In[39]:


pivot.columns = pivot.columns.droplevel(1)


# In[40]:


pivot


# In[41]:


pivot.to_csv("../test.csv", index=False)


# In[41]:


pivot.to_csv("../../../github/films/data/test.csv", index=False)


# In[42]:


dir_bar.to_csv("../dir_bar.csv", index=False)


# In[42]:


dir_bar.to_csv("../../../github/films/data/dir_bar.csv", index=False)


# # Decade

# In[43]:


decade = df.groupby("decade").agg({"title": "size", "rating": "mean"}).rename(columns={"title": "count", "rating": "avg_rating"})
decade


# In[44]:


decade.to_csv("../decade_breakdown.csv")


# In[44]:


decade.to_csv("../../../github/films/data/decade_breakdown.csv")


# # Release Year

# In[45]:


release_year = df.iloc[:, [0, 1]]


# In[46]:


min_year = release_year["year"].min()


# In[47]:


max_year = release_year["year"].max()


# In[48]:


year_range = np.arange(min_year, max_year + 1)


# In[49]:


release_year_group = release_year.groupby(["year"]).count()


# In[50]:


release_year_group = release_year_group.reindex(year_range).fillna(0)


# In[51]:


release_year_group.to_csv("../release_year.csv")


# In[51]:


release_year_group.to_csv("../../../github/films/data/release_year.csv")


# # Watch date

# In[52]:


w_date = df.set_index("date_rated")


# In[53]:


w_date = w_date.groupby("date_rated").count()


# In[54]:


w_date = pd.DataFrame(w_date.iloc[:, 1])


# In[55]:


first_w_date = pd.Timestamp("2015-04-25")
last_w_date = w_date.index.max()


# In[56]:


w_date_range = pd.date_range(start=first_w_date, end=last_w_date)


# In[57]:


w_date = w_date.reindex(w_date_range).fillna(0)


# In[58]:


monthly = w_date.groupby(pd.Grouper(freq="MS")).sum()


# In[59]:


monthly.rename(columns={"year": "count"}, inplace=True)


# In[60]:


monthly.to_csv("../watch_date.csv", index_label="date")


# In[60]:


monthly.to_csv("../../../github/films/data/watch_date.csv", index_label="date")


# # Genres

# In[61]:


genres = df.iloc[:, [0, 7]]


# In[62]:


genres = genres.assign(genre=genres["genre"].str.split(", ")).explode("genre")


# In[63]:


genres.drop(columns="title", inplace=True)


# In[64]:


genres = genres.drop_duplicates().dropna()


# In[65]:


genres = genres[genres["genre"] != "Tv Movie"]


# In[66]:


genres = genres[genres["genre"] != "Genre not specified"]


# In[67]:


genres = genres.sort_values("genre")


# In[68]:


genres.to_csv("../genre_list.csv", index=False)


# In[68]:


genres.to_csv("../../../github/films/data/genre_list.csv", index=False)


# # Countries

# In[69]:


countries = df.iloc[:, [0, 6]]


# In[70]:


countries = countries.assign(country=countries["country"].str.split(",")).explode("country")


# In[71]:


countries.drop(columns="title", inplace=True)


# In[72]:


countries = countries.drop_duplicates().dropna()


# In[73]:


countries.sort_values(by="country", inplace=True)


# In[74]:


countries.to_csv("../countries.csv", index=False)


# In[74]:


countries.to_csv("../../../github/films/data/countries.csv", index=False)


# In[ ]:




