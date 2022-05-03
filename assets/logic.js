let vid = document.getElementById("titleVideo");
vid.playbackRate = 0.5;

/*
    Video and introductory Text
*/

const pinVideo = gsap.timeline({
    scrollTrigger: {
        trigger: "#titleCard",
        start: 'top top',
        end: "top -100%",
        pin: '#titleVideo'
    }
})

const changeTitleText = gsap.timeline({
    scrollTrigger: {
        trigger: "#section1",
        start: "top bottom",
        end: "top top",
        scrub: true
    }
})
.add('start')
.to('#youShouldScroll', {opacity: 0}, 'start')
.to("#titleText", {opacity: 0}, "start")
.from('#section1', {opacity: 0}, 'start')
.to('#titleVideo', {opacity: 0}, 'start')


/*
    Setup SVG
*/

function getDim(){
    let {width, height} = d3.select('#titleCard').node().getBoundingClientRect()
    return {w: width, h: height, m: {t: height/5, r: width/6, b: height/6, l: width/6}}
}

let {w, h, m} = getDim()
let svg = d3.select('#mainSVG').attr('width', w).attr('height', h)

function firstImageSetup(){
    let r = 250;
    let imgFirst = svg
        .append('g')
        .attr('id', 'firstTrail')
        .style('transform-box', 'fill-box')
        .attr('transform-origin', "center")
        .attr('transform', 'scale(1) translate(0, 0)')
        .append('g')
        .attr('id', 'subG')
        .style('transform-box', 'fill-box')
        .attr('transform-origin', "center")
        .attr('transform', 'scale(1)')
    
    imgFirst.append('clipPath')
        .attr('id', 'firstClip')
        .append('circle')
        .attr('r', r)
        .attr('cx', w/2 )
        .attr('cy', h/2 )
    
    imgFirst.append('circle')
        .attr('id', 'firstBackground')
        .attr('r', r)
        .attr('cx', w/2 )
        .attr('cy', h/2 )
    
    imgFirst.append('a')
        .attr('href', trailInfo.firstTrail[0].URLFeatured)
        .attr('target', '_blank')
        .append('image')
        .attr('id', 'firstImage')
        .attr('href', trailInfo.firstTrail[0].photo)
        .attr('width', 2 * r)
        .attr('height', 2 * r)
        .attr('x', w/2 - r)
        .attr('y', h/2  - r)
        .attr('clip-path', 'url(#firstClip)')

    d3.select('#firstInfo')
        .style('top', `${h/2 - r}px`)
        .style('left', `${w/2 + r + 2}px`)
        .html(`This is <a href='${trailInfo.firstTrail[0].URLFeatured}' target='_blank'>${trailInfo.firstTrail[0].TrailName} </a> located in ${trailInfo.firstTrail[0].TrailState}. It is ${trailInfo.firstTrail[0].LengthMile} miles long. It was certified with the National Trails System in ${trailInfo.firstTrail[0].CertifiedYear} - making it one of the first trails in their system.`)
}


function lineSetup(){
    let linechart = svg
        .append('g')
        .attr('id', 'yearTrail')
    
    let lineX = d3.scaleLinear()
        .domain(d3.extent(trailInfo.yearInfo, x => x.year))
        .range([m.l, w- m.r])
        
    
    linechart
        .append('g')
        .attr('id', 'lineXAxis')
        .attr('transform', `translate(0, ${h-m.b})`)
        .call(d3.axisBottom(lineX).tickFormat(d3.format('d')))
    
    let lineY = d3.scaleLinear()
        .domain([0, d3.max(trailInfo.yearInfo, x => x.cumsum)])
        .range([h - m.b, m.t])
    
    linechart
        .append('g')
        .attr('id', 'lineYAxis')
        .attr('transform', `translate(${m.l}, 0)`)
        .call(d3.axisLeft(lineY))

    linechart
        .append('path')
        .attr('id', 'yearTrailLine')
        .datum(trailInfo.yearInfo)
        .attr('fill', 'none')
        .attr('stroke', 'forestgreen')
        .attr('stroke-width', 3)
        .attr('d', d3.line().x(d => lineX(d.year)).y(d => lineY(d.cumsum)))
    
    linechart
        .append('text')
        .attr('class', 'lineLabs')
        .attr('transform', `translate(${w/2}, ${h-m.b/2})`)
        .attr('text-anchor', 'middle')
        .style('font-size', '3vh')
        .text("Year Park Certified into National Trails System")

    linechart
        .append('text')
        .attr('class', 'lineLabs')
        .attr('transform', `translate(${m.l}, ${h/2}) rotate(90)`)
        .attr('text-anchor', 'middle')
        .style('font-size', '3vh')
        .text("Total Trails")

    linechart
        .append('text')
        .attr('class', 'lineLabs')
        .attr('transform', `translate(${m.l}, ${m.t * .75})`)
        .style('font-size', '4vh')
        .text("Total Certified National Trails Over Time")

    return {lineY, lineX}
}

