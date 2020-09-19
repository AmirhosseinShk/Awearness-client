/**
*
* @licstart  The following is the entire license notice for the
*  JavaScript code in this page.
*
* This file is part of FIWARE CyberCAPTOR,
* instance of FIWARE Cyber Security Generic Enabler
* Copyright (C) 2012-2015  Thales Services S.A.S.,
* 20-22 rue Grande Dame Rose 78140 VELIZY-VILACOUBLAY FRANCE
*
* FIWARE CyberCAPTOR is free software; you can redistribute
* it and/or modify it under the terms of the GNU General Public License
* as published by the Free Software Foundation; either version 3 of the License,
* or (at your option) any later version.
*
* FIWARE CyberCAPTOR is distributed in the hope
* that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
* warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with FIWARE CyberCAPTOR.
* If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this page.
*
*/

/**
*   Graph Transformer
*   @param data
*
*   Converts the attack_graph from MulVAL in an appropriate (clean) format
*/
function transformGraph(data) {
    var sizeLinks;
    var arrayNodesID = [];
    var indexMatchTable = [];
    var incrMatchTable = 0;
    var i, target, source;

    var graphAttackDatas = {
        links : [],
        nodes : []
    };

    // Sort function
    Array.prototype.sortOn = function(key){
        this.sort(function(a, b){
            if(a[key] < b[key]){
                return -1;
            }else if(a[key] > b[key]){
                return 1;
            }
            return 0;
        });
    };

    // Retrieve sizes
    sizeLinks = data.attack_graph.arcs.arc.length;

    // Matches our members with members of the links parameter
    for(i=0; i < sizeLinks; ++i){
        target = data.attack_graph.arcs.arc[i].dst;
        source = data.attack_graph.arcs.arc[i].src;

        if(indexMatchTable[target] == null) {
            arrayNodesID.push(target);
            indexMatchTable[target]=incrMatchTable;
            incrMatchTable += 1;
        }
        if(indexMatchTable[source] == null) {
            arrayNodesID.push(source);
            indexMatchTable[source]=incrMatchTable;
            incrMatchTable += 1;
        }
    }

    // Fills nodes with informations from our data
    for(i=0; i < arrayNodesID.length; ++i) {
        for(var y=0; y<arrayNodesID.length; ++y){
             if(data.attack_graph.vertices.vertex[y].id == arrayNodesID[i]){
                var nodeAttackGraph = data.attack_graph.vertices.vertex[y];
                var corrected = "green";
                var color;

                var test = nodeAttackGraph.fact.indexOf("vulExist");
                if(nodeAttackGraph.type == "LEAF" && test != 0){
                    color = "orange";
                }
                else if(nodeAttackGraph.type == "LEAF" && test == 0){
                    color = "red";
                }
                else if(nodeAttackGraph.type == "AND"){
                    color = "blue";
                }
                else if(nodeAttackGraph.type == "OR"){
                    color = "lightblue";
                }

                var nodeToAdd = {"ID" : nodeAttackGraph.id, "Fact" : nodeAttackGraph.fact, "Metric" : nodeAttackGraph.metric, "Type" : nodeAttackGraph.type, "Corrected": corrected, "Color": color};
                graphAttackDatas.nodes.push(nodeToAdd);
             }
         }
     }

    // Fills links with informations from our data
    for(i=0; i < sizeLinks; ++i){
        target = data.attack_graph.arcs.arc[i].dst;
        source = data.attack_graph.arcs.arc[i].src;

        var link = {source: indexMatchTable[source], target: indexMatchTable[target]};
        graphAttackDatas.links.push(link);
    }

     graphAttackDatas.nodes.sortOn("ID");

    return graphAttackDatas;
}

