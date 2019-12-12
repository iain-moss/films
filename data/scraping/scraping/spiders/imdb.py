# -*- coding: utf-8 -*-
import scrapy


class CareerhubSpider(scrapy.Spider):
    name = 'imdb'
    allowed_domains = ['imdb.com']
    start_urls = ['https://www.imdb.com/user/ur59953630/ratings?ref_=m_nv_usr_rt_t']

    def parse(self, response):
        links = response.css(
            '#ratings-container > div.lister-item > div.lister-item-content > h3 > a::attr(href)').extract()
        ratings = response.css(
            '#ratings-container > div.lister-item > div.lister-item-content > div.ipl-rating-widget > div.ipl-rating-star.ipl-rating-star--other-user.small > span.ipl-rating-star__rating::text').extract()
        rating_dates = response.xpath(
            '//div[@class="lister-item-content"]/p[contains(text(),"Rated on")]/text()').extract()
        for link, rating, rating_date in zip(links, ratings, rating_dates):
            link = response.urljoin(link)
            yield scrapy.Request(url=link, callback=self.parse_details, meta={'rating': rating, 'date_rated': rating_date})

        next_page = response.css(
            'div.list-pagination > a.flat-button.lister-page-next.next-page::attr(href)').extract_first()
        if next_page:
            next_page = response.urljoin(next_page)
            yield scrapy.Request(next_page, callback=self.parse)

    def parse_details(self, response):
        yield {
            'title': response.css('h1::text').extract_first().strip(),
            'year': response.css('#titleYear > a::text').extract_first(),
            'rating': response.meta['rating'],
            'date_rated': response.meta['date_rated'],
            'duration': response.css('div.subtext > time::text').extract_first().strip(),
            'director': response.css('div.credit_summary_item:nth-child(2) > a::text').extract(),
            'country': response.xpath(
            '//div[contains(@class, "txt-block") and contains(.//h4, "Country")]/a/text()').extract(),
            'genre': response.xpath(
            "//div[contains(.//h4, 'Genres')]/a/text()").extract(),
            'image': response.xpath('//div[contains(@class, "poster")]/a/img/@src').extract_first(),
            'summary': response.css('div.summary_text::text').extract_first().strip()
        }
