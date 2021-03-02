call activate scrapingenv
cd /d "H:\project-folder\d3\films\data\scraping"
del "H:\project-folder\d3\films\data\scraping\letterboxd.csv"
call scrapy crawl letterboxd -o letterboxd.csv
python letterboxd.py