// **************************************************
/**
*   Path Transformer
*   @param data
*   @param attackGraphData
*   @param $scope
*
*   Converts the attack path from MulVAL in an appropriate (clean) format
*/
function transformPath(data, attackGraphData, $scope){
    var scoring = 0, color, text;
    var sizeLinks;
    var arrayNodesID = [];
    var indexMatchTable = [];
    var incrMatchTable = 0;
    var i, target, source;

     var attackPathDatas = {
        links : [],
        nodes : [],
        scoring: scoring,
        color: undefined,
        text: undefined
    };

    // Retrieve sizes
    sizeLinks = data.attack_path.arcs.arc.length;

    // Matches our members with members of the links parameter
    for(i=0; i < sizeLinks; ++i){
        target = data.attack_path.arcs.arc[i].dst;
        source = data.attack_path.arcs.arc[i].src;

        if(indexMatchTable[target] == null) {
            arrayNodesID.push(target);
            indexMatchTable[target]=incrMatchTable;
            incrMatchTable += 1;
        }
        if(indexMatchTable[source] == null) {
            arrayNodesID.push(source);
            indexMatchTable[source]=incrMatchTable;
            incrMatchTable += 1;
        }
    }

    for(i=0; i < arrayNodesID.length; ++i){
        var nodeAttackGraph = attackGraphData.nodes[arrayNodesID[i]-1];
        var nodeToAdd = {"ID":nodeAttackGraph["ID"], "Fact":nodeAttackGraph["Fact"], "Metric":nodeAttackGraph["Metric"], "Type":nodeAttackGraph["Type"], "Corrected":nodeAttackGraph["Corrected"], Color:nodeAttackGraph["Color"]};
        attackPathDatas.nodes.push(nodeToAdd);
    }

    // Matches our members with members of the links parameter
    for(i=0; i < sizeLinks; ++i){
        target = data.attack_path.arcs.arc[i].dst;
        source = data.attack_path.arcs.arc[i].src;

        var link = {source: indexMatchTable[source], target: indexMatchTable[target]};
        attackPathDatas.links.push(link);
    }

    // Limit the score max at 1
    if(data.attack_path.scoring > 1) {
        data.attack_path.scoring = 1
    }

    attackPathDatas.scoring = data.attack_path.scoring;

    var attritionLevel = transformScoring(attackPathDatas.scoring);

    attackPathDatas.text = attritionLevel.text;
    attackPathDatas.color = attritionLevel.color;

    return attackPathDatas;
}


// **************************************************
/**
*   Score Transformer
*   @param data
*
*   Return the appropriate text and color for the gauge
*/
function transformScoring(data){
    var tabText = ["Negligible", "Minor", "Medium", "Severe", "Catastrophic"];
    var tabColor = ["green", "yellow", "orange", "red", "black"];
    var array = {
        text: "default",
        color: "black"
    };

    // For different values of data, fix text and color
    if(data < 0.2){
        array.text = tabText[0];
        array.color = tabColor[0];
    }
    else if(data >= 0.2 && data < 0.4){
        array.text = tabText[1];
        array.color = tabColor[1];
    }
    else if(data >= 0.4 && data < 0.6){
        array.text = tabText[2];
        array.color = tabColor[2];
    }
    else if(data >= 0.6 && data < 0.8){
        array.text = tabText[3];
        array.color = tabColor[3];
    }
    else if(data >= 0.8 && data <= 1){
        array.text = tabText[4];
        array.color = tabColor[4];
    }
    else if(data > 1){
        array.text = tabText[4];
        array.color = tabColor[4];
    }

    return array;
}


