library(magrittr)
cities <- sf::st_read('../data/healthiest_cities.geojson') 
trails <- sf::st_read('../data/nrt_trail.geojson')


#========================
# Get trail photos
#========================
photos <- vapply(trails$URLFeatured, function(link){
  rvest::read_html(link) %>%
    rvest::html_element('img.image.fit.no-print') %>%
    rvest::html_attr('src') %>%
    paste0("https://www.nrtdatabase.org/", .)
}, character(1)) 


photo_df <- purrr::imap_dfr(photos, function(x, i){
  tibble::tibble(URLFeatured = i, photo = x)
}) %>%
  dplyr::bind_rows()

readr::write_csv(photo_df, '../data/trail_photos.csv')

trails <- dplyr::left_join(trails, photo_df)

ct_dist <- sf::st_distance(
  sf::st_transform(cities,"+proj=lcc +lat_1=33 +lat_2=45 +lat_0=39 +lon_0=-96 +x_0=0 +y_0=0 +datum=NAD83 +units=m +no_defs"),
  sf::st_transform(trails,"+proj=lcc +lat_1=33 +lat_2=45 +lat_0=39 +lon_0=-96 +x_0=0 +y_0=0 +datum=NAD83 +units=m +no_defs")
)

units(ct_dist) <- "miles"

colnames(ct_dist) <- trails$TrailUID
rownames(ct_dist) <- cities$City

#============================================
# get closest trails to most populated cities
#============================================

ten_city_trails <- cities$City %>%
  lapply(function(cty){
    ct_dist[cty,] %>% 
      sort() %>%
      head(10) %>%
      as.list() %>%
      purrr::imap(function(x, i){
        data.frame(TrailUID = as.integer(i), distance = x)
      }) %>%
      dplyr::bind_rows() %>%
      dplyr::mutate(close_rank = 1:10) %>%
      dplyr::left_join(trails)
  })

cities$closestTrails = ten_city_trails
cities$avg_trail_distance <- vapply(ten_city_trails, function(x){mean(x$distance)}, double(1))
cities$avg_trail_length <- vapply(ten_city_trails, function(x){mean(x$LengthMile)}, double(1))

#================================================
# use google directions api to get road features.
#================================================

getDirections <- function(cityGeo, trailGeo){
  origin <- sf::st_coordinates(cityGeo)
  origin <- paste0('origin=', origin[2], ',', origin[1])
  
  destination <- sf::st_coordinates(trailGeo)
  destination <- paste0("destination=", destination[2], ',', destination[1])
  
  url <- paste0("https://maps.googleapis.com/maps/api/directions/json?", origin, "&", destination, "&key=", MY_GCP_KEY)
  url
}


cityTrailDirections <- purrr::map2(cities$geometry, cities$closestTrails, function(x,y){
  y$geometry %>%
    lapply(function(z){
      jsonlite::read_json(getDirections(x, z))
    })
})

saveRDS(cityTrailDirections, '../data/cityTrailDirections.rds')
cityTrailDirections <- readRDS('../data/cityTrailDirections.rds')

#=====================================
# Turn directions to multiline strings
#=====================================

cityTrailDirectionShapes <- cityTrailDirections %>%
  purrr::imap(function(cty, i){
    print(i)
    cty %>%
      purrr::imap(function(trl, j){
        print(paste0(i, ": ", j, " (", trl$status, ")"))
        if(trl$status == "ZERO_RESULTS"){
          sf::st_linestring()
        } else {
          trl$routes[[1]]$legs[[1]]$steps %>%
            lapply(function(stp){
              rbind(c(stp$start_location$lng, stp$start_location$lat), c(stp$end_location$lng, stp$end_location$lat))
            }) %>%
            sf::st_multilinestring()
        }
      }) %>%
      sf::st_sfc()
  })

saveRDS(cityTrailDirectionShapes, '../data/cityTrailDirectionShapes.rds')
cityTrailDirectionShapes <- readRDS('../data/cityTrailDirectionShapes.rds')
#==================================================================================
# x,y is now long lat of trail and the features are now the directions to the trail
#==================================================================================

cityAndDirections <- cities %>%
  dplyr::mutate(
    closestTrails = purrr::imap_chr(closestTrails, function(cty, i){
      cty %>%
        cbind(sf::st_coordinates(.$geometry)) %>%
        sf::st_sf(geometry = cityTrailDirectionShapes[[i]], crs = 4326) %>%
        geojsonsf::sf_geojson()
    })
  )

sf::st_write(cityAndDirections, '../data/cityAndDirections.geojson', delete_dsn = T)

#==============================
# how many trails near a city?
#==============================

trailCount <- cities$City %>%
  lapply(function(cty){
    tibble::tibble(
      within100 = sum(ct_dist[cty,] <= units::as_units(100, 'miles'), na.rm = T),
      within50 = sum(ct_dist[cty,] <= units::as_units(50, 'miles'), na.rm = T),
      within25 = sum(ct_dist[cty,] <= units::as_units(25, 'miles'), na.rm = T),
    )
  }) %>%
  dplyr::bind_rows()


cityAndDirections <- sf::st_read('../data/cityAndDirections.geojson')

cityAndDirections <- cbind(cityAndDirections, trailCount)
sf::st_write(cityAndDirections, '../data/cityAndDirectionsAndCounts.geojson', delete_dsn = T)

write(paste0('let cityInfo =', paste(readLines('../data/cityAndDirectionsAndCounts.geojson'), collapse = '\n')), '../assets/cityInfo.js')


#========================
# Get trail info
#========================

trails$Agency %>%
  table %>%
  sort

trails$LengthMile %>% summary()
