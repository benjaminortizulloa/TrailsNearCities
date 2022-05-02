library(magrittr)

#https://services7.arcgis.com/feBzKmbMMjDq2yKj/arcgis/rest/services/NRT_Trail_Data_ESRI_web_2017_11_26/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=ObjectId%20ASC&resultOffset=0&resultRecordCount=1400&cacheHint=true&quantizationParameters=%7B%22mode%22%3A%22edit%22%7D
trails <- sf::read_sf('../data/nrt_trail_data.json') %>%
  sf::st_drop_geometry() %>%
  sf::st_as_sf(coords = c("Lon", "Lat"))

sf::st_write(trails, '../data/nrt_trail.geojson')
  

#https://wallethub.com/edu/healthiest-cities/31072
html <- rvest::read_html('../data/healthiest_cities.html')

headers <- rvest::html_elements(html, 'thead > tr > th') %>%
  rvest::html_text2() %>% 
  stringr::str_remove_all('\\s')

dta <- rvest::html_element(html, 'tbody > tr') %>%
  lapply(function(x){
    x %>%
      rvest::html_elements('td') %>%
      rvest::html_text2()
  }) %>%
  do.call(rbind, .)

colnames(dta) <- headers

cities <- tibble::as_tibble(dta)
readr::write_csv(cities, '../data/healthiest_cities.csv')
cities <- readr::read_csv('../data/healthiest_cities.csv')

#need to put MY_GCP_KEY in the environment.
get_place <- function(place){
  paste0("https://maps.googleapis.com/maps/api/geocode/json?address=", place, "&key=", MY_GCP_KEY) %>%
	jsonlite::read_json()
}

places <- cities$City %>%
	lapply(get_place)

saveRDS(places, '../data/healthiest_cities_location.rds')

place_lat_lng <- places %>%
	lapply(function(x){
		data.frame(lat = x$results[[1]]$geometry$location$lat, 
			     lng = x$results[[1]]$geometry$location$lng)
	}) %>%
	do.call(rbind, .) %>%
	tibble::as_tibble()

cities_lat_lng <- cbind(cities, place_lat_ng)
readr::write_csv(cities_lat_lng, '../data/healthiest_cities_location.csv')

cities_lat_lng <- readr::read_csv('../data/healthiest_cities_location.csv')

cities <- sf::st_as_sf(cities_lat_lng, coords = c('lng', 'lat'))

sf::st_write(cities, '../data/healthiest_cities.geojson')