// **************************************************
/**
*   Remediation Transformer
*   @param data
*
*   Converts remediations from MulVAL in an appropriate (clean) format.
*   Browses the JSON object from server and built another more appropriate
*       to work.
*/
function transformRemediation(data){
    var remediations = [];
    var i, DeployReme, rule_patch = [], action_object = {}, action;

    var sizeTab = data.remediations.remediation.length;

    for(i=0; i < sizeTab; ++i){

        var habits = data.remediations.remediation[i].habit_index;
        var cost = data.remediations.remediation[i].cost;
        var id = i;

        var size = data.remediations.remediation[i].remediation_actions.deployable_remediation.length;
        DeployReme = [];

        // If deployable_remediation is an object
        if(size == undefined){
            var deployable_remediation = data.remediations.remediation[i].remediation_actions.deployable_remediation;
            action = deployable_remediation.action;

            action_object["type"] = action.type;
            action_object["machine"] = deployable_remediation.machine;

            //For "Patchs"
            if(action.type == "patch"){
                var patchs = [];
                var sizePatchs = action.patchs.length;

                if(sizePatchs == undefined){
                    rule_patch.push(action.patchs.patch);

                    action_object["action"] = rule_patch;
                    action_object["label"] = "Link";
                }
                else{
                    patchs.push(action.patchs.patch);

                    action_object["action"] = patchs;
                    action_object["label"] = "Link";
                    }
                }
                //For "Snort-Rules"
                else if(action.type == "snort-rules"){
                    var sizeRule = action.rules.rule.length;

                    if(sizeRule == undefined){
                        rule_patch = action.rules.rule;

                        action_object["action"] = rule_patch;
                        action_object["label"] = "Rule";
                    }
                    else{
                        rule_patch = action.rules.rule;

                        action_object["action"] = rule_patch;
                        action_object["label"] = "Rule";
                    }
            }
            DeployReme.push(action_object);
        }
        // Deployable_Remediation => Array
        else {
            var sizeDepRem = data.remediations.remediation[i].remediation_actions.deployable_remediation.length;

            for(var a=0; a<sizeDepRem; ++a){

                action_object = {};

                action = data.remediations.remediation[i].remediation_actions.deployable_remediation[a].action;
                var host = data.remediations.remediation[i].remediation_actions.deployable_remediation[a].machine;

                action_object["type"] = action.type;
                action_object["machine"] = host;

                // For "Firewall-Rule"
                if(action.type === "firewall-rule"){
                    var firewall_rule = [].push(action.rule);
                    rule_patch.push(firewall_rule);

                    action_object["label"] = "Firewall-Rule";
                    action_object["action"] = firewall_rule;

                    DeployReme.push(action_object);
                }
                // For "Patch"
                else if(action.type === "patch"){
                    action_object["label"] = "Link";
                    action_object["action"] = [].push(action.patchs.patch);

                    DeployReme.push(action_object);
                 }
            }
        }

        var remediation = {Habits: habits, Cost: cost, ID: id, DeployReme: DeployReme};

        remediations.push(remediation);
    }

    // Bubble Sort
    var swap = true;
    while((sizeTab > 0) && (swap == true)){
        swap = false;
        for(i=0; i < sizeTab-1; ++i){
            if(remediations[i].Habits < remediations[i+1].Habits){
                var tmp1 = remediations[i];
                remediations[i] = remediations[i+1];
                remediations[i+1] = tmp1;
                swap = true;
            }
        }
    }

    return remediations;
}


// **************************************************
/**
*   Topological Attack Path Transformer
*   @param data
*
*   Converts remediations from MulVAL in an appropriate (clean) format.
*   Browses the JSON object from server and built another more appropriate
*       to work.
*/

function transformPathTopo(data){
    var label;
    var sizeLinks;
    var arrayNodesID = [];
    var indexMatchTable = [];
    var incrMatchTable = 0;
    var i, icone;

    var attackPathDatas = {
        links : [],
        nodes : []
    };

    // Retrieve sizes
    sizeLinks = data.arcs.arc.length;

    // Matches our members with members of the links parameter
    for(i=0; i < sizeLinks; ++i)
    {
        var target = data.arcs.arc[i].dst;
        var source = data.arcs.arc[i].src;
        label = data.arcs.arc[i].label;

        if(indexMatchTable[source] == null) {
            arrayNodesID.push(source);
            indexMatchTable[source]=incrMatchTable;
            incrMatchTable += 1;
        }
        if(indexMatchTable[target] == null) {
            arrayNodesID.push(target);
            indexMatchTable[target]=incrMatchTable;
            incrMatchTable += 1;
        }
    }

    for(i=0; i < arrayNodesID.length; ++i) {

        var nodeAttackGraph = data.vertices.vertex[arrayNodesID[i]];

        if(data.vertices.vertex[i].target){
            icone = 0;
        }
        else if(data.vertices.vertex[i].source_of_attack){
            icone = 1;
        }
        else if(data.vertices.vertex[i].compromised){
            icone = 2;
        }

        attackPathDatas.nodes.push({
            "ID": nodeAttackGraph["id"],
            "Name": nodeAttackGraph["name"],
            "Type": nodeAttackGraph["type"],
            "Icone": icone,
            "Source": nodeAttackGraph["source_of_attack"],
            "Target": nodeAttackGraph["target"],
            "IP": nodeAttackGraph["ip_addresses"]
        });
    }

    // Matches our members with members of the links parameter
    for(i=0; i < sizeLinks; ++i)
    {
        var link = {source: data.arcs.arc[i].src, target: data.arcs.arc[i].dst, label: data.arcs.arc[i].label};
        attackPathDatas.links.push(link);
    }

   return attackPathDatas;
}

