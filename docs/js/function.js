// var _data = data.filter(function (d) {
//   return d.name == allGroup[0];
// });

// console.log(
//   data.map(function (d) {
//     return d3.time.format("%Y/%m/%d").parse(d["Date"]);
//   })
// );

d3.json("dat/newly_confirmed_cases_daily.json", function (data) {
  nv.addGraph(function () {
    // console.log(data);
    var chart = nv.models
      .multiBarChart()
      .x(function (d) {
        return d[2];
      }) //We can modify the data accessor functions...
      .y(function (d) {
        return d[4];
      }) //...in case your data is formatted differently.
      .duration(500)
      .useInteractiveGuideline(true)
      // .showTotalInTooltip(true)
      .reduceXTicks(true) //If 'false', every single x-axis tick label will be rendered.
      .rotateLabels(0) //Angle to rotate x-axis labels.
      .showControls(true) //Allow user to switch between 'Grouped' and 'Stacked' mode.
      .stacked(true)
      .controlLabels({ grouped: "日", stacked: "週" })
      .groupSpacing(0); //Distance between each group of bars.
    // Format x-axis labels with custom function.

    // var xtickValues = data[0].values.map((d) => {
    //   return d[2];
    // });

    chart.xAxis
      //.tickValues(xtickValues)
      .tickFormat((d) => {
        return "第" + d + "週";
        // d3.time.format("%b-%Y")(new Date(d * 10 ** 3)); // UNIX date (from 1970/1/1) second -> millisecond
      })
      .showMaxMin(false);

    chart.yAxis
      .tickFormat(function (d) {
        return d3.format(",.0f")(d) + "人";
      })
      .showMaxMin(true);
    // .fontSize(15);

    // need to use "interactiveLayer.tooltip" option, not "tooltip" option
    // chart.tooltip.valueFormatter(function (d) {
    //   return d3.format(",.1f")(d) + "万円";
    // });

    chart.interactiveLayer.tooltip
      // .headerFormatter(function () {
      //   return "";
      // })
      // .valueFormatter(function (d) {
      //   return d == null ? null : d3.format(",.0f")(d) + "人";
      // });
      .contentGenerator(d => {
        // console.log(chart.state.disabled);
        var header;
        if (d.series.length > 1) {
          header = data[0].values[d.index][0] + " ~ " + data[6].values[d.index][0];
        } else if (d.series.length == 1) {
          header = d.series[0].data[0];
        } else {
          header = "";
        }
        var headerhtml = "<thead><tr><td colspan='3'><strong class='x-value'>" + 
                         header + 
                         "</strong></td></tr></thead>";

        var bodyhtml = d.series.map(d => {
          return "<tr>" + 
                 "<td class='legend-color-guide'>" + "<div style='background-color: " + d.color + ";'></div></td>" + 
                 "<td class='key'>" + d.key + "</td>" + 
                 "<td class='value'>" + (d.value === null ? "" : (d3.format(",.0f")(d.value) + "人")) + "</td>" + 
                 "</tr>";
        }).join("");
        var total = d.series.map(d => d.value)
                      .reduce((accumulator, current_value) => {
                        return accumulator + current_value;
                      });
        if (d.series.length > 1) {
                  bodyhtml = bodyhtml + 
                   "<tr>" + 
                     "<td class='legend-color-guide'>" + "</td>" + 
                     "<td class='key'>" + "合計" + "</td>" + 
                     "<td class='value'>" + d3.format(",.0f")(total) + "人" + "</td>" + 
                   "</tr>";
        }
        bodyhtml = "<tbody>" + bodyhtml + "</tbody>";

        return "<table>" + headerhtml + bodyhtml + "</table>";
      });

    d3.select("#chart").datum(data).call(chart);

    d3.select(".tick.zero line").style("stroke", "#000"); // to draw x axis in black

    nv.utils.windowResize(chart.update);

    // d3.select(".nv-background rect")
    //   .style("stroke-width", 1)
    //   .style("stroke", "#e5e5e5");

    // console.log(str(chart));
    return chart;
  });
});
