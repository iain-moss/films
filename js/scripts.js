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
        .attr("value", decades.map(d => d.key))
        .text(`All decades (${filmCount} films)`);

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

    // const container = d3.select(".card-container");
    
    const cards = d3.select(".card-container")
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
            });
        
    function multiplyStar(num) {
        const star = "&#9733";
        return star.repeat(num);
    };

    decadeFilter.on("change", function() {
        const selectDecade = d3.select(this).property("value");
        filterFilms(selectDecade);
    });

    let selectedDecade;

    function filterFilms(selectDecade) {
        selectedDecade = data.filter(d => d.decade == selectDecade);

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
            });
    };

    d3.select("#order-sort")
        .on("change", function() {
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
        });
    };

    d3.select("#sort-rating")
        .on("click", function() {
            selectedDecade.sort((i, j) => j.rating - i.rating);
        })

    cards.on("mouseenter", function(d) {
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
    });
    
    cards.on("mouseleave", function(d) {
        tooltip.style("opacity", 0);
        d3.selectAll(".card-panel")
            .transition()
            .duration(100)
            .style("opacity", 1);
    });

    cards.on("mousemove", function(d) {
        tooltip.style("left", `${d3.event.pageX - 200}px`);
        tooltip.style("top", `${d3.event.pageY - 150}px`);
    });

    }; cards();
