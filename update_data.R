if (!require(tidyverse)) {
  install.packages("tidyverse")
  library(tidyverse)
}

if (!require(magrittr)) {
  install.packages("magrittr")
  library(magrittr)
}

if (!require(jsonlite)) {
  install.packages("jsonlite")
  library(jsonlite)
}

# Sys.setlocale(locale = "C")

WEEKDAY_E <- paste0(c("Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur"), "day")
WEEKDAY_J <- paste0(c("日", "月", "火", "水", "木", "金", "土"), "曜日")
# WEEKDAY_J <- c("日", "月", "火", "水", "木", "金", "土")

reference_date <- as.Date("2019/12/29") # as.POSIXct("2019/12/29", format = "%Y/%m/%d")
imputes_lacking_week_days <- function(dat) {
  dat %>% {
    c(filter(., row_number() == 1) %>%
        pull(Date) %>%
        as.Date %>% {
        len <- weekdays(.) %>%
          {WEEKDAY_E == .} %>%
          which %>%
          subtract(1)
        seq.Date(from = . - len, to = . - 1, length.out = len) %>%
          as.character() %>%
          str_replace_all("-", "/")
        }
      ,
      filter(., row_number() == n()) %>%
      pull(Date) %>%
      as.Date %>% {
        len <- weekdays(.) %>%
        {WEEKDAY_E == .} %>%
          which %>%
          subtract(7) %>%
          multiply_by(-1)
        seq.Date(from = . + 1, to = . + len, length.out = len) %>%
          as.character() %>%
          str_replace_all("-", "/")
        }
      )
    } %>%
    tibble(Date = .) %>%
    bind_rows(dat)
}

save_json <- function(x) {
  paste0("https://covid19.mhlw.go.jp/public/opendata/", x, ".csv") %>%
  read_csv() %>%
  imputes_lacking_week_days() %>%
  mutate(date = as.Date(Date)) %>%
  mutate(days_from_2019_12_29 = as.numeric(date - reference_date)) %>%
  mutate(week_num = days_from_2019_12_29 %/% 7 + 1) %>%
  mutate(week_day = date %>% weekdays() %>% map_chr(~ .x %>% equals(WEEKDAY_E) %>% extract(WEEKDAY_J, .))) %>% 
  pivot_longer(cols = ALL:Okinawa, names_to = "prefecture") %>%
  select(-Date) %>%
  # filter(prefecture == "ALL") %>%
  arrange(date) %>%
  group_by(prefecture, week_day) %>%
  # nest() %$%
  # map2(week_day, data, ~ list(key = .x, values = .y)) %>%
  nest() %>%
  pmap(function(prefecture, week_day, data) list(prefecture = prefecture, data = list(key = week_day, values = data))) %>%
  toJSON(dataframe = "values", auto_unbox = TRUE, pretty = TRUE, na = "null") %>%
  write(file = paste0("docs/dat/", x, ".json"))
}

c("newly_confirmed_cases_daily", 
  "severe_cases_daily", 
  "number_of_deaths_daily") %>%  # "requiring_inpatient_care_etc_daily"
  walk(save_json)
