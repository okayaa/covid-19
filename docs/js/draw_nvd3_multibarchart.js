
// An error was thrown when the date object was generated by the follwoing way in an actual machine of iphone SE3 Safari... 
// let reference_date = moment(new Date("12Jan2020));
// This way is OK...
const reference_date = moment(new Date("2020-01-12 00:00:00.000"));

const time_format_d3 = "%Y/%-m/%-d"; // "%d%b%Y"
const time_format_moment = "YYYY/M/D"; // "DDMMMYYYY"

const prefectures_J = ['全国合計', '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', 
                       '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', 
                       '神奈川県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', 
                       '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', 
                       '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', 
                       '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', 
                       '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'];

const endpoints_J = ["新規陽性者数", "重症者数", "死亡者数"]; // , "入院治療等を要する者数"];
const endpoints = ["newly_confirmed_cases_daily", "severe_cases_daily", "number_of_deaths_daily"]; // , "requiring_inpatient_care_etc_daily"];

const promise_all_data = endpoints.map(endpoint => fetch("dat/" + endpoint + ".json").then(response => {return(response.json())}));

Promise.all(promise_all_data)
  .then(function (all_data) {

    // add the options to the button
    d3.select("#endpoint")
      .selectAll("option") // whatever...
      .data(endpoints)
      .enter()
      .append("option")
      .text((d, i) => {return endpoints_J[i]}) // text showed in the menu
      .attr("value", (d, i) => {return i}); // corresponding value returned by the button

    // global initial values
    let selected_endpoint = 0; // 0: newly_confirmed_cases_daily
    let selected_prefecture = "ALL";

    // List of groups (here I have one group per column)
    const all_group = [...new Set(all_data[selected_endpoint].map((d) => {return(d.prefecture)}))]; 
    // console.log(all_group);

    d3.select("#prefecture")
      .selectAll("option")
      .data(all_group)
      .enter()
      .append("option")
      .text((d, i) => {return prefectures_J[i]})
      .attr("value", (d) => {return d});

    let data = all_data[selected_endpoint].filter(d => {return d.prefecture == selected_prefecture}).map(d => {return d.data});

    // let first_date = new Date(2020, 1 - 1, 12);
    // let first_date = moment(new Date("12Jan2020"));
    // let first_date = moment(new Date("2020-01-12"));
    // let start_day = first_date.hour(0).minutes(0).second(0).millisecond(0).diff(reference_date, "days");
    let start_day = 0;
    let start_week = Math.floor(start_day / 7) + 1;

    // let last_day_candidates = data.map(d => d.values.slice(-1)).filter(d => d[0][3] !== null);
    // let last_day = Math.max(...last_day_candidates.map(d => d[0][1]));
    // let last_week = last_day_candidates.filter(d => d[0][1] == last_day)[0][0][2];
    // let last_date = moment(new Date(last_day_candidates.filter(d => d[0][1] == last_day)[0][0][0]));
    // let last_date_chr = data.map(d => d.values.slice(-1)).filter(d => d[0][3] !== null).slice(-1)[0][0][0];
    let last_date_chr = data.map(d => d.values.slice(-1)).slice(-1)[0][0][0];
    let last_date = moment(new Date(last_date_chr));

    let end_day = last_date.hour(0).minutes(0).second(0).millisecond(0).diff(reference_date, "days");
    let end_week = Math.floor(end_day / 7) + 1;

    d3.select('#reportrange span')
      .text(reference_date.format(time_format_moment) + ' ~ ' + last_date.format(time_format_moment));
    // $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));

    nv.addGraph(function () {
      // console.log(data);
      let chart = nv.models
        .multiBarChart()
        .x(function (d) {
          return d[2];
        }) //We can modify the data accessor functions...
        .y(function (d) {
          return d[3];
        }) //...in case your data is formatted differently.
        .forceY([0, 1])
        .margin({left: 80})
        .duration(500)
        .useInteractiveGuideline(true)
        // .showTotalInTooltip(true)moment().endOf('week')
        .reduceXTicks(true) //If 'false', every single x-axis tick label will be rendered.
        .rotateLabels(0) //Angle to rotate x-axis labels.
        .showControls(true) //Allow user to switch between 'Grouped' and 'Stacked' mode.
        .stacked(true)
        // .wrapLabels(true)
        .controlLabels({ grouped: "日ごと", stacked: "週ごと" })
        .groupSpacing(0); //Distance between each group of bars.
      // Format x-axis labels with custom function.

      chart.xAxis
        //.tickValues(xtickValues)
        .tickFormat((d, i) => {
          // let n = chart.state.disabled.filter(Boolean).length;
          // if (n != 6) {
          //   return d3.time.format(time_format_d3)(new Date(data[0]['values'][i][0]));
          // } else if (n == 6) {
          //   nth_weekday = chart.state.disabled.findIndex(x => x === false); // 0: Sunday - 6: Saturday
          //   return d3.time.format(time_format_d3)(new Date(data[0 + nth_weekday]['values'][i][0]));
          // } else {
          // }
          nth_weekday = chart.state.disabled.findIndex(x => x === false); // 0: Sunday - 6: Saturday
          return d3.time.format(time_format_d3)(new Date(data[0 + nth_weekday]['values'][i][0]));
        })
        .showMaxMin(false);

      chart.yAxis
        .tickFormat(function (d) {
          return d3.format(",.0f")(d) + "人";
        })
        .showMaxMin(true);
      // .fontSize(15);

      // need to use "interactiveLayer.tooltip" option, not "tooltip" option
      chart.interactiveLayer.tooltip
        // .headerFormatter(function () {
        //   return "";
        // })
        //   return d == null ? null : d3.format(",.0f")(d) + "人";
        // });
        .contentGenerator(function(d) {
          // console.log(chart.state.disabled);

          // let header;
          // if (d.series.length > 1) {
          //   header = d3.time.format(time_format_d3)(new Date(data[0].values[d.index][0])) + " ~ " + d3.time.format(time_format_d3)(new Date(data[6].values[d.index][0]));
          // } else if (d.series.length == 1) {
          //   header = d3.time.format(time_format_d3)(new Date(d.series[0].data[0]));
          // } else {
          //   header = "";
          // }
          // let headerhtml = "<thead><tr><td colspan='3'><strong class='x-value'>" + 
          //                  header + 
          //                  "</strong></td></tr></thead>";

          // if (d.series.every(d => (d.value === null)) == true) {
          //   d3.select(".nvtooltip.xy-tooltip")
          //     .style("display", "none");
          // } else {
          //   d3.select(".nvtooltip.xy-tooltip")
          //     .style("display", "block");          
          // }

          let bodyhtml = d.series.map(function(d) {
            return("<tr>" + 
                    "<td class='legend-color-guide'>" + "<div style='background-color: " + d.color + ";'></div></td>" + 
                    "<td class='key'>" + d.key + " (" + d3.time.format(time_format_d3)(new Date(d.data[0])) + ")" + "</td>" + 
                    "<td class='value'>" + (d.value === null ? "No Data" : (d3.format(",.0f")(d.value) + "人")) + "</td>" + 
                   "</tr>");
          }).join("");
          if ((d.series.length > 1) & !(d.series.every(d => (d.value === null)) == true)) {
            let total = d.series.map(d => d.value).reduce((accumulator, currentValue) => {return(accumulator + currentValue);});
            bodyhtml = bodyhtml + 
                        "<tr>" + 
                          "<td class='legend-color-guide' style='border-top: 1px solid black;'>" + "</td>" + 
                          "<td class='key' style='border-top: 1px solid black;'>" + "合計" + "</td>" + 
                          "<td class='value' style='border-top: 1px solid black;'>" + d3.format(",.0f")(total) + "人" + "</td>" + 
                        "</tr>";
          };
          bodyhtml = "<tbody>" + bodyhtml + "</tbody>";

          // return "<table>" + headerhtml + bodyhtml + "</table>";
          return("<table>" + bodyhtml + "</table>");
        });


      d3.select("#chart").datum(data).call(chart);

      d3.select(".tick.zero line").style("stroke", "#000"); // to draw x axis in black

      nv.utils.windowResize(chart.update);

      // console.log(nv.utils.wrapTicks);
      // console.log([start_day, end_day]);

      let previous_state, current_state;

      let update_chart = function() {

        data = all_data[selected_endpoint].filter(d => {return d.prefecture == selected_prefecture}).map(d => {return {key: d.data.key, values: d.data.values.filter(d => {return (d[2] >= start_week & d[2] <= end_week)})}});
        // console.log(data)
        // console.log(data.filter((d, i) => !chart.state.disabled[i]).map(d => d.values).map(d => d.map(d => d[3])).flat().every(d => d === null));
              
        previous_state = chart.state.disabled;

        // run the updateChart function with this selected option
        d3.select("#chart").datum(data).call(chart.update); // .call(chart)
        
        // .call(function() {
        //   d3.select("g.nv-legendWrap")
        //   .selectAll("g.nv-series")
        //   .filter((d, i) => {return current_state[i] == true;})
        //   .each(function(d, i) { // can NOT use an arrow function...
        //     this.dispatchEvent(new Event("click"));
        //     // d3.select("circle").style("fill-opacity", function() {return current_state[i] ? 0 : 1});
        //   });

        current_state = chart.state.disabled;

        // To retain "state" (week days were checked or not) when the prefecture was changed.
        d3.select("g.nv-legendWrap")
          .selectAll("g.nv-series")
          .each(function(d, i) { // can NOT use an arrow function...
            if (current_state[i] != previous_state[i]) this.dispatchEvent(new Event("click"));
          });

      };


      let change_endpoint = function(d) {

        selected_endpoint = d3.select(this).property("value");

        update_chart();

      };
      d3.select("#endpoint").on("change", change_endpoint); 


      let change_prefecture = function() {

        // recover the option that has been chosen
        selected_prefecture = d3.select(this).property("value"); 
        // console.log(selected_prefecture)

        update_chart();

      };
      // When the button is changed, run the updateChart function
      d3.select("#prefecture").on("change", change_prefecture); 


      let change_period = function(start_date, end_date) {

        d3.select('#reportrange span')
          .text(start_date.format(time_format_moment) + ' ~ ' + end_date.format(time_format_moment));
        
        start_day = start_date.hour(0).minutes(0).second(0).millisecond(0).diff(reference_date, "days");
        start_week = Math.floor(start_day / 7) + 1;
      
        end_day = end_date.hour(0).minutes(0).second(0).millisecond(0).diff(reference_date, "days");
        end_week = Math.floor(end_day / 7) + 1;

        update_chart();

      };

      $('#reportrange').daterangepicker({      
          startDate: reference_date,
          endDate: last_date,
          minDate: reference_date,
          maxDate: last_date,
          // isInvalidDate: function(date) {return !([6, 7].includes(date.isoWeekday()) || date.isSame(reference_date) || date.isSame(last_date))},
          isInvalidDate: function(date) {return !([6, 7].includes(date.isoWeekday()))}, // 6: Saturday, 7: Sunday
          linkedCalendars: false,
          opens: "left",
          ranges: {
            // 'Last Week': [last_date.clone().subtract(1, 'weeks').startOf('weeks'), last_date.clone().subtract(1, 'weeks').endOf('weeks')],
            'This Week': [last_date.clone().startOf('weeks'), last_date],
            'Last + This Week': [last_date.clone().subtract(1, 'weeks').startOf('weeks'), last_date],
            'Last 4 Weeks': [last_date.clone().subtract(4 - 1, 'weeks').startOf('weeks'), last_date],
            'Last 13 Weeks': [last_date.clone().subtract(13 - 1, 'weeks').startOf('weeks'), last_date],
            'Last 26 Weeks': [last_date.clone().subtract(26 - 1, 'weeks').startOf('weeks'), last_date],
            'Last 52 Weeks': [last_date.clone().subtract(52 - 1, 'weeks').startOf('weeks'), last_date],
            'Entire Period': [reference_date, last_date]
          }
      }, change_period);

      return chart;
    });
  });