library("magrittr")

Sys.time() %>% as.character() %>% write("./docs/dat/test.txt")