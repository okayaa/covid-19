d3.json("dat/newly_confirmed_cases_daily1.json", function (all_data) {

  var prefecture_J = ['全国合計', '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'];

  // List of groups (here I have one group per column)
  var all_group = [...new Set(all_data.map((d) => {return(d.prefecture)}))]
  // console.log(all_group)

  // add the options to the button
  d3.select("#select_button")
    .selectAll("options")
    .data(all_group)
    .enter()
    .append("option")
    .text((d, i) => {return prefecture_J[i]}) // text showed in the menu
    .attr("value", (d) => {return d}) // corresponding value returned by the button

  nv.addGraph(function () {
    // console.log(data);
    var chart = nv.models
      .multiBarChart()
      .x(function (d) {
        return d[2];
      }) //We can modify the data accessor functions...
      .y(function (d) {
        return d[3];
      }) //...in case your data is formatted differently.
      .margin({left: 80})
      .duration(500)
      .useInteractiveGuideline(true)
      // .showTotalInTooltip(true)
      .reduceXTicks(true) //If 'false', every single x-axis tick label will be rendered.
      .rotateLabels(0) //Angle to rotate x-axis labels.
      .showControls(true) //Allow user to switch between 'Grouped' and 'Stacked' mode.
      .stacked(true)
      .controlLabels({ grouped: "日ごと", stacked: "週ごと" })
      .groupSpacing(0); //Distance between each group of bars.
    // Format x-axis labels with custom function.

    // var xtickValues = data[0].values.map((d) => {
    //   return d[2];
    // });  

    chart.xAxis
      //.tickValues(xtickValues)
      .tickFormat((d, i) => {
        var n = chart.state.disabled.filter(Boolean).length;
        if (n != 6) {
          return d3.time.format("%d%b%Y")(new Date(data[0]["values"][i][0]));
        } else if (n == 6) {
          nth_weekday = chart.state.disabled.findIndex(x => x == false); // 0: Sunday - 6: Saturday
          return d3.time.format("%d%b%Y")(new Date(data[0 + nth_weekday]["values"][i][0]));
        } else {
        }
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
      .contentGenerator(function(d) {
        // console.log(chart.state.disabled);
        var header;
        if (d.series.length > 1) {
          header = d3.time.format("%d%b%Y")(new Date(data[0].values[d.index][0])) + " ~ " + d3.time.format("%d%b%Y")(new Date(data[6].values[d.index][0]));
        } else if (d.series.length == 1) {
          header = d3.time.format("%d%b%Y")(new Date(d.series[0].data[0]));
        } else {
          header = "";
        }
        var headerhtml = "<thead><tr><td colspan='3'><strong class='x-value'>" + 
                         header + 
                         "</strong></td></tr></thead>";

        var bodyhtml = d.series.map(function(d) {
          return("<tr>" + 
                 "<td class='legend-color-guide'>" + "<div style='background-color: " + d.color + ";'></div></td>" + 
                 "<td class='key'>" + d.key + "</td>" + 
                 "<td class='value'>" + (d.value === null ? "" : (d3.format(",.0f")(d.value) + "人")) + "</td>" + 
                 "</tr>")
        }).join("");
        var total = d.series.map(d => d.value).reduce((accumulator, currentValue) => {return(accumulator + currentValue);});
        if (d.series.length > 1) {
          bodyhtml = bodyhtml + 
                      "<tr>" + 
                        "<td class='legend-color-guide' style='border-top: 1px solid black;'>" + "</td>" + 
                        "<td class='key' style='border-top: 1px solid black;'>" + "合計" + "</td>" + 
                        "<td class='value' style='border-top: 1px solid black;'>" + d3.format(",.0f")(total) + "人" + "</td>" + 
                      "</tr>";
        }
        bodyhtml = "<tbody>" + bodyhtml + "</tbody>";

        return "<table>" + headerhtml + bodyhtml + "</table>";
      });

    // initial value
    var data = all_data.filter(d => {return d.prefecture == "ALL"}).map(d => {return d.data});

    d3.select("#chart").datum(data).call(chart);

    d3.select(".tick.zero line").style("stroke", "#000"); // to draw x axis in black

    nv.utils.windowResize(chart.update);

    // When the button is changed, run the updateChart function
    d3.select("#select_button").on("change", function(d) {
      // recover the option that has been chosen
      var selected_option = d3.select(this).property("value")
      // console.log(selected_option)
      data = all_data.filter(d => {return d.prefecture == selected_option}).map(d => {return d.data});
      // console.log(data)
      
      var current_state = chart.state.disabled;

      // run the updateChart function with this selected option
      d3.select("#chart").datum(data).call(chart.update) // .call(chart)
        // To retain "state" (week days were checked or not) when the prefecture was changed.
        .each(() => {
          d3.select("g.nv-legendWrap")
            .selectAll("g.nv-series")
            .filter((d, i) => {return current_state[i] == true;})
            .each(function() { // can NOT use an arrow function...
              this.dispatchEvent(new Event("click"));
            });
        });
    });

    return chart;

  });
});
