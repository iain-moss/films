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
    let data = await d3.csv("./data/all_films.csv", d3.autoType);
    data.sort((a, b) => d3.descending(a.date_rated, b.date_rated));

    const minScore = d3.min(data, d => d.rating);
    const filmCount = data.length;

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
        .text(`All decades (${filmCount} films)`)
        .enter();

    decadeFilter.selectAll("option.decade")
        .data(decades)
        .join("option")
        .classed("decade", true)
        .attr("value", d => d.key)
        .text(d => `${d.key} (${d.value} films)`);

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
                            <li style="color: ${colours(d.rating)}">&#9733 ${d.rating}</li>
                        </ul>
                    </div>`
                );
            })
            .on("mouseenter", function(d) {
                tooltip.style("opacity", 1);
                tooltip.html(`<h1>${d.title} (${d.director})</h1>
                            <p class="year">${d.genre}</p>
                            <p style="color: ${colours(d.rating)}">${multiplyStar(d.rating)}</p>
                            <p>${d.summary}</p>`
                            );
                d3.selectAll(".card-panel")
                    .transition()
                    .duration(100)
                    .style("opacity", 0.1);
                d3.select(this)
                    .transition()
                    .duration(100)
                    .style("opacity", 1);
            })
            .on("mouseleave", function(d) {
                tooltip.style("opacity", 0);
                d3.selectAll(".card-panel")
                    .transition()
                    .duration(100)
                    .style("opacity", 1);
            })
            .on("mousemove", function(d) {
                tooltip.style("left", `${d3.event.pageX - 200}px`);
                tooltip.style("top", `${d3.event.pageY - 150}px`);
            });

        d3.select("#sort-date")
            .on("click", function() {
                const attribute = d3.select(this).property("value");
                sortAllFilms(attribute);
            });
    
        d3.select("#sort-rating")
            .on("click", function() {
                const attribute = d3.select(this).property("value");
                sortAllFilms(attribute);
            });
    
        d3.select("#sort-year")
            .on("click", function() {
                const attribute = d3.select(this).property("value");
                sortAllFilms(attribute);
            });

        function sortAllFilms(attribute) {
            data.sort((i, j) => j[attribute] - i[attribute]);
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
                                    <li style="color: ${colours(d.rating)}">&#9733 ${d.rating}</li>
                                </ul>
                            </div>`
                        );
                })
                .on("mouseenter", function(d) {
                    tooltip.style("opacity", 1);
                    tooltip.html(`<h1>${d.title} (${d.director})</h1>
                                <p class="year">${d.genre}</p>
                                <p style="color: ${colours(d.rating)}">${multiplyStar(d.rating)}</p>
                                <p>${d.summary}</p>`
                                );
                    d3.selectAll(".card-panel")
                        .transition()
                        .duration(100)
                        .style("opacity", 0.1);
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .style("opacity", 1);
                })
                .on("mouseleave", function(d) {
                    tooltip.style("opacity", 0);
                    d3.selectAll(".card-panel")
                        .transition()
                        .duration(100)
                        .style("opacity", 1);
                })
                .on("mousemove", function(d) {
                    tooltip.style("left", `${d3.event.pageX - 200}px`);
                    tooltip.style("top", `${d3.event.pageY - 150}px`);
                });
            };
        
    function multiplyStar(num) {
        const star = "&#9733";
        return star.repeat(num);
    };

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
                                    <li style="color: ${colours(d.rating)}">&#9733 ${d.rating}</li>
                                </ul>
                            </div>`
                        );
                })
                .on("mouseenter", function(d) {
                    tooltip.style("opacity", 1);
                    tooltip.html(`<h1>${d.title} (${d.director})</h1>
                                <p class="year">${d.genre}</p>
                                <p style="color: ${colours(d.rating)}">${multiplyStar(d.rating)}</p>
                                <p>${d.summary}</p>`
                                );
                    d3.selectAll(".card-panel")
                        .transition()
                        .duration(100)
                        .style("opacity", 0.1);
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .style("opacity", 1);
                })
                .on("mouseleave", function(d) {
                    tooltip.style("opacity", 0);
                    d3.selectAll(".card-panel")
                        .transition()
                        .duration(100)
                        .style("opacity", 1);
                })
                .on("mousemove", function(d) {
                    tooltip.style("left", `${d3.event.pageX - 200}px`);
                    tooltip.style("top", `${d3.event.pageY - 150}px`);
                });

            d3.select("#sort-date")
                .on("click", function() {
                    const attribute = d3.select(this).property("value");
                    sortAllFilms(attribute);
                });
        
            d3.select("#sort-rating")
                .on("click", function() {
                    const attribute = d3.select(this).property("value");
                    sortAllFilms(attribute);
                });
        
            d3.select("#sort-year")
                .on("click", function() {
                    const attribute = d3.select(this).property("value");
                    sortAllFilms(attribute);
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
                                <li style="color: ${colours(d.rating)}">&#9733 ${d.rating}</li>
                            </ul>
                        </div>`
                    );
            })
            .on("mouseenter", function(d) {
                tooltip.style("opacity", 1);
                tooltip.html(`<h1>${d.title} (${d.director})</h1>
                            <p class="year">${d.genre}</p>
                            <p style="color: ${colours(d.rating)}">${multiplyStar(d.rating)}</p>
                            <p>${d.summary}</p>`
                            );
                d3.selectAll(".card-panel")
                    .transition()
                    .duration(100)
                    .style("opacity", 0.1);
                d3.select(this)
                    .transition()
                    .duration(100)
                    .style("opacity", 1);
            })
            .on("mouseleave", function(d) {
                tooltip.style("opacity", 0);
                d3.selectAll(".card-panel")
                    .transition()
                    .duration(100)
                    .style("opacity", 1);
            })
            .on("mousemove", function(d) {
                tooltip.style("left", `${d3.event.pageX - 200}px`);
                tooltip.style("top", `${d3.event.pageY - 150}px`);
            });

        d3.select("#sort-date")
            .on("click", function() {
                const attribute = d3.select(this).property("value");
                sortFilms(attribute);
            });
    
        d3.select("#sort-rating")
            .on("click", function() {
                const attribute = d3.select(this).property("value");
                sortFilms(attribute);
            });
    
        d3.select("#sort-year")
            .on("click", function() {
                const attribute = d3.select(this).property("value");
                sortFilms(attribute);
            });

        function sortFilms(attribute) {
            selectedDecade.sort((i, j) => j[attribute] - i[attribute]);
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
                                    <li style="color: ${colours(d.rating)}">&#9733 ${d.rating}</li>
                                </ul>
                            </div>`
                        );
                })
                .on("mouseenter", function(d) {
                    tooltip.style("opacity", 1);
                    tooltip.html(`<h1>${d.title} (${d.director})</h1>
                                <p class="year">${d.genre}</p>
                                <p style="color: ${colours(d.rating)}">${multiplyStar(d.rating)}</p>
                                <p>${d.summary}</p>`
                                );
                    d3.selectAll(".card-panel")
                        .transition()
                        .duration(100)
                        .style("opacity", 0.1);
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .style("opacity", 1);
                })
                .on("mouseleave", function(d) {
                    tooltip.style("opacity", 0);
                    d3.selectAll(".card-panel")
                        .transition()
                        .duration(100)
                        .style("opacity", 1);
                })
                .on("mousemove", function(d) {
                    tooltip.style("left", `${d3.event.pageX - 200}px`);
                    tooltip.style("top", `${d3.event.pageY - 150}px`);
                });
            };
        };
    };

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
        , height = 450 - margin.top - margin.bottom;

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

    svg.append("g")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.count))
        .attr("height", d => y(0) - y(d.count))
        .attr("width", width / data.length - 1.5)
        .attr("fill", "#906c6c");

}; releaseYear();