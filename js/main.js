
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
    },
    {
        'companies': [
            'Tombola',
            'Azure Design',
            'Newcastle University'
        ],
        'name': 'Graeme Tait'
    },
    {
        'companies': [
            'Now Native',
            'Matchchat',
            'Freelance',
            'Usable HQ',
            'Enigma Interactive'  
        ],
        'name': 'Phil Hayton'
    },
    {
        'companies': [
            'Northumbria University',
            'Freelance',
            'Usable HQ',
            'Beaumont Colson Ltd'  
        ],
        'name': 'Alistair MacDonald'
    },
    {
        'companies': [
            'Baryll Blue',
            'Highford Solutions',
            'Freelance',
            'Usable HQ',
            'Indigo Multimedia',
            'Coolblue'
        ],
        'name': 'Chris Neale'
    },
    {
        'companies': [
            'Orange Bus',
            'Gospelware',
            'Blooie'
        ],
        'name': 'Jonathan Steele'
    },
    {
        'name': 'Marc Qualie',
        'companies': [
            'Givey',
            'PHG'
        ]
    },
    {
        'companies': [
            'Little Riot'
        ],
        'name': 'Joanna Montgomery'
    },
    {
<<<<<<< HEAD
        'name': 'Scott Robertson',
        'companies': [
            'PHG',
            'CANDDi',
            'RiffRaff'
    ]},{
        'name': 'Martin Bean',
        'companies': [
            'FUSEBOXDESIGN',
            'dpivision.com',
            'Bede Gaming',
            'Freelance'
        ]
    },{

        'companies': [
            'Azure Design',
            'Daykin and Storey',
            'Freelance',        
            'Newcastle University'
        ],
        'name': 'Alex Graham'
    }
];

// Hex colours from names: https://stackoverflow.com/questions/11120840/hash-string-into-rgb-c
var HashUtils = {
    djb2: function(str){
      var hash = 5381;
      for (var i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
      }
      return hash;
    },
    hashStringToColor: function(str) {
      var hash = this.djb2(str);
      var r = (hash & 0xFF0000) >> 16;
      var g = (hash & 0x00FF00) >> 8;
      var b = hash & 0x0000FF;
      return "#" + ("0" + r.toString(16)).substr(-2) + ("0" + g.toString(16)).substr(-2) + ("0" + b.toString(16)).substr(-2);
    }
};

/**
*   Generates Dataset for use with layour
*/
var DataSet = function(data,hu){
    this.hu = hu;
    this.people = [];
    this.links = [];
    this.nodes = [];
    //origal functions side effect like this consider altering
    this.generateLinks(data);
    this.populateLinks();
};

DataSet.prototype.generateLinks = function(data){
    var self = this;
    data.forEach(function(set){
        var intLength = set.companies.length;
        self.people.push(set.name);
        set.cleanName = set.name.toLowerCase().replace(/\W/g, '');
        set.colour = self.hu.hashStringToColor(set.cleanName);
        for (var i = 0; i < intLength-1; i++) {
            self.links.push({
                source : set.companies[i],
                target : set.companies[i+1],
                type : set.cleanName,
                colour : set.colour
            });
        }
    });
};

DataSet.prototype.populateLinks = function(){
    var self = this;
    // Compute the distinct nodes from the links.
    this.links.forEach(function(link) {
      link.source = self.nodes[link.source] || (self.nodes[link.source] = {name: link.source});
      link.target = self.nodes[link.target] || (self.nodes[link.target] = {name: link.target});
    });
};

/**
*   Manages layout of stuff
*/
var GraphLayout = function(d3,target,width,height,ds){
    this.ds = ds;
    this.d3 = d3;
    this.height = height;
    this.width = width;
    
    this.svg = this.d3.select(target).append("svg")
        .attr("width", width)
        .attr("height", height);

    this.force = this.d3.layout.force()
        .nodes(this.d3.values(ds.nodes))
        .links(ds.links)
        .size([width, height])
        .linkDistance(60)
        .charge(-0.001*(height*width));

    //setup components
    this.legend = this.genLegend();
    this.marker = this.genMarker();
    this.path = this.genPath();
    this.circle = this.genCircle();
    this.text = this.genText();

    //run after everting is setup removing possible race condition
    var self = this;
    this.force.on("tick", function(){
        //scoping is fun
        self.tick();
    }).start();
};


GraphLayout.prototype.tick = function(){
    var linkArc = function(d) {
        var dx = d.target.x - d.source.x;
        var dy = d.target.y - d.source.y;
        var dr = Math.sqrt(dx * dx + dy * dy);
        var r = "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
        return r;
    };
    this.path.attr("d",linkArc);
    var transform = function(d) {
        return "translate(" + d.x + "," + d.y + ")";
    }
    this.circle.attr("transform", transform);
    this.text.attr("transform", transform);
};

GraphLayout.prototype.genCircle = function(){
    return this.svg.append("g").selectAll("circle")
        .data(this.force.nodes())
        .enter().append("circle")
        .attr("r", 6)
        .call(this.force.drag);
};

GraphLayout.prototype.genText = function(){
    return this.svg.append("g").selectAll("text")
        .data(this.force.nodes())
        .enter().append("text")
        .attr("x", 8)
        .attr("y", ".31em")
        .text(function(d) { return d.name; });
};

GraphLayout.prototype.genLegend = function(){
    var self = this;
    var legend = this.svg.append("g")
        .attr("class", "legend")
        .attr("x", this.width - 65)
        .attr("y", 25)
        .attr("height", 100)
        .attr("width", 100);
    //populate legend with data
    legend.selectAll('g').data(arrData)
        .enter()
        .append('g')
        .each(function(d, i) {
            var g = self.d3.select(this);
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
    return legend;
};

GraphLayout.prototype.genPath = function(){
    return this.svg.append("g").selectAll("path")
        .data(this.force.links())
        .enter().append("path")
        .attr("style", function(d) { return "fill: " + d.colour +";"; })
        .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });
};

GraphLayout.prototype.genMarker = function(){
    // Per-type markers, as they don't inherit styles.
    return this.svg.append("defs").selectAll("marker")
        .data(this.ds.people)
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
};

//startup
var dataset = new DataSet(arrData,HashUtils);
window.currentlayout = new GraphLayout(d3,"#hook",window.innerWidth,window.innerHeight,dataset);
