const round = d3.format(".1f");
const roundTwoDec = d3.format(".2f");
const formatComma = d3.format(",");

const stars = ["","&#189;","&#9733;","&#9733;&#189;","&#9733;&#9733;","&#9733;&#9733;&#189;","&#9733;&#9733;&#9733;","&#9733;&#9733;&#9733;&#189;","&#9733;&#9733;&#9733;&#9733;","&#9733;&#9733;&#9733;&#9733;&#189;","&#9733;&#9733;&#9733;&#9733;&#9733;"];

function convertToStars(rating) {
    return stars[rating];
};

const sorters = document.querySelectorAll("#side-nav button");
sorters.forEach(btn => btn.addEventListener("click", function() {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
    });
}));


// Tabs
// $(document).ready(function() {
//     $(".tab-button:not(:first)").addClass("inactive");
//     $(".tab-content").hide();
//     $(".tab-content:first").show();

//     $(".tab-button").on("click", function() {
//         let t = $(this).attr("data-tab")
//         if ($(this).hasClass("inactive")) {
//             $(".tab-button").addClass("inactive")
//             $(this).removeClass("inactive");

//             $(".tab-content").hide();
//             $("#" + t).show();
//         };
//     })
// });

// Clear input
// $(document).click(function(e) {
//     const input = $("#director-input");
//     if (e.target !== input) {
//         input.val("");
//     }
// });