function lastImageSetup(){
    let r = 250;
    let imgLast = svg
        .append('g')
        .attr('id', 'lastTrail')
        .style('transform-box', 'fill-box')
        .attr('transform-origin', "center")
        // .attr('transform', 'scale(1)')
        .attr('transform', `scale(1) translate(0, 0)`)
    
    imgLast.append('clipPath')
        .attr('id', 'lastClip')
        .append('circle')
        .attr('r', r)
        .attr('cx', (w - m.r) )
        .attr('cy', (m.t) )
    
    imgLast.append('circle')
        .attr('id', 'lastBackground')
        .attr('r', r)
        .attr('cx', (w - m.r) )
        .attr('cy', (m.t))
    
    imgLast.append('a')
        .attr('href', trailInfo.lastTrail[0].URLFeatured)
        .attr('target', '_blank')
        .append('image')
        .attr('id', 'lastImage')
        .attr('href', trailInfo.lastTrail[0].photo)
        .attr('width', 2 * r)
        .attr('height', 2 * r)
        .attr('x', w - m.r - r)
        .attr('y', m.t - r)
        .attr('clip-path', 'url(#lastClip)')

    d3.select('#lastInfo')
        .style('top', `${m.t +  r + 2}px`)
        .style('left', `${w - m.r - (r * 1.5)}px`)
        .html(`This is <a href='${trailInfo.lastTrail[0].URLFeatured}' target='_blank'>${trailInfo.lastTrail[0].TrailName} </a> located in ${trailInfo.lastTrail[0].TrailState}. It is ${trailInfo.lastTrail[0].LengthMile} miles long. It was certified with the National Trails System in ${trailInfo.firstTrail[0].CertifiedYear} - making it one of the most recent trails and the 1,318th trail in their system.`)
}

firstImageSetup()
lastImageSetup()
let {lineX, lineY} = lineSetup()

const firstImageGrow = gsap.timeline({
    scrollTrigger: {
        trigger: "#section2",
        start: "top bottom",
        end: "top top",
        scrub: true
    }
})
.add('start')
.to('#s1TextContainer', {opacity: 0, y: -500}, "start")
.from('#firstTrail', {attr: {transform: "scale(0) translate(0, 0)"}}, 'start')
.from('#firstInfo', {opacity: 0, x: 500}, 'start')

const imageToLine = gsap.timeline({
    scrollTrigger: {
        trigger: "#section3", 
        start: "top bottom",
        end: "top top",
        scrub: true
    }
})
.add('start')
.to("#firstInfo", {opacity: 0}, 'start')
.to('#firstTrail', {opacity: 0, attr: {transform: `scale(0.6) translate(${lineX(trailInfo.firstTrail[0].CertifiedYear) - w/2 }, ${lineY(1) - h/2})`}}, 'start')


const yearLineAnim = gsap.timeline({
    scrollTrigger: {
        trigger: "#section4",
        start: "top bottom",
        end: "top top",
        scrub: true
    }
})
.add('start')
.from('#yearTrailLine', {drawSVG: 0}, 'start')
.from("#lineXAxis, #lineYAxis", {opacity: 0}, 'start')
.from('.lineLabs', {opacity: 0}, 'start')
.add('second')
.from('#lastTrail', {attr: {transform: `scale(0) `}, opacity: 0}, 'second')
.from('#lastInfo', {y: 100,  opacity: 0}, 'second')

const finishTrailSection = gsap.timeline({
    scrollTrigger: {
        trigger: "#section5",
        start: "top bottom",
        end: "top top", 
        scrub: true
    }
})
.to('svg, #lastInfo', {opacity: 0})
.to('svg, #lastInfo', {y: -h})


var map = L.map('map').setView([51.505, -0.09], 13);

function disableMapZoom(){
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    if (map.tap) map.tap.disable();
}

function enableMapZoom(){
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    if (map.tap) map.tap.enable();
}

disableMapZoom()

// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//     maxZoom: 18
// })

L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
}).addTo(map);

d3.select('.leaflet-control-container').remove()

let cityLayer = null;
let trailLayer = null;
let trailDirectionLayer = null;

let cityIcon = L.icon({
    iconUrl: 'assets/city_icon.png',
    iconSize: [30, 30]
})

let trailIcon = L.icon({
    iconUrl: 'assets/trail_icon.png',
    iconSize: [30, 30]
})

function createMarker(feature, latlng){
    return L.marker(latlng, {icon: trailIcon})
}

function getTopTen(city){
    if(trailLayer){
        map.removeLayer(cityLayer)
        map.removeLayer(trailLayer)
        map.removeLayer(trailDirectionLayer)
    }
    cityLayer = L.marker(
        city.geometry.coordinates.reverse(), 
        {
            icon: cityIcon
        }
    ).addTo(map);

    let tmpTrails = city.properties.closestTrails.features.map(function(x){
        let tmp = new L.marker([x.properties.Y, x.properties.X], {icon: trailIcon}).bindPopup(`<center><b><a href="${x.properties.URLFeatured}" target="_blank">${x.properties.TrailName}</a></b></br><img src=${x.properties.photo} width=100 height=100></img></br><span><b>Distance from City: </b> ${Math.round(x.properties.distance)} miles</span></br><span><b>Length of Trail?: </b> ${x.properties.LengthMile} miles</span></center>`);
        return(tmp) 
    })

    trailLayer = L.layerGroup(
        tmpTrails
    ).addTo(map)

    trailDirectionLayer = L.geoJson(city.properties.closestTrails)
        .setStyle({color: 'forestgreen', weight:10}).addTo(map)

    map.flyToBounds(trailDirectionLayer.getBounds(), {duration: 5})

}

getTopTen(cityInfo.features[0])