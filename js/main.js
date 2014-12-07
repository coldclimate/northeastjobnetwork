
var arrData =
[
    {
    	'name': 'Oli Wood',
        'companies': [
            'Sage',
            'CANDDi',
            'Memory Merge',
            'Wishli.st',
            'bGroup',
            'Accenture'
        ],
    },
    {
        'companies': [
            'CustomerSure',
            'bDaily',
            'bGroup'
        ],
        'name': 'Chris Stainthorpe'
    },
    {
        'companies': [
            'Freelance',
            'Memory Merge',
            'Creative Nucleus',
            'Reflections Interactive'
        ],
        'name': 'James Rutherford'
    },
    {
        'companies': [
            'Sage',
            'Newcastle University',
            'Leighton',
            'Freelance'
        ],
        'name': 'Alex Reid'
    },
    {
        'companies': [
            'Newcastle University',
            'CANDDi',
            'Spontly'
        ],
        'name': 'Steve Jenkins'
    },
    {
        'companies': [
            'Leighton',
            'Papertrail.io'
        ],
        'name': 'Robert Walker'
    },
    {
        'companies': [
            'Spontly',
            'Orange Bus',
            'Piranha Studios',
            'Sage'
        ],
        'name': 'Tom Dancer'
    }
];

// Helper functions


// Hex colours from names: https://stackoverflow.com/questions/11120840/hash-string-into-rgb-c

function djb2(str){
  var hash = 5381;
  for (var i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
  }
  return hash;
}

function hashStringToColor(str) {
  var hash = djb2(str);
  var r = (hash & 0xFF0000) >> 16;
  var g = (hash & 0x00FF00) >> 8;
  var b = hash & 0x0000FF;
  return "#" + ("0" + r.toString(16)).substr(-2) + ("0" + g.toString(16)).substr(-2) + ("0" + b.toString(16)).substr(-2);
}




var links = [];
var arrCharacters=[];

arrData.forEach(function(set){
  var intLength = set.companies.length;
  arrCharacters.push(set.name);
  set.cleanName = set.name.toLowerCase().replace(/\W/g, '');
  set.colour = hashStringToColor(set.cleanName);
  for (var i = 0; i < intLength-1; i++) {
   objLink = {
    source : set.companies[i],
    target : set.companies[i+1],
    type : set.cleanName,
    colour : set.colour
   };
   links.push(objLink);
}

});

var nodes = {};

// Compute the distinct nodes from the links.
links.forEach(function(link) {
  link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
  link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
});

var width = window.innerWidth,
    height = window.innerHeight;

var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([width, height])
    .linkDistance(60)
    .charge(-0.001*(window.innerHeight*window.innerWidth))
    .on("tick", tick)
    .start();

var svg = d3.select("#hook").append("svg")
    .attr("width", width)
    .attr("height", height);


// Per-type markers, as they don't inherit styles.
svg.append("defs").selectAll("marker")
    .data(arrCharacters)
  .enter().append("marker")
    .attr("id", function(d) { return d; })
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
  .append("path")
    .attr("d", "M0,-5L10,0L0,5");

var path = svg.append("g").selectAll("path")
    .data(force.links())
    .enter().append("path")
    .attr("style", function(d) { return "fill: " + d.colour +";"; })
    .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

var circle = svg.append("g").selectAll("circle")
    .data(force.nodes())
  .enter().append("circle")
    .attr("r", 6)
    .call(force.drag);

var text = svg.append("g").selectAll("text")
    .data(force.nodes())
  .enter().append("text")
    .attr("x", 8)
    .attr("y", ".31em")
    .text(function(d) { return d.name; });

// Use elliptical arc path segments to doubly-encode directionality.
function tick() {
  path.attr("d", linkArc);
  circle.attr("transform", transform);
  text.attr("transform", transform);
}

function linkArc(d) {
  var dx = d.target.x - d.source.x,
      dy = d.target.y - d.source.y,
      dr = Math.sqrt(dx * dx + dy * dy);
  return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
}

function transform(d) {
  return "translate(" + d.x + "," + d.y + ")";
}

var legend = svg.append("g")
    .attr("class", "legend")
    .attr("x", window.innerWidth - 65)
    .attr("y", 25)
    .attr("height", 100)
    .attr("width", 100);

  legend.selectAll('g').data(arrData)
      .enter()
      .append('g')
      .each(function(d, i) {
        var g = d3.select(this);
        g.append("rect")
          .attr("x", 10)
          .attr("y", i*25)
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", arrData[i].colour);
        
        g.append("text")
          .attr("x", 30)
          .attr("y", i * 25 + 8)
          .attr("height",30)
          .attr("width",100)
          .style("fill", arrData[i].colour)
          .text(arrData[i].name);

      });
