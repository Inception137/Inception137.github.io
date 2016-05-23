// JavaScript source code
var sys = arbor.ParticleSystem(1000, 400, 1);
sys.parameters({ gravity: true });
sys.renderer = Renderer("#viewport");

$.getJSON("data.json",
   function (data) {
       $.each(data.nodes, function (i, node) {
           sys.addNode(node.name, {shape: node.shape, color: node.color, label: node.label });
       });

       $.each(data.edges, function (i, edge) {
           sys.addEdge(sys.getNode(edge.src), sys.getNode(edge.dest));
       });
   });
   
  /* $.ajax({
                type: "POST",
                url: "F:/JS Graph/JS/data.json",
                dataType: "json",
                success: function (data) {
                  $.each(data.nodes, function (i, node) {
           sys.addNode(node.name, {shape: node.shape, color: node.color, label: node.label });
       });

       $.each(data.edges, function (i, edge) {
           sys.addEdge(sys.getNode(edge.src), sys.getNode(edge.dest));
       });
                }                
            });*/