console.debug("test.js");

import GraphSrc from "../src/index";
import GraphRoot from "..";
import GraphProd from "../dist/owp.graph.min";
import GraphDev from "../dist/owp.graph";

//Check that all 4 different imports work
isGraph(GraphSrc);
isGraph(GraphRoot);
isGraph(GraphProd);
isGraph(GraphDev);

//Check so that root/package.json point to the minified prod file
isSame(GraphRoot, GraphProd);

function isGraph(graph) {
    if (typeof graph !== "function" || typeof graph.createDummyData !== "function") {
        console.error("Is not graph constructor", graph);
    }
}

function isSame(graph1, graph2) {
    if (graph1 !== graph2) {
        console.error("Is not same constructor", graph1, graph2);
    }
}