async function cards() {
    let data = await d3.csv("./data/all_letterboxd.csv", d3.autoType);
    data.sort((a, b) => d3.descending(a.date_rated, b.date_rated));

    let genreList = await d3.csv("./data/genre_list.csv");
    let countries = await d3.csv("./data/countries.csv");

    const buttons = d3.selectAll("div.dropdown-container button");

    const minScore = d3.min(data, d => d.rating);
    const filmCount = data.length;
    const totalDuration = d3.sum(data, d => d.duration);
    let aveRating = d3.mean(data, d => d.rating);

    const formatCommaOneDec = d3.format(",.1f");
    const formatTwoDec = d3.format(".2f");
    const dateFormat = d3.timeFormat("%-d %B %Y");
    const formatComma = d3.format(",");

    const searchResutltsP = d3.select("#search-results");

    const tooltip = d3.select("#tooltip");

    const decades = d3.nest()
        .key(d => d.decade)
        .sortKeys(d3.ascending)
        .rollup(v => v.length)
        .entries(data);

    const decadeFilter = d3.select("#decade-filter");

    decadeFilter.append("option")
        .data(decades.map(d => d.key))
        .attr("value", "all-decades")
        .classed("default", true)
        .text(`All decades (${formatComma(filmCount)} films)`)
        .enter();

    decadeFilter.selectAll("option.decade")
        .data(decades)
        .join("option")
        .classed("decade", true)
        .attr("value", d => d.key)
        .text(d => `${d.key} (${formatComma(d.value)} films)`);

    const testDecade = d3.select("#test-decades");
    
    testDecade.append("li")
        .data(decades.map(d => d.key))
        .attr("data-value", "all-decades")
        .classed("default", true)
        .text(`All decades (${formatComma(filmCount)} films)`)
        .enter();

    testDecade.selectAll("li.decade")
        .data(decades)
        .join("li")
        .classed("decade", true)
        .attr("data-value", d => d.key)
        .text(d => `${d.key} (${formatComma(d.value)} films)`);

    const genreFilter = d3.select("#genre-filter");

    genreFilter.append("option")
        .attr("value", "all-genres")
        .classed("default", true)
        .text("All genres");

    genreFilter.selectAll("option.genre")
        .data(genreList)
        .join("option")
        .attr("value", d => d.genre)
        .text(d => d.genre);

    const countryFilter = d3.select("#country-filter");
    const countryList = d3.select("#country-list");

    countryList.append("option")
        .attr("value", "All countries")
        .attr("data-value", "all-countries")
        .classed("default", true);

    countryList.selectAll("option.country")
        .data(countries)
        .join("option")
        .attr("data-value", d => d.country)
        .attr("value", d => d.country);

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
        .join("li")
        .classed("card-panel", true)
        .each(function(d) {
            d3.select(this)
                .html(
                    `<img src="${d.image}" class="poster" loading="lazy">
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
                tooltip.html(`<img src="${d.backdrop ? d.backdrop : ""}" class="tooltip-poster">
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

        let cardsN = d3.selectAll(".card-panel").size();
        searchResutltsP.text(`${formatComma(cardsN)} results found with average rating ${round(aveRating) / 2}`);

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
                            `<img src="${d.image}" class="poster" loading="lazy">
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
                    tooltip.html(`<img src="${d.backdrop ? d.backdrop : ""}" class="tooltip-poster">
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
        document.getElementById("genre-filter").value = "all-genres";
        document.getElementById("country-filter").value = "";
        document.getElementById("director-input").value = "";
        document.getElementById("actor-input").value = "";
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });
    });

    // const decadeList = document.querySelectorAll("#test-decades > li");
    // decadeList.forEach(dec => dec.addEventListener("click", function() {
    //     const selectDecade = d3.select(this).attr("data-value");
    //     console.log(selectDecade);
    //     filterFilms(selectDecade);
    // }));

    // $("#decade-filter").change(function() {
    //     $("#genre-filter").val("all-genres");
    // });

    // decadeFilter.on("change", function() {
    //     document.getElementById("genre-filter").value = "all-genres";
    // });

    function filterFilms(selectDecade) {
        let selectedDecade = data.filter(d => d.decade == selectDecade);
        const decadeAve = d3.mean(selectedDecade, d => d.rating);

        searchResutltsP.text(`${selectedDecade.length} results found with average rating ${round(decadeAve) / 2}`)

        if (selectDecade == "all-decades") {
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
                            `<img src="${d.image}" class="poster" loading="lazy">
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
                    tooltip.html(`<img src="${d.backdrop ? d.backdrop : ""}" class="tooltip-poster">
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

            searchResutltsP.text(`${formatComma(cardsN)} results found with average rating ${round(aveRating) / 2}`)

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
                        `<img src="${d.image}" class="poster" loading="lazy">
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
                tooltip.html(`<img src="${d.backdrop ? d.backdrop : ""}" class="tooltip-poster">
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
                            `<img src="${d.image}" class="poster" loading="lazy">
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
                    tooltip.html(`<img src="${d.backdrop ? d.backdrop : ""}" class="tooltip-poster">
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

    genreFilter.on("change", function() {
        const selectGenre = d3.select(this).property("value");
        filterGenre(selectGenre);
        document.getElementById("decade-filter").value = "all-decades";
        document.getElementById("country-filter").value = "";
        document.getElementById("director-input").value = "";
        document.getElementById("actor-input").value = "";
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });
    });

    // $("#genre-filter").change(function() {
    //     $("#decade-filter").val("all-decades");
    // });

    function filterGenre(selectGenre) {
        let selectedGenre = data.filter(d => d.genre.includes(selectGenre));
        const genreAve = d3.mean(selectedGenre, d => d.rating);
        
        if (selectGenre == "all-genres") {
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
                            `<img src="${d.image}" class="poster" loading="lazy">
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
                    tooltip.html(`<img src="${d.backdrop ? d.backdrop : ""}" class="tooltip-poster">
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

            searchResutltsP.text(`${formatComma(cardsN)} results found with average rating ${round(aveRating) / 2}`)

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
            .data(selectedGenre)
            .join("div")
            .classed("card-panel", true)
            .each(function(d) {
                d3.select(this)
                    .html(
                        `<img src="${d.image}" class="poster" loading="lazy">
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
                tooltip.html(`<img src="${d.backdrop ? d.backdrop : ""}" class="tooltip-poster">
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

        searchResutltsP.text(`${selectedGenre.length} results found with average rating ${round(genreAve) / 2}`)

        let sortFilmsOrder = false;

        d3.select("#sort-date")
            .on("click", function() {
                const attribute = d3.select(this).property("value");
                sortFilmsGenre(attribute);
                if (sortFilmsOrder) {
                    d3.select(this).attr("class", "des")
                } else {
                    d3.select(this).attr("class", "asc");
                };
            });
    
        d3.select("#sort-rating")
            .on("click", function() {
                const attribute = d3.select(this).property("value");
                sortFilmsGenre(attribute);
                if (sortFilmsOrder) {
                    d3.select(this).attr("class", "des")
                } else {
                    d3.select(this).attr("class", "asc");
                };
            });
    
        d3.select("#sort-year")
            .on("click", function() {
                const attribute = d3.select(this).property("value");
                sortFilmsGenre(attribute);
                if (sortFilmsOrder) {
                    d3.select(this).attr("class", "des")
                } else {
                    d3.select(this).attr("class", "asc");
                };
            });

        function sortFilmsGenre(attribute) {
            sortFilmsOrder = !sortFilmsOrder;
            buttons.attr("class", "buttons");
            if (sortFilmsOrder) {
                selectedGenre.sort((i, j) => j[attribute] - i[attribute]);
            } else {
                selectedGenre.sort((i, j) => i[attribute] - j[attribute]);
            };

            d3.selectAll(".card-panel")
                .exit()
                .remove();
    
            d3.select(".card-container")
                .selectAll(".card-panel")
                .data(selectedGenre)
                .join("div")
                .classed("card-panel", true)
                .each(function(d) {
                    d3.select(this)
                        .html(
                            `<img src="${d.image}" class="poster" loading="lazy">
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
                    tooltip.html(`<img src="${d.backdrop ? d.backdrop : ""}" class="tooltip-poster">
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

    countryFilter.on("change", function() {
        const selectCountry = d3.select(this).property("value");
        filterCountry(selectCountry);
        document.getElementById("genre-filter").value = "all-genres";
        document.getElementById("decade-filter").value = "all-decades";
        document.getElementById("director-input").value = "";
        document.getElementById("actor-input").value = "";
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });
    });

    function filterCountry(selectCountry) {
        let selectedCountry = data.filter(d => d.country.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(selectCountry.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")));

        const countryAve = d3.mean(selectedCountry, d => d.rating);

        if (selectCountry == "all-countries") {
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
                            `<img src="${d.image}" class="poster" loading="lazy">
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
                    tooltip.html(`<img src="${d.backdrop ? d.backdrop : ""}" class="tooltip-poster">
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

            searchResutltsP.text(`${formatComma(cardsN)} results found with average rating ${round(aveRating) / 2}`)

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
            .data(selectedCountry)
            .join("div")
            .classed("card-panel", true)
            .each(function(d) {
                d3.select(this)
                    .html(
                        `<img src="${d.image}" class="poster" loading="lazy">
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
                tooltip.html(`<img src="${d.backdrop ? d.backdrop : ""}" class="tooltip-poster">
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

        searchResutltsP.text(`${selectedCountry.length} results found with average rating ${round(countryAve) / 2}`)

        let sortFilmsOrder = false;

        d3.select("#sort-date")
            .on("click", function() {
                const attribute = d3.select(this).property("value");
                sortFilmsGenre(attribute);
                if (sortFilmsOrder) {
                    d3.select(this).attr("class", "des")
                } else {
                    d3.select(this).attr("class", "asc");
                };
            });
    
        d3.select("#sort-rating")
            .on("click", function() {
                const attribute = d3.select(this).property("value");
                sortFilmsGenre(attribute);
                if (sortFilmsOrder) {
                    d3.select(this).attr("class", "des")
                } else {
                    d3.select(this).attr("class", "asc");
                };
            });
    
        d3.select("#sort-year")
            .on("click", function() {
                const attribute = d3.select(this).property("value");
                sortFilmsGenre(attribute);
                if (sortFilmsOrder) {
                    d3.select(this).attr("class", "des")
                } else {
                    d3.select(this).attr("class", "asc");
                };
            });

        function sortFilmsGenre(attribute) {
            sortFilmsOrder = !sortFilmsOrder;
            buttons.attr("class", "buttons");
            if (sortFilmsOrder) {
                selectedCountry.sort((i, j) => j[attribute] - i[attribute]);
            } else {
                selectedCountry.sort((i, j) => i[attribute] - j[attribute]);
            };

            d3.selectAll(".card-panel")
                .exit()
                .remove();
    
            d3.select(".card-container")
                .selectAll(".card-panel")
                .data(selectedCountry)
                .join("div")
                .classed("card-panel", true)
                .each(function(d) {
                    d3.select(this)
                        .html(
                            `<img src="${d.image}" class="poster" loading="lazy">
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
                    tooltip.html(`<img src="${d.backdrop ? d.backdrop : ""}" class="tooltip-poster">
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

    const directorInput = d3.select("#director-input");
    
    directorInput.on("input", function() {
        const selectDirector = d3.select(this).property("value");
        directorFilter(selectDirector);
        document.getElementById("genre-filter").value = "all-genres";
        document.getElementById("decade-filter").value = "all-decades";
        document.getElementById("country-filter").value = "";
        document.getElementById("actor-input").value = "";
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });
    });

    function directorFilter(selectDirector) {
        let selectedDirector = data.filter(d => d.director.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(selectDirector.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")));

        const directorN = selectedDirector.length;
        const directorAve = d3.mean(selectedDirector, d => d.rating);
        const pluralResults = directorN != 1 ? "films" : "film";
        const filteredDirectors = d3.map(selectedDirector, d => d.director).keys();

        if (directorInput.property("value").length == 1) {
            searchResutltsP.text(`${directorN} ${pluralResults} found with average rating ${round(directorAve) / 2}`);
        } else if (directorInput.property("value").length > 1) {
            searchResutltsP.text(`${directorN} ${pluralResults} found with average rating ${round(directorAve) / 2}`);
        } else {
            searchResutltsP.text(`${formatComma(cardsN)} results found with average rating ${round(aveRating) / 2}`);
        };

        if (selectedDirector.length == 0) {
            searchResutltsP.text("No results found");
        };

        if (directorInput.property("value").length >= 1) {
            buttons.attr("class", "buttons");
            decadeFilter.property("value", "all-decades");
            genreFilter.property("value", "all-genres")
            actorInput.property("value", "");
        };

        // $("#decade-filter").change(function() {
        //     $("#director-input").val("");
        //     $("#search-results").text("");
        // });

        // $("#genre-filter").change(function() {
        //     $("#director-input").val("");
        //     $("#search-results").text("");
        // });

        d3.selectAll(".card-panel")
            .exit()
            .remove();
        
        d3.select(".card-container")
            .selectAll(".card-panel")
            .data(selectedDirector)
            .join("div")
            .classed("card-panel", true)
            .each(function(d) {
                d3.select(this)
                    .html(
                        `<img src="${d.image}" class="poster" loading="lazy">
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
                tooltip.html(`<img src="${d.backdrop ? d.backdrop : ""}" class="tooltip-poster">
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
                selectedDirector.sort((i, j) => j[attribute] - i[attribute]);
            } else {
                selectedDirector.sort((i, j) => i[attribute] - j[attribute]);
            };

            d3.selectAll(".card-panel")
                .exit()
                .remove();
    
            d3.select(".card-container")
                .selectAll(".card-panel")
                .data(selectedDirector)
                .join("div")
                .classed("card-panel", true)
                .each(function(d) {
                    d3.select(this)
                        .html(
                            `<img src="${d.image}" class="poster" loading="lazy">
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
                    tooltip.html(`<img src="${d.backdrop ? d.backdrop : ""}" class="tooltip-poster">
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

    const actorInput = d3.select("#actor-input");
    
    actorInput.on("input", function() {
        const selectActor = d3.select(this).property("value");
        actorFilter(selectActor);
        document.getElementById("genre-filter").value = "all-genres";
        document.getElementById("decade-filter").value = "all-decades";
        document.getElementById("country-filter").value = "";
        document.getElementById("director-input").value = "";
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });
    });

    function actorFilter(selectActor) {
        let selectedActor = data.filter(d => d.actors.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(selectActor.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")));

        const actorN = selectedActor.length;
        const actorAve = d3.mean(selectedActor, d => d.rating);
        const pluralResults = actorN != 1 ? "films" : "film";
        const filteredActors = d3.map(selectedActor, d => d.actors).keys();

        if (actorInput.property("value").length == 1) {
            searchResutltsP.text(`${actorN} ${pluralResults} found with average rating ${round(actorAve) / 2}`);
        } else if (actorInput.property("value").length > 1) {
            searchResutltsP.text(`${actorN} ${pluralResults} found with average rating ${round(actorAve) / 2}`);
        } else {
            searchResutltsP.text(`${formatComma(cardsN)} results found with average rating ${round(aveRating) / 2}`);
        };

        if (selectedActor.length == 0) {
            searchResutltsP.text("No results found");
        };

        if (actorInput.property("value").length >= 1) {
            buttons.attr("class", "buttons");
            decadeFilter.property("value", "all-decades");
            genreFilter.property("value", "all-genres")
            directorInput.property("value", "");
        };

        // $("#decade-filter").change(function() {
        //     $("#actor-input").val("");
        //     $("#search-results").text("");
        // });

        // decadeFilter.on("change", function() {
        //     document.getElementById("actor-input").value = "";
        // });

        // genreFilter.on("change", function() {
        //     document.getElementById("actor-input").value = "";
        // });

        // $("#genre-filter").change(function() {
        //     $("#actor-input").val("");
        //     $("#search-results").text("");
        // });

        d3.selectAll(".card-panel")
            .exit()
            .remove();
        
        d3.select(".card-container")
            .selectAll(".card-panel")
            .data(selectedActor)
            .join("div")
            .classed("card-panel", true)
            .each(function(d) {
                d3.select(this)
                    .html(
                        `<img src="${d.image}" class="poster" loading="lazy">
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
                tooltip.html(`<img src="${d.backdrop ? d.backdrop : ""}" class="tooltip-poster">
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
                selectedActor.sort((i, j) => j[attribute] - i[attribute]);
            } else {
                selectedActor.sort((i, j) => i[attribute] - j[attribute]);
            };

            d3.selectAll(".card-panel")
                .exit()
                .remove();
    
            d3.select(".card-container")
                .selectAll(".card-panel")
                .data(selectedActor)
                .join("div")
                .classed("card-panel", true)
                .each(function(d) {
                    d3.select(this)
                        .html(
                            `<img src="${d.image}" class="poster" loading="lazy">
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
                    tooltip.html(`<img src="${d.backdrop ? d.backdrop : ""}" class="tooltip-poster">
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
                .text(`films rated`)
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
    let allData = await d3.csv("./data/test.csv", d3.autoType);
    allData = allData.filter(d => d.title == "All");
    
    const allDataNest = d3.nest()
        .key(d => d.director)
        .entries(allData)
        .sort((a, b) => d3.descending(a.values.len, b.values.len))
        .slice(0, 20);
    
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
        .attr("class", "director-bar")
        .attr("id", d => d.key)
        .attr("x", d => x(0))
        .attr("y", d => y(d.key))
        .attr("width", d => x(d.value.count) - x(0))
        .attr("height", y.bandwidth())
        .on("mouseenter", function() {
            tooltip.style("opacity", 1);
            const thisDirector = d3.select(this).datum().key;
            getTitles(thisDirector);
        })
        .on("mousemove", function(d) {
            tooltip.style("left", `${d3.event.pageX + 20}px`);
            tooltip.style("top", `${d3.event.pageY - 60}px`);
            d3.select("#director-name")
                .text(d.key)
            d3.select("#director-summary")
                .text(`${d.value.count} films seen, average rating ${round(d.value.average)}`);
        })
        .on("mouseleave", function() {
            tooltip.style("opacity", 0);
        });

    // d3.selectAll(".director-bar")
    //     .on("mouseenter", function() {
    //         const thisDirector = d3.select(this).datum().key;
    //         getTitles(thisDirector);
    //     });

    function getTitles(thisDirector) {
        let thisDirectorName = data.filter(d => d.director == thisDirector);
        let titles = [];
        const colourScale = d3.scaleLinear()
            .range(["#ACD9E5", "#E82632"])
            .domain([5, 10]);

        thisDirectorName = thisDirectorName.sort((a, b) => d3.descending(a.rating, b.rating));
            
        thisDirectorName.forEach(d => titles.push(`${d.title} <span style="color: ${colourScale(d.rating)}">${convertToStars(d.rating)}</span>`));
        
        d3.select("#titles")
            .html(titles.join("<br>"));
    };

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

    // const axisText = d3.selectAll("#dir-bar g.tick > text");

    // axisText.on("click", function() {
    //     console.log(this.innerHTML);
    //     document.getElementById("#director-input").value = this.innerHTML;
    // });

    // function typeText(item, text, delay, i) {
    //     $(item).val(text.charAt(i))
    //         .delay(delay)
    //         .promise()
    //         .done(function() {
    //             if (i < text.length) {
    //                 i++;
    //                 typeText(item, text, delay, i);
    //             }
    //         });
    //     };

    // $(document).ready(function() {
    //     $("#dir-bar g.tick > text").on("click", function() {
    //         const directorName = this.innerHTML;
    //         const input = $("#director-input");
    //         $('html,body').scrollTop(0);
    //         $(".tab-button:nth-child(2)").addClass("inactive");
    //         $(".tab-button:first-child()").removeClass("inactive");
    //         $(".tab-content").hide();
    //         $("#tab-1").show();
    //         $("#director-input").trigger(":reset");
    //         $("#director-input").attr("value", directorName);
    //         // typeText(input, directorName, 100, 0);
    //     });
    // });

}; dirBar();

async function watchDate() {
    const parseDate = d3.timeParse("%Y-%m-%d");
    const data = await d3.csv("./data/watch_date.csv", d => ({
        date: parseDate(d.date),
        count: +d.count
    }));

    const round = d3.format(".1f");
    
    const averageFilms = d3.mean(data, d => d.count);

    // const dateFormat = d3.timeFormat("%b");

    const mainMargin = { top: 30, right: 50, bottom: 100, left: 25 }
        , miniMargin = { top: 400, right: 50, bottom: 30, left: 25 }
        , width = 900 - mainMargin.left - mainMargin.right
        , mainHeight = 450 - mainMargin.top - mainMargin.bottom
        , miniHeight = 450 - miniMargin.top - miniMargin.bottom;

    const mainX = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);
    
    const miniX = d3.scaleTime()
        .domain(mainX.domain())
        .range([0, width]);

    const mainY = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .range([mainHeight, 0])
        .nice();
    
    const miniY = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .range([miniHeight, 0])
        .nice();

    const mainLine = d3.line()
        .x(d => mainX(d.date))
        .y(d => mainY(d.count));

    const miniLine = d3.line()
        .x(d => miniX(d.date))
        .y(d => miniY(d.count));

    const svg = d3.select("#watch-date")
        .append("svg")
        .attr("height", mainHeight + mainMargin.top + mainMargin.bottom)
        .attr("width", width + mainMargin.left + mainMargin.right)

    svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", mainHeight);

    const main = svg.append("g")
        .attr("class", "main")
        .attr("transform", `translate(${mainMargin.left}, ${mainMargin.top})`);

    const mini = svg.append("g")
        .attr("class", "mini")
        .attr("transform", `translate(${miniMargin.left}, ${miniMargin.top})`);

    const brush = d3.brushX(miniX)
        .extent([[0, 0], [width, miniHeight]])
        .on("brush", brushed);

    const mainXAxis = d3.axisBottom()
        .scale(mainX)
        // .tickFormat(dateFormat)
        .tickPadding(8);

    const miniXAxis = d3.axisBottom()
        .scale(miniX)
        // .tickFormat(dateFormat)
        .tickPadding(8);

    main.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${mainHeight})`)
        .call(mainXAxis);

    mini.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${miniHeight})`)
        .call(miniXAxis);

    const mainYAxis = d3.axisLeft()
        .scale(mainY)
        .tickSize(-width)
        .ticks(6)
        .tickPadding(10);

    const legend = svg.append("g")
        .attr("transform", "translate(0, 20)");

    legend.append("line")
        .attr("class", "mean")
        .attr("x1", 0)
        .attr("x2", 30)
        .attr("y1", -3)
        .attr("y2", -3);

    legend.append("text")
        .classed("legend", true)
        .attr("x", "35px")
        .text(`Monthly average films watched: ${round(averageFilms)}`)

    main.append("g")
        .attr("class", "y axis")
        .style("stroke-opacity", 0.2)
        .call(mainYAxis)
        .select(".domain")
        .attr("opacity", 0);

    main.append("line")
        .attr("class", "mean")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", mainY(averageFilms))
        .attr("y2", mainY(averageFilms));

    main.append("path")
        .attr("d", mainLine(data))
        .attr("class", "line");

    mini.append("path")
        .attr("d", miniLine(data))
        .attr("class", "line");

    const tooltip = d3.select("#watch-date-tooltip");

    const tooltipLine = main.append("line")
        .attr("class", "mouse-line")
        .style("stroke", "#c1abab")
        .style("opacity", 0);

    const bisectDate = d3.bisector(d => d.date).left;

    const tooltipTime = d3.timeFormat("%B %Y");

    const focus = main.append("g")
        .attr("class", "focus")
        .style("display", "none");

    main.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", mainHeight)
        .on("mouseenter", function() {
            focus.style("display", null);
            tooltip.style("opacity", 1);
            tooltipLine.style("opacity", 1);
        })
        .on("mouseleave", function() {
            focus.style("display", "none");
            tooltip.style("opacity", 0);
            tooltipLine.style("opacity", 0);
        })
        .on("mousemove", mousemove);

    function mousemove() {
        const x0 = mainX.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            /* work out which date value is closest to the mouse */
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;

        focus.attr("transform", `translate(${mainX(d.date)}, ${mainY(d.count)})`);
        tooltip.style("left", `${d3.event.pageX + 30}px`);
        tooltip.style("top", `${d3.event.pageY - 50}px`);
        tooltipLine.attr("x1", mainX(d.date))
            .attr("x2", mainX(d.date))
            .attr("y1", 0)
            .attr("y2", mainHeight);
        d3.select("#watch-date-date")
            .text(`${tooltipTime(d.date)}`);
        d3.select("#films-watched")
            .text(`${d.count} films watched`);
    };

    mini.append("g")
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", 0)
        .attr("height", miniHeight + 7);

    function brushed() {
        const selection = d3.event.selection;
        let extent = selection.map(d => miniX.invert(d));

        mainX.domain(extent);
        d3.select("#watch-date .x.axis").call(mainXAxis);
        main.selectAll("path.line")
            .attr("d", mainLine(data))
            .style("clip-path", "url(#clip)");
    };

}; watchDate();

async function decadeScatter() {
    const data = await d3.csv("./data/decade_breakdown.csv", d => ({
        decade: d.decade,
        avg_rating: +d.avg_rating,
        count: +d.count
    }));

    const margin = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 40
    },
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#decade-scatter")
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleLinear()
        .range([0, width])
        .domain(d3.extent(data, d => d.avg_rating))
        .nice();

    const y = d3.scaleLinear()
        .range([height, 0])
        .domain(d3.extent(data, d => d.count))
        .nice();

    const xAxis = d3.axisBottom()
        .scale(x)
        .tickPadding(10);

    const yAxis = d3.axisLeft()
        .scale(y)
        .tickPadding(10);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => x(d.avg_rating))
        .attr("cy", d => y(d.count))
        .attr("r", 8);

    svg.selectAll(".decade-label")
        .data(data)
        .join("text")
        .classed("year", true)
        .style("font-size", "10px")
        .style("opacity", 0.7)
        .text(d => d.decade)
        .attr("x", d => x(d.avg_rating) + 10)
        .attr("y", d => y(d.count) + 5)
        .attr("text-anchor", "start");

}; decadeScatter();
