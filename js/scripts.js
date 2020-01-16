const round = d3.format(".1f");

// Tabs
$(document).ready(function() {
    $(".tab-button:not(:first)").addClass("inactive");
    $(".tab-content").hide();
    $(".tab-content:first").show();

    $(".tab-button").on("click", function() {
        let t = $(this).attr("data-tab")
        if ($(this).hasClass("inactive")) {
            $(".tab-button").addClass("inactive")
            $(this).removeClass("inactive");

            $(".tab-content").hide();
            $("#" + t).show();
        };
    })
});

async function cards() {
    let data = await d3.csv("./data/all_letterboxd.csv", d3.autoType);
    data.sort((a, b) => d3.descending(a.date_rated, b.date_rated));

    const buttons = d3.selectAll("div.dropdown-container  button");

    const minScore = d3.min(data, d => d.rating);
    const filmCount = data.length;
    const totalDuration = d3.sum(data, d => d.duration);
    const aveRating = d3.mean(data, d => d.rating);

    const formatCommaOneDec = d3.format(",.1f");
    const formatTwoDec = d3.format(".2f");
    const dateFormat = d3.timeFormat("%-d %B %Y");
    const formatComma = d3.format(",");

    const tooltip = d3.select("#tooltip");

    const decades = d3.nest()
        .key(d => d.decade)
        .sortKeys(d3.ascending)
        .rollup(v => v.length)
        .entries(data);

    const decadeFilter = d3.select("#decade-filter");

    decadeFilter.append("option")
        .data(decades.map(d => d.key))
        .attr("value", "all-films")
        .classed("default", true)
        .text(`All decades (${formatComma(filmCount)} films)`)
        .enter();

    decadeFilter.selectAll("option.decade")
        .data(decades)
        .join("option")
        .classed("decade", true)
        .attr("value", d => d.key)
        .text(d => `${d.key} (${formatComma(d.value)} films)`);

    const colours = d3.scaleLinear()
        .range(["#ACD9E5", "#E82632"])
        .domain([minScore, 10]);

    function truncateTitle(title) {
        if (title.length > 50) {
            return title.slice(0, 47) + "...";
        } else {
            return title;
        }
    };

    const stars = ["","&#189;","&#9733;","&#9733;&#189;","&#9733;&#9733;","&#9733;&#9733;&#189;","&#9733;&#9733;&#9733;","&#9733;&#9733;&#9733;&#189;","&#9733;&#9733;&#9733;&#9733;","&#9733;&#9733;&#9733;&#9733;&#189;","&#9733;&#9733;&#9733;&#9733;&#9733;"];

    function convertToStars(rating) {
        return stars[rating];
    };

    // function truncateSummary(summary) {
    //     if (summary.length > 380) {
    //         return summary.slice(0, 380) + "...";
    //     } else {
    //         return summary;
    //     }
    // };
    
    d3.select(".card-container")
        .selectAll(".card-panel")
        .data(data)
        .join("div")
        .classed("card-panel", true)
        .each(function(d) {
            d3.select(this)
                .html(
                    `<img src="${d.image}" class="poster">
                    <div class="film-details">
                        <h1>${truncateTitle(d.title)} <span class="year">(${d.year})</span></h1>
                        <p>${d.director}</p>
                        <ul>
                            <li>${d.duration} mins</li>
                            <li style="color: ${colours(d.rating)}">${convertToStars(d.rating)}</li>
                        </ul>
                    </div>`
                );
            })
            .on("click", function(d) {
                tooltip.style("opacity", 1);
                tooltip.style("left", `${d3.event.pageX - 250}px`);
                tooltip.style("top", `${d3.event.pageY - 172.5}px`);
                tooltip.html(`<img src="${d.image}" class="tooltip-poster">
                            <div class="tooltip-film-details">
                                <h1>${d.title} (${d.director})</h1>
                                <p class="year">${d.genre}</p>
                                <p class="year">Watched on ${dateFormat(d.date_rated)}</p>
                                <p style="color: ${colours(d.rating)}">${convertToStars(d.rating)}</p>
                                <div class="tooltip-summary">
                                    <p>${d.summary}</p>
                                </div>
                            </div>`
                            );
                d3.selectAll(".card-panel")
                    .transition()
                    .duration(100)
                    .style("opacity", 0.1);
                d3.select(this)
                    .transition()
                    .duration(100)
                    .style("opacity", 1)
                    .style("cursor", "none");
            })
            .on("mouseleave", function(d) {
                tooltip.style("opacity", 0);
                d3.selectAll(".card-panel")
                    .transition()
                    .duration(100)
                    .style("opacity", 1)
                    .style("cursor", "pointer");
            })
            .on("mousemove", function(d) {
                tooltip.style("left", `${d3.event.pageX - 250}px`);
                tooltip.style("top", `${d3.event.pageY - 172.5}px`);
            });

        let sortAllFilmsOrder = false;

        d3.select("#sort-date")
            .on("click", function() {
                const attribute = d3.select(this).property("value");
                sortAllFilms(attribute);
                if (sortAllFilmsOrder) {
                    d3.select(this).attr("class", "des")
                } else {
                    d3.select(this).attr("class", "asc");
                };
            });
    
        d3.select("#sort-rating")
            .on("click", function() {
                const attribute = d3.select(this).property("value");
                sortAllFilms(attribute);
                if (sortAllFilmsOrder) {
                    d3.select(this).attr("class", "des")
                } else {
                    d3.select(this).attr("class", "asc");
                };
            });
    
        d3.select("#sort-year")
            .on("click", function() {
                const attribute = d3.select(this).property("value");
                sortAllFilms(attribute);
                if (sortAllFilmsOrder) {
                    d3.select(this).attr("class", "des")
                } else {
                    d3.select(this).attr("class", "asc");
                };
            });

        function sortAllFilms(attribute) {
            sortAllFilmsOrder = !sortAllFilmsOrder;
            buttons.attr("class", "buttons");
            if (sortAllFilmsOrder) {
                data.sort((i, j) => j[attribute] - i[attribute]);
            } else {
                data.sort((i, j) => i[attribute] - j[attribute]);
            };

            d3.selectAll(".card-panel")
                .exit()
                .remove();
    
            d3.select(".card-container")
                .selectAll(".card-panel")
                .data(data)
                .join("div")
                .classed("card-panel", true)
                .each(function(d) {
                    d3.select(this)
                        .html(
                            `<img src="${d.image}" class="poster">
                            <div class="film-details">
                                <h1>${truncateTitle(d.title)} <span class="year">(${d.year})</span></h1>
                                <p>${d.director}</p>
                                <ul>
                                    <li>${d.duration} mins</li>
                                    <li style="color: ${colours(d.rating)}">${convertToStars(d.rating)}</li>
                                </ul>
                            </div>`
                        );
                })
                .on("click", function(d) {
                    tooltip.style("opacity", 1);
                    tooltip.html(`<img src="${d.image}" class="tooltip-poster">
                                <div class="tooltip-film-details">
                                    <h1>${d.title} (${d.director})</h1>
                                    <p class="year">${d.genre}</p>
                                    <p class="year">Watched on ${dateFormat(d.date_rated)}</p>
                                    <p style="color: ${colours(d.rating)}">${convertToStars(d.rating)}</p>
                                    <div class="tooltip-summary">
                                        <p>${d.summary}</p>
                                    </div>
                                </div>`);
                    d3.selectAll(".card-panel")
                        .transition()
                        .duration(100)
                        .style("opacity", 0.1);
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .style("opacity", 1)
                        .style("cursor", "none");
                })
                .on("mouseleave", function(d) {
                    tooltip.style("opacity", 0);
                    d3.selectAll(".card-panel")
                        .transition()
                        .duration(100)
                        .style("opacity", 1)
                        .style("cursor", "pointer");
                })
                .on("mousemove", function(d) {
                    tooltip.style("left", `${d3.event.pageX - 250}px`);
                    tooltip.style("top", `${d3.event.pageY - 172.5}px`);
                });
            };
        
    // function multiplyStar(num) {
    //     const star = "&#9733";
    //     return star.repeat(num);
    // };

    decadeFilter.on("change", function() {
        const selectDecade = d3.select(this).property("value");
        filterFilms(selectDecade);
    });

    function filterFilms(selectDecade) {
        let selectedDecade = data.filter(d => d.decade == selectDecade);

        if (selectDecade == "all-films") {
            d3.selectAll(".card-panel")
                .exit()
                .remove();
            
            d3.select(".card-container")
                .selectAll(".card-panel")
                .data(data)
                .join("div")
                .classed("card-panel", true)
                .each(function(d) {
                    d3.select(this)
                        .html(
                            `<img src="${d.image}" class="poster">
                            <div class="film-details">
                                <h1>${truncateTitle(d.title)} <span class="year">(${d.year})</span></h1>
                                <p>${d.director}</p>
                                <ul>
                                    <li>${d.duration} mins</li>
                                    <li style="color: ${colours(d.rating)}">${convertToStars(d.rating)}</li>
                                </ul>
                            </div>`
                        );
                })
                .on("click", function(d) {
                    tooltip.style("opacity", 1);
                    tooltip.html(`<img src="${d.image}" class="tooltip-poster">
                                <div class="tooltip-film-details">
                                    <h1>${d.title} (${d.director})</h1>
                                    <p class="year">${d.genre}</p>
                                    <p class="year">Watched on ${dateFormat(d.date_rated)}</p>
                                    <p style="color: ${colours(d.rating)}">${convertToStars(d.rating)}</p>
                                    <div class="tooltip-summary">
                                        <p>${d.summary}</p>
                                    </div>
                                </div>`);
                    d3.selectAll(".card-panel")
                        .transition()
                        .duration(100)
                        .style("opacity", 0.1);
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .style("opacity", 1)
                        .style("cursor", "none");
                })
                .on("mouseleave", function(d) {
                    tooltip.style("opacity", 0);
                    d3.selectAll(".card-panel")
                        .transition()
                        .duration(100)
                        .style("opacity", 1)
                        .style("cursor", "pointer");
                })
                .on("mousemove", function(d) {
                    tooltip.style("left", `${d3.event.pageX - 250}px`);
                    tooltip.style("top", `${d3.event.pageY - 172.5}px`);
                });

            d3.select("#sort-date")
                .on("click", function() {
                    const attribute = d3.select(this).property("value");
                    sortAllFilms(attribute);
                    if (sortAllFilmsOrder) {
                        d3.select(this).attr("class", "des")
                    } else {
                        d3.select(this).attr("class", "asc");
                    };
                });
        
            d3.select("#sort-rating")
                .on("click", function() {
                    const attribute = d3.select(this).property("value");
                    sortAllFilms(attribute);
                    if (sortAllFilmsOrder) {
                        d3.select(this).attr("class", "des")
                    } else {
                        d3.select(this).attr("class", "asc");
                    };
                });
        
            d3.select("#sort-year")
                .on("click", function() {
                    const attribute = d3.select(this).property("value");
                    sortAllFilms(attribute);
                    if (sortAllFilmsOrder) {
                        d3.select(this).attr("class", "des")
                    } else {
                        d3.select(this).attr("class", "asc");
                    };
                });

            sortAllFilms(attribute);

        } else {

        d3.selectAll(".card-panel")
            .exit()
            .remove();
        
        d3.select(".card-container")
            .selectAll(".card-panel")
            .data(selectedDecade)
            .join("div")
            .classed("card-panel", true)
            .each(function(d) {
                d3.select(this)
                    .html(
                        `<img src="${d.image}" class="poster">
                        <div class="film-details">
                            <h1>${truncateTitle(d.title)} <span class="year">(${d.year})</span></h1>
                            <p>${d.director}</p>
                            <ul>
                                <li>${d.duration} mins</li>
                                <li style="color: ${colours(d.rating)}">${convertToStars(d.rating)}</li>
                            </ul>
                        </div>`
                    );
            })
            .on("click", function(d) {
                tooltip.style("opacity", 1);
                tooltip.html(`<img src="${d.image}" class="tooltip-poster">
                            <div class="tooltip-film-details">
                                <h1>${d.title} (${d.director})</h1>
                                <p class="year">${d.genre}</p>
                                <p class="year">Watched on ${dateFormat(d.date_rated)}</p>
                                <p style="color: ${colours(d.rating)}">${convertToStars(d.rating)}</p>
                                <div class="tooltip-summary">
                                    <p>${d.summary}</p>
                                </div>
                            </div>`);
                d3.selectAll(".card-panel")
                    .transition()
                    .duration(100)
                    .style("opacity", 0.1);
                d3.select(this)
                    .transition()
                    .duration(100)
                    .style("opacity", 1)
                    .style("cursor", "none");
            })
            .on("mouseleave", function(d) {
                tooltip.style("opacity", 0);
                d3.selectAll(".card-panel")
                    .transition()
                    .duration(100)
                    .style("opacity", 1)
                    .style("cursor", "pointer");
            })
            .on("mousemove", function(d) {
                tooltip.style("left", `${d3.event.pageX - 250}px`);
                tooltip.style("top", `${d3.event.pageY - 172.5}px`);
            });

        let sortFilmsOrder = false;

        d3.select("#sort-date")
            .on("click", function() {
                const attribute = d3.select(this).property("value");
                sortFilms(attribute);
                if (sortFilmsOrder) {
                    d3.select(this).attr("class", "des")
                } else {
                    d3.select(this).attr("class", "asc");
                };
            });
    
        d3.select("#sort-rating")
            .on("click", function() {
                const attribute = d3.select(this).property("value");
                sortFilms(attribute);
                if (sortFilmsOrder) {
                    d3.select(this).attr("class", "des")
                } else {
                    d3.select(this).attr("class", "asc");
                };
            });
    
        d3.select("#sort-year")
            .on("click", function() {
                const attribute = d3.select(this).property("value");
                sortFilms(attribute);
                if (sortFilmsOrder) {
                    d3.select(this).attr("class", "des")
                } else {
                    d3.select(this).attr("class", "asc");
                };
            });

        function sortFilms(attribute) {
            sortFilmsOrder = !sortFilmsOrder;
            buttons.attr("class", "buttons");
            if (sortFilmsOrder) {
                selectedDecade.sort((i, j) => j[attribute] - i[attribute]);
            } else {
                selectedDecade.sort((i, j) => i[attribute] - j[attribute]);
            };

            d3.selectAll(".card-panel")
                .exit()
                .remove();
    
            d3.select(".card-container")
                .selectAll(".card-panel")
                .data(selectedDecade)
                .join("div")
                .classed("card-panel", true)
                .each(function(d) {
                    d3.select(this)
                        .html(
                            `<img src="${d.image}" class="poster">
                            <div class="film-details">
                                <h1>${truncateTitle(d.title)} <span class="year">(${d.year})</span></h1>
                                <p>${d.director}</p>
                                <ul>
                                    <li>${d.duration} mins</li>
                                    <li style="color: ${colours(d.rating)}">${convertToStars(d.rating)}</li>
                                </ul>
                            </div>`
                        );
                })
                .on("click", function(d) {
                    tooltip.style("opacity", 1);
                    tooltip.html(`<img src="${d.image}" class="tooltip-poster">
                                <div class="tooltip-film-details">
                                    <h1>${d.title} (${d.director})</h1>
                                    <p class="year">${d.genre}</p>
                                    <p class="year">Watched on ${dateFormat(d.date_rated)}</p>
                                    <p style="color: ${colours(d.rating)}">${convertToStars(d.rating)}</p>
                                    <div class="tooltip-summary">
                                        <p>${d.summary}</p>
                                    </div>
                                </div>`);
                    d3.selectAll(".card-panel")
                        .transition()
                        .duration(100)
                        .style("opacity", 0.1);
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .style("opacity", 1)
                        .style("cursor", "none");
                })
                .on("mouseleave", function(d) {
                    tooltip.style("opacity", 0);
                    d3.selectAll(".card-panel")
                        .transition()
                        .duration(100)
                        .style("opacity", 1)
                        .style("cursor", "pointer");
                })
                .on("mousemove", function(d) {
                    tooltip.style("left", `${d3.event.pageX - 250}px`);
                    tooltip.style("top", `${d3.event.pageY - 172.5}px`);
                });
            };
        };
    };

    d3.select("#film-count")
        .each(function() {
            d3.select(this)
                .append("text")
                .classed("ban", true)
                .style("display", "block")
                .text(`${formatComma(filmCount)}`);
            d3.select(this)
                .append("text")
                .classed("year", true)
                .style("display", "block")
                .text(`films seen`)
        });

    d3.select("#duration")
        .each(function() {
            d3.select(this)
                .append("text")
                .classed("ban", true)
                .style("display", "block")
                .text(`${formatCommaOneDec(totalDuration / 60)}`);
            d3.select(this)
                .append("text")
                .classed("year", true)
                .style("display", "block")
                .text(`hours`)
        });

    d3.select("#average-rating")
        .each(function() {
            d3.select(this)
                .append("text")
                .classed("ban", true)
                .style("display", "block")
                .text(`${formatTwoDec(aveRating)}`);
            d3.select(this)
                .append("text")
                .classed("year", true)
                .style("display", "block")
                .text(`average rating`)
        });

}; cards();