// **************************************************

/**
*   Topological Attack Graph Transformer
*   @param data
*
*   Converts remediations from MulVAL in an appropriate (clean) format.
*   Browses the JSON object from server and built another more appropriate
*       to work.
*/

function transformGraphTopo(data){
    var sizeLinks;
    var arrayNodesID = [];
    var indexMatchTable = [];
    var incrMatchTable = [];
    var i, icone, source, target;

    var attackGraphDatas = {
        links : [],
        nodes : []
    };

    // Retrieve sizes
    sizeLinks = data.arcs.arc.length;

    // Matches our members with members of the links parameter
    for(i=0; i < sizeLinks; ++i)
    {
        target = data.arcs.arc[i].dst;
        source = data.arcs.arc[i].src;

        if(indexMatchTable[target] == null) {
            arrayNodesID.push(target);
            indexMatchTable[target]=incrMatchTable;
            incrMatchTable += 1;
        }
        if(indexMatchTable[source] == null) {
            arrayNodesID.push(source);
            indexMatchTable[source]=incrMatchTable;
            incrMatchTable += 1;
        }
    }

    for(i=0; i < arrayNodesID.length; ++i) {

        var nodeAttackGraph = data.vertices.vertex[arrayNodesID[i]];

        if(data.vertices.vertex[i].target){
            icone = 0;
        }
        else if(data.vertices.vertex[i].source_of_attack){
            icone = 1;
        }
        else if(data.vertices.vertex[i].compromised){
            icone = 2;
        }

        attackGraphDatas.nodes.push({
            "ID": nodeAttackGraph["id"],
            "Name": nodeAttackGraph["name"],
            "Type": nodeAttackGraph["type"],
            "IP": nodeAttackGraph["ip_addresses"],
            "Icone": icone
        });
    }

    // Matches our members with members of the links parameter
    for(i=0; i < sizeLinks; ++i)
    {
        target = data.arcs.arc[i].dst;
        source = data.arcs.arc[i].src;

        // var link = {source: indexMatchTable[source], target: indexMatchTable[target], label: label};
        var link = {source: source, target: target, label: data.arcs.arc[i].label};
        attackGraphDatas.links.push(link);
    }

   return attackGraphDatas;
}


// **************************************************

/**
*   Topological Attack Graph Transformer for Dynamic Risk Analysis
*   @param data
*   @param alert
*
*   Converts remediations from MulVAL in an appropriate (clean) format.
*   Browses the JSON object from server and built another more appropriate
*       to work.
*/

