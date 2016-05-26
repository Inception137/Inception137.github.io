function selectableForceDirectedGraph() {
    
	var width = 1080,
    height = 900,
    shiftKey, ctrlKey;

    var nodeGraph = null;
    var xScale = d3.scale.linear()
		.domain([0, width]).range([0, width]);
    var yScale = d3.scale.linear()
		.domain([0, height]).range([0, height]);

    var svg = d3.select("#d3_selectable_force_directed_graph")
		.attr("tabindex", 1)
		.on("keydown.brush", keydown)
		.on("keyup.brush", keyup)
		.each(function () { this.focus(); })
		.append("svg")
		.attr("width", width)
		.attr("height", height);

    var zoomer = d3.behavior.zoom()
        .scaleExtent([0.1, 10])
        .x(xScale)
        .y(yScale)
        .on("zoomstart", zoomstart)
        .on("zoom", redraw);

    function zoomstart() {
        node.each(function (d) {
            d.selected = false;
            d.previouslySelected = false;
        });
        node.classed("selected", false);
    }

    function redraw() {
        vis.attr("transform",
                 "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
    }

    var brusher = d3.svg.brush()
		.x(xScale)
		.y(yScale)
		.on("brushstart", function (d) {
			node.each(function (d) {
				d.previouslySelected = shiftKey && d.selected;
			});
		})
		.on("brush", function () {
			var extent = d3.event.target.extent();

			node.classed("selected", function (d) {
				return d.selected = d.previouslySelected ^
				(extent[0][0] <= d.x && d.x < extent[1][0]
				 && extent[0][1] <= d.y && d.y < extent[1][1]);
			});
		})
		.on("brushend", function () {
			d3.event.target.clear();
			d3.select(this).call(d3.event.target);
		});

    var svg_graph = svg.append('svg:g')
		.call(zoomer)

    var rect = svg_graph.append('svg:rect')
		.attr('width', width)
		.attr('height', height)
		.attr('fill', 'transparent')
		.attr('stroke', 'transparent')
		.attr('stroke-width', 1)
		.attr("id", "zrect")

    var brush = svg_graph.append("g")
		.datum(function () { return { selected: false, previouslySelected: false }; })
		.attr("class", "brush");

    var vis = svg_graph.append("svg:g");

    vis.attr('fill', 'white')
		.attr('stroke', 'black')
		.attr('stroke-width', 1)
		.attr('opacity', 0.5)
		.attr('id', 'vis')


    brush.call(brusher)
		.on("mousedown.brush", null)
		.on("touchstart.brush", null)
		.on("touchmove.brush", null)
		.on("touchend.brush", null);

    brush.select('.background').style('cursor', 'auto');
	
	function intersect(graph1, graph2) {
		var outnodes = [];
		var outlinks = [];
		for (i = 0; i < graph1.nodes.length; i++)
			for (j = 0; j < graph2.nodes.length; j++)
				if (graph1.nodes[i].label == graph2.nodes[j].label)
				{	
					outnodes.push(graph1.nodes[i]);
					break;
				}
				
		for (i = 0; i < graph1.links.length; i++)
			for (j = 0; j < graph2.links.length; j++)
				if ((graph1.links[i].source == graph2.links[j].source)&(graph1.links[i].target == graph2.links[j].target))
				{
					outlinks.push(graph1.links[i]);
				}
		var outgraph = {
			nodes: outnodes,
			links: outlinks}
        return (outgraph);	
    }
	
	function union(graph1, graph2) {
		
        var nodes = graph1.nodes.concat(graph2.nodes);
        var links = graph1.links.concat(graph2.links);
		
		var outgraph = {
			nodes: uniqueNodes(nodes),
			links: uniqueLinks(links)}
			
        return (outgraph);
    }
	
	function uniqueNodes(nodes) {
	  var result = [];

	  nextInput:
		for (var i = 0; i < nodes.length; i++) {
		  var str = nodes[i].label; // для каждого элемента
		  for (var j = 0; j < result.length; j++) { // ищем, был ли он уже?
			if (result[j].label == str) continue nextInput; // если да, то следующий
		  }
		  nodes[i].id=result.length;
		  result.push(nodes[i]);
		}

	  return result;
	}
	
	function uniqueLinks(links) {
	  var result = [];

	  nextInput:
		for (var i = 0; i < links.length; i++) {
		  var str1 = links[i].source; // для каждого элемента
		  var str2 = links[i].target;
		  for (var j = 0; j < result.length; j++) { // ищем, был ли он уже?
			if ((result[j].source == str1)&(result[j].target == str2)) continue nextInput; // если да, то следующий
		  }
		  links[i].id=result.length;
		  result.push(links[i]);
		}

	  return result;
	}
	
	//dont work with graph1
	/*function projection(name, graph) {
        var outNodes = [];
        var outLinks = [];
		var node;
		var link;
        for (i = 0; i < graph.nodes.length; i++)
            if (name == graph.nodes[i].label) 
			{
				node=graph.nodes[i];
				node.id=0;
                outNodes.push(node);
                break;
            }

        for (i = 0; i < graph.links.length; i++) {
            if (graph.links[i].target == outNodes[0].label) 
			{
				node=graph.nodes[parseInt(graph.links[i].source)];
				node.id=outNodes.length;
                outNodes.push(node);
				
				link=graph.links[i];
				link.id=outLinks.length;
                outLinks.push(graph.links[i]);
            }

            if (graph.links[i].source == outNodes[0].label) 
			{
				node=graph.nodes[parseInt(graph.links[i].target)];
				node.id=outNodes.length;
				outNodes.push(node);
				
				link=graph.links[i];
				link.id=outLinks.length;
                outLinks.push(graph.links[i]);
            }
        }
		var outgraph = {
			nodes: outNodes,
			links: outLinks}
        return (outgraph);
    }
		
	var projgraph = {
		nodes: projection("0", graph).nodes, 
		links: projection("0", graph).links};*/	
	
	var uniongraph ={
		nodes: union(graph, graph1).nodes, 
		links: union(graph, graph1).links};
	
	var intersectedgraph = {
		nodes: intersect(graph, graph1).nodes, 
		links: intersect(graph, graph1).links};

	DrawGraph(graph1);
	//DrawGraph(graph);
    

    function DrawGraph(graph) {                                     /////////////////////////
	
        function dragended(d) {
            node.filter(function (d) { return d.selected; })
            .each(function (d) { d.fixed &= ~6; })
        }
		
        var link = vis.append("g")
            .attr("class", "link")
            .selectAll("line");

        var node = vis.append("g")
            .attr("class", "node")
            .selectAll("rect");
			
        var text = vis.append("g").selectAll("text")
            .data(graph.nodes)
            .enter()
            .append("text");

        var force = d3.layout.force()
            .charge(-800)
            .linkDistance(100)
            .nodes(graph.nodes)
            .links(graph.links)
            .size([width, height])
            .on("tick", tick);

        function tick() {
            link.attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });

            node.attr('x', function (d) { return Math.round(d.x - (70 / 2)); })
                .attr('y', function (d) { return Math.round(d.y - (30 / 2)); });

            text.attr('x', function (d) { return Math.round(d.x); })
                .attr('y', function (d) { return Math.round(d.y + (20 / 4)); });
        };

        function dragstarted(d) {
            d3.event.sourceEvent.stopPropagation();
            if (!d.selected && !shiftKey) {
                // if this node isn't selected, then we have to unselect every other node
                node.classed("selected", function (p) { return p.selected = p.previouslySelected = false; });
            }

            d3.select(this).classed("selected", function (p) { d.previouslySelected = d.selected; return d.selected = true; });

            node.filter(function (d) { return d.selected; })
				.each(function (d) { d.fixed |= 2; })
        }

        function dragged(d) {
            node.filter(function (d) { return d.selected; })
				.each(function (d) {
					d.x += d3.event.dx;
					d.y += d3.event.dy;

					d.px += d3.event.dx;
					d.py += d3.event.dy;
				})

            force.resume();
        }


        link = link.data(graph.links).enter().append("line")
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        node = node.data(graph.nodes).enter().append("rect")
            .attr("width", 70)
            .attr("height", 30)
            .attr("x", function (d) { return Math.round(d.x - (70 / 2)); })
            .attr("y", function (d) { return Math.round(d.y - (30 / 2)); })
            .on("click", function (d) {
                if (d3.event.defaultPrevented) return;

                if (!shiftKey) {
                    //if the shift key isn't down, unselect everything
                    node.classed("selected", function (p) { return p.selected = p.previouslySelected = false; })
                }

                // always select this node
                d3.select(this).classed("selected", d.selected = !d.previouslySelected);
            })
            .on("dblclick", function (d) { d3.event.stopPropagation(); })
                // Grant atom the power of gravity	
            .call(d3.behavior.drag()
                  .on("dragstart", dragstarted)
                  .on("drag", dragged)
                  .on("dragend", dragended));
        /*node.append("text")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .text(function (d) { return d.label; })
            .style("text-anchor", "middle")
            .style("font-size", "17px")
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill", "black");*/
        var textLabels = text
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("text-anchor", "middle")
            .text(function (d) { return d.label; })
            .attr("font-size", "14px")
            .attr("fill", "black");

        force.start();
    }


    

    
    function keydown() {
        shiftKey = d3.event.shiftKey || d3.event.metaKey;
        ctrlKey = d3.event.ctrlKey;

        console.log('d3.event', d3.event)

        if (d3.event.keyCode == 67) {   //the 'c' key
            center_view();
        }

        if (shiftKey) {
            svg_graph.call(zoomer)
				.on("mousedown.zoom", null)
				.on("touchstart.zoom", null)
				.on("touchmove.zoom", null)
				.on("touchend.zoom", null);                                                                   
            vis.selectAll('g.gnode')
				.on('mousedown.drag', null);

            brush.select('.background').style('cursor', 'crosshair')
            brush.call(brusher);
        }
    }

    function keyup() {
        shiftKey = d3.event.shiftKey || d3.event.metaKey;
        ctrlKey = d3.event.ctrlKey;
        brush.call(brusher)
			.on("mousedown.brush", null)
			.on("touchstart.brush", null)
			.on("touchmove.brush", null)
			.on("touchend.brush", null);

        brush.select('.background').style('cursor', 'auto')
        svg_graph.call(zoomer);
    
    }
}
