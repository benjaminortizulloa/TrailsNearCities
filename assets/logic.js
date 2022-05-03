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
        .call(d3.axisBottom(lineX))
    
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

    return {lineY, lineX}
}

let {lineX, lineY} = lineSetup()

const yearLineAnim = gsap.timeline({
    scrollTrigger: {
        trigger: "#section1",
        start: "top bottom",
        end: "top top",
        scrub: true
    }
})
.from('#yearTrailLine', {drawSVG: 0})

function firstSetup(){
    
}
let imgFirst = svg
    .append('g')
    .attr('id', 'firstTrail')

imgFirst.append('clipPath')
    .attr('id', 'firstClip')
    .append('circle')
    .attr('r', 250)
    .attr('cx', w/2 )
    .attr('cy', h/2 )

imgFirst.append('circle')
    .attr('id', 'firstBackground')
    .attr('r', 250)
    .attr('cx', w/2 )
    .attr('cy', h/2 )

imgFirst.append('image')
    // .style('transform-box', 'fill-box')
    // .attr('transform-origin', "center")
    .attr('id', 'firstImage')
    .attr('href', trailInfo.firstTrail[0].photo)
    .attr('width', 500)
    .attr('height', 500)
    .attr('x', w/2 - 250)
    .attr('y', h/2  - 250)
    .attr('clip-path', 'url(#firstClip)')