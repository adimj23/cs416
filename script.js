document.addEventListener("DOMContentLoaded", function () {
    const width = 840;
    const height = 600;
    const margin = {top: 20, right: 20, bottom: 30, left: 40};

    const x = d3.scaleLinear().range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

    // Define color scale
    // const color = d3.scaleOrdinal(d3.schemeCategory10);

    const colorArray = [
        "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", 
        "#8c564b", "#e377c2", "#bcbd22", "#17becf",
        "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5",
        "#c49c94", "#f7b6d2", "#d4a5a5", "#ff6f61", "#c9d6e3",
        "#6a1b9a", "#f57f17", "#f57c00", "#00796b", "#004d40",
        "#8d6e63", "#ff7043", "#ffb74d", "#009688", "#d32f2f",
        "#1976d2", "#7b1fa2", "#0288d1", "#004d40", "#2e7d32"
    ];

    // Apply this custom color array to the color scale
    const color = d3.scaleOrdinal(colorArray);

    const svg = d3.select("#scatterplot")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - margin.bottom})`);

    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left},0)`);

    svg.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "end")
        .attr("x", width - margin.right)
        .attr("y", height - margin.bottom - 5)
        .text("Pace");

    svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "end")
        .attr("x", -margin.top)
        .attr("y", margin.left + 5)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Offensive Rating");


    // Create tooltip div (hidden by default)
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#f9f9f9")
        .style("padding", "10px")
        .style("border", "1px solid #ccc")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("display", "none");

    const teamAbbreviations = {
        "Los Angeles Lakers": "LAL",
        "Utah Jazz": "UTA",
        "Portland Trail Blazers": "POR",
        "Phoenix Suns": "PHO",
        "San Antonio Spurs": "SAS",
        "Boston Celtics": "BOS",
        "Denver Nuggets": "DEN",
        "New York Knicks": "NYK",
        "Philadelphia 76ers": "PHI",
        "Dallas Mavericks": "DAL",
        "Seattle SuperSonics": "SEA",
        "Kansas City Kings": "KC",
        "Milwaukee Bucks": "MLE",
        "San Diego Clippers": "SD",
        "New Jersey Nets": "NJN",
        "Houston Rockets": "HOU",
        "Washington Bullets": "WAS",
        "Washington Wizards": "WAS",
        "Detroit Pistons": "DET",
        "Indiana Pacers": "IND",
        "Atlanta Hawks": "ATL",
        "Chicago Bulls": "CHI",
        "Golden State Warriors": "GSW",
        "Cleveland Cavaliers": "CLE",
        "Oklahoma City Thunder": "OKC",
        "Sacramento Kings": "SAC",
        "Los Angeles Clippers": "LAC",
        "Brooklyn Nets": "BRK",
        "Memphis Grizzlies": "MEM",
        "Toronto Raptors": "TOR",
        "Orlando Magic": "ORL",
        "Charlotte Hornets": "CHO",
        "Miami Heat": "MIA",
        "Minnesota Timberwolves": "MIN",
        "New Orleans Pelicans": "NOP",
        "Charlotte Bobcats": "CHA",
        "New Orleans Hornets": "NOH",
    };

    const years = ["1984", "2004", "2024"];
    let currentIndex = 0;

    let filterCategory = "All";

    const writeups = {
        "1984": "The 1980s were filled with very fast paced teams like the Los Angeles \"Showtime\" Lakers and the Denver Nuggets. The league average pace was 101.43, higher than even today's average. However, with the 3-point line being brought to the NBA only five years prior, teams were still figuring out how to best utilize it, averaging only three 3-point attempts for every 100 field goal attempts.",
        "2004": "By 2004, league average pace had slowed down to a crawl at just 90.1 possessions per 48 minutes. Games were slow and inefficient, and teams like the Detroit Pistons and San Antonio Spurs set the tone of the era with slow offenses that were not particularly efficient, but stellar defenses. Around this time the NBA introduced several rules that freed up offensive movement and led to faster, higher scoring games in the following years.",
        "2024": "Offenses in recent years are more efficient than ever, thanks in large part to the analytical revolution attributed to Steph Curry's Golden State Warriors and the Houston Rockets of the late 2010s. Teams are shooting more 3-pointers than ever before, with the league average 3PAr at 39% in 2024, a 13x increase from 1984. In other words, while viewers in the 80s saw a team shoot one 3-pointer every 33 shots, a modern fan sees a team shoot one 3-pointer every 2.5 shots."
    };
    

    const loadData = (year) => {
        d3.csv(`data${year}.csv`).then(function (data) {
            data.forEach(function (d) {
                d.Pace = +d.Pace;
                d.ORtg = +d.ORtg;
                d["3PAr"] = +d["3PAr"];
                d["TS%"] = +d["TS%"];
                d.Playoffs = d.Playoffs === "1";
            });

            // Calculate league averages
            const avgPace = d3.mean(data, d => d.Pace);
            const avgORtg = d3.mean(data, d => d.ORtg);
            const avg3PAr = d3.mean(data, d => d["3PAr"]);
            const avgTS = d3.mean(data, d => d["TS%"]);
            

            x.domain(d3.extent(data, d => d.Pace)).nice();
            y.domain(d3.extent(data, d => d.ORtg)).nice();

            svg.selectAll(".x-axis").call(d3.axisBottom(x));
            svg.selectAll(".y-axis").call(d3.axisLeft(y));

            const circles = svg.selectAll("circle")
                .data(data);

            circles.enter().append("circle")
                .merge(circles)
                .attr("cx", d => x(d.Pace))
                .attr("cy", d => y(d.ORtg))
                .attr("r", 5)
                .attr("fill", d => color(d.Team))
                .on("mouseover", function(event, d) {
                    tooltip.style("display", "block")
                        .html(`<strong>${d.Team}</strong><br>ORtg: ${d.ORtg}<br>Pace: ${d.Pace}<br>3PAr: ${d["3PAr"]}<br>TS%: ${d["TS%"]}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 30) + "px");
                })
                .on("mousemove", function(event) {
                    tooltip.style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 30) + "px");
                })
                .on("mouseout", function() {
                    tooltip.style("display", "none");
                });
            
            circles.style("opacity", d => {

                if (filterCategory === "All") return 1;

                if (filterCategory === "Playoffs" && d.Playoffs) return 1;

                if (filterCategory === "Non-playoffs" && !d.Playoffs) return 1;

                return 0.1; 

            });

            circles.exit().remove();

            // Add team abbreviations next to each point
            const labels = svg.selectAll("text.team-label")
                .data(data);

            labels.enter().append("text")
                .merge(labels)
                .attr("class", "team-label")
                .attr("x", d => x(d.Pace) + 5)
                .attr("y", d => y(d.ORtg) + 5)
                .text(d => teamAbbreviations[d.Team])
                .attr("font-size", "10px")
                .attr("fill", "black")
                .style("font-weight", d => d.Playoffs ? "bold" : "normal");
            
            labels.style("opacity", d => {

                if (filterCategory === "All") return 1;

                if (filterCategory === "Playoffs" && d.Playoffs) return 1;

                if (filterCategory === "Non-playoffs" && !d.Playoffs) return 1;

                return 0.1; 

            });

            labels.exit().remove();

            // Remove any existing average lines
            svg.selectAll(".avg-line").remove();
            svg.selectAll(".avg-label").remove();
            svg.selectAll(".annotate").remove();

            // Add average lines
            svg.append("line")
                .attr("class", "avg-line")
                .attr("x1", x(avgPace))
                .attr("x2", x(avgPace))
                .attr("y1", margin.top)
                .attr("y2", height - margin.bottom)
                .attr("stroke", "gray")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "5,5");

            svg.append("line")
                .attr("class", "avg-line")
                .attr("x1", margin.left)
                .attr("x2", width - margin.right)
                .attr("y1", y(avgORtg))
                .attr("y2", y(avgORtg))
                .attr("stroke", "gray")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "5,5");

            svg.append("text")
                .attr("class", "avg-label")
                .attr("x", x(avgPace) + 5)
                .attr("y", margin.top + 5)
                .attr("fill", "gray")
                .style("font-size", "10px")
                .text("League Average Pace = " + Math.round(avgPace * 100)/100);

            svg.append("text")
                .attr("class", "avg-label")
                .attr("x", width - margin.right - 5)
                .attr("y", y(avgORtg) + 10)
                .attr("fill", "gray")
                .attr("text-anchor", "end")
                .style("font-size", "10px")
                .text("League Average ORtg = " + Math.round(avgORtg * 100)/100);


            // Set slide info
            d3.select("#info-text").html(`League Average 3PAr: ${Math.round(avg3PAr*100)}%<br>League Average TS%: ${Math.round(avgTS*100)}%<br><br>${writeups[year]}`);

            if (year === "1984") {
                const denverNuggets = data.find(d => d.Team === "Denver Nuggets");
                const denverColor = "gray";

                svg.append("line")
                    .attr("class", "annotate")
                    .attr("x1", x(denverNuggets.Pace) - 40)
                    .attr("y1", y(denverNuggets.ORtg) + 60)
                    .attr("x2", x(denverNuggets.Pace) - 10)
                    .attr("y2", y(denverNuggets.ORtg) + 10)
                    .attr("stroke", denverColor)
                    .style("stroke-dasharray", ("3, 3"))
                    .attr("stroke-width", 2)
                    .style("font-size", "8px")
                    .attr("marker-end", "url(#arrow)");

                svg.append("text")
                    .attr("class", "annotate")
                    .attr("x", x(denverNuggets.Pace) - 80)
                    .attr("y", y(denverNuggets.ORtg) + 70)
                    .attr("fill", denverColor)
                    .style("font-size", "11px")
                    .text("The Nuggets exemplified the style of the 80s with their fast-paced, high scoring offense.")
                    .call(wrap, 80);

                    

                svg.append("defs").append("marker")
                    .attr("class", "annotate")
                    .attr("id", "arrow")
                    .attr("viewBox", "0 0 10 10")
                    .attr("refX", "5")
                    .attr("refY", "5")
                    .attr("markerWidth", "6")
                    .attr("markerHeight", "6")
                    .attr("orient", "auto-start-reverse")
                    .append("path")
                    .attr("d", "M 0 0 L 10 5 L 0 10 z")
                    .attr("fill", denverColor);
            } else if (year === "2004") {
                const detroitPistons = data.find(d => d.Team === "Detroit Pistons");
                const detroitColor = "gray";

                svg.append("line")
                    .attr("class", "annotate")
                    .attr("x1", x(detroitPistons.Pace) - 40)
                    .attr("y1", y(detroitPistons.ORtg) + 60)
                    .attr("x2", x(detroitPistons.Pace) - 10)
                    .attr("y2", y(detroitPistons.ORtg) + 10)
                    .attr("stroke", detroitColor)
                    .style("stroke-dasharray", ("3, 3"))
                    .attr("stroke-width", 2)
                    .style("font-size", "8px")
                    .attr("marker-end", "url(#arrow)");

                svg.append("text")
                    .attr("class", "annotate")
                    .attr("x", x(detroitPistons.Pace) - 80)
                    .attr("y", y(detroitPistons.ORtg) + 70)
                    .attr("fill", detroitColor)
                    .style("font-size", "11px")
                    .text("The Pistons of the mid-2000s were known for playing slow, defensive basketball.")
                    .call(wrap, 80);

                    

                svg.append("defs").append("marker")
                    .attr("class", "annotate")
                    .attr("id", "arrow")
                    .attr("viewBox", "0 0 10 10")
                    .attr("refX", "5")
                    .attr("refY", "5")
                    .attr("markerWidth", "6")
                    .attr("markerHeight", "6")
                    .attr("orient", "auto-start-reverse")
                    .append("path")
                    .attr("d", "M 0 0 L 10 5 L 0 10 z")
                    .attr("fill", detroitColor);
            } else {
                const celtics = data.find(d => d.Team === "Boston Celtics");
                const thunder = data.find(d => d.Team === "Oklahoma City Thunder");
                const pacers = data.find(d => d.Team === "Indiana Pacers");

                svg.append("line")
                    .attr("class", "annotate")
                    .attr("x1", 440)
                    .attr("y1", 80)
                    .attr("x2", x(celtics.Pace) + 35)
                    .attr("y2", y(celtics.ORtg) + 5)
                    .attr("stroke", "gray")
                    .style("stroke-dasharray", ("3, 3"))
                    .attr("stroke-width", 2)
                    .style("font-size", "8px")
                    .attr("marker-end", "url(#arrow)");

                svg.append("line")
                    .attr("class", "annotate")
                    .attr("x1", 500)
                    .attr("y1", 122)
                    .attr("x2", x(thunder.Pace) - 2)
                    .attr("y2", y(thunder.ORtg) - 10)
                    .attr("stroke", "gray")
                    .style("stroke-dasharray", ("3, 3"))
                    .attr("stroke-width", 2)
                    .style("font-size", "8px")
                    .attr("marker-end", "url(#arrow)");
                
                svg.append("line")
                    .attr("class", "annotate")
                    .attr("x1", 560)
                    .attr("y1", 85)
                    .attr("x2", x(pacers.Pace) - 12)
                    .attr("y2", y(pacers.ORtg) - 2)
                    .attr("stroke", "gray")
                    .style("stroke-dasharray", ("3, 3"))
                    .attr("stroke-width", 2)
                    .style("font-size", "8px")
                    .attr("marker-end", "url(#arrow)");

                svg.append("text")
                    .attr("class", "annotate")
                    .attr("x", 450)
                    .attr("y", 60)
                    .attr("fill", "gray")
                    .style("font-size", "11px")
                    .text("Last year, the Celtics, Pacers, and Thunder all broke the previous record for highest scoring offense in NBA history by ORtg.")
                    .call(wrap, 120);


                svg.append("defs").append("marker")
                    .attr("class", "annotate")
                    .attr("id", "arrow")
                    .attr("viewBox", "0 0 10 10")
                    .attr("refX", "5")
                    .attr("refY", "5")
                    .attr("markerWidth", "6")
                    .attr("markerHeight", "6")
                    .attr("orient", "auto-start-reverse")
                    .append("path")
                    .attr("d", "M 0 0 L 10 5 L 0 10 z")
                    .attr("fill", "gray");
            }

            updateButtons();

        });

    };

    const updateButtons = () => {
        d3.select("#left-arrow").attr("disabled", currentIndex === 0 ? true : null);
        d3.select("#right-arrow").attr("disabled", currentIndex === years.length - 1 ? true : null);

        d3.selectAll("#buttons button").classed("active", false);
        d3.select(`#year-${years[currentIndex]}`).classed("active", true);
    };


    // Initial load
    loadData(years[currentIndex]);

    d3.select("#left-arrow").on("click", function () {
        if (currentIndex > 0) {
            currentIndex--;
            filterCategory = "All";
            d3.select('input[name="filter"][value="All"]').property("checked", true);
            loadData(years[currentIndex]);
        }
    });

    d3.select("#right-arrow").on("click", function () {
        if (currentIndex < years.length - 1) {
            currentIndex++;
            filterCategory = "All";
            d3.select('input[name="filter"][value="All"]').property("checked", true);
            loadData(years[currentIndex]);
        }
    });

    d3.select("#year-1984").on("click", function () {
        currentIndex = 0;
        filterCategory = "All";
            d3.select('input[name="filter"][value="All"]').property("checked", true);
        loadData(years[currentIndex]);
    });

    d3.select("#year-2004").on("click", function () {
        currentIndex = 1;
        filterCategory = "All";
            d3.select('input[name="filter"][value="All"]').property("checked", true);
        loadData(years[currentIndex]);
    });

    d3.select("#year-2024").on("click", function () {
        currentIndex = 2;
        filterCategory = "All";
            d3.select('input[name="filter"][value="All"]').property("checked", true);
        loadData(years[currentIndex]);
    });

    d3.selectAll('input[name="filter"]').on("change", function () {

        filterCategory = this.value; // Update filterCategory based on selected radio button

        loadData(years[currentIndex]); // Reload data to apply the new filter

    });

    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                x = text.attr("x"),
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")) || 0,
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }
});