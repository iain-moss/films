call activate scrapingenv
cd /d "H:\project-folder\d3\films\data\scraping"
del "H:\project-folder\d3\films\data\scraping\new_films.csv"
call scrapy crawl letterboxd -o new_films.csv
python letterboxd.py
cd "H:\project-folder\d3\github\films"
git add -A
git commit -m "Add films"
git push