async function releaseYear() {
    const parseDate = d3.timeParse("%Y");
    const yearFormat = d3.timeFormat("%Y");
    const data = await d3.csv("./data/release_year.csv", d => ({
        year: parseDate(d.year),
        count: +d.title
    }));

    const maxYear = data.reduce((prev, current) => prev.count > current.count ? prev : current);
    
    const margin = { top: 40, right: 40, bottom: 50, left: 30 }
        , width = 900 - margin.left - margin.right
        , height = 300 - margin.top - margin.bottom;

    const barPadding = 1.5;

    const svg = d3.select("#release-year")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.left + margin.right)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .range([height, 0])
        .nice();

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.year))
        .range([0, width])
        .nice();

    const yAxis = d3.axisLeft()
        .scale(y)
        .tickSize(-width)
        .tickPadding(10);

    const xAxis = d3.axisBottom()
        .scale(x)
        .tickPadding(10);
    
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .style("stroke-opacity", 0.4)
        .call(yAxis)
        .select(".domain")
        .remove();

    const barGroup = svg.append("g")
        .selectAll("rect")
        .data(data)
        .join("g");

    const barRects = barGroup.append("rect")
        .attr("key", (d, i) => i)
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.count))
        .attr("height", d => y(0) - y(d.count))
        .attr("width", width / data.length - barPadding);

    svg.append("g")
        .selectAll(".overlay")
        .data(data)
        .join("rect")
        .classed("overlay", true)        
        .attr("x", d => x(d.year))
        .attr("y", y(0) - height)
        .attr("height", height)
        .attr("width", width / data.length)
        .on("mouseenter", onMouseEnter)
        .on("mouseleave", onMouseLeave);

    const tooltip = d3.select("#release-year-tooltip");

    function onMouseEnter(d, index) {
        const filmPlural = d.count != 1 ? "films" : "film";
        tooltip.style("opacity", 1);
        tooltip.html(`<h1>${yearFormat(d.year)}</h1><p>${d.count} ${filmPlural}</p>`);

        const xTooltip = x(d.year) + ((width / data.length) - (3 * barPadding)) + margin.left;
        const yTooltip = y(d.count) + margin.top - 10;

        tooltip.style("transform", `translate(calc(-50% + ${xTooltip}px), calc(-100% + ${yTooltip}px))`);

        const hoveredBar = barGroup.select(`rect[key="${index}"]`);
        hoveredBar.classed("hovered", true);
    };

    function onMouseLeave() {
        tooltip.style("opacity", 0);
        barRects.classed("hovered", false);
    }

    d3.select("#release-year-call-out")
        .append("p")
        .classed("call-out", true)
        .text(`I have seen more films from ${yearFormat(maxYear.year)} than any other year (${maxYear.count}).`);

}; releaseYear();

