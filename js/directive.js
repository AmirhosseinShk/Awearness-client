/**
*   Graph Directive
*
*   Draw & Display graph
*/
myApp.directive('graphDrawing', function() {

    return {
        restrict: 'A',

        link: function (scope, element, attrs) {

            var margin = {top: -10, right: -10, bottom: -10, left: -10};
            var width = 1175 - margin.left - margin.right;
            var height = 400 - margin.top - margin.bottom;

            scope.init();

            // $watch update graph if data in $scope.grapheDatas are modified
            scope.$watch('graphes', function (graphes) {

                graphes = scope.graphes;

                if(graphes != undefined)
                {
                    var force = d3.layout.force()
                        .charge(-300)
                        .linkDistance(100)
                        .friction(0.3)
                        .gravity(0.15)
                        .size([width, height])
                        .nodes(graphes.nodes)
                        .links(graphes.links)
                        .start();

                     //---Insert "Pin Down" -------
                    var node_drag = d3.behavior.drag()
                         .on("dragstart", dragstart)
                         .on("drag", dragmove)
                         .on("dragend", dragend);

                    function dragstart(d, i) {
                        force.stop(); // stops the force auto positioning before you start dragging
                    }

                    function dragmove(d, i) {
                        d.px += d3.event.dx;
                        d.py += d3.event.dy;
                        d.x += d3.event.dx;
                        d.y += d3.event.dy; 
                    }

                    function dragend(d, i) {
                        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
                        force.resume();
                    }

                    function releasenode(d) {
                        d.fixed = false; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
                    }
                    //---End "Pin Down" ------

                    // Remove svg located in tag "attack-graph"
                    d3.selectAll(".attack-graph > svg").remove(); 

                    // Initialize SVG
                    var svg = d3.selectAll(".attack-graph").append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.right + ")")

                    //---Insert "ToolTip"------
                    //Set up tooltip
                    var tip = d3.tip()
                        .attr('class', 'd3-tip')
                        .offset([-10, 0])
                        .html(function (d) { return "Name : " + d.ID +  
                            "<br>" + "Fact : " + d.Fact + 
                            "<br>" + "Metric : " + d.Metric + 
                            "<br>" + "Type : " + d.Type; 
                        });
                        svg.call(tip);
                    //---End "ToolTip"---

                    // Initialize Line (Arc)
                    var link = svg.selectAll(".link")
                        .data(scope.graphes.links)
                        .enter().append("line")
                        .attr("class", "link")
                        .style("marker-end", "url(#suit)"); // Added "Arrow"

                    // Initialize Node (Vertex)
                    var node = svg.selectAll(".node")
                        .data(scope.graphes.nodes)
                        .enter().append("circle")
                        .attr("class", "node")
                        .attr("r", 10)
                        .style("fill", function(d) { return d.Color; })
                        .call(force.drag)
                        .call(node_drag)                        // Added "Pin Down"
                        .on('mouseover', tip.show)              // Added "ToolTip"
                        .on('mouseout', tip.hide);              // Added "ToolTip"

                    force.on("tick", function() {
                        link.attr("x1", function(d) { return d.source.x; })
                        .attr("y1", function(d) { return d.source.y; })
                        .attr("x2", function(d) { return d.target.x; })
                        .attr("y2", function(d) { return d.target.y; });

                    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

                    //---Arrow-------
                    svg.append("defs").selectAll("marker")
                        .data(["suit", "licensing", "resolved"])
                        .enter().append("marker")
                        .attr("id", function(d) { return d; })
                        .attr("viewBox", "0 -5 10 10")
                        .attr("refX", 25)
                        .attr("refY", 0)
                        .attr("markerWidth", 8)
                        .attr("markerHeight", 8)
                        .attr("orient", "auto")
                        .append("path")
                        .attr("d", "M0,-5L10,0L0,5 L10,0 L0, -5")
                        .style("stroke", "#4679BD")
                        .style("opacity", "0.5");
                    //---End Arrow----------
                 });
                }
            });
        }
    }
});