function transformGraphTopoDRA(data, alert){
    var sizeLinks;
    var arrayNodesID = [];
    var indexMatchTable = [];
    var incrMatchTable = [];
    var i, y, target, source;

    var attacked = "red";
    var opacity = 1;
    var size = 15;
    var lineWidth = 2.5;

    var attackGraphDatas = {
        links : [],
        nodes : []
    };

    // Retrieve sizes
    sizeLinks = data.arcs.arc.length;

    // Matches our members with members of the links parameter
    for(i=0; i < sizeLinks; ++i){
        target = data.arcs.arc[i].dst;
        source = data.arcs.arc[i].src;

        if(indexMatchTable[target] == null){
            arrayNodesID.push(target);
            indexMatchTable[target]=incrMatchTable;
            incrMatchTable += 1;
        }
        if(indexMatchTable[source] == null){
            arrayNodesID.push(source);
            indexMatchTable[source]=incrMatchTable;
            incrMatchTable += 1;
        }
    }

    for(i=0; i < arrayNodesID.length; ++i){
        var nodeAttackGraph = data.vertices.vertex[arrayNodesID[i]];

        var nodeToAdd = {"ID":nodeAttackGraph["id"], "Name":nodeAttackGraph["name"], "Type":nodeAttackGraph["type"], "IP":nodeAttackGraph["ip_addresses"], "Visu": "lightgrey", "Opacity": 0.8, "Size": 10};

        if(nodeToAdd.Name == "internet_host"){
            nodeToAdd.IP = ["internet"];
        }
        attackGraphDatas.nodes.push(nodeToAdd);
    }

    // Matches our members with members of the links parameter
    for(i=0; i < sizeLinks; ++i){
        target = data.arcs.arc[i].dst;
        source = data.arcs.arc[i].src;

        var link = {source: source, target: target, label: data.arcs.arc[i].label, color: "lightgrey", width: 1.5};
        attackGraphDatas.links.push(link);
    }

    // Alert undefined at first iteration
    if(alert != undefined){

        var searchT = alert.targets;
        var searchS = alert.sources;
        var search = searchT.concat(searchS);
        var stockID = [];   // Tab with ID of red nodes
        var remediations = [];
        var tmpRemed = {};

        // Highlight nodes
        for(i=0; i < attackGraphDatas.nodes.length; ++i){
            for(y=0; y < attackGraphDatas.nodes[i].IP.length; ++y){
                tst(search, attacked);
            }
            if(attackGraphDatas.nodes[i].Visu == attacked){
                stockID.push(attackGraphDatas.nodes[i].ID);
            }
        }

        for(i=0; i < alert.dynamic_remediations.length; ++i){
            for(y=0; y < alert.dynamic_remediations[i].length; ++y){
                tmpRemed = alert.dynamic_remediations[i];
                remediations.push(tmpRemed);
            }
        }

        for(y=0; y < attackGraphDatas.links.length; ++y){
            for(var v=0; v < alert.CVEs.length; ++v){
                // Récupère les liens avec une CVE
                if(attackGraphDatas.links[y].label == alert.CVEs[v].CVE){

                    for(var w=0; w < stockID.length; ++w){
                        if(attackGraphDatas.links[y].source == stockID[w]){
                            for(var f=0; f < stockID.length; ++f){
                                if(attackGraphDatas.links[y].target == stockID[f]){
                                    attackGraphDatas.links[y].color = attacked;
                                    attackGraphDatas.links[y].width = lineWidth;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Function to highlight nodes attacked
    function tst(tab, color){
        var z;
        for(z=0; z < tab.length; ++z){
            if(attackGraphDatas.nodes[i].IP.indexOf(tab[z]) == 0){
                attackGraphDatas.nodes[i].Visu = color;
                attackGraphDatas.nodes[i].Size = size;
                attackGraphDatas.nodes[i].Opacity = opacity;
            }
        }

        for(z=0; z < tab.length; ++z){
            if(attackGraphDatas.nodes[i].Name.indexOf(tab[z]) == 0){
                attackGraphDatas.nodes[i].Visu = color;
                attackGraphDatas.nodes[i].Size = size;
                attackGraphDatas.nodes[i].Opacity = opacity;
            }
        }
    }

   return attackGraphDatas;
}


// **************************************************

/**
*   Topological Attack Graph Transformer
*   @param basicGraph
*   @param newGraph
*
*   Converts remediations from MulVAL in an appropriate (clean) format.
*   Browses the JSON object from server and built another more appropriate
*       to work.
*/

function transformRemediationSimulation(basicGraph, newGraph){

    for(var i=0; i < basicGraph.nodes.length; ++i){
        for(var y=0; y < newGraph.nodes.length; ++y){
            if(basicGraph.nodes[i].Fact == newGraph.nodes[y].Fact){
                basicGraph.nodes[i].Corrected = "none";
            }
        }
    }

    return basicGraph;
}

// **************************************************

/**
*   Time Transformer
*   @param time
*
*   Converts timestamp to a comprehensible date
*/

function transformTime(time){

    var res = "";

    // Convert millisecond to second
    var second = time / 1000;
    // Convert second to hour and keep the rest
    var hour = parseInt( second / 3600);
    second = second % 3600;
    // Convert second kept to minute
    var minute = parseInt( second / 60);
    second = second % 60;
    // Convert hour to day and keep the rest
    var day = parseInt( hour / 24);
    hour = hour % 24;
    // Convert day to year and keep the rest
    var year = parseInt( day / 365);
    day = day % 365;
    second = second.toFixed(0);
    
    if(year){
        res += year + " years, ";
    }
    if(day){
        res += day + " days, ";
    }
    if(hour){
        res += hour + " hours,";
    }
    if(minute){
        res += minute + " minutes, ";
    }
    if(second){
        res += second + " seconds";
    }

    return res;
}