async function dirBar() {
    const data = await d3.csv("./data/dir_bar.csv", d3.autoType);
    const pivotData = await d3.csv("./data/test.csv", d3.autoType);
    console.log(pivotData.filter(d => d.title == "All"));
    
    const nest = d3.nest()
        .key(d => d.director)
        .rollup(v => ({
            count: v.length,
            average: d3.mean(v, a => a.rating)
        }))
        .entries(data)
        .sort((a, b) => d3.descending(a.value.count, b.value.count))
        .slice(0, 20);

    const margin = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 150
    },
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    const svg = d3.select("#dir-bar")
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleLinear()
        .domain([0, d3.max(nest, d => d.value.count)])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(nest.map(d => d.key))
        .range([0, height])
        .padding(0.1);

    const yAxis = d3.axisLeft()
        .scale(y)
        .tickSize(0)
        .tickPadding(10);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .select(".domain")
            .remove();

    const tooltip = d3.select("#dir-bar-tooltip");

    svg.append("g")
        .selectAll("rect")
        .data(nest)
        .join("rect")
        .attr("x", d => x(0))
        .attr("y", d => y(d.key))
        .attr("width", d => x(d.value.count) - x(0))
        .attr("height", y.bandwidth())
        .on("mouseenter", function() {
            tooltip.style("opacity", 1);
        })
        .on("mousemove", function(d) {
            tooltip.style("left", `${d3.event.pageX - 100}px`);
            tooltip.style("top", `${d3.event.pageY - 60}px`);
            d3.select("#director-name")
                .text(d.key)
            d3.select("#director-summary")
                .text(`${d.value.count} films seen, average rating ${round(d.value.average)}`);
        })
        .on("mouseleave", function() {
            tooltip.style("opacity", 0);
        });

    svg.append("g")
        .selectAll("text")
        .data(nest)
        .join("text")
        .classed("year", true)
        .style("fill", "white")
        .attr("x", d => x(d.value.count) - 5)
        .attr("y", d => y(d.key) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .text(d => d.value.count);

}; dirBar();
