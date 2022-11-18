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

WEEKDAY <- paste0(c("日", "月", "火", "水", "木", "金", "土"), "曜日")

reference_date <- as.Date("2019/12/29") # as.POSIXct("2019/12/29", format = "%Y/%m/%d")

imputes_lacking_week_days <- function(dat) {
  dat %>% {
    c(filter(., row_number() == 1) %>% 
        pull(Date) %>%
        as.Date %>% {
        len <- weekdays(.) %>% 
          {WEEKDAY == .} %>% 
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
        {WEEKDAY == .} %>% 
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

endpoint <- "requiring_inpatient_care_etc_daily"

requiring_inpatient_care_etc_daily <- endpoint %>% 
  paste0("https://covid19.mhlw.go.jp/public/opendata/", ., ".csv") %>% 
  read_csv() %>% 
  select(Date, contains("Requiring inpatient care")) %>% 
  pivot_longer(-Date) %>% 
  mutate(col_name = str_extract(name, "(?<=\\().*?(?=\\))")) %>% 
  pivot_wider(Date, names_from = col_name, values_from = value) %>% 
  imputes_lacking_week_days() %>% 
  mutate(endpoint = endpoint)

endpoints <- c("newly_confirmed_cases_daily", 
               # "requiring_inpatient_care_etc_daily",
               "deaths_cumulative_daily",
               "severe_cases_daily") 

endpoints %>%
  paste0("https://covid19.mhlw.go.jp/public/opendata/", ., ".csv") %>% 
  map(~ read_csv(.x)) %>% 
  map(~ imputes_lacking_week_days(.x)) %>% 
  map2(endpoints, ~ .x %>% mutate(endpoint = .y)) %>% 
  bind_rows(requiring_inpatient_care_etc_daily) %>% 
  mutate(date = as.Date(Date)) %>% 
  mutate(days_from_2019_12_29 = as.numeric(date - reference_date)) %>% 
  mutate(week_num = days_from_2019_12_29 %/% 7 + 1) %>% 
  mutate(week_day = factor(weekdays(date))) %>% 
  pivot_longer(cols = ALL:Okinawa, names_to = "prefecture") %>% 
  select(-Date) %>% 
  arrange(endpoint, prefecture, date) %>% 
  group_by(endpoint, prefecture, week_day) %>%
  nest() %>%
  rename(key = week_day, values = data) %>% 
  group_by(endpoint, prefecture) %>%
  nest() %>% 
  pmap(~ list(...)) %>% 
  toJSON(dataframe = "row", auto_unbox = TRUE, pretty = TRUE, na = "null") %>%
  write(file = "../web/dat/dat.json")

#####

endpoints %>%
  paste0("https://covid19.mhlw.go.jp/public/opendata/", ., ".csv") %>% 
  map(~ read_csv(.x)) %>% 
  map(~ imputes_lacking_week_days(.x)) %>% 
  map2(endpoints, ~ .x %>% mutate(endpoint = .y)) %>% 
  bind_rows(requiring_inpatient_care_etc_daily) %>% 
  mutate(date = as.Date(Date)) %>% 
  mutate(days_from_2019_12_29 = as.numeric(date - reference_date)) %>% 
  mutate(week_num = days_from_2019_12_29 %/% 7 + 1) %>% 
  mutate(week_day = factor(weekdays(date))) %>% 
  pivot_longer(cols = ALL:Okinawa, names_to = "prefecture") %>% 
  select(-Date) %>% 
  arrange(prefecture, date) %>% 
  filter(prefecture == "ALL" & endpoint == "newly_confirmed_cases_daily") %>%
  # write_csv(path = "../web/dat/dat.csv")
  group_by(week_day) %>%
  nest() %$%
  map2(week_day, data, ~ list(key = .x, values = .y)) %>%
  toJSON(dataframe = "values", auto_unbox = TRUE, pretty = TRUE, na = "null") %>%
  write(file = "../web/dat/newly_confirmed_cases_daily.json")