/**
*   Topological Attack Graph Directive
*
*   Draw & Display Topological Graph
*/
myApp.directive('graphTopoDrawing', function() {

    return {
        restrict: 'A',
        
        link: function (scope, element) {

            var margin = {top: -10, right: -10, bottom: -10, left: -10};
            var width = 1100 - margin.left - margin.right;
            var height = 400 - margin.top - margin.bottom;

            var color = d3.scale.category20();

            scope.init();

            // $watch update graph if data in $scope.grapheDatas are modified
            scope.$watch('graphes', function (graphes) {

                graphes = scope.graphes;

                if(graphes != undefined)
                {
                    var force = d3.layout.force()
                        .charge(-400)
                        .linkDistance(200)
                        .friction(0.4)
                        .gravity(0.05)
                        .size([width, height])
                        .nodes(graphes.nodes)
                        .links(graphes.links)
                        .start();

                    //---Insert "Pin Down" -------
                    var node_drag = d3.behavior.drag()
                         .on("dragstart", dragstart)
                         .on("drag", dragmove)
                         .on("dragend", dragend);

                    function dragstart(d, i) {
                        force.stop(); // stops the force auto positioning before you start dragging
                    }

                    function dragmove(d, i) {
                        d.px += d3.event.dx;
                        d.py += d3.event.dy;
                        d.x += d3.event.dx;
                        d.y += d3.event.dy; 
                     }

                    function dragend(d, i) {
                        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
                        force.resume();
                    }

                    function releasenode(d) {
                        d.fixed = false; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
                        force.resume();
                    }
                    //---End "Pin Down" ------

                    // Remove svg presents in tag "attack-graph"
                    d3.selectAll(".attack-graph > svg").remove(); 

                    // Initialize SVG
                    var svg = d3.select(".attack-graph").append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.right + ")")

                    //---Insert "ToolTip"------
                    // Set up tooltip
                    var tip = d3.tip()
                        .attr('class', 'd3-tip')
                        .offset([-10, 0])
                        .html(function (d) { return "Name : " + d.Name + 
                                                "<br />" + "IP : " + d.IP;
                                            });
                        svg.call(tip);
                    //---End "ToolTip"---

                    // Initialize Line (Arc)
                    var link = svg.selectAll(".link")
                        .data(scope.graphes.links)
                        .enter().append("line")
                        .attr("class", "link")
                        .style("marker-end", "url(#suit)"); // Added "Arrow"

                    // Initialize Node (Vertex)
                    var node = svg.selectAll(".node")
                        .data(scope.graphes.nodes)
                        .enter().append("g")
                        .attr("class", "node")
                        .attr("r", 10)
                        .style("fill", function(d) { return color(d.Type); })    // {return "red"; }) 
                        .call(force.drag)
                        .call(node_drag)                       // Added "Pin Down"
                        .on('mouseover', tip.show)              // Added "ToolTip"
                        .on('mouseout', tip.hide);              // Added "ToolTip"
                    
                    // Path for pictures
                    var picturePath = {
                        "0" : "img/target.png",
                        "1" : "img/pirate.png",
                        "2" : "img/computer-down.png",
                        "3" : "img/computer.png",
                        "4" : "img/network.png",
                        "5" : "img/help.png"
                    };
                    
                    // Display "Icone"      
                    node.append("image")
                        .attr("xlink:href", function(d){ return picturePath[d.Icone] })
                        .attr("x", -8)
                        .attr("y", -8)
                        .attr("width", 30)
                        .attr("height", 30);
                    
                    // Display "Name"
                    node.append("text")
                        .attr("x", 30)
                        .attr("dy", ".35em")
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "25px")
                        .attr("font-weight", "bold")
                        .attr("fill", "grey")
                        .text(function(d){ return d.Name; });
                        
                    force.on("tick", function() {
                        link.attr("x1", function(d) { return d.source.x; })
                        .attr("y1", function(d) { return d.source.y; })
                        .attr("x2", function(d) { return d.target.x; })
                        .attr("y2", function(d) { return d.target.y; });

                    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

                    //---Arrow-------
                    svg.append("defs").selectAll("marker")
                        .data(["suit", "licensing", "resolved"])
                        .enter().append("marker")
                        .attr("id", function(d) { return d; })
                        .attr("viewBox", "0 -5 10 10")
                        .attr("refX", 25)
                        .attr("refY", 0)
                        .attr("markerWidth", 8)
                        .attr("markerHeight", 8)
                        .attr("orient", "auto")
                        .append("path")
                        .attr("d", "M0,-5L10,0L0,5 L10,0 L0, -5")
                        .style("stroke", "#4679BD")
                        .style("opacity", "0.5");
                    //---End Arrow----------
                 });
                }
            });
        }
    }
});

// **************************************************************

/**
*   Configuration Directive
*/
myApp.directive('configurationDrawing', function() {

    return {
        restrict: 'A',
        
        link: function (scope, element) {

            scope.init();
        }
    }
});


/**
*   ExcelSheet Drawing
*/
myApp.directive('ngRightClick', function($parse) {
  return function(scope, element, attrs) {
    var fn = $parse(attrs.ngRightClick);
    element.bind('contextmenu', function(event) {
      scope.$apply(function() {
        event.preventDefault();
        fn(scope, {
          $event: event
        });
      });
    });
  };
});


/**
*   Export Table as CSV
*/
myApp.directive('exportToCsv',function(){
  	return {
    	restrict: 'A',
    	link: function (scope, element, attrs) {
    		var el = element[0];
	        element.bind('click', function(e){
	        var table = e.target.nextElementSibling;
	        var csvString = '';
	        for(var i=0; i<table.rows.length;i++){
	        	var rowData = table.rows[i].cells;
	        for(var j=0; j<rowData.length;j++){
	        	csvString = csvString + rowData[j].innerHTML + ",";
	        }
	        csvString = csvString.substring(0,csvString.length - 1);
        	csvString = csvString + "\n";
	        }
         	csvString = csvString.substring(0, csvString.length - 1);
         	var a = $('<a/>', {
	            style:'display:none',
	            href:'data:application/octet-stream;base64,'+btoa(csvString),
	            download:'emailStatistics.csv'
	        }).appendTo('body')
	        a[0].click()
	        a.remove();
        });
   }
   }
});



