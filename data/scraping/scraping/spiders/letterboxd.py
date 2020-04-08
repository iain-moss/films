import scrapy

class CareerhubSpider(scrapy.Spider):
    name = 'letterboxd'
    allowed_domains = ['letterboxd.com']
    start_urls = ['https://letterboxd.com/iainm/films/diary/']

    def parse(self, response):
        links = response.css('#diary-table > tbody > tr > td.td-film-details > h3 > a::attr(href)').extract()
        ratings = response.css('#diary-table > tbody > tr > td.td-rating.rating-green > div > span::attr(class)').extract()
        rating_dates = response.css('#diary-table > tbody > tr > td.td-day.diary-day.center > a::attr(href)').extract()

        for link, rating, rating_date in zip(links, ratings, rating_dates):
            link = response.urljoin(link)
            yield scrapy.Request(url=link, callback=self.parse_review, meta={'rating': rating, 'date_rated': rating_date})

        next_page = response.css(
            'a.next::attr(href)').extract_first()
        if next_page:
            next_page = response.urljoin(next_page)
            yield scrapy.Request(next_page, callback=self.parse)

    def parse_review(self, response):
        title_links = response.css('#content > div > div > section > section > section > h2 > span.film-title-wrapper > a::attr(href)').extract()
        
        for title_link in title_links:
            title_link = response.urljoin(title_link)
            yield scrapy.Request(url=title_link, callback=self.parse_details, meta={'rating': response.meta['rating'], 'date_rated': response.meta['date_rated']})

    def parse_details(self, response):
        yield {
            'title': response.css('#featured-film-header > h1::text').extract_first(),
            'year': response.css('#featured-film-header > p > small > a::text').extract_first(),
            'rating': response.meta['rating'],
            'date_rated': response.meta['date_rated'],
            'duration': response.css('#film-page-wrapper > div.col-17 > section.section.col-10.col-main > p::text').extract_first().strip(),
            'director': response.xpath('//a[contains(@class, "text-slug") and contains(@href, "director")]/text()').extract(),
            'country': response.xpath('//a[contains(@class, "text-slug") and contains(@href, "films/country")]/text()').extract(),
            'genre': response.xpath('//a[contains(@class, "text-slug") and contains(@href, "/films/genre")]/text()').extract(),
            'actors': response.css('#tab-cast > div > p > a::text').extract(),
            'image': response.css('#js-poster-col img::attr(src)').extract_first(),
            'backdrop': response.css("#backdrop::attr(data-backdrop)").extract_first(),
            'summary': response.css('div.truncate > p::text').extract_first()
        }