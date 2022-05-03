let vid = document.getElementById("titleVideo");
vid.playbackRate = 0.5;

function getDim(){
    let {width, height} = d3.select('#titleCard').node().getBoundingClientRect()
    return {w: width, h: height, m: {t: height/5, r: width/6, b: height/6, l: width/6}}
}

let {w, h, m} = getDim()

let svg = d3.select('#mainSVG').attr('width', w).attr('height', h)

function lineSetup(){
    let linechart = svg
        .append('g')
        .attr('id', 'yearCountLine')
    
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