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
weekdays("2019/12/29" %>% as.Date) %>% write("test.txt")

# reference_date <- as.Date("2019/12/29") # as.POSIXct("2019/12/29", format = "%Y/%m/%d")
# imputes_lacking_week_days <- function(dat) {
#   dat %>% {
#     c(filter(., row_number() == 1) %>% 
#         pull(Date) %>%
#         as.Date %>% {
#         len <- weekdays(.) %>% 
#           {WEEKDAY == .} %>% 
#           which %>% 
#           subtract(1)
#         seq.Date(from = . - len, to = . - 1, length.out = len) %>% 
#           as.character() %>% 
#           str_replace_all("-", "/")
#         }
#       , 
#       filter(., row_number() == n()) %>% 
#       pull(Date) %>% 
#       as.Date %>% {
#         len <- weekdays(.) %>% 
#         {WEEKDAY == .} %>% 
#           which %>% 
#           subtract(7) %>% 
#           multiply_by(-1)
#         seq.Date(from = . + 1, to = . + len, length.out = len) %>%
#           as.character() %>% 
#           str_replace_all("-", "/")
#         }
#       )
#     } %>% 
#     tibble(Date = .) %>% 
#     bind_rows(dat)
# }
# 
# paste0("https://covid19.mhlw.go.jp/public/opendata/", 
#        "newly_confirmed_cases_daily", 
#        ".csv") %>% 
#   read_csv() %>% 
#   imputes_lacking_week_days() %>% 
#   mutate(date = as.Date(Date)) %>% 
#   mutate(days_from_2019_12_29 = as.numeric(date - reference_date)) %>% 
#   mutate(week_num = days_from_2019_12_29 %/% 7 + 1) %>% 
#   mutate(week_day = factor(weekdays(date))) %>% 
#   pivot_longer(cols = ALL:Okinawa, names_to = "prefecture") %>% 
#   select(-Date) %>% 
#   filter(prefecture == "ALL") %>%
#   arrange(date) %>% 
#   group_by(week_day) %>%
#   nest() %$%
#   map2(week_day, data, ~ list(key = .x, values = .y)) %>%
#   toJSON(dataframe = "values", auto_unbox = TRUE, pretty = TRUE, na = "null") %>%
#   WRITE(FILE = "DOCS/DAT/NEWLY_CONFIRMED_CASES_DAILY.JSON")
