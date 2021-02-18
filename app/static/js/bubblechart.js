function get_info_on_var(variable) {
    var rel_meta = meta_data.find(function(d) {
        return d.Variabele == variable;
    })

    var label = rel_meta['Label_1'];
    var definition = rel_meta['Definition'];

    return [label, definition]
}

function updateArea(selectObject) {
    selected_area = selectObject.value;
    updatePlot();
};

function makeAxes() {
    var chart_group = svgContainer.append("g")
        .attr("id", "chart_group")
        .attr("transform", "translate(" + 100 + "," + 50 + ")");

    chart_group.append("g")
        .attr("transform", "translate(0,100)")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("dx", "-60")
        .attr("dy", "-40")
        .attr("transform", "rotate(-90)");

    return chart_group
}

function updatePlot() {
    var fetch_url = "/d3_plot_data?area_name=" + selected_area;
    fetch(fetch_url)
        .then(function(response) { return response.json(); })
        .then((data) => {
            plot_data = data;
            transitionToNewChart(plot_data)
    });
}

function removeOldChart() {
    d3.select("#chart_group")
        .remove();
}

var maxCircleArea = Math.PI * Math.pow(50, 2);

circleAreaScale = d3.scaleLinear()
.domain([0, 106])
.range([0, maxCircleArea]);

function scaleCircleArea(d) {
    return Math.sqrt(circleAreaScale(d) / Math.PI)
}

yScale = d3.scaleLinear().domain(1,10).range(1, 1000)

function createNewChart() {

    var chart_group = svgContainer.append("g")
        .attr("id", "chart_group")
        .attr("transform", "translate(" + 100 + "," + 50 + ")");

    chart_group.append("g")
        .attr("transform", "translate(0,100)")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("dx", "-60")
        .attr("dy", "-40")
        .attr("transform", "rotate(-90)");

    var map = d3.map(plot_data[0]);

    chart_group.selectAll(".dot")
    .data(map.entries())
    .enter()
    .append(".dot")
    .attr("class", "dot")
    .attr("r", function(d) { return scaleCircleArea(d.value); })
    .attr("cy", 50)
    .attr("cx", function(d) { return x(d.key); })
    .on("mousemove", function(d, i) {
        var x_var = d.key;
        var value = d.value;
        var info = get_info_on_var(x_var);
        var label = info[0]
        var definition = info[1];

        displayTooltip("<b>Variable: </b>" + label + "<br /><b>Percentage: </b>" +
            value + "%<br /><b>Explanation: </b>" + definition)

        d3.select(this).attr("fill", "DarkOrange");
    })
    .on("mouseout", function(d) {
        hideTooltip();
        d3.select(this).attr("fill", "steelblue");
    });

}

function transitionToNewChart(chart_data) {

    var map = d3.map(chart_data[0]);

    var u = chart.selectAll("circle")
    .data(map.entries())

    u.enter()
    .append("circle")
    .on("mousemove", function(d, i) {
        var x_var = d.key;
        var value = d.value;
        var info = get_info_on_var(x_var);
        var label = info[0]
        var definition = info[1];

        displayTooltip("<b>Variable: </b>" + label + "<br /><b>Percentage: </b>" +
            value + "%<br /><b>Explanation: </b>" + definition)

        d3.select(this).attr("fill", "DarkOrange");
    })
    .on("mouseout", function(d) {
        hideTooltip();
        d3.select(this).attr("fill", "steelblue");
    })
    .merge(u)
    .transition()
    .duration(1000)
    .attr("class", "dot")
    .attr("r", function(d) { return scaleCircleArea(d.value); })
    .attr("cy", 50)
    .attr("cx", function(d) { return x(d.key); })
}